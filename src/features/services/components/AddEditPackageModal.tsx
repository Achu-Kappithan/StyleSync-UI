import React, { useState } from 'react';
import { ServiceItem, PackageServiceItem, CreatePackagePayload } from '../types/service.types';
import './AddEditPackageModal.css';

interface AddEditPackageModalProps {
  isOpen: boolean;
  services: ServiceItem[];
  onClose: () => void;
  onSuccess: (payload: CreatePackagePayload) => Promise<void>;
}

export const AddEditPackageModal: React.FC<AddEditPackageModalProps> = ({
  isOpen,
  services,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [totalPrice, setTotalPrice] = useState<number | ''>(2500);
  const [validityDays, setValidityDays] = useState<number | ''>(90);
  const [items, setItems] = useState<PackageServiceItem[]>([]);

  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [sessionCount, setSessionCount] = useState<number>(3);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddServiceItem = () => {
    if (!selectedServiceId) return;
    const srv = services.find((s) => s.id === selectedServiceId);
    if (!srv) return;

    const existingIndex = items.findIndex((i) => i.serviceId === selectedServiceId);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].sessionCount += sessionCount;
      setItems(updated);
    } else {
      setItems((prev) => [
        ...prev,
        {
          serviceId: srv.id,
          serviceName: srv.name,
          sessionCount: sessionCount,
        },
      ]);
    }
    setSelectedServiceId('');
    setSessionCount(3);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Compute standard prices sum for live implied discount % calculation
  const standardSum = items.reduce((acc, item) => {
    const srv = services.find((s) => s.id === item.serviceId);
    const unitPrice = srv ? srv.price : 0;
    return acc + unitPrice * item.sessionCount;
  }, 0);

  const packagePriceNum = totalPrice !== '' ? Number(totalPrice) : 0;
  const liveDiscountPct =
    standardSum > 0 && packagePriceNum < standardSum
      ? Math.round(((standardSum - packagePriceNum) / standardSum) * 100)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Package Name is required.');
      return;
    }

    if (items.length === 0) {
      setError('Please add at least one service to the package.');
      return;
    }

    if (totalPrice === '' || Number(totalPrice) < 0) {
      setError('Package Price must be at least 0.');
      return;
    }

    try {
      setSubmitting(true);
      await onSuccess({
        name: name.trim(),
        description: description.trim() || undefined,
        serviceItems: items,
        totalPrice: Number(totalPrice),
        validityDays: validityDays !== '' ? Number(validityDays) : 90,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to build package');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="srv-modal-backdrop" onClick={onClose}>
      <div className="srv-modal srv-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="srv-modal__header">
          <div>
            <h3>Package Builder</h3>
            <p>Bundle multi-session services at a combined discounted package price</p>
          </div>
          <button type="button" className="srv-modal__close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && (
          <div className="srv-modal__error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="srv-modal__body">
          {/* Package Title & Validity */}
          <div className="srv-form-row-2">
            <div className="srv-form-group">
              <label>Package Title <span className="srv-req">*</span></label>
              <input
                type="text"
                placeholder="e.g. Bridal Glow Package, 5-Session Hair Spa"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="srv-form-group">
              <label>Validity (Days) <span className="srv-req">*</span></label>
              <input
                type="number"
                min={1}
                placeholder="90"
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={submitting}
                required
              />
            </div>
          </div>

          {/* Service Picker & Sessions Row */}
          <div className="srv-pkg-picker-box">
            <label className="srv-pkg-picker-label">Add Services to Package</label>
            <div className="srv-pkg-picker-row">
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                disabled={submitting}
              >
                <option value="">Select Service to Bundle</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.categoryName}) — ₹{s.price}
                  </option>
                ))}
              </select>

              <div className="srv-session-input">
                <span>Sessions:</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={sessionCount}
                  onChange={(e) => setSessionCount(Math.max(1, Number(e.target.value)))}
                  disabled={submitting}
                />
              </div>

              <button
                type="button"
                className="srv-btn-add-item"
                onClick={handleAddServiceItem}
                disabled={!selectedServiceId || submitting}
              >
                + Add Service
              </button>
            </div>

            {/* Bundled Items Table */}
            {items.length > 0 ? (
              <div className="srv-pkg-table-wrapper">
                <table className="srv-pkg-table">
                  <thead>
                    <tr>
                      <th>Service Name</th>
                      <th>Sessions</th>
                      <th>Standard Value</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const srv = services.find((s) => s.id === item.serviceId);
                      const unitPrice = srv ? srv.price : 0;
                      const val = unitPrice * item.sessionCount;
                      return (
                        <tr key={idx}>
                          <td>{item.serviceName}</td>
                          <td>
                            <span className="srv-session-badge">{item.sessionCount} Sessions</span>
                          </td>
                          <td>₹{val.toLocaleString('en-IN')}</td>
                          <td>
                            <button
                              type="button"
                              className="srv-btn-remove-item"
                              onClick={() => handleRemoveItem(idx)}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="srv-pkg-empty">No services added yet. Select a service above to bundle.</div>
            )}
          </div>

          {/* Pricing & Discount Live Preview Box */}
          <div className="srv-pricing-preview-box">
            <div className="srv-form-group">
              <label>Combined Package Price (₹) <span className="srv-req">*</span></label>
              <input
                type="number"
                min={0}
                placeholder="2500"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={submitting}
                required
              />
            </div>

            <div className="srv-discount-summary">
              <div className="srv-discount-summary__item">
                <span>Standard Total Value:</span>
                <strong>₹{standardSum.toLocaleString('en-IN')}</strong>
              </div>
              <div className="srv-discount-summary__item srv-discount-summary__item--highlight">
                <span>Implied Client Discount:</span>
                <span className="srv-discount-badge">{liveDiscountPct}% OFF</span>
              </div>
            </div>
          </div>

          <div className="srv-modal__footer">
            <button type="button" className="srv-btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="srv-btn-primary" disabled={submitting}>
              {submitting ? 'Building Package...' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
