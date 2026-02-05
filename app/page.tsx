/**
 * 首页 - 出生信息输入页面
 * 
 * 设计原则：
 * - 专业、可信、克制的界面风格
 * - 清晰的信息输入流程
 * - 避免玄学色彩，强调科学计算
 * - 明确说明算法来源和数据处理方式
 * - 提供历史记录快速访问
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BirthInfoFormData } from '@/types/birth';
import { ChartRequest, ChartResponse } from '@/types/api';
import { getHistoryRecords, type HistoryRecord } from '@/lib/utils/storage';

export default function HomePage() {
  const router = useRouter();
  
  // 表单状态
  const [formData, setFormData] = useState<BirthInfoFormData>({
    year: '',
    month: '',
    day: '',
    hour: '',
    minute: '',
    timezone: 'Asia/Shanghai',
    gender: undefined,
  });
  
  // UI 状态
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);

  /**
   * 加载历史记录
   */
  useEffect(() => {
    const records = getHistoryRecords();
    setHistoryRecords(records);
  }, []);

  /**
   * 处理表单字段变化
   */
  const handleInputChange = (field: keyof BirthInfoFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除错误信息
    if (error) {
      setError('');
    }
  };

  /**
   * 验证表单数据
   */
  const validateForm = (): { isValid: boolean; error?: string } => {
    // 基础必填字段检查
    if (!formData.year || !formData.month || !formData.day || 
        !formData.hour || !formData.minute) {
      return { isValid: false, error: '请填写完整的出生时间信息' };
    }
    
    // 数值范围验证
    const year = parseInt(formData.year, 10);
    const month = parseInt(formData.month, 10);
    const day = parseInt(formData.day, 10);
    const hour = parseInt(formData.hour, 10);
    const minute = parseInt(formData.minute, 10);
    
    if (year < 1900 || year > 2100) {
      return { isValid: false, error: '年份必须在 1900-2100 之间' };
    }
    
    if (month < 1 || month > 12) {
      return { isValid: false, error: '月份必须在 1-12 之间' };
    }
    
    if (day < 1 || day > 31) {
      return { isValid: false, error: '日期必须在 1-31 之间' };
    }
    
    if (hour < 0 || hour > 23) {
      return { isValid: false, error: '小时必须在 0-23 之间' };
    }
    
    if (minute < 0 || minute > 59) {
      return { isValid: false, error: '分钟必须在 0-59 之间' };
    }
    
    return { isValid: true };
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证表单
    const validation = validateForm();
    if (!validation.isValid) {
      setError(validation.error || '表单验证失败');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // 构建请求数据
      const requestData: ChartRequest = {
        birthYear: parseInt(formData.year, 10),
        birthMonth: parseInt(formData.month, 10),
        birthDay: parseInt(formData.day, 10),
        birthHour: parseInt(formData.hour, 10),
        birthMinute: parseInt(formData.minute, 10),
        timezone: formData.timezone,
        gender: formData.gender,
      };
      
      // 调用 API
      const response = await fetch('/api/chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      const result: ChartResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'API 调用失败');
      }
      
      // 将结果传递到结果页面
      //localStorage.setItem('chartData', JSON.stringify(result.data));
      
      // 跳转到结果页面
      router.push(
  `/result?birthYear=${requestData.birthYear}` +
  `&birthMonth=${requestData.birthMonth}` +
  `&birthDay=${requestData.birthDay}` +
  `&birthHour=${requestData.birthHour}` +
  `&birthMinute=${requestData.birthMinute}` +
  `&timezone=${requestData.timezone}`
);

      
    } catch (error) {
      console.error('Chart calculation error:', error);
      setError(error instanceof Error ? error.message : '计算失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理历史记录点击
   */
  const handleHistoryClick = (record: HistoryRecord) => {
    // 将历史记录数据设置到localStorage
    localStorage.setItem('chartData', JSON.stringify(record.chartData));
    if (record.readingData) {
      localStorage.setItem('readingData', JSON.stringify(record.readingData));
    }
    
    // 跳转到结果页面
    router.push('/result');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 页面标题 */}
      <div className="text-center mb-12">
        <h2 className="page-title">
          八字排盘计算
        </h2>
        <p className="page-subtitle mb-6">
          基于传统命理学算法，提供准确的八字命盘计算
        </p>
        
        {/* 技术说明 */}
        <div className="inline-flex items-center space-x-4 text-sm text-slate-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>使用 lunar-javascript 算法库</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>本地计算，不存储数据</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 主要表单区域 */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <div className="algorithm-badge">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                算法计算
              </div>
              <h3 className="text-lg font-semibold text-slate-900">出生时间信息</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 出生日期 */}
              <div>
                <h4 className="text-base font-medium text-slate-900 mb-4">出生日期</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">年份</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="如：1990"
                      min="1900"
                      max="2100"
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">月份</label>
                    <select
                      className="form-input"
                      value={formData.month}
                      onChange={(e) => handleInputChange('month', e.target.value)}
                    >
                      <option value="">请选择月份</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}月
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">日期</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="如：15"
                      min="1"
                      max="31"
                      value={formData.day}
                      onChange={(e) => handleInputChange('day', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* 出生时间 */}
              <div>
                <h4 className="text-base font-medium text-slate-900 mb-4">出生时间</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">小时</label>
                    <select
                      className="form-input"
                      value={formData.hour}
                      onChange={(e) => handleInputChange('hour', e.target.value)}
                    >
                      <option value="">请选择小时</option>
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">分钟</label>
                    <select
                        className="form-input"
                        value={formData.minute}
                        onChange={(e) => handleInputChange('minute', e.target.value)}
                      >
                        <option value="">请选择分钟</option>
                        {Array.from({ length: 60 }, (_, minute) => (
                          <option key={minute} value={minute}>
                            {minute.toString().padStart(2, '0')}分
                          </option>
                        ))}
                      </select>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  * 时间精确度会影响计算结果，建议选择最接近的时间段
                </p>
              </div>

              {/* 时区和性别 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">时区</label>
                  <select
                    className="form-input"
                    value={formData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                  >
                    <option value="Asia/Shanghai">中国标准时间 (UTC+8)</option>
                    <option value="Asia/Hong_Kong">香港时间 (UTC+8)</option>
                    <option value="Asia/Taipei">台湾时间 (UTC+8)</option>
                    <option value="UTC">协调世界时 (UTC+0)</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">性别 <span className="text-slate-400">(可选)</span></label>
                  <select
                    className="form-input"
                    value={formData.gender || ''}
                    onChange={(e) => handleInputChange('gender', e.target.value as 'male' | 'female')}
                  >
                    <option value="">不指定</option>
                    <option value="male">男</option>
                    <option value="female">女</option>
                  </select>
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="error-message">
                  <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {/* 提交按钮 */}
              <div className="text-center pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary px-8 py-3 text-lg"
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner mr-2"></span>
                      正在计算...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2z" />
                      </svg>
                      开始计算八字
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 历史记录 */}
          {historyRecords.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                最近记录
              </h3>
              <div className="space-y-3">
                {historyRecords.map((record) => (
                  <div
                    key={record.id}
                    className="history-card"
                    onClick={() => handleHistoryClick(record)}
                  >
                    <div className="history-meta">
                      {new Date(record.timestamp).toLocaleDateString('zh-CN')}
                    </div>
                    <div className="history-summary">
                      {record.summary.birthInfo}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      日主：{record.summary.dayMaster}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 计算说明 */}
          <div className="card">
            <h3 className="font-semibold text-slate-900 mb-3">计算说明</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>使用传统命理学算法进行八字排盘</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>基于 lunar-javascript 开源库计算</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>结果包含四柱、五行、十神等信息</span>
              </li>
            </ul>
          </div>

          {/* 时间精度说明 */}
          <div className="card">
            <h3 className="font-semibold text-slate-900 mb-3">时间精度</h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>出生时间的准确性直接影响计算结果：</p>
              <ul className="space-y-1 ml-4">
                <li>• 时辰差异可能改变时柱</li>
                <li>• 建议查看出生证明确认</li>
                <li>• 如不确定可咨询家人</li>
              </ul>
            </div>
          </div>

          {/* 隐私说明 */}
          <div className="card">
            <h3 className="font-semibold text-slate-900 mb-3">隐私保护</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>不存储任何个人信息</span>
              </li>
              <li className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>本地浏览器计算处理</span>
              </li>
              <li className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>数据不会上传到服务器</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}