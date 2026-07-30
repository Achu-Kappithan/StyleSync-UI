import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBilling } from '../hooks/use-billing';
import { useServices } from '../../services/hooks/use-services';
import { useEmployees } from '../../employees/hooks/use-employees';
import { Customer } from '../../customers/types/customer.types';
import { PaymentEntry, PaymentMethod } from '../types/billing.types';
import { appointmentService } from '../../appointments/services/appointment-service';
import { InvoiceModal } from '../components/InvoiceModal';
import './CheckoutPage.css';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Resolve returnUrl (e.g. /dashboard/billing or /dashboard/appointments)
  const returnUrl = useMemo(() => {
    return (
      (location.state as any)?.returnUrl ||
      localStorage.getItem('stylesync_return_url') ||
      '/dashboard/billing'
    );
  }, [location.state]);

  useEffect(() => {
    if ((location.state as any)?.returnUrl) {
      localStorage.setItem('stylesync_return_url', (location.state as any).returnUrl);
    }
  }, [location.state]);

  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSummary,
    discountAmount,
    setDiscountAmount,
    notes,
    setNotes,
    selectedInvoice,
    setSelectedInvoice,
    submitting,
    finalizeBill,
    addToCart,
  } = useBilling();

  const { packages, memberships } = useServices();
  const { data: employeeData } = useEmployees({ limit: 100 });
  const employees = employeeData?.items || [];

  // Selected Customer and Per-Item Stylists state (passed from Steps 1 & 2)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [itemStylists, setItemStylists] = useState<Record<string, string>>({});

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedCust = localStorage.getItem('stylesync_checkout_customer');
      if (savedCust) {
        setSelectedCustomer(JSON.parse(savedCust));
      }
      const savedStylists = localStorage.getItem('stylesync_item_stylists');
      if (savedStylists) {
        setItemStylists(JSON.parse(savedStylists));
      }
    } catch (e) {
      console.error('Failed to load checkout state', e);
    }
  }, []);

  // Customer GST & Discounts
  const [customerGstin, setCustomerGstin] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [selectedCampaign, setSelectedCampaign] = useState('');

  // Bottom Cross-Sell Tabs State ('product' | 'package' | 'membership' | 'giftcard')
  const [activeBottomTab, setActiveBottomTab] = useState<'product' | 'package' | 'membership' | 'giftcard'>('product');

  // Product Add Form State
  const [prodSearch, setProdSearch] = useState('');
  const [prodQty, setProdQty] = useState(1);
  const [prodPrice, setProdPrice] = useState(350);
  const [prodStylistId, setProdStylistId] = useState('');

  // ─── Right Panel: Collect Payment State ────────────────────────────────────
  const [activePayTab, setActivePayTab] = useState<PaymentMethod | 'MEMBERSHIP' | 'PREPAID'>('CASH');
  const [payAmountInput, setPayAmountInput] = useState<number>(0);
  const [tipInput, setTipInput] = useState<number>(0);
  const [paymentEntries, setPaymentEntries] = useState<PaymentEntry[]>([]);

  // Financial Math
  const netBase = cartSummary.subtotalBase;
  const taxGst = cartSummary.taxTotal;
  const rawSum = cartSummary.grandTotal - couponDiscount;
  const roundedSum = Math.round(rawSum);
  const roundingAdjustment = Number((roundedSum - rawSum).toFixed(2));
  const finalGrandTotal = Math.max(0, roundedSum);

  const totalPaid = useMemo(() => {
    return Number(paymentEntries.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2));
  }, [paymentEntries]);

  const totalTips = useMemo(() => {
    return Number(paymentEntries.reduce((sum, p) => sum + (p.tip || 0), 0).toFixed(2));
  }, [paymentEntries]);

  const remainingBalance = useMemo(() => {
    return Number((finalGrandTotal - totalPaid).toFixed(2));
  }, [finalGrandTotal, totalPaid]);

  useEffect(() => {
    setPayAmountInput(remainingBalance > 0 ? remainingBalance : 0);
  }, [remainingBalance]);

  // Handle Apply Coupon
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    if (couponCode.toUpperCase() === 'STYLE10' || couponCode.toUpperCase() === 'WELCOME') {
      const disc = Math.round(cartSummary.subtotalBase * 0.1);
      setCouponDiscount(disc);
      setCouponApplied(true);
      alert(`Coupon '${couponCode}' applied! ₹${disc} discount added.`);
    } else {
      alert('Invalid coupon code. Try STYLE10 or WELCOME');
    }
  };

  const handleClearCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponApplied(false);
  };

  // Add Payment Entry
  const handleAddPaymentEntry = () => {
    if (payAmountInput <= 0 && tipInput <= 0) {
      alert('Please enter payment or tip amount');
      return;
    }

    const method: PaymentMethod = activePayTab === 'MEMBERSHIP' || activePayTab === 'PREPAID' ? 'CASH' : activePayTab;

    setPaymentEntries((prev) => [
      ...prev,
      {
        method,
        amount: Math.max(0, payAmountInput),
        tip: Math.max(0, tipInput),
      },
    ]);

    setTipInput(0);
  };

  const handleRemovePaymentEntry = (index: number) => {
    setPaymentEntries((prev) => prev.filter((_, i) => i !== index));
  };

  // Add Retail Product to Invoice
  const handleAddRetailProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodSearch.trim()) return;
    addToCart({
      id: `prod_${Date.now()}`,
      name: `📦 ${prodSearch.trim()}`,
      price: prodPrice,
      durationMinutes: 0,
      gstRate: 18,
      isActive: true,
    } as any);
    setProdSearch('');
    alert('Product added to billing invoice');
  };

  // Handler when user closes the Printable Invoice Receipt Modal
  const handleCloseInvoiceModal = () => {
    setSelectedInvoice(null);
    localStorage.removeItem('stylesync_checkout_cart');
    localStorage.removeItem('stylesync_checkout_customer');
    localStorage.removeItem('stylesync_item_stylists');
    localStorage.removeItem('stylesync_checkout_appointment_id');
    const targetUrl = localStorage.getItem('stylesync_return_url') || returnUrl || '/dashboard/billing';
    localStorage.removeItem('stylesync_return_url');
    alert('✓ Invoice completed and closed successfully!');
    navigate(targetUrl);
  };

  // Finalize Transaction
  const handleFinalizeBill = async () => {
    if (!selectedCustomer) {
      alert('Customer is missing. Please select customer.');
      return;
    }
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    if (Math.abs(remainingBalance) > 0.01) {
      alert(`Remaining balance must be ₹0.00. Current remaining: ₹${remainingBalance}`);
      return;
    }

    const primaryStylist = Object.values(itemStylists)[0] || employees[0]?.id || employees[0]?._id;

    await finalizeBill({
      customerId: selectedCustomer.id || selectedCustomer._id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      employeeId: primaryStylist,
      payments: paymentEntries.length > 0 ? paymentEntries : [{ method: 'CASH', amount: finalGrandTotal }],
    });

    // Mark appointment as COMPLETED only after payment commits
    const apptId = localStorage.getItem('stylesync_checkout_appointment_id');
    if (apptId) {
      try {
        await appointmentService.updateStatus(apptId, 'COMPLETED');
      } catch (e) {
        console.error('Failed to update appointment status to COMPLETED', e);
      }
      localStorage.removeItem('stylesync_checkout_appointment_id');
    }
  };

  return (
    <div className="z-checkout-root">
      {/* ── Top Navigation Header (No Center Name, No App Sidebar) ── */}
      <div className="z-checkout-header">
        <div className="z-header-left">
          <button className="z-btn-back" onClick={() => navigate(returnUrl)}>
            ‹ Back to {returnUrl.includes('appointment') ? 'Appointments' : 'POS Terminal'}
          </button>
        </div>

        <div className="z-header-right">
          <div className="z-inv-badge">
            Invoice #<strong>INV-2026-00059</strong>
          </div>
          {selectedCustomer ? (
            <div className="z-cust-badge">
              👤 <strong>{selectedCustomer.name}</strong> | 📞 {selectedCustomer.phone} {selectedCustomer.gender ? `• ${selectedCustomer.gender}` : ''}
            </div>
          ) : (
            <div className="z-no-cust-badge">⚠️ No Client Selected</div>
          )}
        </div>
      </div>

      {/* ── Main Dual-Panel Layout ── */}
      <div className="z-checkout-grid">

        {/* ──────── LEFT PANEL: INVOICE DETAILS & LINE ITEMS ──────── */}
        <div className="z-panel-left">
          {/* Itemized Services Table (Zenoti Style) */}
          <div className="z-table-card">
            <table className="z-item-table">
              <thead>
                <tr>
                  <th style={{ width: '30px' }}></th>
                  <th>Item Description</th>
                  <th>Sale By (Stylist)</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Discount</th>
                  <th style={{ textAlign: 'right' }}>Final Price</th>
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="z-empty-td">
                      No services or items in this invoice. Return to POS to add services.
                    </td>
                  </tr>
                ) : (
                  cart.map((item) => {
                    const priceInclusive = Number(item.priceInclusive || (item as any).price || 0);
                    const gstRate = Number(item.gstRate || 18);
                    const lineInclusive = priceInclusive * item.quantity;
                    const unitBasePrice = priceInclusive / (1 + gstRate / 100);
                    const empId = itemStylists[item.serviceId];

                    return (
                      <tr key={item.serviceId}>
                        <td>
                          <button
                            className="z-btn-del"
                            onClick={() => removeFromCart(item.serviceId)}
                            title="Remove item"
                          >
                            🗑️
                          </button>
                        </td>
                        <td>
                          <strong className="z-item-name">{item.name}</strong>
                          <span className="z-gst-tag">{item.gstRate}% GST Incl.</span>
                        </td>
                        <td>
                          <select
                            className="z-select-sm"
                            value={itemStylists[item.serviceId] || ''}
                            onChange={(e) =>
                              setItemStylists((prev) => ({ ...prev, [item.serviceId]: e.target.value }))
                            }
                          >
                            <option value="">-- Select Staff --</option>
                            {employees.map((emp) => (
                              <option key={emp.id || emp._id} value={emp.id || emp._id}>
                                👤 {emp.fullName}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="z-qty-badge">{item.quantity}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>₹{unitBasePrice.toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>0.00</td>
                        <td style={{ textAlign: 'right' }}>
                          <strong>{lineInclusive.toFixed(2)}</strong>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Financial Summary Breakdown */}
            <div className="z-math-summary">
              <div className="z-math-row">
                <span>Net Price (Excl. Tax):</span>
                <span>₹{netBase.toFixed(2)}</span>
              </div>
              <div className="z-math-row">
                <span>Tax (GST 18%):</span>
                <span>₹{taxGst.toFixed(2)}</span>
              </div>
              {roundingAdjustment !== 0 && (
                <div className="z-math-row">
                  <span>Rounding Adjustment:</span>
                  <span>₹{roundingAdjustment.toFixed(2)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="z-math-row z-math-row--discount">
                  <span>Coupon Discount:</span>
                  <span>- ₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="z-math-row z-math-row--sum">
                <span>Sum Total:</span>
                <strong className="z-sum-total">₹{finalGrandTotal.toLocaleString('en-IN')}.00</strong>
              </div>
            </div>
          </div>

          {/* Discounts, Coupons, Campaign & GST Form Fields */}
          <div className="z-discounts-card">
            <div className="z-field-row">
              <label>Discount on invoice</label>
              <div className="z-input-btn-group">
                <input
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                />
                <button type="button">▶</button>
              </div>
            </div>

            <div className="z-field-row">
              <label>Coupon / Voucher</label>
              <div className="z-input-btn-group">
                <input
                  type="text"
                  placeholder="Enter code (e.g. STYLE10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button type="button" onClick={handleApplyCoupon}>▶</button>
                {couponApplied && <button type="button" className="z-btn-clear" onClick={handleClearCoupon}>✕</button>}
              </div>
            </div>

            <div className="z-field-row">
              <label>Campaign / Offer</label>
              <div className="z-input-btn-group">
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                >
                  <option value="">Select Campaign Offer</option>
                  <option value="FESTIVE20">🎉 Festive Salon Offer (15% Off)</option>
                  <option value="MONSOON">☔ Monsoon Hair Spa Deal (₹200 Off)</option>
                  <option value="BRIDAL_SPECIAL">👰 Bridal Glow Special Package</option>
                </select>
                <button type="button">▶</button>
              </div>
            </div>

            <div className="z-field-row">
              <label>Customer GSTIN</label>
              <div className="z-input-btn-group">
                <input
                  type="text"
                  placeholder="29AAAAA0000A1Z5"
                  value={customerGstin}
                  onChange={(e) => setCustomerGstin(e.target.value)}
                />
                <button type="button" onClick={() => alert('GSTIN saved to invoice')}>Save</button>
              </div>
            </div>

            <div className="z-field-row z-field-row--textarea">
              <label>Comments</label>
              <textarea
                rows={2}
                placeholder="Billing notes (Comments are auto-saved)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Bottom Cross-Sell Tabs Container */}
          <div className="z-cross-sell-tabs">
            <div className="z-tab-headers">
              <button
                className={`z-tab-h ${activeBottomTab === 'product' ? 'z-tab-h--active' : ''}`}
                onClick={() => setActiveBottomTab('product')}
              >
                Product
              </button>
              <button
                className={`z-tab-h ${activeBottomTab === 'package' ? 'z-tab-h--active' : ''}`}
                onClick={() => setActiveBottomTab('package')}
              >
                Package
              </button>
              <button
                className={`z-tab-h ${activeBottomTab === 'membership' ? 'z-tab-h--active' : ''}`}
                onClick={() => setActiveBottomTab('membership')}
              >
                Membership
              </button>
              <button
                className={`z-tab-h ${activeBottomTab === 'giftcard' ? 'z-tab-h--active' : ''}`}
                onClick={() => setActiveBottomTab('giftcard')}
              >
                Gift Card
              </button>
            </div>

            <div className="z-tab-body">
              {activeBottomTab === 'product' && (
                <form onSubmit={handleAddRetailProduct} className="z-product-form">
                  <div className="z-form-grid">
                    <div>
                      <label>Product Name</label>
                      <input
                        type="text"
                        placeholder="e.g. L'Oreal Keratin Hair Serum 100ml"
                        value={prodSearch}
                        onChange={(e) => setProdSearch(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label>Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={prodQty}
                        onChange={(e) => setProdQty(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <label>Price (₹)</label>
                      <input
                        type="number"
                        value={prodPrice}
                        onChange={(e) => setProdPrice(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label>Sale By Employee</label>
                      <select value={prodStylistId} onChange={(e) => setProdStylistId(e.target.value)}>
                        <option value="">Select Employee</option>
                        {employees.map((emp) => (
                          <option key={emp.id || emp._id} value={emp.id || emp._id}>
                            👤 {emp.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="z-btn-add">Add Product</button>
                </form>
              )}

              {activeBottomTab === 'package' && (
                <div className="z-tab-placeholder">
                  <h5>📦 Customer Active Packages</h5>
                  <p>Select an active package to redeem package credits or sell a new package bundle.</p>
                  <select className="z-select">
                    <option>-- Select Package (e.g. 5x Haircut Pass) --</option>
                    {packages.map((pkg) => (
                      <option key={pkg.id || (pkg as any)._id} value={pkg.id || (pkg as any)._id}>
                        {pkg.name} — ₹{pkg.price}
                      </option>
                    ))}
                  </select>
                  <button className="z-btn-add" onClick={() => alert('Package applied')}>Apply Package</button>
                </div>
              )}

              {activeBottomTab === 'membership' && (
                <div className="z-tab-placeholder">
                  <h5>⭐ Membership Benefits & Plans</h5>
                  <p>Redeem customer membership discount or assign new membership tier.</p>
                  <select className="z-select">
                    <option>-- Select Membership Tier --</option>
                    {memberships.map((m) => (
                      <option key={m.id || (m as any)._id} value={m.id || (m as any)._id}>
                        {m.name} — ₹{m.price} ({m.discountPercentage}% Off)
                      </option>
                    ))}
                  </select>
                  <button className="z-btn-add" onClick={() => alert('Membership applied')}>Apply Membership</button>
                </div>
              )}

              {activeBottomTab === 'giftcard' && (
                <div className="z-tab-placeholder">
                  <h5>🎁 Gift Card Redemption</h5>
                  <div className="z-form-grid">
                    <div>
                      <label>Gift Card Voucher Code</label>
                      <input type="text" placeholder="GIFT-9982-X" />
                    </div>
                    <div>
                      <label>Redeem Amount (₹)</label>
                      <input type="number" placeholder="500" />
                    </div>
                  </div>
                  <button className="z-btn-add" onClick={() => alert('Gift Card redeemed')}>Redeem Gift Card</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ──────── RIGHT PANEL: COLLECT PAYMENT TERMINAL ──────── */}
        <div className="z-panel-right">
          <div className="z-collect-header">
            <h4>Collect Payment</h4>
          </div>

          <div className="z-collect-body">
            {/* Payment Method Side Selector */}
            <div className="z-pay-side-tabs">
              <button
                className={`z-pay-tab ${activePayTab === 'CASH' ? 'z-pay-tab--active' : ''}`}
                onClick={() => setActivePayTab('CASH')}
              >
                💵 Cash
              </button>
              <button
                className={`z-pay-tab ${activePayTab === 'CARD' ? 'z-pay-tab--active' : ''}`}
                onClick={() => setActivePayTab('CARD')}
              >
                💳 Credit/Debit
              </button>
              <button
                className={`z-pay-tab ${activePayTab === 'UPI' ? 'z-pay-tab--active' : ''}`}
                onClick={() => setActivePayTab('UPI')}
              >
                ⚙️ Custom / UPI
              </button>
              <button
                className={`z-pay-tab ${activePayTab === 'PREPAID' ? 'z-pay-tab--active' : ''}`}
                onClick={() => setActivePayTab('PREPAID')}
              >
                🎁 Prepaid/Gift
              </button>
              <button
                className={`z-pay-tab ${activePayTab === 'MEMBERSHIP' ? 'z-pay-tab--active' : ''}`}
                onClick={() => setActivePayTab('MEMBERSHIP')}
              >
                ⭐ Membership
              </button>
            </div>

            {/* Payment Input Form */}
            <div className="z-pay-input-box">
              <div className="z-pay-field">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="z-pay-input"
                  value={payAmountInput || ''}
                  onChange={(e) => setPayAmountInput(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="z-pay-field">
                <label>Tips (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="z-pay-input"
                  value={tipInput || ''}
                  onChange={(e) => setTipInput(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="z-pay-summary-line">
                <span>Total Amount:</span>
                <strong>₹{((payAmountInput || 0) + (tipInput || 0)).toFixed(2)}</strong>
              </div>

              <div className="z-pay-summary-line">
                <span>Change / Remaining:</span>
                <span className={remainingBalance === 0 ? 'z-text--green' : 'z-text--orange'}>
                  ₹{remainingBalance.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                className="z-btn-add-pay-primary"
                onClick={handleAddPaymentEntry}
              >
                Add Payment
              </button>
            </div>
          </div>

          {/* Payment Log Table */}
          {paymentEntries.length > 0 && (
            <div className="z-pay-log-table">
              <h5>Recorded Payments</h5>
              <table>
                <thead>
                  <tr>
                    <th>Method</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'right' }}>Tip</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paymentEntries.map((p, idx) => (
                    <tr key={idx}>
                      <td><strong>{p.method}</strong></td>
                      <td style={{ textAlign: 'right' }}>₹{p.amount.toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>₹{(p.tip || 0).toFixed(2)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button className="z-btn-del" onClick={() => handleRemovePaymentEntry(idx)}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Total Tips Counter */}
          <div className="z-tips-footer">
            <span>Total Tips: <strong>₹{totalTips.toFixed(2)}</strong> 🔀</span>
          </div>

          {/* Final Independent Action Buttons (Save PDF, Print, Close Invoice) */}
          <div className="z-final-actions">
            <div className="z-pre-actions-row">
              <button
                type="button"
                className="z-btn-action z-btn-action--pdf"
                onClick={() => window.print()}
                title="Save current invoice as PDF document before closing"
              >
                📄 Save PDF
              </button>
              <button
                type="button"
                className="z-btn-action z-btn-action--print"
                onClick={() => window.print()}
                title="Print invoice receipt before closing"
              >
                🖨️ Print Receipt
              </button>
            </div>

            <button
              className="z-btn-complete-invoice"
              disabled={cart.length === 0 || !selectedCustomer || Math.abs(remainingBalance) > 0.01 || submitting}
              onClick={handleFinalizeBill}
            >
              {submitting ? 'Generating Invoice...' : '🏁 Complete & Close Invoice'}
            </button>
          </div>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal bill={selectedInvoice} onClose={handleCloseInvoiceModal} />
      )}
    </div>
  );
};
