import React, { useState } from 'react';
import { Appointment } from '../types/appointment.types';
import './CancelModal.css';

interface Props {
  appointment: Appointment;
  onConfirm: (reason: string) => Promise<void>;
  onClose: () => void;
}

const QUICK_REASONS = [
  'Customer requested cancellation',
  'Stylist unavailable',
  'Emergency / illness',
  'Customer rescheduled',
  'No response from customer',
];

export const CancelModal: React.FC<Props> = ({ appointment, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');
  const [custom, setCustom] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalReason = reason === '__custom__' ? custom.trim() : reason;

  const handleConfirm = async () => {
    if (!finalReason) {
      setError('Please select or enter a cancellation reason');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(finalReason);
    } catch (e: any) {
      setError(e.message ?? 'Failed to cancel appointment');
      setSubmitting(false);
    }
  };

  return (
    <div className="cm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cm-modal" role="dialog" aria-modal="true" aria-label="Cancel Appointment">
        <div className="cm-header">
          <span className="cm-icon">⚠️</span>
          <div>
            <h3>Cancel Appointment</h3>
            <p>{appointment.customerName} · {appointment.customerPhone}</p>
          </div>
          <button id="cm-close" className="cm-close" onClick={onClose}>✕</button>
        </div>

        <div className="cm-body">
          <p className="cm-subtitle">Select a reason for cancellation:</p>
          <div className="cm-reasons">
            {QUICK_REASONS.map((r) => (
              <button
                key={r}
                id={`cm-reason-${r.slice(0, 10).replace(/\s/g, '-')}`}
                className={`cm-reason-btn ${reason === r ? 'cm-reason-btn--selected' : ''}`}
                onClick={() => setReason(r)}
                type="button"
              >
                {r}
              </button>
            ))}
            <button
              id="cm-reason-custom"
              className={`cm-reason-btn ${reason === '__custom__' ? 'cm-reason-btn--selected' : ''}`}
              onClick={() => setReason('__custom__')}
              type="button"
            >
              ✏️ Other reason…
            </button>
          </div>

          {reason === '__custom__' && (
            <textarea
              id="cm-custom-reason"
              className="cm-textarea"
              rows={3}
              placeholder="Describe the reason…"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              autoFocus
            />
          )}

          {error && <div className="cm-error">{error}</div>}
        </div>

        <div className="cm-footer">
          <button id="cm-keep" className="cm-btn cm-btn--ghost" onClick={onClose} disabled={submitting}>
            Keep Appointment
          </button>
          <button
            id="cm-confirm"
            className="cm-btn cm-btn--danger"
            onClick={handleConfirm}
            disabled={submitting || !finalReason}
          >
            {submitting ? 'Cancelling…' : 'Cancel Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
};
