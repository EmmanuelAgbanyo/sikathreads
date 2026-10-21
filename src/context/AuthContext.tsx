import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { StoreService } from '../services/storeService';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  login: (email: string, password?: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    name: string,
    password?: string,
    phoneNumber?: string,
    marketingConsent?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string; demoToken?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  requestEmailVerification: () => Promise<{ success: boolean; token?: string; error?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
  setAdminRole: (isAdmin: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => StoreService.getCurrentUser());

  useEffect(() => {
    StoreService.setCurrentUser(user);
  }, [user]);

  const login = async (
    email: string,
    password?: string,
    _rememberMe: boolean = true
  ): Promise<{ success: boolean; error?: string }> => {
    const authResult = StoreService.authenticateAccount(email, password);
    if (!authResult.success || !authResult.account) {
      return { success: false, error: authResult.error || 'Authentication failed' };
    }

    const acc = authResult.account;
    const profile: UserProfile = {
      uid: acc.uid,
      email: acc.email,
      displayName: acc.displayName,
      phoneNumber: acc.phoneNumber,
      role: acc.role,
      isEmailVerified: acc.isEmailVerified,
      createdAt: acc.createdAt,
      lastLoginAt: acc.lastLoginAt,
    };

    setUser(profile);
    return { success: true };
  };

  const register = async (
    email: string,
    name: string,
    password?: string,
    phoneNumber?: string,
    marketingConsent?: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    const createResult = StoreService.createAccount({
      email,
      displayName: name,
      password,
      phoneNumber,
      role: 'customer',
    });

    if (!createResult.success || !createResult.account) {
      return { success: false, error: createResult.error || 'Registration failed' };
    }

    const acc = createResult.account;
    const profile: UserProfile = {
      uid: acc.uid,
      email: acc.email,
      displayName: acc.displayName,
      phoneNumber: acc.phoneNumber,
      role: 'customer',
      isEmailVerified: false,
      notificationPreferences: {
        emailOrderUpdates: true,
        whatsappOrderUpdates: true,
        restockAlerts: true,
        curatorStylePicks: Boolean(marketingConsent),
      },
      createdAt: acc.createdAt,
      lastLoginAt: acc.lastLoginAt,
    };

    setUser(profile);
    return { success: true };
  };

  const logout = () => {
    if (user) {
      StoreService.recordAuditLog(
        user.email,
        user.role,
        'USER_SIGN_OUT',
        'auth',
        user.uid,
        `User signed out`
      );
    }
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User is not authenticated' };
    }
    const updated: UserProfile = {
      ...user,
      ...updates,
    };
    setUser(updated);
    StoreService.setCurrentUser(updated);

    // Synchronize updates to registered account record if available
    StoreService.updateAccountProfile(user.email, {
      displayName: updated.displayName,
      phoneNumber: updated.phoneNumber,
    });

    StoreService.recordAuditLog(
      user.email,
      user.role,
      'USER_PROFILE_UPDATE',
      'auth',
      user.uid,
      `User profile updated for ${updated.displayName}`
    );
    return { success: true };
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User must be signed in to change password.' };
    }
    return StoreService.changeAccountPassword(user.email, currentPassword, newPassword);
  };

  const requestPasswordReset = async (
    email: string
  ): Promise<{ success: boolean; message: string; demoToken?: string }> => {
    const res = StoreService.requestPasswordReset(email);
    return {
      success: res.success,
      message: res.message,
      demoToken: res.token,
    };
  };

  const resetPassword = async (
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    return StoreService.resetPasswordWithToken(token, newPassword);
  };

  const requestEmailVerification = async (): Promise<{ success: boolean; token?: string; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Must be signed in to request verification.' };
    }
    return StoreService.createEmailVerificationToken(user.email);
  };

  const verifyEmail = async (token: string): Promise<{ success: boolean; error?: string }> => {
    const res = StoreService.verifyEmailWithToken(token);
    if (res.success && user) {
      setUser({ ...user, isEmailVerified: true });
    }
    return res;
  };

  const setAdminRole = (enableAdmin: boolean) => {
    if (!user) {
      // Create admin session
      const adminProfile: UserProfile = {
        uid: 'adm_001',
        email: 'admin@sikathreads.com.gh',
        displayName: 'Sika Store Manager',
        role: 'admin',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
      };
      setUser(adminProfile);
      StoreService.recordAuditLog(
        adminProfile.email,
        'admin',
        'ADMIN_SESSION_INITIATED',
        'auth',
        adminProfile.uid,
        'Admin mode toggled on'
      );
    } else {
      const updated: UserProfile = {
        ...user,
        role: enableAdmin ? 'admin' : 'customer',
      };
      setUser(updated);
      StoreService.recordAuditLog(
        user.email,
        updated.role,
        'ROLE_CHANGE',
        'auth',
        user.uid,
        `Role adjusted to ${updated.role}`
      );
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        requestPasswordReset,
        resetPassword,
        requestEmailVerification,
        verifyEmail,
        setAdminRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
