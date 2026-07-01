// lib/services/payments.ts
// Marking calendar months as paid — drives the shift module's pay tabs.
import api from '@/lib/axios';
import { ApiResponse } from '@/lib/types';

export interface PaidMonth {
  id: string;
  userId: string;
  year: number;
  month: number; // 1–12
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function listPaidMonths(): Promise<PaidMonth[]> {
  const res = await api.get<ApiResponse<PaidMonth[]>>('/payments');
  return res.data.data ?? [];
}

export async function markMonthPaid(year: number, month: number): Promise<PaidMonth> {
  const res = await api.post<ApiResponse<PaidMonth>>('/payments/mark', { year, month });
  return res.data.data as PaidMonth;
}

export async function unmarkMonthPaid(year: number, month: number): Promise<void> {
  await api.delete('/payments', { data: { year, month } });
}
