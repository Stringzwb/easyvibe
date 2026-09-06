# cli

用于存放 Easy Vibe 命令行工具。`easy-vibe/` 提供项目初始化和只读查询命令。

## 查询命令

所有查询命令默认只读，项目路径省略时使用当前目录；追加 `--json` 输出稳定的机器可读 JSON，适合 Coding Agent 或其他自动化调用。

```bash
easyvibe info [项目路径] [--json]
easyvibe status [项目路径] [--work <work-id>] [--json]
easyvibe workflows [项目路径] [工作流ID] [--json]
easyvibe steps [项目路径] [Step ID] [--json]
easyvibe docs [项目路径] [--type <类型>] [--json]
easyvibe bugs [项目路径] [--status <状态>] [--severity <级别>] [--json]
easyvibe context [项目路径] [--json]
easyvibe specs [项目路径] [规范ID] [--json]
```

- `info`：项目标记、Agent 入口和核心管理文件是否存在。
- `status`：主工作、子任务、状态分布、下一步和未验证完成项。
- `workflows`：工作流列表；追加工作流 ID 查询节点和转换条件。支持 `workflow` 别名。
- `steps`：Step 列表；追加 Step ID 查询读写路径、风险级别和规则文件。支持 `step` 别名。
- `docs`：`docs/` 下的文档索引，可按 `demand`、`design`、`test`、`meet`、`record`、`bug`、`root` 筛选。
- `bugs`：Bug 索引，可同时按 `status` 和 `severity` 筛选。支持 `bug` 别名。
- `context`：聚合项目标记、当前工作、未关闭 Bug、可用工作流/Step 和文档索引，推荐给大模型使用 `--json`。
- `specs`：查询工程规范目录或指定领域规范。支持 `spec`、`standards` 别名，以及 `engineering-ui`、`engineering-backend`、`engineering-database` 规范 ID。

查询命令不会自动运行服务、连接外部系统、修复缺失文件或修改项目内容。未发现合法 `.easyvibe.json` 时会直接失败，并提示先执行 `init`。

## 初始化

在希望接入的项目目录运行：

```bash
npx @zwbcoding/easy-vibe init
```

也可以提供路径。非交互环境必须明确确认总安全准则：

```bash
npx @zwbcoding/easy-vibe init ../my-project --accept-safety
```

`init` 会识别已有 Easy Vibe 项目，或补充缺失的目录和管理文件；已有文件不会被覆盖。完整初始化约定见 [`agent/codex/skills/easy-vibe/references/init-contract.md`](../../agent/codex/skills/easy-vibe/references/init-contract.md)。

初始化复制的是 CLI 包内的预构建 View dist：`view/index.html` 和 `view/assets/*`。发布包不包含 Vue 源码、`view-src` 或 `node_modules`，用户执行 `init` 不需要安装 Vue 或 Vite。

## 工作台

```bash
easyvibe view [项目路径] [--port <端口>] [--no-open]
```

View 是本地静态服务，直接读取项目文件并展示实际内容，不依赖业务后端；运行 CLI 只需要 Node.js。

## 调用建议

大模型接手项目时，可以先执行：

```bash
easyvibe context --json
easyvibe status --json
easyvibe bugs --status open --json
```

再根据返回的工作流或 Step ID 查询具体规则：

```bash
easyvibe workflows . backend-feature --json
easyvibe steps . coding --json
```

CLI 和工作台属于 Easy Vibe 框架工具，不属于接入项目 `code/` 中的业务代码。
