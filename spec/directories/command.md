---
version: 1
kind: directory
id: command
name: "自动化命令目录规约"
status: active
summary: "约束项目级脚本、命令入口和接口契约"
---

# 自动化命令目录规约

## Purpose

约束项目级脚本、命令入口和接口契约。

## Scope

### Applies To

- /command/ 目录及其全部子目录

### Excludes

- 第三方依赖目录和外部系统内部路径

## Rules

### DIR-COMMAND-001 - 目录职责

- `level`: `MUST`
- `requirement`: 只能保存可重复执行的脚本、脚本专用配置模板和 INTERFACE.md。
- `verification`: 对照目录用途、文件类型和目标路径进行检查。
- `evidence`: 目录职责判定和文件路径清单。
- `on_violation`: `BLOCK`
- `exception`: 用户明确批准跨目录存放，并记录原因和迁移计划。

### DIR-COMMAND-002 - 目录专属安全要求

- `level`: `MUST_NOT`
- `requirement`: 脚本不得保存明文凭证；生成的数据、制品和日志必须写入对应项目目录，部署脚本不得现场修改源码，服务脚本不得使用模糊进程匹配。
- `verification`: 写入或交付前检查目录内容、敏感信息和适用外部操作。
- `evidence`: 目录内容检查和敏感信息扫描结果。
- `on_violation`: `BLOCK`
- `exception`: none

## Loading

本规约继承 `spec/custom/directory-governance/README.md`、父目录规约、项目总规约和适用 Step 规约。
