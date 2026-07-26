import React, { useState } from 'react';
import { MenuIcon, SearchIcon, BellIcon, CalendarIcon, ChevronDownIcon } from '../ui/Icons';
import { useTheme } from '../../hooks/useTheme';
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

const ROLE_LABELS: Record<string, string> = {
  SALON_OWNER: 'Salon Owner',
  ADMIN: 'Administrator',
  MANAGER: 'Operations Manager',
  ACCOUNTANT: 'Financial Manager',
  RECEPTIONIST: 'Front Desk',
  STAFF: 'Stylist / Staff',
};

const getInitials = (name: string): string => {
  if (!name) return 'SS';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

export const Header: React.FC<HeaderProps> = ({
  collapsed,
  onToggle,
  activePage = 'dashboard',
  onLogout,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifCount] = useState(3);

  // Read session user profile
  let user: { fullName?: string; email?: string; role?: string } | null = null;
  try {
    const raw = sessionStorage.getItem('ss_user');
    if (raw) user = JSON.parse(raw);
  } catch {
    user = null;
  }

  const rawRole = (user?.role || 'SALON_OWNER').toUpperCase();
  const userName = user?.fullName || 'Salon User';
  const userEmail = user?.email || 'user@stylesync.app';
  const roleTitle = ROLE_LABELS[rawRole] || 'Salon Owner';
  const initials = getInitials(userName);

  const info = PAGE_TITLES[activePage] || {
    title: 'Dashboard',
    sub: `Welcome back, ${userName.split(' ')[0]}!`,
  };
  const subText = activePage === 'dashboard' ? `Welcome back, ${userName.split(' ')[0]}!` : info.sub;

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
          <p className="app-header__sub">{subText}</p>
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

        {/* Theme Toggle Button */}
        <button
          id="theme-toggle-btn"
          className="app-header__icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
          aria-label="Toggle Theme"
        >
          <span>{isDark ? '☀️' : '🌙'}</span>
        </button>

        <button id="notif-btn" className="app-header__icon-btn" aria-label="Notifications">
          <BellIcon />
          {notifCount > 0 && <span className="app-header__badge">{notifCount}</span>}
        </button>

        <div className="app-header__user" onClick={() => setShowUserMenu(v => !v)}>
          <div className="app-header__avatar">{initials}</div>
          <div className="app-header__user-info">
            <span className="app-header__user-name">{userName}</span>
            <span className="app-header__user-role">{roleTitle}</span>
          </div>
          <ChevronDownIcon />

          {showUserMenu && (
            <div className="app-header__dropdown" onClick={e => e.stopPropagation()}>
              <div className="app-header__dropdown-header">
                <p className="app-header__dropdown-name">{userName}</p>
                <p className="app-header__dropdown-email">{userEmail}</p>
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
