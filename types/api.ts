/**
 * API 请求响应类型定义
 * 
 * 职责边界：
 * - 定义 /api/chart 和 /api/interpret 的接口契约
 * - 确保类型安全和 API 一致性
 * - 包含完整的错误处理类型
 */

import { ChartDataV1 } from './chart';

/**
 * 标准化错误响应接口
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;           // 错误代码，如 "INVALID_DATE", "CALCULATION_FAILED"
    message: string;        // 用户友好的错误信息
    details?: any;          // 详细错误信息（开发环境可用）
    timestamp: string;      // 错误发生时间 (ISO 8601)
    requestId?: string;     // 请求追踪ID（用于日志关联）
  };
}

/**
 * 成功响应基础接口
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * 通用 API 响应类型
 */
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// ==================== /api/chart 相关类型 ====================

/**
 * /api/chart 请求接口
 * 
 * 约束：
 * - 所有时间字段必须为有效数值
 * - timezone 默认为 "Asia/Shanghai"
 * - gender 为可选字段，某些高级计算可能需要
 */
export interface ChartRequest {
  birthYear: number;        // 出生年份 (1900-2100)
  birthMonth: number;       // 出生月份 (1-12)
  birthDay: number;         // 出生日期 (1-31)
  birthHour: number;        // 出生小时 (0-23)
  birthMinute: number;      // 出生分钟 (0-59)
  timezone?: string;        // 时区，默认 "Asia/Shanghai"
  gender?: 'male' | 'female'; // 性别（可选，某些计算可能需要）
}

/**
 * /api/chart 响应类型
 */
export type ChartResponse = ApiResponse<ChartDataV1>;

// ==================== /api/interpret 相关类型 ====================

/**
 * /api/interpret 请求接口
 * 
 * 约束：
 * - chartData 必须是有效的 ChartDataV1 格式
 * - focusAreas 为可选的解读方向指定
 * - AI 模块严禁访问原始出生信息
 */
export interface InterpretRequest {
  chartData: ChartDataV1;   // 必须：八字命盘数据
  focusAreas?: string[];    // 可选：用户关注的解读方向 ["personality", "fortune", "career"]
}

/**
 * AI 解读结果数据
 */
export interface ReadingData {
  personality: string;      // 性格特征解读
  fortune: string;          // 运势概述
  suggestions: string;      // 建议指导
  generatedAt: string;      // 生成时间 (ISO 8601)
}

/**
 * /api/interpret 响应类型
 */
export type InterpretResponse = ApiResponse<ReadingData>;

// ==================== 错误代码常量 ====================

/**
 * 标准化错误代码
 */
export const ERROR_CODES = {
  // 输入验证错误 (400)
  INVALID_DATE: 'INVALID_DATE',
  INVALID_TIME: 'INVALID_TIME', 
  INVALID_TIMEZONE: 'INVALID_TIMEZONE',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_CHART_DATA: 'INVALID_CHART_DATA',
  
  // 计算错误 (500)
  CALCULATION_FAILED: 'CALCULATION_FAILED',
  LIBRARY_ERROR: 'LIBRARY_ERROR',
  DATA_CONVERSION_ERROR: 'DATA_CONVERSION_ERROR',
  
  // AI 服务错误 (502)
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',
  AI_RESPONSE_INVALID: 'AI_RESPONSE_INVALID',
  AI_QUOTA_EXCEEDED: 'AI_QUOTA_EXCEEDED',
  
  // 系统错误 (500/503)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
} as const;

/**
 * 错误代码类型
 */
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];