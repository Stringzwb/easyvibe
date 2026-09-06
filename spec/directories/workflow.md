---
version: 1
kind: directory
id: workflow
name: "工作流目录规约"
status: active
summary: "约束工作流图和 Step 运行定义"
---

# 工作流目录规约

## Purpose

约束工作流图和 Step 运行定义。

## Scope

### Applies To

- /workflow/ 目录及其全部子目录

### Excludes

- 第三方依赖目录和外部系统内部路径

## Rules

### DIR-WORKFLOW-001 - 目录职责

- `level`: `MUST`
- `requirement`: 只描述工作流节点、转换、Step 运行方式、路径和完成条件。
- `verification`: 对照目录用途、文件类型和目标路径进行检查。
- `evidence`: 目录职责判定和文件路径清单。
- `on_violation`: `BLOCK`
- `exception`: 用户明确批准跨目录存放，并记录原因和迁移计划。

### DIR-WORKFLOW-002 - 目录专属安全要求

- `level`: `MUST_NOT`
- `requirement`: 强制执行、安全、目录、命名和质量规则必须引用 spec，不得在 workflow 中形成第二套规则。
- `verification`: 写入或交付前检查目录内容、敏感信息和适用外部操作。
- `evidence`: 目录内容检查和敏感信息扫描结果。
- `on_violation`: `BLOCK`
- `exception`: none

## Loading

本规约继承 `spec/custom/directory-governance/README.md`、父目录规约、项目总规约和适用 Step 规约。
