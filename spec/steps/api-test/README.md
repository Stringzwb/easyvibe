---
version: 1
kind: step
id: api-test
name: "API 调用测试规约"
status: active
summary: "验证接口契约、鉴权、错误处理和集成行为，同时保护环境与测试数据。"
---

# API 调用测试规约

## Purpose

验证接口契约、鉴权、错误处理和集成行为，同时保护环境与测试数据。

## Scope

### Applies To

- 使用 api-test Step 的所有工作流节点
- 本 Step 声明的输入、操作和产出

### Excludes

- 用户明确要求并记录的流程外工作

## Rules

### STP-API-TEST-001 - 确认目标环境

- `level`: `MUST`
- `requirement`: 调用接口前必须确认目标地址、环境、账户和允许的操作范围。
- `verification`: 核对测试请求与环境安全配置。
- `evidence`: 目标环境和授权记录。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-API-TEST-002 - 默认禁止生产调用

- `level`: `MUST_NOT`
- `requirement`: 未经用户对具体目标和操作的明确确认不得调用生产接口。
- `verification`: 检查主机、环境标识和用户确认。
- `evidence`: 生产调用确认或 none。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-API-TEST-003 - 控制高风险请求

- `level`: `MUST`
- `requirement`: 删除、支付、通知、批量写入和不可逆请求必须在执行前单独确认目标与影响。
- `verification`: 检查请求方法、端点、副作用和确认记录。
- `evidence`: 高风险请求确认或 none。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-API-TEST-004 - 保护凭证与响应数据

- `level`: `MUST_NOT`
- `requirement`: 测试记录不得保存完整认证头、Cookie、密钥或未脱敏敏感响应。
- `verification`: 复核请求响应日志和测试文档。
- `evidence`: 脱敏检查结果。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-API-TEST-005 - 覆盖接口契约

- `level`: `MUST`
- `requirement`: 测试必须覆盖契约中的主要成功、校验、鉴权、限流和错误行为。
- `verification`: 将测试项与接口契约逐项对应。
- `evidence`: API 测试矩阵。
- `on_violation`: `REVIEW`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。
