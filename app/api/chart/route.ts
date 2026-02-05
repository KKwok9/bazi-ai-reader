/**
 * /api/chart 路由 - 八字计算 API
 * 
 * 严格职责边界：
 * ✅ 允许：接收出生信息，调用确定性算法，返回 Chart_Data_v1 JSON
 * ✅ 允许：参数验证和错误处理
 * ✅ 允许：调用 lib/bazi 模块进行计算
 * ❌ 禁止：包含任何 AI 相关逻辑
 * ❌ 禁止：调用 lib/ai 模块
 * ❌ 禁止：进行文本解读或分析
 * ❌ 禁止：在计算失败时调用 AI 进行补偿
 * 
 * API 契约：
 * - 输入：ChartRequest (出生信息)
 * - 输出：ChartResponse (ChartDataV1 或错误信息)
 * - 方法：POST
 * - 内容类型：application/json
 */

import { NextRequest, NextResponse } from 'next/server';
import { ChartRequest, ChartResponse, ERROR_CODES } from '@/types/api';
import { BirthInfo } from '@/types/birth';
import { ChartDataV1 } from '@/types/chart';
import { baziCalculator } from '@/lib/bazi/calculator';
import { birthInfoValidator } from '@/lib/bazi/validator';

/**
 * POST /api/chart - 计算八字命盘
 * 
 * TODO: 实现完整的计算逻辑
 * 1. 验证请求参数
 * 2. 转换为 BirthInfo 格式
 * 3. 调用八字计算器
 * 4. 返回标准化响应
 */
export async function POST(request: NextRequest): Promise<NextResponse<ChartResponse>> {
  // 设置请求超时控制（10秒）
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), 10000);
  });

  try {
    // 解析请求体（带超时控制）
    const body: ChartRequest = await Promise.race([
      request.json(),
      timeoutPromise
    ]);
    
    // 验证请求参数
    const validationResult = validateChartRequest(body);
    if (!validationResult.isValid) {
      return NextResponse.json({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_DATE,
          message: validationResult.error || '请求参数无效',
          timestamp: new Date().toISOString(),
        }
      }, { status: 400 });
    }
    
    // 转换为 BirthInfo 格式
    const birthInfo: BirthInfo = convertToBirthInfo(body);
    
    // 使用验证器进行详细验证
    const birthInfoValidation = birthInfoValidator.validate(birthInfo);
    if (!birthInfoValidation.isValid) {
      return NextResponse.json({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_DATE,
          message: birthInfoValidation.errors.join('; '),
          timestamp: new Date().toISOString(),
        }
      }, { status: 400 });
    }
    
    // 调用八字计算器（带超时控制）
    const chartData = await Promise.race([
      baziCalculator.calculate(birthInfo),
      timeoutPromise
    ]);
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: chartData,
    });
    
  } catch (error) {
    console.error('Chart calculation error:', error);
    
    // 处理超时错误
    if (error instanceof Error && error.message === 'Request timeout') {
      return NextResponse.json({
        success: false,
        error: {
          code: ERROR_CODES.CALCULATION_FAILED,
          message: '请求超时，请稍后重试',
          timestamp: new Date().toISOString(),
        }
      }, { status: 408 });
    }
    
    // 返回服务器错误
    return NextResponse.json({
      success: false,
      error: {
        code: ERROR_CODES.CALCULATION_FAILED,
        message: error instanceof Error ? error.message : '八字计算失败，请稍后重试',
        timestamp: new Date().toISOString(),
      }
    }, { status: 500 });
  }
}

/**
 * 验证 ChartRequest 参数
 * 
 * TODO: 实现完整的参数验证
 * 1. 检查必填字段
 * 2. 验证数值范围
 * 3. 验证日期有效性
 * 4. 验证时区格式
 */
function validateChartRequest(request: ChartRequest): { isValid: boolean; error?: string } {
  // 基础验证
  if (!request) {
    return { isValid: false, error: '请求体不能为空' };
  }
  
  // 必填字段验证
  const requiredFields: (keyof ChartRequest)[] = [
    'birthYear', 'birthMonth', 'birthDay', 'birthHour', 'birthMinute'
  ];
  
  for (const field of requiredFields) {
    if (request[field] === undefined || request[field] === null) {
      return { isValid: false, error: `缺少必填字段: ${field}` };
    }
  }
  
  // 数值类型验证
  if (typeof request.birthYear !== 'number' || 
      typeof request.birthMonth !== 'number' ||
      typeof request.birthDay !== 'number' ||
      typeof request.birthHour !== 'number' ||
      typeof request.birthMinute !== 'number') {
    return { isValid: false, error: '时间字段必须是数字' };
  }
  
  // 基础范围验证
  if (request.birthYear < 1900 || request.birthYear > 2100) {
    return { isValid: false, error: '年份必须在 1900-2100 之间' };
  }
  
  if (request.birthMonth < 1 || request.birthMonth > 12) {
    return { isValid: false, error: '月份必须在 1-12 之间' };
  }
  
  if (request.birthDay < 1 || request.birthDay > 31) {
    return { isValid: false, error: '日期必须在 1-31 之间' };
  }
  
  if (request.birthHour < 0 || request.birthHour > 23) {
    return { isValid: false, error: '小时必须在 0-23 之间' };
  }
  
  if (request.birthMinute < 0 || request.birthMinute > 59) {
    return { isValid: false, error: '分钟必须在 0-59 之间' };
  }
  
  return { isValid: true };
}

/**
 * 转换为 BirthInfo 格式
 */
function convertToBirthInfo(request: ChartRequest): BirthInfo {
  return {
    year: request.birthYear,
    month: request.birthMonth,
    day: request.birthDay,
    hour: request.birthHour,
    minute: request.birthMinute,
    timezone: request.timezone || 'Asia/Shanghai',
    gender: request.gender,
  };
}

/**
 * GET 方法处理（返回方法不支持错误）
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: {
      code: ERROR_CODES.INVALID_DATE,
      message: '此接口仅支持 POST 方法',
      timestamp: new Date().toISOString(),
    }
  }, { status: 405 });
}