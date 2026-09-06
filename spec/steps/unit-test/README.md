---
version: 1
kind: step
id: unit-test
name: "单元测试规约"
status: active
summary: "以隔离、快速、可重复的测试验证最小代码单元和关键边界。"
---

# 单元测试规约

## Purpose

以隔离、快速、可重复的测试验证最小代码单元和关键边界。

## Scope

### Applies To

- 使用 unit-test Step 的所有工作流节点
- 本 Step 声明的输入、操作和产出

### Excludes

- 用户明确要求并记录的流程外工作

## Rules

### STP-UNIT-TEST-001 - 隔离外部资源

- `level`: `MUST_NOT`
- `requirement`: 单元测试不得连接生产数据库、外部服务或真实用户账户。
- `verification`: 检查测试配置、网络访问和依赖替身。
- `evidence`: 隔离性检查结果。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-UNIT-TEST-002 - 使用安全测试数据

- `level`: `MUST_NOT`
- `requirement`: 测试夹具不得包含真实凭证或未经授权的生产和个人数据。
- `verification`: 扫描测试文件与夹具。
- `evidence`: 测试数据检查结果。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-UNIT-TEST-003 - 保持确定性

- `level`: `MUST`
- `requirement`: 测试必须控制时间、随机性、并发和外部依赖，使相同输入可重复得到相同结果。
- `verification`: 重复运行相关测试并检查不稳定因素。
- `evidence`: 重复运行结果。
- `on_violation`: `REVIEW`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-UNIT-TEST-004 - 覆盖关键分支

- `level`: `MUST`
- `requirement`: 单元测试必须覆盖当前修改的主要逻辑、边界条件和已识别风险。
- `verification`: 对照代码差异和风险清单检查测试。
- `evidence`: 覆盖对应关系。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。
