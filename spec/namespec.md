---
version: 1
kind: namespec
id: namespec
name: "项目命名规约"
status: active
summary: "定义项目内重复创建的文件、目录和制品的统一命名方式"
---

# 项目命名规约

## Purpose

为项目中重复创建的文件、目录和制品提供稳定、可识别且可由工具校验的命名方式。Agent 按次生成的新文档统一使用“文档类型代码-内容标题-YYYYMMDD”的顺序；内容标题使用 kebab-case，日期为该文档的生成日期。

## Scope

### Applies To

- 项目内由人员、Agent、CLI、工作台或自动化脚本创建和重命名的对象
- 本文件中具有匹配 path 的文件和目录

### Excludes

- 外部工具强制生成且项目无法控制名称的文件
- 第三方依赖目录中的文件
- 原始文件、业务代码、数据集及非文档交付制品；它们不得因本规约改变命名方式或内容

## Rules

### NAM-DOCS-DEMAND-001 - 需求文档命名（REQ）

- `path`: `/docs/demand`
- `target`: `file`
- `pattern`: `REQ-{title}-{date}.md`
- `variables`: `title=kebab-case; date=YYYYMMDD`
- `example`: `REQ-user-login-requirements-20260904.md`
- `collision`: `REJECT`
- `level`: `MUST`
- `on_violation`: `BLOCK`
- `exception`: none

### NAM-DOCS-DESIGN-001 - 设计文档命名（DES、UID、RSH）

- `path`: `/docs/design`
- `target`: `file`
- `pattern`: `{doc_type}-{title}-{date}.md`
- `variables`: `doc_type=enum(DES,UID,RSH); title=kebab-case; date=YYYYMMDD`
- `example`: `DES-authentication-architecture-20260904.md`
- `collision`: `REJECT`
- `level`: `MUST`
- `on_violation`: `BLOCK`
- `exception`: `DES` 使用 `DES-{title}-{date}.md`，仅用于技术设计、模块关系和关键决策；`UID` 使用 `UID-{title}-{date}.md`，仅用于 UI 设计、交互、响应式和可访问性说明；`RSH` 使用 `RSH-{title}-{date}.md`，仅用于按工作流允许写入 `docs/design/` 的调研记录。

### NAM-DOCS-RECORD-001 - 调研与过程记录命名（RSH、REC）

- `path`: `/docs/record`
- `target`: `file`
- `pattern`: `{doc_type}-{title}-{date}.md`
- `variables`: `doc_type=enum(RSH,REC); title=kebab-case; date=YYYYMMDD`
- `example`: `RSH-payment-provider-comparison-20260904.md`
- `collision`: `REJECT`
- `level`: `MUST`
- `on_violation`: `BLOCK`
- `exception`: `RSH` 使用 `RSH-{title}-{date}.md`，仅用于调研问题、来源、事实、结论和建议；`REC` 使用 `REC-{title}-{date}.md`，仅用于不属于需求、设计、测试或 Bug 的项目过程记录。

### NAM-DOCS-TEST-001 - 测试文档命名（TST、UTR、API、FTR、REL）

- `path`: `/docs/test`
- `target`: `file`
- `pattern`: `{doc_type}-{title}-{date}.md`
- `variables`: `doc_type=enum(TST,UTR,API,FTR,REL); title=kebab-case; date=YYYYMMDD`
- `example`: `TST-authentication-test-plan-20260904.md`
- `collision`: `REJECT`
- `level`: `MUST`
- `on_violation`: `BLOCK`
- `exception`: `TST` 使用 `TST-{title}-{date}.md`，用于测试计划或通用测试记录；`UTR` 使用 `UTR-{title}-{date}.md`，用于单元测试结果；`API` 使用 `API-{title}-{date}.md`，用于 API 测试记录和脱敏验证证据；`FTR` 使用 `FTR-{title}-{date}.md`，用于功能测试报告与验收证据；`REL` 使用 `REL-{title}-{date}.md`，用于发布建议。

### NAM-DOCS-BUG-001 - Bug 详情文件命名（BUG）

- `path`: `/docs/bug/list`
- `target`: `file`
- `pattern`: `BUG-{title}-{date}.md`
- `variables`: `title=kebab-case; date=YYYYMMDD`
- `example`: `BUG-login-timeout-20260904.md`
- `collision`: `REJECT`
- `level`: `MUST`
- `on_violation`: `BLOCK`
- `exception`: `README.md`、`TEMPLATE.md` 和 `/docs/bug/bugs.csv` 为固定管理文件，不使用本规则；Bug 详情仍须与 `bugs.csv` 同步更新。

### NAM-DOCS-MEET-001 - 会议记录命名（MTG）

- `path`: `/docs/meet`
- `target`: `file`
- `pattern`: `MTG-{title}-{date}.md`
- `variables`: `title=kebab-case; date=YYYYMMDD`
- `example`: `MTG-release-scope-review-20260904.md`
- `collision`: `REJECT`
- `level`: `MUST`
- `on_violation`: `BLOCK`
- `exception`: none

### NAM-DEPLOY-ARTIFACT-DOC-001 - 构建记录文档命名（PKG）

- `path`: `/deploy/artifact`
- `target`: `file`
- `pattern`: `PKG-{title}-{date}.md`
- `variables`: `title=kebab-case; date=YYYYMMDD`
- `example`: `PKG-release-manifest-20260904.md`
- `collision`: `REJECT`
- `level`: `MUST`
- `on_violation`: `BLOCK`
- `exception`: 仅适用于 Agent 生成的 Markdown 构建清单、哈希和结果记录；二进制、压缩包、源码及其他非文档交付制品不适用本规则，保留其既有命名和内容。

### NAM-DEPLOY-LOG-001 - 部署日志命名（DPL）

- `path`: `/deploy/log`
- `target`: `file`
- `pattern`: `DPL-{title}-{date}.md`
- `variables`: `title=kebab-case; date=YYYYMMDD`
- `example`: `DPL-deploy-user-service-20260904.md`
- `collision`: `REJECT`
- `level`: `MUST`
- `on_violation`: `BLOCK`
- `exception`: none

### NAM-STATUS-WORK-001 - 结构化工作状态文件命名

- `path`: `/status/work`
- `target`: `file`
- `pattern`: `{work_id}.csv`
- `variables`: `work_id=regex(^work-[0-9]{8}-[0-9]{3}$)`
- `example`: `work-20260904-001.csv`
- `collision`: `REJECT`
- `level`: `MUST`
- `on_violation`: `BLOCK`
- `exception`: `README.md` 为固定管理文件；`status/` 下的 CSV 是现有工作流要求的结构化状态记录，不属于按次生成的 Markdown 文档命名规则，必须保持其既有 work_id 契约。
