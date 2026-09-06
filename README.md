# Easy Vibe

> 将项目事实、执行规约和 Coding Agent 上下文组织成一个可读取、可恢复、可审计的工作空间。

[![npm version](https://img.shields.io/npm/v/%40zwbcoding%2Feasy-vibe?color=cb3837&logo=npm)](https://www.npmjs.com/package/@zwbcoding/easy-vibe)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Easy Vibe 是一套面向人员和 Coding Agent 的项目工作空间约定，同时提供 CLI 和本地可视化工作台。它不绑定具体业务技术栈，而是把代码、文档、数据、规约、任务状态、自动化命令和部署信息放到职责明确的位置。

## 为什么使用 Easy Vibe

- **事实可查**：项目状态、工作流、Step、文档和 Bug 都有固定入口，Agent 不需要猜目录含义。
- **任务可恢复**：`status/` 保存主工作、子任务、当前任务和下一步，适合中断后继续工作。
- **边界可审计**：`spec/`、`workflow/` 和 `deploy/safe.json` 定义执行格式、路径边界和安全准则。
- **开箱即用**：CLI 初始化时直接复制预构建 View dist，不需要用户安装 Vue、Vite 或业务后端。

## 快速开始

### 安装 CLI

```bash
npm install --global @zwbcoding/easy-vibe
```

### 初始化项目

```bash
easyvibe init ./my-project --accept-safety
```

`init` 会创建缺失的 Easy Vibe 目录和管理文件，保留已有文件，并复制本地工作台：

```text
my-project/
├── view/index.html
└── view/assets/
    ├── index-*.js
    └── index-*.css
```

CLI 发布包只携带预构建的 `view/index.html` 和 `view/assets/*`，不携带 `view-src`、Vue 单文件组件、构建源码或 `node_modules`。

### 打开工作台

```bash
easyvibe view ./my-project
```

工作台通过本地静态服务读取项目真实文件，默认使用 `4173` 端口并尝试打开浏览器。它不连接业务后端；运行 CLI 只需要 Node.js。

### 让 Agent 读取项目上下文

```bash
easyvibe context ./my-project --json
easyvibe status ./my-project --json
easyvibe specs ./my-project engineering-ui --json
```

## CLI 命令

| 命令 | 用途 |
| --- | --- |
| `easyvibe init [项目路径] [--accept-safety]` | 初始化或识别 Easy Vibe 项目 |
| `easyvibe view [项目路径] [--port <端口>] [--no-open]` | 启动本地只读工作台 |
| `easyvibe info [项目路径] [--json]` | 查询项目标记、Agent 入口和核心文件 |
| `easyvibe status [项目路径] [--json]` | 查询主工作、子任务和恢复信息 |
| `easyvibe workflows [项目路径] [工作流ID] [--json]` | 查询工作流和节点转换条件 |
| `easyvibe steps [项目路径] [Step ID] [--json]` | 查询 Step、路径权限和安全级别 |
| `easyvibe docs [项目路径] [--json]` | 查询项目文档索引 |
| `easyvibe bugs [项目路径] [--json]` | 查询 Bug 索引并支持筛选 |
| `easyvibe context [项目路径] [--json]` | 汇总适合 Agent 快速读取的上下文 |
| `easyvibe specs [项目路径] [规范ID] [--json]` | 查询工程规范和领域规范 |

查询命令默认只读；追加 `--json` 可输出稳定的机器可读结果。`specs` 支持 `spec`、`standards` 别名，以及：

- `engineering`：工程规范目录
- `engineering-ui`：UI 与前端代码规范
- `engineering-backend`：后端代码规范
- `engineering-database`：数据库设计规范

## 工作空间结构

```text
.
├── agent/       Coding Agent 入口适配
├── code/        业务代码与代码相关测试
├── command/     项目级数据、部署和服务命令
├── data/        数据集、下载内容和临时静态资源
├── deploy/      部署、环境、安全索引和运行时信息
├── docs/        需求、设计、测试、会议、记录和 Bug 文档
├── guide/       人员与 Agent 的接入向导
├── spec/        总规约、命名规约、Step 规约和专项规约
├── status/      主工作、子任务和中断恢复状态
├── view/        可直接运行的本地工作台 dist
└── workflow/    工作流与可复用 Step 定义
```

### 推荐阅读顺序

1. 阅读本文件，确认项目目录职责。
2. 阅读 [`guide/README.md`](guide/README.md)，进入 Agent 接入向导。
3. 阅读 [`spec/general.md`](spec/general.md)、[`spec/namespec.md`](spec/namespec.md) 和当前任务适用的专项规约。
4. 阅读 `status/works.csv` 与对应的 `status/work/<work-id>.csv`。
5. 根据任务范围读取 `docs/`、`code/`、`data/`、`deploy/` 或 `workflow/`。

## 工程规范

工程规范位于 [`spec/custom/engineering/`](spec/custom/engineering/)，使用多个文件表达不同领域的格式要求：

- [`README.md`](spec/custom/engineering/README.md)：规范目录和使用方式
- [`ui.md`](spec/custom/engineering/ui.md)：UI 设计与前端代码规范
- [`backend.md`](spec/custom/engineering/backend.md)：后端代码规范
- [`database.md`](spec/custom/engineering/database.md)：数据库设计规范

这些规范定义记录格式、边界和验证方式，不固定具体框架、语言、数据库或部署平台。`guide/` 会引导 Agent 在实现前读取适用规范。

## 开发

### 构建 View

View 的 Vue + Vite 源码位于 `view-src/`，开发时可运行：

```bash
cd view-src
npm install
npm run dev
```

发布前构建：

```bash
npm run build
```

构建结果应同步到 `view/` 和 `cli/easy-vibe/template/view/`。这两个目录只保存可发布的 `index.html` 与 `assets/`，不要提交 `view-src/node_modules/`。

### 测试 CLI

```bash
cd cli/easy-vibe
npm test
npm pack --dry-run
```

打包审计应确认 npm 包不包含 `.git`、`view-src`、`.vue`、源码 `src/` 或 `node_modules`。

## 安全边界

- 不将密码、Token、私钥或其他凭证写入仓库。
- 环境文件只保存非敏感元数据或 `credentialRef`。
- 初始化前应阅读 `deploy/safe.json`；非交互环境使用 `--accept-safety` 表示明确确认。
- CLI 查询命令不会修改项目文件、连接外部业务系统或自动修复缺失内容。

## 相关文档

- [`guide/README.md`](guide/README.md)：项目接入和 Agent 向导
- [`cli/README.md`](cli/README.md)：CLI 能力与查询命令
- [`view/README.md`](view/README.md)：本地工作台说明
- [`spec/README.md`](spec/README.md)：规约体系说明
- [`workflow/README.md`](workflow/README.md)：工作流说明

## License

[MIT](LICENSE)
