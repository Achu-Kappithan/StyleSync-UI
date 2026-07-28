import React, { useState } from 'react';
import { ServiceItem, CreateMembershipPayload } from '../types/service.types';
import './AddEditMembershipModal.css';

interface AddEditMembershipModalProps {
  isOpen: boolean;
  services: ServiceItem[];
  onClose: () => void;
  onSuccess: (payload: CreateMembershipPayload) => Promise<void>;
}

export const AddEditMembershipModal: React.FC<AddEditMembershipModalProps> = ({
  isOpen,
  services,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [tierName, setTierName] = useState<'SILVER' | 'GOLD' | 'PLATINUM' | 'VIP'>('GOLD');
  const [price, setPrice] = useState<number | ''>(1999);
  const [validityMonths, setValidityMonths] = useState<number | ''>(12);
  const [discountPercentage, setDiscountPercentage] = useState<number | ''>(15);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleService = (srvId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(srvId) ? prev.filter((id) => id !== srvId) : [...prev, srvId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Membership Plan Name is required.');
      return;
    }

    if (price === '' || Number(price) < 0) {
      setError('Price must be at least 0.');
      return;
    }

    if (validityMonths === '' || Number(validityMonths) < 1) {
      setError('Validity Months must be at least 1 month.');
      return;
    }

    if (discountPercentage === '' || Number(discountPercentage) < 0 || Number(discountPercentage) > 100) {
      setError('Discount Percentage must be between 0% and 100%.');
      return;
    }

    try {
      setSubmitting(true);
      await onSuccess({
        name: name.trim(),
        tierName,
        price: Number(price),
        validityMonths: Number(validityMonths),
        discountPercentage: Number(discountPercentage),
        includedServiceIds: selectedServiceIds,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to build membership plan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="srv-modal-backdrop" onClick={onClose}>
      <div className="srv-modal srv-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="srv-modal__header">
          <div>
            <h3>Membership Plan Builder</h3>
            <p>Create time-bound subscription plans unlocking flat discount tiers and included services</p>
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
          {/* Plan Name & Tier Row */}
          <div className="srv-form-row-2">
            <div className="srv-form-group">
              <label>Plan Name <span className="srv-req">*</span></label>
              <input
                type="text"
                placeholder="e.g. Gold VIP Privilege Club"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="srv-form-group">
              <label>Membership Tier <span className="srv-req">*</span></label>
              <select
                value={tierName}
                onChange={(e) => setTierName(e.target.value as 'SILVER' | 'GOLD' | 'PLATINUM' | 'VIP')}
                disabled={submitting}
                required
              >
                <option value="SILVER">🥈 Silver Tier</option>
                <option value="GOLD">🥇 Gold Tier</option>
                <option value="PLATINUM">💎 Platinum Tier</option>
                <option value="VIP">👑 VIP Privilege</option>
              </select>
            </div>
          </div>

          {/* Price, Validity & Discount Row */}
          <div className="srv-form-row-3">
            <div className="srv-form-group">
              <label>Annual Price (₹) <span className="srv-req">*</span></label>
              <input
                type="number"
                min={0}
                placeholder="1999"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={submitting}
                required
              />
            </div>

            <div className="srv-form-group">
              <label>Validity (Months) <span className="srv-req">*</span></label>
              <input
                type="number"
                min={1}
                placeholder="12"
                value={validityMonths}
                onChange={(e) => setValidityMonths(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={submitting}
                required
              />
            </div>

            <div className="srv-form-group">
              <label>Flat Discount (%) <span className="srv-req">*</span></label>
              <input
                type="number"
                min={0}
                max={100}
                placeholder="15"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={submitting}
                required
              />
            </div>
          </div>

          {/* Included Services Multi-Select */}
          <div className="srv-form-group">
            <label>Included Free Services (Optional)</label>
            <p className="srv-field-hint">Check services included free of charge with this membership subscription:</p>
            <div className="srv-checkbox-grid">
              {services.map((srv) => {
                const checked = selectedServiceIds.includes(srv.id);
                return (
                  <label key={srv.id} className={`srv-checkbox-card ${checked ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleService(srv.id)}
                      disabled={submitting}
                    />
                    <span>{srv.name}</span>
                    <span className="srv-srv-price">₹{srv.price}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="srv-form-group">
            <label>Plan Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Exclusive benefits included in this tier..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="srv-modal__footer">
            <button type="button" className="srv-btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="srv-btn-primary" disabled={submitting}>
              {submitting ? 'Creating Plan...' : 'Create Membership Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
