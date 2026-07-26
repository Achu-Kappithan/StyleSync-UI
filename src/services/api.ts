const API_BASE_URL = 'http://localhost:3000/api';

let refreshPromise: Promise<boolean> | null = null;

async function executeRefresh(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      return refreshRes.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // credentials: 'include' ensures HttpOnly cookies are automatically sent with every request
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

  if (
    response.status === 401 &&
    !isRetry &&
    !endpoint.includes('/auth/login') &&
    !endpoint.includes('/auth/refresh')
  ) {
    // Silent Refresh: Try refreshing tokens using the refresh_token HttpOnly cookie
    const refreshedSuccessfully = await executeRefresh();
    if (refreshedSuccessfully) {
      // Retry the original request once
      return fetchApi<T>(endpoint, options, true);
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(errorData.message || `HTTP ${response.status} error`);
  }

  return response.json();
}

