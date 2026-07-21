import React from 'react';
import { Appointment } from '../types/dashboard.types';

export interface AppointmentListProps {
  appointments: Appointment[];
}

const STATUS_COLOR: Record<string, { bg: string; text: string; label: string }> = {
  confirmed:     { bg: 'rgba(0,201,167,0.12)',  text: '#00c9a7',  label: 'Confirmed' },
  'in-progress': { bg: 'rgba(249,167,110,0.12)', text: '#f9a76e', label: 'In Progress' },
  pending:       { bg: 'rgba(249,110,154,0.12)', text: '#f96e9a', label: 'Pending' },
};

export const AppointmentList: React.FC<AppointmentListProps> = ({ appointments }) => {
  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <div>
          <h2 className="dash-card-title">Today's Schedule</h2>
          <p className="dash-card-sub">{appointments.length} appointments queued for today</p>
        </div>
        <button className="dash-btn-action">+ New Booking</button>
      </div>

      <div className="dash-table-wrapper">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Service</th>
              <th>Time</th>
              <th>Stylist</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(apt => {
              const st = STATUS_COLOR[apt.status] || STATUS_COLOR.confirmed;
              return (
                <tr key={apt.id}>
                  <td>
                    <div className="dash-client-cell">
                      <div className="dash-avatar">{apt.avatar}</div>
                      <span className="dash-client-name">{apt.client}</span>
                    </div>
                  </td>
                  <td><span className="dash-td-muted">{apt.service}</span></td>
                  <td><span className="dash-td-muted">{apt.time}</span></td>
                  <td><span className="dash-td-muted">{apt.staff}</span></td>
                  <td>
                    <span
                      className="dash-status-pill"
                      style={{ background: st.bg, color: st.text }}
                    >
                      {st.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
