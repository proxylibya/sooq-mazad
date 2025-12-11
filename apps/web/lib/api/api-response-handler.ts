/**
 * API Response Handler
 * معالج استجابات API الموحد
 * Centralized API response handling with error management
 */

import { ErrorMessages, SuccessMessages, MessageFormatter } from '../validation/error-messages';

// ============================================
// 1. Types & Interfaces
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code?: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiRequestOptions extends RequestInit {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  withAuth?: boolean;
  authType?: 'bearer' | 'admin' | 'custom';
  customHeaders?: Record<string, string>;
  onUploadProgress?: (progress: number) => void;
  onDownloadProgress?: (progress: number) => void;
}

export interface ApiError extends Error {
  code?: string;
  status?: number;
  details?: any;
  isApiError: true;
}

// ============================================
// 2. Error Classes
// ============================================

export class ApiErrorClass extends Error implements ApiError {
  code?: string;
  status?: number;
  details?: any;
  isApiError: true = true;

  constructor(message: string, code?: string, status?: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiErrorClass);
    }
  }
}

export class NetworkError extends ApiErrorClass {
  constructor(message = ErrorMessages.network.connectionLost) {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ApiErrorClass {
  constructor(message = ErrorMessages.api.timeout) {
    super(message, 'TIMEOUT_ERROR', 0);
    this.name = 'TimeoutError';
  }
}

export class ValidationError extends ApiErrorClass {
  constructor(errors: Record<string, string>) {
    super(ErrorMessages.validation.invalidFormat, 'VALIDATION_ERROR', 400, errors);
    this.name = 'ValidationError';
  }
}

// ============================================
// 3. API Client Class
// ============================================

export class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(
    baseUrl = '',
    defaultTimeout = 30000,
    defaultHeaders: Record<string, string> = {}
  ) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = defaultTimeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
  }

  /**
   * Get authentication token
   */
  private getAuthToken(authType: 'bearer' | 'admin' | 'custom'): string | null {
    if (typeof window === 'undefined') return null;

    switch (authType) {
      case 'bearer':
        return localStorage.getItem('token');
      case 'admin':
        // Check cookie for admin session
        const cookies = document.cookie.split(';');
        const adminCookie = cookies.find(c => c.trim().startsWith('admin-session='));
        return adminCookie ? adminCookie.split('=')[1] : null;
      default:
        return localStorage.getItem('token');
    }
  }

  /**
   * Create request with timeout
   */
  private createRequestWithTimeout(
    request: Promise<Response>,
    timeout: number
  ): Promise<Response> {
    return Promise.race([
      request,
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new TimeoutError()), timeout);
      }),
    ]);
  }

  /**
   * Retry request with exponential backoff
   */
  private async retryRequest(
    fn: () => Promise<Response>,
    retries: number,
    delay: number
  ): Promise<Response> {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) throw error;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryRequest(fn, retries - 1, delay * 2);
    }
  }

  /**
   * Process response
   */
  private async processResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorData: any = {};
      
      if (contentType?.includes('application/json')) {
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }
      } else {
        errorData = { message: await response.text() };
      }
      
      throw new ApiErrorClass(
        errorData.message || ErrorMessages.api.serverError,
        errorData.code || 'API_ERROR',
        response.status,
        errorData.details
      );
    }
    
    if (contentType?.includes('application/json')) {
      return await response.json();
    }
    
    // Return raw response for non-JSON content
    return {
      success: true,
      data: await response.text() as any,
    };
  }

  /**
   * Main request method
   */
  async request<T = any>(
    url: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      baseUrl = this.baseUrl,
      timeout = this.defaultTimeout,
      retries = 0,
      retryDelay = 1000,
      withAuth = false,
      authType = 'bearer',
      customHeaders = {},
      method = 'GET',
      ...fetchOptions
    } = options;

    // Build full URL
    const fullUrl = baseUrl ? `${baseUrl}${url}` : url;

    // Build headers
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...customHeaders,
    };

    // Add auth header if needed
    if (withAuth) {
      const token = this.getAuthToken(authType);
      if (token) {
        if (authType === 'admin') {
          headers['Cookie'] = `admin-session=${token}`;
        } else {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }

    // Create fetch request
    const fetchRequest = () => fetch(fullUrl, {
      ...fetchOptions,
      method,
      headers,
    });

    try {
      // Check network connectivity
      if (typeof window !== 'undefined' && !navigator.onLine) {
        throw new NetworkError(ErrorMessages.network.offline);
      }

      // Make request with timeout and retries
      const response = retries > 0
        ? await this.retryRequest(fetchRequest, retries, retryDelay)
        : await this.createRequestWithTimeout(fetchRequest(), timeout);

      // Process response
      return await this.processResponse<T>(response);
    } catch (error) {
      // Handle different error types
      if (error instanceof ApiErrorClass) {
        throw error;
      } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new NetworkError(ErrorMessages.network.cannotReachServer);
      } else {
        throw new ApiErrorClass(
          error instanceof Error ? error.message : ErrorMessages.api.serverError,
          'UNKNOWN_ERROR',
          0,
          error
        );
      }
    }
  }

  // Convenience methods
  async get<T = any>(url: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T = any>(url: string, data?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T = any>(url: string, data?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T = any>(url: string, data?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T = any>(url: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * Upload file with progress
   */
  async upload<T = any>(
    url: string,
    formData: FormData,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { onUploadProgress, ...restOptions } = options;

    // Remove Content-Type header to let browser set it with boundary for multipart
    const headers = { ...restOptions.customHeaders };
    delete headers['Content-Type'];

    if (onUploadProgress && typeof XMLHttpRequest !== 'undefined') {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            onUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch {
              resolve({ success: true, data: xhr.responseText as any });
            }
          } else {
            reject(new ApiErrorClass(
              xhr.responseText || ErrorMessages.api.serverError,
              'UPLOAD_ERROR',
              xhr.status
            ));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new NetworkError());
        });

        xhr.addEventListener('timeout', () => {
          reject(new TimeoutError());
        });

        xhr.open('POST', url);
        
        // Set headers
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });

        if (options.withAuth) {
          const token = this.getAuthToken(options.authType || 'bearer');
          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          }
        }

        if (options.timeout) {
          xhr.timeout = options.timeout;
        }

        xhr.send(formData);
      });
    }

    // Fallback to fetch
    return this.request<T>(url, {
      ...restOptions,
      method: 'POST',
      body: formData,
      customHeaders: headers,
    });
  }
}

// ============================================
// 4. Default API Client Instance
// ============================================

const defaultApiClient = new ApiClient('/api', 30000);

// ============================================
// 5. Utility Functions
// ============================================

export const ApiUtils = {
  /**
   * Simple API call wrapper
   */
  async call<T = any>(
    url: string,
    options?: ApiRequestOptions
  ): Promise<T> {
    const response = await defaultApiClient.request<T>(url, options);
    
    if (!response.success) {
      throw new ApiErrorClass(
        response.error?.message || ErrorMessages.api.serverError,
        response.error?.code,
        undefined,
        response.error?.details
      );
    }
    
    return response.data!;
  },

  /**
   * Handle API error
   */
  handleError(error: any): string {
    if (error instanceof ApiErrorClass) {
      return error.message;
    } else if (error instanceof Error) {
      return error.message;
    } else if (typeof error === 'string') {
      return error;
    }
    return ErrorMessages.api.serverError;
  },

  /**
   * Check if error is API error
   */
  isApiError(error: any): error is ApiError {
    return error && error.isApiError === true;
  },

  /**
   * Create success response
   */
  success<T = any>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message: message || SuccessMessages.saved,
    };
  },

  /**
   * Create error response
   */
  error(message: string, code?: string, details?: any): ApiResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
      },
    };
  },

  /**
   * Build query string
   */
  buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, String(item)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  },
};

// ============================================
// 6. React Hooks
// ============================================

import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

export function useApi<T = any>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const { immediate = false, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const isMounted = useRef(true);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      
      if (!isMounted.current) return;
      
      if (response.success) {
        setData(response.data || null);
        if (onSuccess) onSuccess(response.data);
      } else {
        const errorMessage = response.error?.message || ErrorMessages.api.serverError;
        setError(errorMessage);
        if (onError) {
          onError(new ApiErrorClass(errorMessage, response.error?.code));
        }
      }
    } catch (err) {
      if (!isMounted.current) return;
      
      const errorMessage = ApiUtils.handleError(err);
      setError(errorMessage);
      
      if (onError) {
        if (err instanceof ApiErrorClass) {
          onError(err);
        } else {
          onError(new ApiErrorClass(errorMessage));
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [apiCall, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    data,
    error,
    loading,
    execute,
    setData,
    setError,
  };
}

export default {
  ApiClient,
  ApiErrorClass,
  NetworkError,
  TimeoutError,
  ValidationError,
  defaultApiClient,
  ApiUtils,
  useApi,
};
