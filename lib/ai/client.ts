/**
 * AI API 客户端模块
 * 
 * 严格职责边界：
 * ✅ 允许：调用外部 AI API 服务
 * ✅ 允许：处理 API 请求和响应
 * ✅ 允许：实现重试和错误处理机制
 * ❌ 禁止：进行任何八字计算
 * ❌ 禁止：访问原始出生信息
 * ❌ 禁止：修改或验证八字数据
 * 
 * 安全约束：
 * - 只负责 AI API 的网络通信
 * - 不处理业务逻辑，只处理技术层面的 API 调用
 * - 所有配置信息必须通过环境变量管理
 */

/**
 * AI 客户端接口
 */
export interface AIClient {
  /**
   * 调用 AI 服务生成文本
   */
  generateText(prompt: string, options?: GenerationOptions): Promise<string>;
  
  /**
   * 检查 AI 服务状态
   */
  checkHealth(): Promise<{ healthy: boolean; error?: string }>;
}

/**
 * 文本生成选项
 */
export interface GenerationOptions {
  maxTokens?: number;       // 最大 token 数
  temperature?: number;     // 创造性程度 (0-1)
  model?: string;          // 使用的模型
  timeout?: number;        // 请求超时时间（毫秒）
}

/**
 * AI API 响应格式
 */
export interface AIResponse {
  content: string;         // 生成的文本内容
  usage?: {
    promptTokens: number;  // 输入 token 数
    completionTokens: number; // 输出 token 数
    totalTokens: number;   // 总 token 数
  };
  model?: string;          // 实际使用的模型
}

/**
 * AI 客户端配置
 */
export interface AIClientConfig {
  apiKey: string;          // API 密钥
  baseUrl: string;         // API 基础 URL
  model: string;           // 默认模型
  timeout: number;         // 默认超时时间
  maxRetries: number;      // 最大重试次数
}

/**
 * AI 客户端实现类
 */
export class AIClientImpl implements AIClient {
  private config: AIClientConfig;
  
  constructor(config?: Partial<AIClientConfig>) {
    // 从环境变量读取配置
    this.config = {
      apiKey: process.env.AI_API_KEY || '',
      baseUrl: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      timeout: parseInt(process.env.AI_TIMEOUT || '30000'),
      maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3'),
      ...config,
    };
  }
  
  /**
   * 生成文本
   */
  async generateText(prompt: string, options?: GenerationOptions): Promise<string> {
    // 验证配置
    if (!this.config.apiKey) {
      throw new Error('AI API key not configured');
    }
    
    // 合并选项
    const requestOptions: GenerationOptions = {
      maxTokens: 1500,
      temperature: 0.7,
      model: this.config.model,
      timeout: this.config.timeout,
      ...options,
    };
    
    // 使用重试机制调用 API
    return await this.withRetry(async () => {
      const response = await this.makeRequest(prompt, requestOptions);
      return this.extractContent(response);
    });
  }
  
  /**
   * 检查服务健康状态
   */
  async checkHealth(): Promise<{ healthy: boolean; error?: string }> {
    try {
      // 配置检查
      if (!this.config.apiKey) {
        return { healthy: false, error: 'API key not configured' };
      }
      
      if (!this.config.baseUrl) {
        return { healthy: false, error: 'Base URL not configured' };
      }
      
      // 发送测试请求
      const testResponse = await this.generateText('Hello', { maxTokens: 5 });
      
      if (!testResponse || testResponse.length === 0) {
        return { healthy: false, error: 'Empty response from AI service' };
      }
      
      return { healthy: true };
      
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * 发送 API 请求
   */
  private async makeRequest(prompt: string, options: GenerationOptions): Promise<AIResponse> {
    const requestBody = {
      model: options.model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: options.maxTokens,
      temperature: options.temperature,
    };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);
    
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw this.handleAPIError(response);
      }
      
      const data = await response.json();
      return this.parseAPIResponse(data);
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }
  
  /**
   * 解析 API 响应
   */
  private parseAPIResponse(data: any): AIResponse {
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid API response format');
    }
    
    return {
      content: data.choices[0].message.content || '',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0,
      } : undefined,
      model: data.model,
    };
  }
  
  /**
   * 提取响应内容
   */
  private extractContent(response: AIResponse): string {
    if (!response.content) {
      throw new Error('Empty content in AI response');
    }
    
    return response.content.trim();
  }
  
  /**
   * 实现重试机制
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.config.maxRetries
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // 最后一次尝试，不再重试
        if (attempt === maxRetries) {
          break;
        }
        
        // 检查是否应该重试
        if (!this.shouldRetry(lastError)) {
          break;
        }
        
        // 指数退避
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
  
  /**
   * 判断是否应该重试
   */
  private shouldRetry(error: Error): boolean {
    // 网络错误或服务器错误可以重试
    if (error.message.includes('timeout') || 
        error.message.includes('network') ||
        error.message.includes('500') ||
        error.message.includes('502') ||
        error.message.includes('503')) {
      return true;
    }
    
    // 认证错误或客户端错误不重试
    return false;
  }
  
  /**
   * 处理 API 错误
   */
  private handleAPIError(response: Response): Error {
    const status = response.status;
    
    switch (status) {
      case 401:
        return new Error('AI API authentication failed');
      case 403:
        return new Error('AI API access forbidden');
      case 429:
        return new Error('AI API rate limit exceeded');
      case 500:
        return new Error('AI API internal server error');
      case 502:
        return new Error('AI API bad gateway');
      case 503:
        return new Error('AI API service unavailable');
      default:
        return new Error(`AI API error: ${status} ${response.statusText}`);
    }
  }
}

/**
 * 默认 AI 客户端实例
 */
export const aiClient = new AIClientImpl();