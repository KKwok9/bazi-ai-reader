/**
 * AI 提示词管理模块
 * 
 * 严格职责边界：
 * ✅ 允许：管理和构建 AI 解读的提示词
 * ✅ 允许：根据 ChartDataV1 生成结构化描述
 * ✅ 允许：定制化解读方向和风格
 * ❌ 禁止：进行任何八字计算或推算
 * ❌ 禁止：修改 ChartDataV1 中的数据
 * ❌ 禁止：访问原始出生信息
 * 
 * 安全约束：
 * - 只能基于 ChartDataV1 构建描述性文本
 * - 不得尝试验证或修正八字数据
 * - 所有提示词必须明确标识数据来源
 */

import { ChartDataV1 } from '@/types/chart';

/**
 * 提示词管理器接口
 */
export interface PromptManager {
  /**
   * 构建基础解读提示词
   */
  buildInterpretationPrompt(chartData: ChartDataV1, focusAreas?: string[]): string;
  
  /**
   * 构建系统提示词
   */
  buildSystemPrompt(): string;
  
  /**
   * 构建八字数据描述
   */
  buildChartDescription(chartData: ChartDataV1): string;
}

/**
 * 解读焦点区域
 */
export const FOCUS_AREAS = {
  PERSONALITY: 'personality',     // 性格特征
  FORTUNE: 'fortune',            // 运势概述
  CAREER: 'career',              // 事业发展
  RELATIONSHIP: 'relationship',   // 人际关系
  HEALTH: 'health',              // 健康状况
  WEALTH: 'wealth',              // 财运状况
} as const;

/**
 * 提示词管理器实现类
 */
export class PromptManagerImpl implements PromptManager {
  
  /**
   * 构建解读提示词
   */
  buildInterpretationPrompt(chartData: ChartDataV1, focusAreas?: string[]): string {
    const systemPrompt = this.buildSystemPrompt();
    const chartDescription = this.buildChartDescription(chartData);
    const focusInstruction = this.buildFocusInstruction(focusAreas);
    const outputFormat = this.buildOutputFormat();
    
    return `${systemPrompt}

${chartDescription}

${focusInstruction}

${outputFormat}`;
  }
  
  /**
   * 构建系统提示词（严格约束）
   */
  buildSystemPrompt(): string {
    return `你是一位专业的八字命理解读师，具有深厚的传统命理学知识。

【严格约束】：
1. 你只能基于提供的八字命盘数据进行解读，禁止重新计算干支、五行、十神
2. 禁止绝对化断言，不得使用"一定"、"必然"、"绝对"等词汇
3. 禁止提供医疗、投资、法律建议
4. 所有解读必须基于传统命理学理论，结合现代心理学观点
5. 解读应该积极正面，给出建设性的建议

【解读原则】：
- 使用"倾向于"、"可能"、"通常"等表述
- 语言通俗易懂，避免过于专业的术语
- 结合传统智慧与现代生活实际
- 重点关注性格特征和人生指导
- 保持客观理性的态度

【数据来源】：
你将收到的八字数据来自权威计算库，请直接基于这些数据进行解读，不要质疑或重新计算。`;
  }
  
  /**
   * 构建八字数据描述
   */
  buildChartDescription(chartData: ChartDataV1): string {
    const { pillars, elements, tenGods, metadata } = chartData;
    
    return `【八字命盘数据】

四柱干支：
- 年柱：${pillars.year.heavenly}${pillars.year.earthly}
- 月柱：${pillars.month.heavenly}${pillars.month.earthly}
- 日柱：${pillars.day.heavenly}${pillars.day.earthly}（日主）
- 时柱：${pillars.hour.heavenly}${pillars.hour.earthly}

五行属性：
- 年柱五行：${elements.year}
- 月柱五行：${elements.month}
- 日柱五行：${elements.day}
- 时柱五行：${elements.hour}
- 日主五行：${elements.dayMaster}

十神关系：
- 年柱十神：${tenGods.year}
- 月柱十神：${tenGods.month}
- 日柱十神：${tenGods.day}
- 时柱十神：${tenGods.hour}

【数据来源】：${metadata.library}
【计算时间】：${metadata.calculatedAt}

请基于以上确定的八字数据进行解读，不要重新计算或质疑这些数据。`;
  }
  
  /**
   * 构建焦点指导
   */
  private buildFocusInstruction(focusAreas?: string[]): string {
    if (!focusAreas || focusAreas.length === 0) {
      return `【解读要求】：
请提供全面的八字解读，包括：
1. 性格特征分析（基于日主五行和十神关系）
2. 运势概述（基于五行平衡和十神配置）
3. 人生建议和指导（积极正面的建设性建议）`;
    }
    
    const focusMap: Record<string, string> = {
      [FOCUS_AREAS.PERSONALITY]: '性格特征和心理特点',
      [FOCUS_AREAS.FORTUNE]: '整体运势和发展趋势',
      [FOCUS_AREAS.CAREER]: '事业发展和职业选择',
      [FOCUS_AREAS.RELATIONSHIP]: '人际关系和情感状况',
      [FOCUS_AREAS.HEALTH]: '健康状况和养生建议',
      [FOCUS_AREAS.WEALTH]: '财运状况和理财建议',
    };
    
    const focusDescriptions = focusAreas
      .map(area => focusMap[area])
      .filter(Boolean)
      .join('、');
    
    return `【解读要求】：
请重点关注以下方面进行解读：${focusDescriptions}

注意：即使有重点关注方向，也要保持解读的全面性和平衡性。`;
  }
  
  /**
   * 构建输出格式要求
   */
  private buildOutputFormat(): string {
    return `【输出格式要求】：
请严格按照以下JSON格式返回解读结果：

{
  "personality": "性格特征解读（200-300字，基于日主五行和十神关系）",
  "fortune": "运势概述解读（200-300字，基于五行平衡和整体配置）", 
  "suggestions": "建议指导解读（200-300字，积极正面的人生建议）"
}

【内容要求】：
1. 每个部分都要有具体的内容，基于八字数据进行分析
2. 语言要通俗易懂，避免过于专业的术语
3. 给出积极正面的指导建议，避免消极预测
4. 不要包含绝对化的预测，多使用"倾向于"、"可能"等表述
5. 不要提供医疗、投资、法律方面的具体建议
6. 确保返回的是有效的JSON格式`;
  }
}

/**
 * 默认提示词管理器实例
 */
export const promptManager = new PromptManagerImpl();