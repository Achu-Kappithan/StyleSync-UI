import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../../../components/layout/Sidebar';
import { Header } from '../../../components/layout/Header';
import { StatsOverview } from '../components/StatsOverview';
import { AppointmentList } from '../components/AppointmentList';
import { TopServices } from '../components/TopServices';
import { UsersPage } from '../../users/pages/UsersPage';
import { CustomerListPage } from '../../customers/pages/CustomerListPage';
import { Customer360ProfilePage } from '../../customers/pages/Customer360ProfilePage';
import { StaffListPage } from '../../employees/pages/StaffListPage';
import { StaffProfilePage } from '../../employees/pages/StaffProfilePage';

import { ServicesPage } from '../../services/pages/ServicesPage';
import { CategoriesPage } from '../../services/pages/CategoriesPage';
import { PackagesPage } from '../../services/pages/PackagesPage';
import { MembershipsPage } from '../../services/pages/MembershipsPage';

import { useAuth } from '../../auth/hooks/useAuth';
import { StatCard, Appointment, ServiceMetric } from '../types/dashboard.types';
import './Dashboard.css';

const STATS: StatCard[] = [
  { id: 'bookings',  label: "Today's Bookings", value: '24',     change: '+12%', up: true,  color: '#00c9a7', bg: 'rgba(0,201,167,0.1)',  icon: '📅' },
  { id: 'revenue',   label: 'Monthly Revenue',  value: '₹8,24,000', change: '+8.4%', up: true,  color: '#7c6ef9', bg: 'rgba(124,110,249,0.1)', icon: '💰' },
  { id: 'clients',   label: 'Active Clients',   value: '312',    change: '+5%',  up: true,  color: '#f9a76e', bg: 'rgba(249,167,110,0.1)', icon: '👥' },
  { id: 'rating',    label: 'Avg Rating',       value: '4.9',    change: '-0.1', up: false, color: '#f96e9a', bg: 'rgba(249,110,154,0.1)', icon: '⭐' },
];

const APPOINTMENTS: Appointment[] = [
  { id: 1, client: 'Emma Johnson',  service: 'Hair Coloring',   time: '09:00 AM', staff: 'Sarah M.', status: 'confirmed', avatar: 'EJ' },
  { id: 2, client: 'Lisa Martinez', service: 'Manicure + Pedi', time: '10:30 AM', staff: 'Anna K.',  status: 'in-progress', avatar: 'LM' },
  { id: 3, client: 'Rachel Green',  service: 'Haircut & Style', time: '11:00 AM', staff: 'Priya S.', status: 'confirmed', avatar: 'RG' },
  { id: 4, client: 'Sophie Turner', service: 'Facial Treatment',time: '01:00 PM', staff: 'Mia R.',   status: 'pending', avatar: 'ST' },
  { id: 5, client: 'Olivia Brown',  service: 'Balayage',        time: '02:30 PM', staff: 'Sarah M.', status: 'confirmed', avatar: 'OB' },
];

const TOP_SERVICES: ServiceMetric[] = [
  { name: 'Hair Coloring',  count: 42, pct: 85, color: '#00c9a7' },
  { name: 'Manicure',       count: 38, pct: 76, color: '#7c6ef9' },
  { name: 'Haircut',        count: 31, pct: 62, color: '#f9a76e' },
  { name: 'Facial',         count: 25, pct: 50, color: '#f96e9a' },
  { name: 'Balayage',       count: 19, pct: 38, color: '#6ef9e4' },
];

const DashboardHome: React.FC = () => (
  <>
    <StatsOverview stats={STATS} />
    <div className="dash-grid-two">
      <AppointmentList appointments={APPOINTMENTS} />
      <TopServices services={TOP_SERVICES} />
    </div>
  </>
);

export const DashboardPage: React.FC = () => {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Derive active menu item from location pathname
  const activePage = location.pathname.includes('/clients')
    ? 'clients'
    : location.pathname.includes('/staff')
    ? 'staff'
    : location.pathname.includes('/categories')
    ? 'categories'
    : location.pathname.includes('/packages')
    ? 'packages'
    : location.pathname.includes('/memberships')
    ? 'memberships'
    : location.pathname.includes('/services')
    ? 'services'
    : location.pathname.includes('/users')
    ? 'users'
    : 'dashboard';

  const handleNavItemClick = (id: string) => {
    if (id === 'dashboard') navigate('/dashboard');
    else if (id === 'clients') navigate('/dashboard/clients');
    else if (id === 'staff') navigate('/dashboard/staff');
    else if (id === 'services') navigate('/dashboard/services');
    else if (id === 'categories') navigate('/dashboard/categories');
    else if (id === 'packages') navigate('/dashboard/packages');
    else if (id === 'memberships') navigate('/dashboard/memberships');
    else if (id === 'users') navigate('/dashboard/users');
    else navigate(`/dashboard/${id}`);
  };

  return (
    <div className="dash-root">
      <Sidebar
        collapsed={collapsed}
        activeItem={activePage}
        onItemClick={handleNavItemClick}
      />

      <Header
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        activePage={activePage}
        onLogout={handleLogout}
      />

      <main
        className="dash-main"
        style={{ left: collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w-expanded)' }}
      >
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/clients" element={<CustomerListPage />} />
          <Route path="/clients/:id" element={<Customer360ProfilePage />} />
          <Route path="/staff" element={<StaffListPage />} />
          <Route path="/staff/:id" element={<StaffProfilePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/memberships" element={<MembershipsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="*" element={<DashboardHome />} />
        </Routes>
      </main>
    </div>
  );
};

export default DashboardPage;
