import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomerProfile } from '../hooks/use-customers';
import { customerService } from '../services/customer-service';
import { AddEditCustomerModal } from '../components/AddEditCustomerModal';
import './Customer360ProfilePage.css';

type TabType = 'overview' | 'history' | 'notes' | 'loyalty' | 'packages' | 'images';

export const Customer360ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customer, history, notes, loyalty, images, loading, error, refetch, addNote, addImage } =
    useCustomerProfile(id);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // New Note Form State
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [isMedicalNote, setIsMedicalNote] = useState<boolean>(false);
  const [addingNote, setAddingNote] = useState<boolean>(false);

  // New Image Form State
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageCaption, setImageCaption] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    try {
      setAddingNote(true);
      await addNote(newNoteText.trim(), isMedicalNote);
      setNewNoteText('');
      setIsMedicalNote(false);
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleAddImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    try {
      setUploadingImage(true);
      await addImage(imageUrl.trim(), imageCaption.trim() || undefined);
      setImageUrl('');
      setImageCaption('');
    } catch (err: any) {
      alert(err.message || 'Failed to upload photo');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customer) return;
    if (window.confirm(`Are you sure you want to scrub and soft-delete ${customer.name}'s data per DPDP Act right-to-erasure?`)) {
      try {
        await customerService.deleteCustomer(customer.id);
        alert('Customer record soft-deleted and anonymized successfully.');
        navigate('/dashboard/clients');
      } catch (err: any) {
        alert(err.message || 'Failed to delete customer profile.');
      }
    }
  };

  if (loading) {
    return (
      <div className="cust-360-loading">
        <div className="cust-spinner" />
        <span>Loading Customer 360° Profile...</span>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="cust-360-error">
        <h3>Customer Profile Not Found</h3>
        <p>{error || 'The requested customer profile could not be loaded.'}</p>
        <button className="cust-btn cust-btn--secondary" onClick={() => navigate('/dashboard/clients')}>
          ← Back to Customer List
        </button>
      </div>
    );
  }

  const isVIP = customer.tags?.includes('VIP') || customer.lifetimeValue > 20000;
  const initials = customer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="cust-360-container">
      {/* NAVIGATION BAR */}
      <div className="cust-360-nav">
        <button className="cust-btn cust-btn--outline cust-btn--sm" onClick={() => navigate('/dashboard/clients')}>
          ← Back to Customers
        </button>
        <div className="cust-360-actions">
          <button className="cust-btn cust-btn--secondary cust-btn--sm" onClick={() => navigate(`/dashboard/appointments?customerId=${customer.id}`)}>
            📅 Book Appointment
          </button>
          <button className="cust-btn cust-btn--secondary cust-btn--sm" onClick={() => navigate(`/dashboard/billing?customerId=${customer.id}`)}>
            🧾 Create Bill
          </button>
          <button className="cust-btn cust-btn--outline cust-btn--sm" onClick={() => setIsEditModalOpen(true)}>
            ✏️ Edit Profile
          </button>
          <button className="cust-btn cust-btn--danger cust-btn--sm" onClick={handleDeleteCustomer}>
            🗑️ DPDP Erasure
          </button>
        </div>
      </div>

      {/* MEDICAL ALLERGY WARNING BANNER */}
      {customer.medicalNotes && (
        <div className="cust-allergy-banner">
          <div className="cust-allergy-icon">⚠️</div>
          <div>
            <strong>MEDICAL / ALLERGY WARNING:</strong>{' '}
            {customer.medicalNotes === 'RESTRICTED_MEDICAL_NOTE'
              ? 'This customer has registered allergy/medical warnings. (Restricted Access — Manager view required for full text).'
              : customer.medicalNotes}
          </div>
        </div>
      )}

      {/* HEADER CARD */}
      <div className="cust-360-header">
        <div className="cust-360-profile-info">
          <div className={`cust-360-avatar ${isVIP ? 'cust-360-avatar--vip' : ''}`}>
            {initials}
          </div>
          <div>
            <div className="cust-360-title-row">
              <h2>{customer.name}</h2>
              {isVIP && <span className="cust-badge cust-badge--vip">VIP CUSTOMER</span>}
              {customer.status === 'inactive' && <span className="cust-badge">INACTIVE</span>}
            </div>
            <p className="cust-360-sub">
              📱 +91 {customer.phone} {customer.email ? `• ✉️ ${customer.email}` : ''}
            </p>
            <div className="cust-360-tags">
              {customer.tags?.map((t) => (
                <span key={t} className="cust-tag-pill">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* COMPUTED DERIVED STATS STRIP */}
        <div className="cust-360-stats">
          <div className="cust-stat-box">
            <span className="cust-stat-label">Lifetime Value</span>
            <span className="cust-stat-val cust-stat-val--green">{formatCurrency(customer.lifetimeValue)}</span>
          </div>
          <div className="cust-stat-box">
            <span className="cust-stat-label">Total Visits</span>
            <span className="cust-stat-val">{customer.totalVisits}</span>
          </div>
          <div className="cust-stat-box">
            <span className="cust-stat-label">Last Visit</span>
            <span className="cust-stat-val">{formatDate(customer.lastVisitDate)}</span>
          </div>
          <div className="cust-stat-box">
            <span className="cust-stat-label">Loyalty Points</span>
            <span className="cust-stat-val cust-stat-val--gold">⭐ {customer.loyaltyPoints || 0} pts</span>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION STRIP */}
      <div className="cust-tabs">
        <button className={`cust-tab ${activeTab === 'overview' ? 'cust-tab--active' : ''}`} onClick={() => setActiveTab('overview')}>
          Overview
        </button>
        <button className={`cust-tab ${activeTab === 'history' ? 'cust-tab--active' : ''}`} onClick={() => setActiveTab('history')}>
          Visit Timeline ({history.length})
        </button>
        <button className={`cust-tab ${activeTab === 'notes' ? 'cust-tab--active' : ''}`} onClick={() => setActiveTab('notes')}>
          Staff Notes ({notes.length})
        </button>
        <button className={`cust-tab ${activeTab === 'loyalty' ? 'cust-tab--active' : ''}`} onClick={() => setActiveTab('loyalty')}>
          Loyalty & Wallet
        </button>
        <button className={`cust-tab ${activeTab === 'packages' ? 'cust-tab--active' : ''}`} onClick={() => setActiveTab('packages')}>
          Packages
        </button>
        <button className={`cust-tab ${activeTab === 'images' ? 'cust-tab--active' : ''}`} onClick={() => setActiveTab('images')}>
          Service Gallery ({images.length})
        </button>
      </div>

      {/* TAB CONTENTS */}
      <div className="cust-tab-body">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="cust-overview-grid">
            <div className="cust-info-card">
              <h4>Contact & Personal Details</h4>
              <div className="cust-detail-row">
                <span className="cust-detail-label">Full Name</span>
                <span>{customer.name}</span>
              </div>
              <div className="cust-detail-row">
                <span className="cust-detail-label">Phone</span>
                <span>+91 {customer.phone}</span>
              </div>
              <div className="cust-detail-row">
                <span className="cust-detail-label">Email</span>
                <span>{customer.email || '—'}</span>
              </div>
              <div className="cust-detail-row">
                <span className="cust-detail-label">Gender</span>
                <span>{customer.gender || 'Not specified'}</span>
              </div>
              <div className="cust-detail-row">
                <span className="cust-detail-label">Date of Birth</span>
                <span>{formatDate(customer.dob)}</span>
              </div>
              <div className="cust-detail-row">
                <span className="cust-detail-label">Anniversary</span>
                <span>{formatDate(customer.anniversary)}</span>
              </div>
            </div>

            <div className="cust-info-card">
              <h4>Preferences & Tax Info</h4>
              <div className="cust-detail-row">
                <span className="cust-detail-label">Referral Source</span>
                <span>{customer.referralSource || 'Direct walk-in'}</span>
              </div>
              <div className="cust-detail-row">
                <span className="cust-detail-label">GSTIN</span>
                <span>{customer.gstin || 'No GST Registered'}</span>
              </div>
              <div className="cust-detail-row">
                <span className="cust-detail-label">Household Link Note</span>
                <span>{customer.householdNote || 'None'}</span>
              </div>
              <div className="cust-detail-row">
                <span className="cust-detail-label">Registration Date</span>
                <span>{formatDate(customer.createdAt)}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HISTORY TIMELINE */}
        {activeTab === 'history' && (
          <div className="cust-history-timeline">
            {history.length === 0 ? (
              <p className="cust-subtext">No historical transactions or appointments recorded yet.</p>
            ) : (
              history.map((h) => (
                <div key={h.id} className="cust-timeline-item">
                  <div className="cust-timeline-icon">
                    {h.eventType === 'BILL' ? '🧾' : h.eventType === 'APPOINTMENT' ? '📅' : h.eventType === 'LOYALTY_ADJUSTMENT' ? '⭐' : '📝'}
                  </div>
                  <div className="cust-timeline-content">
                    <div className="cust-timeline-header">
                      <strong>{h.title}</strong>
                      <span className="cust-subtext">{formatDate(h.timestamp)}</span>
                    </div>
                    {h.description && <p className="cust-timeline-desc">{h.description}</p>}
                    {h.amount !== undefined && h.amount !== null && (
                      <span className="cust-timeline-amount">Amount: {formatCurrency(h.amount)}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: NOTES & MEDICAL WARNINGS */}
        {activeTab === 'notes' && (
          <div className="cust-notes-section">
            {/* ADD NOTE FORM */}
            <form onSubmit={handleAddNoteSubmit} className="cust-add-note-card">
              <h4>Add New Staff / Service Note</h4>
              <textarea
                rows={3}
                placeholder="Enter client service preferences, formula details, or internal notes..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                required
              />
              <div className="cust-note-form-footer">
                <label className="cust-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isMedicalNote}
                    onChange={(e) => setIsMedicalNote(e.target.checked)}
                  />
                  Mark as Sensitive Medical / Allergy Note ⚠️
                </label>
                <button type="submit" className="cust-btn cust-btn--primary cust-btn--sm" disabled={addingNote}>
                  {addingNote ? 'Adding...' : 'Save Note'}
                </button>
              </div>
            </form>

            {/* NOTES LIST */}
            <div className="cust-notes-list">
              {notes.map((n) => (
                <div key={n._id} className={`cust-note-card ${n.isMedical ? 'cust-note-card--medical' : ''}`}>
                  <div className="cust-note-header">
                    <strong>{n.authorName}</strong>
                    <span>{formatDate(n.createdAt)}</span>
                  </div>
                  <p className="cust-note-body">
                    {n.note === 'RESTRICTED_MEDICAL_NOTE'
                      ? '⚠️ [RESTRICTED MEDICAL NOTE — Permission Required]'
                      : n.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: LOYALTY & WALLET */}
        {activeTab === 'loyalty' && (
          <div className="cust-loyalty-section">
            <div className="cust-loyalty-card">
              <h3>⭐ Loyalty Wallet Summary</h3>
              <div className="cust-loyalty-metrics">
                <div>
                  <span className="cust-subtext">Active Points Balance</span>
                  <span className="cust-stat-val cust-stat-val--gold">{loyalty?.loyaltyPoints || customer.loyaltyPoints} Points</span>
                </div>
                <div>
                  <span className="cust-subtext">Lifetime Spend</span>
                  <span className="cust-stat-val cust-stat-val--green">{formatCurrency(loyalty?.lifetimeValue || customer.lifetimeValue)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PACKAGES */}
        {activeTab === 'packages' && (
          <div className="cust-packages-section">
            <p className="cust-subtext">No active prepaid packages or salon memberships found for this customer.</p>
          </div>
        )}

        {/* TAB 6: SERVICE GALLERY */}
        {activeTab === 'images' && (
          <div className="cust-images-section">
            <form onSubmit={handleAddImageSubmit} className="cust-add-image-form">
              <input
                type="url"
                placeholder="Paste image URL (e.g. hair transformation / style photo)..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Caption (e.g. Balayage Color Formula #4B)"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
              />
              <button type="submit" className="cust-btn cust-btn--primary cust-btn--sm" disabled={uploadingImage}>
                {uploadingImage ? 'Uploading...' : 'Add Photo'}
              </button>
            </form>

            <div className="cust-images-grid">
              {images.map((img) => (
                <div key={img._id} className="cust-image-card">
                  <img src={img.imageUrl} alt={img.caption || 'Customer service'} />
                  {img.caption && <p className="cust-image-caption">{img.caption}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      <AddEditCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialCustomer={customer}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
