import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem, PaymentEntry } from '../types/billing.types';
import { Employee } from '../../employees/types/employee.types';
import { customerService } from '../../customers/services/customer-service';
import { Customer } from '../../customers/types/customer.types';
import './CheckoutModal.css';

interface CheckoutModalProps {
  cart: CartItem[];
  cartSummary: {
    subtotalInclusive: number;
    subtotalBase: number;
    taxTotal: number;
    discountAmount: number;
    grandTotal: number;
  };
  employees: Employee[];
  onConfirm: (data: {
    customerId?: string;
    customerName: string;
    customerPhone: string;
    employeeId?: string;
    payments: PaymentEntry[];
  }) => Promise<void>;
  onClose: () => void;
  submitting: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  cart,
  cartSummary,
  employees,
  onClose,
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);

  // ─── Step 1: Customer State ───────────────────────────────────────────────
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // New Customer Form state & instant errors
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGender, setNewGender] = useState('FEMALE');
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string; gender?: string }>({});

  // Live Field Validation Utilities
  const validateNameField = (val: string) => {
    const clean = val.trim();
    if (!clean) return 'Customer Name is required';
    if (clean.length < 2) return 'Name must be at least 2 letters';
    return undefined;
  };

  const validatePhoneField = (val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) return '10-digit Phone Number is required';
    if (clean.length < 10) return `Phone number is incomplete (${clean.length}/10 digits)`;
    if (!/^[6-9]\d{9}$/.test(clean)) return 'Phone number must start with 6, 7, 8, or 9';
    return undefined;
  };

  // ─── Step 2: Stylist State ────────────────────────────────────────────────
  const [itemStylists, setItemStylists] = useState<Record<string, string>>({});
  const [globalStylistId, setGlobalStylistId] = useState<string>('');

  // Search Customers Effect
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerSearch.trim() || customerSearch.length < 2) {
      setCustomerResults([]);
      setSearchError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingCustomer(true);
      setSearchError(null);
      try {
        const res = await customerService.getCustomers({ search: customerSearch.trim(), limit: 10 });
        setCustomerResults(res.items || []);
      } catch (err: any) {
        setCustomerResults([]);
        setSearchError(
          err.message?.includes('Failed to fetch') || err.message?.includes('REFUSED')
            ? 'Backend API server (http://localhost:3000) is offline or unreachable.'
            : err.message || 'Error searching customers',
        );
      } finally {
        setSearchingCustomer(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearch]);

  // Handle New Customer Registration
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newName.trim();
    const cleanPhone = newPhone.replace(/\D/g, '');

    const nameErr = validateNameField(cleanName);
    const phoneErr = validatePhoneField(cleanPhone);
    const genderErr = !newGender ? 'Gender selection is required' : undefined;

    if (nameErr || phoneErr || genderErr) {
      setFormErrors({ name: nameErr, phone: phoneErr, gender: genderErr });
      return;
    }

    setFormErrors({});
    setCreatingCustomer(true);
    try {
      const created = await customerService.createCustomer({
        name: cleanName,
        phone: cleanPhone,
        gender: newGender,
        tags: ['NEW'],
      });
      setSelectedCustomer(created);
      setIsAddingNewCustomer(false);
      setNewName('');
      setNewPhone('');
      setNewGender('FEMALE');
      setFormErrors({});
    } catch (err: any) {
      const msg = err.message?.includes('Failed to fetch')
        ? 'Cannot connect to backend API server (http://localhost:3000).'
        : err.message || 'Failed to create customer';
      alert(msg);
    } finally {
      setCreatingCustomer(false);
    }
  };

  // Open New Customer Form with intelligent phone/name autofill
  const handleOpenNewCustomerForm = (searchVal: string = customerSearch) => {
    const raw = searchVal.trim();
    const digitsOnly = raw.replace(/\D/g, '');

    if (digitsOnly.length > 0) {
      const phoneDigits = digitsOnly.slice(0, 10);
      setNewPhone(phoneDigits);
      const phoneErr = validatePhoneField(phoneDigits);
      setFormErrors((prev) => ({ ...prev, phone: phoneErr }));
    } else {
      setNewPhone('');
      setFormErrors((prev) => ({ ...prev, phone: undefined }));
    }

    if (raw && !/^\d+$/.test(raw)) {
      setNewName(raw);
      const nameErr = validateNameField(raw);
      setFormErrors((prev) => ({ ...prev, name: nameErr }));
    } else {
      setNewName('');
      setFormErrors((prev) => ({ ...prev, name: undefined }));
    }

    setIsAddingNewCustomer(true);
  };

  // ─── Stylist Validation ──────────────────────────────────────────────────
  const allStylistsAssigned = useMemo(() => {
    if (globalStylistId) return true;
    return cart.every((item) => Boolean(itemStylists[item.serviceId]));
  }, [cart, itemStylists, globalStylistId]);

  // ─── Proceed to Standalone Checkout Page ──────────────────────────────────
  const handleProceedToFinalCheckout = () => {
    if (!selectedCustomer) {
      alert('Please select or register a customer');
      setStep(1);
      return;
    }
    if (!allStylistsAssigned) {
      alert('Please assign a stylist for each service');
      return;
    }

    const currentOrigin = window.location.pathname.includes('appointment')
      ? '/dashboard/appointments'
      : '/dashboard/billing';

    localStorage.setItem('stylesync_checkout_cart', JSON.stringify(cart));
    localStorage.setItem('stylesync_checkout_customer', JSON.stringify(selectedCustomer));
    localStorage.setItem('stylesync_item_stylists', JSON.stringify(itemStylists));
    localStorage.setItem('stylesync_return_url', currentOrigin);
    onClose();
    navigate('/checkout', { state: { returnUrl: currentOrigin } });
  };

  return (
    <div className="chk-modal-overlay">
      <div className="chk-modal">
        {/* Modal Header */}
        <div className="chk-modal__header">
          <div>
            <h3>🛍️ POS Checkout Assistant</h3>
            <p>Select Customer & Assign Stylists for ₹{cartSummary.grandTotal.toLocaleString('en-IN')}</p>
          </div>
          <button className="chk-modal__close" onClick={onClose}>✕</button>
        </div>

        {/* Step Indicator Bar */}
        <div className="chk-steps">
          <div className={`chk-step ${step === 1 ? 'chk-step--active' : 'chk-step--done'}`}>
            <span className="chk-step__num">1</span>
            <span className="chk-step__label">Select Customer</span>
          </div>
          <div className="chk-step__line" />
          <div className={`chk-step ${step === 2 ? 'chk-step--active' : ''}`}>
            <span className="chk-step__num">2</span>
            <span className="chk-step__label">Assign Stylists</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="chk-modal__body">
          {/* ──────── STEP 1: CUSTOMER SELECTION / CREATION ──────── */}
          {step === 1 && (
            <div className="chk-step-content">
              <h4>Step 1: Select or Register Customer</h4>

              {selectedCustomer ? (
                <div className="chk-customer-card">
                  <div className="chk-customer-card__info">
                    <span className="chk-customer-card__avatar">👤</span>
                    <div>
                      <strong>{selectedCustomer.name}</strong>
                      <p>📞 {selectedCustomer.phone} {selectedCustomer.gender ? `• ${selectedCustomer.gender}` : ''}</p>
                    </div>
                  </div>
                  <button
                    className="chk-btn-text"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    Change Customer
                  </button>
                </div>
              ) : isAddingNewCustomer ? (
                <form onSubmit={handleCreateCustomer} className="chk-new-cust-form">
                  <h5>+ Add New Client</h5>
                  <div className="chk-form-row">
                    <div>
                      <input
                        type="text"
                        className={`chk-input ${formErrors.name ? 'chk-input--invalid' : ''}`}
                        placeholder="Customer Name *"
                        value={newName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewName(val);
                          setFormErrors((prev) => ({ ...prev, name: validateNameField(val) }));
                        }}
                        onBlur={(e) => {
                          setFormErrors((prev) => ({ ...prev, name: validateNameField(e.target.value) }));
                        }}
                      />
                      {formErrors.name && <small className="chk-field-error">⚠️ {formErrors.name}</small>}
                    </div>

                    <div>
                      <input
                        type="tel"
                        maxLength={10}
                        className={`chk-input ${formErrors.phone ? 'chk-input--invalid' : ''}`}
                        placeholder="10-digit Phone Number *"
                        value={newPhone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setNewPhone(val);
                          setFormErrors((prev) => ({ ...prev, phone: validatePhoneField(val) }));
                        }}
                        onBlur={(e) => {
                          setFormErrors((prev) => ({ ...prev, phone: validatePhoneField(e.target.value) }));
                        }}
                      />
                      {formErrors.phone && <small className="chk-field-error">⚠️ {formErrors.phone}</small>}
                    </div>

                    <div>
                      <select
                        className={`chk-select ${formErrors.gender ? 'chk-select--invalid' : ''}`}
                        value={newGender}
                        onChange={(e) => {
                          setNewGender(e.target.value);
                          if (formErrors.gender) setFormErrors((prev) => ({ ...prev, gender: undefined }));
                        }}
                      >
                        <option value="FEMALE">👩 Female</option>
                        <option value="MALE">👨 Male</option>
                        <option value="OTHER">🧑 Other</option>
                      </select>
                      {formErrors.gender && <small className="chk-field-error">⚠️ {formErrors.gender}</small>}
                    </div>
                  </div>
                  <div className="chk-form-actions">
                    <button
                      type="button"
                      className="chk-btn-sec"
                      onClick={() => setIsAddingNewCustomer(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="chk-btn-pri"
                      disabled={creatingCustomer}
                    >
                      {creatingCustomer ? 'Saving...' : 'Save & Select Client'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="chk-search-box">
                  <div className="chk-search-header">
                    <input
                      type="text"
                      className="chk-input chk-input--search"
                      placeholder="🔍 Search customer by name or phone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="chk-btn-add-cust"
                      onClick={() => handleOpenNewCustomerForm(customerSearch)}
                    >
                      + Add New
                    </button>
                  </div>

                  {searchingCustomer && <div className="chk-loading-text">Searching customers...</div>}
                  {searchError && <div className="chk-alert">⚠️ {searchError}</div>}

                  {!searchingCustomer && customerSearch.length >= 2 && customerResults.length === 0 && (
                    <div className="chk-no-cust">
                      <p>No customer found matching "{customerSearch}"</p>
                      <button
                        type="button"
                        className="chk-btn-pri"
                        onClick={() => handleOpenNewCustomerForm(customerSearch)}
                      >
                        + Register "{customerSearch}" as New Client
                      </button>
                    </div>
                  )}

                  {customerResults.length > 0 && (
                    <div className="chk-cust-list">
                      {customerResults.map((cust) => (
                        <div
                          key={cust.id || cust._id}
                          className="chk-cust-item"
                          onClick={() => setSelectedCustomer(cust)}
                        >
                          <div>
                            <strong>{cust.name}</strong>
                            <span>📞 {cust.phone}</span>
                          </div>
                          <button className="chk-btn-select">Select</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="chk-footer">
                <button className="chk-btn-sec" onClick={onClose}>Cancel</button>
                <button
                  className="chk-btn-pri"
                  disabled={!selectedCustomer}
                  onClick={() => setStep(2)}
                >
                  Next: Select Stylists ➔
                </button>
              </div>
            </div>
          )}

          {/* ──────── STEP 2: STYLIST ALLOCATION & VALIDATION ──────── */}
          {step === 2 && (
            <div className="chk-step-content">
              <h4>Step 2: Assign Stylist for Services</h4>

              <div className="chk-global-stylist">
                <label>Assign Same Stylist for All Services:</label>
                <select
                  className="chk-select"
                  value={globalStylistId}
                  onChange={(e) => {
                    setGlobalStylistId(e.target.value);
                    if (e.target.value) {
                      const updated: Record<string, string> = {};
                      cart.forEach((i) => (updated[i.serviceId] = e.target.value));
                      setItemStylists(updated);
                    }
                  }}
                >
                  <option value="">-- Assign Per Service Individually --</option>
                  {employees.map((emp) => (
                    <option key={emp.id || emp._id} value={emp.id || emp._id}>
                      👤 {emp.fullName} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="chk-stylist-items">
                {cart.map((item) => (
                  <div key={item.serviceId} className="chk-stylist-item">
                    <div>
                      <strong>{item.name}</strong>
                      <div className="chk-stylist-item__sub">Qty: {item.quantity} | Total: ₹{(item.priceInclusive * item.quantity).toLocaleString('en-IN')}</div>
                    </div>

                    <select
                      className={`chk-select ${!itemStylists[item.serviceId] ? 'chk-select--invalid' : ''}`}
                      value={itemStylists[item.serviceId] || ''}
                      onChange={(e) => {
                        setItemStylists((prev) => ({ ...prev, [item.serviceId]: e.target.value }));
                        setGlobalStylistId('');
                      }}
                    >
                      <option value="">-- Select Stylist * --</option>
                      {employees.map((emp) => (
                        <option key={emp.id || emp._id} value={emp.id || emp._id}>
                          👤 {emp.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {!allStylistsAssigned && (
                <div className="chk-alert">
                  ⚠️ Please select a stylist for each service item before proceeding.
                </div>
              )}

              <div className="chk-footer">
                <button className="chk-btn-sec" onClick={() => setStep(1)}>‹ Back</button>
                <button
                  className="chk-btn-pri"
                  disabled={!allStylistsAssigned}
                  onClick={handleProceedToFinalCheckout}
                >
                  Proceed to Standalone Checkout ➔
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
