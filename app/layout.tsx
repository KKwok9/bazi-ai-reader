/**
 * 全局应用布局 - 专业理性工具风格
 * 
 * 设计原则：
 * - 专业、可信、克制的视觉风格
 * - 清晰的信息架构和导航
 * - 避免玄学色彩，强调科学理性
 */

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '八字排盘工具 - 基于算法的命理分析',
  description: '专业的八字排盘计算工具，结合传统命理学算法与现代AI技术，提供客观的命盘分析和参考性解读',
  keywords: ['八字排盘', '命理分析', '算法计算', 'AI解读', '传统文化'],
  authors: [{ name: 'BaZi Calculator Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        {/* 全局导航栏 */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">八</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    八字排盘工具
                  </h1>
                  <p className="text-xs text-slate-500">
                    算法计算 · AI辅助解读
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-500">Beta 版本</span>
                <a 
                  href="/about" 
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  关于
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* 主要内容区域 */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>

        {/* 全局页脚 */}
        <footer className="bg-white border-t border-slate-200 mt-16">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">技术说明</h3>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>• 八字计算基于传统算法</li>
                  <li>• 使用 lunar-javascript 库</li>
                  <li>• AI解读仅供参考</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">使用须知</h3>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>• 结果仅供文化研究</li>
                  <li>• 不构成人生决策建议</li>
                  <li>• 请理性看待分析结果</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">隐私保护</h3>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>• 不存储个人信息</li>
                  <li>• 本地计算处理</li>
                  <li>• 数据不会上传</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-200 mt-8 pt-6 text-center">
              <p className="text-sm text-slate-500">
                基于传统命理学算法与现代AI技术 · 仅供文化研究和娱乐参考
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}