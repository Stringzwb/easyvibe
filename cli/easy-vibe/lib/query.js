import { lstat, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { readExistingProject, resolveProjectPath } from "./init.js";

export const QUERY_COMMANDS = {
  info: {
    aliases: [],
    usage: "easyvibe info [项目路径] [--json]",
    description: "查询项目标记、Agent 入口和核心文件",
    valueFlags: [],
    maxPositionals: 1
  },
  status: {
    aliases: [],
    usage: "easyvibe status [项目路径] [--work <work-id>] [--json]",
    description: "查询主工作、子任务和恢复信息",
    valueFlags: ["work"],
    maxPositionals: 1
  },
  workflows: {
    aliases: ["workflow"],
    usage: "easyvibe workflows [项目路径] [工作流ID] [--json]",
    description: "查询可用工作流或指定工作流详情",
    valueFlags: [],
    maxPositionals: 2
  },
  steps: {
    aliases: ["step"],
    usage: "easyvibe steps [项目路径] [Step ID] [--json]",
    description: "查询可用 Step、路径权限和安全级别",
    valueFlags: [],
    maxPositionals: 2
  },
  docs: {
    aliases: ["documents"],
    usage: "easyvibe docs [项目路径] [--type <类型>] [--json]",
    description: "查询项目文档索引",
    valueFlags: ["type"],
    maxPositionals: 1
  },
  bugs: {
    aliases: ["bug"],
    usage: "easyvibe bugs [项目路径] [--status <状态>] [--severity <级别>] [--json]",
    description: "查询 Bug 索引并按状态或严重级别筛选",
    valueFlags: ["status", "severity"],
    maxPositionals: 1
  },
  context: {
    aliases: [],
    usage: "easyvibe context [项目路径] [--json]",
    description: "汇总适合 Coding Agent 快速读取的项目上下文",
    valueFlags: [],
    maxPositionals: 1
  },
  specs: {
    aliases: ["spec", "standards"],
    usage: "easyvibe specs [项目路径] [规范ID] [--json]",
    description: "查询工程实现规范目录和领域规范",
    valueFlags: [],
    maxPositionals: 2
  }
};

const DOC_TYPES = new Set(["demand", "design", "test", "meet", "record", "bug", "root"]);
const TERMINAL_WORK_STATUSES = new Set(["completed", "cancelled"]);
const TERMINAL_TASK_STATUSES = new Set(["completed", "cancelled"]);

export function resolveQueryCommand(command) {
  if (QUERY_COMMANDS[command]) return command;
  return Object.entries(QUERY_COMMANDS).find(([, spec]) => spec.aliases.includes(command))?.[0] || null;
}

export function parseQueryArgs(command, args) {
  const spec = QUERY_COMMANDS[command];
  if (!spec) throw new Error(`不支持查询命令：${command}`);

  const positionals = [];
  const options = { json: false, help: false };
  let parseFlags = true;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (parseFlags && argument === "--") {
      parseFlags = false;
      continue;
    }
    if (parseFlags && argument === "--json") {
      options.json = true;
      continue;
    }
    if (parseFlags && ["--help", "-h"].includes(argument)) {
      options.help = true;
      continue;
    }
    if (parseFlags && argument.startsWith("-")) {
      const equalIndex = argument.indexOf("=");
      const name = equalIndex === -1 ? argument.slice(2) : argument.slice(2, equalIndex);
      if (!spec.valueFlags.includes(name)) {
        throw new Error(`${command} 不支持参数：${argument}`);
      }
      let value = equalIndex === -1 ? args[index + 1] : argument.slice(equalIndex + 1);
      if (equalIndex === -1) index += 1;
      if (!value || value.startsWith("-")) throw new Error(`${argument} 需要一个值`);
      options[name] = value;
      continue;
    }
    positionals.push(argument);
  }

  if (positionals.length > spec.maxPositionals) {
    throw new Error(`${command} 最多接受 ${spec.maxPositionals === 1 ? "一个项目路径" : "项目路径和一个查询对象"}`);
  }
  return { positionals, options };
}

export async function queryInfo({ projectPath, cwd = process.cwd() } = {}) {
  const project = await requireProject(projectPath, cwd);
  const files = [
    ".easyvibe.json",
    "README.md",
    "guide/README.md",
    "workflow/workflows.json",
    "status/works.csv",
    "docs/bug/bugs.csv",
    "deploy/safe.json"
  ];
  const fileStatus = {};
  for (const relativePath of files) {
    fileStatus[relativePath] = await pathExists(path.join(project.root, relativePath));
  }

  return {
    command: "info",
    root: project.root,
    marker: project.marker,
    agentEntry: {
      relativePath: project.marker.agentEntry,
      path: path.join(project.root, project.marker.agentEntry),
      exists: await pathExists(path.join(project.root, project.marker.agentEntry))
    },
    files: fileStatus
  };
}

export async function queryStatus({ projectPath, workId, cwd = process.cwd() } = {}) {
  const project = await requireProject(projectPath, cwd);
  const warnings = [];
  const worksPath = path.join(project.root, "status", "works.csv");
  const works = await readOptionalCsv(worksPath, "主工作列表", warnings);
  const selectedWorks = workId ? works.filter((work) => work.work_id === workId) : works;
  if (workId && selectedWorks.length === 0) throw new Error(`未找到主工作：${workId}`);

  const enrichedWorks = [];
  for (const work of selectedWorks) {
    const taskRelativePath = work.task_file || (work.work_id ? `status/work/${work.work_id}.csv` : "");
    const taskPath = safeProjectPath(project.root, taskRelativePath);
    const tasks = taskPath ? await readOptionalCsv(taskPath, `${work.work_id || "主工作"} 子任务`, warnings) : [];
    const taskSummary = summarizeStatuses(tasks, "status");
    enrichedWorks.push({
      ...work,
      taskFile: taskRelativePath || null,
      tasks,
      taskSummary
    });
  }

  const allTasks = enrichedWorks.flatMap((work) => work.tasks);
  const summary = {
    workCount: enrichedWorks.length,
    activeWorkCount: enrichedWorks.filter((work) => !TERMINAL_WORK_STATUSES.has(work.status)).length,
    taskCount: allTasks.length,
    activeTaskCount: allTasks.filter((task) => !TERMINAL_TASK_STATUSES.has(task.status)).length,
    worksByStatus: countBy(enrichedWorks, "status"),
    tasksByStatus: countBy(allTasks, "status"),
    unverifiedCompletedTaskCount: allTasks.filter((task) => task.status === "completed" && !task.result).length
  };

  return {
    command: "status",
    root: project.root,
    summary,
    works: enrichedWorks,
    warnings
  };
}

export async function queryWorkflows({ projectPath, workflowId, cwd = process.cwd() } = {}) {
  const project = await requireProject(projectPath, cwd);
  const relativePath = "workflow/workflows.json";
  const config = await readJson(path.join(project.root, relativePath), relativePath);
  if (!Array.isArray(config.workflows)) throw new Error(`${relativePath} 无效：workflows 必须是数组`);

  const workflows = config.workflows.map((workflow) => ({
    ...workflow,
    nodeCount: Array.isArray(workflow.nodes) ? workflow.nodes.length : 0,
    transitionCount: Array.isArray(workflow.transitions) ? workflow.transitions.length : 0,
    stepIds: unique((workflow.nodes || []).map((node) => node.step).filter(Boolean))
  }));
  if (workflowId) {
    const workflow = workflows.find((item) => item.id === workflowId);
    if (!workflow) throw new Error(`未找到工作流：${workflowId}`);
    return { command: "workflows", root: project.root, source: relativePath, workflow };
  }
  return {
    command: "workflows",
    root: project.root,
    source: relativePath,
    count: workflows.length,
    workflows: workflows.map(({ id, name, description, entry, nodeCount, transitionCount, stepIds }) => ({
      id, name, description, entry, nodeCount, transitionCount, stepIds
    }))
  };
}

export async function querySteps({ projectPath, stepId, cwd = process.cwd() } = {}) {
  const project = await requireProject(projectPath, cwd);
  const stepsRoot = path.join(project.root, "workflow", "steps");
  let entries;
  try {
    entries = await readdir(stepsRoot, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") throw new Error(`项目缺少 Step 目录：workflow/steps`);
    throw error;
  }

  const directories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  if (stepId && !directories.includes(stepId)) throw new Error(`未找到 Step：${stepId}`);

  const ids = stepId ? [stepId] : directories;
  const steps = [];
  for (const id of ids) {
    const definitionPath = path.join(stepsRoot, id, "step.json");
    const definition = await readJson(definitionPath, `workflow/steps/${id}/step.json`);
    steps.push({
      ...definition,
      files: {
        run: path.join(project.root, "workflow", "steps", id, "step.json"),
        guide: path.join(project.root, "workflow", "steps", id, "README.md"),
        specification: path.join(project.root, "spec", "steps", id, "README.md")
      },
      hasGuide: await pathExists(path.join(stepsRoot, id, "README.md")),
      hasSpecification: await pathExists(path.join(project.root, "spec", "steps", id, "README.md"))
    });
  }

  if (stepId) return { command: "steps", root: project.root, count: 1, step: steps[0] };
  return {
    command: "steps",
    root: project.root,
    count: steps.length,
    steps: steps.map((step) => ({
      id: step.id,
      name: step.name,
      description: step.description,
      riskLevel: step.safety?.riskLevel,
      readPathCount: step.paths?.read?.length || 0,
      writePathCount: step.paths?.write?.length || 0,
      hasGuide: step.hasGuide,
      hasSpecification: step.hasSpecification
    }))
  };
}

export async function queryDocs({ projectPath, type, cwd = process.cwd() } = {}) {
  if (type && !DOC_TYPES.has(type)) throw new Error(`不支持文档类型：${type}。可选值：${[...DOC_TYPES].join(", ")}`);
  const project = await requireProject(projectPath, cwd);
  const docsRoot = path.join(project.root, "docs");
  const files = [];
  await collectFiles(docsRoot, project.root, files);
  const filtered = files
    .map((file) => ({ ...file, type: documentType(file.relativePath) }))
    .filter((file) => !type || file.type === type)
    .sort((left, right) => left.relativePath.localeCompare(right.relativePath));

  return {
    command: "docs",
    root: project.root,
    type: type || null,
    count: filtered.length,
    byType: countBy(filtered, "type"),
    files: filtered
  };
}

export async function querySpecs({ projectPath, specId, cwd = process.cwd() } = {}) {
  const project = await requireProject(projectPath, cwd);
  const definitions = [
    ["engineering", "工程实现规范目录", "spec/custom/engineering/README.md"],
    ["engineering-ui", "UI 与前端代码规范", "spec/custom/engineering/ui.md"],
    ["engineering-backend", "后端代码规范", "spec/custom/engineering/backend.md"],
    ["engineering-database", "数据库设计规范", "spec/custom/engineering/database.md"]
  ];
  if (specId && !definitions.some(([id]) => id === specId)) throw new Error(`未找到工程规范：${specId}`);

  const selected = specId ? definitions.filter(([id]) => id === specId) : definitions;
  const specs = await Promise.all(selected.map(async ([id, fallbackName, relativePath]) => {
    const absolutePath = path.join(project.root, relativePath);
    const exists = await pathExists(absolutePath);
    if (!exists) return { id, name: fallbackName, relativePath, exists: false, status: "missing", ruleCount: 0 };
    const text = await readFile(absolutePath, "utf8");
    const metadata = parseFrontMatter(text);
    return {
      id,
      name: metadata.name || fallbackName,
      relativePath,
      exists: true,
      status: metadata.status || "active",
      summary: metadata.summary || "",
      ruleCount: countRuleHeadings(text)
    };
  }));

  if (specId) return { command: "specs", root: project.root, source: "spec/custom/engineering", count: specs.length, spec: specs[0] };
  return { command: "specs", root: project.root, source: "spec/custom/engineering", count: specs.length, specs };
}

export async function queryBugs({ projectPath, status, severity, cwd = process.cwd() } = {}) {
  const project = await requireProject(projectPath, cwd);
  const warnings = [];
  const source = "docs/bug/bugs.csv";
  const rows = await readOptionalCsv(path.join(project.root, source), "Bug 索引", warnings);
  const bugs = [];
  for (const bug of rows
    .filter((item) => !status || item.status === status)
    .filter((item) => !severity || item.severity === severity)) {
    const detailPath = safeProjectPath(project.root, bug.detail_file);
    bugs.push({
      ...bug,
      detailPath: bug.detail_file || null,
      detailExists: detailPath ? await pathExists(detailPath) : false
    });
  }

  return {
    command: "bugs",
    root: project.root,
    filters: { status: status || null, severity: severity || null },
    count: bugs.length,
    byStatus: countBy(bugs, "status"),
    bySeverity: countBy(bugs, "severity"),
    bugs,
    warnings
  };
}

export async function queryContext({ projectPath, cwd = process.cwd() } = {}) {
  const [info, status, workflows, steps, bugs, docs] = await Promise.all([
    queryInfo({ projectPath, cwd }),
    queryStatus({ projectPath, cwd }),
    queryWorkflows({ projectPath, cwd }),
    querySteps({ projectPath, cwd }),
    queryBugs({ projectPath, cwd }),
    queryDocs({ projectPath, cwd })
  ]);
  const activeWorks = status.works.filter((work) => !TERMINAL_WORK_STATUSES.has(work.status));
  const activeTasks = activeWorks.flatMap((work) => work.tasks.filter((task) => !TERMINAL_TASK_STATUSES.has(task.status)));

  return {
    command: "context",
    root: info.root,
    project: {
      marker: info.marker,
      agentEntry: info.agentEntry,
      coreFiles: info.files
    },
    current: {
      status: status.summary,
      activeWorks,
      activeTasks,
      openBugs: bugs.bugs.filter((bug) => !["closed", "resolved", "completed"].includes(bug.status))
    },
    available: {
      workflows: workflows.workflows || [workflows.workflow],
      steps: steps.steps || [steps.step]
    },
    indexes: {
      documents: { count: docs.count, byType: docs.byType },
      bugs: { count: bugs.count, byStatus: bugs.byStatus, bySeverity: bugs.bySeverity }
    },
    warnings: unique([...status.warnings, ...bugs.warnings])
  };
}

async function requireProject(projectPath, cwd) {
  const root = resolveProjectPath(projectPath || cwd, cwd);
  const marker = await readExistingProject(root);
  if (!marker) {
    throw new Error(`未发现 Easy Vibe 项目标记：${path.join(root, ".easyvibe.json")}。请先运行 easyvibe init ${root} --accept-safety`);
  }
  return { root, marker };
}

async function readJson(filePath, displayPath) {
  let content;
  try {
    content = await readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") throw new Error(`项目缺少查询文件：${displayPath}`);
    throw error;
  }
  try {
    return JSON.parse(content);
  } catch {
    throw new Error(`查询文件无效：${displayPath} 不是合法 JSON`);
  }
}

async function readOptionalCsv(filePath, displayName, warnings) {
  let content;
  try {
    content = await readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      warnings.push(`缺少${displayName}：${path.relative(process.cwd(), filePath) || filePath}`);
      return [];
    }
    throw error;
  }
  try {
    return parseCsv(content);
  } catch (error) {
    throw new Error(`${displayName}无效：${error.message}`);
  }
}

export function parseCsv(content) {
  const text = String(content).replace(/^\uFEFF/, "");
  const records = [];
  let record = [];
  let field = "";
  let quoted = false;
  let hasValue = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      hasValue = true;
      continue;
    }
    if (character === '"') {
      quoted = true;
      hasValue = true;
    } else if (character === ",") {
      record.push(field);
      field = "";
      hasValue = true;
    } else if (character === "\n") {
      record.push(field);
      if (record.some((value) => value !== "") || hasValue) records.push(record);
      record = [];
      field = "";
      hasValue = false;
    } else if (character !== "\r") {
      field += character;
      hasValue = true;
    }
  }
  if (quoted) throw new Error("存在未闭合的引号");
  if (record.length > 0 || field !== "" || hasValue) {
    record.push(field);
    if (record.some((value) => value !== "") || hasValue) records.push(record);
  }
  if (records.length === 0) return [];

  const headers = records.shift().map((header) => header.trim());
  if (headers.some((header) => !header)) throw new Error("表头不能包含空字段");
  if (new Set(headers).size !== headers.length) throw new Error("表头不能包含重复字段");
  return records.map((values, rowIndex) => {
    if (values.length !== headers.length) throw new Error(`第 ${rowIndex + 2} 行字段数量不匹配`);
    return Object.fromEntries(headers.map((header, index) => [header, values[index].trim()]));
  });
}

async function collectFiles(directory, projectRoot, output) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }
  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(absolutePath, projectRoot, output);
    } else if (entry.isFile()) {
      const info = await stat(absolutePath);
      output.push({
        relativePath: path.relative(projectRoot, absolutePath),
        size: info.size,
        modifiedAt: info.mtime.toISOString()
      });
    }
  }
}

function documentType(relativePath) {
  const parts = relativePath.split(path.sep);
  return parts[1] && !parts[1].includes(".") ? parts[1] : "root";
}

function safeProjectPath(root, relativePath) {
  if (!relativePath || path.isAbsolute(relativePath)) return null;
  const absolutePath = path.resolve(root, relativePath);
  const rootWithSeparator = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
  return absolutePath === root || absolutePath.startsWith(rootWithSeparator) ? absolutePath : null;
}

async function pathExists(filePath) {
  try {
    await lstat(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function summarizeStatuses(rows, key) {
  const result = countBy(rows, key);
  return { total: rows.length, byStatus: result };
}

function countBy(rows, key) {
  return rows.reduce((counts, row) => {
    const value = row[key] || "unknown";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function parseFrontMatter(text) {
  const match = String(text).match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/);
  if (!match) return {};
  return Object.fromEntries(match[1].split("\n").flatMap((line) => {
    const separator = line.indexOf(":");
    if (separator < 0) return [];
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    return key ? [[key, value]] : [];
  }));
}

function countRuleHeadings(text) {
  return [...String(text).matchAll(/^###\s+[^\n]+$/gm)].length;
}

function unique(values) {
  return [...new Set(values)];
}
