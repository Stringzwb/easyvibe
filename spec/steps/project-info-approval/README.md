---
version: 1
kind: step
id: project-info-approval
name: "项目基本信息核准规约"
status: active
summary: "在项目工作开始前核准项目名称，并为所有可生成文档建立经用户确认的命名规范。"
---

# 项目基本信息核准规约

## Purpose

在项目工作开始前核准项目名称，并为所有可生成文档建立经用户确认的命名规范。

## Scope

### Applies To

- 使用 project-info-approval Step 的所有工作流节点
- 本 Step 声明的输入、操作和产出

### Excludes

- 用户明确要求并记录的流程外工作

## Rules

### STP-PROJECT-INFO-APPROVAL-001 - 确认项目名称

- `level`: `MUST`
- `requirement`: 开始后续项目工作前必须向用户确认项目的正式名称，并将确认结果记录在 README.md。
- `verification`: 核对用户确认记录与 README.md 中的项目名称。
- `evidence`: 项目名称确认记录和 README.md 路径。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-PROJECT-INFO-APPROVAL-002 - 盘点可生成文档

- `level`: `MUST`
- `requirement`: 必须盘点当前项目工作流、Step 和目录中可能由人员、Agent、CLI 或自动化生成的全部文档类型，并逐类确定命名处理方式。
- `verification`: 对照 workflow、Step 输出、docs/ 和 deploy/ 目录审查文档类型清单。
- `evidence`: 文档类型清单及每类处理结论。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-PROJECT-INFO-APPROVAL-003 - 确认命名规范

- `level`: `MUST`
- `requirement`: 每类可生成文档的命名模式、变量、冲突处理和固定管理文件例外必须获得用户明确确认。
- `verification`: 核对每条拟定命名规则与用户确认记录。
- `evidence`: 用户确认记录和命名规则清单。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-PROJECT-INFO-APPROVAL-004 - 记录命名规范

- `level`: `MUST`
- `requirement`: 经确认的文档命名规范必须写入 spec/namespec.md，并符合项目命名规约定义的格式。
- `verification`: 检查 namespec 的规则字段、路径覆盖范围、示例和格式有效性。
- `evidence`: 更新后的 spec/namespec.md 路径和校验结果。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-PROJECT-INFO-APPROVAL-005 - 保护命名记录

- `level`: `MUST_NOT`
- `requirement`: 项目名称、命名示例和核准记录中不得包含真实凭证、不必要的个人信息或生产敏感数据。
- `verification`: 检查 README.md、namespec 和状态记录中的敏感内容。
- `evidence`: 敏感信息检查结果。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。
