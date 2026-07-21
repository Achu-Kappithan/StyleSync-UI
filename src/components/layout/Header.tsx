import React, { useState } from 'react';
import { MenuIcon, SearchIcon, BellIcon, CalendarIcon, ChevronDownIcon } from '../ui/Icons';
import './Header.css';

export interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  activePage?: string;
  onLogout?: () => void;
}

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  dashboard:    { title: 'Dashboard',    sub: 'Welcome back, Jane!' },
  appointments: { title: 'Appointments', sub: 'Manage your bookings' },
  clients:      { title: 'Clients',      sub: 'Your client base' },
  services:     { title: 'Services',     sub: 'What you offer' },
  staff:        { title: 'Staff',        sub: 'Your team members' },
  inventory:    { title: 'Inventory',    sub: 'Stock & products' },
  analytics:    { title: 'Analytics',    sub: 'Insights & reports' },
  settings:     { title: 'Settings',     sub: 'Account preferences' },
};

export const Header: React.FC<HeaderProps> = ({
  collapsed,
  onToggle,
  activePage = 'dashboard',
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifCount] = useState(3);
  const info = PAGE_TITLES[activePage] || PAGE_TITLES.dashboard;

  return (
    <header
      className="app-header"
      style={{ left: collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w-expanded)' }}
    >
      <div className="app-header__left">
        <button
          id="sidebar-toggle-btn"
          className="app-header__toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <MenuIcon collapsed={collapsed} />
        </button>

        <div className="app-header__breadcrumb">
          <h1 className="app-header__title">{info.title}</h1>
          <p className="app-header__sub">{info.sub}</p>
        </div>
      </div>

      <div className="app-header__search">
        <span className="app-header__search-icon"><SearchIcon /></span>
        <input
          id="header-search"
          type="text"
          className="app-header__search-input"
          placeholder="Search clients, bookings…"
        />
        <kbd className="app-header__search-kbd">⌘K</kbd>
      </div>

      <div className="app-header__right">
        <div className="app-header__date">
          <CalendarIcon />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>

        <button id="notif-btn" className="app-header__icon-btn" aria-label="Notifications">
          <BellIcon />
          {notifCount > 0 && <span className="app-header__badge">{notifCount}</span>}
        </button>

        <div className="app-header__user" onClick={() => setShowUserMenu(v => !v)}>
          <div className="app-header__avatar">JD</div>
          <div className="app-header__user-info">
            <span className="app-header__user-name">Jane Doe</span>
            <span className="app-header__user-role">Salon Owner</span>
          </div>
          <ChevronDownIcon />

          {showUserMenu && (
            <div className="app-header__dropdown" onClick={e => e.stopPropagation()}>
              <div className="app-header__dropdown-header">
                <p className="app-header__dropdown-name">Jane Doe</p>
                <p className="app-header__dropdown-email">jane@stylesync.app</p>
              </div>
              <div className="app-header__dropdown-items">
                <button className="app-header__dropdown-item">My Profile</button>
                <button className="app-header__dropdown-item">Billing</button>
                <button className="app-header__dropdown-item">Notifications</button>
              </div>
              <button
                id="logout-btn"
                className="app-header__dropdown-item app-header__dropdown-item--danger"
                onClick={onLogout}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
