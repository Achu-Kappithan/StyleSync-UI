import React, { useState } from 'react';
import { useServices } from '../hooks/use-services';
import { ServiceItem } from '../types/service.types';
import { AddEditCategoryModal } from '../components/AddEditCategoryModal';
import { AddEditServiceModal } from '../components/AddEditServiceModal';
import { AddEditPackageModal } from '../components/AddEditPackageModal';
import { AddEditMembershipModal } from '../components/AddEditMembershipModal';
import './ServiceCataloguePage.css';

export const ServiceCataloguePage: React.FC = () => {
  const {
    categories,
    allServices,
    services,
    packages,
    memberships,
    selectedCategoryId,
    setSelectedCategoryId,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    addCategory,
    addService,
    updateService,
    deleteService,
    addPackage,
    addMembership,
  } = useServices();

  const [activeTab, setActiveTab] = useState<'SERVICES' | 'PACKAGES' | 'MEMBERSHIPS'>('SERVICES');

  // Modals visibility
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);

  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const handleOpenEditService = (service: ServiceItem) => {
    setEditingService(service);
    setIsServiceModalOpen(true);
  };

  const handleOpenNewService = () => {
    setEditingService(null);
    setIsServiceModalOpen(true);
  };

  return (
    <div className="srv-page">
      {/* Top Header & Global Actions */}
      <div className="srv-header">
        <div>
          <h2>Service Catalogue & Offers</h2>
          <p>Manage Master Services, Pricing, GST Slabs, Bundled Packages & Membership Subscriptions</p>
        </div>

        <div className="srv-header-actions">
          <button type="button" className="srv-btn srv-btn--outline" onClick={() => setIsCategoryModalOpen(true)}>
            + Category
          </button>
          <button type="button" className="srv-btn srv-btn--primary" onClick={handleOpenNewService}>
            + Service
          </button>
          <button type="button" className="srv-btn srv-btn--purple" onClick={() => setIsPackageModalOpen(true)}>
            + Build Package
          </button>
          <button type="button" className="srv-btn srv-btn--gold" onClick={() => setIsMembershipModalOpen(true)}>
            + Membership Plan
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="srv-tabs">
        <button
          type="button"
          className={`srv-tab ${activeTab === 'SERVICES' ? 'active' : ''}`}
          onClick={() => setActiveTab('SERVICES')}
        >
          ✂️ Service Catalogue ({services.length})
        </button>
        <button
          type="button"
          className={`srv-tab ${activeTab === 'PACKAGES' ? 'active' : ''}`}
          onClick={() => setActiveTab('PACKAGES')}
        >
          🎁 Bundled Packages ({packages.length})
        </button>
        <button
          type="button"
          className={`srv-tab ${activeTab === 'MEMBERSHIPS' ? 'active' : ''}`}
          onClick={() => setActiveTab('MEMBERSHIPS')}
        >
          👑 Membership Plans ({memberships.length})
        </button>
      </div>

      {error && (
        <div className="srv-error-banner">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: SERVICE & CATEGORY MANAGER */}
      {activeTab === 'SERVICES' && (
        <div className="srv-content-layout">
          {/* Category Tree Sidebar */}
          <div className="srv-sidebar-card">
            <h4>Service Categories</h4>
            <div className="srv-cat-list">
              <button
                type="button"
                className={`srv-cat-item ${selectedCategoryId === '' ? 'active' : ''}`}
                onClick={() => setSelectedCategoryId('')}
              >
                <span>All Categories</span>
                <span className="srv-cat-count">{allServices.length}</span>
              </button>

              {categories.map((cat) => {
                const catIdStr = String(cat._id || (cat as any).id);
                const count = allServices.filter(
                  (s) => String(s.categoryId) === catIdStr || s.categoryName === cat.name,
                ).length;
                return (
                  <div key={catIdStr} className="srv-cat-group">
                    <button
                      type="button"
                      className={`srv-cat-item ${selectedCategoryId === catIdStr ? 'active' : ''}`}
                      onClick={() => setSelectedCategoryId(catIdStr)}
                    >
                      <span>{cat.name}</span>
                      <span className="srv-cat-count">{count}</span>
                    </button>
                    {cat.subCategories && cat.subCategories.length > 0 && (
                      <div className="srv-subcat-list">
                        {cat.subCategories.map((sub) => (
                          <span key={sub} className="srv-subcat-tag">
                            • {sub}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Service Table View */}
          <div className="srv-main-card">
            <div className="srv-toolbar">
              <input
                type="text"
                placeholder="Search services by name, category, or sub-category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="srv-search-input"
              />
            </div>

            {loading ? (
              <div className="srv-loading">Loading service catalogue...</div>
            ) : services.length === 0 ? (
              <div className="srv-empty-state">
                <p>No services found matching your filter criteria.</p>
                <button type="button" className="srv-btn srv-btn--primary" onClick={handleOpenNewService}>
                  + Add First Service
                </button>
              </div>
            ) : (
              <div className="srv-table-container">
                <table className="srv-table">
                  <thead>
                    <tr>
                      <th>Service Name</th>
                      <th>Category / Sub-Category</th>
                      <th>Price</th>
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
                            {srv.subCategory && <span className="srv-subcat-pill">{srv.subCategory}</span>}
                          </div>
                        </td>
                        <td>
                          <strong className="srv-price-text">₹{srv.price.toLocaleString('en-IN')}</strong>
                        </td>
                        <td>{srv.durationMinutes} mins</td>
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
                              onClick={() => handleOpenEditService(srv)}
                              title="Edit Service"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              className="srv-action-btn delete"
                              onClick={() => deleteService(srv.id)}
                              title="Deactivate Service"
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
        </div>
      )}

      {/* TAB 2: PACKAGES CATALOGUE */}
      {activeTab === 'PACKAGES' && (
        <div className="srv-grid-section">
          {packages.length === 0 ? (
            <div className="srv-empty-state">
              <p>No multi-session packages created yet.</p>
              <button type="button" className="srv-btn srv-btn--purple" onClick={() => setIsPackageModalOpen(true)}>
                + Build First Package
              </button>
            </div>
          ) : (
            <div className="srv-cards-grid">
              {packages.map((pkg) => (
                <div key={pkg._id} className="srv-pkg-card">
                  <div className="srv-pkg-card__header">
                    <span className="srv-discount-badge">{pkg.impliedDiscountPct}% OFF</span>
                    <h3>{pkg.name}</h3>
                    {pkg.description && <p>{pkg.description}</p>}
                  </div>

                  <div className="srv-pkg-card__items">
                    <h5>Included Bundled Services:</h5>
                    <ul>
                      {pkg.serviceItems.map((item, idx) => (
                        <li key={idx}>
                          <span>{item.serviceName}</span>
                          <span className="srv-session-tag">{item.sessionCount} Sessions</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="srv-pkg-card__footer">
                    <div>
                      <span className="srv-validity-text">Valid for {pkg.validityDays} Days</span>
                      <div className="srv-pkg-price">₹{pkg.totalPrice.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MEMBERSHIP PLANS */}
      {activeTab === 'MEMBERSHIPS' && (
        <div className="srv-grid-section">
          {memberships.length === 0 ? (
            <div className="srv-empty-state">
              <p>No membership plans configured yet.</p>
              <button type="button" className="srv-btn srv-btn--gold" onClick={() => setIsMembershipModalOpen(true)}>
                + Build First Membership Plan
              </button>
            </div>
          ) : (
            <div className="srv-cards-grid">
              {memberships.map((mem) => (
                <div key={mem._id} className={`srv-mem-card srv-mem-card--${mem.tierName.toLowerCase()}`}>
                  <div className="srv-mem-card__badge">
                    {mem.tierName === 'SILVER' && '🥈 SILVER TIER'}
                    {mem.tierName === 'GOLD' && '🥇 GOLD TIER'}
                    {mem.tierName === 'PLATINUM' && '💎 PLATINUM TIER'}
                    {mem.tierName === 'VIP' && '👑 VIP PRIVILEGE'}
                  </div>

                  <div className="srv-mem-card__header">
                    <h3>{mem.name}</h3>
                    <div className="srv-mem-discount">{mem.discountPercentage}% Flat Discount</div>
                  </div>

                  <div className="srv-mem-card__body">
                    <p>{mem.description || 'Exclusive membership benefits unlocked upon subscription.'}</p>
                    <div className="srv-mem-validity">Validity: {mem.validityMonths} Months</div>
                  </div>

                  <div className="srv-mem-card__footer">
                    <div className="srv-mem-price">₹{mem.price.toLocaleString('en-IN')}</div>
                    <span className="srv-mem-annual">/ Annual Sub</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddEditCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={addCategory}
      />

      <AddEditServiceModal
        isOpen={isServiceModalOpen}
        categories={categories}
        initialService={editingService}
        onClose={() => {
          setIsServiceModalOpen(false);
          setEditingService(null);
        }}
        onSuccess={async (payload) => {
          if (editingService) {
            await updateService(editingService.id, payload);
          } else {
            await addService(payload);
          }
        }}
      />

      <AddEditPackageModal
        isOpen={isPackageModalOpen}
        services={allServices}
        onClose={() => setIsPackageModalOpen(false)}
        onSuccess={addPackage}
      />

      <AddEditMembershipModal
        isOpen={isMembershipModalOpen}
        services={allServices}
        onClose={() => setIsMembershipModalOpen(false)}
        onSuccess={addMembership}
      />
    </div>
  );
};
