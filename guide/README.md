# Easy Vibe Agent Guide

本目录只提供导航索引。所有执行、安全、目录、命名和 Step 规则以 `spec/` 为唯一权威来源；本文件不重复规则正文。

## 接入顺序

1. 读取项目根目录 `README.md`。
2. 读取 [`spec/README.md`](../spec/README.md) 了解规约目录和加载模型。
3. 读取 [`spec/custom/engineering/README.md`](../spec/custom/engineering/README.md)，并按变更范围读取 UI、后端和数据库规范。
4. 读取 [`spec/general.md`](../spec/general.md) 和 [`spec/namespec.md`](../spec/namespec.md)。
5. 读取 [`spec/custom/directory-governance/README.md`](../spec/custom/directory-governance/README.md) 获取目标目录规则。
6. 读取 [`status/works.csv`](../status/works.csv) 及当前主任务对应的子任务 CSV。
7. 读取 [`workflow/workflows.json`](../workflow/workflows.json) 选择工作流和节点范围。
8. 对每个节点同时读取 `workflow/steps/<step-id>/` 与 `spec/steps/<step-id>/README.md`。

## 工程实现规范

`spec/custom/engineering/` 是可扩展的工程规范目录，只定义记录格式、边界、验证和证据要求，不固定框架、语言、数据库产品或部署平台。

- UI 或前端变更：读取 `spec/custom/engineering/README.md` 和 `ui.md`。
- 后端变更：读取 `spec/custom/engineering/README.md` 和 `backend.md`。
- 数据库变更：读取 `spec/custom/engineering/README.md` 和 `database.md`。
- 同时涉及多个领域：按变更范围读取全部相关文件。
- 查询规范索引：运行 `easyvibe specs [项目路径]`，追加规范 ID 可查询单个领域。

## 权威索引

| 内容 | 权威入口 |
| --- | --- |
| 项目总规约 | [`spec/general.md`](../spec/general.md) |
| 文档和对象命名 | [`spec/namespec.md`](../spec/namespec.md) |
| 工程实现规范目录 | [`spec/custom/engineering/README.md`](../spec/custom/engineering/README.md) |
| UI 与前端代码规范 | [`spec/custom/engineering/ui.md`](../spec/custom/engineering/ui.md) |
| 后端代码规范 | [`spec/custom/engineering/backend.md`](../spec/custom/engineering/backend.md) |
| 数据库设计规范 | [`spec/custom/engineering/database.md`](../spec/custom/engineering/database.md) |
| 目录职责和目录安全规则 | [`spec/custom/directory-governance/README.md`](../spec/custom/directory-governance/README.md) |
| Step 规约 | [`spec/steps/`](../spec/steps/) |
| 工作流运行定义 | [`workflow/workflows.json`](../workflow/workflows.json) |
| Step 运行定义 | [`workflow/steps/`](../workflow/steps/) |
| 主任务和子任务状态 | [`status/README.md`](../status/README.md) |
| 当前工作记录 | [`status/works.csv`](../status/works.csv) |

## 执行提示

- 开始前说明使用的工作流、节点和 Step。
- 只在有效规约允许的路径内操作。
- 主任务边界不明确时先询问用户，不自行创建或归类。
- 完成前检查完成条件，并在 `status/` 留下验证证据。
- 规则冲突时报告规则 ID；对话中新提出的用户安全规则优先于项目规则。
