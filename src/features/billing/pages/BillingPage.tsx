import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBilling } from '../hooks/use-billing';
import { billingService } from '../services/billing-service';
import { useServices } from '../../services/hooks/use-services';
import { useEmployees } from '../../employees/hooks/use-employees';
import { POSCart } from '../components/POSCart';
import { CheckoutModal } from '../components/CheckoutModal';
import { InvoiceModal } from '../components/InvoiceModal';
import { Bill } from '../types/billing.types';
import './BillingPage.css';

export const BillingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');
  const [catalogueSearch, setCatalogueSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  const {
    bills,
    loadingHistory,
    historyError,
    queryParams,
    setQueryParams,
    fetchBillsHistory,

    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSummary,

    discountAmount,
    setDiscountAmount,
    notes,
    setNotes,

    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    selectedInvoice,
    setSelectedInvoice,
    submitting,
    finalizeBill,
  } = useBilling();

  const { allServices, categories } = useServices();
  const { data: employeeData } = useEmployees({ limit: 100 });
  const employees = employeeData?.items || [];

  // Filtered services for POS terminal
  const filteredServices = useMemo(() => {
    return allServices.filter((svc) => {
      const matchCat = selectedCat === 'ALL' || svc.categoryName === selectedCat;
      const matchSearch =
        !catalogueSearch.trim() ||
        svc.name.toLowerCase().includes(catalogueSearch.toLowerCase()) ||
        (svc.categoryName && svc.categoryName.toLowerCase().includes(catalogueSearch.toLowerCase()));
      return matchCat && matchSearch && svc.isActive;
    });
  }, [allServices, selectedCat, catalogueSearch]);

  const handleRefund = async (bill: Bill) => {
    const reason = window.prompt(`Enter refund reason for Invoice #${bill.invoiceNumber}:`);
    if (!reason) return;
    try {
      await billingService.refundBill(bill.id || bill._id, reason);
      alert('Invoice refunded successfully');
      fetchBillsHistory();
    } catch (err: any) {
      alert(err.message || 'Refund failed');
    }
  };

  const handleVoid = async (bill: Bill) => {
    const reason = window.prompt(`Enter VOID reason for Invoice #${bill.invoiceNumber}:`);
    if (!reason) return;
    try {
      await billingService.voidBill(bill.id || bill._id, reason);
      alert('Invoice voided successfully');
      fetchBillsHistory();
    } catch (err: any) {
      alert(err.message || 'Void failed');
    }
  };

  return (
    <div className="pos-page">
      {/* Header & Tabs */}
      <div className="pos-page__header">
        <div>
          <div className="pos-badge-title">🧾 POS & BILLING MANAGEMENT</div>
          <h2>Point of Sale & Invoices</h2>
          <p>Fast, atomic transaction capture with GST inclusive math & split payments</p>
        </div>

        <div className="pos-tab-toggle">
          <button
            className={`pos-tab-btn ${activeTab === 'pos' ? 'pos-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('pos')}
          >
            🛒 POS Terminal
          </button>
          <button
            className={`pos-tab-btn ${activeTab === 'history' ? 'pos-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📜 Invoice History ({bills.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'pos' ? (
        <div className="pos-grid">
          {/* Left Column: Service Catalogue */}
          <div className="pos-catalogue">
            <div className="pos-catalogue__toolbar">
              <input
                type="text"
                className="pos-catalogue__search"
                placeholder="🔍 Search services by name or category..."
                value={catalogueSearch}
                onChange={(e) => setCatalogueSearch(e.target.value)}
              />

              <div className="pos-catalogue__cat-pills">
                <button
                  className={`pos-cat-pill ${selectedCat === 'ALL' ? 'pos-cat-pill--active' : ''}`}
                  onClick={() => setSelectedCat('ALL')}
                >
                  All Services ({allServices.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id || cat._id}
                    className={`pos-cat-pill ${selectedCat === cat.name ? 'pos-cat-pill--active' : ''}`}
                    onClick={() => setSelectedCat(cat.name)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Service Grid */}
            <div className="pos-service-grid">
              {filteredServices.length === 0 ? (
                <div className="pos-catalogue__empty">
                  <span>💇‍♀️</span>
                  <p>No services match your search</p>
                </div>
              ) : (
                filteredServices.map((svc) => (
                  <div
                    key={svc.id || (svc as any)._id}
                    className="pos-service-card"
                    onClick={() => addToCart(svc as any)}
                  >
                    <div className="pos-service-card__cat">{svc.categoryName}</div>
                    <div className="pos-service-card__name">{svc.name}</div>
                    <div className="pos-service-card__footer">
                      <span className="pos-service-card__duration">⏱️ {svc.durationMinutes}m</span>
                      <span className="pos-service-card__price">₹{svc.price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: POS Cart Terminal */}
          <div className="pos-cart-container">
            <POSCart
              cart={cart}
              discountAmount={discountAmount}
              setDiscountAmount={setDiscountAmount}
              notes={notes}
              setNotes={setNotes}
              onUpdateQuantity={updateQuantity}
              onRemoveFromCart={removeFromCart}
              onClearCart={clearCart}
              cartSummary={cartSummary}
              onCheckout={() => setIsCheckoutModalOpen(true)}
            />
          </div>
        </div>
      ) : (
        /* Invoice History Tab */
        <div className="pos-history">
          <div className="pos-history__toolbar">
            <input
              type="text"
              className="pos-history__search"
              placeholder="🔍 Search invoices by #, customer name, phone..."
              value={queryParams.search || ''}
              onChange={(e) => setQueryParams((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
            />

            <select
              className="pos-history__select"
              value={queryParams.status || ''}
              onChange={(e) => setQueryParams((prev) => ({ ...prev, status: (e.target.value as any) || undefined, page: 1 }))}
            >
              <option value="">-- All Statuses --</option>
              <option value="PAID">PAID</option>
              <option value="REFUNDED">REFUNDED</option>
              <option value="VOIDED">VOIDED</option>
              <option value="DRAFT">DRAFT</option>
            </select>
          </div>

          {loadingHistory ? (
            <div className="pos-loading">Loading invoices...</div>
          ) : historyError ? (
            <div className="pos-error">⚠️ {historyError}</div>
          ) : bills.length === 0 ? (
            <div className="pos-history__empty">No invoices found for this query</div>
          ) : (
            <div className="pos-table-wrapper">
              <table className="pos-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Date & Time</th>
                    <th>Customer</th>
                    <th>Attributed Staff</th>
                    <th>Payment Modes</th>
                    <th>Grand Total</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill.id || bill._id}>
                      <td>
                        <strong className="pos-inv-num">{bill.invoiceNumber}</strong>
                      </td>
                      <td>{new Date(bill.createdAt).toLocaleDateString('en-IN')} {new Date(bill.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        <div><strong>{bill.customerName}</strong></div>
                        <small style={{ color: '#64748b' }}>{bill.customerPhone}</small>
                      </td>
                      <td>{bill.employeeName || 'General Staff'}</td>
                      <td>
                        <div className="pos-pay-tags">
                          {bill.payments.map((p, idx) => (
                            <span key={idx} className="pos-pay-tag">
                              {p.method}: ₹{p.amount}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <strong className="pos-grand-text">₹{bill.grandTotal.toLocaleString('en-IN')}</strong>
                      </td>
                      <td>
                        <span className={`pos-status-pill pos-status--${bill.status.toLowerCase()}`}>
                          {bill.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="pos-row-actions">
                          <button className="pos-row-btn" onClick={() => setSelectedInvoice(bill)}>
                            👁️ View
                          </button>
                          {bill.status === 'PAID' && (
                            <>
                              <button className="pos-row-btn pos-row-btn--refund" onClick={() => handleRefund(bill)}>
                                Refund
                              </button>
                              <button className="pos-row-btn pos-row-btn--void" onClick={() => handleVoid(bill)}>
                                Void
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {isCheckoutModalOpen && (
        <CheckoutModal
          cart={cart}
          cartSummary={cartSummary}
          employees={employees}
          onConfirm={finalizeBill}
          onClose={() => setIsCheckoutModalOpen(false)}
          submitting={submitting}
        />
      )}

      {selectedInvoice && (
        <InvoiceModal bill={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
};
