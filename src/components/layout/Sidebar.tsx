import React from 'react';
import {
  ScissorsIcon,
  CalendarIcon,
  UserIcon,
  BellIcon,
  SearchIcon,
} from '../ui/Icons';
import './Sidebar.css';

export interface SidebarProps {
  collapsed: boolean;
  activeItem?: string;
  onItemClick?: (id: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',    icon: 'dashboard' },
  { id: 'appointments', label: 'Appointments', icon: 'calendar' },
  { id: 'clients',      label: 'Clients',      icon: 'clients' },
  { id: 'services',     label: 'Services',     icon: 'scissors' },
  { id: 'staff',        label: 'Staff',        icon: 'staff' },
  { id: 'inventory',    label: 'Inventory',    icon: 'inventory' },
  { id: 'analytics',    label: 'Analytics',    icon: 'analytics' },
];

const renderNavIcon = (iconType: string) => {
  switch (iconType) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      );
    case 'calendar':
      return <CalendarIcon size={18} />;
    case 'clients':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      );
    case 'scissors':
      return <ScissorsIcon size={18} />;
    case 'staff':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>
        </svg>
      );
    case 'inventory':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      );
    case 'analytics':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      );
    default:
      return null;
  }
};

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  activeItem = 'dashboard',
  onItemClick,
}) => {
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : 'sidebar--expanded'}`}>
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <ScissorsIcon size={20} />
        </div>
        {!collapsed && (
          <span className="sidebar__logo-text">
            Style<span>Sync</span>
          </span>
        )}
      </div>

      {!collapsed && <p className="sidebar__section-label">MAIN MENU</p>}

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`sidebar__item ${activeItem === item.id ? 'sidebar__item--active' : ''}`}
            onClick={() => onItemClick?.(item.id)}
            title={collapsed ? item.label : ''}
          >
            <span className="sidebar__item-icon">{renderNavIcon(item.icon)}</span>
            {!collapsed && <span className="sidebar__item-label">{item.label}</span>}
            {!collapsed && activeItem === item.id && (
              <span className="sidebar__item-indicator" />
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar__spacer" />

      {!collapsed && <p className="sidebar__section-label">PREFERENCES</p>}
      <button
        id="nav-settings"
        className={`sidebar__item ${activeItem === 'settings' ? 'sidebar__item--active' : ''}`}
        onClick={() => onItemClick?.('settings')}
        title={collapsed ? 'Settings' : ''}
      >
        <span className="sidebar__item-icon">{renderNavIcon('settings')}</span>
        {!collapsed && <span className="sidebar__item-label">Settings</span>}
      </button>

      {!collapsed && (
        <div className="sidebar__user">
          <div className="sidebar__user-avatar">JD</div>
          <div className="sidebar__user-info">
            <p className="sidebar__user-name">Jane Doe</p>
            <p className="sidebar__user-role">Salon Owner</p>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="sidebar__user-avatar sidebar__user-avatar--sm">JD</div>
      )}
    </aside>
  );
};
