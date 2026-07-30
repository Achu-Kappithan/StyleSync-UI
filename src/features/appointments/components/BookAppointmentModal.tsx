import React, { useState, useEffect, useCallback } from 'react';
import { CreateAppointmentPayload } from '../types/appointment.types';
import { employeeService } from '../../employees/services/employee-service';
import { serviceCatalogService } from '../../services/services/service-catalog-service';
import { customerService } from '../../customers/services/customer-service';
import { Employee } from '../../employees/types/employee.types';
import { ServiceItem } from '../../services/types/service.types';
import { Customer } from '../../customers/types/customer.types';
import './BookAppointmentModal.css';

interface Props {
  selectedDate: string;
  onBook: (payload: CreateAppointmentPayload) => Promise<void>;
  onClose: () => void;
  prefillTime?: string; // 'HH:MM'
}

type Step = 1 | 2 | 3;

const WALK_IN_TIMES: string[] = Array.from({ length: 26 }, (_, i) => {
  const totalMin = 8 * 60 + i * 30; // Start at 8:00 AM, every 30 min
  const h = Math.floor(totalMin / 60).toString().padStart(2, '0');
  const m = (totalMin % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
});

const getInitials = (name: string): string => {
  if (!name) return 'C';
  const parts = name.trim().split(' ');
  return (parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2)).toUpperCase();
};

export const BookAppointmentModal: React.FC<Props> = ({ selectedDate, onBook, onClose, prefillTime }) => {
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Data ──────────────────────────────────────────────────────────────
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // ─── Customer Search & Selection State ─────────────────────────────────
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerId, setCustomerId] = useState<string | undefined>(undefined);
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);
  const [lookupStatus, setLookupStatus] = useState<'IDLE' | 'SEARCHING' | 'FOUND' | 'NOT_FOUND'>('IDLE');

  // Inline Client Registration Form State
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientGender, setNewClientGender] = useState('Female');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [creatingClient, setCreatingClient] = useState(false);
  const [clientCreateSuccess, setClientCreateSuccess] = useState<string | null>(null);

  // ─── Form state ────────────────────────────────────────────────────────
  const [bookingType, setBookingType] = useState<'ADVANCE' | 'WALK_IN'>('ADVANCE');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState(selectedDate);
  const [appointmentTime, setAppointmentTime] = useState(prefillTime ?? '10:00');
  const [notes, setNotes] = useState('');

  // ─── Load data on mount (Crash-Proof) ───────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      employeeService.getEmployees({ status: 'active', limit: 100 }).catch(() => ({ items: [] })),
      serviceCatalogService.getServices().catch(() => []),
    ])
      .then(([empRes, svcRes]) => {
        if (!isMounted) return;
        const empItems = Array.isArray(empRes) ? empRes : (empRes?.items || []);
        setEmployees(empItems);

        // Deduplicate services by name to guarantee unique service cards in UI
        const uniqueSvcs: ServiceItem[] = [];
        const seen = new Set<string>();
        if (Array.isArray(svcRes)) {
          for (const s of svcRes) {
            const key = s?.name ? s.name.toLowerCase().trim() : '';
            if (key && !seen.has(key)) {
              seen.add(key);
              uniqueSvcs.push(s);
            }
          }
        }
        setServices(uniqueSvcs);
      })
      .catch(() => {
        if (isMounted) setError('Failed to load employees / services');
      })
      .finally(() => {
        if (isMounted) setLoadingData(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // ─── Debounced & Manual Phone Search Handler ─────────────────────────────
  const handleSearchClient = useCallback(async (phoneToSearch?: string) => {
    const cleanPhone = (phoneToSearch ?? customerPhone).replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number (e.g. 9876543210)');
      return;
    }

    setError(null);
    setLookupStatus('SEARCHING');
    setShowAddClientForm(false);
    setClientCreateSuccess(null);

    try {
      const res = await customerService.checkDuplicate(cleanPhone);
      if (res.isDuplicate && res.existingCustomer) {
        setLookupStatus('FOUND');
        setExistingCustomer(res.existingCustomer);
        setCustomerName(res.existingCustomer.name);
        setCustomerId(res.existingCustomer._id || (res.existingCustomer as any).id);
      } else {
        setLookupStatus('NOT_FOUND');
        setExistingCustomer(null);
        setCustomerId(undefined);
        setCustomerName('');
      }
    } catch {
      setError('Failed to search customer database');
      setLookupStatus('IDLE');
    }
  }, [customerPhone]);

  // ─── Debounced Search Effect (400ms delay when 10 digits are typed) ──────
  useEffect(() => {
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setLookupStatus('IDLE');
      setExistingCustomer(null);
      setCustomerId(undefined);
      setShowAddClientForm(false);
      setClientCreateSuccess(null);
      return;
    }

    const timer = setTimeout(() => {
      handleSearchClient(cleanPhone);
    }, 400);

    return () => clearTimeout(timer);
  }, [customerPhone, handleSearchClient]);

  // ─── Create New Customer Handler ─────────────────────────────────────────
  const handleCreateCustomer = async () => {
    if (!newClientName.trim()) {
      setError('Please enter the client full name');
      return;
    }
    setError(null);
    setCreatingClient(true);
    try {
      const newCust = await customerService.createCustomer({
        name: newClientName.trim(),
        phone: customerPhone.trim(),
        gender: newClientGender,
        email: newClientEmail.trim() || undefined,
        tags: ['NEW'],
      });

      setExistingCustomer(newCust);
      setCustomerName(newCust.name);
      setCustomerId(newCust._id || (newCust as any).id);
      setLookupStatus('FOUND');
      setShowAddClientForm(false);
      setClientCreateSuccess(`✓ Client "${newCust.name}" registered successfully! You can now proceed.`);
    } catch (e: any) {
      setError(e.message ?? 'Failed to register new client');
    } finally {
      setCreatingClient(false);
    }
  };

  // ─── Derived: total duration & amount ─────────────────────────────────
  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id ?? (s as any)._id));
  const totalMinutes = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0) + (selectedServices.length > 0 ? 5 : 0);
  const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0);

  // ─── Toggle service selection ──────────────────────────────────────────
  const toggleService = (sid: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(sid) ? prev.filter((id) => id !== sid) : [...prev, sid],
    );
  };

  // ─── Validate per step ────────────────────────────────────────────────
  const validateStep1 = () => {
    if (!/^\d{10}$/.test(customerPhone.trim())) return 'Please enter a 10-digit mobile phone number and click Search';
    if (lookupStatus !== 'FOUND' || !existingCustomer || !customerId) {
      return 'Client is not verified. Please search for an existing client or register a new client first.';
    }
    if (!customerName.trim()) return 'Customer name is required';
    return null;
  };

  const validateStep2 = () => {
    if (selectedServiceIds.length === 0) return 'Select at least one service';
    return null;
  };

  const validateStep3 = () => {
    if (!appointmentDate) return 'Date is required';
    if (!appointmentTime) return 'Time is required';
    return null;
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) { setError(err); return; }
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    const err = validateStep3();
    if (err) { setError(err); return; }

    setSubmitting(true);
    setError(null);
    try {
      const scheduledAt = new Date(`${appointmentDate}T${appointmentTime}:00`).toISOString();
      const payload: CreateAppointmentPayload = {
        customerId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        serviceIds: selectedServiceIds,
        scheduledAt,
        bookingType,
        notes: notes.trim() || undefined,
      };
      if (selectedEmployeeId) payload.employeeId = selectedEmployeeId;
      await onBook(payload);
    } catch (e: any) {
      setError(e.message ?? 'Failed to book appointment');
      setSubmitting(false);
    }
  };

  const formatDuration = (min: number) => {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <div className="bam-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bam-modal" role="dialog" aria-modal="true" aria-label="Book Appointment">
        {/* Header */}
        <div className="bam-header">
          <div>
            <div className="bam-header__title">📅 Book Appointment</div>
            <div className="bam-step-indicator">
              {([1, 2, 3] as Step[]).map((s) => (
                <div key={s} className={`bam-step ${step === s ? 'bam-step--active' : step > s ? 'bam-step--done' : ''}`}>
                  <div className="bam-step__dot">{step > s ? '✓' : s}</div>
                  <span>{s === 1 ? 'Verify Client' : s === 2 ? 'Services' : 'Schedule'}</span>
                </div>
              ))}
            </div>
          </div>
          <button id="bam-close" className="bam-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div className="bam-body">
          {loadingData ? (
            <div className="bam-loading">
              <div className="apt-spinner" />
              <p>Loading catalogue & employees…</p>
            </div>
          ) : (
            <>
              {/* STEP 1: Verify Client Availability & Registration */}
              {step === 1 && (
                <div className="bam-step-content">
                  <h3 className="bam-section-title">Step 1: Search & Verify Client</h3>

                  {/* Booking type toggle */}
                  <div className="bam-type-toggle">
                    <button
                      id="bam-type-advance"
                      className={`bam-type-btn ${bookingType === 'ADVANCE' ? 'bam-type-btn--active' : ''}`}
                      onClick={() => setBookingType('ADVANCE')}
                      type="button"
                    >
                      📆 Advance Booking
                    </button>
                    <button
                      id="bam-type-walkin"
                      className={`bam-type-btn ${bookingType === 'WALK_IN' ? 'bam-type-btn--active' : ''}`}
                      onClick={() => setBookingType('WALK_IN')}
                      type="button"
                    >
                      🚶 Walk-in Queue
                    </button>
                  </div>

                  {/* Structured Search Box Group */}
                  <div className="bam-search-box-card">
                    <label className="bam-search-label" htmlFor="bam-customer-phone">
                      📱 Customer Phone Number *
                    </label>

                    <div className="bam-search-input-group">
                      <div className="bam-search-field-wrapper">
                        <span className="bam-search-icon">📞</span>
                        <input
                          id="bam-customer-phone"
                          type="tel"
                          className="bam-search-input"
                          placeholder="Enter 10-digit phone number (e.g. 9876543210)"
                          maxLength={10}
                          value={customerPhone}
                          onChange={(e) => {
                            setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                            if (lookupStatus !== 'IDLE') {
                              setLookupStatus('IDLE');
                              setExistingCustomer(null);
                              setCustomerId(undefined);
                              setShowAddClientForm(false);
                              setClientCreateSuccess(null);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSearchClient();
                            }
                          }}
                          autoFocus
                        />
                      </div>

                      <button
                        id="bam-search-btn"
                        className="bam-search-submit-btn"
                        onClick={() => handleSearchClient()}
                        disabled={lookupStatus === 'SEARCHING' || customerPhone.length !== 10}
                        type="button"
                      >
                        {lookupStatus === 'SEARCHING' ? '⏳ Searching…' : '🔍 Search Client'}
                      </button>
                    </div>

                    <p className="bam-search-hint">
                      Enter 10-digit number and click <strong>Search Client</strong> (or press Enter)
                    </p>
                  </div>

                  {/* Success Banner */}
                  {clientCreateSuccess && (
                    <div className="bam-success-toast">
                      {clientCreateSuccess}
                    </div>
                  )}

                  {/* CASE A: CLIENT FOUND (Structured Profile Card) */}
                  {lookupStatus === 'FOUND' && existingCustomer && (
                    <div className="bam-client-card bam-client-card--found">
                      <div className="bam-client-avatar">
                        {getInitials(existingCustomer.name)}
                      </div>
                      <div className="bam-client-details">
                        <div className="bam-client-name-row">
                          <strong className="bam-client-name">{existingCustomer.name}</strong>
                          <span className="bam-status-pill bam-status-pill--verified">✓ Verified Client</span>
                        </div>
                        <div className="bam-client-phone-sub">📞 +91 {existingCustomer.phone}</div>
                        <div className="bam-client-stats-pills">
                          {existingCustomer.tags?.map((t) => (
                            <span key={t} className="bam-tag-pill">{t}</span>
                          ))}
                          <span className="bam-tag-pill bam-tag-pill--stat">
                            📊 {existingCustomer.totalVisits || 0} Visits
                          </span>
                          <span className="bam-tag-pill bam-tag-pill--stat">
                            💰 ₹{(existingCustomer.lifetimeValue || 0).toLocaleString('en-IN')} LTV
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CASE B: CLIENT NOT FOUND (Structured Alert Card) */}
                  {lookupStatus === 'NOT_FOUND' && customerPhone.length === 10 && !showAddClientForm && (
                    <div className="bam-client-card bam-client-card--notfound">
                      <div className="bam-notfound-icon">⚠️</div>
                      <div className="bam-notfound-body">
                        <h4>Client Not Found</h4>
                        <p>
                          No registered customer found for phone number <strong>+91 {customerPhone}</strong>. You must register this client before proceeding.
                        </p>
                        <button
                          id="bam-add-client-trigger"
                          className="bam-btn-register-primary"
                          onClick={() => {
                            setNewClientName('');
                            setNewClientEmail('');
                            setShowAddClientForm(true);
                          }}
                          type="button"
                        >
                          + Register New Client
                        </button>
                      </div>
                    </div>
                  )}

                  {/* INLINE NEW CLIENT REGISTRATION FORM CARD */}
                  {showAddClientForm && (
                    <div className="bam-inline-client-form">
                      <div className="bam-form-header">
                        <div className="bam-form-title-group">
                          <h4>✨ Register New Client</h4>
                          <span className="bam-form-phone-badge">📱 +91 {customerPhone}</span>
                        </div>
                        <button
                          className="bam-btn-cancel-inline"
                          onClick={() => setShowAddClientForm(false)}
                          type="button"
                        >
                          ✕ Cancel
                        </button>
                      </div>

                      <div className="bam-field">
                        <label htmlFor="bam-new-name">Full Name *</label>
                        <div className="bam-reg-field-wrapper">
                          <span className="bam-reg-field-icon">👤</span>
                          <input
                            id="bam-new-name"
                            type="text"
                            className="bam-input bam-reg-input"
                            placeholder="e.g. Ananya Roy"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="bam-field">
                        <label>Gender *</label>
                        <div className="bam-gender-pills">
                          {['Female', 'Male', 'Other'].map((g) => (
                            <button
                              key={g}
                              type="button"
                              className={`bam-gender-pill ${newClientGender === g ? 'bam-gender-pill--active' : ''}`}
                              onClick={() => setNewClientGender(g)}
                            >
                              {g === 'Female' ? '👩 Female' : g === 'Male' ? '👨 Male' : '✨ Other'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bam-field">
                        <label htmlFor="bam-new-email">Email Address (optional)</label>
                        <div className="bam-reg-field-wrapper">
                          <span className="bam-reg-field-icon">✉️</span>
                          <input
                            id="bam-new-email"
                            type="email"
                            className="bam-input bam-reg-input"
                            placeholder="client@email.com"
                            value={newClientEmail}
                            onChange={(e) => setNewClientEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <button
                        id="bam-save-client-btn"
                        className="bam-btn-save-client"
                        onClick={handleCreateCustomer}
                        disabled={creatingClient}
                        type="button"
                      >
                        {creatingClient ? '⏳ Registering Client…' : '✓ Save & Select Client'}
                      </button>
                    </div>
                  )}

                  {/* Structured Booking Notes Card */}
                  {lookupStatus === 'FOUND' && (
                    <div className="bam-notes-card">
                      <div className="bam-notes-header">
                        <label htmlFor="bam-notes" className="bam-notes-label">
                          📝 Booking Notes & Client Preferences <span className="bam-optional-tag">(Optional)</span>
                        </label>
                        <span className="bam-notes-count">{notes.length}/500</span>
                      </div>

                      <textarea
                        id="bam-notes"
                        className="bam-notes-textarea"
                        placeholder="Add special instructions, product preferences, or client allergies..."
                        rows={3}
                        maxLength={500}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />

                      {/* Quick Suggestion Chips */}
                      <div className="bam-notes-chips-container">
                        <span className="bam-chips-title">Quick Add:</span>
                        <div className="bam-notes-chips">
                          {[
                            "✨ L'Oreal Products",
                            '⚠️ Ammonia Allergy',
                            '🤫 Silent Appointment',
                            '☕ Green Tea Requested',
                            '⚡ Express Service',
                          ].map((chip) => (
                            <button
                              key={chip}
                              type="button"
                              className="bam-notes-chip"
                              onClick={() => {
                                const cleanText = chip.replace(/^[^\s]+\s/, '');
                                if (!notes.includes(cleanText)) {
                                  setNotes((prev) => (prev ? `${prev}, ${cleanText}` : cleanText));
                                }
                              }}
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Services */}
              {step === 2 && (
                <div className="bam-step-content">
                  <h3 className="bam-section-title">Step 2: Select Services for {customerName}</h3>

                  <div className="bam-services-grid">
                    {services.map((svc) => {
                      const sid = svc.id ?? (svc as any)._id;
                      const isSelected = selectedServiceIds.includes(sid);
                      return (
                        <button
                          key={sid}
                          id={`bam-svc-${sid}`}
                          className={`bam-service-card ${isSelected ? 'bam-service-card--selected' : ''}`}
                          onClick={() => toggleService(sid)}
                          type="button"
                        >
                          <div className="bam-service-card__name">{svc.name}</div>
                          <div className="bam-service-card__meta">
                            <span className="bam-service-card__cat">{svc.categoryName}</span>
                            <span className="bam-service-card__price">₹{svc.price.toLocaleString('en-IN')}</span>
                            <span className="bam-service-card__dur">{svc.durationMinutes} min</span>
                          </div>
                          {isSelected && <div className="bam-service-card__check">✓</div>}
                        </button>
                      );
                    })}
                  </div>

                  {selectedServices.length > 0 && (
                    <div className="bam-selection-summary">
                      <span>🎯 {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected</span>
                      <span>⏱ {formatDuration(totalMinutes)} (incl. 5 min cleanup)</span>
                      <span className="bam-summary-amount">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Schedule */}
              {step === 3 && (
                <div className="bam-step-content">
                  <h3 className="bam-section-title">Step 3: Schedule & Stylist</h3>

                  <div className="bam-row">
                    <div className="bam-field">
                      <label htmlFor="bam-date">Date *</label>
                      <input
                        id="bam-date"
                        type="date"
                        className="bam-input"
                        value={appointmentDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                      />
                    </div>

                    <div className="bam-field">
                      <label htmlFor="bam-time">Time *</label>
                      <select
                        id="bam-time"
                        className="bam-input bam-select"
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                      >
                        {WALK_IN_TIMES.map((t) => {
                          const [h, m] = t.split(':').map(Number);
                          const suffix = h >= 12 ? 'PM' : 'AM';
                          const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
                          return (
                            <option key={t} value={t}>
                              {`${h12}:${m.toString().padStart(2, '0')} ${suffix}`}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <div className="bam-field">
                    <label htmlFor="bam-employee">Stylist (optional — auto-assigned if empty)</label>
                    <select
                      id="bam-employee"
                      className="bam-input bam-select"
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    >
                      <option value="">Auto-assign best available stylist</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName} — {emp.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Booking Summary */}
                  <div className="bam-summary-card">
                    <div className="bam-summary-card__title">Booking Summary</div>
                    <div className="bam-summary-row">
                      <span>Customer</span>
                      <span>{customerName} · {customerPhone} (Verified Client)</span>
                    </div>
                    <div className="bam-summary-row">
                      <span>Services</span>
                      <span>{selectedServices.map((s) => s.name).join(', ')}</span>
                    </div>
                    <div className="bam-summary-row">
                      <span>Duration</span>
                      <span>{formatDuration(totalMinutes)}</span>
                    </div>
                    <div className="bam-summary-row">
                      <span>Date & Time</span>
                      <span>{appointmentDate} at {appointmentTime}</span>
                    </div>
                    <div className="bam-summary-row bam-summary-row--total">
                      <span>Total Amount</span>
                      <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bam-summary-row">
                      <span>Type</span>
                      <span>{bookingType === 'WALK_IN' ? '🚶 Walk-in' : '📆 Advance'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && <div className="bam-error">{error}</div>}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bam-footer">
          {step > 1 && (
            <button
              id="bam-back"
              className="bam-footer-btn bam-footer-btn--ghost"
              onClick={() => setStep((s) => (s - 1) as Step)}
              disabled={submitting}
              type="button"
            >
              ← Back
            </button>
          )}
          <button
            id="bam-cancel-btn"
            className="bam-footer-btn bam-footer-btn--ghost"
            onClick={onClose}
            disabled={submitting}
            type="button"
          >
            Cancel
          </button>
          {step < 3 ? (
            <button
              id="bam-next"
              className="bam-footer-btn bam-footer-btn--primary"
              onClick={handleNext}
              disabled={loadingData || (step === 1 && lookupStatus !== 'FOUND')}
              type="button"
              title={step === 1 && lookupStatus !== 'FOUND' ? 'You must search and verify a client before proceeding' : ''}
            >
              Next →
            </button>
          ) : (
            <button
              id="bam-submit"
              className="bam-footer-btn bam-footer-btn--primary"
              onClick={handleSubmit}
              disabled={submitting}
              type="button"
            >
              {submitting ? '⏳ Booking…' : '✓ Confirm Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
