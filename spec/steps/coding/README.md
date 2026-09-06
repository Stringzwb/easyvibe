---
version: 1
kind: step
id: coding
name: "代码开发规约"
status: active
summary: "按照已确认需求和设计实现范围受控、可维护、可验证的业务代码。"
---

# 代码开发规约

## Purpose

按照已确认需求和设计实现范围受控、可维护、可验证的业务代码。

## Scope

### Applies To

- 使用 coding Step 的所有工作流节点
- 本 Step 声明的输入、操作和产出

### Excludes

- 用户明确要求并记录的流程外工作

## Rules

### STP-CODING-001 - 实现对应已确认事项

- `level`: `MUST`
- `requirement`: 每项代码修改必须对应当前已确认的需求、设计或缺陷。
- `verification`: 对照输入审查全部代码差异。
- `evidence`: 事项标识与变更文件列表。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-CODING-002 - 控制实现范围

- `level`: `MUST_NOT`
- `requirement`: 代码开发不得引入与当前事项无关的功能、依赖升级或重构。
- `verification`: 审查变更范围和依赖清单。
- `evidence`: 范围审查结论。
- `on_violation`: `REVIEW`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-CODING-003 - 禁止硬编码敏感信息

- `level`: `MUST_NOT`
- `requirement`: 源码、测试和配置中不得硬编码密码、Token、私钥或生产连接信息。
- `verification`: 执行敏感信息扫描并人工复核配置差异。
- `evidence`: 扫描和复核结果。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-CODING-004 - 验证实现

- `level`: `MUST`
- `requirement`: 实现完成后必须执行与语言、框架和改动风险相匹配的静态检查、测试或构建。
- `verification`: 检查命令、退出状态和结果摘要。
- `evidence`: 验证命令和结果。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-CODING-005 - 审查新增依赖

- `level`: `MUST`
- `requirement`: 新增第三方依赖前必须确认必要性、许可证、维护状态和已知安全风险。
- `verification`: 检查依赖变更及其评审记录。
- `evidence`: 依赖评审记录或 none。
- `on_violation`: `REVIEW`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。
