import React from 'react';
import { Bill } from '../types/billing.types';
import './InvoiceModal.css';

interface InvoiceModalProps {
  bill: Bill;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ bill, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="inv-modal-overlay">
      <div className="inv-modal">
        <div className="inv-modal__actions-bar no-print">
          <button className="inv-btn inv-btn--print" onClick={handlePrint}>
            🖨️ Print Invoice
          </button>
          <button className="inv-btn inv-btn--close" onClick={onClose}>
            ✕ Close
          </button>
        </div>

        <div className="inv-receipt printable-area">
          {/* Header */}
          <div className="inv-receipt__header">
            <h2>StyleSync Salon & Spa</h2>
            <p className="inv-receipt__subtitle">Tax Invoice / Receipt</p>
            <div className="inv-receipt__badge">{bill.status}</div>
          </div>

          <div className="inv-receipt__divider" />

          {/* Meta Details */}
          <div className="inv-receipt__meta">
            <div>
              <p><strong>Invoice No:</strong> {bill.invoiceNumber}</p>
              <p><strong>Date:</strong> {new Date(bill.createdAt).toLocaleString('en-IN')}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p><strong>Customer:</strong> {bill.customerName}</p>
              <p><strong>Phone:</strong> {bill.customerPhone}</p>
              {bill.employeeName && <p><strong>Stylist:</strong> {bill.employeeName}</p>}
            </div>
          </div>

          {/* Line Items Table */}
          <table className="inv-receipt__table">
            <thead>
              <tr>
                <th>Service</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Base Rate</th>
                <th style={{ textAlign: 'right' }}>GST</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{item.name}</strong>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>({item.gstRate}% GST)</div>
                  </td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>₹{item.baseRate.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>₹{item.gstAmount.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>₹{item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Breakdown */}
          <div className="inv-receipt__summary">
            <div className="inv-receipt__row">
              <span>Subtotal (Excl. Tax):</span>
              <span>₹{bill.subtotalBase.toLocaleString('en-IN')}</span>
            </div>
            <div className="inv-receipt__row">
              <span>Total GST:</span>
              <span>₹{bill.taxTotal.toLocaleString('en-IN')}</span>
            </div>
            {bill.discountAmount > 0 && (
              <div className="inv-receipt__row inv-receipt__row--discount">
                <span>Discount Applied:</span>
                <span>- ₹{bill.discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="inv-receipt__row inv-receipt__row--grand">
              <span>Grand Total (GST Incl.):</span>
              <span>₹{bill.grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Payment Split Info */}
          <div className="inv-receipt__payments">
            <h4>Payment Method Breakdown</h4>
            <div className="inv-receipt__payments-list">
              {bill.payments.map((p, idx) => (
                <div key={idx} className="inv-receipt__pay-chip">
                  <span>{p.method}</span>
                  <strong>₹{p.amount.toLocaleString('en-IN')}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="inv-receipt__footer">
            <p>Thank you for visiting StyleSync Salon!</p>
            <small>Computer-generated invoice • No signature required</small>
          </div>
        </div>
      </div>
    </div>
  );
};
