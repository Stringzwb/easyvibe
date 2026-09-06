---
version: 1
kind: custom
id: engineering-backend
name: "后端代码规范"
status: active
summary: "定义后端模块、接口、错误处理和验证证据的格式，不绑定具体后端语言或框架。"
---

# 后端代码规范

## Purpose

统一后端服务的模块职责、输入输出、错误边界、可观测性和测试记录格式。

## Scope

### Applies To

- 服务、模块、任务和后台作业
- API、事件、命令和内部调用契约
- 后端测试、日志、指标和错误处理

### Excludes

- 具体语言、框架、消息系统或云服务选型
- 数据库表的具体字段定义

## Required Sections

后端设计记录至少包含：职责、输入、输出、状态变化、依赖、错误模型、安全边界、可观测性、测试和回滚影响。

## Rules

### ENG-BE-001 - 明确模块职责

- `level`: `MUST`
- `requirement`: 每个后端模块必须有单一可说明的职责、输入边界和输出边界。
- `verification`: 检查模块说明、调用关系和依赖列表。
- `evidence`: 模块设计记录或代码审查结果。
- `on_violation`: `REVIEW`
- `exception`: 兼容旧模块时记录拆分计划和暂不拆分原因。

### ENG-BE-002 - 定义错误模型

- `level`: `MUST`
- `requirement`: 每个外部可观察的接口或任务必须定义可识别的错误类别、处理策略和对调用方的影响。
- `verification`: 检查正常、异常、超时、重试和部分成功场景。
- `evidence`: 错误场景测试和接口契约。
- `on_violation`: `BLOCK`
- `exception`: 内部实验性代码可以标记为 draft，但不得直接作为交付接口。

### ENG-BE-003 - 副作用可追踪

- `level`: `MUST`
- `requirement`: 写入、发送、删除、外部调用等副作用必须有权限边界、幂等或重复执行策略，以及可定位的日志或验证证据。
- `verification`: 检查副作用入口、失败处理和重复执行行为。
- `evidence`: 测试结果、日志字段或运行记录。
- `on_violation`: `BLOCK`
- `exception`: 用户明确接受的不可逆操作必须单独记录授权和回滚限制。
