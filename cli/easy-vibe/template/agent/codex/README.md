# Codex 适配

本项目已由 Easy Vibe CLI 初始化。`agent/codex/skills/easy-vibe/` 是随项目交付的 Codex Skill 源码，它尚未安装，Codex 不会从本目录自动发现它。

## 请 Codex 安装

在 Codex 中发出：

```text
请读取 agent/codex/README.md，把项目内的 easy-vibe Skill
安装到当前项目。本次只安装 Skill，不开始业务任务。
```

Codex 应执行以下操作：

1. 确认当前根目录包含有效的 `.easyvibe.json`。
2. 检查 `agent/codex/skills/easy-vibe/SKILL.md` 存在。
3. 把完整的 `agent/codex/skills/easy-vibe/` 复制到 `.agents/skills/easy-vibe/`。
4. 检查目标 `SKILL.md` 和其引用的文件完整。
5. 告知用户安装位置，并提醒新建 Codex 会话。

如果 `.agents/skills/easy-vibe/` 已存在：

- 内容一致时，报告已安装，不重复写入。
- 内容不同时，先报告差异，等待用户决定是否更新，不得默认覆盖。

## 安装后使用

新建 Codex 会话后，用户可直接描述项目任务，也可显式调用：

```text
$easy-vibe 恢复当前项目工作
```
