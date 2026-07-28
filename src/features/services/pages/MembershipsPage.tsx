import React, { useState } from 'react';
import { useServices } from '../hooks/use-services';
import { AddEditMembershipModal } from '../components/AddEditMembershipModal';
import { serviceCatalogService } from '../services/service-catalog-service';
import './MembershipsPage.css';

export const MembershipsPage: React.FC = () => {
  const { memberships, allServices, refetch, addMembership } = useServices();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const filteredMemberships = memberships.filter((mem) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase().trim();
    return mem.name.toLowerCase().includes(term) || mem.tierName.toLowerCase().includes(term);
  });

  const maxDiscount =
    memberships.length > 0 ? Math.max(...memberships.map((m) => m.discountPercentage || 0)) : 0;

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate membership plan '${name}'?`)) return;
    try {
      await serviceCatalogService.deleteMembership(id);
      await refetch();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not delete membership plan');
    }
  };

  return (
    <div className="mem-page">
      {/* Top Header */}
      <div className="mem-header">
        <div>
          <div className="mem-badge-title">👑 CLIENT SUBSCRIPTION & PRIVILEGES</div>
          <h2>Membership Plans</h2>
          <p>Configure time-bound subscription tiers unlocking flat client discounts and VIP perks</p>
        </div>
        <button
          type="button"
          className="srv-btn srv-btn--gold"
          onClick={() => setIsModalOpen(true)}
        >
          + Build Membership Plan
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="mem-stats-grid">
        <div className="mem-stat-card">
          <div className="mem-stat-icon">👑</div>
          <div>
            <span className="mem-stat-label">Configured Tiers</span>
            <div className="mem-stat-value">{memberships.length} Plans</div>
          </div>
        </div>
        <div className="mem-stat-card">
          <div className="mem-stat-icon">🏷️</div>
          <div>
            <span className="mem-stat-label">Max VIP Discount</span>
            <div className="mem-stat-value">{maxDiscount}% Flat</div>
          </div>
        </div>
        <div className="mem-stat-card">
          <div className="mem-stat-icon">🌟</div>
          <div>
            <span className="mem-stat-label">Subscriber Perks</span>
            <div className="mem-stat-value">Unlimited Use</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="srv-error-banner">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="mem-card">
        <div className="mem-toolbar">
          <div className="mem-search-box">
            <span className="mem-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search membership plans by tier name or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mem-search-input"
            />
          </div>
          <span className="mem-count-indicator">Showing {filteredMemberships.length} Tiers</span>
        </div>

        {filteredMemberships.length === 0 ? (
          <div className="srv-empty-state">
            <span>👑</span>
            <p>No membership plans found. Click "+ Build Membership Plan" to create your first tier.</p>
            <button type="button" className="srv-btn srv-btn--gold" onClick={() => setIsModalOpen(true)}>
              + Build Membership Plan
            </button>
          </div>
        ) : (
          <div className="srv-cards-grid">
            {filteredMemberships.map((mem) => (
              <div key={mem._id} className={`srv-mem-card srv-mem-card--${mem.tierName.toLowerCase()}`}>
                <div className="srv-mem-card__badge-row">
                  <span className="srv-mem-tier-tag">
                    {mem.tierName === 'SILVER' && '🥈 SILVER TIER'}
                    {mem.tierName === 'GOLD' && '🥇 GOLD TIER'}
                    {mem.tierName === 'PLATINUM' && '💎 PLATINUM TIER'}
                    {mem.tierName === 'VIP' && '👑 VIP PRIVILEGE'}
                  </span>
                  <span className="srv-status-tag">Active</span>
                </div>

                <div className="srv-mem-card__header">
                  <h3>{mem.name}</h3>
                  <div className="srv-mem-discount">
                    <span>{mem.discountPercentage}% OFF</span>
                    <span className="srv-mem-discount-sub">On All Catalogue Services</span>
                  </div>
                </div>

                <div className="srv-mem-card__body">
                  <p>{mem.description || 'Unlocks flat client discounts on every billing checkout.'}</p>
                  <div className="srv-mem-feature">
                    <span>⏱️ Subscription Term:</span>
                    <strong>{mem.validityMonths} Months</strong>
                  </div>
                </div>

                <div className="srv-mem-card__footer">
                  <div>
                    <div className="srv-mem-price">₹{mem.price.toLocaleString('en-IN')}</div>
                    <span className="srv-mem-annual">/ Subscription Plan</span>
                  </div>
                  <button
                    type="button"
                    className="srv-action-btn delete"
                    onClick={() => handleDelete(mem._id, mem.name)}
                  >
                    🗑️ Deactivate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddEditMembershipModal
        isOpen={isModalOpen}
        services={allServices}
        onClose={() => setIsModalOpen(false)}
        onSuccess={async (payload) => {
          await addMembership(payload);
          await refetch();
        }}
      />
    </div>
  );
};
