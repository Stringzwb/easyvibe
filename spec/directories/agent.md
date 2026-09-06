---
version: 1
kind: directory
id: agent
name: "Agent 入口目录规约"
status: active
summary: "约束不同 Coding Agent 的入口适配和专属上下文文件"
---

# Agent 入口目录规约

## Purpose

约束不同 Coding Agent 的入口适配和专属上下文文件。

## Scope

### Applies To

- /agent/ 目录及其全部子目录

### Excludes

- 第三方依赖目录和外部系统内部路径

## Rules

### DIR-AGENT-001 - 目录职责

- `level`: `MUST`
- `requirement`: 只保存 Agent 入口、适配说明和专属 Skill 源码。
- `verification`: 对照目录用途、文件类型和目标路径进行检查。
- `evidence`: 目录职责判定和文件路径清单。
- `on_violation`: `BLOCK`
- `exception`: 用户明确批准跨目录存放，并记录原因和迁移计划。

### DIR-AGENT-002 - 目录专属安全要求

- `level`: `MUST_NOT`
- `requirement`: 不得保存业务代码、项目通用事实或敏感凭证。
- `verification`: 写入或交付前检查目录内容、敏感信息和适用外部操作。
- `evidence`: 目录内容检查和敏感信息扫描结果。
- `on_violation`: `BLOCK`
- `exception`: none

## Loading

本规约继承 `spec/custom/directory-governance/README.md`、父目录规约、项目总规约和适用 Step 规约。
