---
version: 1
kind: custom
id: engineering
name: "工程实现规范目录"
status: active
summary: "以可扩展文件集合定义 UI、前端、后端和数据库实现格式，不绑定具体技术栈。"
---

# 工程实现规范目录

## Purpose

为工程实现提供可组合的格式规范。规范只定义应记录的结构、字段和验证要求，不规定具体框架、语言、数据库产品或部署平台。

## Scope

### Applies To

- `ui.md`：UI 设计与前端代码规范
- `backend.md`：后端代码规范
- `database.md`：数据库设计规范
- 未来新增的同类工程规范文件

### Excludes

- 具体技术栈选型
- 具体业务字段、接口、页面或表结构
- 代替项目总规约、目录规约和 Step 规约

## File Model

每个工程规范文件必须包含 YAML Front Matter、`Purpose`、`Scope` 和 `Rules`。每条规则使用统一字段：

```markdown
### ENG-AREA-001 - 规则名称

- `level`: `MUST`
- `requirement`: 要求正文
- `verification`: 验证方式
- `evidence`: 验证证据
- `on_violation`: `BLOCK`
- `exception`: 例外条件
```

规范文件可以继续增加领域文件，但必须在本目录 README 的文件模型中登记，并在 `guide/README.md` 中加入读取入口。

## Loading

Agent 先读取本文件，再根据当前 Step 和修改范围读取一个或多个领域规范。领域规范只提供格式约束，具体实现由项目需求和技术决策确定。

## Rules

### ENG-DIR-001 - 保持领域文件可组合

- `level`: `MUST`
- `requirement`: 每个领域规范必须独立成文件，并通过稳定的 id、name、status 和 summary 说明自己的适用范围。
- `verification`: 检查 Front Matter、文件登记和 Guide 入口是否一致。
- `evidence`: 规范文件清单和读取路径。
- `on_violation`: `BLOCK`
- `exception`: 用户明确批准的临时规范文件可以先以 draft 状态登记。

### ENG-DIR-002 - 只定义格式不锁定技术

- `level`: `MUST`
- `requirement`: 规范必须描述结构、边界、命名、验证和证据格式，不得把具体框架、语言、数据库或厂商实现写成默认事实。
- `verification`: 检查规则是否允许等价技术方案，并区分格式要求与项目决策。
- `evidence`: 规则评审记录和技术决策引用。
- `on_violation`: `REVIEW`
- `exception`: 项目在独立技术决策文档中明确选择后，可以在实现文档中引用该决策。

### ENG-DIR-003 - 按变更范围加载

- `level`: `MUST`
- `requirement`: 只读取与当前工作和 Step 相关的领域规范；跨 UI、后端和数据库的变更必须读取全部相关文件。
- `verification`: 对照工作范围、Step 入口和规范读取记录检查加载范围。
- `evidence`: 读取清单和验证结果。
- `on_violation`: `REVIEW`
- `exception`: 用户明确要求全量审阅时，可以读取本目录全部文件。
