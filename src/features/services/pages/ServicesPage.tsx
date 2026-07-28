import React, { useState } from 'react';
import { useServices } from '../hooks/use-services';
import { ServiceItem } from '../types/service.types';
import { AddEditServiceModal } from '../components/AddEditServiceModal';
import './ServicesPage.css';

export const ServicesPage: React.FC = () => {
  const {
    categories,
    services,
    allServices,
    selectedCategoryId,
    setSelectedCategoryId,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    addService,
    updateService,
    deleteService,
    refetch,
  } = useServices();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const totalReminders = allServices.filter((s) => s.defaultReminderDays && s.defaultReminderDays > 0).length;
  const avgDuration =
    allServices.length > 0
      ? Math.round(allServices.reduce((sum, s) => sum + s.durationMinutes, 0) / allServices.length)
      : 0;

  const handleOpenEdit = (service: ServiceItem) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  return (
    <div className="srv-master-page">
      {/* Top Header */}
      <div className="srv-master-header">
        <div>
          <div className="srv-badge-title">✂️ CATALOGUE MASTER & PRICING</div>
          <h2>Services Master</h2>
          <p>Master Data for All Salon Services, Pricing, GST Slabs & Automation Reminder Days</p>
        </div>
        <button type="button" className="srv-btn srv-btn--primary" onClick={handleOpenNew}>
          + Add New Service
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="srv-stats-grid">
        <div className="srv-stat-card">
          <div className="srv-stat-icon">✂️</div>
          <div>
            <span className="srv-stat-label">Total Services</span>
            <div className="srv-stat-value">{allServices.length}</div>
          </div>
        </div>
        <div className="srv-stat-card">
          <div className="srv-stat-icon">⚡</div>
          <div>
            <span className="srv-stat-label">Automation Reminders</span>
            <div className="srv-stat-value">{totalReminders} Configured</div>
          </div>
        </div>
        <div className="srv-stat-card">
          <div className="srv-stat-icon">⏱️</div>
          <div>
            <span className="srv-stat-label">Avg Duration</span>
            <div className="srv-stat-value">{avgDuration} Mins</div>
          </div>
        </div>
        <div className="srv-stat-card">
          <div className="srv-stat-icon">📁</div>
          <div>
            <span className="srv-stat-label">Categories</span>
            <div className="srv-stat-value">{categories.length}</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="srv-error-banner">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Main Table Card */}
      <div className="srv-master-card">
        {/* Filters Toolbar */}
        <div className="srv-master-toolbar">
          <div className="srv-toolbar-filter">
            <label>Filter Category:</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="srv-select-input"
            >
              <option value="">All Categories ({allServices.length})</option>
              {categories.map((cat) => (
                <option key={cat._id || (cat as any).id} value={cat._id || (cat as any).id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="srv-toolbar-search">
            <span className="srv-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search services by name, category, or sub-category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="srv-search-input"
            />
          </div>

          <span className="srv-count-indicator">Showing {services.length} Services</span>
        </div>

        {loading ? (
          <div className="srv-loading">Loading master service catalogue...</div>
        ) : services.length === 0 ? (
          <div className="srv-empty-state">
            <span>✂️</span>
            <p>No services found matching your criteria.</p>
            <button type="button" className="srv-btn srv-btn--primary" onClick={handleOpenNew}>
              + Add New Service
            </button>
          </div>
        ) : (
          <div className="srv-table-container">
            <table className="srv-table">
              <thead>
                <tr>
                  <th>Service Details</th>
                  <th>Category & Sub-Category</th>
                  <th>Price (₹)</th>
                  <th>Duration</th>
                  <th>GST Rate</th>
                  <th>⚡ Automation Reminder</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((srv) => (
                  <tr key={srv.id}>
                    <td>
                      <div className="srv-name-cell">
                        <strong>{srv.name}</strong>
                        {srv.description && <p className="srv-desc">{srv.description}</p>}
                      </div>
                    </td>
                    <td>
                      <div className="srv-cat-badge-cell">
                        <span className="srv-cat-pill">{srv.categoryName}</span>
                        {srv.subCategory && <span className="srv-subcat-pill">• {srv.subCategory}</span>}
                      </div>
                    </td>
                    <td>
                      <strong className="srv-price-text">₹{srv.price.toLocaleString('en-IN')}</strong>
                    </td>
                    <td>
                      <span className="srv-duration-badge">{srv.durationMinutes} mins</span>
                    </td>
                    <td>
                      <span className="srv-gst-badge">{srv.gstRate}% GST</span>
                    </td>
                    <td>
                      {srv.defaultReminderDays ? (
                        <span className="srv-reminder-badge">
                          🔔 Every {srv.defaultReminderDays} Days
                        </span>
                      ) : (
                        <span className="srv-reminder-badge srv-reminder-badge--none">Not set</span>
                      )}
                    </td>
                    <td>
                      <div className="srv-action-btns">
                        <button
                          type="button"
                          className="srv-action-btn edit"
                          onClick={() => handleOpenEdit(srv)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="srv-action-btn delete"
                          onClick={async () => {
                            if (window.confirm(`Deactivate service '${srv.name}'?`)) {
                              await deleteService(srv.id);
                              await refetch();
                            }
                          }}
                        >
                          🗑️ Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddEditServiceModal
        isOpen={isModalOpen}
        categories={categories}
        initialService={editingService}
        onClose={() => {
          setIsModalOpen(false);
          setEditingService(null);
        }}
        onSuccess={async (payload) => {
          if (editingService) {
            await updateService(editingService.id, payload);
          } else {
            await addService(payload);
          }
          await refetch();
        }}
      />
    </div>
  );
};
