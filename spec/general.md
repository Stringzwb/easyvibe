---
version: 1
kind: general
id: general
name: "项目总规约"
status: active
summary: "定义所有工作流节点共同遵守的基础执行和安全要求"
---

# 项目总规约

## Purpose

确保项目中的所有工作流节点在明确的规约、权限和安全边界内执行，并保留可验证的执行依据。

## Scope

### Applies To

- 项目中的所有工作流和流程节点
- 参与项目的人员、Agent、CLI、工作台和自动化脚本
- 项目目录内的读取、创建、修改、移动和删除操作

### Excludes

- none

## Rules

### GEN-001 - 执行前加载有效规约

- `level`: `MUST`
- `requirement`: 执行工作流节点前必须加载该节点适用的全部 active 规约。
- `verification`: 根据节点所用 step 和自定义规约引用解析有效规约列表。
- `evidence`: 本次执行加载的规约 ID 和规则 ID 列表。
- `on_violation`: `BLOCK`
- `exception`: 用户明确要求在工作流之外执行时，记录用户要求和未加载的默认约束。

### GEN-002 - 遵守步骤路径权限

- `level`: `MUST`
- `requirement`: 节点执行期间的文件读写必须限制在对应 step 声明的 read 和 write 路径内。
- `verification`: 执行前检查目标路径权限，完成后核对实际变更文件列表。
- `evidence`: 目标路径权限判定和实际变更文件列表。
- `on_violation`: `BLOCK`
- `exception`: 用户明确扩大路径范围时，记录授权、原因和受影响路径。

### GEN-003 - 禁止保存明文凭证

- `level`: `MUST_NOT`
- `requirement`: 项目代码、文档、数据、日志和制品中不得保存明文密码、Token 或私钥。
- `verification`: 写入或交付前执行凭证扫描，并人工复核环境相关文件。
- `evidence`: 凭证扫描结果。
- `on_violation`: `BLOCK`
- `exception`: none

### GEN-004 - 不覆盖未授权内容

- `level`: `MUST_NOT`
- `requirement`: 未经明确授权不得覆盖、回滚或删除不属于当前节点范围的已有内容。
- `verification`: 操作前核对当前节点目标和受影响文件，操作后检查变更范围。
- `evidence`: 受影响文件列表及其与当前节点目标的对应关系。
- `on_violation`: `BLOCK`
- `exception`: 由项目负责人明确批准的清理或迁移操作。

### GEN-005 - 用户明确要求优先于框架默认方式

- `level`: `MUST`
- `requirement`: Easy Vibe 仅提供默认协作规范，不得仅以工作流或项目规约为由拒绝用户的明确项目要求。
- `verification`: 出现流程或规约例外时，核对用户要求、影响说明和执行记录。
- `evidence`: 用户明确要求及对应的例外记录。
- `on_violation`: `REVIEW`
- `exception`: 用户要求不得覆盖运行平台本身的安全、权限和合规限制。

### GEN-006 - 独立交付目标创建独立主任务

- `level`: `MUST`
- `requirement`: 完全独立的新工作、用户明确声明的新任务，或具有独立目标、产出和验收标准且可单独暂停、交接或完成的工作，必须创建独立主任务记录。
- `verification`: 检查主任务标题、目标、产出、验收边界与现有主任务的关系。
- `evidence`: `status/works.csv` 中的主任务记录及对应子任务文件。
- `on_violation`: `BLOCK`
- `exception`: 用户明确确认将该工作合并到已有主任务，并记录合并原因和影响。

### GEN-007 - 边界不明确先询问

- `level`: `MUST`
- `requirement`: 当工作是否构成独立主任务的边界不明确时，Agent 必须先询问用户，不得自行创建或归入已有主任务。
- `verification`: 检查主任务创建前是否存在用户对归属的明确确认。
- `evidence`: 用户确认记录或未创建主任务的状态说明。
- `on_violation`: `BLOCK`
- `exception`: none
