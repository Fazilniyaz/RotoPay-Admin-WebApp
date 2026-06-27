export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    profilePicture?: string;
    emailVerified: boolean;
    pinEnabled: boolean;
    createdAt: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface Employer {
  id: string;
  userId: string;
  store: string;
  employerName: string;
  hourlyPayRate: number;
  currency: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Shift {
  id: string;
  userId: string;
  employerId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  breakDuration: number;
  earnings: number;
  isManualEntry: boolean;
  confirmed: boolean;
  notes?: string;
}

export interface ClockSession {
  id: string;
  userId: string;
  employerId: string;
  clockInTime: string;
  clockOutTime?: string;
  totalHours?: number;
  earnings?: number;
  isAutoCalculated: boolean;
  status: 'active' | 'completed';
  notes?: string;
}

export interface Event {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: string;
  date: string;
  endDate?: string;
  isAllDay: boolean;
  isRecurring: boolean;
  recurringPattern?: string;
  reminderEnabled: boolean;
  reminderMinutes: number;
  color?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string;
  relatedType?: string;
  scheduledAt?: string;
  createdAt: string;
}

export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  currency: string;
  salaryCalcMode: string;
  clockInOutEnabled: boolean;
  language: string;
  dateFormat: string;
  timeFormat: string;
  notifyShiftReminder: boolean;
  notifyEventReminder: boolean;
  notifyBirthdayReminder: boolean;
}
