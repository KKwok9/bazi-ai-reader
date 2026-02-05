/**
 * 全局错误状态页面
 */

'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          出现了一些问题
        </h2>
        
        <p className="text-slate-600 mb-6">
          系统遇到了意外错误，请稍后重试
        </p>
        
        <div className="space-x-4">
          <button
            onClick={reset}
            className="btn-primary"
          >
            重试
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="btn-secondary"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}