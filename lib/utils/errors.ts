/**
 * 错误处理模块
 * 
 * 职责：
 * - 定义标准化的错误类型
 * - 提供错误创建和处理函数
 * - 支持错误日志记录
 * - 提供用户友好的错误信息
 */

import { ErrorResponse, ERROR_CODES, ErrorCode } from '@/types/api';

/**
 * 应用错误基类
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public readonly details?: any;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    this.details = details;

    // 确保堆栈跟踪正确
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 验证错误类
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(ERROR_CODES.INVALID_DATE, message, 400, true, details);
  }
}

/**
 * 计算错误类
 */
export class CalculationError extends AppError {
  constructor(message: string, details?: any) {
    super(ERROR_CODES.CALCULATION_FAILED, message, 500, true, details);
  }
}

/**
 * AI 服务错误类
 */
export class AIServiceError extends AppError {
  constructor(message: string, details?: any) {
    super(ERROR_CODES.AI_SERVICE_UNAVAILABLE, message, 502, true, details);
  }
}

/**
 * 创建标准化错误响应
 */
export function createErrorResponse(
  error: Error | AppError,
  requestId?: string
): ErrorResponse {
  // 如果是 AppError，使用其属性
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: error.timestamp,
        requestId,
      }
    };
  }

  // 处理普通 Error
  return {
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: error.message || '内部服务器错误',
      timestamp: new Date().toISOString(),
      requestId,
    }
  };
}

/**
 * 错误日志记录
 */
export function logError(error: Error | AppError, context?: any): void {
  const logData = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
  };

  // 如果是 AppError，添加额外信息
  if (error instanceof AppError) {
    Object.assign(logData, {
      code: error.code,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      details: error.details,
    });
  }

  // TODO: 集成实际的日志服务
  console.error('Application Error:', logData);
}

/**
 * 处理 API 错误
 */
export function handleAPIError(error: any): AppError {
  // 网络错误
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new AppError(
      ERROR_CODES.SERVICE_UNAVAILABLE,
      '网络连接失败，请检查网络设置',
      503,
      true
    );
  }

  // 超时错误
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return new AppError(
      ERROR_CODES.TIMEOUT,
      '请求超时，请稍后重试',
      504,
      true
    );
  }

  // HTTP 错误
  if (error.status) {
    const statusCode = error.status;
    let errorCode: ErrorCode;
    let message: string;

    switch (statusCode) {
      case 400:
        errorCode = ERROR_CODES.INVALID_DATE;
        message = '请求参数无效';
        break;
      case 401:
        errorCode = ERROR_CODES.AI_SERVICE_UNAVAILABLE;
        message = '身份验证失败';
        break;
      case 403:
        errorCode = ERROR_CODES.AI_SERVICE_UNAVAILABLE;
        message = '访问被拒绝';
        break;
      case 404:
        errorCode = ERROR_CODES.SERVICE_UNAVAILABLE;
        message = '请求的资源不存在';
        break;
      case 429:
        errorCode = ERROR_CODES.AI_QUOTA_EXCEEDED;
        message = '请求过于频繁，请稍后重试';
        break;
      case 500:
        errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR;
        message = '服务器内部错误';
        break;
      case 502:
        errorCode = ERROR_CODES.AI_SERVICE_UNAVAILABLE;
        message = '上游服务不可用';
        break;
      case 503:
        errorCode = ERROR_CODES.SERVICE_UNAVAILABLE;
        message = '服务暂时不可用';
        break;
      default:
        errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR;
        message = `HTTP 错误 ${statusCode}`;
    }

    return new AppError(errorCode, message, statusCode, true);
  }

  // 默认错误处理
  return new AppError(
    ERROR_CODES.INTERNAL_SERVER_ERROR,
    error.message || '未知错误',
    500,
    false
  );
}

/**
 * 获取用户友好的错误信息
 */
export function getUserFriendlyMessage(errorCode: ErrorCode): string {
  const messages: Record<ErrorCode, string> = {
    [ERROR_CODES.INVALID_DATE]: '请检查输入的日期时间是否正确',
    [ERROR_CODES.INVALID_TIME]: '请检查输入的时间格式是否正确',
    [ERROR_CODES.INVALID_TIMEZONE]: '请选择正确的时区',
    [ERROR_CODES.MISSING_REQUIRED_FIELD]: '请填写所有必填信息',
    [ERROR_CODES.INVALID_CHART_DATA]: '八字数据格式错误，请重新排盘',
    [ERROR_CODES.CALCULATION_FAILED]: '八字计算失败，请稍后重试',
    [ERROR_CODES.LIBRARY_ERROR]: '计算库出现问题，请联系技术支持',
    [ERROR_CODES.DATA_CONVERSION_ERROR]: '数据转换失败，请重新尝试',
    [ERROR_CODES.AI_SERVICE_UNAVAILABLE]: 'AI 解读服务暂时不可用，请稍后重试',
    [ERROR_CODES.AI_RESPONSE_INVALID]: 'AI 解读结果异常，请重新获取',
    [ERROR_CODES.AI_QUOTA_EXCEEDED]: 'AI 服务使用量超限，请稍后重试',
    [ERROR_CODES.INTERNAL_SERVER_ERROR]: '服务器出现问题，请稍后重试',
    [ERROR_CODES.SERVICE_UNAVAILABLE]: '服务暂时不可用，请稍后重试',
    [ERROR_CODES.TIMEOUT]: '请求超时，请检查网络连接后重试',
  };

  return messages[errorCode] || '出现未知错误，请稍后重试';
}

/**
 * 重试机制
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // 记录重试日志
      console.warn(`Operation failed (attempt ${attempt}/${maxRetries}):`, error);
      
      // 如果是最后一次尝试，直接抛出错误
      if (attempt === maxRetries) {
        break;
      }
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}

/**
 * 错误边界处理
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * 生成请求 ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 错误恢复建议
 */
export function getRecoveryAction(errorCode: ErrorCode): string {
  const actions: Record<ErrorCode, string> = {
  [ERROR_CODES.INVALID_DATE]: '请检查并修正出生日期',
  [ERROR_CODES.INVALID_TIME]: '请检查并修正出生时间',
  [ERROR_CODES.INVALID_TIMEZONE]: '请重新选择时区',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: '请填写所有必填信息',
  [ERROR_CODES.INVALID_CHART_DATA]: '命盘数据异常，请重新计算',
  [ERROR_CODES.CALCULATION_FAILED]: '计算失败，请稍后重试',

  // —— AI / 服务类错误 ——
  [ERROR_CODES.AI_SERVICE_UNAVAILABLE]: 'AI 服务暂时不可用，请稍后再试',
  [ERROR_CODES.AI_QUOTA_EXCEEDED]: 'AI 使用额度已达上限，请稍后再试',
  [ERROR_CODES.TIMEOUT]: '请求超时，请检查网络后重试',

  // —— 🔴 缺失的 5 个（关键）——
  [ERROR_CODES.LIBRARY_ERROR]: '算法库异常，请稍后重试',
  [ERROR_CODES.DATA_CONVERSION_ERROR]: '数据转换失败，请重新提交',
  [ERROR_CODES.AI_RESPONSE_INVALID]: 'AI 返回结果异常，请重试',
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: '系统内部错误，请稍后重试',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: '服务暂不可用，请稍后再试',
};

  return actions[errorCode] || '请刷新页面或联系技术支持';
}