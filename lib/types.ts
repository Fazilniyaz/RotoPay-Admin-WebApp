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

// Free-form: 'day' | 'night' | 'rotational' or a user-supplied custom label.
export type ShiftType = string;
export type ShiftStatus = 'upcoming' | 'isActive' | 'completed';
export type WageRateType = 'hourly' | 'weekly' | 'monthly';

// A Salary/"wage" row links a Shift to an Employer and carries the pay value.
export interface Salary {
  id: string;
  userId: string;
  shiftId?: string | null;
  employerId?: string | null;
  salary?: number | null;
  rateType?: WageRateType;
  currency?: string | null;
  hourlyPayRate?: number | null;
  shift?: {
    id: string;
    shiftName?: string | null;
    date?: string | null;
    startTime?: string;
    endTime?: string;
    totalHours?: number;
    shiftType?: ShiftType | null;
    status?: ShiftStatus | null;
  } | null;
  employer?: { id: string; store: string; employerName: string } | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Shift {
  id: string;
  userId: string;
  shiftName?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  shiftType?: ShiftType | null;
  // Label colour chosen at creation; the calendar renders shift entries in it.
  color?: string | null;
  status?: ShiftStatus | null;
  isActive?: boolean | null;
  isManualEntry: boolean;
  notes?: string;
  salaries?: Salary[];
  createdAt?: string;
}

export type CalendarEntryType = 'event' | 'memo' | 'shift';

export interface CalendarEntry {
  id: string;
  userId: string;
  date: string;
  type: CalendarEntryType;
  title: string;
  shiftId?: string | null;
  employerId?: string | null;
  color?: string | null;
  shift?: {
    id: string;
    shiftName?: string | null;
    date?: string | null;
    startTime?: string;
    endTime?: string;
    totalHours?: number;
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
  clockInType: 'automatic' | 'manual';
  language: string;
  dateFormat: string;
  timeFormat: string;
  notifyShiftReminder: boolean;
  notifyEventReminder: boolean;
  notifyBirthdayReminder: boolean;
}
