#!/usr/bin/env node

import { createRequire } from "node:module";
import { init } from "../lib/init.js";
import {
  QUERY_COMMANDS,
  parseQueryArgs,
  queryBugs,
  queryContext,
  queryDocs,
  queryInfo,
  querySpecs,
  queryStatus,
  querySteps,
  queryWorkflows,
  resolveQueryCommand
} from "../lib/query.js";
import { createUi } from "../lib/ui.js";
import { openBrowser, parseViewArgs, startViewServer, waitForServerShutdown } from "../lib/view.js";

const args = process.argv.slice(2);
const command = args.shift();
const { version } = createRequire(import.meta.url)("../package.json");
const ui = createUi(process.stdout);

try {
  if (!command || ["help", "--help", "-h"].includes(command)) {
    printUsage();
  } else if (["--version", "-v"].includes(command)) {
    console.log(version);
  } else if (command === "init") {
    if (["--help", "-h"].includes(args[0])) printInitUsage();
    else {
      const supportedFlags = new Set(["--accept-safety"]);
      const unknownFlag = args.find((item) => item.startsWith("-") && !supportedFlags.has(item));
      if (unknownFlag) throw new Error(`init 不支持参数：${unknownFlag}`);
      const paths = args.filter((item) => !item.startsWith("-"));
      if (paths.length > 1) throw new Error("init 最多接受一个项目路径");
      await init({ suggestedPath: paths[0], acceptSafety: args.includes("--accept-safety") });
    }
  } else if (command === "view") {
    const parsed = parseViewArgs(args);
    if (parsed.options.help) printViewUsage();
    else await runView(parsed.positionals[0], parsed.options);
  } else {
    const queryCommand = resolveQueryCommand(command);
    if (!queryCommand) throw new Error(`未知命令：${command}。请使用 easyvibe --help 查看可用命令`);
    const parsed = parseQueryArgs(queryCommand, args);
    if (parsed.options.help) printQueryUsage(queryCommand);
    else await runQuery(queryCommand, parsed.positionals, parsed.options);
  }
} catch (error) {
  createUi(process.stderr).error(`easyvibe：${error.message}`);
  process.exitCode = 1;
}

async function runView(projectPath, options) {
  const started = await startViewServer({ projectPath, port: options.port });
  ui.banner();
  ui.section("VIEW", "固定项目根目录的只读可视化工作台");
  ui.item("项目位置", started.root);
  ui.item("访问地址", started.url);
  ui.item("服务端口", String(started.port));
  if (options.noOpen) ui.warning("已跳过自动打开浏览器");
  else {
    try {
      await openBrowser(started.url);
      ui.success("已请求系统默认浏览器打开可视化");
    } catch (error) {
      ui.warning(`无法自动打开浏览器：${error.message}`);
      ui.item("手动打开", started.url);
    }
  }
  ui.close("可视化服务运行中；按 Ctrl+C 停止");
  await waitForServerShutdown(started.server);
}
async function runQuery(commandName, positionals, options) {
  const projectPath = positionals[0];
  let result;
  if (commandName === "info") result = await queryInfo({ projectPath });
  else if (commandName === "status") result = await queryStatus({ projectPath, workId: options.work });
  else if (commandName === "workflows") result = await queryWorkflows({ projectPath, workflowId: positionals[1] });
  else if (commandName === "steps") result = await querySteps({ projectPath, stepId: positionals[1] });
  else if (commandName === "docs") result = await queryDocs({ projectPath, type: options.type });
  else if (commandName === "bugs") result = await queryBugs({ projectPath, status: options.status, severity: options.severity });
  else if (commandName === "context") result = await queryContext({ projectPath });
  else if (commandName === "specs") result = await querySpecs({ projectPath, specId: positionals[1] });
  else throw new Error(`未实现查询命令：${commandName}`);

  if (options.json) ui.write(JSON.stringify(result, null, 2));
  else renderQuery(commandName, result);
}

function renderQuery(commandName, result) {
  ui.banner();
  if (commandName === "info") renderInfo(result);
  else if (commandName === "status") renderStatus(result);
  else if (commandName === "workflows") renderWorkflows(result);
  else if (commandName === "steps") renderSteps(result);
  else if (commandName === "docs") renderDocs(result);
  else if (commandName === "bugs") renderBugs(result);
  else if (commandName === "context") renderContext(result);
  else if (commandName === "specs") renderSpecs(result);
}

function renderInfo(result) {
  ui.section("PROJECT INFO", "Easy Vibe 项目标记和 Agent 入口");
  ui.item("项目位置", result.root);
  ui.item("项目类型", result.marker.type);
  ui.item("初始化时间", result.marker.initializedAt || "未记录");
  ui.item("Agent 入口", result.agentEntry.path);
  if (!result.agentEntry.exists) ui.warning("Agent 入口文件不存在，请检查项目完整性");
  ui.close(`核心文件 ${Object.values(result.files).filter(Boolean).length}/${Object.keys(result.files).length} 个存在`);
}

function renderStatus(result) {
  ui.section("STATUS", "主工作和子任务的当前事实");
  ui.item("项目位置", result.root);
  ui.item("主工作", `${result.summary.workCount} 项，进行中 ${result.summary.activeWorkCount} 项`);
  ui.item("子任务", `${result.summary.taskCount} 项，进行中 ${result.summary.activeTaskCount} 项`);
  ui.item("主工作状态", formatCounts(result.summary.worksByStatus));
  ui.item("子任务状态", formatCounts(result.summary.tasksByStatus));
  for (const work of result.works) {
    ui.section(`WORK ${work.work_id || "未命名"}`, work.title || "");
    ui.item("状态", work.status || "unknown");
    ui.item("当前任务", work.current_task_id || "未指定");
    ui.item("下一步", work.next_action || "未指定");
    if (work.tasks.length > 0) ui.item("子任务", `${work.tasks.length} 项，${formatCounts(work.taskSummary.byStatus)}`);
    ui.close(work.summary || "");
  }
  if (result.summary.unverifiedCompletedTaskCount > 0) ui.warning(`有 ${result.summary.unverifiedCompletedTaskCount} 个 completed 子任务缺少验证结果`);
  renderWarnings(result.warnings);
  ui.close("状态查询完成");
}

function renderWorkflows(result) {
  if (result.workflow) {
    const workflow = result.workflow;
    ui.section(`WORKFLOW ${workflow.id}`, workflow.name);
    ui.item("说明", workflow.description);
    ui.item("入口节点", workflow.entry);
    ui.item("节点数", String(workflow.nodes?.length || 0));
    workflow.nodes?.forEach((node, index) => ui.item(`${index + 1}. ${node.id}`, `Step: ${node.step}`));
    if (workflow.transitions?.length) {
      ui.section("TRANSITIONS", "节点转换条件");
      workflow.transitions.forEach((transition) => ui.item(`${transition.from} -> ${transition.to}`, transition.when || "无条件"));
      ui.close("转换定义");
    }
    ui.close("工作流详情查询完成");
    return;
  }

  ui.section("WORKFLOWS", `${result.count} 个可用工作流`);
  result.workflows.forEach((workflow) => ui.item(workflow.id, `${workflow.name}；${workflow.nodeCount} 个节点；入口 ${workflow.entry}`));
  ui.close("使用工作流 ID 查询完整节点和转换条件");
}

function renderSteps(result) {
  if (result.step) {
    const step = result.step;
    ui.section(`STEP ${step.id}`, step.name);
    ui.item("说明", step.description);
    ui.item("风险级别", step.safety?.riskLevel || "未定义");
    ui.item("读取路径", (step.paths?.read || []).join(", ") || "无");
    ui.item("写入路径", (step.paths?.write || []).join(", ") || "无");
    ui.item("运行定义", step.files.run);
    ui.item("执行向导", step.files.guide);
    ui.item("规约文件", step.files.specification);
    ui.close(`Step ${step.hasGuide && step.hasSpecification ? "文件完整" : "文件不完整"}`);
    return;
  }

  ui.section("STEPS", `${result.count} 个可用 Step`);
  result.steps.forEach((step) => ui.item(step.id, `${step.name}；风险 ${step.riskLevel || "未定义"}；读 ${step.readPathCount}；写 ${step.writePathCount}`));
  ui.close("使用 Step ID 查询路径和文件详情");
}

function renderDocs(result) {
  ui.section("DOCUMENTS", result.type ? `类型：${result.type}` : "项目文档索引");
  ui.item("项目位置", result.root);
  ui.item("文档数量", String(result.count));
  ui.item("类型分布", formatCounts(result.byType));
  result.files.forEach((file) => ui.item(file.relativePath, `${file.type}；${file.size} bytes；${file.modifiedAt}`));
  ui.close("文档查询完成");
}

function renderBugs(result) {
  ui.section("BUGS", result.count ? `${result.count} 个匹配项` : "没有匹配项");
  ui.item("筛选条件", formatFilters(result.filters));
  ui.item("状态分布", formatCounts(result.byStatus));
  ui.item("严重级别", formatCounts(result.bySeverity));
  result.bugs.forEach((bug) => ui.item(bug.bug_id || "未命名", `${bug.status || "unknown"} / ${bug.severity || "unknown"} / ${bug.title || ""}`));
  renderWarnings(result.warnings);
  ui.close("Bug 查询完成");
}

function renderContext(result) {
  ui.section("CONTEXT", "供 Coding Agent 快速读取的项目上下文");
  ui.item("项目位置", result.root);
  ui.item("Agent 入口", result.project.agentEntry.path);
  ui.item("当前主工作", `${result.current.activeWorks.length} 项`);
  ui.item("当前子任务", `${result.current.activeTasks.length} 项`);
  ui.item("未关闭 Bug", `${result.current.openBugs.length} 项`);
  ui.item("可用工作流", result.available.workflows.map((workflow) => workflow.id).join(", ") || "无");
  ui.item("可用 Step", `${result.available.steps.length} 个`);
  ui.item("文档索引", `${result.indexes.documents.count} 个文件`);
  if (result.current.activeWorks.length > 0) {
    result.current.activeWorks.forEach((work) => ui.item(`下一步 ${work.work_id || ""}`, work.next_action || "未指定"));
  }
  renderWarnings(result.warnings);
  ui.close("上下文查询完成；大模型调用建议追加 --json");
}

function renderSpecs(result) {
  ui.section("ENGINEERING SPECS", "工程实现规范目录");
  ui.item("项目位置", result.root);
  ui.item("规范来源", result.source);
  const specs = result.specs || [result.spec];
  specs.forEach((spec) => ui.item(spec.id, `${spec.name}；${spec.status}；${spec.ruleCount} 条规则；${spec.relativePath}`));
  ui.close("规范查询完成；工程规范只定义格式，不锁定技术栈");
}

function renderWarnings(warnings = []) {
  warnings.forEach((warning) => ui.warning(warning));
}

function formatCounts(counts = {}) {
  const entries = Object.entries(counts);
  return entries.length ? entries.map(([key, value]) => `${key}=${value}`).join(", ") : "无";
}

function formatFilters(filters) {
  const active = Object.entries(filters).filter(([, value]) => value);
  return active.length ? active.map(([key, value]) => `${key}=${value}`).join(", ") : "无";
}

function printUsage() {
  ui.banner();
  ui.section(`EASY VIBE ${version}`, "项目事实查询与安全初始化");
  ui.item("快速开始", "easyvibe init ./my-project --accept-safety");
  ui.item("打开工作台", "easyvibe view ./my-project");
  ui.item("交给 Agent", "easyvibe context ./my-project --json");
  ui.close("先 init，再用 view 或 context 进入项目");

  ui.section("SETUP", "初始化与本地工作台");
  ui.item("初始化", "easyvibe init [项目路径] [--accept-safety]");
  ui.item("可视化", "easyvibe view [项目路径] [--port <端口>] [--no-open]");
  ui.close("View 使用预构建 dist，不需要安装 Vue 或 Vite");

  ui.section("INSPECT", "只读查询与 Agent 上下文");
  Object.values(QUERY_COMMANDS).forEach((spec) => ui.item(spec.usage, spec.description));
  ui.close("所有查询默认只读；追加 --json 输出机器可读结果");

  ui.section("META", "命令行信息");
  ui.item("版本", "easyvibe --version");
  ui.item("帮助", "easyvibe --help");
  ui.close("使用 easyvibe <命令> --help 查看单项说明");
}

function printViewUsage() {
  ui.banner();
  ui.section("VIEW", "启动本地只读项目可视化");
  ui.item("用法", "easyvibe view [项目路径] [--port <端口>] [--no-open]");
  ui.item("默认位置", "当前目录");
  ui.item("数据源", "项目内 view/index.html 的上一级目录");
  ui.item("端口", "默认 4173；占用时自动尝试后续端口，使用 0 可随机分配");
  ui.item("浏览器", "默认调用系统浏览器；--no-open 只启动服务");
  ui.item("依赖", "只需要 Node.js；不需要安装 Vue、Vite 或业务后端");
  ui.close("服务只提供 GET/HEAD 项目文件，不会修改项目内容");
}

function printQueryUsage(commandName) {
  const spec = QUERY_COMMANDS[commandName];
  ui.banner();
  ui.section(commandName.toUpperCase(), spec.description);
  ui.item("用法", spec.usage);
  if (commandName === "docs") ui.item("类型", "demand、design、test、meet、record、bug、root");
  if (commandName === "bugs") ui.item("筛选", "--status <状态> 和 --severity <级别> 可同时使用");
  if (commandName === "workflows") ui.item("详情", "在项目路径后追加工作流 ID");
  if (commandName === "steps") ui.item("详情", "在项目路径后追加 Step ID");
  if (commandName === "specs") ui.item("详情", "可追加 engineering、engineering-ui、engineering-backend 或 engineering-database");
  ui.item("输出", "追加 --json 输出机器可读 JSON");
  ui.close("所有查询命令不会修改项目文件");
}

function printInitUsage() {
  ui.banner();
  ui.section("INIT", "初始化或识别 Easy Vibe 项目");
  ui.item("用法", "easyvibe init [项目路径] [--accept-safety]");
  ui.item("默认位置", "当前目录");
  ui.item("已有内容", "保留，只补充缺失内容");
  ui.item("已标记项目", "只识别，绝不写入");
  ui.item("非交互确认", "使用 --accept-safety 明确接受总安全准则");
  ui.item("工作台", "初始化会复制预构建 view/index.html 与 view/assets");
  ui.close("完成后运行 easyvibe view <项目路径>");
}
