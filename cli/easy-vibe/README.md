# @zwbcoding/easy-vibe

Easy Vibe 项目工作空间 CLI。它负责初始化项目结构，并提供面向人员和 Coding Agent 的只读事实查询。

## 安装和运行

直接使用 npx：

```bash
npx @zwbcoding/easy-vibe init
```

本地开发时：

```bash
node bin/easy-vibe.js --help
npm test
```

## 命令

### 初始化

```text
easyvibe init [项目路径] [--accept-safety]
```

`init` 会选择或解析项目路径，识别合法的 `.easyvibe.json`，或创建缺失的 Easy Vibe 目录、工作流、Step、规约和 Agent 入口。已有文件保持原样。标记项目只做识别，不会自动修复。

非交互环境必须先阅读 `deploy/safe.json`，再传入 `--accept-safety`。

初始化同时会复制预构建的只读工作台：`view/index.html` 与 `view/assets/*`。CLI 发布包不包含 `view-src`、Vue 单文件组件、构建源码或 `node_modules`，因此使用者不需要另外安装 Vue 或 Vite。

### 工作台

```text
easyvibe view [项目路径] [--port <端口>] [--no-open]
```

工作台由 CLI 提供本地静态服务，默认使用 `4173` 端口并尝试打开浏览器。它直接读取项目目录中的真实文件，不依赖业务后端；运行 CLI 只需要 Node.js。

### 查询

查询命令默认使用当前目录，也可以在第一个位置参数传入项目路径。查询不会写入文件、运行服务、连接外部系统或修复项目。

```text
easyvibe info [项目路径] [--json]
easyvibe status [项目路径] [--work <work-id>] [--json]
easyvibe workflows [项目路径] [工作流ID] [--json]
easyvibe steps [项目路径] [Step ID] [--json]
easyvibe docs [项目路径] [--type <类型>] [--json]
easyvibe bugs [项目路径] [--status <状态>] [--severity <级别>] [--json]
easyvibe context [项目路径] [--json]
easyvibe specs [项目路径] [规范ID] [--json]
```

| 命令 | 用途 |
| --- | --- |
| `info` | 查询项目标记、Agent 入口和核心文件完整性 |
| `status` | 查询主工作、子任务、进行中事项和恢复信息 |
| `workflows` | 查询工作流列表或指定工作流的节点、Step 和转换条件 |
| `steps` | 查询 Step 列表或指定 Step 的读写路径、风险级别和文件入口 |
| `docs` | 查询 `docs/` 文档索引，可按文档目录筛选 |
| `bugs` | 查询 Bug 索引，可按状态和严重级别筛选 |
| `context` | 聚合大模型接手项目所需的最小核心上下文 |
| `specs` | 查询工程规范目录或指定领域规范 |

`workflows`、`steps`、`bugs`、`specs` 分别支持 `workflow`、`step`、`bug`、`spec`、`standards` 别名。`docs --type` 支持 `demand`、`design`、`test`、`meet`、`record`、`bug`、`root`。

`specs` 可追加以下规范 ID：

- `engineering`：工程规范目录说明
- `engineering-ui`：UI 与前端代码规范
- `engineering-backend`：后端代码规范
- `engineering-database`：数据库设计规范

这些规范只定义格式、边界和记录方式，不固定具体框架、语言、数据库或部署平台；`guide/` 会引导 Coding Agent 在开始实现前读取对应规范。

## JSON 示例

```bash
easyvibe context --json
easyvibe status --work work-20260905-001 --json
easyvibe bugs --status open --severity high --json
easyvibe workflows . backend-feature --json
easyvibe steps . coding --json
easyvibe specs . engineering-ui --json
```

JSON 输出包含 `command` 和绝对项目根路径。`context --json` 额外聚合：

- 项目标记、Agent 入口和核心文件存在性
- 当前未结束主工作、子任务和未关闭 Bug
- 可用工作流与 Step 摘要
- 文档和 Bug 索引统计
- 缺失可选索引文件时的 `warnings`

未初始化或标记无效的项目会以退出码 `1` 失败，并说明下一步。缺失状态或 Bug CSV 时，查询仍返回空结果和警告；工作流与 Step 定义缺失或损坏则直接失败，因为它们无法提供可信规则。

`easyvibe view` 只要求目标目录存在 `view/index.html`，不依赖 `.easyvibe.json`；未初始化或标记无效时，工作台仍会读取可用项目事实，并在页面中标出完整性风险。

## 版本

```bash
easyvibe --version
easyvibe --help
```
