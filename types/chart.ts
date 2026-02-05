/**
 * Chart_Data v1 JSON Schema 定义
 * 
 * 职责边界：
 * - 此文件定义八字命盘数据的标准格式
 * - 严格按照设计文档的 JSON Schema 规范
 * - 所有字段都必须由确定性算法计算，禁止 AI 生成内容
 * - 一旦发布即冻结，不可修改（向后兼容）
 */

/**
 * 干支组合接口
 */
export interface Pillar {
  heavenly: string;  // 天干：甲、乙、丙、丁...
  earthly: string;   // 地支：子、丑、寅、卯...
}

/**
 * Chart_Data v1 主接口
 * 
 * 重要约束：
 * - version 字段必须为 "1.0"，用于 Schema 版本控制
 * - 所有计算字段必须标记 source: "algorithm_computed"
 * - 禁止包含任何 AI 生成的解读文本或分析结论
 */
export interface ChartDataV1 {
  version: "1.0";                    // Schema 版本标识（冻结）
  timestamp: string;                 // 计算时间戳 (ISO 8601)
  
  // 必填字段：算法计算结果
  pillars: {
    year: Pillar;     // 年柱
    month: Pillar;    // 月柱
    day: Pillar;      // 日柱
    hour: Pillar;     // 时柱
  };
  
  elements: {
    year: string;     // 年柱五行：金、木、水、火、土
    month: string;    // 月柱五行
    day: string;      // 日柱五行
    hour: string;     // 时柱五行
    dayMaster: string; // 日主五行（核心）
  };
  
  tenGods: {
    year: string;     // 年柱十神：比肩、劫财、食神、伤官、偏财、正财、七杀、正官、偏印、正印
    month: string;    // 月柱十神
    day: string;      // 日柱十神（固定为"日主"）
    hour: string;     // 时柱十神
  };
  
  // 可选字段：展示用途（MVP 阶段可为空）
  nayin?: {
    year: string;     // 年柱纳音：海中金、炉中火等
    month: string;    // 月柱纳音
    day: string;      // 日柱纳音
    hour: string;     // 时柱纳音
  };
  
  spirits?: string[]; // 神煞列表：天乙贵人、桃花等（仅供展示，MVP 可忽略）
  
  // 元数据（必填）
  metadata: {
    source: "algorithm_computed";     // 数据来源标识（固定值）
    library: string;                  // 使用的计算库名称（如 "lunar-javascript"）
    calculatedAt: string;             // 计算时间 (ISO 8601)
  };
}

/**
 * Chart_Data 验证函数类型
 */
export type ChartDataValidator = (data: any) => data is ChartDataV1;

/**
 * Chart_Data 创建选项
 */
export interface ChartDataOptions {
  includeNayin?: boolean;    // 是否包含纳音（默认 false）
  includeSpirits?: boolean;  // 是否包含神煞（默认 false）
}