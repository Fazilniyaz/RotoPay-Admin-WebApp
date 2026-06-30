// lib/services/settings.ts
import api from '@/lib/axios';
import { ApiResponse } from '@/lib/types';
import { settingsStore, DateFormat, TimeFormat } from '@/store/settingsStore';

export interface SettingsPayload {
  profile: { displayName: string; email: string };
  settings: {
    currency: string;
    dateFormat: DateFormat;
    timeFormat: TimeFormat;
    theme?: string;
    language?: string;
  };
}

export interface UpdateSettingsInput {
  displayName?: string;
  currency?: string;
  dateFormat?: DateFormat;
  timeFormat?: TimeFormat;
}

// Mirror the API payload into the global store (so formatters update).
function syncStore(p: SettingsPayload) {
  settingsStore.getState().setSettings({
    displayName: p.profile.displayName,
    email: p.profile.email,
    currency: p.settings.currency,
    dateFormat: p.settings.dateFormat,
    timeFormat: p.settings.timeFormat,
    loaded: true,
  });
}

export async function getSettings(): Promise<SettingsPayload> {
  const res = await api.get<ApiResponse<SettingsPayload>>('/settings');
  const data = res.data.data as SettingsPayload;
  syncStore(data);
  return data;
}

export async function updateSettings(input: UpdateSettingsInput): Promise<SettingsPayload> {
  const res = await api.patch<ApiResponse<SettingsPayload>>('/settings', input);
  const data = res.data.data as SettingsPayload;
  syncStore(data);
  return data;
}
