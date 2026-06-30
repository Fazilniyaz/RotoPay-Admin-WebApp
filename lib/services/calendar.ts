// lib/services/calendar.ts
// CRUD for calendar entries (custom day notes, optionally linked to a shift).
import api from '@/lib/axios';
import { ApiResponse, CalendarEntry } from '@/lib/types';

export interface CalendarInput {
  date: string; // ISO
  title: string; // ≤ 15 words
  shiftId?: string | null;
  color?: string | null;
}

export async function listCalendar(params?: {
  from?: string;
  to?: string;
}): Promise<CalendarEntry[]> {
  const res = await api.get<ApiResponse<CalendarEntry[]>>('/calendar', { params });
  return res.data.data ?? [];
}

export async function createCalendarEntry(input: CalendarInput): Promise<CalendarEntry> {
  const res = await api.post<ApiResponse<CalendarEntry>>('/calendar', input);
  return res.data.data as CalendarEntry;
}

export async function updateCalendarEntry(
  id: string,
  input: Partial<CalendarInput>
): Promise<CalendarEntry> {
  const res = await api.patch<ApiResponse<CalendarEntry>>(`/calendar/${id}`, input);
  return res.data.data as CalendarEntry;
}

export async function deleteCalendarEntry(id: string): Promise<void> {
  await api.delete(`/calendar/${id}`);
}
