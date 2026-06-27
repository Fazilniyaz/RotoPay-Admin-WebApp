// src/types/auth.types.ts

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  profilePicture: string | null;
  emailVerified: boolean;
  pinEnabled: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface GoogleAuthPayload {
  idToken: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface LoginResponseData extends AuthTokens {
  user: User;
  isNewUser?: boolean;
}
