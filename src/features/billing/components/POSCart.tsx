import React from 'react';
import { CartItem } from '../types/billing.types';
import './POSCart.css';

interface POSCartProps {
  cart: CartItem[];
  discountAmount: number;
  setDiscountAmount: (val: number) => void;
  notes: string;
  setNotes: (val: string) => void;
  onUpdateQuantity: (serviceId: string, delta: number) => void;
  onRemoveFromCart: (serviceId: string) => void;
  onClearCart: () => void;
  cartSummary: {
    subtotalInclusive: number;
    subtotalBase: number;
    taxTotal: number;
    discountAmount: number;
    grandTotal: number;
  };
  onCheckout: () => void;
}

export const POSCart: React.FC<POSCartProps> = ({
  cart,
  discountAmount,
  setDiscountAmount,
  notes,
  setNotes,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  cartSummary,
  onCheckout,
}) => {
  return (
    <div className="pos-cart">
      <div className="pos-cart__header">
        <h3>🛒 Selected Services ({cart.length})</h3>
        {cart.length > 0 && (
          <button className="pos-cart__clear-btn" onClick={onClearCart}>
            Clear
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="pos-cart__items">
        {cart.length === 0 ? (
          <div className="pos-cart__empty">
            <span>🛒</span>
            <p>No services selected</p>
            <small>Click on services from the catalogue to add to bill</small>
          </div>
        ) : (
          cart.map((item) => {
            const lineInclusive = item.priceInclusive * item.quantity;
            const lineBase = (item.priceInclusive / (1 + item.gstRate / 100)) * item.quantity;
            const lineGst = lineInclusive - lineBase;

            return (
              <div key={item.serviceId} className="pos-cart__item">
                <div className="pos-cart__item-info">
                  <div className="pos-cart__item-title">
                    <span className="pos-cart__item-name">{item.name}</span>
                    <span className="pos-cart__gst-badge">{item.gstRate}% GST</span>
                  </div>
                  <div className="pos-cart__item-breakdown">
                    Base: ₹{lineBase.toFixed(2)} + GST: ₹{lineGst.toFixed(2)}
                  </div>
                </div>

                <div className="pos-cart__item-controls">
                  <div className="pos-cart__qty-box">
                    <button onClick={() => onUpdateQuantity(item.serviceId, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.serviceId, 1)}>+</button>
                  </div>
                  <span className="pos-cart__item-total">₹{lineInclusive.toLocaleString('en-IN')}</span>
                  <button
                    className="pos-cart__remove-btn"
                    onClick={() => onRemoveFromCart(item.serviceId)}
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Notes & Discount */}
      {cart.length > 0 && (
        <div className="pos-cart__section pos-cart__section--discount">
          <div className="pos-cart__form-row">
            <div className="pos-cart__field">
              <label>Discount (₹)</label>
              <input
                type="number"
                min="0"
                className="pos-cart__input"
                value={discountAmount || ''}
                onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0"
              />
            </div>
            <div className="pos-cart__field">
              <label>Notes / Memo</label>
              <input
                type="text"
                className="pos-cart__input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional billing note"
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary Box */}
      <div className="pos-cart__summary">
        <div className="pos-cart__summary-row">
          <span>Services Subtotal (Excl. Tax):</span>
          <span>₹{cartSummary.subtotalBase.toLocaleString('en-IN')}</span>
        </div>
        <div className="pos-cart__summary-row">
          <span>Total GST (Tax):</span>
          <span>₹{cartSummary.taxTotal.toLocaleString('en-IN')}</span>
        </div>
        {cartSummary.discountAmount > 0 && (
          <div className="pos-cart__summary-row pos-cart__summary-row--discount">
            <span>Discount Applied:</span>
            <span>- ₹{cartSummary.discountAmount.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="pos-cart__summary-row pos-cart__summary-row--grand">
          <span>Grand Total (GST Incl.):</span>
          <span className="pos-cart__grand-price">₹{cartSummary.grandTotal.toLocaleString('en-IN')}</span>
        </div>

        <button
          className="pos-cart__checkout-btn"
          disabled={cart.length === 0}
          onClick={onCheckout}
        >
          Continue to Checkout ➔ (₹{cartSummary.grandTotal.toLocaleString('en-IN')})
        </button>
      </div>
    </div>
  );
};
