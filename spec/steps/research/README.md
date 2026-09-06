---
version: 1
kind: step
id: research
name: "调研规约"
status: active
summary: "通过可追溯资料和受控验证降低需求与技术决策的不确定性。"
---

# 调研规约

## Purpose

通过可追溯资料和受控验证降低需求与技术决策的不确定性。

## Scope

### Applies To

- 使用 research Step 的所有工作流节点
- 本 Step 声明的输入、操作和产出

### Excludes

- 用户明确要求并记录的流程外工作

## Rules

### STP-RESEARCH-001 - 保持来源可追溯

- `level`: `MUST`
- `requirement`: 关键事实必须记录来源、访问日期以及适用的版本或环境。
- `verification`: 抽查结论与来源之间的对应关系。
- `evidence`: 来源列表和访问日期。
- `on_violation`: `REVIEW`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-RESEARCH-002 - 区分事实与判断

- `level`: `MUST`
- `requirement`: 调研结果必须区分已验证事实、合理推断、建议和未知项。
- `verification`: 评审结论标签和证据。
- `evidence`: 调研结论。
- `on_violation`: `REVIEW`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-RESEARCH-003 - 禁止未授权探测

- `level`: `MUST_NOT`
- `requirement`: 调研不得包含对系统、网络、账户、数据库或接口的未授权扫描、探测和访问。
- `verification`: 检查使用的命令、工具、目标和授权范围。
- `evidence`: 调研操作记录。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-RESEARCH-004 - 限制信息外发

- `level`: `MUST_NOT`
- `requirement`: 未经用户明确同意不得向外部服务发送私有代码、内部文档、配置或数据。
- `verification`: 核对外部检索、上传和工具调用。
- `evidence`: 外部服务使用记录或 none。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。
