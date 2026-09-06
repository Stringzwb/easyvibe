# view

Easy Vibe 的只读项目状态可视化工作台。它固定读取 `view/index.html` 所在项目的上一级目录，从 `guide/`、`spec/`、`workflow/`、`status/`、`docs/` 和 `deploy/safe.json` 提取结构化事实，把项目文件中的结构转换为可视化的开发总览。

`view/` 是 `view-src/` 的 Vue 3 + Vite 构建产物。使用者不需要安装 Vue、Vite 或项目业务后端；通过 `easyvibe view` 或任意支持目录索引的本地静态服务器即可打开。

## 视图

- `总览`：结构健康、开发进度、当前工作、交付流程、风险和证据覆盖。
- `向导`：根据 `guide/README.md` 生成 Agent 接入路径和权威入口关系。
- `工作流`：根据工作流 JSON 展示节点状态、Step 检视和转换条件。
- `规则`：根据 `spec/` 规则标题与 Front Matter 展示优先级、规则层级、级别和安全原则。
- `工程规范`：展示 `spec/custom/engineering/` 的目录说明、领域文件和加载方式。
- `状态`：根据 `status/works.csv` 及子任务 CSV 展示工作泳道、任务依赖、进度和验证完整度。
- `目录`：只展示目录职责、存在性和文件数量；文档、部署、数据、命令等不进入正文阅读。

页面固定读取当前 `view/` 目录上一级的项目根目录，不提供项目选择、目录句柄保存、创建、编辑、删除、文件预览或项目内容写回。启动工作台只要求 `view/index.html` 存在，不依赖 `.easyvibe.json`；项目标记由 CLI 用于识别 Easy Vibe 项目，不属于工作台数据源，也不会影响工作台健康度。刷新按钮和 20 秒轮询会重新读取外部文件，页面通过 hash 保留当前视图。工程规范也可以通过 `easyvibe specs [项目路径] [规范ID]` 查询。

## 本地运行

工作台不依赖业务后端，数据直接由浏览器读取项目文件；但浏览器的 `file://` 安全策略不允许页面跨目录读取这些文件，因此仍需一个本地静态服务承载页面。启动方式：

```bash
cd /path/to/project
python3 -m http.server 4173
```

然后打开 `http://127.0.0.1:4173/view/`。页面会自动读取与 `view/index.html` 同一项目中的固定文件，不需要选择目录。

页面默认使用亮色主题，可通过右上角按钮切换暗色主题；主题偏好会保存在当前浏览器中。

完整 UI 设计见 [`docs/design/UID-project-state-dashboard-20260905.md`](../docs/design/UID-project-state-dashboard-20260905.md)。
