import type { NextApiResponse } from 'next';

/**
 * Safe response handler to prevent "body stream already read" errors
 */

export interface SafeResponseResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  // common optional fields commonly read by UI code
  user?: unknown;
  authenticated?: boolean;
  stats?: unknown;
  // allow flexible access without breaking UI
  [key: string]: unknown;
}

/**
 * Safely parse response as JSON with error handling
 */
export async function safeResponseHandler<T = unknown>(
  response: Response,
): Promise<SafeResponseResult<T>> {
  try {
    // Check if response has been consumed
    if (response.bodyUsed) {
      return {
        success: false,
        error: 'Response body already consumed',
      };
    }

    // Clone the response to avoid "body stream already read" errors
    const responseClone = response.clone();

    // Check if response is ok
    if (!response.ok) {
      // Try to get error message from response
      try {
        const errorData = await responseClone.json();
        return {
          success: false,
          error:
            errorData.error ||
            errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
        };
      } catch {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      try {
        await responseClone.text();
        return {
          success: false,
          error: 'Server returned non-JSON response',
        };
      } catch {
        return {
          success: false,
          error: 'Invalid response format',
        };
      }
    }

    // Parse JSON from the original response
    const data = await response.json();
    // Return flattened structure for compatibility with legacy callers
    // that access fields directly (e.g., result.stats, result.users) while
    // still providing the original payload under `data`.
    return {
      success: true,
      ...(typeof data === 'object' && data ? data : {}),
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse response',
    };
  }
}

/**
 * Safe fetch with automatic response handling
 */
export async function safeFetch<T = unknown>(
  url: string,
  options?: RequestInit,
): Promise<SafeResponseResult<T>> {
  try {
    const response = await fetch(url, options);
    return await safeResponseHandler<T>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Safe JSON response for API routes
 */

export function safeJsonResponse<T = unknown>(res: NextApiResponse, status: number, data: T): void {
  try {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(status).json(data);
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}
