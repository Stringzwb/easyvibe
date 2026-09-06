---
version: 1
kind: general
id: general
name: "项目总规约"
status: active
summary: "定义所有工作默认遵守的执行、安全和用户优先原则"
---

# 项目总规约

## Purpose

使人员与 Agent 在明确边界内执行任务，并保留可恢复、可验证的结果。

## Scope

### Applies To

- 项目中的人员、Agent、自动化工具及其文件操作

### Excludes

- none

## Rules

### GEN-001 - 执行前加载有效约束

- `level`: `MUST`
- `requirement`: 执行工作流节点前必须读取该节点对应 Step 的运行定义和全部适用的 active 规约。
- `verification`: 核对节点引用的 step-id、两侧 Step 目录和已加载规约。
- `evidence`: 本次使用的工作流、节点、Step 和规约列表。
- `on_violation`: `BLOCK`
- `exception`: 用户明确要求在工作流外执行时，记录用户要求和未加载的默认约束。

### GEN-002 - 默认遵守路径边界

- `level`: `MUST`
- `requirement`: 节点执行期间默认只在对应 Step 声明的 read 和 write 路径内操作。
- `verification`: 执行前检查目标路径，完成后核对实际变更文件。
- `evidence`: 路径判定和实际变更文件列表。
- `on_violation`: `BLOCK`
- `exception`: 用户明确扩大范围后，记录授权、原因和受影响路径。

### GEN-003 - 禁止保存明文凭证

- `level`: `MUST_NOT`
- `requirement`: 项目代码、文档、数据、日志和制品中不得保存明文密码、Token 或私钥。
- `verification`: 写入或交付前检查敏感信息。
- `evidence`: 检查结果。
- `on_violation`: `BLOCK`
- `exception`: none

### GEN-004 - 用户明确要求优先

- `level`: `MUST`
- `requirement`: Easy Vibe 仅提供默认协作规范，不得仅以本规范为由拒绝用户的明确项目要求。
- `verification`: 出现流程或规约例外时，核对用户要求、影响说明和执行记录。
- `evidence`: 用户明确要求及例外记录。
- `on_violation`: `REVIEW`
- `exception`: 用户要求不得覆盖运行平台本身的安全与权限限制。

### GEN-005 - 独立交付目标创建独立主任务

- `level`: `MUST`
- `requirement`: 完全独立的新工作、用户明确声明的新任务，或具有独立目标、产出和验收标准且可单独暂停、交接或完成的工作，必须创建独立主任务记录。
- `verification`: 检查主任务标题、目标、产出、验收边界与现有主任务的关系。
- `evidence`: `status/works.csv` 中的主任务记录及对应子任务文件。
- `on_violation`: `BLOCK`
- `exception`: 用户明确确认将该工作合并到已有主任务，并记录合并原因和影响。

### GEN-006 - 边界不明确先询问

- `level`: `MUST`
- `requirement`: 当工作是否构成独立主任务的边界不明确时，Agent 必须先询问用户，不得自行创建或归入已有主任务。
- `verification`: 检查主任务创建前是否存在用户对归属的明确确认。
- `evidence`: 用户确认记录或未创建主任务的状态说明。
- `on_violation`: `BLOCK`
- `exception`: none
