// lib/services/shifts.ts
// CRUD calls for the Shift resource.
import api from '@/lib/axios';
import { ApiResponse, Shift, ShiftType, ShiftStatus, PaginationMeta } from '@/lib/types';

export interface ShiftSalaryAssignment {
  employerId: string;
  salary: number;
}

export interface CreateShiftInput {
  shiftName?: string;
  startDate: string; // ISO
  endDate: string; // ISO
  startTime: string; // ISO
  endTime: string; // ISO
  totalHours: number;
  breakDuration?: number;
  shiftType: ShiftType;
  confirmed?: boolean;
  notes?: string;
  salaries?: ShiftSalaryAssignment[];
}

export type UpdateShiftInput = Partial<Omit<CreateShiftInput, 'salaries'>>;

export interface ListShiftsParams {
  status?: ShiftStatus;
  search?: string;
  employerId?: string;
  shiftType?: ShiftType;
  from?: string;
  to?: string;
  confirmed?: boolean;
  page?: number;
  limit?: number;
}

export async function listShifts(
  params?: ListShiftsParams
): Promise<{ data: Shift[]; meta?: PaginationMeta }> {
  const res = await api.get<ApiResponse<Shift[]>>('/shifts', { params });
  return { data: res.data.data ?? [], meta: res.data.meta };
}

export async function getShift(id: string): Promise<Shift> {
  const res = await api.get<ApiResponse<Shift>>(`/shifts/${id}`);
  return res.data.data as Shift;
}

export interface ShiftAnalytics {
  totalHours: number;
  thisMonthHours: number;
  thisWeekHours: number;
  totalPay: number;
  thisMonthPay: number;
  thisWeekPay: number;
}

export async function getShiftAnalytics(): Promise<ShiftAnalytics> {
  const res = await api.get<ApiResponse<ShiftAnalytics>>('/shifts/analytics');
  return res.data.data as ShiftAnalytics;
}

export async function createShift(input: CreateShiftInput): Promise<Shift> {
  const res = await api.post<ApiResponse<Shift>>('/shifts', input);
  return res.data.data as Shift;
}

export async function updateShift(id: string, input: UpdateShiftInput): Promise<Shift> {
  const res = await api.patch<ApiResponse<Shift>>(`/shifts/${id}`, input);
  return res.data.data as Shift;
}

export async function deleteShift(id: string): Promise<void> {
  await api.delete(`/shifts/${id}`);
}
