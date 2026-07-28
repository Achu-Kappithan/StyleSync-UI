import React, { useState, useEffect } from 'react';
import { ServiceCategory, ServiceItem, CreateServicePayload } from '../types/service.types';
import './AddEditServiceModal.css';

interface AddEditServiceModalProps {
  isOpen: boolean;
  categories: ServiceCategory[];
  initialService?: ServiceItem | null;
  onClose: () => void;
  onSuccess: (payload: CreateServicePayload) => Promise<void>;
}

export const AddEditServiceModal: React.FC<AddEditServiceModalProps> = ({
  isOpen,
  categories,
  initialService,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [price, setPrice] = useState<number | ''>(450);
  const [durationMinutes, setDurationMinutes] = useState<number | ''>(45);
  const [gstRate, setGstRate] = useState<number>(18);
  const [defaultReminderDays, setDefaultReminderDays] = useState<number | ''>(45);
  const [description, setDescription] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialService) {
      setName(initialService.name);
      setCategoryId(initialService.categoryId);
      setSubCategory(initialService.subCategory || '');
      setPrice(initialService.price);
      setDurationMinutes(initialService.durationMinutes);
      setGstRate(initialService.gstRate);
      setDefaultReminderDays(initialService.defaultReminderDays ?? 45);
      setDescription(initialService.description || '');
    } else {
      setName('');
      setCategoryId(categories[0]?._id || '');
      setSubCategory('');
      setPrice(450);
      setDurationMinutes(45);
      setGstRate(18);
      setDefaultReminderDays(45);
      setDescription('');
    }
  }, [initialService, categories, isOpen]);

  if (!isOpen) return null;

  const selectedCategoryObj = categories.find((c) => c._id === categoryId);
  const availableSubCategories = selectedCategoryObj?.subCategories || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Service Name is required.');
      return;
    }

    if (!categoryId) {
      setError('Category selection is required.');
      return;
    }

    if (price === '' || price < 0) {
      setError('Service Price must be at least 0.');
      return;
    }

    if (durationMinutes === '' || durationMinutes < 5) {
      setError('Duration must be at least 5 minutes.');
      return;
    }

    try {
      setSubmitting(true);
      await onSuccess({
        name: name.trim(),
        categoryId,
        categoryName: selectedCategoryObj?.name || 'General',
        subCategory: subCategory.trim() || undefined,
        price: Number(price),
        durationMinutes: Number(durationMinutes),
        gstRate: Number(gstRate),
        defaultReminderDays: defaultReminderDays !== '' ? Number(defaultReminderDays) : undefined,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="srv-modal-backdrop" onClick={onClose}>
      <div className="srv-modal srv-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="srv-modal__header">
          <div>
            <h3>{initialService ? 'Edit Service' : 'Add New Service'}</h3>
            <p>Configure service pricing, duration, GST slab, and automation reminder interval</p>
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
          {/* Service Name & Category Row */}
          <div className="srv-form-row-2">
            <div className="srv-form-group">
              <label>Service Name <span className="srv-req">*</span></label>
              <input
                type="text"
                placeholder="e.g. Haircut & Blowdry, HydraFacial, Gel Polish"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="srv-form-group">
              <label>Category <span className="srv-req">*</span></label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubCategory('');
                }}
                disabled={submitting}
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sub-Category & Duration Row */}
          <div className="srv-form-row-2">
            <div className="srv-form-group">
              <label>Sub-Category (Optional)</label>
              {availableSubCategories.length > 0 ? (
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  disabled={submitting}
                >
                  <option value="">Select Sub-Category</option>
                  {availableSubCategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Haircuts, Clean-ups"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  disabled={submitting}
                />
              )}
            </div>

            <div className="srv-form-group">
              <label>Duration (Minutes) <span className="srv-req">*</span></label>
              <input
                type="number"
                min={5}
                step={5}
                placeholder="45"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={submitting}
                required
              />
            </div>
          </div>

          {/* Price & GST Slab Row */}
          <div className="srv-form-row-2">
            <div className="srv-form-group">
              <label>Standard Price (₹) <span className="srv-req">*</span></label>
              <input
                type="number"
                min={0}
                placeholder="450"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={submitting}
                required
              />
            </div>

            <div className="srv-form-group">
              <label>GST Slab Rate <span className="srv-req">*</span></label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                disabled={submitting}
                required
              >
                <option value={0}>0% (Exempt)</option>
                <option value={5}>5% (Concessional)</option>
                <option value={12}>12% (Standard)</option>
                <option value={18}>18% (Salon Standard)</option>
                <option value={28}>28% (Luxury)</option>
              </select>
            </div>
          </div>

          {/* PROMINENT BUSINESS-CRITICAL FIELD: DEFAULT REMINDER DAYS FOR AUTOMATION ENGINE */}
          <div className="srv-automation-box">
            <div className="srv-automation-box__header">
              <span className="srv-automation-badge">⚡ Automation Engine Trigger</span>
              <h4>Automated Follow-up Reminder Interval</h4>
            </div>
            <p>
              Specify how many days after service completion the system should send an automated repeat appointment reminder SMS/WhatsApp to the client.
            </p>
            <div className="srv-form-group" style={{ marginTop: '0.75rem' }}>
              <label>Default Reminder Days</label>
              <div className="srv-input-with-unit">
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 45"
                  value={defaultReminderDays}
                  onChange={(e) => setDefaultReminderDays(e.target.value === '' ? '' : Number(e.target.value))}
                  disabled={submitting}
                />
                <span className="srv-unit-badge">Days</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="srv-form-group">
            <label>Service Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Brief summary of service steps or benefits..."
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
              {submitting ? 'Saving...' : initialService ? 'Update Service' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
