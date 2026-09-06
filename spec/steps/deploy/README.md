---
version: 1
kind: step
id: deploy
name: "部署规约"
status: active
summary: "把已验证制品安全发布到明确授权的环境并保留完整记录。"
---

# 部署规约

## Purpose

把已验证制品安全发布到明确授权的环境并保留完整记录。

## Scope

### Applies To

- 使用 deploy Step 的所有工作流节点
- 本 Step 声明的输入、操作和产出

### Excludes

- 用户明确要求并记录的流程外工作

## Rules

### STP-DEPLOY-001 - 确认部署目标

- `level`: `MUST`
- `requirement`: 执行前必须明确确认目标环境、服务、版本、影响范围和维护窗口。
- `verification`: 核对部署请求、制品和环境配置。
- `evidence`: 目标确认记录。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-DEPLOY-002 - 验证环境权限

- `level`: `MUST`
- `requirement`: 部署前必须确认当前操作者、Agent 和命令具备目标环境所需权限。
- `verification`: 检查安全策略、白名单和实际操作。
- `evidence`: 权限判定结果。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-DEPLOY-003 - 生产操作单独授权

- `level`: `MUST_NOT`
- `requirement`: 未经用户对本次环境、版本和操作的明确确认不得执行生产部署或回滚。
- `verification`: 检查生产标识与确认记录。
- `evidence`: 生产授权或 none。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-DEPLOY-004 - 禁止部署时修改源码

- `level`: `MUST_NOT`
- `requirement`: 部署节点不得修改业务代码或用现场修改替代可追溯制品。
- `verification`: 检查部署期间的变更路径和制品来源。
- `evidence`: 部署变更路径列表。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。

### STP-DEPLOY-005 - 记录结果与回滚能力

- `level`: `MUST`
- `requirement`: 部署必须记录命令、结果、健康检查和回滚方案；失败时停止后续扩散。
- `verification`: 检查部署日志和失败处理。
- `evidence`: 部署日志路径。
- `on_violation`: `BLOCK`
- `exception`: 用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。
