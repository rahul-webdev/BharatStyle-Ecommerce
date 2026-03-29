import { decrypt } from './crypto';

const apiCache = new Map<string, { data: any; expiry: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  useCache?: boolean; // New option to enable caching
};

export async function apiRequest<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, useCache = false, ...rest } = options;

  // Check cache for GET requests
  if (method === 'GET' && useCache) {
    const cached = apiCache.get(url);
    if (cached && cached.expiry > Date.now()) {
      return cached.data as T;
    }
  }

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const config: RequestInit = {
    method,
    headers: defaultHeaders,
    ...rest,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    let data = await response.json();

    // Handle secure (encrypted) responses
    if (data && typeof data.data === 'string') {
      const decryptedData = decrypt(data.data);
      try {
        data = JSON.parse(decryptedData);
      } catch (parseError) {
        console.error('Failed to parse decrypted data:', parseError);
        data = decryptedData;
      }
    }

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    // Cache the successful GET response
    if (method === 'GET' && useCache) {
      apiCache.set(url, { data, expiry: Date.now() + CACHE_DURATION });
    }

    return data as T;
  } catch (error: any) {
    console.error(`API Request Error (${url}):`, error);
    throw error;
  }
}
