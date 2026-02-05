# Design Document: 八字排盘与 AI 解读 Web App

## Overview

八字排盘与 AI 解读 Web App 是一个基于 Next.js App Router 的现代化命理应用。系统采用严格的职责分离架构，确保八字计算的确定性和 AI 解读的安全边界。

核心设计原则：
- **计算与解读分离**：八字计算使用确定性算法，AI 仅负责文本解读
- **API 职责明确**：/api/chart 负责计算，/api/interpret 负责解读
- **无状态设计**：所有 API 都是无状态的，便于扩展和维护
- **MVP 优先**：专注核心功能链路，为后续扩展预留空间

## Architecture

### 系统架构图

```mermaid
graph TB
    A[用户界面] --> B[Next.js App Router]
    B --> C[/api/chart]
    B --> D[/api/interpret]
    
    C --> E[lib/bazi 计算模块]
    D --> F[lib/ai 解读模块]
    
    E --> G[第三方八字库]
    F --> H[AI API 服务]
    
    C --> I[Chart_Data v1 JSON]
    I --> D
    D --> J[Reading_Response JSON]
```

### 技术栈选择

- **前端框架**：Next.js 14+ App Router
- **运行时**：Node.js 18+
- **八字计算**：lunar-javascript 或类似成熟库
- **AI 服务**：OpenAI API 或兼容接口
- **类型系统**：TypeScript
- **样式方案**：Tailwind CSS（MVP 简化版）

## Components and Interfaces

### 目录结构设计

```
bazi-ai-reader/
├── app/                          # Next.js App Router 页面
│   ├── page.tsx                  # 首页：出生信息输入
│   ├── result/page.tsx           # 结果页：命盘展示与解读
│   ├── layout.tsx                # 全局布局
│   ├── globals.css               # 全局样式
│   └── api/                      # API 路由
│       ├── chart/route.ts        # 八字计算 API
│       └── interpret/route.ts    # AI 解读 API
├── lib/                          # 核心业务逻辑
│   ├── bazi/                     # 八字计算模块（物理隔离）
│   │   ├── calculator.ts         # 八字计算核心逻辑
│   │   ├── converter.ts          # 数据格式转换
│   │   └── validator.ts          # 出生信息验证
│   ├── ai/                       # AI 解读模块（物理隔离）
│   │   ├── interpreter.ts        # AI 解读核心逻辑
│   │   ├── prompt.ts             # 提示词管理
│   │   └── client.ts             # AI API 客户端
│   └── utils/                    # 通用工具
│       ├── validation.ts         # 通用验证函数
│       └── errors.ts             # 错误处理
├── types/                        # TypeScript 类型定义
│   ├── chart.ts                  # Chart_Data v1 Schema
│   ├── api.ts                    # API 请求响应类型
│   └── birth.ts                  # 出生信息类型
├── components/                   # React 组件
│   ├── BirthForm.tsx             # 出生信息表单
│   ├── ChartDisplay.tsx          # 命盘展示组件
│   └── ReadingDisplay.tsx        # 解读结果展示
└── package.json                  # 项目配置
```

### 核心组件职责

#### 1. 八字计算模块 (lib/bazi/)

**职责边界：**
- ✅ 接收出生信息，调用第三方库计算八字
- ✅ 转换计算结果为 Chart_Data v1 格式
- ✅ 验证出生信息的有效性
- ❌ 不得包含任何 AI 相关逻辑
- ❌ 不得进行文本解读或分析

#### 2. AI 解读模块 (lib/ai/)

**职责边界：**
- ✅ 接收 Chart_Data，生成解读文本
- ✅ 管理 AI 提示词和调用逻辑
- ✅ 处理 AI API 的错误和重试
- ❌ 不得访问原始出生信息
- ❌ 不得进行任何八字计算

#### 3. API 路由层

**职责边界：**
- `/api/chart`：参数验证 → 调用 bazi 模块 → 返回 Chart_Data
- `/api/interpret`：参数验证 → 调用 ai 模块 → 返回 Reading_Response

## Data Models

### Chart_Data v1 JSON Schema

```typescript
interface ChartDataV1 {
  version: "1.0";                    // Schema 版本标识
  timestamp: string;                 // 计算时间戳
  
  // 必填字段：算法计算结果
  pillars: {
    year: { heavenly: string; earthly: string; };    // 年柱
    month: { heavenly: string; earthly: string; };   // 月柱
    day: { heavenly: string; earthly: string; };     // 日柱
    hour: { heavenly: string; earthly: string; };    // 时柱
  };
  
  elements: {
    year: string;     // 年柱五行
    month: string;    // 月柱五行
    day: string;      // 日柱五行
    hour: string;     // 时柱五行
    dayMaster: string; // 日主五行
  };
  
  tenGods: {
    year: string;     // 年柱十神
    month: string;    // 月柱十神
    day: string;      // 日柱十神（固定为"日主"）
    hour: string;     // 时柱十神
  };
  
  // 可选字段：展示用途
  nayin?: {
    year: string;     // 年柱纳音
    month: string;    // 月柱纳音
    day: string;      // 日柱纳音
    hour: string;     // 时柱纳音
  };
  
  spirits?: string[]; // 神煞列表（仅供展示）
  
  // 元数据
  metadata: {
    source: "algorithm_computed";     // 数据来源标识
    library: string;                  // 使用的计算库名称
    calculatedAt: string;             // 计算时间
  };
}
```

### API 请求响应类型

```typescript
// /api/chart 请求
interface ChartRequest {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
  timezone?: string;    // 可选，默认 UTC+8
  gender?: 'male' | 'female'; // 可选，某些计算可能需要
}

// /api/chart 响应
interface ChartResponse {
  success: boolean;
  data?: ChartDataV1;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// /api/interpret 请求
interface InterpretRequest {
  chartData: ChartDataV1;
  focusAreas?: string[];  // 可选：用户关注的解读方向
}

// /api/interpret 响应
interface InterpretResponse {
  success: boolean;
  data?: {
    personality: string;      // 性格特征解读
    fortune: string;          // 运势概述
    suggestions: string;      // 建议指导
    generatedAt: string;      // 生成时间
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### 出生信息类型

```typescript
interface BirthInfo {
  year: number;         // 出生年份
  month: number;        // 出生月份 (1-12)
  day: number;          // 出生日期 (1-31)
  hour: number;         // 出生小时 (0-23)
  minute: number;       // 出生分钟 (0-59)
  timezone: string;     // 时区，默认 "Asia/Shanghai"
  gender?: 'male' | 'female'; // 性别（可选）
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

在开始编写正确性属性之前，我需要先分析需求文档中的验收标准，确定哪些可以转化为可测试的属性。

基于需求分析，我识别出以下可测试的正确性属性：

### Property 1: 输入验证一致性
*For any* 出生信息输入，验证函数应该对有效输入返回成功，对无效输入返回具体的错误信息
**Validates: Requirements 1.2, 1.5**

### Property 2: 八字计算确定性
*For any* 有效的出生信息，八字计算应该产生一致的四柱干支、五行属性和十神关系结果
**Validates: Requirements 2.2, 2.3**

### Property 3: Chart_Data Schema 符合性
*For any* 八字计算结果，生成的 Chart_Data 应该严格符合 v1 Schema，包含所有必填字段和正确的版本标识
**Validates: Requirements 3.1, 3.2, 3.5**

### Property 4: 数据来源标记正确性
*For any* Chart_Data 输出，所有字段都应该正确标记数据来源（algorithm_computed 或 display_only）
**Validates: Requirements 3.4**

### Property 5: 数据纯净性保证
*For any* Chart_Data，不应该包含任何 AI 生成的解读内容，且 AI 解读过程不应该修改原始 Chart_Data
**Validates: Requirements 3.6, 4.6**

### Property 6: API 职责边界严格性
*For any* API 调用，/api/chart 应该只进行计算并返回 Chart_Data，/api/interpret 应该只进行解读并返回 Reading_Response
**Validates: Requirements 4.1, 4.2**

### Property 7: AI 访问边界限制
*For any* AI 解读请求，AI 模块应该无法访问原始出生信息，只能基于提供的 Chart_Data 进行解读
**Validates: Requirements 4.3**

### Property 8: 错误处理边界
*For any* 计算失败的情况，系统应该返回明确的错误信息，而不应该调用 AI 进行补偿计算
**Validates: Requirements 2.5, 4.4**

## Error Handling

### 错误分类与处理策略

#### 1. 输入验证错误
- **日期无效**：返回 400 Bad Request，具体说明哪个字段无效
- **时区无效**：返回 400 Bad Request，提供支持的时区列表
- **参数缺失**：返回 400 Bad Request，列出缺失的必填参数

#### 2. 计算错误
- **第三方库错误**：返回 500 Internal Server Error，记录详细日志
- **数据转换错误**：返回 500 Internal Server Error，不暴露内部实现细节
- **超时错误**：返回 504 Gateway Timeout，建议用户重试

#### 3. AI 服务错误
- **API 调用失败**：返回 502 Bad Gateway，提供重试建议
- **响应格式错误**：返回 502 Bad Gateway，记录原始响应用于调试
- **配额超限**：返回 429 Too Many Requests，提供重试时间

#### 4. 系统错误
- **内存不足**：返回 503 Service Unavailable，触发告警
- **网络错误**：返回 502 Bad Gateway，自动重试机制
- **未知错误**：返回 500 Internal Server Error，生成错误ID用于追踪

### 错误响应格式

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // 错误代码，如 "INVALID_DATE"
    message: string;        // 用户友好的错误信息
    details?: any;          // 详细错误信息（开发环境）
    timestamp: string;      // 错误发生时间
    requestId?: string;     // 请求追踪ID
  };
}
```

## Testing Strategy

### 双重测试方法

本系统采用**单元测试**和**属性测试**相结合的策略：

- **单元测试**：验证具体示例、边界情况和错误条件
- **属性测试**：验证通用属性在所有输入下的正确性
- **集成测试**：验证 API 端到端的功能正确性

### 属性测试配置

使用 **fast-check** 库进行属性测试，每个测试运行最少 100 次迭代：

```typescript
// 示例：八字计算确定性测试
fc.assert(fc.property(
  fc.record({
    year: fc.integer({ min: 1900, max: 2100 }),
    month: fc.integer({ min: 1, max: 12 }),
    day: fc.integer({ min: 1, max: 31 }),
    hour: fc.integer({ min: 0, max: 23 }),
    minute: fc.integer({ min: 0, max: 59 })
  }),
  (birthInfo) => {
    // Feature: bazi-ai-reader, Property 2: 八字计算确定性
    const result1 = calculateBazi(birthInfo);
    const result2 = calculateBazi(birthInfo);
    return deepEqual(result1, result2);
  }
), { numRuns: 100 });
```

### 测试覆盖重点

#### 1. 八字计算模块测试
- **属性测试**：计算结果的确定性和一致性
- **单元测试**：特殊日期（闰年、月末）的处理
- **边界测试**：极值日期的计算正确性

#### 2. AI 解读模块测试
- **属性测试**：输入输出格式的一致性
- **单元测试**：错误处理和重试机制
- **模拟测试**：AI API 的各种响应情况

#### 3. API 集成测试
- **端到端测试**：完整的请求响应流程
- **错误场景测试**：各种异常情况的处理
- **性能测试**：响应时间和并发处理能力

#### 4. 安全边界测试
- **隔离测试**：验证 AI 模块无法访问计算逻辑
- **数据纯净性测试**：确保 Chart_Data 不被污染
- **权限边界测试**：API 职责边界的严格性

### 测试环境配置

- **开发环境**：使用模拟的 AI API，快速反馈
- **测试环境**：使用真实的 AI API，完整功能验证
- **生产环境**：监控和告警，实时错误追踪

每个属性测试都必须标记对应的设计文档属性：
```typescript
// Feature: bazi-ai-reader, Property 1: 输入验证一致性
```