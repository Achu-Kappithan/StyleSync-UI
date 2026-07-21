import React from 'react';
import { ServiceMetric } from '../types/dashboard.types';

export interface TopServicesProps {
  services: ServiceMetric[];
}

export const TopServices: React.FC<TopServicesProps> = ({ services }) => {
  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <div>
          <h2 className="dash-card-title">Top Services</h2>
          <p className="dash-card-sub">Most requested services this month</p>
        </div>
        <select className="dash-select" defaultValue="this_month">
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
        </select>
      </div>

      <div className="dash-services-list">
        {services.map(srv => (
          <div key={srv.name} className="dash-service-item">
            <div className="dash-service-info">
              <span className="dash-service-name">{srv.name}</span>
              <span className="dash-service-count">{srv.count} bookings</span>
            </div>
            <div className="dash-progress-track">
              <div
                className="dash-progress-fill"
                style={{ width: `${srv.pct}%`, background: srv.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
