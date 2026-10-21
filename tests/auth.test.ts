import { describe, it, expect, beforeEach } from 'vitest';
import { StoreService } from '../src/services/storeService';

// Mock localStorage for Node test runner
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Sika Threads Authentication & Security Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Registers a new customer account with secure password hash and audit logging', () => {
    const result = StoreService.createAccount({
      email: 'adjoa.kusi@example.com',
      displayName: 'Adjoa Kusi',
      password: 'SecurePass123!',
      phoneNumber: '+233 55 771 8472',
    });

    expect(result.success).toBe(true);
    expect(result.account).toBeDefined();
    expect(result.account?.email).toBe('adjoa.kusi@example.com');
    expect(result.account?.displayName).toBe('Adjoa Kusi');
    expect(result.account?.role).toBe('customer');
    expect(result.account?.isEmailVerified).toBe(false);
    expect(result.account?.passwordHash).not.toBe('SecurePass123!');
    expect(result.account?.passwordHash).toContain('pw_');

    const logs = StoreService.getAuditLogs();
    const regLog = logs.find((l) => l.action === 'USER_REGISTRATION' && l.actorEmail === 'adjoa.kusi@example.com');
    expect(regLog).toBeDefined();
  });

  it('2. Prevents registration with existing email address', () => {
    StoreService.createAccount({
      email: 'duplicate@example.com',
      displayName: 'First User',
      password: 'Password123!',
    });

    const dupResult = StoreService.createAccount({
      email: 'duplicate@example.com',
      displayName: 'Second User',
      password: 'AnotherPassword456!',
    });

    expect(dupResult.success).toBe(false);
    expect(dupResult.error).toContain('already exists');
  });

  it('3. Authenticates account with valid credentials and rejects incorrect password', () => {
    StoreService.createAccount({
      email: 'kwabena@example.com',
      displayName: 'Kwabena Yeboah',
      password: 'MySecretPassword123!',
    });

    // Incorrect password
    const failAuth = StoreService.authenticateAccount('kwabena@example.com', 'WrongPassword!');
    expect(failAuth.success).toBe(false);
    expect(failAuth.error).toContain('Incorrect email or password');

    // Correct password
    const successAuth = StoreService.authenticateAccount('kwabena@example.com', 'MySecretPassword123!');
    expect(successAuth.success).toBe(true);
    expect(successAuth.account?.email).toBe('kwabena@example.com');
  });

  it('4. Handles password reset token generation, validation, and completion', () => {
    StoreService.createAccount({
      email: 'reset.tester@example.com',
      displayName: 'Reset Tester',
      password: 'InitialPassword123!',
    });

    // Request reset
    const resetReq = StoreService.requestPasswordReset('reset.tester@example.com');
    expect(resetReq.success).toBe(true);
    expect(resetReq.token).toBeDefined();
    expect(resetReq.token).toMatch(/^rst_/);

    // Validate token
    const tokenValidation = StoreService.validateResetToken(resetReq.token!);
    expect(tokenValidation.valid).toBe(true);
    expect(tokenValidation.email).toBe('reset.tester@example.com');

    // Reset password with token
    const resetResult = StoreService.resetPasswordWithToken(resetReq.token!, 'NewlyUpdatedPass456!');
    expect(resetResult.success).toBe(true);

    // Old token should now be invalidated
    const postResetValidation = StoreService.validateResetToken(resetReq.token!);
    expect(postResetValidation.valid).toBe(false);

    // Old password should fail authentication
    const oldAuth = StoreService.authenticateAccount('reset.tester@example.com', 'InitialPassword123!');
    expect(oldAuth.success).toBe(false);

    // New password should succeed
    const newAuth = StoreService.authenticateAccount('reset.tester@example.com', 'NewlyUpdatedPass456!');
    expect(newAuth.success).toBe(true);
  });

  it('5. Allows authenticated password update from account settings with current password verification', () => {
    StoreService.createAccount({
      email: 'settings.user@example.com',
      displayName: 'Settings User',
      password: 'CurrentPass123!',
    });

    // Wrong current password
    const wrongCurrent = StoreService.changeAccountPassword(
      'settings.user@example.com',
      'IncorrectPass!',
      'BrandNewPass789!'
    );
    expect(wrongCurrent.success).toBe(false);
    expect(wrongCurrent.error).toContain('Current password does not match');

    // Correct current password
    const validChange = StoreService.changeAccountPassword(
      'settings.user@example.com',
      'CurrentPass123!',
      'BrandNewPass789!'
    );
    expect(validChange.success).toBe(true);

    const checkAuth = StoreService.authenticateAccount('settings.user@example.com', 'BrandNewPass789!');
    expect(checkAuth.success).toBe(true);
  });

  it('6. Generates email verification token and updates verification status', () => {
    const reg = StoreService.createAccount({
      email: 'unverified@example.com',
      displayName: 'Unverified Customer',
      password: 'Password123!',
    });

    expect(reg.account?.isEmailVerified).toBe(false);

    const tokenRes = StoreService.createEmailVerificationToken('unverified@example.com');
    expect(tokenRes.success).toBe(true);
    expect(tokenRes.token).toBeDefined();

    const verifyRes = StoreService.verifyEmailWithToken(tokenRes.token!);
    expect(verifyRes.success).toBe(true);
    expect(verifyRes.email).toBe('unverified@example.com');

    const updatedAccount = StoreService.findAccountByEmail('unverified@example.com');
    expect(updatedAccount?.isEmailVerified).toBe(true);
  });
});
