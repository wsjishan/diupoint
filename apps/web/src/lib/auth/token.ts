const AUTH_TOKEN_STORAGE_KEY = 'diupoint.auth.access-token';

function canUseStorage(): boolean {
  return (
    typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  );
}

export function getToken(): string | null {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}
