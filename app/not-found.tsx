/**
 * 404 页面
 */

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          页面未找到
        </h2>
        
        <p className="text-slate-600 mb-6">
          您访问的页面不存在或已被移动
        </p>
        
        <a
          href="/"
          className="btn-primary"
        >
          返回首页
        </a>
      </div>
    </div>
  );
}