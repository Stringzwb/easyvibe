---
version: 1
kind: directory
id: docs
name: "项目文档目录规约"
status: active
summary: "约束需求、设计、测试、会议、记录和 Bug 文档"
---

# 项目文档目录规约

## Purpose

约束需求、设计、测试、会议、记录和 Bug 文档。

## Scope

### Applies To

- /docs/ 目录及其全部子目录

### Excludes

- 第三方依赖目录和外部系统内部路径

## Rules

### DIR-DOCS-001 - 目录职责

- `level`: `MUST`
- `requirement`: 文档必须按 demand、design、test、meet、record、bug 分类存放，并遵守 namespec。
- `verification`: 对照目录用途、文件类型和目标路径进行检查。
- `evidence`: 目录职责判定和文件路径清单。
- `on_violation`: `BLOCK`
- `exception`: 用户明确批准跨目录存放，并记录原因和迁移计划。

### DIR-DOCS-002 - 目录专属安全要求

- `level`: `MUST_NOT`
- `requirement`: 不得把代码、凭证、未授权生产数据或构建制品写入文档目录。
- `verification`: 写入或交付前检查目录内容、敏感信息和适用外部操作。
- `evidence`: 目录内容检查和敏感信息扫描结果。
- `on_violation`: `BLOCK`
- `exception`: none

## Loading

本规约继承 `spec/custom/directory-governance/README.md`、父目录规约、项目总规约和适用 Step 规约。
