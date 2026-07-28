import React, { useState } from 'react';
import { useServices } from '../hooks/use-services';
import { AddEditPackageModal } from '../components/AddEditPackageModal';
import { serviceCatalogService } from '../services/service-catalog-service';
import './PackagesPage.css';

export const PackagesPage: React.FC = () => {
  const { packages, allServices, refetch, addPackage } = useServices();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const filteredPackages = packages.filter((pkg) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase().trim();
    const matchName = pkg.name.toLowerCase().includes(term);
    const matchSrv = pkg.serviceItems.some((s) => s.serviceName.toLowerCase().includes(term));
    return matchName || matchSrv;
  });

  const totalSessions = packages.reduce(
    (sum, p) => sum + p.serviceItems.reduce((sSum, item) => sSum + item.sessionCount, 0),
    0,
  );

  const avgDiscount =
    packages.length > 0
      ? Math.round(packages.reduce((sum, p) => sum + (p.impliedDiscountPct || 0), 0) / packages.length)
      : 0;

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate package '${name}'?`)) return;
    try {
      await serviceCatalogService.deletePackage(id);
      await refetch();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not delete package');
    }
  };

  return (
    <div className="pkg-page">
      {/* Top Header */}
      <div className="pkg-header">
        <div>
          <div className="pkg-badge-title">🎁 MULTI-SESSION OFFERING ENGINE</div>
          <h2>Bundled Packages</h2>
          <p>Create and manage multi-session bundled service packages with dynamic discounts</p>
        </div>
        <button
          type="button"
          className="srv-btn srv-btn--purple"
          onClick={() => setIsModalOpen(true)}
        >
          + Build New Package
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="pkg-stats-grid">
        <div className="pkg-stat-card">
          <div className="pkg-stat-icon">🎁</div>
          <div>
            <span className="pkg-stat-label">Active Packages</span>
            <div className="pkg-stat-value">{packages.length}</div>
          </div>
        </div>
        <div className="pkg-stat-card">
          <div className="pkg-stat-icon">🏷️</div>
          <div>
            <span className="pkg-stat-label">Average Savings</span>
            <div className="pkg-stat-value">{avgDiscount}% OFF</div>
          </div>
        </div>
        <div className="pkg-stat-card">
          <div className="pkg-stat-icon">✨</div>
          <div>
            <span className="pkg-stat-label">Bundled Sessions</span>
            <div className="pkg-stat-value">{totalSessions} Sessions</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="srv-error-banner">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="pkg-card">
        <div className="pkg-toolbar">
          <div className="pkg-search-box">
            <span className="pkg-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search packages by title or included service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pkg-search-input"
            />
          </div>
          <span className="pkg-count-indicator">Showing {filteredPackages.length} Packages</span>
        </div>

        {filteredPackages.length === 0 ? (
          <div className="srv-empty-state">
            <span>🎁</span>
            <p>No packages found. Click "+ Build New Package" to create your first package offer.</p>
            <button type="button" className="srv-btn srv-btn--purple" onClick={() => setIsModalOpen(true)}>
              + Build New Package
            </button>
          </div>
        ) : (
          <div className="srv-cards-grid">
            {filteredPackages.map((pkg) => (
              <div key={pkg._id} className="srv-pkg-card">
                <div className="srv-pkg-card__header">
                  <div className="srv-pkg-badge-row">
                    <span className="srv-discount-badge">{pkg.impliedDiscountPct}% OFF SAVINGS</span>
                    <span className="srv-status-tag">Active</span>
                  </div>
                  <h3>{pkg.name}</h3>
                  <p>{pkg.description || 'Includes multi-session service bundle with dedicated client savings.'}</p>
                </div>

                <div className="srv-pkg-card__items">
                  <h5>BUNDLED SERVICES BREAKDOWN</h5>
                  <ul>
                    {pkg.serviceItems.map((item, idx) => (
                      <li key={idx}>
                        <span className="srv-item-name">{item.serviceName}</span>
                        <span className="srv-session-tag">{item.sessionCount} Sessions</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="srv-pkg-card__footer">
                  <div>
                    <span className="srv-validity-text">📅 Valid for {pkg.validityDays} Days</span>
                    <div className="srv-pkg-price">₹{pkg.totalPrice.toLocaleString('en-IN')}</div>
                  </div>
                  <button
                    type="button"
                    className="srv-action-btn delete"
                    onClick={() => handleDelete(pkg._id, pkg.name)}
                  >
                    🗑️ Deactivate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddEditPackageModal
        isOpen={isModalOpen}
        services={allServices}
        onClose={() => setIsModalOpen(false)}
        onSuccess={async (payload) => {
          await addPackage(payload);
          await refetch();
        }}
      />
    </div>
  );
};
