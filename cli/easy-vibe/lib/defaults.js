const sharedSafety = {
  inherits: "/deploy/safe.json",
  precedence: "conversation-user-rules > project-general-rules > step-rules"
};

const DIRECTORY_GOVERNANCE_SPEC = `---
version: 1
kind: custom
id: directory-governance
name: "项目目录使用规约"
status: active
summary: "集中定义各项目目录的职责、允许内容、读写边界和安全要求"
---

# 项目目录使用规约

## Purpose

集中定义项目目录的职责、允许内容、读写边界和安全要求，避免把执行规则分散在各目录向导中。

## Scope

### Applies To

- 项目中由人员、Agent、CLI、工作台或自动化脚本访问的目录
- 下方目录矩阵列出的全部路径及其子路径

### Excludes

- 第三方依赖目录和外部系统内部路径

## Rules

### DIR-001 - 遵守目录职责

- \`level\`: \`MUST\`
- \`requirement\`: 文件只能写入与其职责匹配的目录；不确定归属时必须先询问，不得为了方便混放。
- \`verification\`: 对照目录矩阵检查文件用途、来源和目标路径。
- \`evidence\`: 文件路径与目录职责判定。
- \`on_violation\`: \`BLOCK\`
- \`exception\`: 用户明确批准跨目录存放，并记录原因和迁移计划。

### DIR-002 - 继承父目录约束

- \`level\`: \`MUST\`
- \`requirement\`: 子目录必须同时遵守本目录规约、父目录规约、项目总规约和适用 Step 规约；更具体的目录规则只能补充或收紧要求。
- \`verification\`: 执行前解析目标路径的父子目录规则和适用规约。
- \`evidence\`: 目标路径的有效规约列表。
- \`on_violation\`: \`BLOCK\`
- \`exception\`: none

### DIR-003 - 限制写入范围

- \`level\`: \`MUST\`
- \`requirement\`: 只能在当前 Step 声明的 write 路径和目录规约允许的范围内创建、修改、移动或删除内容。
- \`verification\`: 操作前检查路径权限，完成后核对实际变更路径。
- \`evidence\`: 路径判定和变更文件清单。
- \`on_violation\`: \`BLOCK\`
- \`exception\`: 用户明确扩大范围并记录授权、原因和影响。

### DIR-004 - 使用统一命名

- \`level\`: \`MUST\`
- \`requirement\`: 目录内可生成文件、目录和制品的命名必须匹配 \`spec/namespec.md\`；没有匹配规则时不得静默创建。
- \`verification\`: 创建或重命名之前匹配 path、pattern、变量、示例和冲突策略。
- \`evidence\`: 命名规则 ID 和名称校验结果。
- \`on_violation\`: \`BLOCK\`
- \`exception\`: 用户确认新增命名规则后，先更新 namespec 再创建对象。

### DIR-005 - 禁止保存敏感信息

- \`level\`: \`MUST_NOT\`
- \`requirement\`: 任一目录不得保存明文密码、Token、私钥或未经授权的个人和生产数据。
- \`verification\`: 写入、提交、打包和交付前执行敏感信息扫描并人工复核。
- \`evidence\`: 扫描结果和复核结论。
- \`on_violation\`: \`BLOCK\`
- \`exception\`: none

### DIR-006 - 规则集中维护

- \`level\`: \`MUST\`
- \`requirement\`: 目录职责、读写边界、安全要求和生成约束必须记录在本规约或其明确引用的 spec 中；目录 README 只做索引和简介。
- \`verification\`: 检查目录 README 是否指向对应 spec，以及规则是否存在于 spec。
- \`evidence\`: 目录到 spec 的索引映射。
- \`on_violation\`: \`REVIEW\`
- \`exception\`: none

## Directory Matrix

以下路径均继承 DIR-001 至 DIR-006；每个主目录的专属规则见 \`spec/directories/<directory-id>.md\`：

| path | directory spec |
| --- | --- |
| \`/agent\` | \`spec/directories/agent.md\` |
| \`/code\` | \`spec/directories/code.md\` |
| \`/command\` | \`spec/directories/command.md\` |
| \`/data\` | \`spec/directories/data.md\` |
| \`/deploy\` | \`spec/directories/deploy.md\` |
| \`/docs\` | \`spec/directories/docs.md\` |
| \`/guide\` | \`spec/directories/guide.md\` |
| \`/spec\` | \`spec/directories/spec.md\` |
| \`/status\` | \`spec/directories/status.md\` |
| \`/view\` | \`spec/directories/view.md\` |
| \`/workflow\` | \`spec/directories/workflow.md\` |

## Effective Rule Order

目录节点的有效约束为：

\`平台安全限制 > 对话中新提出的用户安全规则 > 项目总规约 > 父目录规约 > 当前目录规约 > Step 规约\`。

出现冲突时必须报告规则 ID；不得通过目录 README、临时说明或默认习惯静默放宽限制。
`;

const DIRECTORY_SPECS = [
  ["agent", "Agent 入口目录规约", "约束不同 Coding Agent 的入口适配和专属上下文文件。", ["只保存 Agent 入口、适配说明和专属 Skill 源码。", "不得保存业务代码、项目通用事实或敏感凭证。"]],
  ["code", "业务代码目录规约", "约束项目业务源码、代码测试和正式资源的存放。", ["业务源码、与代码紧密绑定的测试和正式资源只能放在本目录。", "不得保存项目文档、下载原始数据、部署制品、环境凭证或运维日志。"]],
  ["command", "自动化命令目录规约", "约束项目级脚本、命令入口和接口契约。", ["只能保存可重复执行的脚本、脚本专用配置模板和 INTERFACE.md。", "脚本不得保存明文凭证；生成的数据、制品和日志必须写入对应项目目录，部署脚本不得现场修改源码，服务脚本不得使用模糊进程匹配。"]],
  ["data", "项目数据目录规约", "约束临时资源、下载内容和数据集的存放与生命周期。", ["按 static、downloads、datasets 的职责选择唯一存放位置。", "不得保存源代码、项目文档、部署制品、密码、Token 或私钥；原始数据默认不得原地覆盖。"]],
  ["deploy", "部署运维目录规约", "约束环境信息、制品、运行时和部署日志。", ["环境只保存非敏感元数据和 credentialRef，制品必须来源和版本明确，日志必须脱敏。", "不得保存明文凭证、源码缓存或未经授权的生产连接信息；生产操作必须先确认目标和影响。"]],
  ["docs", "项目文档目录规约", "约束需求、设计、测试、会议、记录和 Bug 文档。", ["文档必须按 demand、design、test、meet、record、bug 分类存放，并遵守 namespec。", "不得把代码、凭证、未授权生产数据或构建制品写入文档目录。"]],
  ["guide", "项目向导目录规约", "约束人员和 Agent 接入项目时使用的导航索引。", ["只提供读取顺序、权威入口和简短执行提示。", "不得复制或新增执行、安全、目录、命名和 Step 规则正文；规则必须链接到 spec。"]],
  ["spec", "项目规约目录规约", "约束项目全部执行、目录、命名和 Step 规约的权威来源。", ["所有规则必须有明确 spec 入口、状态和适用范围。", "不得在 guide、workflow 或业务目录中创建与 spec 冲突的隐含规则。"]],
  ["status", "工作状态目录规约", "约束主任务、子任务和中断恢复事实的记录。", ["只保存当前工作事实、状态、依赖、进度和验证证据；主任务与子任务必须遵守对应 CSV 格式。", "不得复制需求、设计、代码或测试正文；未验证产出不得标记为 completed。"]],
  ["view", "本地工作台目录规约", "约束 Easy Vibe 本地静态工作台资源。", ["只保存本地工作台的 HTML、CSS 和 JavaScript。", "不得保存业务前端、业务数据、凭证或依赖远程服务的项目事实。"]],
  ["workflow", "工作流目录规约", "约束工作流图和 Step 运行定义。", ["只描述工作流节点、转换、Step 运行方式、路径和完成条件。", "强制执行、安全、目录、命名和质量规则必须引用 spec，不得在 workflow 中形成第二套规则。"]]
];

function renderDirectorySpec([id, name, summary, rules]) {
  const upper = id.toUpperCase();
  const frontMatterSummary = summary.replace(/[。.]$/, "");
  return `---\nversion: 1\nkind: directory\nid: ${id}\nname: "${name}"\nstatus: active\nsummary: "${frontMatterSummary}"\n---\n\n# ${name}\n\n## Purpose\n\n${summary}\n\n## Scope\n\n### Applies To\n\n- /${id}/ 目录及其全部子目录\n\n### Excludes\n\n- 第三方依赖目录和外部系统内部路径\n\n## Rules\n\n### DIR-${upper}-001 - 目录职责\n\n- \`level\`: \`MUST\`\n- \`requirement\`: ${rules[0]}\n- \`verification\`: 对照目录用途、文件类型和目标路径进行检查。\n- \`evidence\`: 目录职责判定和文件路径清单。\n- \`on_violation\`: \`BLOCK\`\n- \`exception\`: 用户明确批准跨目录存放，并记录原因和迁移计划。\n\n### DIR-${upper}-002 - 目录专属安全要求\n\n- \`level\`: \`MUST_NOT\`\n- \`requirement\`: ${rules[1]}\n- \`verification\`: 写入或交付前检查目录内容、敏感信息和适用外部操作。\n- \`evidence\`: 目录内容检查和敏感信息扫描结果。\n- \`on_violation\`: \`BLOCK\`\n- \`exception\`: none\n\n## Loading\n\n本规约继承 \`spec/custom/directory-governance/README.md\`、父目录规约、项目总规约和适用 Step 规约。\n`;
}

export const DEFAULT_STEPS = [
  {
    id: "project-info-approval",
    name: "项目基本信息核准",
    description: "在项目工作开始前核准项目名称，并为所有可生成文档建立经用户确认的命名规范。",
    riskLevel: "low",
    paths: {
      read: ["/README.md", "/docs", "/deploy", "/spec", "/workflow", "/status"],
      write: ["/README.md", "/spec/namespec.md", "/status"]
    },
    inputs: ["用户确认的项目名称", "现有目录、工作流和可能生成的文档类型", "已有命名规约和固定管理文件"],
    activities: ["向用户确认项目的正式名称及其适用范围", "盘点项目中会由人员、Agent、CLI 或自动化生成的文档类型与目录", "逐类提出文件名模式、变量、冲突处理和固定文件例外", "经用户确认后将项目名称和命名规约记录到规定位置"],
    outputs: ["README.md 中已确认的项目名称", "spec/namespec.md 中覆盖全部可生成文档的命名规约", "status/ 中的核准记录"],
    completion: ["用户已明确确认项目正式名称", "所有可生成文档类型均已纳入命名规则或明确排除理由", "命名规则已写入 spec/namespec.md 且符合规约格式"],
    safety: ["不得从项目名称、示例名称或命名记录中写入真实凭证和不必要的个人信息", "必须先获得用户确认，才可以改写项目名称或命名规约"],
    rules: [
      rule("STP-PROJECT-INFO-APPROVAL-001", "确认项目名称", "MUST", "开始后续项目工作前必须向用户确认项目的正式名称，并将确认结果记录在 README.md。", "核对用户确认记录与 README.md 中的项目名称。", "项目名称确认记录和 README.md 路径。", "BLOCK"),
      rule("STP-PROJECT-INFO-APPROVAL-002", "盘点可生成文档", "MUST", "必须盘点当前项目工作流、Step 和目录中可能由人员、Agent、CLI 或自动化生成的全部文档类型，并逐类确定命名处理方式。", "对照 workflow、Step 输出、docs/ 和 deploy/ 目录审查文档类型清单。", "文档类型清单及每类处理结论。", "BLOCK"),
      rule("STP-PROJECT-INFO-APPROVAL-003", "确认命名规范", "MUST", "每类可生成文档的命名模式、变量、冲突处理和固定管理文件例外必须获得用户明确确认。", "核对每条拟定命名规则与用户确认记录。", "用户确认记录和命名规则清单。", "BLOCK"),
      rule("STP-PROJECT-INFO-APPROVAL-004", "记录命名规范", "MUST", "经确认的文档命名规范必须写入 spec/namespec.md，并符合项目命名规约定义的格式。", "检查 namespec 的规则字段、路径覆盖范围、示例和格式有效性。", "更新后的 spec/namespec.md 路径和校验结果。", "BLOCK"),
      rule("STP-PROJECT-INFO-APPROVAL-005", "保护命名记录", "MUST_NOT", "项目名称、命名示例和核准记录中不得包含真实凭证、不必要的个人信息或生产敏感数据。", "检查 README.md、namespec 和状态记录中的敏感内容。", "敏感信息检查结果。", "BLOCK")
    ]
  },
  {
    id: "demand-design",
    name: "需求设计",
    description: "把用户目标整理为边界明确、可实现、可验收的需求。",
    riskLevel: "low",
    paths: {
      read: ["/README.md", "/guide", "/docs", "/status", "/code"],
      write: ["/docs/demand", "/status"]
    },
    inputs: ["用户目标与约束", "已有需求、代码和工作状态"],
    activities: ["澄清目标、角色与场景", "定义包含范围、非目标、依赖和风险", "编写可客观验证的验收条件"],
    outputs: ["docs/demand/ 下的需求说明", "status/ 中的工作进展"],
    completion: ["范围和非目标明确", "验收条件可测试", "影响实现的未决事项已显式记录"],
    safety: ["需求文档不得记录真实凭证或不必要的个人敏感信息", "只写入需求文档和任务状态目录"],
    rules: [
      rule("STP-DEMAND-DESIGN-001", "明确范围", "MUST", "需求必须说明目标、包含范围和非目标。", "检查需求文档的目标与范围章节。", "需求文档路径。", "BLOCK"),
      rule("STP-DEMAND-DESIGN-002", "定义验收条件", "MUST", "进入实现的需求必须包含可客观验证的验收条件。", "逐项判断验收条件能否通过测试、检查或评审得出结论。", "验收条件列表。", "BLOCK"),
      rule("STP-DEMAND-DESIGN-003", "保护敏感信息", "MUST_NOT", "需求、示例和测试数据说明中不得写入真实凭证或非必要个人敏感信息。", "检查文档中的凭证、身份和生产数据。", "敏感信息检查结果。", "BLOCK"),
      rule("STP-DEMAND-DESIGN-004", "记录未决事项", "MUST", "影响范围、实现、安全或验收的问题必须显式记录。", "检查假设、依赖、风险和未决问题。", "未决事项列表或无未决事项结论。", "REVIEW")
    ]
  },
  {
    id: "ui-design",
    name: "UI 设计",
    description: "把需求转换为清晰、可访问、可实现的界面与交互设计。",
    riskLevel: "low",
    paths: {
      read: ["/docs/demand", "/docs/design", "/code", "/data/static", "/guide", "/status"],
      write: ["/docs/design", "/data/static", "/status"]
    },
    inputs: ["已确认需求", "已有设计系统、界面实现和品牌资源"],
    activities: ["设计信息架构和关键状态", "定义交互、响应式与可访问性要求", "记录组件、视觉资源和实现说明"],
    outputs: ["docs/design/ 下的 UI 设计说明", "必要的临时设计资源", "status/ 中的工作进展"],
    completion: ["正常、空、加载、错误和权限状态已覆盖", "响应式与无障碍要求明确", "设计可以被开发和测试直接使用"],
    safety: ["原型和截图不得暴露真实用户、凭证或生产数据", "未经用户允许不得把项目内容上传到外部设计服务"],
    rules: [
      rule("STP-UI-DESIGN-001", "覆盖关键界面状态", "MUST", "设计必须覆盖主要流程及其加载、空、错误和权限受限状态。", "对照需求场景检查页面和状态清单。", "界面状态清单。", "BLOCK"),
      rule("STP-UI-DESIGN-002", "满足可访问性", "MUST", "设计必须说明键盘操作、焦点、对比度和语义信息等可访问性要求。", "执行设计可访问性评审。", "可访问性检查结论。", "REVIEW"),
      rule("STP-UI-DESIGN-003", "禁止泄露真实数据", "MUST_NOT", "原型、截图、示例内容和设计资源中不得包含真实凭证或未经授权的用户数据。", "检查设计文档和资源中的示例数据。", "敏感信息检查结果。", "BLOCK"),
      rule("STP-UI-DESIGN-004", "限制外部上传", "MUST_NOT", "未经用户明确同意不得把项目文件、截图或数据上传到外部设计和生成服务。", "核对外部工具调用和用户授权。", "外部服务使用记录或 none。", "BLOCK")
    ]
  },
  {
    id: "research",
    name: "调研",
    description: "通过可追溯资料和受控验证降低需求与技术决策的不确定性。",
    riskLevel: "medium",
    paths: {
      read: ["/README.md", "/guide", "/docs", "/code", "/data", "/deploy/info", "/status"],
      write: ["/docs/design", "/docs/record", "/status"]
    },
    inputs: ["调研问题和决策目标", "现有实现、文档和约束"],
    activities: ["拆分待验证问题", "查阅权威来源并记录版本和日期", "比较选项、验证关键假设并形成建议"],
    outputs: ["调研记录、来源和结论", "可执行的建议与待验证风险"],
    completion: ["关键结论均有来源或实验依据", "事实、推断和建议清楚区分", "限制条件与未知项已记录"],
    safety: ["不得进行未授权扫描、探测或访问", "不得把私有代码、数据或配置发送给未授权外部服务"],
    rules: [
      rule("STP-RESEARCH-001", "保持来源可追溯", "MUST", "关键事实必须记录来源、访问日期以及适用的版本或环境。", "抽查结论与来源之间的对应关系。", "来源列表和访问日期。", "REVIEW"),
      rule("STP-RESEARCH-002", "区分事实与判断", "MUST", "调研结果必须区分已验证事实、合理推断、建议和未知项。", "评审结论标签和证据。", "调研结论。", "REVIEW"),
      rule("STP-RESEARCH-003", "禁止未授权探测", "MUST_NOT", "调研不得包含对系统、网络、账户、数据库或接口的未授权扫描、探测和访问。", "检查使用的命令、工具、目标和授权范围。", "调研操作记录。", "BLOCK"),
      rule("STP-RESEARCH-004", "限制信息外发", "MUST_NOT", "未经用户明确同意不得向外部服务发送私有代码、内部文档、配置或数据。", "核对外部检索、上传和工具调用。", "外部服务使用记录或 none。", "BLOCK")
    ]
  },
  {
    id: "coding",
    name: "代码开发",
    description: "按照已确认需求和设计实现范围受控、可维护、可验证的业务代码。",
    riskLevel: "medium",
    paths: {
      read: ["/README.md", "/guide", "/docs", "/code", "/data", "/command", "/status"],
      write: ["/code", "/status"]
    },
    inputs: ["已确认需求与设计", "现有代码、测试和项目约定"],
    activities: ["识别受影响模块和兼容性要求", "采用现有项目结构完成最小范围实现", "执行与改动风险匹配的检查"],
    outputs: ["code/ 下的实现与必要测试", "status/ 中的变更和验证记录"],
    completion: ["实现与需求逐项对应", "没有无关功能或重构", "相关静态检查、测试或构建通过"],
    safety: ["不得硬编码密码、Token、私钥和生产连接信息", "新增依赖、执行迁移或破坏兼容性前必须说明影响"],
    rules: [
      rule("STP-CODING-001", "实现对应已确认事项", "MUST", "每项代码修改必须对应当前已确认的需求、设计或缺陷。", "对照输入审查全部代码差异。", "事项标识与变更文件列表。", "BLOCK"),
      rule("STP-CODING-002", "控制实现范围", "MUST_NOT", "代码开发不得引入与当前事项无关的功能、依赖升级或重构。", "审查变更范围和依赖清单。", "范围审查结论。", "REVIEW"),
      rule("STP-CODING-003", "禁止硬编码敏感信息", "MUST_NOT", "源码、测试和配置中不得硬编码密码、Token、私钥或生产连接信息。", "执行敏感信息扫描并人工复核配置差异。", "扫描和复核结果。", "BLOCK"),
      rule("STP-CODING-004", "验证实现", "MUST", "实现完成后必须执行与语言、框架和改动风险相匹配的静态检查、测试或构建。", "检查命令、退出状态和结果摘要。", "验证命令和结果。", "BLOCK"),
      rule("STP-CODING-005", "审查新增依赖", "MUST", "新增第三方依赖前必须确认必要性、许可证、维护状态和已知安全风险。", "检查依赖变更及其评审记录。", "依赖评审记录或 none。", "REVIEW")
    ]
  },
  {
    id: "api-test",
    name: "API 调用测试",
    description: "验证接口契约、鉴权、错误处理和集成行为，同时保护环境与测试数据。",
    riskLevel: "high",
    paths: {
      read: ["/docs/demand", "/docs/design", "/docs/test", "/code", "/command/service", "/deploy/env", "/status"],
      write: ["/docs/test", "/docs/bug", "/status"]
    },
    inputs: ["API 契约和验收条件", "允许访问的测试环境与凭证引用"],
    activities: ["确认目标环境和授权", "测试正常、边界、鉴权、幂等和错误场景", "脱敏记录请求、响应和结论"],
    outputs: ["API 测试记录", "发现的 Bug", "脱敏后的验证证据"],
    completion: ["关键接口和状态码已覆盖", "鉴权与错误场景已验证", "测试数据已清理或记录保留原因"],
    safety: ["默认禁止调用生产接口", "破坏性、计费、通知和批量操作必须单独确认", "凭证只能从授权环境注入"],
    rules: [
      rule("STP-API-TEST-001", "确认目标环境", "MUST", "调用接口前必须确认目标地址、环境、账户和允许的操作范围。", "核对测试请求与环境安全配置。", "目标环境和授权记录。", "BLOCK"),
      rule("STP-API-TEST-002", "默认禁止生产调用", "MUST_NOT", "未经用户对具体目标和操作的明确确认不得调用生产接口。", "检查主机、环境标识和用户确认。", "生产调用确认或 none。", "BLOCK"),
      rule("STP-API-TEST-003", "控制高风险请求", "MUST", "删除、支付、通知、批量写入和不可逆请求必须在执行前单独确认目标与影响。", "检查请求方法、端点、副作用和确认记录。", "高风险请求确认或 none。", "BLOCK"),
      rule("STP-API-TEST-004", "保护凭证与响应数据", "MUST_NOT", "测试记录不得保存完整认证头、Cookie、密钥或未脱敏敏感响应。", "复核请求响应日志和测试文档。", "脱敏检查结果。", "BLOCK"),
      rule("STP-API-TEST-005", "覆盖接口契约", "MUST", "测试必须覆盖契约中的主要成功、校验、鉴权、限流和错误行为。", "将测试项与接口契约逐项对应。", "API 测试矩阵。", "REVIEW")
    ]
  },
  {
    id: "unit-test",
    name: "单元测试",
    description: "以隔离、快速、可重复的测试验证最小代码单元和关键边界。",
    riskLevel: "low",
    paths: {
      read: ["/docs/demand", "/docs/design", "/code", "/data/datasets", "/status"],
      write: ["/code", "/docs/test", "/docs/bug", "/status"]
    },
    inputs: ["实现代码与验收条件", "现有测试框架和测试夹具"],
    activities: ["识别核心分支和边界条件", "编写隔离且确定性的测试", "运行相关测试并分析失败"],
    outputs: ["与代码同库的单元测试", "测试结果和必要的 Bug 记录"],
    completion: ["核心逻辑和风险分支已覆盖", "测试可重复且不依赖生产资源", "失败项已修复或登记"],
    safety: ["单元测试不得连接生产资源或依赖真实凭证", "测试数据不得包含未经授权的真实信息"],
    rules: [
      rule("STP-UNIT-TEST-001", "隔离外部资源", "MUST_NOT", "单元测试不得连接生产数据库、外部服务或真实用户账户。", "检查测试配置、网络访问和依赖替身。", "隔离性检查结果。", "BLOCK"),
      rule("STP-UNIT-TEST-002", "使用安全测试数据", "MUST_NOT", "测试夹具不得包含真实凭证或未经授权的生产和个人数据。", "扫描测试文件与夹具。", "测试数据检查结果。", "BLOCK"),
      rule("STP-UNIT-TEST-003", "保持确定性", "MUST", "测试必须控制时间、随机性、并发和外部依赖，使相同输入可重复得到相同结果。", "重复运行相关测试并检查不稳定因素。", "重复运行结果。", "REVIEW"),
      rule("STP-UNIT-TEST-004", "覆盖关键分支", "MUST", "单元测试必须覆盖当前修改的主要逻辑、边界条件和已识别风险。", "对照代码差异和风险清单检查测试。", "覆盖对应关系。", "BLOCK")
    ]
  },
  {
    id: "functional-test",
    name: "功能测试",
    description: "从用户和系统边界验证完整功能、跨模块交互和验收条件。",
    riskLevel: "high",
    paths: {
      read: ["/docs/demand", "/docs/design", "/docs/test", "/code", "/data", "/command", "/deploy/env", "/status"],
      write: ["/docs/test", "/docs/bug", "/status"]
    },
    inputs: ["需求验收条件", "可运行构建和获准测试环境"],
    activities: ["建立需求到测试场景的映射", "执行主流程、异常流程和跨模块验证", "记录实际结果、证据和遗留风险"],
    outputs: ["功能测试报告与证据", "Bug 记录", "发布建议"],
    completion: ["验收条件均有明确结果", "阻断问题已处理", "环境和测试数据已清理"],
    safety: ["默认只在本地或专用测试环境运行", "高风险副作用和生产验证必须明确确认", "测试证据必须脱敏"],
    rules: [
      rule("STP-FUNCTIONAL-TEST-001", "覆盖验收条件", "MUST", "每项验收条件必须至少对应一个已执行或明确标记未执行的功能测试。", "检查需求与测试场景映射。", "验收覆盖矩阵。", "BLOCK"),
      rule("STP-FUNCTIONAL-TEST-002", "限制测试环境", "MUST_NOT", "未经用户明确确认不得在生产环境执行功能测试或生成测试数据。", "核对环境、账户和确认记录。", "环境确认记录。", "BLOCK"),
      rule("STP-FUNCTIONAL-TEST-003", "控制副作用", "MUST", "会发送通知、修改共享数据、产生费用或影响其他用户的测试必须预先确认并提供清理方案。", "检查测试步骤、副作用和清理记录。", "副作用确认与清理结果。", "BLOCK"),
      rule("STP-FUNCTIONAL-TEST-004", "如实记录结果", "MUST", "测试报告必须区分通过、失败、阻塞和未执行项，并对证据进行脱敏。", "核对报告与实际输出。", "测试报告和证据。", "BLOCK")
    ]
  },
  {
    id: "package",
    name: "项目打包",
    description: "以可重复方式生成来源明确、内容安全、可验证的交付制品。",
    riskLevel: "medium",
    paths: {
      read: ["/README.md", "/code", "/docs/test", "/command", "/deploy/info", "/status"],
      write: ["/deploy/artifact", "/status"]
    },
    inputs: ["已验证代码和依赖锁定文件", "版本、构建配置和目标平台"],
    activities: ["确认版本和来源提交", "在干净环境执行构建", "扫描制品、生成清单和校验值"],
    outputs: ["deploy/artifact/ 下的版本化制品", "构建清单、哈希和结果记录"],
    completion: ["构建成功且可重复", "制品不含凭证和非必要文件", "版本、来源和校验值可追溯"],
    safety: ["制品不得包含源码外泄项、凭证或生产配置", "已有版本制品默认不可覆盖"],
    rules: [
      rule("STP-PACKAGE-001", "使用已验证来源", "MUST", "打包必须基于已通过必要验证且版本明确的代码来源。", "核对测试结果、版本和来源提交。", "来源与测试记录。", "BLOCK"),
      rule("STP-PACKAGE-002", "保持构建可重复", "MUST", "构建应使用锁定依赖和明确的运行时、命令及目标平台。", "在可比环境复核构建配置和输出。", "构建命令与环境摘要。", "REVIEW"),
      rule("STP-PACKAGE-003", "扫描制品敏感内容", "MUST_NOT", "制品不得包含密码、Token、私钥、生产配置、调试转储或非必要用户数据。", "对最终制品执行内容和敏感信息检查。", "制品扫描结果。", "BLOCK"),
      rule("STP-PACKAGE-004", "保持版本不可变", "MUST_NOT", "未经用户明确确认不得覆盖同一版本或构建标识下的已有制品。", "打包前检查目标路径和已有清单。", "制品目标检查结果。", "BLOCK"),
      rule("STP-PACKAGE-005", "记录制品来源", "MUST", "制品必须记录组件、版本、构建时间、来源提交和可用的校验值。", "检查制品清单。", "制品清单路径。", "BLOCK")
    ]
  },
  {
    id: "deploy",
    name: "部署",
    description: "把已验证制品安全发布到明确授权的环境并保留完整记录。",
    riskLevel: "critical",
    paths: {
      read: ["/deploy/artifact", "/deploy/env", "/deploy/info", "/command/deploy", "/docs/test", "/status"],
      write: ["/deploy/log", "/status"]
    },
    inputs: ["可追溯制品", "目标环境、服务、版本和部署授权"],
    activities: ["确认目标与权限并完成部署前检查", "执行部署和健康检查", "失败时停止扩散并按已确认方案回滚"],
    outputs: ["部署或回滚结果", "deploy/log/ 下的完整记录", "status/ 中的环境状态"],
    completion: ["目标版本部署结果明确", "健康检查和关键功能验证完成", "日志、风险和后续动作已记录"],
    safety: ["每次部署都必须确认环境、服务和版本", "生产部署与回滚必须获得明确授权", "部署节点不得修改业务代码"],
    rules: [
      rule("STP-DEPLOY-001", "确认部署目标", "MUST", "执行前必须明确确认目标环境、服务、版本、影响范围和维护窗口。", "核对部署请求、制品和环境配置。", "目标确认记录。", "BLOCK"),
      rule("STP-DEPLOY-002", "验证环境权限", "MUST", "部署前必须确认当前操作者、Agent 和命令具备目标环境所需权限。", "检查安全策略、白名单和实际操作。", "权限判定结果。", "BLOCK"),
      rule("STP-DEPLOY-003", "生产操作单独授权", "MUST_NOT", "未经用户对本次环境、版本和操作的明确确认不得执行生产部署或回滚。", "检查生产标识与确认记录。", "生产授权或 none。", "BLOCK"),
      rule("STP-DEPLOY-004", "禁止部署时修改源码", "MUST_NOT", "部署节点不得修改业务代码或用现场修改替代可追溯制品。", "检查部署期间的变更路径和制品来源。", "部署变更路径列表。", "BLOCK"),
      rule("STP-DEPLOY-005", "记录结果与回滚能力", "MUST", "部署必须记录命令、结果、健康检查和回滚方案；失败时停止后续扩散。", "检查部署日志和失败处理。", "部署日志路径。", "BLOCK")
    ]
  }
];

export const DEFAULT_WORKFLOWS = [
  workflow("fullstack-feature", "全栈功能开发", "从需求、调研和 UI 设计到开发、测试、打包与部署的完整流程。", [
    node("project-information", "project-info-approval"), node("requirements", "demand-design"), node("research", "research"), node("ui", "ui-design"),
    node("implementation", "coding"), node("unit-tests", "unit-test"), node("api-tests", "api-test"),
    node("functional-tests", "functional-test"), node("package", "package"), node("deploy", "deploy")
  ], [
    edge("project-information", "requirements", "项目基本信息与命名规范已核准"), edge("requirements", "research"), edge("research", "ui"), edge("ui", "implementation"),
    edge("implementation", "unit-tests"), edge("unit-tests", "api-tests", "单元测试通过"),
    edge("unit-tests", "implementation", "单元测试失败"), edge("api-tests", "functional-tests", "API 测试通过"),
    edge("api-tests", "implementation", "API 问题需要修复"), edge("functional-tests", "package", "功能测试通过"),
    edge("functional-tests", "implementation", "功能测试失败"), edge("package", "deploy", "用户确认部署")
  ]),
  workflow("backend-feature", "后端功能开发", "适用于 Python、Java 等后端服务的需求、调研、实现、测试和发布。", [
    node("project-information", "project-info-approval"), node("requirements", "demand-design"), node("research", "research"), node("implementation", "coding"),
    node("unit-tests", "unit-test"), node("api-tests", "api-test"), node("functional-tests", "functional-test"),
    node("package", "package"), node("deploy", "deploy")
  ], [
    edge("project-information", "requirements", "项目基本信息与命名规范已核准"), edge("requirements", "research"), edge("research", "implementation"), edge("implementation", "unit-tests"),
    edge("unit-tests", "api-tests", "单元测试通过"), edge("unit-tests", "implementation", "单元测试失败"),
    edge("api-tests", "functional-tests", "API 测试通过"), edge("api-tests", "implementation", "API 问题需要修复"),
    edge("functional-tests", "package", "功能测试通过"), edge("functional-tests", "implementation", "功能测试失败"),
    edge("package", "deploy", "用户确认部署")
  ]),
  workflow("frontend-feature", "前端功能开发", "适用于包含界面与接口集成的前端功能开发。", [
    node("project-information", "project-info-approval"), node("requirements", "demand-design"), node("research", "research"), node("ui", "ui-design"),
    node("implementation", "coding"), node("unit-tests", "unit-test"), node("api-tests", "api-test"),
    node("functional-tests", "functional-test"), node("package", "package"), node("deploy", "deploy")
  ], [
    edge("project-information", "requirements", "项目基本信息与命名规范已核准"), edge("requirements", "research"), edge("research", "ui"), edge("ui", "implementation"),
    edge("implementation", "unit-tests"), edge("unit-tests", "api-tests", "单元测试通过"),
    edge("unit-tests", "implementation", "单元测试失败"), edge("api-tests", "functional-tests", "接口集成通过"),
    edge("api-tests", "implementation", "接口集成失败"), edge("functional-tests", "package", "功能测试通过"),
    edge("functional-tests", "implementation", "功能测试失败"), edge("package", "deploy", "用户确认部署")
  ]),
  workflow("discovery-design", "需求调研与设计", "在进入开发前完成需求、技术调研和 UI 设计。", [
    node("project-information", "project-info-approval"), node("requirements", "demand-design"), node("research", "research"), node("ui", "ui-design")
  ], [edge("project-information", "requirements", "项目基本信息与命名规范已核准"), edge("requirements", "research"), edge("research", "ui", "需要界面设计")]),
  workflow("release-deployment", "发布与部署", "对已有候选版本执行功能验证、打包和受控部署。", [
    node("functional-tests", "functional-test"), node("package", "package"), node("deploy", "deploy")
  ], [edge("functional-tests", "package", "功能测试通过"), edge("package", "deploy", "用户确认部署")])
];

export function createDefaultFiles() {
  const files = new Map([
    ["workflow/workflows.json", `${JSON.stringify({ version: 1, workflows: DEFAULT_WORKFLOWS }, null, 2)}\n`],
    ["spec/custom/directory-governance/README.md", DIRECTORY_GOVERNANCE_SPEC]
  ]);

  for (const directorySpec of DIRECTORY_SPECS) {
    files.set(`spec/directories/${directorySpec[0]}.md`, renderDirectorySpec(directorySpec));
  }

  for (const step of DEFAULT_STEPS) {
    files.set(`workflow/steps/${step.id}/step.json`, `${JSON.stringify({
      version: 1,
      id: step.id,
      name: step.name,
      description: step.description,
      paths: step.paths,
      safety: { ...sharedSafety, riskLevel: step.riskLevel }
    }, null, 2)}\n`);
    files.set(`workflow/steps/${step.id}/README.md`, renderStepGuide(step));
    files.set(`spec/steps/${step.id}/README.md`, renderStepSpec(step));
  }
  return files;
}

function renderStepGuide(step) {
  return `# ${step.name}\n\n${step.description}\n\n## Inputs\n\n${list(step.inputs)}\n\n## Work\n\n${list(step.activities)}\n\n## Outputs\n\n${list(step.outputs)}\n\n## Completion\n\n${list(step.completion)}\n\n## Safety\n\n风险等级：\`${step.riskLevel}\`。继承 \`deploy/safe.json\`；对话中新提出的用户安全规则优先于项目总安全规则，项目总安全规则优先于本 Step。\n\n${list(step.safety)}\n`;
}

function renderStepSpec(step) {
  return `---\nversion: 1\nkind: step\nid: ${step.id}\nname: "${step.name}规约"\nstatus: active\nsummary: "${step.description}"\n---\n\n# ${step.name}规约\n\n## Purpose\n\n${step.description}\n\n## Scope\n\n### Applies To\n\n- 使用 ${step.id} Step 的所有工作流节点\n- 本 Step 声明的输入、操作和产出\n\n### Excludes\n\n- 用户明确要求并记录的流程外工作\n\n## Rules\n\n${step.rules.map(renderRule).join("\n\n")}\n`;
}

function renderRule(item) {
  return `### ${item.id} - ${item.title}\n\n- \`level\`: \`${item.level}\`\n- \`requirement\`: ${item.requirement}\n- \`verification\`: ${item.verification}\n- \`evidence\`: ${item.evidence}\n- \`on_violation\`: \`${item.onViolation}\`\n- \`exception\`: ${item.exception}`;
}

function rule(id, title, level, requirement, verification, evidence, onViolation, exception = "用户在了解影响后明确提出新的安全或执行规则时，记录该规则与本次例外。") {
  return { id, title, level, requirement, verification, evidence, onViolation, exception };
}

function workflow(id, name, description, nodes, transitions) {
  return { id, name, description, entry: nodes[0].id, nodes, transitions };
}

function node(id, step) { return { id, step }; }
function edge(from, to, when) { return { from, to, ...(when ? { when } : {}) }; }
function list(items) { return items.map((item) => `- ${item}`).join("\n"); }
