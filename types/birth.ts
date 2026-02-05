/**
 * 出生信息类型定义
 * 
 * 职责边界：
 * - 定义用户出生信息的数据结构
 * - 包含验证规则和约束条件
 * - 为八字计算提供标准化输入格式
 */

/**
 * 出生信息核心接口
 */
export interface BirthInfo {
  year: number;         // 出生年份 (1900-2100)
  month: number;        // 出生月份 (1-12)
  day: number;          // 出生日期 (1-31)
  hour: number;         // 出生小时 (0-23)
  minute: number;       // 出生分钟 (0-59)
  timezone: string;     // 时区，默认 "Asia/Shanghai"
  gender?: 'male' | 'female'; // 性别（可选）
}

/**
 * 出生信息验证规则
 */
export interface BirthInfoValidationRules {
  year: {
    min: number;        // 最小年份
    max: number;        // 最大年份
  };
  month: {
    min: 1;
    max: 12;
  };
  day: {
    min: 1;
    max: 31;            // 具体最大值需要根据年月计算
  };
  hour: {
    min: 0;
    max: 23;
  };
  minute: {
    min: 0;
    max: 59;
  };
}

/**
 * 默认验证规则
 */
export const DEFAULT_VALIDATION_RULES: BirthInfoValidationRules = {
  year: { min: 1900, max: 2100 },
  month: { min: 1, max: 12 },
  day: { min: 1, max: 31 },
  hour: { min: 0, max: 23 },
  minute: { min: 0, max: 59 },
};

/**
 * 支持的时区列表
 */
export const SUPPORTED_TIMEZONES = [
  'Asia/Shanghai',      // 北京时间 (UTC+8)
  'Asia/Hong_Kong',     // 香港时间 (UTC+8)
  'Asia/Taipei',        // 台北时间 (UTC+8)
  'Asia/Singapore',     // 新加坡时间 (UTC+8)
  'UTC',                // 协调世界时
] as const;

/**
 * 支持的时区类型
 */
export type SupportedTimezone = typeof SUPPORTED_TIMEZONES[number];

/**
 * 出生信息验证结果
 */
export interface BirthInfoValidationResult {
  isValid: boolean;
  errors: string[];     // 验证错误信息列表
}

/**
 * 出生信息表单数据（前端使用）
 */
export interface BirthInfoFormData {
  year: string;         // 表单中为字符串
  month: string;
  day: string;
  hour: string;
  minute: string;
  timezone: string;
  gender?: 'male' | 'female';
}

/**
 * 出生信息转换选项
 */
export interface BirthInfoConversionOptions {
  validateRange?: boolean;      // 是否验证数值范围
  validateDate?: boolean;       // 是否验证日期有效性
  defaultTimezone?: string;     // 默认时区
}

/**
 * 出生地点信息（扩展用，MVP 暂不实现）
 */
export interface BirthLocation {
  country?: string;     // 国家
  province?: string;    // 省份/州
  city?: string;        // 城市
  latitude?: number;    // 纬度
  longitude?: number;   // 经度
  timezone?: string;    // 自动推导的时区
}

/**
 * 完整出生信息（包含地点，扩展用）
 */
export interface CompleteBirthInfo extends BirthInfo {
  location?: BirthLocation;
}