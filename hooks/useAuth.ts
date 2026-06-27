'use client';

import { useCallback } from 'react';
import api from '@/lib/axios';
import { authStore, User } from '@/store/authStore';
import { toast } from 'sonner';

export const useAuth = () => {
  const { user, accessToken, setUser, setTokens, clearAuth, logout } =
    authStore();

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await api.post('/auth/login', {
          email,
          password,
        });

        if (response.data.success) {
          const { user, accessToken, refreshToken } = response.data.data;
          setUser(user);
          setTokens(accessToken, refreshToken);
          return { success: true, user };
        }
        return { success: false, message: response.data.message };
      } catch (error: any) {
        const status = error.response?.status;
        const message =
          error.response?.data?.message || 'Login failed. Please try again.';
        if (status === 403 && message.toLowerCase().includes('verify')) {
          return { success: false, message, isUnverified: true };
        }
        toast.error(message);
        return { success: false, message };
      }
    },
    [setUser, setTokens]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      displayName?: string
    ) => {
      try {
        const response = await api.post('/auth/register', {
          email,
          password,
          displayName,
        });

        if (response.data.success) {
          toast.success('Registration successful! Check your email to verify.');
          return { success: true };
        }
        return { success: false, message: response.data.message };
      } catch (error: any) {
        const status = error.response?.status;
        const message =
          error.response?.data?.message ||
          'Registration failed. Please try again.';
        if (status === 403 && message.toLowerCase().includes('verify')) {
          return { success: false, message, isUnverified: true };
        }
        toast.error(message);
        return { success: false, message };
      }
    },
    []
  );

  const resendVerification = useCallback(async (email: string) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      if (response.data.success) {
        toast.success('Verification email resent successfully!');
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to resend verification email.';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  const verifyEmail = useCallback(
    async (token: string) => {
      try {
        const response = await api.post('/auth/verify-email', { token });

        if (response.data.success) {
          toast.success('Email verified successfully!');
          return { success: true };
        }
        return { success: false, message: response.data.message };
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          'Email verification failed. Please try again.';
        toast.error(message);
        return { success: false, message };
      }
    },
    [setUser, setTokens]
  );

  const requestPasswordReset = useCallback(
    async (email: string) => {
      try {
        const response = await api.post('/auth/forgot-password', {
          email,
        });

        if (response.data.success) {
          toast.success('Check your email for password reset link.');
          return { success: true };
        }
        return { success: false, message: response.data.message };
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          'Failed to send reset email. Please try again.';
        toast.error(message);
        return { success: false, message };
      }
    },
    []
  );

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      try {
        const response = await api.post('/auth/reset-password', {
          token,
          password: newPassword,
        });

        if (response.data.success) {
          toast.success('Password reset successful! Please log in.');
          return { success: true };
        }
        return { success: false, message: response.data.message };
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          'Password reset failed. Please try again.';
        toast.error(message);
        return { success: false, message };
      }
    },
    []
  );

  const googleLogin = useCallback(
    async (token: string) => {
      try {
        const response = await api.post('/auth/google', {
          idToken: token,
        });

        if (response.data.success) {
          const { user, accessToken, refreshToken } = response.data.data;
          setUser(user);
          setTokens(accessToken, refreshToken);
          return { success: true, user };
        }
        return { success: false, message: response.data.message };
      } catch (error: any) {
        const status = error.response?.status;
        const message =
          error.response?.data?.message ||
          'Google login failed. Please try again.';
        
        if (status === 403 && message.toLowerCase().includes('verify')) {
          const email = error.response?.data?.data?.email;
          return { success: false, message, isUnverified: true, email };
        }
        
        toast.error(message);
        return { success: false, message };
      }
    },
    [setUser, setTokens]
  );

  const handleLogout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      clearAuth();
    }
  }, [logout, clearAuth]);

  return {
    user,
    accessToken,
    isAuthenticated: !!accessToken && !!user,
    login,
    register,
    verifyEmail,
    resendVerification,
    requestPasswordReset,
    resetPassword,
    googleLogin,
    logout: handleLogout,
  };
};
