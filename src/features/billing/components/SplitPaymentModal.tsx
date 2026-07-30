import React, { useState, useMemo } from 'react';
import { PaymentEntry, PaymentMethod } from '../types/billing.types';
import './SplitPaymentModal.css';

interface SplitPaymentModalProps {
  grandTotal: number;
  customerName: string;
  onConfirm: (payments: PaymentEntry[]) => void;
  onClose: () => void;
  submitting: boolean;
}

export const SplitPaymentModal: React.FC<SplitPaymentModalProps> = ({
  grandTotal,
  customerName,
  onConfirm,
  onClose,
  submitting,
}) => {
  // Start with full amount assigned to CASH by default for convenience
  const [payments, setPayments] = useState<PaymentEntry[]>([
    { method: 'CASH', amount: grandTotal },
  ]);

  const totalPaid = useMemo(() => {
    return Number(payments.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2));
  }, [payments]);

  const remaining = useMemo(() => {
    return Number((grandTotal - totalPaid).toFixed(2));
  }, [grandTotal, totalPaid]);

  const isExactMatch = Math.abs(remaining) < 0.01;

  const handleUpdateAmount = (index: number, val: number) => {
    setPayments((prev) => {
      const updated = [...prev];
      updated[index].amount = Math.max(0, val);
      return updated;
    });
  };

  const handleUpdateMethod = (index: number, method: PaymentMethod) => {
    setPayments((prev) => {
      const updated = [...prev];
      updated[index].method = method;
      return updated;
    });
  };

  const handleAddPaymentRow = () => {
    const defaultMethod: PaymentMethod = payments.some((p) => p.method === 'UPI')
      ? 'CARD'
      : payments.some((p) => p.method === 'CASH')
      ? 'UPI'
      : 'CASH';

    setPayments((prev) => [
      ...prev,
      { method: defaultMethod, amount: remaining > 0 ? remaining : 0 },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (payments.length <= 1) return;
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isExactMatch) return;
    onConfirm(payments);
  };

  return (
    <div className="sp-modal-overlay">
      <div className="sp-modal">
        <div className="sp-modal__header">
          <div>
            <h3>💳 Split Payment Checkout</h3>
            <p>Customer: <strong>{customerName}</strong></p>
          </div>
          <button className="sp-modal__close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="sp-modal__body">
          {/* Bill Total Banner */}
          <div className="sp-modal__banner">
            <div className="sp-modal__banner-col">
              <span>Grand Total</span>
              <strong>₹{grandTotal.toLocaleString('en-IN')}</strong>
            </div>
            <div className="sp-modal__banner-col">
              <span>Total Paid</span>
              <strong className={isExactMatch ? 'sp-text--green' : 'sp-text--orange'}>
                ₹{totalPaid.toLocaleString('en-IN')}
              </strong>
            </div>
            <div className="sp-modal__banner-col">
              <span>Remaining Balance</span>
              <strong className={remaining === 0 ? 'sp-text--green' : 'sp-text--red'}>
                ₹{remaining.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

          {/* Payment Entries */}
          <div className="sp-modal__rows">
            <label className="sp-modal__label">Select Payment Modes & Amounts:</label>
            {payments.map((entry, index) => (
              <div key={index} className="sp-modal__row">
                <select
                  className="sp-modal__select"
                  value={entry.method}
                  onChange={(e) => handleUpdateMethod(index, e.target.value as PaymentMethod)}
                >
                  <option value="CASH">💵 Cash</option>
                  <option value="UPI">📱 UPI / QR Code</option>
                  <option value="CARD">💳 Credit / Debit Card</option>
                </select>

                <div className="sp-modal__input-wrapper">
                  <span>₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="sp-modal__input"
                    value={entry.amount || ''}
                    onChange={(e) => handleUpdateAmount(index, parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>

                {payments.length > 1 && (
                  <button
                    type="button"
                    className="sp-modal__remove-btn"
                    onClick={() => handleRemoveRow(index)}
                    title="Remove method"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="sp-modal__add-btn"
              onClick={handleAddPaymentRow}
            >
              + Add Split Payment Method
            </button>
          </div>

          {/* Status Message */}
          {!isExactMatch && (
            <div className="sp-modal__alert">
              ⚠️ Sum of payments (₹{totalPaid}) must equal Grand Total (₹{grandTotal}) to close invoice.
            </div>
          )}

          {/* Footer Actions */}
          <div className="sp-modal__footer">
            <button type="button" className="sp-modal__btn-sec" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="sp-modal__btn-pri"
              disabled={!isExactMatch || submitting}
            >
              {submitting ? 'Generating Invoice...' : '✓ Confirm & Complete Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
