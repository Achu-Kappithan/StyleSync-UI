import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCustomers } from '../hooks/use-customers';
import { Customer } from '../types/customer.types';
import { AddEditCustomerModal } from '../components/AddEditCustomerModal';
import './CustomerListPage.css';

export const CustomerListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, loading, error, params, setParams, refetch } = useCustomers({
    page: 1,
    limit: 15,
  });

  // Always refetch freshest data when navigating to Client List page
  useEffect(() => {
    refetch();
  }, [location.pathname, refetch]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setParams((prev) => ({ ...prev, tag: e.target.value || undefined, page: 1 }));
  };

  const handleLastVisitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setParams((prev) => ({ ...prev, lastVisitRange: e.target.value || undefined, page: 1 }));
  };

  const handleRowClick = (customerId: string) => {
    navigate(`/dashboard/clients/${customerId}`);
  };

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (e: React.MouseEvent, cust: Customer) => {
    e.stopPropagation();
    setEditingCustomer(cust);
    setIsModalOpen(true);
  };

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="cust-list-container">
      {/* HEADER BAR */}
      <div className="cust-list-header">
        <div>
          <h1 className="cust-list-title">Customer Management</h1>
          <p className="cust-list-subtitle">Single source of truth for customer profiles, history, and loyalty</p>
        </div>
        <button className="cust-btn cust-btn--primary" onClick={handleOpenAddModal}>
          + Add New Customer
        </button>
      </div>

      {/* FILTER CONTROLS */}
      <div className="cust-filter-bar">
        <div className="cust-search-box">
          <svg className="cust-search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search by customer name, phone number, email..."
            value={params.search || ''}
            onChange={handleSearchChange}
          />
        </div>

        <div className="cust-filter-selects">
          <select value={params.tag || ''} onChange={handleTagChange}>
            <option value="">All Customer Tags</option>
            <option value="VIP">VIP Customer</option>
            <option value="REGULAR">Regular Client</option>
            <option value="NEW">New Client</option>
            <option value="INACTIVE">Inactive (&gt; 90 Days)</option>
            <option value="DIFFICULT">Special Care / Sensitive</option>
            <option value="BRIDAL">Bridal Client</option>
            <option value="STUDENT">Student Discount Eligible</option>
            <option value="SENIOR_CITIZEN">Senior Citizen Discount</option>
          </select>

          <select value={params.lastVisitRange || ''} onChange={handleLastVisitChange}>
            <option value="">All Visit Ranges</option>
            <option value="LAST_30_DAYS">Visited in Last 30 Days</option>
            <option value="LAST_60_DAYS">Visited in Last 60 Days</option>
            <option value="LAST_90_DAYS">Visited in Last 90 Days</option>
            <option value="OVER_90_DAYS">Inactive (&gt; 90 Days)</option>
          </select>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && <div className="cust-modal__alert cust-modal__alert--error">{error}</div>}

      {/* DATA TABLE */}
      <div className="cust-table-card">
        {loading ? (
          <div className="cust-loading-state">
            <div className="cust-spinner" />
            <span>Loading customers...</span>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="cust-empty-state">
            <p>No customers found matching your filter criteria.</p>
            <button className="cust-btn cust-btn--secondary" onClick={handleOpenAddModal}>
              Create First Customer
            </button>
          </div>
        ) : (
          <div className="cust-table-wrapper">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Tags & Badges</th>
                  <th>Last Visit</th>
                  <th>Lifetime Value</th>
                  <th>Loyalty Points</th>
                  <th style={{ textAlign: 'right' }}>Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((cust) => {
                  const isVIP = cust.tags?.includes('VIP') || cust.lifetimeValue > 20000;
                  const initials = cust.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr key={cust.id} className="cust-table__row" onClick={() => handleRowClick(cust.id)}>
                      <td>
                        <div className="cust-profile-cell">
                          <div className={`cust-avatar ${isVIP ? 'cust-avatar--vip' : ''}`}>
                            {initials}
                          </div>
                          <div>
                            <div className="cust-name-row">
                              <span className="cust-name">{cust.name}</span>
                              {isVIP && <span className="cust-badge cust-badge--vip">VIP</span>}
                              {cust.medicalNotes && (
                                <span className="cust-badge cust-badge--allergy" title="Allergy / Medical Note">
                                  ⚠️ Medical Alert
                                </span>
                              )}
                            </div>
                            <span className="cust-subtext">{cust.gender || 'Client'}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="cust-contact-cell">
                          <span className="cust-phone">📱 +91 {cust.phone}</span>
                          {cust.email && <span className="cust-email">✉️ {cust.email}</span>}
                        </div>
                      </td>

                      <td>
                        <div className="cust-tags-cell">
                          {cust.tags?.length > 0 ? (
                            cust.tags.map((t) => (
                              <span key={t} className="cust-tag-pill">
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="cust-subtext">—</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="cust-visit-cell">
                          <span>{formatDate(cust.lastVisitDate)}</span>
                          <span className="cust-subtext">{cust.totalVisits} visits total</span>
                        </div>
                      </td>

                      <td>
                        <span className="cust-ltv">{formatCurrency(cust.lifetimeValue)}</span>
                      </td>

                      <td>
                        <span className="cust-loyalty">⭐ {cust.loyaltyPoints || 0} pts</span>
                      </td>

                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div className="cust-actions-group">
                          <button
                            className="cust-action-btn"
                            title="Book Appointment"
                            onClick={() => navigate(`/dashboard/appointments?customerId=${cust.id}`)}
                          >
                            📅
                          </button>
                          <button
                            className="cust-action-btn"
                            title="Create Bill"
                            onClick={() => navigate(`/dashboard/billing?customerId=${cust.id}`)}
                          >
                            🧾
                          </button>
                          <a
                            href={`tel:${cust.phone}`}
                            className="cust-action-btn"
                            title="Call Customer"
                          >
                            📞
                          </a>
                          <a
                            href={`https://wa.me/91${cust.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cust-action-btn cust-action-btn--wa"
                            title="WhatsApp Chat"
                          >
                            💬
                          </a>
                          <button
                            className="cust-action-btn"
                            title="Edit Profile"
                            onClick={(e) => handleOpenEditModal(e, cust)}
                          >
                            ✏️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {data && data.totalPages > 1 && (
          <div className="cust-pagination">
            <span className="cust-pagination-info">
              Showing page {data.page} of {data.totalPages} ({data.total} total customers)
            </span>
            <div className="cust-pagination-controls">
              <button
                className="cust-btn cust-btn--sm cust-btn--outline"
                disabled={data.page <= 1}
                onClick={() => setParams((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
              >
                Previous
              </button>
              <button
                className="cust-btn cust-btn--sm cust-btn--outline"
                disabled={data.page >= data.totalPages}
                onClick={() => setParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      <AddEditCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCustomer={editingCustomer}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
