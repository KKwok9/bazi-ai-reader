# 八字排盘与 AI 解读 Web App

基于传统命理学与现代 AI 技术的八字排盘和智能解读服务。

## 项目概述

这是一个 MVP（最小可用产品）版本的八字排盘应用，采用 Next.js App Router 架构，严格分离八字计算与 AI 解读功能，确保计算结果的准确性和一致性。

### 核心特性

- ✅ **确定性八字计算**：使用成熟的第三方库进行八字排盘
- ✅ **AI 智能解读**：基于命盘数据生成个性化解读
- ✅ **严格职责分离**：计算与解读模块物理隔离
- ✅ **响应式设计**：支持桌面和移动设备
- ✅ **类型安全**：完整的 TypeScript 类型定义

### 技术栈

- **前端框架**：Next.js 14+ (App Router)
- **开发语言**：TypeScript
- **样式方案**：Tailwind CSS
- **运行环境**：Node.js 18+
- **包管理器**：npm

## 快速开始

### 环境要求

- Node.js 18.0.0 或更高版本
- npm 8.0.0 或更高版本

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动。

### 其他命令

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 类型检查
npm run type-check
```

## 项目架构

### 目录结构

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
└── components/                   # React 组件（未来扩展）
```

### 核心设计原则

#### 1. 严格职责分离

- **八字计算模块** (`lib/bazi/`)：仅负责确定性计算，禁止 AI 参与
- **AI 解读模块** (`lib/ai/`)：仅负责文本解读，禁止访问原始数据
- **API 层**：明确的接口边界，防止越权访问

#### 2. 数据流控制

```
用户输入 → /api/chart → Chart_Data v1 → /api/interpret → AI 解读
```

- AI 模块无法访问原始出生信息
- 所有计算结果都经过标准化验证
- 错误处理有明确的边界和回退机制

#### 3. 类型安全

- **Chart_Data v1**：冻结的 JSON Schema，确保 API 契约稳定
- **完整类型覆盖**：所有接口都有 TypeScript 类型定义
- **运行时验证**：关键数据结构都有验证函数

## API 接口

### POST /api/chart

计算八字命盘

**请求体：**
```typescript
{
  birthYear: number;        // 出生年份 (1900-2100)
  birthMonth: number;       // 出生月份 (1-12)
  birthDay: number;         // 出生日期 (1-31)
  birthHour: number;        // 出生小时 (0-23)
  birthMinute: number;      // 出生分钟 (0-59)
  timezone?: string;        // 时区，默认 "Asia/Shanghai"
  gender?: 'male' | 'female'; // 性别（可选）
}
```

**响应：**
```typescript
{
  success: true;
  data: ChartDataV1;        // 标准化的八字命盘数据
}
```

### POST /api/interpret

生成 AI 解读

**请求体：**
```typescript
{
  chartData: ChartDataV1;   // 八字命盘数据
  focusAreas?: string[];    // 可选的解读方向
}
```

**响应：**
```typescript
{
  success: true;
  data: {
    personality: string;    // 性格特征解读
    fortune: string;        // 运势概述
    suggestions: string;    // 建议指导
    generatedAt: string;    // 生成时间
  }
}
```

## 开发状态

### ✅ 已完成

- [x] 项目基础架构搭建
- [x] 类型定义和数据模型
- [x] API 路由框架
- [x] 前端页面骨架
- [x] 错误处理机制
- [x] 基础样式和布局

### 🚧 待实现（业务逻辑）

- [ ] 八字计算算法集成
- [ ] AI API 服务集成
- [ ] 表单验证逻辑
- [ ] 数据持久化（可选）
- [ ] 结果导出功能
- [ ] 性能优化

### 📋 技术债务

- [ ] 单元测试覆盖
- [ ] 属性测试框架
- [ ] 错误监控集成
- [ ] 性能监控
- [ ] 安全性加固

## 安全约束

### 职责边界

1. **八字计算模块**严禁包含任何 AI 相关逻辑
2. **AI 解读模块**严禁访问原始出生信息或进行计算
3. **API 层**确保数据流的单向性和安全性

### 数据保护

- 不进行用户数据持久化存储
- 所有计算都在内存中临时处理
- API 响应不包含敏感的调试信息

### 错误处理

- 计算失败时不使用 AI 进行补偿
- 所有错误都有明确的分类和处理策略
- 用户友好的错误提示，不暴露内部实现

## 贡献指南

### 开发约束

1. **严格遵守职责边界**：不得在八字计算模块中引入 AI 逻辑
2. **保持类型安全**：所有新增代码必须有完整的类型定义
3. **遵循错误处理规范**：使用标准化的错误类型和处理机制

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 配置规则
- 保持代码注释的完整性
- 所有 TODO 注释必须说明具体的实现要求

## 许可证

本项目仅供学习和研究使用。

## 免责声明

本应用提供的八字解读仅供参考和娱乐，不构成人生决策建议。请理性对待命理学内容，不要过度依赖。