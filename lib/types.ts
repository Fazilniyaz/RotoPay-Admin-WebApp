export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  summary?: Record<string, number>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: PaginationMeta;
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
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type ShiftType = 'night' | 'day' | 'rotational';
export type ShiftStatus = 'upcoming' | 'isActive' | 'completed';

// A Salary row links a Shift to an Employer and carries the pay value.
export interface Salary {
  id: string;
  userId: string;
  shiftId?: string | null;
  employerId?: string | null;
  salary?: number | null;
  hourlyPayRate?: number | null;
  shift?: {
    id: string;
    shiftName?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    startTime?: string;
    endTime?: string;
    totalHours?: number;
    shiftType?: ShiftType | null;
    status?: ShiftStatus | null;
    confirmed?: boolean;
  } | null;
  employer?: { id: string; store: string; employerName: string } | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Shift {
  id: string;
  userId: string;
  shiftName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  startTime: string;
  endTime: string;
  totalHours: number;
  breakDuration: number;
  shiftType?: ShiftType | null;
  status?: ShiftStatus | null;
  isActive?: boolean | null;
  isManualEntry: boolean;
  confirmed: boolean;
  notes?: string;
  salaries?: Salary[];
  createdAt?: string;
}

export interface CalendarEntry {
  id: string;
  userId: string;
  date: string;
  title: string;
  shiftId?: string | null;
  color?: string | null;
  shift?: {
    id: string;
    shiftName?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    shiftType?: ShiftType | null;
    status?: ShiftStatus | null;
  } | null;
  createdAt?: string;
}

export interface ClockSession {
  id: string;
  userId: string;
  employerId?: string | null;
  salaryId?: string | null;
  clockInTime: string;
  clockOutTime?: string | null;
  totalHours?: number | null;
  earnings?: number | null;
  isAutoCalculated?: boolean;
  status: 'active' | 'completed';
  notes?: string | null;
  // The linked salary carries employer + shift details + hourlyPayRate.
  salary?: Salary | null;
  createdAt?: string;
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
