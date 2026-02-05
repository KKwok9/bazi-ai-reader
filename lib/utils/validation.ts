/**
 * 通用验证函数模块
 * 
 * 职责：
 * - 提供通用的数据验证函数
 * - 支持前端和后端共用的验证逻辑
 * - 提供标准化的验证结果格式
 * 
 * 使用场景：
 * - API 参数验证
 * - 前端表单验证
 * - 数据格式验证
 */

/**
 * 验证结果接口
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  details?: any;
}

/**
 * 验证数字是否在指定范围内
 */
export function validateNumberRange(
  value: any,
  min: number,
  max: number,
  fieldName: string = '数值'
): ValidationResult {
  // 类型检查
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return {
      isValid: false,
      error: `${fieldName}必须是有效数字`
    };
  }
  
  // 范围检查
  if (value < min || value > max) {
    return {
      isValid: false,
      error: `${fieldName}必须在 ${min}-${max} 之间`
    };
  }
  
  return { isValid: true };
}

/**
 * 验证年份
 */
export function validateYear(year: any): ValidationResult {
  return validateNumberRange(year, 1900, 2100, '年份');
}

/**
 * 验证月份
 */
export function validateMonth(month: any): ValidationResult {
  return validateNumberRange(month, 1, 12, '月份');
}

/**
 * 验证日期
 * 
 * TODO: 实现完整的日期验证
 * - 考虑闰年
 * - 考虑每月的天数差异
 */
export function validateDay(day: any, year?: number, month?: number): ValidationResult {
  // 基础范围验证
  const basicValidation = validateNumberRange(day, 1, 31, '日期');
  if (!basicValidation.isValid) {
    return basicValidation;
  }
  
  // TODO: 实现更精确的日期验证
  if (year && month) {
    const daysInMonth = getDaysInMonth(year, month);
    if (day > daysInMonth) {
      return {
        isValid: false,
        error: `${year}年${month}月最多只有${daysInMonth}天`
      };
    }
  }
  
  return { isValid: true };
}

/**
 * 验证小时
 */
export function validateHour(hour: any): ValidationResult {
  return validateNumberRange(hour, 0, 23, '小时');
}

/**
 * 验证分钟
 */
export function validateMinute(minute: any): ValidationResult {
  return validateNumberRange(minute, 0, 59, '分钟');
}

/**
 * 验证时区
 */
export function validateTimezone(timezone: any): ValidationResult {
  if (typeof timezone !== 'string') {
    return {
      isValid: false,
      error: '时区必须是字符串格式'
    };
  }
  
  // 支持的时区列表
  const supportedTimezones = [
    'Asia/Shanghai',
    'Asia/Hong_Kong',
    'Asia/Taipei',
    'Asia/Singapore',
    'UTC'
  ];
  
  if (!supportedTimezones.includes(timezone)) {
    return {
      isValid: false,
      error: '不支持的时区格式'
    };
  }
  
  return { isValid: true };
}

/**
 * 验证性别
 */
export function validateGender(gender: any): ValidationResult {
  // 可选字段
  if (gender === undefined || gender === null || gender === '') {
    return { isValid: true };
  }
  
  if (gender !== 'male' && gender !== 'female') {
    return {
      isValid: false,
      error: '性别必须是 male 或 female'
    };
  }
  
  return { isValid: true };
}

/**
 * 验证必填字段
 */
export function validateRequired(value: any, fieldName: string): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return {
      isValid: false,
      error: `${fieldName}是必填字段`
    };
  }
  
  return { isValid: true };
}

/**
 * 验证字符串长度
 */
export function validateStringLength(
  value: any,
  minLength: number,
  maxLength: number,
  fieldName: string = '字符串'
): ValidationResult {
  if (typeof value !== 'string') {
    return {
      isValid: false,
      error: `${fieldName}必须是字符串格式`
    };
  }
  
  if (value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName}长度不能少于${minLength}个字符`
    };
  }
  
  if (value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName}长度不能超过${maxLength}个字符`
    };
  }
  
  return { isValid: true };
}

/**
 * 验证数组
 */
export function validateArray(
  value: any,
  minLength?: number,
  maxLength?: number,
  fieldName: string = '数组'
): ValidationResult {
  if (!Array.isArray(value)) {
    return {
      isValid: false,
      error: `${fieldName}必须是数组格式`
    };
  }
  
  if (minLength !== undefined && value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName}至少需要${minLength}个元素`
    };
  }
  
  if (maxLength !== undefined && value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName}最多只能有${maxLength}个元素`
    };
  }
  
  return { isValid: true };
}

/**
 * 批量验证
 */
export function validateMultiple(validations: ValidationResult[]): ValidationResult {
  const errors: string[] = [];
  
  for (const validation of validations) {
    if (!validation.isValid && validation.error) {
      errors.push(validation.error);
    }
  }
  
  return {
    isValid: errors.length === 0,
    error: errors.length > 0 ? errors.join('; ') : undefined,
    details: errors
  };
}

/**
 * 获取指定年月的天数
 * 
 * TODO: 实现完整的日期计算逻辑
 */
function getDaysInMonth(year: number, month: number): number {
  // 使用 JavaScript Date 对象计算
  return new Date(year, month, 0).getDate();
}

/**
 * 检查是否为闰年
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * 验证日期是否存在
 */
export function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && 
         date.getMonth() === month - 1 && 
         date.getDate() === day;
}