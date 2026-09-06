---
version: 1
kind: step
id: package
name: "项目打包规约"
status: active
summary: "以可重复方式生成来源明确、内容安全、可验证的交付制品。"
---

# 项目打包规约

## Purpose

以可重复方式生成来源明确、内容安全、可验证的交付制品。

## Scope

### Applies To

- 使用 package Step 的所有工作流节点
- 本 Step 声明的输入、操作和产出

### Excludes

- 用户明确要求并记录的流程外工作

## Rules

### STP-PACKAGE-001 - 使用已验证来源

- `level`: `MUST`
- `requirement`: 打包必须基于已通过必要验证且版本明确的代码来源。
- `verification`: 核对测试结果、版本和来源提交。
- `evidence`: 来源与测试记录。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-PACKAGE-002 - 保持构建可重复

- `level`: `MUST`
- `requirement`: 构建应使用锁定依赖和明确的运行时、命令及目标平台。
- `verification`: 在可比环境复核构建配置和输出。
- `evidence`: 构建命令与环境摘要。
- `on_violation`: `REVIEW`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-PACKAGE-003 - 扫描制品敏感内容

- `level`: `MUST_NOT`
- `requirement`: 制品不得包含密码、Token、私钥、生产配置、调试转储或非必要用户数据。
- `verification`: 对最终制品执行内容和敏感信息检查。
- `evidence`: 制品扫描结果。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-PACKAGE-004 - 保持版本不可变

- `level`: `MUST_NOT`
- `requirement`: 未经用户明确确认不得覆盖同一版本或构建标识下的已有制品。
- `verification`: 打包前检查目标路径和已有清单。
- `evidence`: 制品目标检查结果。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-PACKAGE-005 - 记录制品来源

- `level`: `MUST`
- `requirement`: 制品必须记录组件、版本、构建时间、来源提交和可用的校验值。
- `verification`: 检查制品清单。
- `evidence`: 制品清单路径。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。
