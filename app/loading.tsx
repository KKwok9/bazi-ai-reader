/**
 * 全局加载状态页面
 */

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-slate-600">加载中...</p>
      </div>
    </div>
  );
}