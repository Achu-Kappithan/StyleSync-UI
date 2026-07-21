import React from 'react';
import { TrendUpIcon, TrendDownIcon } from '../../../components/ui/Icons';
import { StatCard } from '../types/dashboard.types';

export interface StatsOverviewProps {
  stats: StatCard[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <div className="dash-stats-grid">
      {stats.map(s => (
        <div key={s.id} className="dash-stat-card">
          <div className="dash-stat-top">
            <span className="dash-stat-icon-wrap" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </span>
            <span className={`dash-stat-badge ${s.up ? 'dash-stat-badge--up' : 'dash-stat-badge--down'}`}>
              {s.up ? <TrendUpIcon /> : <TrendDownIcon />}
              {s.change}
            </span>
          </div>

          <div className="dash-stat-value">{s.value}</div>
          <p className="dash-stat-label">{s.label}</p>
        </div>
      ))}
    </div>
  );
};
