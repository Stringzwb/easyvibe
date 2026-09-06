---
version: 1
kind: design
id: UID-project-state-dashboard-20260905
name: "Easy Vibe 项目状态可视化工作台"
status: active
summary: "以状态、工作流、规约、风险和证据为主线，展示项目当前完整开发情况的只读仪表盘"
---

# Easy Vibe 项目状态可视化工作台

## Purpose

为项目负责人、Coding Agent 和协作者提供一个不依赖逐个阅读文件的项目总览。页面从 guide、spec、workflow、status、docs 和 deploy/safe.json 中提取结构化事实，展示当前开发阶段、进行中的工作、流程位置、约束规则、风险和验证证据。

## Scope

### Applies To

- `view-src/` 中的 Vue 3 + Vite 源码，以及发布到 `view/` 的构建产物
- 固定于 `view/index.html` 所在项目：`view/` 的上一级目录作为唯一数据源
- 项目内 `guide/`、`spec/`、`workflow/`、`status/`、`docs/` 和 `deploy/safe.json` 的只读可视化
- `spec/custom/engineering/` 工程规范目录的索引与适用范围展示

### Excludes

- 文件阅读器、通用目录浏览器和 Markdown 原文预览
- 工作流、Step、状态或规约的创建、修改、删除
- 服务启动、外部系统连接、远程上传和项目内容写回

## Product Model

页面围绕五个问题组织信息：

1. 核心项目结构是否完整？
2. 当前开发推进到哪里，下一步是什么？
3. 当前工作流如何流转，哪些节点已完成、进行中、阻塞或待开始？
4. 当前哪些规则和安全边界生效？
5. 哪些 Bug、缺失证据或阻塞事项需要关注？

## Information Architecture

页面使用顶部项目头和视图导航，默认进入“总览”。视图切换只改变当前内容，不打开文件阅读器，也不修改项目目录。

### 1. Project Header

展示项目名称、项目根目录标识、最近同步时间、固定数据源标识和刷新动作。页面通过相对 URL 读取 `view/` 上一级项目文件。

### 2. Overview

首屏回答项目是否完整、推进到哪里、当前风险是什么：

- 结构健康：核心目录和入口文件存在数量 / 应存在数量
- 当前进度：已完成子任务 / 子任务总数
- 活跃工作：未结束主工作数量
- 未关闭 Bug：`closed`、`resolved`、`completed` 之外的 Bug 数量
- 当前工作流的节点状态、下一步和证据覆盖

### 3. Guide View

读取 `guide/README.md` 的接入顺序和权威索引，转换为“接入路径”：项目说明 → 规约 → 目录治理 → 状态 → 工作流 → Step。每个节点显示文件存在状态，连线表示推荐读取顺序；权威入口以不同颜色强调。

### 4. Workflow View

读取 `workflow/workflows.json` 和 `workflow/steps/*/step.json`，将工作流转换为流程图。节点展示 Step 名称、风险级别、入口标识和由 `status/` 映射出的完成状态；转换条件展示在连线旁或节点下方。工作流之间使用选择器切换，不提供编辑操作。

### 5. Rules View

读取 `spec/` 下的 Front Matter 和规则标题，将规则展示为层级关系：对话规则 → 项目总规约 → 目录治理 → 工程实现规范 → 当前工作流 Step 规约。页面展示生效状态、规则数量、适用范围、读写路径和安全优先级，不展开 Markdown 原文。`deploy/safe.json` 只展示默认级别、原则数和资源索引数，不暴露敏感配置值。

### 6. Engineering View

独立展示 `spec/custom/engineering/` 的目录说明和四个规范文件。页面只展示规范元数据、规则数量、摘要和加载方式，不把任何具体框架、语言、数据库产品渲染成默认选型。

### 6. Status View

读取 `status/works.csv` 及其 `task_file` 指向的子任务 CSV，展示工作泳道、状态分布、任务依赖、完成比例、当前任务、下一步和验证结果完整度。主工作与任务之间通过层级关系呈现，而不是把 CSV 原文直接放到页面上。

### 7. Directory View

文档、部署、数据、命令、Agent 和工作台等内容以目录职责卡展示：目录是否存在、文件数量、职责说明和缺失提示。该视图不读取或展示目录内每个文件的正文；只有向导、规约、工作流和状态等逻辑目录进入对应的结构化视图。

### 8. Risk And Evidence

总览和状态视图展示阻塞任务、缺失核心结构、未验证完成项和未关闭 Bug；总览中的证据区展示需求、设计、测试、过程记录和 Bug 文档的数量分布。风险排序为：阻塞事项、缺失核心文件、未验证完成项、未关闭 Bug。

## View Data Policy

| 内容 | 展示方式 | 是否读取正文 |
| --- | --- | --- |
| `guide/` | 接入顺序和权威入口关系图 | 是，仅读取入口 Markdown 的结构信息 |
| `spec/` | 规则层级、状态、规则数量和路径约束 | 是，解析 Front Matter 和规则标题 |
| `workflow/` | 节点、Step、入口和转换条件流程图 | 是，读取 JSON 定义 |
| `status/` | 工作泳道、任务依赖、进度和验证完整度 | 是，读取 CSV 数据 |
| `docs/` | 分类数量和目录存在性 | 否，不展示文档正文 |
| `deploy/` | 目录职责、存在性和文件数量；安全策略仅摘要 | 否，不展示环境配置正文 |
| `data/`、`command/`、`agent/`、`view/` | 目录职责、存在性和文件数量 | 否 |

## Interaction Model

- 点击顶部视图导航进入对应的逻辑展示；当前视图通过 URL hash 保留，例如 `#workflow`、`#status`。
- 点击总览中的工作行切换当前工作流上下文；不打开原始文件。
- 点击流程节点显示该 Step 的规则数量、风险级别、读写路径和权威规约入口。
- 刷新重新读取固定项目根目录；页面每 20 秒进行一次只读轮询并提示外部文件变化。目录型统计依赖静态服务器提供目录索引；无法列出时显示明确提示。
- 固定项目根目录未初始化、文件缺失、CSV 为空或结构损坏时显示对应空态、风险态或错误态。

## Data Contract

页面在读取目录后构造以下快照：

```text
snapshot
├── project: title, rootName, agentEntry, lastUpdated, syncedAt
├── health: expectedCount, presentCount, missingPaths, score
├── progress: totalTasks, completedTasks, activeTasks, percent, verifiedCompletedTasks
├── guide: readingOrder, path checks, authoritative index checks
├── works:主工作 rows with nested task rows, status and progress
├── workflows: workflow definitions with derived node statuses
├── steps: step definitions, risk level, path counts and parsed rule metadata
├── governance: general/namespec/directory rule summaries and parsed rule items
├── directoryRules: per-directory rule summaries
├── engineeringSpecs: engineering specification metadata and rule counts
├── safety: default level, principle summaries and resource count
├── bugs: open bug rows, counts by status and severity
├── documents: counts by demand/design/test/meet/record/bug/root
├── structure: directory existence and file counts
└── warnings: missing or malformed records
```

CSV 使用浏览器端标准状态解析器处理引号、逗号、换行和空字段；JSON 或关键结构损坏时显示错误状态，不静默推断。

## Dynamic Behavior

- 页面从 `view/index.html` 所在位置的上一级目录读取快照并进入 hash 对应视图，默认是总览；`.easyvibe.json` 不参与 View 判断。
- “刷新”重新读取固定项目根目录；页面每 20 秒进行一次只读轮询，检测外部文件变化。
- 工作流节点状态由同一工作流下的主工作和子任务推导；点击节点进入 Step 检视器。
- 规则 Markdown 只解析 Front Matter、规则标题、级别和违规处理；文档、部署、数据、命令、Agent 和工作台不展示正文。
- 文件缺失、空状态表和无 Bug 不是页面崩溃条件，而是转化为“未配置”“尚未开始”或风险提示。
- 标记无效、工作流 JSON 损坏或 Step 定义不可解析时，显示明确的项目完整性错误，并保留刷新固定目录操作。
- 不申请目录选择权限，不保存目录句柄，不使用项目目录的 `readwrite` 权限；文件通过固定项目根目录的相对 URL 读取。

## Visual System

- 基调：深墨蓝用于导航和标题，青绿色用于推进状态，琥珀色用于待处理，珊瑚红用于风险，蓝色用于信息和证据。
- 页面采用工作台布局，桌面端左侧为固定项目导航，右侧按“项目头部 → 指标带 → 当前视图”的顺序组织内容；总览内部再按主工作与风险证据分栏。
- 重复信息使用表格行、状态胶囊和紧凑指标，不使用大面积插画或营销式 Hero。
- 状态同时通过颜色、文字和图标表达，满足色觉差异下的识别需求。
- 控件保持稳定尺寸；流程节点使用固定最小宽度，窄屏改为纵向流程，避免内容挤压。
- 工作台默认使用亮色模式，支持右上角切换暗色模式；导航使用桌面端左侧栏，移动端降级为紧凑横向栏。

## Responsive Layout

- `>= 1121px`：左侧固定项目导航，右侧项目头部、四指标和主视图；总览内部采用主内容与风险证据双栏。
- `760px - 1120px`：导航收窄，指标两列，主体单列，规则和风险模块按优先级排列。
- `< 760px`：导航变为紧凑横向栏，顶部动作换行，流程节点纵向排列；所有长路径和标题允许换行。

## Acceptance Criteria

- 首屏能看到项目名称、结构健康、当前进度、活跃工作和未关闭 Bug。
- 用户不阅读具体文件正文即可判断当前阶段、下一步、流程位置和主要风险。
- 修改 `status/works.csv`、子任务 CSV、工作流 JSON、Bug CSV 或文档目录后刷新，相关指标和列表会变化。
- 页面不提供新增、编辑、删除、文件预览或通用目录浏览操作。
- 未初始化项目、缺失状态文件、空工作区和损坏结构均有可理解的空态或错误态。
- 桌面和移动宽度下无横向页面溢出、文字遮挡或控件变形。
