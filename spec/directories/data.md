---
version: 1
kind: directory
id: data
name: "项目数据目录规约"
status: active
summary: "约束临时资源、下载内容和数据集的存放与生命周期"
---

# 项目数据目录规约

## Purpose

约束临时资源、下载内容和数据集的存放与生命周期。

## Scope

### Applies To

- /data/ 目录及其全部子目录

### Excludes

- 第三方依赖目录和外部系统内部路径

## Rules

### DIR-DATA-001 - 目录职责

- `level`: `MUST`
- `requirement`: 按 static、downloads、datasets 的职责选择唯一存放位置。
- `verification`: 对照目录用途、文件类型和目标路径进行检查。
- `evidence`: 目录职责判定和文件路径清单。
- `on_violation`: `BLOCK`
- `exception`: 用户明确批准跨目录存放，并记录原因和迁移计划。

### DIR-DATA-002 - 目录专属安全要求

- `level`: `MUST_NOT`
- `requirement`: 不得保存源代码、项目文档、部署制品、密码、Token 或私钥；原始数据默认不得原地覆盖。
- `verification`: 写入或交付前检查目录内容、敏感信息和适用外部操作。
- `evidence`: 目录内容检查和敏感信息扫描结果。
- `on_violation`: `BLOCK`
- `exception`: none

## Loading

本规约继承 `spec/custom/directory-governance/README.md`、父目录规约、项目总规约和适用 Step 规约。
