/**
 * 关于页面 - 工具说明和使用指南
 * 
 * 设计原则：
 * - 专业、透明的信息披露
 * - 明确说明技术原理和限制
 * - 强调理性使用和参考性质
 */

'use client';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 页面标题 */}
      <div className="text-center">
        <h2 className="page-title">关于八字排盘工具</h2>
        <p className="page-subtitle">
          了解工具原理、技术实现和使用说明
        </p>
      </div>

      {/* 工具介绍 */}
      <div className="algorithm-section">
        <div className="flex items-center space-x-2 mb-4">
          <div className="algorithm-badge">算法计算</div>
          <h3 className="text-xl font-semibold text-slate-900">工具介绍</h3>
        </div>
        
        <div className="space-y-4 text-slate-700">
          <p>
            八字排盘工具是一个基于传统命理学算法的现代化计算工具，
            结合AI技术提供辅助性解读。我们致力于以科学、理性的方式
            传承和研究传统文化。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-slate-900 mb-2">算法计算</h4>
              <ul className="text-sm space-y-1">
                <li>• 使用 lunar-javascript 开源库</li>
                <li>• 基于传统天文历法算法</li>
                <li>• 确保计算结果的准确性</li>
                <li>• 完全确定性的数学计算</li>
              </ul>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-slate-900 mb-2">AI 辅助解读</h4>
              <ul className="text-sm space-y-1">
                <li>• 基于大语言模型分析</li>
                <li>• 仅供文化研究参考</li>
                <li>• 不构成人生决策建议</li>
                <li>• 结果具有主观性</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 技术原理 */}
      <div className="card">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">技术原理</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-slate-900 mb-2">八字计算流程</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                <div className="text-sm font-medium">时间转换</div>
                <div className="text-xs text-slate-600 mt-1">公历转农历</div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                <div className="text-sm font-medium">干支计算</div>
                <div className="text-xs text-slate-600 mt-1">年月日时四柱</div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
                <div className="text-sm font-medium">五行推导</div>
                <div className="text-xs text-slate-600 mt-1">天干地支属性</div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">4</div>
                <div className="text-sm font-medium">十神分析</div>
                <div className="text-xs text-slate-600 mt-1">相互关系</div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-900 mb-2">AI 解读流程</h4>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <div className="text-sm">
                  <p className="font-medium text-amber-900 mb-1">AI 分析过程</p>
                  <p className="text-amber-800">
                    AI 模型接收八字命盘的结构化数据（四柱、五行、十神），
                    基于传统命理学知识进行模式识别和文本生成，
                    输出相应的性格分析、运势趋势和参考建议。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="card">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">使用说明</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-slate-900 mb-3">准确填写出生信息</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">查看出生证明确认时间</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">选择正确的时区</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">时间精确到小时级别</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">避免使用估计时间</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">不要忽略时区差异</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">避免随意填写信息</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-900 mb-3">理性看待结果</h4>
            <div className="p-4 bg-slate-50 rounded-lg">
              <ul className="text-sm text-slate-700 space-y-2">
                <li>• <strong>算法计算结果</strong>：基于传统算法，具有确定性和一致性</li>
                <li>• <strong>AI 解读内容</strong>：仅供文化研究和娱乐参考，不构成人生指导</li>
                <li>• <strong>个人发展</strong>：应以实际行动和理性思考为主导</li>
                <li>• <strong>重要决策</strong>：建议咨询专业人士，不应依赖命理分析</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 隐私和安全 */}
      <div className="card">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">隐私和安全</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-900 mb-2">数据处理</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• 所有计算在本地浏览器完成</li>
              <li>• 不存储任何个人出生信息</li>
              <li>• 不建立用户档案或历史记录</li>
              <li>• 关闭页面后数据自动清除</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-900 mb-2">技术安全</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• 使用 HTTPS 加密传输</li>
              <li>• 开源算法库，透明可验证</li>
              <li>• 无第三方数据收集</li>
              <li>• 符合数据保护法规</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 免责声明 */}
      <div className="card border-amber-200 bg-amber-50">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">免责声明</h3>
        
        <div className="text-sm text-slate-700 space-y-3">
          <p>
            <strong>文化研究目的：</strong>
            本工具仅用于传统文化研究、学习和娱乐目的，
            不提供任何形式的人生指导、医疗建议或投资建议。
          </p>
          
          <p>
            <strong>结果参考性：</strong>
            所有分析结果均基于传统命理学理论和AI模型推理，
            具有主观性和不确定性，不应作为重要决策的依据。
          </p>
          
          <p>
            <strong>个人责任：</strong>
            用户应理性看待分析结果，对基于本工具结果做出的任何决定承担完全责任。
            我们不对使用本工具可能产生的任何后果承担责任。
          </p>
          
          <p>
            <strong>专业建议：</strong>
            如需专业指导，请咨询相关领域的专业人士。
          </p>
        </div>
      </div>

      {/* 返回按钮 */}
      <div className="text-center">
        <button
          onClick={() => window.history.back()}
          className="btn-primary"
        >
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回上一页
        </button>
      </div>
    </div>
  );
}