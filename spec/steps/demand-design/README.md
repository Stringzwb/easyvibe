---
version: 1
kind: step
id: demand-design
name: "需求设计规约"
status: active
summary: "把用户目标整理为边界明确、可实现、可验收的需求。"
---

# 需求设计规约

## Purpose

把用户目标整理为边界明确、可实现、可验收的需求。

## Scope

### Applies To

- 使用 demand-design Step 的所有工作流节点
- 本 Step 声明的输入、操作和产出

### Excludes

- 用户明确要求并记录的流程外工作

## Rules

### STP-DEMAND-DESIGN-001 - 明确范围

- `level`: `MUST`
- `requirement`: 需求必须说明目标、包含范围和非目标。
- `verification`: 检查需求文档的目标与范围章节。
- `evidence`: 需求文档路径。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-DEMAND-DESIGN-002 - 定义验收条件

- `level`: `MUST`
- `requirement`: 进入实现的需求必须包含可客观验证的验收条件。
- `verification`: 逐项判断验收条件能否通过测试、检查或评审得出结论。
- `evidence`: 验收条件列表。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-DEMAND-DESIGN-003 - 保护敏感信息

- `level`: `MUST_NOT`
- `requirement`: 需求、示例和测试数据说明中不得写入真实凭证或非必要个人敏感信息。
- `verification`: 检查文档中的凭证、身份和生产数据。
- `evidence`: 敏感信息检查结果。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-DEMAND-DESIGN-004 - 记录未决事项

- `level`: `MUST`
- `requirement`: 影响范围、实现、安全或验收的问题必须显式记录。
- `verification`: 检查假设、依赖、风险和未决问题。
- `evidence`: 未决事项列表或无未决事项结论。
- `on_violation`: `REVIEW`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。
