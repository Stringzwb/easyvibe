# status

用于通过 CSV 记录每项主工作的计划、子任务状态和最新进展，使 Agent 意外中断后仍能恢复上下文。

`status/` 只保存当前工作事实，不重复保存其他模块已经提供的信息：

- 工作流结构从 `workflow/` 获取。
- 节点规约从 `spec/` 获取。
- 需求、设计、测试和 Bug 详情从 `docs/` 获取。
- 实际代码、数据、脚本和制品保存在各自目录。

## 目录结构

```text
status/
  README.md
  works.csv
  work/
    README.md
    <work-id>.csv
```

- `works.csv`：主工作列表，每项主工作占一行。
- `work/<work-id>.csv`：该主工作下的子任务列表。

## 主工作 CSV

`works.csv` 的表头固定为：

```csv
work_id,title,workflow_id,status,current_task_id,summary,next_action,updated_at,task_file,notes
```

| 字段 | 约束 |
| --- | --- |
| `work_id` | 全局唯一，格式为 `work-YYYYMMDD-NNN`，创建后不得修改或复用 |
| `title` | 一行简短名称 |
| `workflow_id` | 对应 `workflow/workflows.json` 中的工作流 ID |
| `status` | 只能使用本文定义的六种状态 |
| `current_task_id` | 当前子任务 ID；没有时留空 |
| `summary` | 当前整体进展的一行摘要 |
| `next_action` | 新 Agent 接手后首先执行的具体动作 |
| `updated_at` | 带时区的 ISO 8601 时间 |
| `task_file` | 固定为 `status/work/<work-id>.csv` |
| `notes` | 其他必要备注；没有时留空 |

## 主任务创建判定

主工作（主任务）必须代表一个独立、可交付、可验收的工作目标，而不是简单的操作步骤或单个 Step。满足以下任一条件时，必须创建独立的主工作记录：

- 与当前主任务属于完全不同的工作，例如新模块、新功能、前端、后端、设计或部署目标。
- 用户明确声明“这是一个新任务”“单独处理”或具有同等含义。
- 具有独立目标、独立产出和独立验收标准。
- 可以单独暂停、交接、取消或完成。

以下情况继续归入当前主任务的子任务列表：

- 只是同一交付物的设计、实现、测试或修复步骤。
- 只是当前目标的进一步拆分，不具备独立验收标准。
- 是当前主任务失败后的修复、补测或验证。

前端、后端、设计和部署不因名称不同而自动拆分；应根据目标、产出和验收边界判断。一个主任务可以包含多个 Step，一个 Step 也可以在不同主任务中复用。

当边界不明确时，Agent 必须先询问用户：

> 这项工作与当前主任务的目标和交付物边界不明确。是否将它创建为一个新的独立主任务？

在用户确认前，不得把候选工作写入 `works.csv`，也不得假定它属于当前主任务。

## 子任务 CSV

每个 `work/<work-id>.csv` 的表头固定为：

```csv
task_id,step_id,title,status,depends_on,progress,next_action,changed_paths,result,updated_at,notes
```

| 字段 | 约束 |
| --- | --- |
| `task_id` | 主工作内唯一，使用 `T001`、`T002` 格式，删除后不得复用 |
| `step_id` | 对应 `workflow/steps/<step-id>` 和 `spec/steps/<step-id>` |
| `title` | 一行说明子任务内容 |
| `status` | 只能使用本文定义的六种状态 |
| `depends_on` | 前置 task ID；多个值使用英文分号分隔，没有时留空 |
| `progress` | 已经完成到哪里以及当前事实 |
| `next_action` | 恢复任务后首先执行的具体动作 |
| `changed_paths` | 尚未完成期间修改过的项目相对路径，多个值使用英文分号分隔 |
| `result` | 完成结果和验证证据；只有 completed 必须填写 |
| `updated_at` | 带时区的 ISO 8601 时间 |
| `notes` | 阻塞原因、风险、决策或中止原因 |

## 状态定义

- `planned`：已经列入计划，尚未开始。
- `in_progress`：正在执行，当前产出尚不可信。
- `blocked`：被权限、依赖或待确认事项阻塞。
- `interrupted`：因欠费、断线、进程退出等原因意外中断。
- `cancelled`：明确决定中止，不再继续。
- `completed`：结果已经交付并验证完成。

允许的主要状态流转：

```text
planned --> in_progress --> completed
                |
                +--> blocked -----> in_progress
                +--> interrupted --> in_progress
                +--> cancelled
```

## 信任规则

- 所有未标记为 `completed` 的子任务及其产出都视为不可信。
- `completed` 子任务必须填写 `result`，说明交付结果、验证方式和验证结论。
- `completed` 子任务的 `next_action` 和 `notes` 可以为空，其他进行中状态必须填写 `next_action` 或在 `notes` 中说明原因。
- 如果 `status=completed` 但 `result` 为空，该行属于不一致状态，仍按未完成处理。
- 已完成任务不改回进行中；后续发现问题时新增修复任务。
- `changed_paths` 中属于未完成任务的文件必须由接手 Agent 重新检查，不能直接当作正确结果。

## 中断恢复规则

每次 Agent 开始处理主工作时，必须先读取 `works.csv` 和对应子任务 CSV。

如果发现遗留的 `in_progress` 子任务，应先按意外中断处理：检查 `progress`、`next_action` 和 `changed_paths`，将现场情况写入记录后再决定恢复、阻塞或中止。不得因为文件已经存在就推断任务已经完成。

Agent 至少应在以下时机更新 CSV：

- 开始一个子任务时。
- 完成一次有意义的文件修改或设计决定后。
- 测试、构建或外部调用结束后。
- 遇到阻塞或即将结束会话时。
- 将任务标记为 completed 之前。

## 创建和同步规则

创建主工作时必须在同一次操作中：

1. 向 `works.csv` 添加主工作记录。
2. 创建 `work/<work-id>.csv` 并写入固定表头。
3. 至少添加一个 planned 子任务。
4. 确保 `task_file` 与实际路径一致。

主工作标题应描述独立交付目标，例如“收藏夹产品与技术调研”“收藏夹前端 UI Demo”；“执行调研”“编写页面组件”等过程性动作应作为其子任务，而不是主工作标题。

主工作和子任务原则上不物理删除。不再执行时使用 `cancelled` 并在 `notes` 中说明原因。

主工作状态必须与子任务保持一致：存在进行中任务时为 `in_progress`；存在未恢复中断时为 `interrupted`；所有有效子任务完成后才可标记为 `completed`。

## CSV 通用约束

- 使用 UTF-8 编码和英文逗号分隔。
- 第一行必须是固定表头，字段不得增删、改名或调整顺序。
- 每条记录只占一行，字段内禁止换行。
- 包含逗号或双引号的字段必须按 CSV 标准转义。
- 多值字段使用英文分号分隔。
- 空值保持为空，不混用 `null`、`-` 或“无”。
- 时间使用带时区的 ISO 8601，例如 `2026-09-04T15:30:00+08:00`。
- 同一主工作同一时间只允许一个写入者；不同主工作可以并行。
- 自动化修改必须先生成完整新文件，再原子替换原文件。
- 工作任务 CSV 的命名必须遵守 `spec/namespec.md`。
