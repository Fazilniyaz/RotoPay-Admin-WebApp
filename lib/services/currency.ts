// lib/services/currency.ts
// Live currency conversion rate (global → native), refreshed daily server-side.
import api from '@/lib/axios';
import { ApiResponse } from '@/lib/types';

export interface ConversionRate {
  from: string;
  to: string;
  rate: number;
  date: string;
}

export async function getRate(from: string, to: string): Promise<ConversionRate> {
  const res = await api.get<ApiResponse<ConversionRate>>('/currency/rate', {
    params: { from, to },
  });
  return res.data.data as ConversionRate;
}
