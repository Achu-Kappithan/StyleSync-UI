import React, { useState, useCallback } from 'react';
import { useAppointments } from '../hooks/use-appointments';
import { Appointment, AppointmentStatus, CreateAppointmentPayload } from '../types/appointment.types';
import { BookAppointmentModal } from '../components/BookAppointmentModal';
import { CancelModal } from '../components/CancelModal';
import './AppointmentsPage.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_META: Record<AppointmentStatus, { label: string; className: string; nextAction: string | null; nextStatus: AppointmentStatus | null }> = {
  PENDING:    { label: 'Pending',     className: 'apt-status--pending',    nextAction: 'Confirm',   nextStatus: 'CONFIRMED' },
  CONFIRMED:  { label: 'Confirmed',   className: 'apt-status--confirmed',  nextAction: 'Start',     nextStatus: 'IN_PROGRESS' },
  IN_PROGRESS:{ label: 'In Progress', className: 'apt-status--inprogress', nextAction: 'Complete',  nextStatus: 'COMPLETED' },
  COMPLETED:  { label: 'Completed',   className: 'apt-status--completed',  nextAction: null,        nextStatus: null },
  CANCELLED:  { label: 'Cancelled',   className: 'apt-status--cancelled',  nextAction: null,        nextStatus: null },
  NO_SHOW:    { label: 'No Show',     className: 'apt-status--noshow',     nextAction: null,        nextStatus: null },
};

const formatTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  return (parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2)).toUpperCase();
};

const isToday = (dateStr: string): boolean => dateStr === new Date().toISOString().split('T')[0];

// ─── Timeline Config ───────────────────────────────────────────────────────────

const TIMELINE_START_HOUR = 8; // 8 AM
const TIMELINE_END_HOUR   = 21; // 9 PM
const SLOT_HEIGHT_PX      = 48; // height of a 30-min slot

// ─── Component ────────────────────────────────────────────────────────────────

export const AppointmentsPage: React.FC = () => {
  const {
    appointments, stats, loading, error,
    selectedDate, viewMode, setViewMode,
    goToPrevDay, goToNextDay, goToToday,
    bookAppointment, advanceStatus, cancelAppointment, refetch,
  } = useAppointments();

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // appt id being actioned

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleAdvance = useCallback(async (appt: Appointment) => {
    const meta = STATUS_META[appt.status];
    if (!meta.nextStatus) return;
    setActionLoading(appt.id);
    try {
      await advanceStatus(appt.id, meta.nextStatus);
    } catch (err: any) {
      alert(err.message ?? 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  }, [advanceStatus]);

  const handleMarkNoShow = useCallback(async (appt: Appointment) => {
    if (!window.confirm(`Mark ${appt.customerName} as No Show?`)) return;
    setActionLoading(appt.id);
    try {
      await advanceStatus(appt.id, 'NO_SHOW', 'Client did not arrive');
    } catch (err: any) {
      alert(err.message ?? 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  }, [advanceStatus]);

  const handleBook = useCallback(async (payload: CreateAppointmentPayload) => {
    await bookAppointment(payload);
    setIsBookingOpen(false);
  }, [bookAppointment]);

  const handleConfirmCancel = useCallback(async (reason: string) => {
    if (!cancelTarget) return;
    await cancelAppointment(cancelTarget.id, reason);
    setCancelTarget(null);
  }, [cancelTarget, cancelAppointment]);

  // ─── Derived: unique employees for timeline ───────────────────────────────

  const uniqueEmployees = Array.from(
    new Map(
      appointments
        .filter((a) => a.employeeId)
        .map((a) => [a.employeeId, { id: a.employeeId!, name: a.employeeName }])
    ).values()
  );

  // ─── Render: KPI Strip ────────────────────────────────────────────────────

  const renderKpi = () => (
    <div className="apt-kpi-strip">
      <div className="apt-kpi-card apt-kpi--total">
        <div className="apt-kpi-value">{stats.total}</div>
        <div className="apt-kpi-label">Total</div>
      </div>
      <div className="apt-kpi-card apt-kpi--pending">
        <div className="apt-kpi-value">{stats.pending}</div>
        <div className="apt-kpi-label">Pending</div>
      </div>
      <div className="apt-kpi-card apt-kpi--confirmed">
        <div className="apt-kpi-value">{stats.confirmed}</div>
        <div className="apt-kpi-label">Confirmed</div>
      </div>
      <div className="apt-kpi-card apt-kpi--inprogress">
        <div className="apt-kpi-value">{stats.inProgress}</div>
        <div className="apt-kpi-label">In Progress</div>
      </div>
      <div className="apt-kpi-card apt-kpi--completed">
        <div className="apt-kpi-value">{stats.completed}</div>
        <div className="apt-kpi-label">Completed</div>
      </div>
      <div className="apt-kpi-card apt-kpi--cancelled">
        <div className="apt-kpi-value">{stats.cancelled + stats.noShow}</div>
        <div className="apt-kpi-label">Cancelled / No-Show</div>
      </div>
    </div>
  );

  // ─── Render: Appointment Card ─────────────────────────────────────────────

  const renderCard = (appt: Appointment) => {
    const meta = STATUS_META[appt.status];
    const isActioning = actionLoading === appt.id;
    const serviceList = appt.serviceSnapshots.map((s) => s.name).join(', ');
    const canCancel = !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(appt.status);

    return (
      <div key={appt.id} className={`apt-card ${meta.className}`}>
        {/* Left: avatar + time */}
        <div className="apt-card__left">
          <div className="apt-card__avatar">{getInitials(appt.customerName)}</div>
          <div className="apt-card__time-block">
            <span className="apt-card__time">{formatTime(appt.scheduledAt)}</span>
            <span className="apt-card__duration">{appt.totalDurationMinutes} min</span>
          </div>
        </div>

        {/* Centre: info */}
        <div className="apt-card__body">
          <div className="apt-card__name">{appt.customerName}</div>
          <div className="apt-card__phone">{appt.customerPhone}</div>
          <div className="apt-card__services">{serviceList}</div>
          <div className="apt-card__meta">
            <span className="apt-card__stylist">👤 {appt.employeeName}</span>
            <span className="apt-card__amount">₹{appt.totalAmount.toLocaleString('en-IN')}</span>
            {appt.bookingType === 'WALK_IN' && (
              <span className="apt-card__walkin-badge">🚶 Walk-in {appt.queueToken}</span>
            )}
          </div>
          {appt.notes && <div className="apt-card__notes">📝 {appt.notes}</div>}
          {appt.cancellationReason && (
            <div className="apt-card__cancel-reason">⚠️ {appt.cancellationReason}</div>
          )}
        </div>

        {/* Right: status + actions */}
        <div className="apt-card__right">
          <span className={`apt-status-badge ${meta.className}`}>{meta.label}</span>

          <div className="apt-card__actions">
            {meta.nextAction && meta.nextStatus && (
              <button
                id={`apt-advance-${appt.id}`}
                className="apt-btn apt-btn--advance"
                onClick={() => handleAdvance(appt)}
                disabled={isActioning}
              >
                {isActioning ? '...' : meta.nextAction}
              </button>
            )}

            {appt.status === 'CONFIRMED' && (
              <button
                id={`apt-noshow-${appt.id}`}
                className="apt-btn apt-btn--noshow"
                onClick={() => handleMarkNoShow(appt)}
                disabled={isActioning}
              >
                No Show
              </button>
            )}

            {canCancel && (
              <button
                id={`apt-cancel-${appt.id}`}
                className="apt-btn apt-btn--cancel"
                onClick={() => setCancelTarget(appt)}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ─── Render: List View ────────────────────────────────────────────────────

  const renderListView = () => {
    if (loading) {
      return (
        <div className="apt-loading">
          <div className="apt-spinner" />
          <p>Loading appointments…</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="apt-error">
          <span>⚠️ {error}</span>
          <button className="apt-btn apt-btn--advance" onClick={refetch}>Retry</button>
        </div>
      );
    }
    if (appointments.length === 0) {
      return (
        <div className="apt-empty">
          <div className="apt-empty__icon">📅</div>
          <h3>No appointments for this day</h3>
          <p>Book a new appointment to get started.</p>
          <button
            id="apt-book-empty"
            className="apt-btn apt-btn--primary"
            onClick={() => setIsBookingOpen(true)}
          >
            + Book Appointment
          </button>
        </div>
      );
    }
    return (
      <div className="apt-list">
        {appointments.map(renderCard)}
      </div>
    );
  };

  // ─── Render: Timeline View ────────────────────────────────────────────────

  const renderTimeline = () => {
    const hours = Array.from(
      { length: TIMELINE_END_HOUR - TIMELINE_START_HOUR },
      (_, i) => TIMELINE_START_HOUR + i,
    );

    const getApptStyle = (appt: Appointment) => {
      const start = new Date(appt.scheduledAt);
      const startOffsetMin = (start.getHours() - TIMELINE_START_HOUR) * 60 + start.getMinutes();
      const top = (startOffsetMin / 30) * SLOT_HEIGHT_PX;
      const height = Math.max((appt.totalDurationMinutes / 30) * SLOT_HEIGHT_PX - 4, 24);
      return { top: `${top}px`, height: `${height}px` };
    };

    return (
      <div className="apt-timeline">
        {/* Time axis */}
        <div className="apt-timeline__axis">
          <div className="apt-timeline__axis-header" />
          {hours.map((h) => (
            <div key={h} className="apt-timeline__slot-label">
              {h === 12 ? '12 PM' : h < 12 ? `${h} AM` : `${h - 12} PM`}
            </div>
          ))}
        </div>

        {/* Stylist columns */}
        {timelineColumns.map(({ id, name }) => {
          const empAppts = id === 'unassigned'
            ? appointments.filter((a) => !a.employeeId)
            : appointments.filter((a) => a.employeeId === id);

          return (
            <div key={id} className={`apt-timeline__col ${id === 'unassigned' ? 'apt-timeline__col--unassigned' : ''}`}>
              <div className="apt-timeline__col-header">
                <div className="apt-timeline__col-avatar">
                  {id === 'unassigned' ? '⏳' : getInitials(name)}
                </div>
                <span>{name}</span>
              </div>
              <div className="apt-timeline__col-body">
                {hours.map((h) => (
                  <div key={h} className="apt-timeline__hour-row" />
                ))}
                {empAppts.map((appt) => {
                  const meta = STATUS_META[appt.status];
                  return (
                    <div
                      key={appt.id}
                      className={`apt-timeline__block ${meta.className}`}
                      style={getApptStyle(appt)}
                      title={`${appt.customerName} — ${appt.serviceSnapshots.map((s) => s.name).join(', ')}`}
                    >
                      <div className="apt-timeline__block-name">{appt.customerName}</div>
                      <div className="apt-timeline__block-svc">
                        {appt.serviceSnapshots[0]?.name}
                        {appt.serviceSnapshots.length > 1 && ` +${appt.serviceSnapshots.length - 1}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {timelineColumns.length === 0 && (
          <div className="apt-timeline__empty">
            No appointments to display in timeline view for this date.
          </div>
        )}
      </div>
    );
  };

  // ─── Main Render ──────────────────────────────────────────────────────────

  return (
    <div className="apt-page">
      {/* Page Header */}
      <div className="apt-page__header">
        <div>
          <div className="apt-badge-title">📅 APPOINTMENT MANAGEMENT</div>
          <h2>Appointments</h2>
          <p>Schedule, track, and manage all salon appointments in real time</p>
        </div>
        <button
          id="apt-book-btn"
          className="apt-btn apt-btn--primary"
          onClick={() => setIsBookingOpen(true)}
        >
          + Book Appointment
        </button>
      </div>

      {/* KPI Strip */}
      {renderKpi()}

      {/* Toolbar: Date nav + View toggle */}
      <div className="apt-toolbar">
        <div className="apt-date-nav">
          <button id="apt-prev-day" className="apt-nav-btn" onClick={goToPrevDay} title="Previous day">
            ‹
          </button>
          <div className="apt-date-display">
            <span className="apt-date-label">
              {isToday(selectedDate) ? '📅 Today — ' : ''}{formatDate(selectedDate)}
            </span>
          </div>
          <button id="apt-next-day" className="apt-nav-btn" onClick={goToNextDay} title="Next day">
            ›
          </button>
          {!isToday(selectedDate) && (
            <button id="apt-today-btn" className="apt-today-btn" onClick={goToToday}>
              Today
            </button>
          )}
        </div>

        <div className="apt-view-toggle">
          <button
            id="apt-view-list"
            className={`apt-toggle-btn ${viewMode === 'list' ? 'apt-toggle-btn--active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            ☰ List
          </button>
          <button
            id="apt-view-timeline"
            className={`apt-toggle-btn ${viewMode === 'timeline' ? 'apt-toggle-btn--active' : ''}`}
            onClick={() => setViewMode('timeline')}
          >
            📊 Timeline
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="apt-content">
        {viewMode === 'list' ? renderListView() : renderTimeline()}
      </div>

      {/* Modals */}
      {isBookingOpen && (
        <BookAppointmentModal
          selectedDate={selectedDate}
          onBook={handleBook}
          onClose={() => setIsBookingOpen(false)}
        />
      )}
      {cancelTarget && (
        <CancelModal
          appointment={cancelTarget}
          onConfirm={handleConfirmCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
};
