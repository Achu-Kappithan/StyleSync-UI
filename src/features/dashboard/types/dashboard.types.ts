export interface StatCard {
  id: string;
  label: string;
  value: string;
  change: string;
  up: boolean;
  color: string;
  bg: string;
  icon: string;
}

export interface Appointment {
  id: number;
  client: string;
  service: string;
  time: string;
  staff: string;
  status: 'confirmed' | 'in-progress' | 'pending';
  avatar: string;
}

export interface ServiceMetric {
  name: string;
  count: number;
  pct: number;
  color: string;
}

export interface DayMetric {
  day: string;
  bookings: number;
  revenue: number;
}
