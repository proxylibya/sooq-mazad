// API Response utilities and types
import { NextApiResponse } from 'next';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

type AnyObject = Record<string, unknown>;
type SuccessResponse<T, M extends AnyObject = AnyObject> = ApiResponse<T> & M & { code?: string };
type ErrorResponse<M extends AnyObject = AnyObject> = ApiResponse &
  M & { code?: string; details?: unknown };

export class ResponseBuilder {
  private response: NextApiResponse;

  constructor(res: NextApiResponse) {
    this.response = res;
  }

  success<T>(data: T, message?: string, pagination?: PaginationMeta): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
    };
    if (message !== undefined) response.message = message;
    if (pagination !== undefined) response.pagination = pagination;

    this.response.status(200).json(response);
  }

  created<T>(data: T, message?: string): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message: message || 'تم إنشاء المورد بنجاح',
    };

    this.response.status(201).json(response);
  }

  error(statusCode: number, message: string, code?: string, details?: unknown): void {
    const response: ErrorResponse = {
      success: false,
      error: message,
      message: code || 'خطأ في الخادم',
    };

    if (details !== undefined) {
      response.details = details;
    }

    this.response.status(statusCode).json(response);
  }

  badRequest(message: string = 'طلب غير صحيح'): void {
    this.error(400, message, 'BAD_REQUEST');
  }

  unauthorized(message: string = 'غير مخول للوصول'): void {
    this.error(401, message, 'UNAUTHORIZED');
  }

  forbidden(message: string = 'ممنوع الوصول'): void {
    this.error(403, message, 'FORBIDDEN');
  }

  notFound(message: string = 'المورد غير موجود'): void {
    this.error(404, message, 'NOT_FOUND');
  }

  conflict(message: string = 'تعارض في البيانات'): void {
    this.error(409, message, 'CONFLICT');
  }

  validationError(errors: Record<string, string>): void {
    this.error(422, 'بيانات غير صحيحة', 'VALIDATION_ERROR', errors);
  }

  serverError(message: string = 'خطأ في الخادم'): void {
    this.error(500, message, 'SERVER_ERROR');
  }

  paginated<T>(data: T[], page: number, limit: number, total: number, message?: string): void {
    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    this.success(data, message, pagination);
  }
}

export const createResponse = (res: NextApiResponse): ResponseBuilder => {
  return new ResponseBuilder(res);
};

export const handleApiError = (res: NextApiResponse, error: unknown, context?: string): void => {
  const responseBuilder = createResponse(res);

  console.error(`API Error${context ? ` in ${context}` : ''}:`, error);

  if (error instanceof Error) {
    if (error.message.includes('validation')) {
      responseBuilder.badRequest(error.message);
    } else if (error.message.includes('unauthorized')) {
      responseBuilder.unauthorized(error.message);
    } else if (error.message.includes('not found')) {
      responseBuilder.notFound(error.message);
    } else {
      responseBuilder.serverError(error.message);
    }
  } else {
    responseBuilder.serverError('خطأ غير معروف');
  }
};

// Static helper functions for backward compatibility
export const apiResponse = {
  // Generic custom response to avoid duplicating patterns
  custom: (res: NextApiResponse, status: number, body: unknown) => {
    return res.status(status).json(body);
  },

  ok: (res: NextApiResponse, data: unknown, meta?: Record<string, unknown>, code?: string) => {
    const response: SuccessResponse<unknown, AnyObject> = { success: true, data };
    if (meta) {
      Object.assign(response, meta);
    }
    if (code) {
      response.code = code;
    }
    return res.status(200).json(response);
  },

  created: (res: NextApiResponse, data: unknown, meta?: Record<string, unknown>, code?: string) => {
    const response: SuccessResponse<unknown, AnyObject> = { success: true, data };
    if (meta) {
      Object.assign(response, meta);
    }
    if (code) {
      response.code = code;
    }
    return res.status(201).json(response);
  },

  badRequest: (
    res: NextApiResponse,
    message: string = 'طلب غير صحيح',
    details?: unknown,
    meta?: Record<string, unknown>,
    code?: string,
  ) => {
    const response: ErrorResponse = {
      success: false,
      error: message,
      code: code || 'BAD_REQUEST',
    };
    if (details) {
      response.details = details;
    }
    if (meta) {
      Object.assign(response, meta);
    }
    return res.status(400).json(response);
  },

  unauthorized: (res: NextApiResponse, message: string = 'غير مخول للوصول') => {
    return res.status(401).json({
      success: false,
      error: message,
      code: 'UNAUTHORIZED',
    });
  },

  forbidden: (
    res: NextApiResponse,
    message: string = 'ممنوع الوصول',
    details?: unknown,
    meta?: Record<string, unknown>,
    code?: string,
  ) => {
    const response: ErrorResponse = {
      success: false,
      error: message,
      code: code || 'FORBIDDEN',
    };
    if (details) {
      response.details = details;
    }
    if (meta) {
      Object.assign(response, meta);
    }
    return res.status(403).json(response);
  },

  notFound: (
    res: NextApiResponse,
    message: string = 'المورد غير موجود',
    details?: unknown,
    meta?: Record<string, unknown>,
    code?: string,
  ) => {
    const response: ErrorResponse = {
      success: false,
      error: message,
      code: code || 'NOT_FOUND',
    };
    if (details) {
      response.details = details;
    }
    if (meta) {
      Object.assign(response, meta);
    }
    return res.status(404).json(response);
  },

  conflict: (
    res: NextApiResponse,
    message: string = 'تعارض في البيانات',
    details?: unknown,
    meta?: Record<string, unknown>,
    code?: string,
  ) => {
    const response: ErrorResponse = {
      success: false,
      error: message,
      code: code || 'CONFLICT',
    };
    if (details) {
      response.details = details;
    }
    if (meta) {
      Object.assign(response, meta);
    }
    return res.status(409).json(response);
  },

  methodNotAllowed: (res: NextApiResponse, allowed: string[]) => {
    res.setHeader('Allow', allowed.join(', '));
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      allowed,
      code: 'METHOD_NOT_ALLOWED',
    });
  },

  serverError: (
    res: NextApiResponse,
    message: string = 'خطأ في الخادم',
    details?: unknown,
    meta?: Record<string, unknown>,
    code?: string,
  ) => {
    const response: ErrorResponse = {
      success: false,
      error: message,
      code: code || 'SERVER_ERROR',
    };
    if (details) {
      response.details = details;
    }
    if (meta) {
      Object.assign(response, meta);
    }
    return res.status(500).json(response);
  },
};

export default apiResponse;
