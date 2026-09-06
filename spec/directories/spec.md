---
version: 1
kind: directory
id: spec
name: "项目规约目录规约"
status: active
summary: "约束项目全部执行、目录、命名和 Step 规约的权威来源"
---

# 项目规约目录规约

## Purpose

约束项目全部执行、目录、命名和 Step 规约的权威来源。

## Scope

### Applies To

- /spec/ 目录及其全部子目录

### Excludes

- 第三方依赖目录和外部系统内部路径

## Rules

### DIR-SPEC-001 - 目录职责

- `level`: `MUST`
- `requirement`: 所有规则必须有明确 spec 入口、状态和适用范围。
- `verification`: 对照目录用途、文件类型和目标路径进行检查。
- `evidence`: 目录职责判定和文件路径清单。
- `on_violation`: `BLOCK`
- `exception`: 用户明确批准跨目录存放，并记录原因和迁移计划。

### DIR-SPEC-002 - 目录专属安全要求

- `level`: `MUST_NOT`
- `requirement`: 不得在 guide、workflow 或业务目录中创建与 spec 冲突的隐含规则。
- `verification`: 写入或交付前检查目录内容、敏感信息和适用外部操作。
- `evidence`: 目录内容检查和敏感信息扫描结果。
- `on_violation`: `BLOCK`
- `exception`: none

## Loading

本规约继承 `spec/custom/directory-governance/README.md`、父目录规约、项目总规约和适用 Step 规约。
