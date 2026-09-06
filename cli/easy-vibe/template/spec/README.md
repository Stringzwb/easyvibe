# spec

本目录保存项目执行规约：

- `general.md`：全部操作默认适用的总规约。
- `namespec.md`：创建和重命名文件时适用的命名规约。
- `steps/<step-id>/README.md`：与 `workflow/steps/<step-id>/` 严格一一绑定的步骤规约。
- `custom/<spec-id>/README.md`：按需显式引用的专项规约。
- `custom/engineering/`：可组合的工程实现规范目录，包含 UI 与前端、后端、数据库领域文件。
- `custom/directory-governance/README.md`：集中定义各目录职责、允许内容、读写边界和目录安全要求。
- `directories/<directory-id>.md`：每个主目录的独立目录规约。

目录规约使用 `kind: directory`，文件名为主目录 ID；它们继承 `custom/directory-governance` 的公共规则，规则 ID 使用 `DIR-<DIRECTORY-ID>-<NNN>`。

规约帮助 Agent 默认以一致方式工作，但不高于用户的明确要求。用户要求例外时，应说明影响并保留授权与执行记录。

步骤规约使用 `draft`、`active`、`deprecated` 状态。新建步骤规约默认为 `draft`，激活后才可作为默认有效 Step 使用。

所有执行、安全、目录和命名规则统一维护在 `spec/`；`guide/` 和目录 README 只提供导航与简介，不重复规则正文。节点执行时按总规约、父目录规约、目标目录规约、命名规约、Step 规约和显式自定义规约的顺序加载。
