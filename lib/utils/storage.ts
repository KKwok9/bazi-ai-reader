/**
 * 本地存储工具函数
 * 
 * 用于管理用户的测算历史记录
 */

import { ChartDataV1 } from '@/types/chart';
import { ReadingData } from '@/types/api';

export interface HistoryRecord {
  id: string;
  timestamp: string;
  chartData: ChartDataV1;
  readingData?: ReadingData;
  summary: {
    birthInfo: string; // 如 "1990年5月15日 14:30"
    dayMaster: string; // 日主五行
  };
}

const STORAGE_KEY = 'bazi_history';
const MAX_RECORDS = 3;

/**
 * 获取历史记录
 */
export function getHistoryRecords(): HistoryRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const records = JSON.parse(stored) as HistoryRecord[];
    return records.slice(0, MAX_RECORDS); // 确保不超过最大数量
  } catch (error) {
    console.error('Failed to load history records:', error);
    return [];
  }
}

/**
 * 保存新的测算记录
 */
export function saveHistoryRecord(
  chartData: ChartDataV1, 
  readingData?: ReadingData
): void {
  try {
    const records = getHistoryRecords();
    
    // 生成唯一ID
    const id = Date.now().toString();
    
    // 创建摘要信息
    const summary = {
      birthInfo: formatBirthInfo(chartData.timestamp),
      dayMaster: chartData.elements.dayMaster
    };
    
    const newRecord: HistoryRecord = {
      id,
      timestamp: new Date().toISOString(),
      chartData,
      readingData,
      summary
    };
    
    // 添加到开头，保持最新的在前面
    const updatedRecords = [newRecord, ...records].slice(0, MAX_RECORDS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
  } catch (error) {
    console.error('Failed to save history record:', error);
  }
}

/**
 * 删除历史记录
 */
export function deleteHistoryRecord(id: string): void {
  try {
    const records = getHistoryRecords();
    const updatedRecords = records.filter(record => record.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
  } catch (error) {
    console.error('Failed to delete history record:', error);
  }
}

/**
 * 清空所有历史记录
 */
export function clearHistoryRecords(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear history records:', error);
  }
}

/**
 * 格式化出生信息显示
 */
function formatBirthInfo(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    
    return `${year}年${month}月${day}日 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  } catch (error) {
    return '未知时间';
  }
}