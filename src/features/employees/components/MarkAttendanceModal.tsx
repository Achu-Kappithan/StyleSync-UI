import React, { useState } from 'react';
import { employeeService } from '../services/employee-service';
import './MarkAttendanceModal.css';

interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
  onSuccess: () => void;
}

export const MarkAttendanceModal: React.FC<MarkAttendanceModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  onSuccess,
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<string>('PRESENT');
  const [checkInTime, setCheckInTime] = useState<string>('09:30');
  const [checkOutTime, setCheckOutTime] = useState<string>('18:30');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      setSubmitting(true);
      await employeeService.markAttendance(employeeId, {
        date,
        status,
        checkInTime: status === 'PRESENT' || status === 'HALF_DAY' ? checkInTime : undefined,
        checkOutTime: status === 'PRESENT' || status === 'HALF_DAY' ? checkOutTime : undefined,
        notes: notes.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="emp-modal-backdrop">
      <div className="emp-modal emp-modal--sm">
        <div className="emp-modal__header">
          <div>
            <h3>Mark Daily Attendance</h3>
            <p className="emp-modal__subtitle">Employee: <strong>{employeeName}</strong></p>
          </div>
          <button className="emp-modal__close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="emp-modal__form">
          {errorMessage && <div className="emp-modal__alert emp-modal__alert--error">{errorMessage}</div>}

          <div className="emp-field">
            <label>Business Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="emp-field">
            <label>Attendance Status</label>
            <div className="emp-status-selector">
              <button
                type="button"
                className={`emp-status-btn emp-status-btn--present ${status === 'PRESENT' ? 'emp-status-btn--active' : ''}`}
                onClick={() => setStatus('PRESENT')}
              >
                ✅ Present
              </button>
              <button
                type="button"
                className={`emp-status-btn emp-status-btn--halfday ${status === 'HALF_DAY' ? 'emp-status-btn--active' : ''}`}
                onClick={() => setStatus('HALF_DAY')}
              >
                🌗 Half Day
              </button>
              <button
                type="button"
                className={`emp-status-btn emp-status-btn--absent ${status === 'ABSENT' ? 'emp-status-btn--active' : ''}`}
                onClick={() => setStatus('ABSENT')}
              >
                ❌ Absent
              </button>
              <button
                type="button"
                className={`emp-status-btn emp-status-btn--leave ${status === 'LEAVE' ? 'emp-status-btn--active' : ''}`}
                onClick={() => setStatus('LEAVE')}
              >
                🏖️ Leave
              </button>
              <button
                type="button"
                className={`emp-status-btn emp-status-btn--weekoff ${status === 'WEEK_OFF' ? 'emp-status-btn--active' : ''}`}
                onClick={() => setStatus('WEEK_OFF')}
              >
                🗓️ Weekly Off
              </button>
            </div>
            <p className="emp-subtext" style={{ marginTop: '0.4rem', fontSize: '0.78rem' }}>
              💡 <em>Weekly Off is counted as a paid working day in payroll. Max 1 Weekly Off per week (Mon - Sun).</em>
            </p>
          </div>

          {(status === 'PRESENT' || status === 'HALF_DAY') && (
            <div className="emp-modal__grid">
              <div className="emp-field">
                <label>Check-In Time</label>
                <input
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                />
              </div>

              <div className="emp-field">
                <label>Check-Out Time</label>
                <input
                  type="time"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="emp-field">
            <label>Attendance Remarks / Notes</label>
            <input
              type="text"
              placeholder="e.g. On-time check-in, Manager approved late arrival"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="emp-modal__footer">
            <button type="button" className="emp-btn emp-btn--outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="emp-btn emp-btn--primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
