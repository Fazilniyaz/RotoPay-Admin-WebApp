// src/store/slices/authSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "@/lib/api";
import {
  AuthState,
  User,
  RegisterPayload,
  LoginPayload,
  LoginResponseData,
  ApiResponse,
} from "@/types/auth.types";

// ── Persist helpers ────────────────────────────

function persistAuth(accessToken: string, refreshToken: string, user: User) {
  localStorage.setItem("rotapay_access_token", accessToken);
  localStorage.setItem("rotapay_refresh_token", refreshToken);
  localStorage.setItem("rotapay_user", JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem("rotapay_access_token");
  localStorage.removeItem("rotapay_refresh_token");
  localStorage.removeItem("rotapay_user");
}

function loadPersistedAuth(): Partial<AuthState> {
  if (typeof window === "undefined") return {};
  try {
    const accessToken = localStorage.getItem("rotapay_access_token");
    const refreshToken = localStorage.getItem("rotapay_refresh_token");
    const userStr = localStorage.getItem("rotapay_user");
    if (accessToken && userStr) {
      return {
        accessToken,
        refreshToken,
        user: JSON.parse(userStr),
        isAuthenticated: true,
      };
    }
  } catch {
    clearAuth();
  }
  return {};
}

// ── Initial State ──────────────────────────────

const persisted = loadPersistedAuth();

const initialState: AuthState = {
  user: persisted.user ?? null,
  accessToken: persisted.accessToken ?? null,
  refreshToken: persisted.refreshToken ?? null,
  isAuthenticated: persisted.isAuthenticated ?? false,
  isLoading: false,
  error: null,
};

// ── Async Thunks ───────────────────────────────

export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<ApiResponse<{ user: User; emailSent: boolean }>>(
        "/auth/register",
        payload
      );
      return data;
    } catch (err) {
      const error = err as AxiosError<ApiResponse>;
      return rejectWithValue(
        error.response?.data?.message ?? "Registration failed"
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<ApiResponse<LoginResponseData>>(
        "/auth/login",
        payload
      );
      return data.data!;
    } catch (err) {
      const error = err as AxiosError<ApiResponse>;
      return rejectWithValue(
        error.response?.data?.message ?? "Login failed"
      );
    }
  }
);

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (idToken: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post<ApiResponse<LoginResponseData>>(
        "/auth/google",
        { idToken }
      );
      return data.data!;
    } catch (err) {
      const error = err as AxiosError<ApiResponse>;
      return rejectWithValue(
        error.response?.data?.message ?? "Google sign-in failed"
      );
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (token: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post<ApiResponse>("/auth/verify-email", { token });
      return data.message;
    } catch (err) {
      const error = err as AxiosError<ApiResponse>;
      return rejectWithValue(
        error.response?.data?.message ?? "Verification failed"
      );
    }
  }
);

export const resendVerification = createAsyncThunk(
  "auth/resendVerification",
  async (email: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post<ApiResponse>("/auth/resend-verification", { email });
      return data.message;
    } catch (err) {
      const error = err as AxiosError<ApiResponse>;
      return rejectWithValue(
        error.response?.data?.message ?? "Failed to resend email"
      );
    }
  }
);

// ── Slice ──────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      clearAuth();
    },
    clearError(state) {
      state.error = null;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      if (state.accessToken && state.refreshToken) {
        persistAuth(state.accessToken, state.refreshToken, action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    // ── Register ──
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── Login ──
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        persistAuth(
          action.payload.accessToken,
          action.payload.refreshToken,
          action.payload.user
        );
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── Google Login ──
    builder
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        persistAuth(
          action.payload.accessToken,
          action.payload.refreshToken,
          action.payload.user
        );
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── Verify Email ──
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── Resend ──
    builder
      .addCase(resendVerification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendVerification.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
