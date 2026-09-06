---
version: 1
kind: step
id: functional-test
name: "功能测试规约"
status: active
summary: "从用户和系统边界验证完整功能、跨模块交互和验收条件。"
---

# 功能测试规约

## Purpose

从用户和系统边界验证完整功能、跨模块交互和验收条件。

## Scope

### Applies To

- 使用 functional-test Step 的所有工作流节点
- 本 Step 声明的输入、操作和产出

### Excludes

- 用户明确要求并记录的流程外工作

## Rules

### STP-FUNCTIONAL-TEST-001 - 覆盖验收条件

- `level`: `MUST`
- `requirement`: 每项验收条件必须至少对应一个已执行或明确标记未执行的功能测试。
- `verification`: 检查需求与测试场景映射。
- `evidence`: 验收覆盖矩阵。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-FUNCTIONAL-TEST-002 - 限制测试环境

- `level`: `MUST_NOT`
- `requirement`: 未经用户明确确认不得在生产环境执行功能测试或生成测试数据。
- `verification`: 核对环境、账户和确认记录。
- `evidence`: 环境确认记录。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-FUNCTIONAL-TEST-003 - 控制副作用

- `level`: `MUST`
- `requirement`: 会发送通知、修改共享数据、产生费用或影响其他用户的测试必须预先确认并提供清理方案。
- `verification`: 检查测试步骤、副作用和清理记录。
- `evidence`: 副作用确认与清理结果。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-FUNCTIONAL-TEST-004 - 如实记录结果

- `level`: `MUST`
- `requirement`: 测试报告必须区分通过、失败、阻塞和未执行项，并对证据进行脱敏。
- `verification`: 核对报告与实际输出。
- `evidence`: 测试报告和证据。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。
