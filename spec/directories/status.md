---
version: 1
kind: directory
id: status
name: "工作状态目录规约"
status: active
summary: "约束主任务、子任务和中断恢复事实的记录"
---

# 工作状态目录规约

## Purpose

约束主任务、子任务和中断恢复事实的记录。

## Scope

### Applies To

- /status/ 目录及其全部子目录

### Excludes

- 第三方依赖目录和外部系统内部路径

## Rules

### DIR-STATUS-001 - 目录职责

- `level`: `MUST`
- `requirement`: 只保存当前工作事实、状态、依赖、进度和验证证据；主任务与子任务必须遵守对应 CSV 格式。
- `verification`: 对照目录用途、文件类型和目标路径进行检查。
- `evidence`: 目录职责判定和文件路径清单。
- `on_violation`: `BLOCK`
- `exception`: 用户明确批准跨目录存放，并记录原因和迁移计划。

### DIR-STATUS-002 - 目录专属安全要求

- `level`: `MUST_NOT`
- `requirement`: 不得复制需求、设计、代码或测试正文；未验证产出不得标记为 completed。
- `verification`: 写入或交付前检查目录内容、敏感信息和适用外部操作。
- `evidence`: 目录内容检查和敏感信息扫描结果。
- `on_violation`: `BLOCK`
- `exception`: none

## Loading

本规约继承 `spec/custom/directory-governance/README.md`、父目录规约、项目总规约和适用 Step 规约。
