/**
 * 分享卡片生成工具
 * 
 * 用于生成包含命盘和解读摘要的分享图片
 */

import { ChartDataV1 } from '@/types/chart';
import { ReadingData } from '@/types/api';
import { extractTextSummary } from './textHighlight';

export interface ShareCardData {
  chartData: ChartDataV1;
  readingData?: ReadingData;
  summary: {
    personality: string;
    fortune: string;
  };
}

/**
 * 生成分享卡片的Canvas
 */
export function generateShareCard(data: ShareCardData): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('无法创建Canvas上下文'));
        return;
      }
      
      // 设置画布尺寸 (适合社交媒体分享的比例)
      canvas.width = 800;
      canvas.height = 1000;
      
      // 绘制背景
      drawBackground(ctx, canvas.width, canvas.height);
      
      // 绘制标题
      drawTitle(ctx, canvas.width);
      
      // 绘制简化命盘
      drawSimplifiedChart(ctx, data.chartData, canvas.width);
      
      // 绘制解读摘要
      drawReadingSummary(ctx, data.summary, canvas.width);
      
      // 绘制免责声明
      drawDisclaimer(ctx, canvas.width, canvas.height);
      
      // 转换为图片
      const dataURL = canvas.toDataURL('image/png', 0.9);
      resolve(dataURL);
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 绘制背景
 */
function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // 渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#f8fafc');
  gradient.addColorStop(1, '#e2e8f0');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // 添加微妙的纹理
  ctx.fillStyle = 'rgba(148, 163, 184, 0.1)';
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 2;
    ctx.fillRect(x, y, size, size);
  }
}

/**
 * 绘制标题
 */
function drawTitle(ctx: CanvasRenderingContext2D, width: number) {
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('八字命盘分析', width / 2, 60);
  
  ctx.fillStyle = '#64748b';
  ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('基于传统算法计算 · AI辅助解读', width / 2, 90);
}

/**
 * 绘制简化命盘
 */
function drawSimplifiedChart(ctx: CanvasRenderingContext2D, chartData: ChartDataV1, width: number) {
  const startY = 130;
  const pillarWidth = 160;
  const pillarHeight = 120;
  const spacing = 20;
  const totalWidth = 4 * pillarWidth + 3 * spacing;
  const startX = (width - totalWidth) / 2;
  
  const pillars = [
    { name: '年柱', data: chartData.pillars.year, element: chartData.elements.year, tenGod: chartData.tenGods.year },
    { name: '月柱', data: chartData.pillars.month, element: chartData.elements.month, tenGod: chartData.tenGods.month },
    { name: '日柱', data: chartData.pillars.day, element: chartData.elements.day, tenGod: chartData.tenGods.day },
    { name: '时柱', data: chartData.pillars.hour, element: chartData.elements.hour, tenGod: chartData.tenGods.hour }
  ];
  
  pillars.forEach((pillar, index) => {
    const x = startX + index * (pillarWidth + spacing);
    const y = startY;
    
    // 绘制柱子背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, pillarWidth, pillarHeight);
    
    // 绘制边框
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, pillarWidth, pillarHeight);
    
    // 绘制柱子名称
    ctx.fillStyle = '#64748b';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(pillar.name, x + pillarWidth / 2, y + 20);
    
    // 绘制干支
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(
      `${pillar.data.heavenly}${pillar.data.earthly}`,
      x + pillarWidth / 2,
      y + 55
    );
    
    // 绘制五行
    ctx.fillStyle = '#3b82f6';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`五行：${pillar.element}`, x + pillarWidth / 2, y + 80);
    
    // 绘制十神
    ctx.fillStyle = '#6366f1';
    ctx.fillText(`十神：${pillar.tenGod}`, x + pillarWidth / 2, y + 100);
  });
  
  // 绘制日主信息
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`日主五行：${chartData.elements.dayMaster}`, width / 2, startY + pillarHeight + 40);
}

/**
 * 绘制解读摘要
 */
function drawReadingSummary(ctx: CanvasRenderingContext2D, summary: { personality: string; fortune: string }, width: number) {
  const startY = 350;
  const padding = 40;
  const maxWidth = width - 2 * padding;
  
  // 绘制解读标题
  ctx.fillStyle = '#d97706';
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AI 解读摘要', width / 2, startY);
  
  // 绘制性格特征
  if (summary.personality) {
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('性格特征', padding, startY + 40);
    
    ctx.fillStyle = '#374151';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
    drawWrappedText(ctx, summary.personality, padding, startY + 65, maxWidth, 20);
  }
  
  // 绘制运势概述
  if (summary.fortune) {
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('运势概述', padding, startY + 160);
    
    ctx.fillStyle = '#374151';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
    drawWrappedText(ctx, summary.fortune, padding, startY + 185, maxWidth, 20);
  }
}

/**
 * 绘制免责声明
 */
function drawDisclaimer(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const disclaimerY = height - 80;
  
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('本分析结果仅供文化研究和娱乐参考', width / 2, disclaimerY);
  ctx.fillText('不构成人生决策建议，请理性看待', width / 2, disclaimerY + 20);
  
  // 绘制生成时间
  const now = new Date().toLocaleString('zh-CN');
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(`生成时间：${now}`, width / 2, disclaimerY + 45);
}

/**
 * 绘制换行文本
 */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split('');
  let line = '';
  let currentY = y;
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i];
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY);
      line = words[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  
  ctx.fillText(line, x, currentY);
}

/**
 * 下载分享卡片
 */
export function downloadShareCard(dataURL: string, filename: string = 'bazi-share-card.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}