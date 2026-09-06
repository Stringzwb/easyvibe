---
version: 1
kind: step
id: ui-design
name: "UI 设计规约"
status: active
summary: "把需求转换为清晰、可访问、可实现的界面与交互设计。"
---

# UI 设计规约

## Purpose

把需求转换为清晰、可访问、可实现的界面与交互设计。

## Scope

### Applies To

- 使用 ui-design Step 的所有工作流节点
- 本 Step 声明的输入、操作和产出

### Excludes

- 用户明确要求并记录的流程外工作

## Rules

### STP-UI-DESIGN-001 - 覆盖关键界面状态

- `level`: `MUST`
- `requirement`: 设计必须覆盖主要流程及其加载、空、错误和权限受限状态。
- `verification`: 对照需求场景检查页面和状态清单。
- `evidence`: 界面状态清单。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-UI-DESIGN-002 - 满足可访问性

- `level`: `MUST`
- `requirement`: 设计必须说明键盘操作、焦点、对比度和语义信息等可访问性要求。
- `verification`: 执行设计可访问性评审。
- `evidence`: 可访问性检查结论。
- `on_violation`: `REVIEW`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-UI-DESIGN-003 - 禁止泄露真实数据

- `level`: `MUST_NOT`
- `requirement`: 原型、截图、示例内容和设计资源中不得包含真实凭证或未经授权的用户数据。
- `verification`: 检查设计文档和资源中的示例数据。
- `evidence`: 敏感信息检查结果。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-UI-DESIGN-004 - 限制外部上传

- `level`: `MUST_NOT`
- `requirement`: 未经用户明确同意不得把项目文件、截图或数据上传到外部设计和生成服务。
- `verification`: 核对外部工具调用和用户授权。
- `evidence`: 外部服务使用记录或 none。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。
