/**
 * Fetch with timeout and retry logic
 */

interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number; // Timeout in milliseconds
  retries?: number; // Number of retry attempts
  retryDelay?: number; // Delay between retries in milliseconds
}

class FetchError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isTimeout: boolean = false,
    public isNetworkError: boolean = false
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

/**
 * Fetch with automatic timeout and retry logic
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const {
    timeout = 10000, // Default 10 seconds
    retries = 2, // Default 2 retries
    retryDelay = 1000, // Default 1 second between retries
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError = error as Error;

      // Check if it's a timeout error
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new FetchError(
          `Request timeout after ${timeout}ms`,
          undefined,
          true,
          false
        );
      }

      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        lastError = new FetchError(
          'Network error: Unable to connect to server',
          undefined,
          false,
          true
        );
      }

      // Don't retry on the last attempt
      if (attempt < retries) {
        console.warn(
          `Request failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${retryDelay}ms...`,
          error
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }
    }
  }

  // If all retries failed, throw the last error
  throw lastError || new Error('Unknown fetch error');
}

/**
 * Helper function for JSON requests with timeout and retry
 */
export async function fetchJSON<T = any>(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<{ data: T; response: Response }> {
  const response = await fetchWithTimeout(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If can't parse error as JSON, use status text
    }

    throw new FetchError(errorMessage, response.status, false, false);
  }

  const data = await response.json();
  return { data, response };
}

export { FetchError };
