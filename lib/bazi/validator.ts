/**
 * 出生信息验证模块
 * 
 * 严格职责边界：
 * ✅ 允许：验证出生信息的格式和有效性
 * ✅ 允许：检查日期时间的合理性
 * ✅ 允许：验证时区信息
 * ❌ 禁止：任何 AI 相关的验证逻辑
 * ❌ 禁止：包含解读或分析功能
 * ❌ 禁止：修改或推测用户输入
 * 
 * 安全约束：
 * - 仅进行数据验证，不进行数据修改
 * - 所有验证规则必须基于确定性逻辑
 * - 验证失败时提供明确的错误信息
 */

import { BirthInfo, BirthInfoFormData, BirthInfoValidationResult, DEFAULT_VALIDATION_RULES, SUPPORTED_TIMEZONES } from '@/types/birth';

/**
 * 出生信息验证器接口
 */
export interface BirthInfoValidator {
  /**
   * 验证出生信息
   */
  validate(birthInfo: BirthInfo): BirthInfoValidationResult;
  
  /**
   * 验证表单数据并转换
   */
  validateAndConvert(formData: BirthInfoFormData): { isValid: boolean; birthInfo?: BirthInfo; errors: string[] };
  
  /**
   * 验证单个字段
   */
  validateField(field: keyof BirthInfo, value: any): { isValid: boolean; error?: string };
}

/**
 * 出生信息验证器实现类
 * 
 * TODO: 实现完整的验证逻辑
 * - 日期有效性验证（闰年、月份天数等）
 * - 时间格式验证
 * - 时区验证
 * - 数值范围验证
 */
export class BirthInfoValidatorImpl implements BirthInfoValidator {
  
  /**
   * 验证出生信息
   */
  validate(birthInfo: BirthInfo): BirthInfoValidationResult {
    const errors: string[] = [];
    
    // 基础类型验证
    if (!this.isValidNumber(birthInfo.year)) {
      errors.push('出生年份必须是有效数字');
    } else {
      const yearValidation = this.validateYear(birthInfo.year);
      if (!yearValidation.isValid) {
        errors.push(yearValidation.error!);
      }
    }
    
    if (!this.isValidNumber(birthInfo.month)) {
      errors.push('出生月份必须是有效数字');
    } else {
      const monthValidation = this.validateMonth(birthInfo.month);
      if (!monthValidation.isValid) {
        errors.push(monthValidation.error!);
      }
    }
    
    if (!this.isValidNumber(birthInfo.day)) {
      errors.push('出生日期必须是有效数字');
    } else {
      const dayValidation = this.validateDay(birthInfo.day);
      if (!dayValidation.isValid) {
        errors.push(dayValidation.error!);
      }
    }
    
    if (!this.isValidNumber(birthInfo.hour)) {
      errors.push('出生小时必须是有效数字');
    } else {
      const hourValidation = this.validateHour(birthInfo.hour);
      if (!hourValidation.isValid) {
        errors.push(hourValidation.error!);
      }
    }
    
    if (!this.isValidNumber(birthInfo.minute)) {
      errors.push('出生分钟必须是有效数字');
    } else {
      const minuteValidation = this.validateMinute(birthInfo.minute);
      if (!minuteValidation.isValid) {
        errors.push(minuteValidation.error!);
      }
    }
    
    // 时区验证
    const timezoneValidation = this.validateTimezone(birthInfo.timezone);
    if (!timezoneValidation.isValid) {
      errors.push(timezoneValidation.error!);
    }
    
    // 性别验证（可选）
    if (birthInfo.gender !== undefined) {
      const genderValidation = this.validateGender(birthInfo.gender);
      if (!genderValidation.isValid) {
        errors.push(genderValidation.error!);
      }
    }
    
    // 日期有效性验证（如果基础验证通过）
    if (errors.length === 0 || errors.every(e => !e.includes('必须是有效数字'))) {
      if (!this.isValidDate(birthInfo.year, birthInfo.month, birthInfo.day)) {
        errors.push('日期无效，请检查年月日组合');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * 验证表单数据并转换为 BirthInfo
   * 
   * TODO: 实现表单数据转换
   * 1. 字符串转数字
   * 2. 数据格式验证
   * 3. 默认值处理
   */
  validateAndConvert(formData: BirthInfoFormData): { isValid: boolean; birthInfo?: BirthInfo; errors: string[] } {
    const errors: string[] = [];
    
    // TODO: 实现表单数据转换逻辑
    
    try {
      const birthInfo: BirthInfo = {
        year: parseInt(formData.year, 10),
        month: parseInt(formData.month, 10),
        day: parseInt(formData.day, 10),
        hour: parseInt(formData.hour, 10),
        minute: parseInt(formData.minute, 10),
        timezone: formData.timezone || 'Asia/Shanghai',
        gender: formData.gender,
      };
      
      // 验证转换后的数据
      const validationResult = this.validate(birthInfo);
      
      return {
        isValid: validationResult.isValid,
        birthInfo: validationResult.isValid ? birthInfo : undefined,
        errors: validationResult.errors
      };
      
    } catch (error) {
      errors.push('数据格式转换失败');
      return { isValid: false, errors };
    }
  }
  
  /**
   * 验证单个字段
   * 
   * TODO: 实现单字段验证
   * - 用于实时表单验证
   * - 提供具体的错误信息
   */
  validateField(field: keyof BirthInfo, value: any): { isValid: boolean; error?: string } {
    // TODO: 实现单字段验证逻辑
    
    switch (field) {
      case 'year':
        return this.validateYear(value);
      case 'month':
        return this.validateMonth(value);
      case 'day':
        return this.validateDay(value);
      case 'hour':
        return this.validateHour(value);
      case 'minute':
        return this.validateMinute(value);
      case 'timezone':
        return this.validateTimezone(value);
      case 'gender':
        return this.validateGender(value);
      default:
        return { isValid: false, error: '未知字段' };
    }
  }
  
  /**
   * 验证年份
   * 
   * TODO: 实现年份验证逻辑
   */
  private validateYear(year: any): { isValid: boolean; error?: string } {
    // TODO: 实现年份验证
    if (!this.isValidNumber(year)) {
      return { isValid: false, error: '年份必须是数字' };
    }
    
    const yearNum = Number(year);
    if (yearNum < DEFAULT_VALIDATION_RULES.year.min || yearNum > DEFAULT_VALIDATION_RULES.year.max) {
      return { isValid: false, error: `年份必须在 ${DEFAULT_VALIDATION_RULES.year.min}-${DEFAULT_VALIDATION_RULES.year.max} 之间` };
    }
    
    return { isValid: true };
  }
  
  /**
   * 验证月份
   */
  private validateMonth(month: any): { isValid: boolean; error?: string } {
    if (!this.isValidNumber(month)) {
      return { isValid: false, error: '月份必须是数字' };
    }
    
    const monthNum = Number(month);
    if (monthNum < 1 || monthNum > 12) {
      return { isValid: false, error: '月份必须在 1-12 之间' };
    }
    
    return { isValid: true };
  }
  
  /**
   * 验证日期
   */
  private validateDay(day: any): { isValid: boolean; error?: string } {
    if (!this.isValidNumber(day)) {
      return { isValid: false, error: '日期必须是数字' };
    }
    
    const dayNum = Number(day);
    if (dayNum < 1 || dayNum > 31) {
      return { isValid: false, error: '日期必须在 1-31 之间' };
    }
    
    return { isValid: true };
  }
  
  /**
   * 验证小时
   */
  private validateHour(hour: any): { isValid: boolean; error?: string } {
    if (!this.isValidNumber(hour)) {
      return { isValid: false, error: '小时必须是数字' };
    }
    
    const hourNum = Number(hour);
    if (hourNum < 0 || hourNum > 23) {
      return { isValid: false, error: '小时必须在 0-23 之间' };
    }
    
    return { isValid: true };
  }
  
  /**
   * 验证分钟
   */
  private validateMinute(minute: any): { isValid: boolean; error?: string } {
    if (!this.isValidNumber(minute)) {
      return { isValid: false, error: '分钟必须是数字' };
    }
    
    const minuteNum = Number(minute);
    if (minuteNum < 0 || minuteNum > 59) {
      return { isValid: false, error: '分钟必须在 0-59 之间' };
    }
    
    return { isValid: true };
  }
  
  /**
   * 验证时区
   */
  private validateTimezone(timezone: any): { isValid: boolean; error?: string } {
    // TODO: 实现时区验证
    if (typeof timezone !== 'string') {
      return { isValid: false, error: '时区必须是字符串' };
    }
    
    if (!SUPPORTED_TIMEZONES.some(tz => tz === timezone)) {
      return { isValid: false, error: '不支持的时区格式' };
    }
    
    return { isValid: true };
  }
  
  /**
   * 验证性别
   */
  private validateGender(gender: any): { isValid: boolean; error?: string } {
    if (gender === undefined) {
      return { isValid: true }; // 可选字段
    }
    
    if (gender !== 'male' && gender !== 'female') {
      return { isValid: false, error: '性别必须是 male 或 female' };
    }
    
    return { isValid: true };
  }
  
  /**
   * 检查是否为有效数字
   */
  private isValidNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }
  
  /**
   * 检查日期是否有效（考虑闰年）
   */
  private isValidDate(year: number, month: number, day: number): boolean {
    // 创建日期对象进行验证
    const date = new Date(year, month - 1, day);
    
    // 检查日期是否被自动调整（如2月30日会被调整为3月2日）
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day;
  }
}

/**
 * 默认出生信息验证器实例
 */
export const birthInfoValidator = new BirthInfoValidatorImpl();