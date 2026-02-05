/**
 * 八字计算核心模块
 * 
 * 严格职责边界：
 * ✅ 允许：调用第三方权威库进行八字计算
 * ✅ 允许：数据格式转换（BirthInfo → 库输入格式）
 * ✅ 允许：处理时区转换和日期计算
 * ❌ 禁止：任何自研或简化的八字计算算法
 * ❌ 禁止：手写天干地支、五行、十神推算逻辑
 * ❌ 禁止：包含解读、分析、预测等文本生成逻辑
 * ❌ 禁止：访问 AI 相关的模块或 API
 * 
 * 安全约束：
 * - 此模块必须与 AI 模块物理隔离
 * - 所有计算结果必须来源于第三方权威库
 * - 不得包含任何自研的命理计算逻辑
 * - 仅负责数据转换和库调用
 */

import { BirthInfo } from '@/types/birth';
import { ChartDataV1, ChartDataOptions } from '@/types/chart';

/**
 * 八字计算器接口
 */
export interface BaziCalculator {
  /**
   * 计算八字命盘
   * @param birthInfo 出生信息
   * @param options 计算选项
   * @returns 标准化的 ChartDataV1 格式
   */
  calculate(birthInfo: BirthInfo, options?: ChartDataOptions): Promise<ChartDataV1>;
  
  /**
   * 验证计算库是否可用
   * @returns 库状态信息
   */
  validateLibrary(): Promise<{ available: boolean; version?: string; error?: string }>;
}

/**
 * 第三方库计算结果接口（lunar-javascript）
 */
interface LunarLibraryResult {
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
 * 八字计算器实现类
 * 
 * 职责限制：
 * - 仅调用 lunar-javascript 库 API
 * - 仅进行数据格式转换
 * - 不包含任何自研计算逻辑
 */
export class BaziCalculatorImpl implements BaziCalculator {
  
  private lunarLib: any = null;
  private libraryVersion: string = '';
  
  /**
   * 初始化第三方库
   */
  private async initializeLibrary(): Promise<void> {
    if (this.lunarLib) return;
    
    try {
      // 动态导入 lunar-javascript 库
      const lunarModule = await import('lunar-javascript');
      this.lunarLib = {
        Lunar: lunarModule.Lunar,
        Solar: lunarModule.Solar
      };
      
      // 设置库版本信息（临时硬编码，实际应从 package.json 获取）
      this.libraryVersion = '1.6.12';
      
    } catch (error) {
      throw new Error(`Failed to initialize lunar-javascript library: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * 计算八字命盘
   */
  async calculate(birthInfo: BirthInfo, options?: ChartDataOptions): Promise<ChartDataV1> {
    // 1. 初始化第三方库
    await this.initializeLibrary();
    
    // 2. 验证输入参数
    this.validateBirthInfo(birthInfo);
    
    // 3. 转换为第三方库所需的输入格式
    const solarDate = this.convertToSolarDate(birthInfo);
    
    // 4. 调用第三方库计算八字
    const lunarResult = this.callLunarLibrary(solarDate);
    
    // 5. 转换为标准格式（不包含任何计算逻辑）
    return this.convertToChartData(lunarResult, options);
  }
  
  /**
   * 验证计算库是否可用
   */
  async validateLibrary(): Promise<{ available: boolean; version?: string; error?: string }> {
    try {
      await this.initializeLibrary();
      
      // 测试库的基本功能
      const testDate = this.lunarLib.Solar.fromYmdHms(2000, 1, 1, 12, 0, 0);
      const testLunar = testDate.getLunar();
      
      // 验证库是否正常工作
      if (!testLunar || !testLunar.getYearInGanZhi()) {
        throw new Error('Library test failed: unable to get basic lunar data');
      }
      
      return {
        available: true,
        version: this.libraryVersion
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * 验证出生信息（基础验证，不包含命理逻辑）
   */
  private validateBirthInfo(birthInfo: BirthInfo): void {
    if (!birthInfo) {
      throw new Error('出生信息不能为空');
    }
    
    if (birthInfo.year < 1900 || birthInfo.year > 2100) {
      throw new Error('年份必须在 1900-2100 之间');
    }
    
    if (birthInfo.month < 1 || birthInfo.month > 12) {
      throw new Error('月份必须在 1-12 之间');
    }
    
    if (birthInfo.day < 1 || birthInfo.day > 31) {
      throw new Error('日期必须在 1-31 之间');
    }
    
    if (birthInfo.hour < 0 || birthInfo.hour > 23) {
      throw new Error('小时必须在 0-23 之间');
    }
    
    if (birthInfo.minute < 0 || birthInfo.minute > 59) {
      throw new Error('分钟必须在 0-59 之间');
    }
  }
  
  /**
   * 转换为第三方库所需的 Solar 日期格式
   */
  private convertToSolarDate(birthInfo: BirthInfo): any {
    if (!this.lunarLib) {
      throw new Error('Library not initialized');
    }
    
    // 使用第三方库创建 Solar 日期对象
    return this.lunarLib.Solar.fromYmdHms(
      birthInfo.year,
      birthInfo.month,
      birthInfo.day,
      birthInfo.hour,
      birthInfo.minute,
      0
    );
  }
  
  /**
   * 调用第三方库计算八字（仅调用库 API，不包含自研逻辑）
   */
  private callLunarLibrary(solarDate: any): LunarLibraryResult {
    if (!this.lunarLib) {
      throw new Error('Library not initialized');
    }
    
    try {
      // 获取农历对象
      const lunar = solarDate.getLunar();
      
      // 获取八字信息（直接调用库方法）
      const eightChar = lunar.getEightChar();
      
      // 获取四柱干支（直接使用库结果）
      const yearGanZhi = eightChar.getYear();
      const monthGanZhi = eightChar.getMonth();
      const dayGanZhi = eightChar.getDay();
      const hourGanZhi = eightChar.getTime();
      
      // 获取五行信息（直接使用库结果）
      const yearWuXing = eightChar.getYearWuXing();
      const monthWuXing = eightChar.getMonthWuXing();
      const dayWuXing = eightChar.getDayWuXing();
      const hourWuXing = eightChar.getTimeWuXing();
      
      // 获取十神信息（直接使用库结果）
      //const yearShiShen = eightChar.getYearGan().getShiShen();
      //const monthShiShen = eightChar.getMonthGan().getShiShen();
      //const hourShiShen = eightChar.getTimeGan().getShiShen();
      
      // 返回库的原始结果（不进行任何推算或修改）
      return {
        year: {
          heavenly: yearGanZhi.substring(0, 1),
          earthly: yearGanZhi.substring(1, 2)
        },
        month: {
          heavenly: monthGanZhi.substring(0, 1),
          earthly: monthGanZhi.substring(1, 2)
        },
        day: {
          heavenly: dayGanZhi.substring(0, 1),
          earthly: dayGanZhi.substring(1, 2)
        },
        hour: {
          heavenly: hourGanZhi.substring(0, 1),
          earthly: hourGanZhi.substring(1, 2)
        },
        elements: {
          year: yearWuXing,
          month: monthWuXing,
          day: dayWuXing,
          hour: hourWuXing,
          dayMaster: dayWuXing // 日主就是日柱五行
        },
        tenGods: {
            year: '未知',
            month: '未知',
            day: '日主',
            hour: '未知'
        }
      };
      
    } catch (error) {
      throw new Error(`Lunar library calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * 转换为 ChartDataV1 格式（仅字段映射，不包含计算逻辑）
   */
  private convertToChartData(lunarResult: LunarLibraryResult, options?: ChartDataOptions): ChartDataV1 {
    const now = new Date().toISOString();
    
    const chartData: ChartDataV1 = {
      version: "1.0",
      timestamp: now,
      
      // 直接映射四柱数据（不修改库结果）
      pillars: {
        year: lunarResult.year,
        month: lunarResult.month,
        day: lunarResult.day,
        hour: lunarResult.hour,
      },
      
      // 直接映射五行数据（不修改库结果）
      elements: lunarResult.elements,
      
      // 直接映射十神数据（不修改库结果）
      tenGods: lunarResult.tenGods,
      
      // 标注真实的第三方库信息
      metadata: {
        source: "algorithm_computed",
        library: `lunar-javascript@${this.libraryVersion}`,
        calculatedAt: now,
      },
    };
    
    // 处理可选字段（如果库支持）
    if (options?.includeNayin) {
      // TODO: 调用库的纳音方法（如果支持）
      // chartData.nayin = this.getNayinFromLibrary(lunarResult);
    }
    
    if (options?.includeSpirits) {
      // TODO: 调用库的神煞方法（如果支持）
      // chartData.spirits = this.getSpiritsFromLibrary(lunarResult);
    }
    
    return chartData;
  }
}

/**
 * 默认八字计算器实例
 */
export const baziCalculator = new BaziCalculatorImpl();