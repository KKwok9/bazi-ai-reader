# 系统测试指南

本文档描述了 BaZi AI Reader 系统的完整测试和验证流程。

## 测试概述

系统验证分为三个层次：
1. **启动验证** - 检查配置和依赖
2. **一致性测试** - 验证八字计算的确定性
3. **边界安全测试** - 验证 AI 模块的安全边界

## 快速开始

### 1. 系统配置验证
```bash
npm run verify
```
检查项目配置、依赖和环境变量是否正确。

### 2. 运行完整测试套件
```bash
# 先启动开发服务器
npm run dev

# 在另一个终端运行测试
npm run test:all
```

### 3. 单独运行测试
```bash
# 一致性测试（需要服务器运行）
npm run test:consistency

# 边界安全测试（需要服务器运行）
npm run test:boundary
```

## 测试详情

### 启动验证 (scripts/verify-setup.js)

**目标**: 确保系统可以正常启动

**检查项目**:
- ✅ 必需文件存在性
- ✅ package.json 配置正确性
- ✅ 环境变量配置完整性
- ✅ AI API Key 格式验证
- ✅ TypeScript 配置正确性

**运行条件**: 无需服务器运行

### 一致性测试 (tests/consistency-test.js)

**目标**: 验证 `/api/chart` 的确定性计算

**测试策略**:
- 使用相同的 `BirthInfo` 连续调用 5 次 API
- 比较返回的 `Chart_Data` 核心字段是否完全一致
- 排除动态字段（如 `timestamp`、`calculatedAt`）

**测试案例**:
1. 1990年5月15日14:30 (男性)
2. 2000年1月1日0:00 (无性别)
3. 1985年12月31日23:59 (女性)

**成功标准**: 所有测试案例的 5 次调用结果必须完全一致

**运行条件**: 需要开发服务器运行在 http://localhost:3000

### 边界安全测试 (tests/boundary-test.js)

**目标**: 验证 `/api/interpret` 的安全边界

**测试策略**:
- 尝试注入敏感信息（如原始出生信息）
- 尝试注入计算指令
- 测试无效数据的拒绝机制
- 检查响应中是否泄露敏感信息

**测试案例**:
1. 注入 `BirthInfo` 字段
2. 注入计算指令
3. 缺少必要字段
4. 无效版本号
5. 无效数据来源

**成功标准**: 
- AI 应忽略注入的敏感信息
- 无效请求应被正确拒绝
- 响应中不应泄露敏感信息

**运行条件**: 需要开发服务器运行在 http://localhost:3000

## 测试运行器 (scripts/run-tests.js)

自动化测试运行器，按顺序执行所有测试：

1. **检查测试文件** - 确保所有测试脚本存在
2. **运行启动验证** - 验证系统配置
3. **检查服务器状态** - 确认 API 服务可用
4. **运行 API 测试** - 执行一致性和边界测试
5. **生成测试报告** - 汇总所有测试结果

## 故障排除

### 常见问题

**1. 服务器未运行**
```
⚠️ 开发服务器未运行，跳过 API 测试
```
**解决方案**: 先运行 `npm run dev` 启动服务器

**2. AI API Key 未配置**
```
⚠️ AI_API_KEY 未配置或使用默认值
```
**解决方案**: 
- 复制 `.env.example` 到 `.env`
- 配置有效的 OpenAI API Key

**3. 一致性测试失败**
```
❌ 第X次调用结果与第1次不一致
```
**解决方案**: 检查八字计算逻辑，确保使用确定性算法

**4. 边界测试失败**
```
🚨 安全问题: 响应中可能泄露了注入的 birthInfo 数据
```
**解决方案**: 检查 AI 模块，确保不处理敏感字段

### 调试技巧

**1. 查看详细日志**
测试脚本会输出详细的请求和响应信息，有助于调试。

**2. 单独运行测试**
可以单独运行特定测试来隔离问题：
```bash
npm run test:consistency  # 只运行一致性测试
npm run test:boundary     # 只运行边界测试
```

**3. 检查 API 响应**
可以使用 `test-api.html` 手动测试 API 响应。

## 持续集成

建议在以下情况运行完整测试：
- 修改八字计算逻辑后
- 修改 AI 解读逻辑后
- 部署到生产环境前
- 定期健康检查

## 测试覆盖范围

### 已覆盖
- ✅ 八字计算一致性
- ✅ AI 模块边界安全
- ✅ 系统配置验证
- ✅ API 错误处理
- ✅ 请求超时控制

### 未覆盖（未来可扩展）
- ⏳ 性能测试
- ⏳ 负载测试
- ⏳ 安全渗透测试
- ⏳ 用户界面测试

## 测试数据

测试使用的示例数据都是虚构的，不涉及真实用户信息。所有测试案例都经过精心设计，覆盖了常见的边界情况和异常场景。

## API 测试示例

### 手动测试 /api/chart
```bash
curl -X POST http://localhost:3000/api/chart \
  -H "Content-Type: application/json" \
  -d '{
    "birthYear": 1990,
    "birthMonth": 5,
    "birthDay": 15,
    "birthHour": 14,
    "birthMinute": 30,
    "timezone": "Asia/Shanghai",
    "gender": "male"
  }'
```

### 手动测试 /api/interpret
```bash
curl -X POST http://localhost:3000/api/interpret \
  -H "Content-Type: application/json" \
  -d '{
    "chartData": {
      "version": "1.0",
      "timestamp": "2024-02-04T12:00:00.000Z",
      "pillars": {
        "year": { "heavenly": "庚", "earthly": "午" },
        "month": { "heavenly": "辛", "earthly": "巳" },
        "day": { "heavenly": "壬", "earthly": "子" },
        "hour": { "heavenly": "癸", "earthly": "丑" }
      },
      "elements": {
        "year": "金",
        "month": "金", 
        "day": "水",
        "hour": "水",
        "dayMaster": "水"
      },
      "tenGods": {
        "year": "偏印",
        "month": "正印",
        "day": "日主",
        "hour": "比肩"
      },
      "metadata": {
        "source": "algorithm_computed",
        "library": "lunar-javascript@1.6.12",
        "calculatedAt": "2024-02-04T12:00:00.000Z"
      }
    }
  }'
```

## 重要约束

### 八字计算模块
- ❌ 严禁使用任何自研算法
- ✅ 必须使用 lunar-javascript 等第三方权威库
- ✅ metadata.library 必须准确标注库名和版本

### AI 解读模块
- ❌ 严禁访问原始出生信息 (BirthInfo)
- ❌ 严禁进行任何八字计算或推算
- ✅ 只能基于提供的 Chart_Data 进行解读
- ✅ 必须包含安全边界验证