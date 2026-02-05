import OpenAI from "openai";
import { ChartDataV1 } from "@/types/chart";

/**
 * DeepSeek 官方接入方式
 * - 国内直连
 * - 不需要代理
 * - 使用 OpenAI SDK + baseURL
 */
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.deepseek.com",
  timeout: 60000, // 60 秒
});

type AIResult = {
  personality: string;
  fortune: string;
  suggestions: string;
  generatedAt: string;
};

export async function aiInterpreter(chart: ChartDataV1): Promise<AIResult> {
  console.log("🧠 AI interpret start (DeepSeek)");

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "deepseek-chat",
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content: `
你是一个【理性、克制、结构化】的八字文化分析助手。

严格遵守：
- 只做【性格特征 / 长期倾向 / 行为风格】层面的文化分析
- 不做具体预测（如年份、事件、财富数值）
- 不下确定性结论
- 不提供现实决策建议
- 不使用玄学夸张语言

你的输出【必须是 JSON】，格式如下：

{
  "personality": "性格描述",
  "fortune": "长期状态与节奏倾向描述",
  "suggestions": "理性、中性的行为建议"
}

每一项不超过 120 字。
        `.trim(),
      },
      {
        role: "user",
        content: `
以下是已经通过算法计算完成的八字命盘数据（ChartDataV1）。
请严格基于这些数据进行分析，不要推算、不补充、不猜测。

命盘数据：
${JSON.stringify(chart, null, 2)}
        `.trim(),
      },
    ],
  });

  const content = response.choices?.[0]?.message?.content ?? "";

  // 兜底：防止 AI 返回非 JSON
  try {
    const parsed = JSON.parse(content);

    return {
      personality:
        typeof parsed.personality === "string" && parsed.personality.trim()
          ? parsed.personality
          : "性格特征偏向稳定、理性，重视秩序与结构。",
      fortune:
        typeof parsed.fortune === "string" && parsed.fortune.trim()
          ? parsed.fortune
          : "整体长期状态以平稳积累为主，节奏偏向循序渐进。",
      suggestions:
        typeof parsed.suggestions === "string" && parsed.suggestions.trim()
          ? parsed.suggestions
          : "适合保持节奏感，避免情绪化判断，重视长期规划。",
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn("⚠️ AI 返回内容非 JSON，已使用兜底内容");

    return {
      personality: "性格特征偏向理性、克制，做事讲求逻辑与稳定性。",
      fortune: "长期状态呈现稳中求进的特征，更适合持续积累型发展。",
      suggestions: "保持节奏感与边界意识，有助于长期稳定发挥。",
      generatedAt: new Date().toISOString(),
    };
  }
}
