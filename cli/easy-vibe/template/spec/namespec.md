---
version: 1
kind: namespec
id: namespec
name: "项目命名规约"
status: active
summary: "定义工作状态、Bug 详情和部署日志的默认命名方式"
---

# 项目命名规约

## Purpose

为重复创建的项目记录提供稳定且可识别的名称。

## Scope

### Applies To

- 本文件中声明了匹配路径的新建和重命名对象

### Excludes

- 外部工具强制生成且项目无法控制名称的文件

## Rules

### NAM-DEPLOY-LOG-001 - 部署日志命名

- `path`: `/deploy/log`
- `target`: `file`
- `pattern`: `{date}-{description}-v{version}.md`
- `variables`: `date=YYYYMMDD; description=kebab-case; version=semver`
- `example`: `20260904-deploy-user-service-v1.2.0.md`
- `collision`: `REJECT`
- `level`: `MUST`
- `on_violation`: `BLOCK`
- `exception`: none

### NAM-DOCS-BUG-001 - Bug 详情文件命名

- `path`: `/docs/bug/list`
- `target`: `file`
- `pattern`: `BUG-{date}-{sequence}-{description}.md`
- `variables`: `date=YYYYMMDD; sequence=regex(^[0-9]{3}$); description=kebab-case`
- `example`: `BUG-20260904-001-login-timeout.md`
- `collision`: `REJECT`
- `level`: `MUST`
- `on_violation`: `BLOCK`
- `exception`: README.md 和 TEMPLATE.md 为固定管理文件。

### NAM-STATUS-WORK-001 - 主工作任务 CSV 命名

- `path`: `/status/work`
- `target`: `file`
- `pattern`: `{work_id}.csv`
- `variables`: `work_id=regex(^work-[0-9]{8}-[0-9]{3}$)`
- `example`: `work-20260904-001.csv`
- `collision`: `REJECT`
- `level`: `MUST`
- `on_violation`: `BLOCK`
- `exception`: README.md 为固定管理文件。
