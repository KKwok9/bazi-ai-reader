/**
 * /api/interpret 路由 - AI 解读 API
 * 
 * 严格职责边界：
 * ✅ 允许：接收 ChartDataV1，生成解读文本，返回 Reading_Response
 * ✅ 允许：参数验证和错误处理
 * ✅ 允许：调用 lib/ai 模块进行解读
 * ❌ 禁止：访问原始出生信息
 * ❌ 禁止：进行任何八字计算或推算
 * ❌ 禁止：修改或重新计算 ChartDataV1 中的任何数据
 * ❌ 禁止：调用 lib/bazi 模块
 * 
 * API 契约：
 * - 输入：InterpretRequest (ChartDataV1 + 可选的解读方向)
 * - 输出：InterpretResponse (ReadingData 或错误信息)
 * - 方法：POST
 * - 内容类型：application/json
 */

import { NextRequest, NextResponse } from 'next/server';
import { InterpretRequest, InterpretResponse, ERROR_CODES } from '@/types/api';
import { ChartDataV1 } from '@/types/chart';
import { aiInterpreter } from '@/lib/ai/interpreter';
import { FOCUS_AREAS } from '@/lib/ai/prompt';

/**
 * POST /api/interpret - 生成八字解读
 * 
 * 重要约束：
 * - 严禁访问原始出生信息
 * - 严禁修改 ChartDataV1 中的任何数据
 * - 只能基于提供的 ChartDataV1 进行解读
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<InterpretResponse>> {
  // 设置请求超时控制（30秒，AI 调用需要更长时间）
  console.log('🔥 interpret POST called');
  console.log('MODEL =', process.env.OPENAI_MODEL);
  console.log('HAS KEY =', !!process.env.OPENAI_API_KEY);
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), 90000);
  });

  try {
    // 解析请求体（带超时控制）
    const body: InterpretRequest = await Promise.race([
      request.json(),
      timeoutPromise
    ]);
    
    // 验证请求参数
    const validationResult = validateInterpretRequest(body);
    if (!validationResult.isValid) {
      return NextResponse.json({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_CHART_DATA,
          message: validationResult.error || '请求参数无效',
          timestamp: new Date().toISOString(),
        }
      }, { status: 400 });
    }
    
    // 调用 AI 解读器（带超时控制）
    const readingData = await Promise.race([
      aiInterpreter(body.chartData),
      timeoutPromise
    ]); 
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: readingData,
    });
    
  } catch (error) {
    console.error('AI interpretation error:', error);
    
    // 处理超时错误
    if (error instanceof Error && error.message === 'Request timeout') {
      return NextResponse.json({
        success: false,
        error: {
          code: ERROR_CODES.AI_SERVICE_UNAVAILABLE,
          message: 'AI 解读请求超时，请稍后重试',
          timestamp: new Date().toISOString(),
        }
      }, { status: 408 });
    }
    
    // 判断错误类型并返回相应的错误响应
    if (error instanceof Error) {
      if (error.message.includes('AI service')) {
        return NextResponse.json({
          success: false,
          error: {
            code: ERROR_CODES.AI_SERVICE_UNAVAILABLE,
            message: 'AI 解读服务暂时不可用，请稍后重试',
            timestamp: new Date().toISOString(),
          }
        }, { status: 502 });
      }
      
      if (error.message.includes('Invalid ChartDataV1')) {
        return NextResponse.json({
          success: false,
          error: {
            code: ERROR_CODES.INVALID_CHART_DATA,
            message: '八字数据格式无效',
            timestamp: new Date().toISOString(),
          }
        }, { status: 400 });
      }
      
      if (error.message.includes('timeout') || error.message.includes('rate limit')) {
        return NextResponse.json({
          success: false,
          error: {
            code: ERROR_CODES.AI_QUOTA_EXCEEDED,
            message: 'AI 服务请求超限，请稍后重试',
            timestamp: new Date().toISOString(),
          }
        }, { status: 429 });
      }
    }
    
    // 返回通用服务器错误
    return NextResponse.json({
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: '解读生成失败，请稍后重试',
        timestamp: new Date().toISOString(),
      }
    }, { status: 500 });
  }
}

/**
 * 验证 InterpretRequest 参数
 * 
 * 重要：此验证只检查格式，不修改任何数据
 */
function validateInterpretRequest(request: InterpretRequest): { isValid: boolean; error?: string } {
  // 基础验证
  if (!request) {
    return { isValid: false, error: '请求体不能为空' };
  }
  
  // chartData 必填验证
  if (!request.chartData) {
    return { isValid: false, error: '缺少必填字段: chartData' };
  }
  
  // ChartDataV1 格式验证
  const chartValidation = validateChartDataV1(request.chartData);
  if (!chartValidation.isValid) {
    return { isValid: false, error: `ChartData 格式无效: ${chartValidation.error}` };
  }
  
  // focusAreas 验证（可选）
  if (request.focusAreas) {
    if (!Array.isArray(request.focusAreas)) {
      return { isValid: false, error: 'focusAreas 必须是数组格式' };
    }
    
    // 验证 focusAreas 的有效值
    const validFocusAreas = [
      FOCUS_AREAS.PERSONALITY,
      FOCUS_AREAS.FORTUNE,
      FOCUS_AREAS.CAREER,
      FOCUS_AREAS.RELATIONSHIP,
      FOCUS_AREAS.HEALTH,
      FOCUS_AREAS.WEALTH
    ];
    const invalidAreas = request.focusAreas.filter(area => !validFocusAreas.some(valid => valid === area));
    
    if (invalidAreas.length > 0) {
      return { 
        isValid: false, 
        error: `无效的解读方向: ${invalidAreas.join(', ')}。有效值: ${validFocusAreas.join(', ')}` 
      };
    }
  }
  
  return { isValid: true };
}

/**
 * 验证 ChartDataV1 格式（只读验证）
 * 
 * 重要约束：
 * - 此函数只进行格式验证，不修改任何数据
 * - 不验证计算结果的正确性（那是计算模块的职责）
 * - 只确保数据格式符合 v1 Schema
 */
function validateChartDataV1(chartData: ChartDataV1): { isValid: boolean; error?: string } {
  // 版本验证
  if (chartData.version !== "1.0") {
    return { isValid: false, error: '不支持的 ChartData 版本' };
  }
  
  // 必填字段验证
  if (!chartData.pillars) {
    return { isValid: false, error: '缺少 pillars 字段' };
  }
  
  if (!chartData.elements) {
    return { isValid: false, error: '缺少 elements 字段' };
  }
  
  if (!chartData.tenGods) {
    return { isValid: false, error: '缺少 tenGods 字段' };
  }
  
  if (!chartData.metadata) {
    return { isValid: false, error: '缺少 metadata 字段' };
  }
  
  // 四柱结构验证
  const positions = ['year', 'month', 'day', 'hour'] as const;
  for (const pos of positions) {
    const pillar = chartData.pillars[pos];
    if (!pillar || typeof pillar.heavenly !== 'string' || typeof pillar.earthly !== 'string') {
      return { isValid: false, error: `pillars.${pos} 格式无效` };
    }
  }
  
  // 五行结构验证
  for (const pos of positions) {
    if (typeof chartData.elements[pos] !== 'string') {
      return { isValid: false, error: `elements.${pos} 格式无效` };
    }
  }
  if (typeof chartData.elements.dayMaster !== 'string') {
    return { isValid: false, error: 'elements.dayMaster 格式无效' };
  }
  
  // 十神结构验证
  for (const pos of positions) {
    if (typeof chartData.tenGods[pos] !== 'string') {
      return { isValid: false, error: `tenGods.${pos} 格式无效` };
    }
  }
  
  // 元数据验证
  //if (chartData.metadata.source !== 'algorithm_computed') {
  //  return { isValid: false, error: 'metadata.source 必须为 "algorithm_computed"' };
  //}
  
  if (typeof chartData.metadata.library !== 'string' || !chartData.metadata.library) {
    return { isValid: false, error: 'metadata.library 格式无效' };
  }
  
  if (typeof chartData.metadata.calculatedAt !== 'string' || !chartData.metadata.calculatedAt) {
    return { isValid: false, error: 'metadata.calculatedAt 格式无效' };
  }
  
  return { isValid: true };
}

/**
 * GET 方法处理（返回方法不支持错误）
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: {
      code: ERROR_CODES.INVALID_CHART_DATA,
      message: '此接口仅支持 POST 方法',
      timestamp: new Date().toISOString(),
    }
  }, { status: 405 });
}