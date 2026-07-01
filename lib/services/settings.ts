// lib/services/settings.ts
import api from '@/lib/axios';
import { ApiResponse } from '@/lib/types';
import { settingsStore, DateFormat, TimeFormat } from '@/store/settingsStore';

export interface SettingsPayload {
  profile: { displayName: string; email: string; profilePicture: string | null };
  settings: {
    currency: string;
    nativeCurrency: string;
    dateFormat: DateFormat;
    timeFormat: TimeFormat;
    reportMonths: number;
    theme?: string;
    language?: string;
  };
}

export interface UpdateSettingsInput {
  displayName?: string;
  currency?: string;
  nativeCurrency?: string;
  dateFormat?: DateFormat;
  timeFormat?: TimeFormat;
  reportMonths?: number;
}

// Mirror the API payload into the global store (so formatters update).
function syncStore(p: SettingsPayload) {
  settingsStore.getState().setSettings({
    displayName: p.profile.displayName,
    email: p.profile.email,
    currency: p.settings.currency,
    nativeCurrency: p.settings.nativeCurrency,
    dateFormat: p.settings.dateFormat,
    timeFormat: p.settings.timeFormat,
    reportMonths: p.settings.reportMonths,
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

// Upload a new profile picture (base64 data URI). The backend replaces the
// image on ImageKit and deletes the previous one.
export async function updateProfilePicture(image: string): Promise<SettingsPayload> {
  const res = await api.patch<ApiResponse<SettingsPayload>>('/settings/profile-picture', { image });
  const data = res.data.data as SettingsPayload;
  syncStore(data);
  return data;
}

// Remove the current profile picture (deletes it from ImageKit).
export async function removeProfilePicture(): Promise<SettingsPayload> {
  const res = await api.delete<ApiResponse<SettingsPayload>>('/settings/profile-picture');
  const data = res.data.data as SettingsPayload;
  syncStore(data);
  return data;
}
