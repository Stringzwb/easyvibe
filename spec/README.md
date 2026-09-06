# spec

`spec/` 用于存放项目执行过程中必须遵守的规约。规约面向工作流节点生效，用来约束 Agent 和参与项目的人员如何完成工作、产出什么结果，以及哪些行为不可接受。

本文件定义 spec v1 的文件格式、目录模型和同步规则。CLI 已提供对项目标记、工作流、Step、状态、文档和 Bug 的只读查询，但不负责规则同步、格式校验或自动修复；新增或调整步骤时仍需要人工保持 `workflow/steps/` 与 `spec/steps/` 一致。

## 目录结构

```text
spec/
  README.md
  general.md
  namespec.md
  custom/
    <spec-id>/
      README.md
    engineering/
      README.md
      ui.md
      backend.md
      database.md
  directories/
    <directory-id>.md
  steps/
    <step-id>/
      README.md
```

- `general.md`：项目总规约。所有工作流、所有节点默认生效。
- `namespec.md`：项目命名规约。创建或重命名文件、目录和制品时生效，并允许项目按需修改。
- `custom/<spec-id>/README.md`：自定义规约。用于封装不属于某个固定步骤、但可被一个或多个节点复用的专项约束。
- `custom/engineering/`：工程实现规范目录。以多个领域文件定义 UI、前端、后端和数据库实现格式，不绑定具体技术栈；入口为 `README.md`。
- `custom/directory-governance/README.md`：目录规约。集中定义各目录职责、允许内容、读写边界和目录安全要求；目录 README 只做简介和索引。
- `directories/<directory-id>.md`：每个主目录的独立目录规约；文件名使用主目录 ID，规则只约束该目录及其子目录。
- `steps/<step-id>/README.md`：步骤规约。与 `workflow/steps/<step-id>/` 一一对应，在节点使用该 step 时自动生效。

规约目录后续可以包含示例、模板或其他辅助文件；自定义规约和步骤规约以目录下的 `README.md` 为入口，目录规约以 `spec/directories/<directory-id>.md` 为入口。

`<spec-id>` 和 `<step-id>` 必须匹配 `^[a-z0-9][a-z0-9-]*$`：只允许小写字母、数字和短横线，且不能以短横线开头。

## 规约文件格式

所有规约入口文件必须满足以下基础要求：

- 使用 UTF-8 编码和 LF 换行，文件末尾保留一个换行符。
- 文件由 YAML Front Matter 和 Markdown 正文两部分组成。
- Front Matter 必须从文件第一行开始，其前面不得有标题、注释或空行。
- 一个入口文件只定义一项规约，不得混合多个 spec。
- Front Matter 字段、正文章节和规则字段必须使用本文规定的名称与顺序。
- 格式错误必须导致校验失败，不得通过猜测、宽松解析或静默修复继续执行。

完整结构如下：

```markdown
---
version: 1
kind: <general|namespec|custom|directory|step>
id: <spec-id>
name: "<display-name>"
status: <draft|active|deprecated>
summary: "<one-line-summary>"
---

# <display-name>

## Purpose

<why-this-spec-exists>

## Scope

### Applies To

- <applicable-object>

### Excludes

- <excluded-object-or-none>

## Rules

### <rule-id> - <rule-title>

- `level`: `<MUST|MUST_NOT|SHOULD|SHOULD_NOT|MAY>`
- `requirement`: <one-testable-requirement>
- `verification`: <how-to-check-it>
- `evidence`: <expected-evidence-or-none>
- `on_violation`: `<BLOCK|REVIEW|WARN|NONE>`
- `exception`: <exception-condition-or-none>
```

### Front Matter

Front Matter 只允许以下字段。字段不得缺失、重复或增加未定义字段。

| 字段 | 类型 | 约束 |
| --- | --- | --- |
| `version` | integer | 当前固定为 `1` |
| `kind` | enum | 只能是 `general`、`namespec`、`custom`、`directory` 或 `step` |
| `id` | string | 总规约固定为 `general`，命名规约固定为 `namespec`；其余必须与父目录名完全一致 |
| `name` | string | 非空展示名称，必须使用双引号 |
| `status` | enum | 只能是 `draft`、`active` 或 `deprecated` |
| `summary` | string | 非空单行摘要，必须使用双引号 |

文件位置、`kind` 和 `id` 必须保持一致：

| 文件 | `kind` | `id` |
| --- | --- | --- |
| `spec/general.md` | `general` | `general` |
| `spec/namespec.md` | `namespec` | `namespec` |
| `spec/custom/security-review/README.md` | `custom` | `security-review` |
| `spec/directories/code.md` | `directory` | `code` |
| `spec/steps/coding/README.md` | `step` | `coding` |

状态定义如下：

- `draft`：正在编写，不进入节点有效规约。节点依赖的步骤规约仍为 draft 时，必须阻止自动执行。
- `active`：正式生效，可以被节点加载和执行。
- `deprecated`：已废弃，仅为历史追溯保留，不得被新节点引用。

`general.md` 和 `namespec.md` 必须始终为 `active`。新建步骤规约和自定义规约时默认使用 `draft`，经确认后才能改为 `active`。

目录规约文件使用 `kind: directory` 且必须处于 `active` 状态；执行涉及某个主目录时，必须加载对应的 `spec/directories/<directory-id>.md`。

### 正文章节

正文一级标题必须与 Front Matter 的 `name` 完全相同。下列二级和三级章节必须按顺序出现，不得改名：

1. `Purpose`
2. `Scope`
   1. `Applies To`
   2. `Excludes`
3. `Rules`

`Purpose` 必须用一段非空文本说明规约存在的原因和预期结果。

`Applies To` 必须至少包含一个列表项，明确适用的流程、节点、目录、产物或行为。`Excludes` 也必须至少包含一个列表项；没有排除项时固定写 `- none`。

`active` 规约至少包含一条规则。`draft` 规约暂时没有规则时，必须在 `Rules` 下写：

```markdown
_No rules defined._
```

### 规则块

每条规则只能表达一个可独立判断的要求，并必须严格使用以下字段及顺序：

```markdown
### GEN-001 - 禁止提交明文凭证

- `level`: `MUST_NOT`
- `requirement`: 代码、文档和制品中不得包含明文密码、Token 或私钥。
- `verification`: 提交前执行凭证扫描，并人工复核环境配置文件。
- `evidence`: 凭证扫描结果。
- `on_violation`: `BLOCK`
- `exception`: none
```

| 字段 | 约束 |
| --- | --- |
| `level` | 只能使用 `MUST`、`MUST_NOT`、`SHOULD`、`SHOULD_NOT`、`MAY` |
| `requirement` | 非空、单一、可判断的要求，不得只写背景或目标 |
| `verification` | 非空，明确使用检查、测试、命令或人工评审中的哪种方式验证 |
| `evidence` | 非空，说明验证后保留的证据；不需要证据时写 `none` |
| `on_violation` | 只能使用 `BLOCK`、`REVIEW`、`WARN`、`NONE` |
| `exception` | 写明例外条件和批准者；不允许例外时写 `none` |

字段值必须写在同一行。内容过长时应拆分为多条规则，不使用缩进续行，以便后续 CLI 稳定解析。

规则强度的含义：

- `MUST`：必须执行。
- `MUST_NOT`：明确禁止。
- `SHOULD`：原则上应该执行；偏离时必须说明理由。
- `SHOULD_NOT`：原则上不应执行；确需执行时必须说明理由。
- `MAY`：允许但不强制。

违规处理的含义：

- `BLOCK`：阻止当前节点完成或进入下一节点。
- `REVIEW`：暂停自动流转，等待人工确认。
- `WARN`：记录警告，但允许继续。
- `NONE`：仅提供信息，不产生阻断或警告。

`MUST` 和 `MUST_NOT` 不得使用 `NONE`；`MAY` 通常使用 `NONE`。存在例外时，`exception` 必须写清例外条件、批准角色和需要保留的证据，不能只写“特殊情况除外”。

### 规则 ID

规则 ID 在整个项目中必须唯一，并按规约类型生成：

| 规约类型 | 格式 | 示例 |
| --- | --- | --- |
| 总规约 | `GEN-<NNN>` | `GEN-001` |
| 命名规约 | `NAM-<SUBJECT>-<NNN>` | `NAM-DEPLOY-LOG-001` |
| 自定义规约 | `CUS-<SPEC-ID>-<NNN>` | `CUS-SECURITY-REVIEW-001` |
| 目录规约 | `DIR-<DIRECTORY-ID>-<NNN>` | `DIR-CODE-001` |
| 步骤规约 | `STP-<STEP-ID>-<NNN>` | `STP-CODING-001` |

生成规则 ID 时，将 spec ID 或 step ID 转为大写并保留短横线。编号从 `001` 开始，在同一规约内递增；删除规则后不得复用旧编号。规则 ID 与标题之间固定使用 ` - `。

## namespec 格式

`namespec.md` 使用相同的 Front Matter、`Purpose` 和 `Scope` 格式，但 `Rules` 中的命名规则采用专用字段。这样 CLI 和工作台可以直接读取命名模式并生成或校验名称。

每条命名规则必须严格使用以下格式和字段顺序：

```markdown
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
```

| 字段 | 约束 |
| --- | --- |
| `path` | 规则生效目录，必须是以 `/` 开头的项目相对绝对路径，不得包含 `..` |
| `target` | 只能是 `file`、`directory` 或 `both` |
| `pattern` | 非空命名模板；变量使用 `{variable}`，固定字符直接书写 |
| `variables` | 用分号分隔变量定义，必须覆盖 `pattern` 中的全部变量，不得定义未使用变量 |
| `example` | 必须给出一个完整名称，并且能够通过该规则校验 |
| `collision` | 只能是 `REJECT`、`INCREMENT` 或 `TIMESTAMP` |
| `level` | 只能使用 `MUST`、`SHOULD` 或 `MAY` |
| `on_violation` | 只能使用 `BLOCK`、`REVIEW`、`WARN` 或 `NONE` |
| `exception` | 写明例外条件和批准者；不允许例外时写 `none` |

`variables` 固定使用 `<变量名>=<校验器>`，多个定义之间使用分号和一个空格分隔。变量名必须匹配 `^[a-z][a-z0-9_]*$`。spec v1 支持以下校验器：

- `YYYYMMDD`：8 位有效日历日期。
- `YYYYMMDD-HHmmss`：日期加 24 小时时间。
- `kebab-case`：匹配 `^[a-z0-9]+(?:-[a-z0-9]+)*$`。
- `snake_case`：匹配 `^[a-z0-9]+(?:_[a-z0-9]+)*$`。
- `semver`：不带前缀 `v` 的语义化版本，例如 `1.2.0` 或 `1.2.0-rc.1`。
- `integer`：不带符号的十进制整数。
- `enum(a,b,c)`：只能取括号中列出的值。
- `regex(<expression>)`：使用完整正则表达式校验；表达式不得包含分号。

同一规则内不得重复变量。`pattern` 中出现的变量必须全部定义，未出现在 `pattern` 中的变量不得保留。

`collision` 的含义：

- `REJECT`：目标名称已存在时拒绝创建，由调用者提供新的变量值。
- `INCREMENT`：在扩展名前追加从 `-2` 开始的递增编号。
- `TIMESTAMP`：在扩展名前追加 `-HHmmss`；只允许用于不要求名称稳定的临时性记录。

命名规则按 `path` 匹配。多个规则同时命中时，路径更深、范围更具体的规则优先；同一路径存在多个无法确定优先级的 `MUST` 规则时视为冲突并阻止创建。

`namespec.md` 是项目可修改规约。允许新增、调整或废弃命名规则，但必须遵守以下要求：

- 修改后仍需符合 namespec 格式，且规则 ID 全局唯一。
- 规则的小幅调整保留原 ID；规则含义或命名模式发生根本变化时使用新 ID。
- 新规则只约束修改后创建或重命名的对象，不自动批量重命名已有文件。
- 需要迁移历史名称时必须单独制定迁移计划，检查引用后显式执行。
- CLI、工作台或自动化脚本依赖的规则不得直接删除，应先迁移依赖，再移除或保留为废弃说明。

## 普通规约完整示例

`spec/steps/coding/README.md` 可以写为：

```markdown
---
version: 1
kind: step
id: coding
name: "代码开发规约"
status: active
summary: "约束代码开发节点的实现和验证要求"
---

# 代码开发规约

## Purpose

确保代码修改符合已确认的需求，并具备可验证的质量。

## Scope

### Applies To

- 使用 coding step 的所有工作流节点
- code/ 下新增或修改的源代码

### Excludes

- 只读代码审查

## Rules

### STP-CODING-001 - 修改必须对应需求

- `level`: `MUST`
- `requirement`: 每项代码修改必须能够对应到当前节点已确认的需求或缺陷。
- `verification`: 对照需求说明审查代码差异。
- `evidence`: 需求或缺陷标识及代码差异。
- `on_violation`: `BLOCK`
- `exception`: none

### STP-CODING-002 - 执行相关测试

- `level`: `MUST`
- `requirement`: 完成代码修改后必须执行与改动范围相关的自动化测试。
- `verification`: 运行项目定义的相关测试命令并检查退出状态。
- `evidence`: 测试命令和结果摘要。
- `on_violation`: `BLOCK`
- `exception`: 测试环境不可用时由项目负责人批准，并记录原因和后续补测任务。
```

## 规约生效模型

一个工作流节点的有效规约由三部分组成：

```text
节点有效规约
  = active 总规约
  + active 目标目录规约
  + 创建或重命名对象时适用的 active 命名规约
  + active 步骤规约
  + 节点显式引用的 active 自定义规约
```

加载顺序为总规约、父目录规约、目标目录规约、命名规约、步骤规约、自定义规约。后加载的规约可以针对更具体的场景进行补充或收紧，但不得静默放宽已有的安全限制。出现相互矛盾的要求时，必须报告冲突的规则 ID 并由项目负责人明确取舍，不能由 Agent 自行选择忽略其中一项。

自定义规约不会因为文件存在就自动应用，必须由节点显式引用。引用信息最终存放在哪里、采用何种字段，将在 CLI 和工作台设计阶段统一确定；在此之前不提前修改 `workflows.json` 或 `step.json` 的结构。

## workflow 与 spec 的职责边界

`workflow/steps/` 定义“步骤如何运行”，包括步骤身份、目标、读写范围、执行说明和完成条件。

`spec/steps/` 定义“执行步骤时必须遵守什么”，包括质量标准、技术约束、禁止事项、交付物要求和验收证据。

两者通过相同的 `<step-id>` 建立关联，但不是彼此的副本。工作流配置发生普通内容变更时，不应自动覆盖人工维护的规约正文。

## 步骤目录同步规则

在任意时刻，步骤目录应满足以下关系：

```text
workflow/steps/<step-id>/
             <------>
spec/steps/<step-id>/
```

### 新增步骤

新增 step 时，应在同一次操作中：

1. 创建 `workflow/steps/<step-id>/` 及其步骤配置和说明。
2. 创建 `spec/steps/<step-id>/README.md`，按照本文格式写入初始模板，状态设为 `draft`。
3. 任一目录创建失败时回滚本次操作，避免产生单边目录。

将已有 step 加入某个工作流只是在工作流中新增节点，不重复创建步骤规约。

### 删除步骤

删除 step 前，必须确认它没有被任何工作流节点引用。检查通过后，在同一次操作中删除：

- `workflow/steps/<step-id>/`
- `spec/steps/<step-id>/`

删除任一侧失败时，操作应视为失败并尽可能恢复到删除前状态。删除工作流节点不会删除 step 或步骤规约，因为同一个 step 仍可能被其他节点和工作流复用。

### 变更步骤

步骤变更分为两类：

- 修改 step ID：属于结构变更。必须同步移动两个步骤目录，修改 `step.json` 和规约 Front Matter 中的 ID，重新生成该规约下的规则 ID，并更新所有工作流节点中的 step 引用。
- 修改名称、描述、路径范围或执行说明：属于工作流内容变更，只修改 `workflow/steps/<step-id>/`；步骤规约正文保留，由维护者按实际影响决定是否调整。

直接修改步骤规约内容只影响 `spec/steps/<step-id>/`，不反向覆盖工作流步骤配置。

## 自定义规约管理

自定义规约拥有独立 ID，并独立于 step 创建、修改和删除。ID 必须只使用小写字母、数字和短横线，例如：

```text
spec/custom/security-review/README.md
spec/custom/database-migration/README.md
spec/custom/release-check/README.md
```

删除自定义规约前，应检查是否仍有节点引用它。被引用的规约不得直接删除；需要先移除引用或替换为其他规约。

## 一致性校验

后续 CLI 和工作台至少应检查：

- `general.md` 存在且可读取。
- `namespec.md` 存在、符合专用格式并处于 `active` 状态。
- `custom/directory-governance/README.md` 存在、处于 `active` 状态，并覆盖所有受管目录。
- Front Matter 字段完整，字段值、文件位置、`kind` 和 `id` 一致。
- 一级标题与 `name` 一致，正文必需章节存在且顺序正确。
- `active` 规约至少包含一条格式完整的规则。
- 规则字段齐全、顺序正确、枚举合法，规则 ID 全局唯一且符合前缀规则。
- 命名规则中的变量声明完整，示例符合 pattern，path 不越出项目目录。
- `workflow/steps/` 与 `spec/steps/` 中的 step ID 集合完全一致。
- 每个步骤规约目录都包含非空的 `README.md`。
- 步骤目录名、`step.json` 中的 ID、步骤规约 ID 以及工作流节点引用保持一致。
- 工作流节点引用的 step 和自定义规约都真实存在且处于 `active` 状态。
- 目录 README 只做简介和索引，目录职责与安全规则均能在 directory-governance 或其明确引用的 spec 中找到。
- 不存在缺失的步骤规约或没有对应 step 的孤立步骤规约。

CLI 和工作台执行新增、删除或 ID 变更时，应把 workflow 与 spec 的修改视为一个完整操作，而不是两个互不相关的文件操作。

规约内容必须可判断、可验证，禁止只使用“合理”“适当”“尽量”等无法客观检查的表达。
