export const PROJECT_ROOT = new URL(document.body.dataset.projectRoot || "../", document.baseURI);
export const PROJECT_ROOT_NAME = PROJECT_ROOT.pathname.split("/").filter(Boolean).at(-1) || "项目根目录";

export const EXPECTED_DIRECTORIES = [
  ["agent", "Agent", "入口适配与专属 Skill"],
  ["code", "业务代码", "业务源码、测试与正式资源"],
  ["command", "自动化命令", "可重复执行的项目脚本"],
  ["data", "数据", "数据集、下载内容与临时资源"],
  ["deploy", "部署", "环境、制品与运维信息"],
  ["docs", "文档", "需求、设计、测试与 Bug"],
  ["guide", "向导", "人员与 Agent 的导航入口"],
  ["spec", "规约", "项目执行与安全约束"],
  ["status", "状态", "工作进度与恢复事实"],
  ["view", "工作台", "本地可视化资源"],
  ["workflow", "工作流", "流程与 Step 运行定义"]
].map(([id, label, description]) => ({ id, label, description }));

const CORE_FILES = [
  ["README.md", "项目说明"],
  ["guide/README.md", "Agent 入口"],
  ["spec/general.md", "总规约"],
  ["spec/namespec.md", "命名规约"],
  ["workflow/workflows.json", "工作流定义"],
  ["status/works.csv", "主工作状态"],
  ["docs/bug/bugs.csv", "Bug 索引"],
  ["deploy/safe.json", "总安全策略"]
].map(([path, label]) => ({ path, label }));

export const STATUS_LABELS = { planned: "计划中", in_progress: "进行中", blocked: "阻塞", interrupted: "已中断", completed: "已完成", cancelled: "已取消", active: "进行中", queued: "待开始", loading: "创建中", untracked: "未跟踪", missing: "缺失", unknown: "未定义" };

export async function createSnapshot() {
  const warnings = [];
  const readme = await readOptionalText(["README.md"]);
  const workflowConfig = await readJsonRequired(["workflow", "workflows.json"], "workflow/workflows.json");
  if (!Array.isArray(workflowConfig.workflows)) throw new Error("workflow/workflows.json 无效：workflows 必须是数组");
  const steps = await readSteps(warnings);
  const works = await readStatus(warnings);
  const bugs = await readBugs(warnings);
  const documents = await readDocuments();
  const safety = await readSafety(warnings);
  const governance = await readGovernance(warnings);
  const directoryRules = await readDirectoryRules(warnings);
  const engineeringSpecs = await readEngineeringSpecs(warnings);
  const guide = await readGuide(warnings);
  const structure = await readStructure();
  const coreFiles = await Promise.all(CORE_FILES.map(async (item) => ({ ...item, exists: await hasFileAt(item.path.split("/")) })));
  const missingPaths = [...coreFiles.filter((item) => !item.exists), ...structure.filter((item) => !item.exists).map((item) => ({ path: item.id, label: `${item.label}目录` }))];
  const expectedCount = coreFiles.length + structure.length;
  const presentCount = expectedCount - missingPaths.length;
  const progress = summarizeProgress(works.flatMap((work) => work.tasks));
  const status = {
    workCount: works.length,
    activeWorkCount: works.filter((work) => !["completed", "cancelled"].includes(work.status)).length,
    taskCount: progress.totalTasks,
    activeTaskCount: progress.activeTasks,
    unverifiedCompletedTaskCount: progress.completedTasks - progress.verifiedCompletedTasks,
    worksByStatus: countBy(works, "status"),
    tasksByStatus: countBy(works.flatMap((work) => work.tasks), "status")
  };
  const workflows = workflowConfig.workflows.map((workflow) => ({ ...workflow, nodes: Array.isArray(workflow.nodes) ? workflow.nodes : [], transitions: Array.isArray(workflow.transitions) ? workflow.transitions : [] }));
  ensureWorkflowSteps(workflows, steps, warnings);
  const activeWork = works.find((work) => !["completed", "cancelled"].includes(work.status) && workflows.some((workflow) => workflow.id === work.workflow_id));
  return {
    project: { rootName: PROJECT_ROOT_NAME, title: firstHeading(readme) || PROJECT_ROOT_NAME, agentEntry: "guide/README.md", lastUpdated: latestDate([...works.flatMap((work) => [work.updated_at, ...work.tasks.map((task) => task.updated_at)]), ...bugs.all.map((bug) => bug.updated_date)]) },
    health: { expectedCount, presentCount, missingPaths, score: expectedCount ? Math.round(presentCount / expectedCount * 100) : 0 },
    progress, status, works, workflows, defaultWorkflowId: activeWork?.workflow_id || workflows[0]?.id || null,
    steps, governance, engineeringSpecs, directoryRules, guide, safety, bugs, documents, structure, warnings,
    syncedAt: new Date().toISOString()
  };
}

async function readSteps(warnings) {
  const directory = await getDirectoryOptional(["workflow", "steps"]);
  if (!directory) {
    warnings.push("项目缺少 workflow/steps 目录，Step 数据暂不可用");
    return [];
  }
  if (!directory.listable) {
    warnings.push("无法列出 workflow/steps 目录，Step 数据暂不可用");
    return [];
  }
  const steps = [];
  for (const [id, entry] of directory.entries) {
    if (entry.kind !== "directory") continue;
    const definitionPath = `workflow/steps/${id}/step.json`;
    try {
      const definition = await readJsonRequired(["workflow", "steps", id, "step.json"], definitionPath);
      const specificationText = await readOptionalText(["spec", "steps", id, "README.md"]);
      if (!specificationText) warnings.push(`缺少 Step 规约：spec/steps/${id}/README.md`);
      steps.push({ ...definition, id: definition.id || id, spec: summarizeRuleFile(specificationText, id, `spec/steps/${id}/README.md`) });
    } catch (error) {
      warnings.push(`${definitionPath} 暂不可用：${error.message}`);
      steps.push(createUnavailableStep(id, definitionPath, error.message));
    }
  }
  return steps.sort((left, right) => left.id.localeCompare(right.id));
}

function createUnavailableStep(id, filePath, error) {
  return {
    id,
    name: "Step 创建中",
    description: "该 Step 目录已出现，但运行定义尚未准备完成。工作台会在下一次同步时重新读取。",
    status: "loading",
    available: false,
    error,
    safety: { riskLevel: "未读取" },
    paths: { read: [], write: [] },
    files: { run: filePath },
    spec: summarizeRuleFile(null, id, `spec/steps/${id}/README.md`)
  };
}

function ensureWorkflowSteps(workflows, steps, warnings) {
  const known = new Set(steps.map((step) => step.id));
  for (const workflow of workflows) {
    for (const node of workflow.nodes) {
      const id = node?.step;
      if (!id || known.has(id)) continue;
      const filePath = `workflow/steps/${id}/step.json`;
      steps.push(createUnavailableStep(id, filePath, "Step 目录或运行定义尚未创建"));
      warnings.push(`工作流 ${workflow.id} 引用了尚未准备好的 Step：${filePath}`);
      known.add(id);
    }
  }
  steps.sort((left, right) => left.id.localeCompare(right.id));
}

async function readStatus(warnings) {
  const text = await readOptionalText(["status", "works.csv"]);
  if (text === null) { warnings.push("缺少主工作列表：status/works.csv"); return []; }
  const result = [];
  for (const source of parseCsv(text)) {
    const work = { ...source, tasks: [], taskFile: source.task_file || (source.work_id ? `status/work/${source.work_id}.csv` : null), progress: summarizeProgress([]) };
    if (!work.taskFile) {
      result.push(work);
      continue;
    }
    const taskParts = safeParts(work.taskFile);
    if (!taskParts) {
      warnings.push(`子任务路径无效：${work.taskFile}`);
      result.push(work);
      continue;
    }
    const taskText = await readOptionalText(taskParts);
    if (taskText === null) warnings.push(`缺少子任务列表：${work.taskFile}`);
    const tasks = taskText === null ? [] : parseCsv(taskText);
    result.push({ ...work, tasks, progress: summarizeProgress(tasks) });
  }
  return result;
}

async function readBugs(warnings) {
  const source = "docs/bug/bugs.csv";
  const text = await readOptionalText(["docs", "bug", "bugs.csv"]);
  if (text === null) { warnings.push(`缺少 Bug 索引：${source}`); return { all: [], open: [], openCount: 0, byStatus: {}, bySeverity: {} }; }
  const all = parseCsv(text);
  const open = all.filter((bug) => !["closed", "resolved", "completed"].includes(bug.status));
  return { all, open, openCount: open.length, byStatus: countBy(open, "status"), bySeverity: countBy(open, "severity") };
}

async function readDocuments() {
  const directory = await getDirectoryOptional(["docs"]);
  if (!directory) return { count: 0, byType: {} };
  const files = await collectFiles(directory);
  return { count: files.length, byType: countBy(files.map((file) => ({ type: documentType(file.path) })), "type") };
}

async function readSafety(warnings) {
  const safety = await readOptionalJson(["deploy", "safe.json"]);
  if (!safety) { warnings.push("缺少总安全策略：deploy/safe.json"); return { defaultLevel: "未配置", principleCount: 0, resourceCount: 0, levels: [], principles: [] }; }
  const levels = safety.levels && typeof safety.levels === "object" ? safety.levels : {};
  const levelResources = Object.values(levels).flatMap((level) => level?.resources && typeof level.resources === "object" ? Object.keys(level.resources) : []);
  return { defaultLevel: safety.defaultLevel || "未配置", principleCount: Array.isArray(safety.principles) ? safety.principles.length : 0, resourceCount: Array.isArray(safety.resources) ? safety.resources.length : new Set(levelResources).size, levels: Object.keys(levels), principles: Array.isArray(safety.principles) ? safety.principles.map((item) => ({ id: item.id, name: item.name, requirement: item.requirement })) : [] };
}

async function readGovernance(warnings) {
  const definitions = [["general", "项目总规约", ["spec", "general.md"]], ["namespec", "命名规约", ["spec", "namespec.md"]], ["directory-governance", "目录治理规约", ["spec", "custom", "directory-governance", "README.md"]]];
  return Promise.all(definitions.map(async ([id, name, parts]) => { const text = await readOptionalText(parts); if (!text) warnings.push(`缺少${name}：${parts.join("/")}`); return { ...summarizeRuleFile(text, id, parts.join("/")), id, name }; }));
}

async function readEngineeringSpecs(warnings) {
  const definitions = [["engineering", "工程实现规范目录", "spec/custom/engineering/README.md"], ["engineering-ui", "UI 与前端代码规范", "spec/custom/engineering/ui.md"], ["engineering-backend", "后端代码规范", "spec/custom/engineering/backend.md"], ["engineering-database", "数据库设计规范", "spec/custom/engineering/database.md"]];
  return Promise.all(definitions.map(async ([id, name, filePath]) => { const text = await readOptionalText(filePath.split("/")); if (!text) warnings.push(`缺少工程规范：${filePath}`); const metadata = parseFrontMatter(text); return { id, name: metadata.name || name, filePath, exists: Boolean(text), status: metadata.status || "missing", summary: metadata.summary || "", ruleCount: summarizeRuleFile(text, id, filePath).ruleCount }; }));
}

async function readDirectoryRules(warnings) {
  return Promise.all(EXPECTED_DIRECTORIES.map(async (directory) => { const filePath = `spec/directories/${directory.id}.md`; const text = await readOptionalText(["spec", "directories", `${directory.id}.md`]); if (!text) warnings.push(`缺少目录规约：${filePath}`); return { ...summarizeRuleFile(text, directory.id, filePath), name: directory.label }; }));
}

async function readGuide(warnings) {
  const source = "guide/README.md";
  const text = await readOptionalText(["guide", "README.md"]);
  if (!text) warnings.push(`缺少 Agent 入口：${source}`);
  const pathPlan = [["项目说明", "README.md"], ["规约索引", "spec/README.md"], ["工程实现规范", "spec/custom/engineering/README.md"], ["UI 与前端代码规范", "spec/custom/engineering/ui.md"], ["后端代码规范", "spec/custom/engineering/backend.md"], ["数据库设计规范", "spec/custom/engineering/database.md"], ["总规约", "spec/general.md"], ["命名规约", "spec/namespec.md"], ["目录治理", "spec/custom/directory-governance/README.md"], ["工作状态", "status/works.csv"], ["工作流定义", "workflow/workflows.json"], ["Step 运行定义", "workflow/steps/"]];
  const readingOrder = text ? [...text.matchAll(/^\d+\.\s+(.+)$/gm)].map((match) => match[1].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/`/g, "").trim()) : [];
  const guideInstruction = (label, filePath) => { const leaf = filePath.split("/").filter(Boolean).at(-1); return readingOrder.find((line) => line.includes(filePath) || (leaf && line.includes(leaf)) || line.includes(label)) || ""; };
  const path = await Promise.all(pathPlan.map(async ([label, filePath]) => ({ label, path: filePath, guideInstruction: guideInstruction(label, filePath), exists: filePath.endsWith("/") ? Boolean(await getDirectoryOptional(filePath.slice(0, -1).split("/"))) : await hasFileAt(filePath.split("/")) })));
  const authority = [["项目总规约", "spec/general.md"], ["文档和对象命名", "spec/namespec.md"], ["工程实现规范", "spec/custom/engineering/README.md"], ["UI 与前端代码规范", "spec/custom/engineering/ui.md"], ["后端代码规范", "spec/custom/engineering/backend.md"], ["数据库设计规范", "spec/custom/engineering/database.md"], ["目录职责和目录安全规则", "spec/custom/directory-governance/README.md"], ["Step 规约", "spec/steps/"], ["工作流运行定义", "workflow/workflows.json"], ["Step 运行定义", "workflow/steps/"], ["主任务和子任务状态", "status/README.md"], ["当前工作记录", "status/works.csv"]];
  return { exists: Boolean(text), source, readingOrder, path, authority: await Promise.all(authority.map(async ([label, filePath]) => ({ label, path: filePath, exists: filePath.endsWith("/") ? Boolean(await getDirectoryOptional(filePath.slice(0, -1).split("/"))) : await hasFileAt(filePath.split("/")) }))) };
}

async function readStructure() { return Promise.all(EXPECTED_DIRECTORIES.map(async (definition) => { const directory = await getDirectoryOptional([definition.id]); const files = directory ? await collectFiles(directory) : []; return { ...definition, exists: Boolean(directory), fileCount: files.length }; })); }
async function collectFiles(directory, prefix = "", output = [], depth = 0) { if (depth > 12) return output; const currentParts = [...directory.path, ...prefix.split("/").filter(Boolean)]; const listing = prefix ? await listDirectoryAt(currentParts) : directory; if (!listing.listable) return output; for (const [name, entry] of listing.entries) { const relative = prefix ? `${prefix}/${name}` : name; if (entry.kind === "directory") await collectFiles(directory, relative, output, depth + 1); else output.push({ path: `${directory.path.join("/")}/${relative}` }); } return output; }

function summarizeRuleFile(text, id, filePath) { if (!text) return { id, filePath, status: "missing", ruleCount: 0, rules: [] }; const metadata = parseFrontMatter(text); const rules = [...text.matchAll(/^###\s+([^\n]+)$/gm)].map((match) => { const heading = match[1].match(/^(\S+)\s+-\s+(.+)$/); if (!heading) return null; const body = text.slice(match.index + match[0].length, text.length); return { id: heading[1], title: heading[2], level: fieldValue(body, "level"), onViolation: fieldValue(body, "on_violation") }; }).filter(Boolean); return { id: metadata.id || id, filePath, status: metadata.status || "unknown", ruleCount: rules.length, rules }; }
function parseFrontMatter(text) { const block = text?.match(/^---\s*\n([\s\S]*?)\n---/); const fields = {}; for (const line of (block?.[1] || "").split("\n")) { const match = line.match(/^([\w-]+):\s*["']?(.+?)["']?\s*$/); if (match) fields[match[1]] = match[2]; } return fields; }
function fieldValue(text, key) { return text.match(new RegExp("^- `" + key + "`: `?([^`\\n]+)", "m"))?.[1]?.trim() || ""; }
function summarizeProgress(tasks) { const completed = tasks.filter((task) => task.status === "completed"); const verified = completed.filter((task) => Boolean(task.result)); return { totalTasks: tasks.length, completedTasks: completed.length, verifiedCompletedTasks: verified.length, percent: tasks.length ? Math.round(completed.length / tasks.length * 100) : 0, activeTasks: tasks.filter((task) => !["completed", "cancelled"].includes(task.status)).length, total: tasks.length, completed: completed.length }; }
function parseCsv(content) { const text = String(content).replace(/^\uFEFF/, ""); const records = []; let record = []; let field = ""; let quoted = false; let hasValue = false; for (let index = 0; index < text.length; index += 1) { const character = text[index]; if (quoted) { if (character === '"' && text[index + 1] === '"') { field += '"'; index += 1; } else if (character === '"') quoted = false; else field += character; hasValue = true; } else if (character === '"') { quoted = true; hasValue = true; } else if (character === ",") { record.push(field); field = ""; hasValue = true; } else if (character === "\n") { record.push(field); if (record.some((value) => value !== "") || hasValue) records.push(record); record = []; field = ""; hasValue = false; } else if (character !== "\r") { field += character; hasValue = true; } } if (quoted) throw new Error("CSV 存在未闭合的引号"); if (record.length || field || hasValue) { record.push(field); if (record.some((value) => value !== "") || hasValue) records.push(record); } if (!records.length) return []; const headers = records.shift().map((header) => header.trim()); if (headers.some((header) => !header) || new Set(headers).size !== headers.length) throw new Error("CSV 表头无效"); return records.map((values, rowIndex) => { if (values.length !== headers.length) throw new Error(`CSV 第 ${rowIndex + 2} 行字段数量不匹配`); return Object.fromEntries(headers.map((header, index) => [header, values[index].trim()])); }); }
async function readJsonRequired(parts, label) { const text = await readTextRequired(parts, label); try { return JSON.parse(text); } catch { throw new Error(`${label} 不是合法 JSON`); } }
async function readOptionalJson(parts) { const text = await readOptionalText(parts); if (text === null) return null; try { return JSON.parse(text); } catch { throw new Error(`${parts.join("/")} 不是合法 JSON`); } }
async function readTextRequired(parts, label) { const text = await readOptionalText(parts); if (text === null) throw new Error(`项目缺少${label}`); return text; }
async function readOptionalText(parts) { try { const response = await fetchProject(parts); return response.text(); } catch (error) { if (isNotFound(error)) return null; throw error; } }
async function hasFileAt(parts) { try { await fetchProject(parts); return true; } catch (error) { if (isNotFound(error)) return false; throw error; } }
async function listDirectoryAt(parts) { const response = await fetchProject(parts, true); return parseDirectoryListing(await response.text(), parts); }
async function getDirectoryOptional(parts) { try { return { path: parts, ...await listDirectoryAt(parts) }; } catch (error) { if (isNotFound(error)) return null; throw error; } }
async function fetchProject(parts, directory = false) { const response = await fetch(projectUrl(parts, directory), { cache: "no-store" }); if (response.ok) return response; const error = new Error(`无法读取 ${parts.join("/")}（HTTP ${response.status}）`); error.name = response.status === 404 ? "NotFoundError" : "NetworkError"; throw error; }
function projectUrl(parts, directory) { return new URL(`${parts.map((part) => encodeURIComponent(part)).join("/")}${directory ? "/" : ""}`, PROJECT_ROOT); }
function parseDirectoryListing(html, parts) { const links = [...String(html).matchAll(/<a[^>]+href=["']([^"']+)["']/gi)].map((match) => match[1]); const listable = /directory listing|index of/i.test(html) || links.some((href) => href === "../" || href.endsWith("/")); if (!listable) return { entries: [], listable: false }; const entries = []; const seen = new Set(); for (const rawHref of links) { if (rawHref === "../" || rawHref.startsWith("?") || rawHref.startsWith("#")) continue; const href = decodeURIComponent(rawHref.split("?")[0]); const name = href.replace(/\/$/, ""); if (!name || name.includes("/") || name.startsWith(".") || name === "node_modules" || seen.has(name)) continue; seen.add(name); entries.push([name, { kind: rawHref.endsWith("/") ? "directory" : "file", path: [...parts, name] }]); } return { entries, listable: true }; }
function safeParts(relativePath) { if (!relativePath || relativePath.startsWith("/") || relativePath.includes("\\")) return null; const parts = relativePath.split("/").filter(Boolean); return parts.includes("..") ? null : parts; }
function documentType(relativePath) { const parts = relativePath.split("/"); return parts[0] === "docs" && parts[1] ? parts[1] : "root"; }
function firstHeading(text) { return text?.match(/^#\s+(.+)$/m)?.[1]?.trim() || ""; }
function latestDate(values) { return values.map((value) => ({ value, time: Date.parse(value || "") })).filter((item) => Number.isFinite(item.time)).sort((left, right) => right.time - left.time)[0]?.value || null; }
function countBy(rows, key) { return rows.reduce((result, row) => { const value = row[key] || "unknown"; result[value] = (result[value] || 0) + 1; return result; }, {}); }
function isNotFound(error) { return error?.name === "NotFoundError" || error?.code === "ENOENT"; }
