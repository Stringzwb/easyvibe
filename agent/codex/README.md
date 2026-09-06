# Codex 适配开发

本目录保存 Easy Vibe 的 Codex 入口适配和项目内 Skill 安装说明。通用项目规则以 `guide/` 和 `spec/` 为准。

## 发布与用户链路

Codex Skill 跟随 npm CLI 的初始化模板发布：

```text
发布 @zwbcoding/easy-vibe
  -> 用户运行 npx @zwbcoding/easy-vibe@latest init
  -> 目标项目获得 agent/codex/skills/easy-vibe
  -> 用户要求 Codex 安装项目内 Skill
```

用户完成初始化并用 Codex 打开项目根目录后，发出：

```text
请读取 agent/codex/README.md，把项目内的 easy-vibe Skill 安装到当前项目。本次只安装 Skill，不开始业务任务。
```

Codex 应把 `agent/codex/skills/easy-vibe/` 复制到 `.agents/skills/easy-vibe/`。目标已存在且内容不同时，必须报告差异并等待用户决定，不得默认覆盖。

## 开发目录边界

Easy Vibe 工具本体开发不走 Easy Vibe 项目工作流。不得对本目录运行 `easyvibe init`，也不得把本目录当作业务项目执行 Easy Vibe workflow。
