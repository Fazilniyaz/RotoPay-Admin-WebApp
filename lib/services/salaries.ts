// lib/services/salaries.ts
// CRUD calls for the Salary resource (links a shift + employer with a value).
import api from '@/lib/axios';
import { ApiResponse, Salary, PaginationMeta, WageRateType } from '@/lib/types';

export interface CreateSalaryInput {
  shiftId?: string | null;
  employerId?: string | null;
  salary: number;
  rateType?: WageRateType;
  currency?: string;
}

export interface UpdateSalaryInput {
  shiftId?: string | null;
  employerId?: string | null;
  salary?: number;
  rateType?: WageRateType;
  currency?: string | null;
}

export interface ListSalariesParams {
  shiftId?: string;
  employerId?: string;
  page?: number;
  limit?: number;
}

export async function listSalaries(
  params?: ListSalariesParams
): Promise<{ data: Salary[]; meta?: PaginationMeta }> {
  const res = await api.get<ApiResponse<Salary[]>>('/salaries', { params });
  return { data: res.data.data ?? [], meta: res.data.meta };
}

export async function createSalary(input: CreateSalaryInput): Promise<Salary> {
  const res = await api.post<ApiResponse<Salary>>('/salaries', input);
  return res.data.data as Salary;
}

export async function updateSalary(id: string, input: UpdateSalaryInput): Promise<Salary> {
  const res = await api.patch<ApiResponse<Salary>>(`/salaries/${id}`, input);
  return res.data.data as Salary;
}

export async function deleteSalary(id: string): Promise<void> {
  await api.delete(`/salaries/${id}`);
}
