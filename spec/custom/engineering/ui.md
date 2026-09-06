---
version: 1
kind: custom
id: engineering-ui
name: "UI 与前端代码规范"
status: active
summary: "定义界面、交互和前端代码应记录的结构与验证格式，不绑定具体 UI 框架。"
---

# UI 与前端代码规范

## Purpose

统一 UI 设计说明与前端实现记录的格式，使视觉决策、交互状态、组件边界和验证证据可追踪。

## Scope

### Applies To

- 页面、组件、交互流程和视觉状态
- 前端源码、样式、资源和前端测试
- UI 设计到前端实现的对应关系

### Excludes

- 具体设计系统、前端框架和构建工具选型
- 后端接口契约和数据库物理设计

## Required Sections

UI 设计记录至少包含：目标、页面结构、视觉层级、交互状态、响应式或桌面范围、可访问性、验收证据。

前端代码记录至少包含：模块边界、状态模型、数据入口、错误与空态、样式组织、测试范围和变更路径。

## Rules

### ENG-UI-001 - 先定义视觉层级

- `level`: `MUST`
- `requirement`: 每个页面必须先说明主要内容、次要内容、操作入口和状态反馈的视觉优先级。
- `verification`: 对照页面结构和设计记录检查主要任务是否具有清晰的视觉引导。
- `evidence`: 页面截图、设计说明或验收记录。
- `on_violation`: `REVIEW`
- `exception`: 纯数据导出或无交互页面可以记录为不适用。

### ENG-UI-002 - 状态必须完整

- `level`: `MUST`
- `requirement`: 组件和页面必须定义加载、成功、空数据、错误、禁用和进行中等适用状态。
- `verification`: 检查状态模型、渲染分支和状态截图是否覆盖适用场景。
- `evidence`: 状态清单与测试结果。
- `on_violation`: `BLOCK`
- `exception`: 组件明确为静态展示且无数据源时可以省略数据状态。

### ENG-UI-003 - 前端边界清晰

- `level`: `MUST`
- `requirement`: 数据读取、状态转换、视图渲染和用户操作处理必须有可识别的模块边界，不在模板中隐藏不可追踪的业务副作用。
- `verification`: 检查模块职责、数据流和副作用入口。
- `evidence`: 模块清单、调用关系或代码审查记录。
- `on_violation`: `REVIEW`
- `exception`: 小型只读页面可以合并模块，但必须在说明中记录原因。

### ENG-UI-004 - 保持内容可读

- `level`: `MUST`
- `requirement`: 字体、颜色、间距、换行、溢出和对比度必须服务于内容阅读；技术标识可以使用代码字体，但普通标题和正文不得依赖等宽字体表达层级。
- `verification`: 在目标桌面浏览器检查各页面、长文本、空态和异常状态。
- `evidence`: 页面截图和视觉回归记录。
- `on_violation`: `BLOCK`
- `exception`: 代码片段、路径和标识符可以使用专用等宽样式。
