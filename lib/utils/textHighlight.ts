/**
 * 文本高亮工具函数
 * 
 * 用于识别和高亮解读文本中的关键句子
 */

/**
 * 高亮关键句子的规则
 */
const HIGHLIGHT_PATTERNS = {
  // 总结性句子 - 包含总体描述的句子
  summary: [
    /总体而言|整体来看|综合分析|总的来说|从整体上|概括来说/,
    /具有.*特质|表现出.*倾向|展现.*特点|呈现.*特征/,
    /性格.*方面|在.*方面|.*能力较强|.*天赋突出/
  ],
  
  // 描述性句子 - 描述特征和倾向的句子
  descriptive: [
    /倾向于|容易|往往|通常|一般来说|大多数情况下/,
    /具备|拥有|展现|表现|显示|体现/,
    /善于|擅长|适合|喜欢|偏好|注重/,
    /.*思维|.*能力|.*特质|.*品质|.*优势/
  ]
};

/**
 * 需要避免高亮的模式（预测性和绝对化内容）
 */
const AVOID_PATTERNS = [
  /一定会|必然|绝对|肯定会|必须|务必/,
  /将会|会发生|即将|未来.*年|.*年后/,
  /命中注定|注定|宿命|天命|命运安排/,
  /百分之百|完全|彻底|永远|从不|绝不/
];

/**
 * 高亮解读文本中的关键句子
 */
export function highlightReadingText(text: string): string {
  if (!text) return text;
  
  // 按句子分割文本
  const sentences = text.split(/[。！？；]/).filter(s => s.trim());
  
  const highlightedSentences = sentences.map(sentence => {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) return sentence;
    
    // 检查是否应该避免高亮
    const shouldAvoid = AVOID_PATTERNS.some(pattern => pattern.test(trimmedSentence));
    if (shouldAvoid) return sentence;
    
    // 检查是否匹配高亮模式
    const shouldHighlight = [
      ...HIGHLIGHT_PATTERNS.summary,
      ...HIGHLIGHT_PATTERNS.descriptive
    ].some(pattern => pattern.test(trimmedSentence));
    
    if (shouldHighlight) {
      return `<mark class="reading-highlight">${sentence}</mark>`;
    }
    
    return sentence;
  });
  
  return highlightedSentences.join('。');
}

/**
 * 提取文本摘要（用于分享卡片）
 */
export function extractTextSummary(text: string, maxLength: number = 100): string {
  if (!text) return '';
  
  // 移除HTML标签
  const cleanText = text.replace(/<[^>]*>/g, '');
  
  // 按句子分割
  const sentences = cleanText.split(/[。！？；]/).filter(s => s.trim());
  
  // 优先选择包含总结性词汇的句子
  const summaryPatterns = HIGHLIGHT_PATTERNS.summary;
  const summarySentence = sentences.find(sentence => 
    summaryPatterns.some(pattern => pattern.test(sentence))
  );
  
  if (summarySentence && summarySentence.length <= maxLength) {
    return summarySentence.trim() + '。';
  }
  
  // 如果没有找到总结性句子，取第一句
  const firstSentence = sentences[0]?.trim();
  if (firstSentence) {
    if (firstSentence.length <= maxLength) {
      return firstSentence + '。';
    } else {
      return firstSentence.substring(0, maxLength - 3) + '...';
    }
  }
  
  return '';
}