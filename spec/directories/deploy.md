---
version: 1
kind: directory
id: deploy
name: "部署运维目录规约"
status: active
summary: "约束环境信息、制品、运行时和部署日志"
---

# 部署运维目录规约

## Purpose

约束环境信息、制品、运行时和部署日志。

## Scope

### Applies To

- /deploy/ 目录及其全部子目录

### Excludes

- 第三方依赖目录和外部系统内部路径

## Rules

### DIR-DEPLOY-001 - 目录职责

- `level`: `MUST`
- `requirement`: 环境只保存非敏感元数据和 credentialRef，制品必须来源和版本明确，日志必须脱敏。
- `verification`: 对照目录用途、文件类型和目标路径进行检查。
- `evidence`: 目录职责判定和文件路径清单。
- `on_violation`: `BLOCK`
- `exception`: 用户明确批准跨目录存放，并记录原因和迁移计划。

### DIR-DEPLOY-002 - 目录专属安全要求

- `level`: `MUST_NOT`
- `requirement`: 不得保存明文凭证、源码缓存或未经授权的生产连接信息；生产操作必须先确认目标和影响。
- `verification`: 写入或交付前检查目录内容、敏感信息和适用外部操作。
- `evidence`: 目录内容检查和敏感信息扫描结果。
- `on_violation`: `BLOCK`
- `exception`: none

## Loading

本规约继承 `spec/custom/directory-governance/README.md`、父目录规约、项目总规约和适用 Step 规约。
