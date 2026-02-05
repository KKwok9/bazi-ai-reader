/**
 * 八字数据转换模块
 * 
 * 严格职责边界：
 * ✅ 允许：将第三方库结果转换为 Chart_Data v1 格式
 * ✅ 允许：数据格式标准化和验证
 * ✅ 允许：处理可选字段的默认值
 * ❌ 禁止：任何计算逻辑
 * ❌ 禁止：AI 相关的数据处理
 * ❌ 禁止：修改计算结果的内容
 * 
 * 安全约束：
 * - 仅进行数据格式转换，不修改计算结果
 * - 严格按照 Chart_Data v1 Schema 进行转换
 * - 确保转换过程的确定性和可重现性
 */

import { ChartDataV1, ChartDataOptions } from '@/types/chart';

/**
 * 第三方库计算结果接口（用于转换器）
 */
interface LibraryCalculationResult {
  year: { heavenly: string; earthly: string };
  month: { heavenly: string; earthly: string };
  day: { heavenly: string; earthly: string };
  hour: { heavenly: string; earthly: string };
  elements: {
    year: string;
    month: string;
    day: string;
    hour: string;
    dayMaster: string;
  };
  tenGods: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
}

/**
 * 八字数据转换器接口
 */
export interface BaziConverter {
  /**
   * 转换为 Chart_Data v1 格式
   * @param libraryResult 第三方库计算结果
   * @param libraryVersion 库版本信息
   * @param options 转换选项
   * @returns 标准化的 ChartDataV1 格式
   */
  convertToChartData(
    libraryResult: LibraryCalculationResult,
    libraryVersion: string,
    options?: ChartDataOptions
  ): ChartDataV1;
  
  /**
   * 验证转换结果
   * @param chartData 转换后的数据
   * @returns 验证结果
   */
  validateChartData(chartData: ChartDataV1): { isValid: boolean; errors: string[] };
}

/**
 * 八字数据转换器实现类
 */
export class BaziConverterImpl implements BaziConverter {
  
  /**
   * 转换为 Chart_Data v1 格式（仅字段映射）
   */
  convertToChartData(
    libraryResult: LibraryCalculationResult,
    libraryVersion: string,
    options?: ChartDataOptions
  ): ChartDataV1 {
    const now = new Date().toISOString();
    
    // 构建基础数据（直接映射，不做任何计算或判断）
    const chartData: ChartDataV1 = {
      version: "1.0",
      timestamp: now,
      
      // 直接映射四柱干支（不修改第三方库结果）
      pillars: {
        year: {
          heavenly: libraryResult.year.heavenly,
          earthly: libraryResult.year.earthly,
        },
        month: {
          heavenly: libraryResult.month.heavenly,
          earthly: libraryResult.month.earthly,
        },
        day: {
          heavenly: libraryResult.day.heavenly,
          earthly: libraryResult.day.earthly,
        },
        hour: {
          heavenly: libraryResult.hour.heavenly,
          earthly: libraryResult.hour.earthly,
        },
      },
      
      // 直接映射五行属性（不修改第三方库结果）
      elements: {
        year: libraryResult.elements.year,
        month: libraryResult.elements.month,
        day: libraryResult.elements.day,
        hour: libraryResult.elements.hour,
        dayMaster: libraryResult.elements.dayMaster,
      },
      
      // 直接映射十神关系（不修改第三方库结果）
      tenGods: {
        year: libraryResult.tenGods.year,
        month: libraryResult.tenGods.month,
        day: libraryResult.tenGods.day,
        hour: libraryResult.tenGods.hour,
      },
      
      // 标注真实的第三方库信息
      metadata: {
        source: "algorithm_computed",
        library: `lunar-javascript@${libraryVersion}`,
        calculatedAt: now,
      },
    };
    
    // 处理可选字段（仅当第三方库支持时）
    if (options?.includeNayin) {
      chartData.nayin = this.getNayinFromLibrary(libraryResult);
    }
    
    if (options?.includeSpirits) {
      chartData.spirits = this.getSpiritsFromLibrary(libraryResult);
    }
    
    return chartData;
  }
  
  /**
   * 验证转换结果
   */
  validateChartData(chartData: ChartDataV1): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // 验证版本号
    if (chartData.version !== "1.0") {
      errors.push('版本号必须为 "1.0"');
    }
    
    // 验证时间戳格式
    if (!this.isValidISOString(chartData.timestamp)) {
      errors.push('时间戳格式无效');
    }
    
    // 验证四柱数据
    if (!this.validatePillars(chartData.pillars)) {
      errors.push('四柱数据格式无效');
    }
    
    // 验证五行数据
    if (!this.validateElements(chartData.elements)) {
      errors.push('五行数据格式无效');
    }
    
    // 验证十神数据
    if (!this.validateTenGods(chartData.tenGods)) {
      errors.push('十神数据格式无效');
    }
    
    // 验证元数据
    if (!this.validateMetadata(chartData.metadata)) {
      errors.push('元数据格式无效');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * 获取纳音（调用第三方库，不自研）
   */
  private getNayinFromLibrary(libraryResult: LibraryCalculationResult): { year: string; month: string; day: string; hour: string } {
    // TODO: 调用第三方库的纳音计算方法
    // 当前返回占位符，等待库支持
    return {
      year: '待实现',
      month: '待实现',
      day: '待实现',
      hour: '待实现',
    };
  }
  
  /**
   * 获取神煞（调用第三方库，不自研）
   */
  private getSpiritsFromLibrary(libraryResult: LibraryCalculationResult): string[] {
    // TODO: 调用第三方库的神煞计算方法
    // 当前返回空数组，等待库支持
    return [];
  }
  
  /**
   * 验证 ISO 8601 时间戳格式
   */
  private isValidISOString(dateString: string): boolean {
    try {
      const date = new Date(dateString);
      return date.toISOString() === dateString;
    } catch {
      return false;
    }
  }
  
  /**
   * 验证四柱数据格式
   */
  private validatePillars(pillars: any): boolean {
    if (!pillars || typeof pillars !== 'object') return false;
    
    const positions = ['year', 'month', 'day', 'hour'];
    for (const pos of positions) {
      const pillar = pillars[pos];
      if (!pillar || typeof pillar !== 'object') return false;
      if (typeof pillar.heavenly !== 'string' || typeof pillar.earthly !== 'string') return false;
    }
    
    return true;
  }
  
  /**
   * 验证五行数据格式
   */
  private validateElements(elements: any): boolean {
    if (!elements || typeof elements !== 'object') return false;
    
    const fields = ['year', 'month', 'day', 'hour', 'dayMaster'];
    for (const field of fields) {
      if (typeof elements[field] !== 'string') return false;
    }
    
    return true;
  }
  
  /**
   * 验证十神数据格式
   */
  private validateTenGods(tenGods: any): boolean {
    if (!tenGods || typeof tenGods !== 'object') return false;
    
    const positions = ['year', 'month', 'day', 'hour'];
    for (const pos of positions) {
      if (typeof tenGods[pos] !== 'string') return false;
    }
    
    return true;
  }
  
  /**
   * 验证元数据格式
   */
  private validateMetadata(metadata: any): boolean {
    if (!metadata || typeof metadata !== 'object') return false;
    
    if (metadata.source !== 'algorithm_computed') return false;
    if (typeof metadata.library !== 'string') return false;
    if (!this.isValidISOString(metadata.calculatedAt)) return false;
    
    return true;
  }
}

/**
 * 默认八字数据转换器实例
 */
export const baziConverter = new BaziConverterImpl();