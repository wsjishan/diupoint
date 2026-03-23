export type AccountVerificationStatus = 'verified' | 'unverified';

export interface AuthAccountState {
  email: string;
  verificationStatus: AccountVerificationStatus;
  isAuthenticated: boolean;
  verifiedEmail?: string;
  authProvider?: 'password' | 'google' | 'unknown';
}

const AUTH_ACCOUNT_STORAGE_KEY = 'diupoint.auth.account';
const DIU_EMAIL_DOMAINS = ['@diu.edu.bd', '@s.diu.edu.bd'] as const;

function canUseStorage(): boolean {
  return (
    typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  );
}

export function isDiuEmailDomain(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();

  return DIU_EMAIL_DOMAINS.some((domain) => normalizedEmail.endsWith(domain));
}

export function getVerificationStatusByEmail(
  email: string
): AccountVerificationStatus {
  return isDiuEmailDomain(email) ? 'verified' : 'unverified';
}

export function getStoredAuthAccount(): AuthAccountState | null {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(AUTH_ACCOUNT_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthAccountState;
    if (!parsed?.email) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function setStoredAuthAccount(account: AuthAccountState): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(
    AUTH_ACCOUNT_STORAGE_KEY,
    JSON.stringify(account)
  );
}

export function createAuthAccountFromEmail(
  email: string,
  authProvider: AuthAccountState['authProvider'] = 'unknown'
): AuthAccountState {
  const normalizedEmail = email.trim().toLowerCase();
  const verificationStatus = getVerificationStatusByEmail(normalizedEmail);

  return {
    email: normalizedEmail,
    verificationStatus,
    isAuthenticated: true,
    verifiedEmail:
      verificationStatus === 'verified' ? normalizedEmail : undefined,
    authProvider,
  };
}

export function saveAuthFromEmail(
  email: string,
  authProvider: AuthAccountState['authProvider'] = 'unknown'
): AuthAccountState {
  const account = createAuthAccountFromEmail(email, authProvider);
  setStoredAuthAccount(account);
  return account;
}

export function upgradeStoredAccountToVerified(
  verifiedEmail: string
): AuthAccountState {
  const normalizedVerifiedEmail = verifiedEmail.trim().toLowerCase();
  const existingAccount = getStoredAuthAccount();

  const upgraded: AuthAccountState = {
    email: existingAccount?.email ?? normalizedVerifiedEmail,
    isAuthenticated: true,
    verificationStatus: 'verified',
    verifiedEmail: normalizedVerifiedEmail,
    authProvider: existingAccount?.authProvider ?? 'unknown',
  };

  setStoredAuthAccount(upgraded);
  return upgraded;
}
