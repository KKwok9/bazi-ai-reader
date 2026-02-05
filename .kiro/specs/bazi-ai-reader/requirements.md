# Requirements Document

## Introduction

八字排盘与 AI 解读 Web App 是一个基于传统中国命理学的现代化应用程序。该系统使用确定性算法进行八字排盘计算，并结合 AI 技术提供智能化的命理解读服务。系统采用 Next.js App Router + Node API 技术栈，优先实现最小可用产品（MVP）。

## Glossary

- **System**: 八字排盘与 AI 解读 Web App
- **Bazi_Calculator**: 八字排盘计算引擎
- **AI_Reader**: AI 解读服务
- **Chart_Data**: 八字命盘数据结构
- **User_Interface**: 用户交互界面
- **API_Layer**: 后端 API 服务层
- **Birth_Info**: 用户出生信息（年月日时、地点）
- **Deterministic_Algorithm**: 确定性八字计算算法
- **Reading_Response**: AI 解读结果

## Requirements

### Requirement 1: 用户信息输入

**User Story:** 作为用户，我想要输入我的出生信息，以便系统能够为我生成准确的八字命盘。

#### Acceptance Criteria

1. WHEN 用户访问应用首页 THEN THE User_Interface SHALL 显示出生信息输入表单
2. WHEN 用户输入出生年月日时 THEN THE System SHALL 验证日期时间格式的有效性
3. WHEN 用户输入出生地点 THEN THE System SHALL 验证地点信息并获取时区数据
4. WHEN 用户提交完整的出生信息 THEN THE System SHALL 保存信息并触发八字计算流程
5. WHEN 用户输入不完整或无效信息 THEN THE System SHALL 显示具体的错误提示信息

### Requirement 2: 八字排盘计算（MVP 核心）

**User Story:** 作为系统，我需要使用确定性算法计算八字命盘，以确保计算结果的准确性和一致性。

#### Acceptance Criteria

1. THE Bazi_Calculator SHALL 使用确定性算法或现成库进行八字计算
2. WHEN 接收到有效的出生信息 THEN THE Bazi_Calculator SHALL 计算年柱、月柱、日柱、时柱的干支组合
3. WHEN 计算八字 THEN THE Bazi_Calculator SHALL 计算五行属性和十神关系
4. WHEN 计算完成 THEN THE System SHALL 生成符合 Chart_Data_v1 JSON Schema 的标准格式
5. IF 计算过程中出现错误 THEN THE System SHALL 返回具体的错误信息而非由 AI 推算
6. THE Bazi_Calculator SHALL 严禁 AI 模型参与任何干支计算、五行推导、十神判断过程

### Requirement 3: Chart_Data v1 JSON Schema 定义

**User Story:** 作为开发者，我需要冻结的 Chart_Data v1 JSON Schema，以确保 /api/chart 输出的一致性和可预测性。

#### Acceptance Criteria

1. THE System SHALL 严格按照 Chart_Data_v1 Schema 输出命盘数据
2. WHEN 生成 Chart_Data THEN THE System SHALL 包含必填字段：四柱干支、五行属性、十神关系
3. WHEN 生成 Chart_Data THEN THE System SHALL 包含可选字段：纳音、神煞（仅用于展示）
4. THE Chart_Data_v1 SHALL 明确标记哪些字段由算法计算、哪些字段供 AI 解读使用
5. THE Chart_Data_v1 SHALL 包含版本标识以支持未来 Schema 演进
6. THE System SHALL 禁止在 Chart_Data 中包含任何 AI 生成的解读内容

### Requirement 4: API 职责边界严格划分

**User Story:** 作为系统架构师，我需要明确 /api/chart 与 /api/interpret 的严格职责边界，防止 AI 越权计算。

#### Acceptance Criteria

1. THE /api/chart SHALL 仅负责：接收出生信息、调用确定性算法、返回 Chart_Data_v1 JSON
2. THE /api/interpret SHALL 仅负责：接收 Chart_Data_v1、生成解读文本、返回 Reading_Response
3. THE AI_Reader SHALL 被严格禁止访问原始出生信息和进行任何干支计算
4. WHEN /api/chart 调用失败 THEN THE System SHALL 不得调用 AI 进行补偿计算
5. THE System SHALL 在代码层面确保 AI 模型无法访问八字计算逻辑
6. THE /api/interpret SHALL 仅基于接收到的 Chart_Data 进行文本解读，不得修改或重新计算任何命理数据

### Requirement 5: MVP 范围界定

**User Story:** 作为产品经理，我需要明确 MVP 必须功能与后续迭代功能的边界，确保快速交付核心价值。

#### Acceptance Criteria

1. THE MVP SHALL 仅包含：出生信息输入、基础八字排盘、基础 AI 解读、结果展示
2. THE MVP SHALL 排除：大运计算、流年分析、复杂神煞、高级解读功能
3. WHEN MVP 发布 THEN THE System SHALL 支持完整的「输入 → 命盘 JSON → AI 解读」链路
4. THE MVP SHALL 为后续功能预留 API 扩展点，但不实现具体功能
5. THE System SHALL 确保 MVP 功能的稳定性优先于功能完整性

### Requirement 6: 用户界面展示（MVP 简化版）

**User Story:** 作为用户，我想要在清晰直观的界面中查看我的八字命盘和 AI 解读结果。

#### Acceptance Criteria

1. WHEN 八字计算完成 THEN THE User_Interface SHALL 以简化命盘格式展示四柱信息
2. WHEN AI 解读完成 THEN THE User_Interface SHALL 以文本形式展示解读内容
3. THE User_Interface SHALL 支持基础的响应式设计适配移动设备
4. THE User_Interface SHALL 提供清晰的错误提示和加载状态
5. THE MVP 界面 SHALL 优先功能可用性，暂不实现复杂的视觉效果

### Requirement 7: 数据流管理与安全边界

**User Story:** 作为系统，我需要确保数据在各个组件间正确流转，并严格防止 AI 越权访问计算逻辑。

#### Acceptance Criteria

1. WHEN 用户提交出生信息 THEN THE System SHALL 按序执行：验证 → /api/chart → /api/interpret → 展示
2. THE System SHALL 确保 AI 模型无法直接访问出生信息和计算算法
3. WHEN 任一 API 调用失败 THEN THE System SHALL 停止后续流程并返回明确错误信息
4. THE System SHALL 记录关键操作日志，但不记录用户隐私数据
5. THE System SHALL 在内存中临时处理用户数据，不进行持久化存储

### Requirement 8: Chart_Data v1 JSON Schema 规范

**User Story:** 作为 API 契约，我需要明确定义 Chart_Data v1 的 JSON Schema，作为 /api/chart 的唯一输出格式。

#### Acceptance Criteria

1. THE Chart_Data_v1 SHALL 包含必填字段：version, pillars (年月日时柱), elements (五行), tenGods (十神)
2. THE Chart_Data_v1 SHALL 包含可选字段：nayin (纳音), spirits (神煞，仅供展示)
3. WHEN 输出 Chart_Data THEN THE System SHALL 标记每个字段的数据来源（algorithm_computed 或 display_only）
4. THE Chart_Data_v1 SHALL 禁止包含任何 AI 生成的解读文本或分析结论
5. THE Schema SHALL 支持版本演进，但 v1 一旦发布即冻结不可修改
6. THE /api/chart SHALL 严格按照此 Schema 输出，任何偏差都视为 API 契约违反

### Requirement 9: 风险防控与架构约束

**User Story:** 作为系统架构师，我需要明确的技术约束来防止常见的架构风险和维护问题。

#### Acceptance Criteria

1. THE System SHALL 使用现成的八字计算库（如 lunar-javascript），禁止自研算法
2. THE System SHALL 在代码层面物理隔离 AI 模块与计算模块，防止意外耦合
3. WHEN 选择 AI 服务 THEN THE System SHALL 优先使用 API 调用而非本地模型部署
4. THE System SHALL 避免复杂的缓存策略，MVP 阶段采用简单的内存缓存
5. THE System SHALL 设计无状态的 API，避免会话管理的复杂性
6. THE System SHALL 限制单次请求的处理时间，防止长时间阻塞

## 工程可落地性审查总结

### MVP 必须功能 vs 后续迭代

**MVP 必须：**
- 基础四柱八字计算（年月日时柱）
- 五行属性和十神关系
- 基础 AI 解读（性格、运势概述）
- 简单的 Web 界面

**后续迭代：**
- 大运、流年计算（复杂度高，MVP 暂不包含）
- 复杂神煞分析
- 高级解读功能
- 美化的 UI 界面

### 关键风险点识别

1. **模型越权风险：** 通过 API 物理隔离和代码层面约束解决
2. **架构返工风险：** 冻结 Chart_Data v1 Schema，预留扩展点
3. **性能风险：** 采用简单缓存策略，避免过度优化
4. **维护风险：** 使用成熟的第三方库，避免自研复杂算法