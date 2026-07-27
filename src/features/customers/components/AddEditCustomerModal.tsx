import React, { useState, useEffect } from 'react';
import { Customer, CreateCustomerPayload } from '../types/customer.types';
import { customerService } from '../services/customer-service';
import './AddEditCustomerModal.css';

interface AddEditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: Customer) => void;
  initialCustomer?: Customer | null;
}

export const AddEditCustomerModal: React.FC<AddEditCustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialCustomer,
}) => {
  const [formData, setFormData] = useState<CreateCustomerPayload>({
    name: '',
    phone: '',
    email: '',
    gender: 'Female',
    dob: '',
    anniversary: '',
    gstin: '',
    referralSource: '',
    medicalNotes: '',
    tags: [],
    householdNote: '',
  });

  const [showAdditional, setShowAdditional] = useState<boolean>(false);
  const [duplicateNotice, setDuplicateNotice] = useState<Customer | null>(null);
  const [tagInput, setTagInput] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialCustomer) {
      setFormData({
        name: initialCustomer.name || '',
        phone: initialCustomer.phone || '',
        email: initialCustomer.email || '',
        gender: initialCustomer.gender || 'Female',
        dob: initialCustomer.dob ? initialCustomer.dob.split('T')[0] : '',
        anniversary: initialCustomer.anniversary ? initialCustomer.anniversary.split('T')[0] : '',
        gstin: initialCustomer.gstin || '',
        referralSource: initialCustomer.referralSource || '',
        medicalNotes: initialCustomer.medicalNotes === 'RESTRICTED_MEDICAL_NOTE' ? '' : (initialCustomer.medicalNotes || ''),
        tags: initialCustomer.tags || [],
        householdNote: initialCustomer.householdNote || '',
      });
      setShowAdditional(!!(initialCustomer.dob || initialCustomer.gstin || initialCustomer.medicalNotes));
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        gender: 'Female',
        dob: '',
        anniversary: '',
        gstin: '',
        referralSource: '',
        medicalNotes: '',
        tags: [],
        householdNote: '',
      });
      setShowAdditional(false);
    }
    setDuplicateNotice(null);
    setErrorMessage(null);
  }, [initialCustomer, isOpen]);

  if (!isOpen) return null;

  const handlePhoneBlur = async () => {
    if (formData.phone && formData.phone.length === 10 && !initialCustomer) {
      try {
        const res = await customerService.checkDuplicate(formData.phone);
        if (res.isDuplicate) {
          setDuplicateNotice(res.existingCustomer);
        } else {
          setDuplicateNotice(null);
        }
      } catch (err) {
        // silent error for pre-check
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim().toUpperCase())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim().toUpperCase()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Frontend validations
    if (!formData.name || formData.name.trim().length < 2) {
      setErrorMessage('Full Name must be at least 2 characters.');
      return;
    }

    if (!formData.phone || !/^\d{10}$/.test(formData.phone.trim())) {
      setErrorMessage('Phone Number must be exactly 10 digits.');
      return;
    }

    if (!formData.gender) {
      setErrorMessage('Gender selection is required.');
      return;
    }

    try {
      setSubmitting(true);
      let result: Customer;
      if (initialCustomer) {
        result = await customerService.updateCustomer(initialCustomer.id, formData);
      } else {
        result = await customerService.createCustomer(formData);
      }
      onSuccess(result);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save customer profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cust-modal-backdrop">
      <div className="cust-modal">
        <div className="cust-modal__header">
          <div>
            <h3>{initialCustomer ? 'Edit Customer Profile' : 'Add New Customer'}</h3>
            <p className="cust-modal__subtitle">
              {initialCustomer ? 'Update customer details and preferences' : 'Quick register new client profile'}
            </p>
          </div>
          <button className="cust-modal__close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cust-modal__form">
          {errorMessage && <div className="cust-modal__alert cust-modal__alert--error">{errorMessage}</div>}

          {duplicateNotice && (
            <div className="cust-modal__alert cust-modal__alert--warning">
              <div className="cust-modal__warning-title">⚠️ Existing Profile Found</div>
              <p>
                A customer named <strong>{duplicateNotice.name}</strong> already exists with phone{' '}
                <strong>{duplicateNotice.phone}</strong>.
              </p>
              <div className="cust-modal__warning-actions">
                <button
                  type="button"
                  className="cust-btn cust-btn--sm cust-btn--secondary"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      householdNote: `Shared household phone with ${duplicateNotice.name} (ID: ${duplicateNotice.id})`,
                    }));
                    setDuplicateNotice(null);
                  }}
                >
                  Link as Household (Same Phone)
                </button>
              </div>
            </div>
          )}

          {/* CORE FIELDS */}
          <div className="cust-modal__section">
            <h4 className="cust-modal__section-title">Core Information</h4>
            <div className="cust-modal__grid">
              <div className="cust-field">
                <label>Full Name <span className="cust-required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="cust-field">
                <label>Phone Number (10-Digit) <span className="cust-required">*</span></label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  onBlur={handlePhoneBlur}
                  maxLength={10}
                  disabled={!!initialCustomer}
                  required
                />
              </div>

              <div className="cust-field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. customer@example.com"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="cust-field">
                <label>Gender <span className="cust-required">*</span></label>
                <select
                  value={formData.gender || 'Female'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* TAGS DROPDOWN SELECTOR */}
          <div className="cust-modal__section">
            <label className="cust-field__label">Customer Tags (Predefined System Tags)</label>
            <div className="cust-tag-input-row">
              <select
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !formData.tags?.includes(val)) {
                    setFormData((prev) => ({ ...prev, tags: [...(prev.tags || []), val] }));
                  }
                }}
              >
                <option value="">-- Select Tag to Assign --</option>
                <option value="VIP" disabled={formData.tags?.includes('VIP')}>VIP Customer</option>
                <option value="REGULAR" disabled={formData.tags?.includes('REGULAR')}>Regular Client</option>
                <option value="NEW" disabled={formData.tags?.includes('NEW')}>New Client</option>
                <option value="INACTIVE" disabled={formData.tags?.includes('INACTIVE')}>Inactive (&gt; 90 Days)</option>
                <option value="DIFFICULT" disabled={formData.tags?.includes('DIFFICULT')}>Special Care / Sensitive</option>
                <option value="BRIDAL" disabled={formData.tags?.includes('BRIDAL')}>Bridal Client</option>
                <option value="STUDENT" disabled={formData.tags?.includes('STUDENT')}>Student Discount Eligible</option>
                <option value="SENIOR_CITIZEN" disabled={formData.tags?.includes('SENIOR_CITIZEN')}>Senior Citizen Discount</option>
              </select>
            </div>
            <div className="cust-tags-cloud">
              {formData.tags?.map((t) => (
                <span key={t} className="cust-tag-chip">
                  🏷️ {t}
                  <button type="button" onClick={() => handleRemoveTag(t)}>
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* PROGRESSIVE DISCLOSURE EXPANDER */}
          <div className="cust-expander">
            <button
              type="button"
              className="cust-expander__toggle"
              onClick={() => setShowAdditional(!showAdditional)}
            >
              <span>{showAdditional ? '▲ Hide' : '▼ Show'} Additional Details (GSTIN, DOB, Medical Notes)</span>
            </button>

            {showAdditional && (
              <div className="cust-expander__content">
                <div className="cust-modal__grid">
                  <div className="cust-field">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dob || ''}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    />
                  </div>

                  <div className="cust-field">
                    <label>Anniversary Date</label>
                    <input
                      type="date"
                      value={formData.anniversary || ''}
                      onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
                    />
                  </div>

                  <div className="cust-field">
                    <label>GSTIN (15-Char Alphanumeric)</label>
                    <input
                      type="text"
                      placeholder="e.g. 07AAAAA0000A1Z5"
                      value={formData.gstin || ''}
                      maxLength={15}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div className="cust-field">
                    <label>Referral Source</label>
                    <input
                      type="text"
                      placeholder="e.g. Instagram / Friend Referral"
                      value={formData.referralSource || ''}
                      onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                    />
                  </div>

                  <div className="cust-field cust-field--full">
                    <label>Medical / Allergy Warning Notes (Restricted Staff Access)</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Sensitive scalp, allergy to ammonia hair dye, skin patch test required..."
                      value={formData.medicalNotes || ''}
                      onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                    />
                  </div>

                  {formData.householdNote && (
                    <div className="cust-field cust-field--full">
                      <label>Household Note</label>
                      <input type="text" value={formData.householdNote} readOnly />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="cust-modal__footer">
            <button type="button" className="cust-btn cust-btn--outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="cust-btn cust-btn--primary" disabled={submitting}>
              {submitting ? 'Saving...' : initialCustomer ? 'Update Profile' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
