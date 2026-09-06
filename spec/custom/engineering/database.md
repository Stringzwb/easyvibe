---
version: 1
kind: custom
id: engineering-database
name: "数据库设计规范"
status: active
summary: "定义数据模型、约束、迁移和查询验证的格式，不绑定具体数据库产品。"
---

# 数据库设计规范

## Purpose

统一数据库设计说明的结构，使实体关系、约束、迁移、访问模式和验证证据可审查、可演进。

## Scope

### Applies To

- 实体、字段、关系、索引和约束
- Schema、迁移、初始化和回滚记录
- 查询、事务、数据生命周期和备份恢复说明

### Excludes

- 具体数据库产品和部署拓扑选型
- 未经确认的业务字段和生产数据

## Required Sections

数据库设计记录至少包含：业务对象、字段字典、主键策略、关系、约束、索引依据、数据生命周期、迁移与回滚、访问模式和验证 SQL 或等价证据。

## Rules

### ENG-DB-001 - 先定义数据语义

- `level`: `MUST`
- `requirement`: 每个实体和字段必须有业务语义、类型约束、是否可空、默认行为和生命周期说明。
- `verification`: 检查字段字典与业务需求、接口输入输出的一致性。
- `evidence`: 数据字典、映射表或评审记录。
- `on_violation`: `BLOCK`
- `exception`: 临时实验字段必须标记 owner、用途和清理条件。

### ENG-DB-002 - 约束优先于约定

- `level`: `MUST`
- `requirement`: 能由数据层表达的唯一性、引用完整性、非空和范围约束应明确记录，不只依赖应用层约定。
- `verification`: 检查约束设计、并发场景和应用层兜底逻辑。
- `evidence`: Schema 定义、迁移文件和验证结果。
- `on_violation`: `REVIEW`
- `exception`: 受技术限制无法下沉时记录原因和替代校验位置。

### ENG-DB-003 - 迁移可回退

- `level`: `MUST`
- `requirement`: 结构或数据迁移必须说明前置条件、执行顺序、兼容窗口、验证方式和回滚或补偿策略。
- `verification`: 在隔离环境执行迁移并验证升级、回滚和重复执行行为。
- `evidence`: 迁移日志、验证 SQL、回滚结果或风险确认。
- `on_violation`: `BLOCK`
- `exception`: 不可逆迁移必须经过明确的用户或发布负责人确认，并记录不可逆原因。
