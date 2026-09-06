---
version: 1
kind: custom
id: directory-governance
name: "项目目录使用规约"
status: active
summary: "集中定义各项目目录的职责、允许内容、读写边界和安全要求"
---

# 项目目录使用规约

## Purpose

集中定义项目目录的职责、允许内容、读写边界和安全要求，避免把执行规则分散在各目录向导中。

## Scope

### Applies To

- 项目中由人员、Agent、CLI、工作台或自动化脚本访问的目录
- 下方目录矩阵列出的全部路径及其子路径

### Excludes

- 第三方依赖目录和外部系统内部路径

## Rules

### DIR-001 - 遵守目录职责

- `level`: `MUST`
- `requirement`: 文件只能写入与其职责匹配的目录；不确定归属时必须先询问，不得为了方便混放。
- `verification`: 对照目录矩阵检查文件用途、来源和目标路径。
- `evidence`: 文件路径与目录职责判定。
- `on_violation`: `BLOCK`
- `exception`: 用户明确批准跨目录存放，并记录原因和迁移计划。

### DIR-002 - 继承父目录约束

- `level`: `MUST`
- `requirement`: 子目录必须同时遵守本目录规约、父目录规约、项目总规约和适用 Step 规约；更具体的目录规则只能补充或收紧要求。
- `verification`: 执行前解析目标路径的父子目录规则和适用规约。
- `evidence`: 目标路径的有效规约列表。
- `on_violation`: `BLOCK`
- `exception`: none

### DIR-003 - 限制写入范围

- `level`: `MUST`
- `requirement`: 只能在当前 Step 声明的 write 路径和目录规约允许的范围内创建、修改、移动或删除内容。
- `verification`: 操作前检查路径权限，完成后核对实际变更路径。
- `evidence`: 路径判定和变更文件清单。
- `on_violation`: `BLOCK`
- `exception`: 用户明确扩大范围并记录授权、原因和影响。

### DIR-004 - 使用统一命名

- `level`: `MUST`
- `requirement`: 目录内可生成文件、目录和制品的命名必须匹配 `spec/namespec.md`；没有匹配规则时不得静默创建。
- `verification`: 创建或重命名之前匹配 path、pattern、变量、示例和冲突策略。
- `evidence`: 命名规则 ID 和名称校验结果。
- `on_violation`: `BLOCK`
- `exception`: 用户确认新增命名规则后，先更新 namespec 再创建对象。

### DIR-005 - 禁止保存敏感信息

- `level`: `MUST_NOT`
- `requirement`: 任一目录不得保存明文密码、Token、私钥或未经授权的个人和生产数据。
- `verification`: 写入、提交、打包和交付前执行敏感信息扫描并人工复核。
- `evidence`: 扫描结果和复核结论。
- `on_violation`: `BLOCK`
- `exception`: none

### DIR-006 - 规则集中维护

- `level`: `MUST`
- `requirement`: 目录职责、读写边界、安全要求和生成约束必须记录在本规约或其明确引用的 spec 中；目录 README 只做索引和简介。
- `verification`: 检查目录 README 是否指向对应 spec，以及规则是否存在于 spec。
- `evidence`: 目录到 spec 的索引映射。
- `on_violation`: `REVIEW`
- `exception`: none

## Directory Matrix

以下路径均继承 DIR-001 至 DIR-006；每个主目录的专属规则见 `spec/directories/<directory-id>.md`：

| path | directory spec |
| --- | --- |
| `/agent` | `spec/directories/agent.md` |
| `/code` | `spec/directories/code.md` |
| `/command` | `spec/directories/command.md` |
| `/data` | `spec/directories/data.md` |
| `/deploy` | `spec/directories/deploy.md` |
| `/docs` | `spec/directories/docs.md` |
| `/guide` | `spec/directories/guide.md` |
| `/spec` | `spec/directories/spec.md` |
| `/status` | `spec/directories/status.md` |
| `/view` | `spec/directories/view.md` |
| `/workflow` | `spec/directories/workflow.md` |

## Effective Rule Order

目录节点的有效约束为：

`平台安全限制 > 对话中新提出的用户安全规则 > 项目总规约 > 父目录规约 > 当前目录规约 > Step 规约`。

出现冲突时必须报告规则 ID；不得通过目录 README、临时说明或默认习惯静默放宽限制。
