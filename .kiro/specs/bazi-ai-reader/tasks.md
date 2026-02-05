# Implementation Plan: 八字排盘与 AI 解读 Web App

## Overview

基于冻结的需求和设计文档，创建一个 Next.js App Router 项目骨架。重点确保架构边界清晰、职责分离明确，为后续业务逻辑实现奠定坚实基础。

实施策略：
- 先搭建项目结构和类型定义
- 再实现 API 框架和核心模块骨架
- 最后完成前端组件和页面
- 每个阶段都包含相应的测试框架

## Tasks

- [x] 1. 项目初始化和基础配置
  - 创建 Next.js TypeScript 项目
  - 配置 package.json 和基础依赖
  - 设置 TypeScript 配置
  - 配置 Tailwind CSS
  - _Requirements: 9.1, 9.4_

- [ ] 2. 类型定义和数据模型
  - [x] 2.1 创建 Chart_Data v1 类型定义
    - 实现 types/chart.ts 中的 ChartDataV1 接口
    - 严格按照设计文档的 JSON Schema 定义
    - _Requirements: 3.1, 3.2, 3.5_
  
  - [ ]* 2.2 编写 Chart_Data Schema 验证属性测试
    - **Property 3: Chart_Data Schema 符合性**
    - **Validates: Requirements 3.1, 3.2, 3.5**
  
  - [x] 2.3 创建 API 请求响应类型
    - 实现 types/api.ts 中的请求响应接口
    - 包含错误处理类型定义
    - _Requirements: 4.1, 4.2_
  
  - [x] 2.4 创建出生信息类型定义
    - 实现 types/birth.ts 中的 BirthInfo 接口
    - 包含验证规则的类型约束
    - _Requirements: 1.2, 1.3_

- [ ] 3. 核心模块骨架实现
  - [x] 3.1 实现八字计算模块框架
    - 创建 lib/bazi/calculator.ts（仅接口和 TODO）
    - 创建 lib/bazi/converter.ts（仅接口和 TODO）
    - 创建 lib/bazi/validator.ts（仅接口和 TODO）
    - 添加严格的职责边界注释
    - _Requirements: 2.1, 2.2, 2.6_
  
  - [ ]* 3.2 编写八字计算确定性属性测试框架
    - **Property 2: 八字计算确定性**
    - **Validates: Requirements 2.2, 2.3**
  
  - [x] 3.3 实现 AI 解读模块框架
    - 创建 lib/ai/interpreter.ts（仅接口和 TODO）
    - 创建 lib/ai/prompt.ts（仅接口和 TODO）
    - 创建 lib/ai/client.ts（仅接口和 TODO）
    - 添加严格的访问边界注释
    - _Requirements: 4.3, 4.6_
  
  - [ ]* 3.4 编写 AI 访问边界限制属性测试框架
    - **Property 7: AI 访问边界限制**
    - **Validates: Requirements 4.3**

- [ ] 4. API 路由实现
  - [x] 4.1 实现 /api/chart 路由框架
    - 创建 app/api/chart/route.ts
    - 实现参数验证逻辑
    - 添加 TODO 注释标记业务逻辑位置
    - 严禁包含任何计算逻辑
    - _Requirements: 4.1, 2.5_
  
  - [ ]* 4.2 编写 API 职责边界属性测试框架
    - **Property 6: API 职责边界严格性**
    - **Validates: Requirements 4.1, 4.2**
  
  - [x] 4.3 实现 /api/interpret 路由框架
    - 创建 app/api/interpret/route.ts
    - 实现参数验证逻辑
    - 添加 TODO 注释标记业务逻辑位置
    - 严禁包含任何计算逻辑
    - _Requirements: 4.2, 4.6_
  
  - [ ]* 4.4 编写错误处理边界属性测试框架
    - **Property 8: 错误处理边界**
    - **Validates: Requirements 2.5, 4.4**

- [ ] 5. 前端页面和组件
  - [x] 5.1 创建应用布局和全局样式
    - 实现 app/layout.tsx
    - 配置 app/globals.css
    - 设置基础的响应式布局
    - _Requirements: 6.3, 6.4_
  
  - [x] 5.2 实现首页出生信息输入
    - 创建 app/page.tsx
    - 实现基础的表单结构（不含验证逻辑）
    - 添加 TODO 注释标记交互逻辑位置
    - _Requirements: 1.1, 1.4_
  
  - [ ]* 5.3 编写输入验证一致性属性测试框架
    - **Property 1: 输入验证一致性**
    - **Validates: Requirements 1.2, 1.5**
  
  - [x] 5.4 实现结果展示页面
    - 创建 app/result/page.tsx
    - 实现基础的结果展示结构
    - 添加 TODO 注释标记数据渲染逻辑位置
    - _Requirements: 6.1, 6.2_

- [ ] 6. 工具函数和通用模块
  - [x] 6.1 实现通用验证函数
    - 创建 lib/utils/validation.ts
    - 实现基础的参数验证函数框架
    - _Requirements: 1.2, 1.5_
  
  - [x] 6.2 实现错误处理模块
    - 创建 lib/utils/errors.ts
    - 定义标准化的错误类型和处理函数
    - _Requirements: 2.5, 4.4_
  
  - [ ]* 6.3 编写数据纯净性保证属性测试框架
    - **Property 5: 数据纯净性保证**
    - **Validates: Requirements 3.6, 4.6**

- [ ] 7. 测试框架配置
  - [ ] 7.1 配置属性测试环境
    - 安装和配置 fast-check 库
    - 设置测试运行配置（最少100次迭代）
    - 创建测试工具函数
    - _Requirements: Testing Strategy_
  
  - [ ] 7.2 配置单元测试环境
    - 安装和配置 Jest 和 @testing-library
    - 设置测试文件结构
    - 创建测试辅助工具
    - _Requirements: Testing Strategy_

- [ ] 8. 项目文档和启动配置
  - [x] 8.1 创建项目 README
    - 编写项目介绍和架构说明
    - 提供本地启动说明（Node 18+, npm）
    - 说明职责边界和安全约束
    - _Requirements: 9.1, 9.6_
  
  - [x] 8.2 配置开发环境脚本
    - 设置 npm scripts
    - 配置开发服务器
    - 设置代码格式化和检查工具
    - _Requirements: 9.4, 9.5_

- [x] 9. 最终检查点
  - 确保项目能够成功启动
  - 验证所有 API 端点返回正确的错误信息
  - 确认职责边界注释清晰明确
  - 验证测试框架配置正确
  - 询问用户是否有问题或需要调整

## Notes

- 任务标记 `*` 的为可选测试任务，可跳过以加快 MVP 交付
- 每个任务都明确引用了对应的需求条款
- 所有业务逻辑都用 TODO 注释标记，不在骨架阶段实现
- 重点确保架构边界清晰，防止后续开发中的越权问题
- 属性测试框架为后续业务逻辑实现提供质量保障