'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type ApiError = { code: string; message: string; timestamp: string };

type ChartDataV1 = any; // 你已经有 types 的话可以换成 import type { ChartDataV1 } from "@/types/chart";

type InterpretResponse =
  | { success: true; data: { personality: string; fortune?: string; suggestions?: string; generatedAt: string } }
  | { success: false; error: ApiError };

type ChartResponse =
  | { success: true; data: ChartDataV1 }
  | { success: false; error: ApiError };

function SectionTitle({ children }: { children: string }) {
  return <h2 style={{ margin: '18px 0 10px', fontSize: 16, fontWeight: 700 }}>{children}</h2>;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #eaeaea',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function Pill({ children }: { children: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '6px 10px',
        borderRadius: 999,
        background: '#f3f4f6',
        fontSize: 12,
        marginRight: 8,
      }}
    >
      {children}
    </span>
  );
}

export default function ResultPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [chart, setChart] = useState<ChartDataV1 | null>(null);
  const [reading, setReading] = useState<{ personality: string; fortune?: string; suggestions?: string; generatedAt: string } | null>(null);

  const [showRawChart, setShowRawChart] = useState(false);

  const searchParams = useSearchParams();

  const birthInfo = useMemo(() => {
  const birthYear = Number(searchParams.get('birthYear'));
  const birthMonth = Number(searchParams.get('birthMonth'));
  const birthDay = Number(searchParams.get('birthDay'));
  const birthHour = Number(searchParams.get('birthHour'));
  const birthMinute = Number(searchParams.get('birthMinute') ?? 0);
  const timezone = searchParams.get('timezone') || 'Asia/Shanghai';

  if (!birthYear || !birthMonth || !birthDay || birthHour === null) {
    return null;
  }

  return {
    birthYear,
    birthMonth,
    birthDay,
    birthHour,
    birthMinute,
    timezone,
  };
}, [searchParams]);



  useEffect(() => {
    async function run() {
      try {
        setLoading(true);
        setError(null);

        if (!birthInfo) {
            setError('缺少出生信息，请从首页重新填写');
            setLoading(false);
        return;
        }

        // 1) 计算 ChartData
        const chartRes = await fetch('/api/chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(birthInfo),
        });

        const chartJson: ChartResponse = await chartRes.json().catch(async () => {
          const t = await chartRes.text();
          throw new Error(`八字计算失败：HTTP ${chartRes.status} ${t}`);
        });

        if (!chartRes.ok || !chartJson.success) {
          const msg = (chartJson as any)?.error?.message ?? `八字计算失败：HTTP ${chartRes.status}`;
          throw new Error(msg);
        }

        setChart(chartJson.data);

        // 2) AI 解读（注意：字段名必须是 chartData）
        const interpretRes = await fetch('/api/interpret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chartData: chartJson.data,
            // focusAreas: ['personality','fortune','career'] // 以后要多方向再开
          }),
        });

        const interpretJson: InterpretResponse = await interpretRes.json().catch(async () => {
          const t = await interpretRes.text();
          throw new Error(`AI 解读失败：HTTP ${interpretRes.status} ${t}`);
        });

        if (!interpretRes.ok || !interpretJson.success) {
          const msg = (interpretJson as any)?.error?.message ?? `AI 解读失败：HTTP ${interpretRes.status}`;
          throw new Error(msg);
        }

        setReading(interpretJson.data);
      } catch (e: any) {
        setError(e?.message ?? '未知错误');
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [birthInfo]);

  // 简化展示：四柱 + 五行
  const summary = useMemo(() => {
    if (!chart) return null;

    const y = chart?.pillars?.year ? `${chart.pillars.year.heavenly}${chart.pillars.year.earthly}` : '—';
    const m = chart?.pillars?.month ? `${chart.pillars.month.heavenly}${chart.pillars.month.earthly}` : '—';
    const d = chart?.pillars?.day ? `${chart.pillars.day.heavenly}${chart.pillars.day.earthly}` : '—';
    const h = chart?.pillars?.hour ? `${chart.pillars.hour.heavenly}${chart.pillars.hour.earthly}` : '—';

    const e = chart?.elements || {};
    return {
      pillarsText: `${y}  ${m}  ${d}  ${h}`,
      elementsText: `年:${e.year ?? '—'}  月:${e.month ?? '—'}  日:${e.day ?? '—'}  时:${e.hour ?? '—'}`,
      dayMaster: e.dayMaster ?? '—',
      library: chart?.metadata?.library ?? '—',
      calculatedAt: chart?.metadata?.calculatedAt ?? '—',
    };
  }, [chart]);

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: 20 }}>
      <div style={{ marginBottom: 14 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>八字分析结果</h1>
        <div style={{ color: '#6b7280', marginTop: 6, lineHeight: 1.6 }}>
          本工具分为两层：<b>算法排盘</b>（确定性）与 <b>AI 辅助解读</b>（仅供文化与性格参考）。
        </div>
      </div>

      {loading && (
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>正在生成中…</div>
          <div style={{ color: '#6b7280', lineHeight: 1.7 }}>
            先计算命盘（算法），再生成解读（AI）。通常几秒内完成。
          </div>
        </Card>
      )}

      {!loading && error && (
        <Card>
          <div style={{ fontWeight: 800, color: '#dc2626', marginBottom: 8 }}>出错了</div>
          <div style={{ color: '#991b1b', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{error}</div>
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => location.reload()}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #e5e7eb',
                background: '#fff',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              重试
            </button>
          </div>
        </Card>
      )}

      {!loading && !error && summary && (
        <>
          {/* 顶部摘要卡（用户最关心的） */}
          <Card>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <Pill>四柱：{summary.pillarsText}</Pill>
              <Pill>日主：{summary.dayMaster}</Pill>
              <Pill>五行：{summary.elementsText}</Pill>
            </div>

            <div style={{ marginTop: 12, color: '#6b7280', fontSize: 12, lineHeight: 1.6 }}>
              排盘来源：{summary.library} ｜ 计算时间：{summary.calculatedAt}
            </div>
          </Card>

          {/* AI 解读（核心阅读区） */}
          <SectionTitle>AI 解读（仅供参考）</SectionTitle>

          <Card>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>性格</div>
            <div style={{ lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{reading?.personality || '（暂无）'}</div>
          </Card>

          <Card>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>运势</div>
            <div style={{ lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{reading?.fortune || '（暂无）'}</div>
          </Card>

          <Card>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>建议</div>
            <div style={{ lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{reading?.suggestions || '（暂无）'}</div>
            <div style={{ marginTop: 10, color: '#6b7280', fontSize: 12 }}>
              生成时间：{reading?.generatedAt ?? '—'}
            </div>
          </Card>

          {/* 命盘详情（默认折叠，避免信息过载） */}
          <SectionTitle>命盘数据（算法结果，可展开）</SectionTitle>

          <Card>
            <button
              onClick={() => setShowRawChart(v => !v)}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #e5e7eb',
                background: '#fff',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              {showRawChart ? '收起命盘 JSON' : '展开命盘 JSON'}
            </button>

            {showRawChart && (
              <pre
                style={{
                  marginTop: 12,
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  padding: 12,
                  overflowX: 'auto',
                  fontSize: 12,
                  lineHeight: 1.6,
                }}
              >
                {JSON.stringify(chart, null, 2)}
              </pre>
            )}
          </Card>

          {/* 免责声明（合规与克制） */}
          <Card>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>使用须知</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: '#374151', lineHeight: 1.9 }}>
              <li>排盘由第三方库算法计算，结果具有确定性。</li>
              <li>AI 解读仅做文化与性格层面的辅助说明，不构成现实决策建议。</li>
              <li>如遇到错误，请以“排盘失败/解读失败”的错误提示为准，不做任何补偿推算。</li>
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
