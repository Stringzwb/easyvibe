import { constants } from "node:fs";
import { access, lstat, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { fileURLToPath } from "node:url";
import { createDefaultFiles } from "./defaults.js";
import { createUi } from "./ui.js";

export const MARKER_FILE = ".easyvibe.json";
export const AGENT_ENTRY = "guide/README.md";
export const CODEX_SKILL_SOURCE = "agent/codex/skills/easy-vibe";
export const CODEX_INSTALL_PROMPT = "请读取 agent/codex/README.md，把项目内的 easy-vibe Skill 安装到当前项目。本次只安装 Skill，不开始业务任务。";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templateRoot = path.join(packageRoot, "template");

export const SCAFFOLD_DIRECTORIES = {
  "agent": "Coding Agent 入口适配。",
  "agent/claudecode": "Claude Code 入口适配。",
  "agent/codex": "Codex 入口适配。",
  "code": "项目业务代码；这是唯一的业务代码目录。",
  "command": "项目级自动化脚本和命令入口。",
  "command/data": "数据处理脚本及其接口契约。",
  "command/deploy": "部署和回滚脚本及其接口契约。",
  "command/service": "服务生命周期脚本及其接口契约。",
  "data": "项目使用或产生的非代码数据。",
  "data/datasets": "具有明确用途和来源的数据集。",
  "data/downloads": "业务程序从外部下载的内容。",
  "data/static": "等待处理或迁移的临时静态资源。",
  "deploy": "部署、环境和运维信息。",
  "deploy/artifact": "构建完成的可交付或可部署制品。",
  "deploy/env": "环境连接元数据和安全索引。",
  "deploy/env/database": "数据库环境配置。",
  "deploy/env/filesystem": "文件系统环境配置。",
  "deploy/env/git": "Git 环境配置。",
  "deploy/env/ssh": "SSH 环境配置。",
  "deploy/info": "部署与运维说明。",
  "deploy/log": "部署与运维日志。",
  "deploy/runtime": "经用户确认后保存的最小临时运行时。",
  "docs": "项目文档。",
  "docs/bug": "Bug 索引与详情。",
  "docs/bug/list": "每个 Bug 的完整记录。",
  "docs/demand": "需求文档。",
  "docs/design": "设计文档。",
  "docs/meet": "会议记录。",
  "docs/record": "项目过程记录。",
  "docs/test": "测试文档与验证证据。",
  "guide": "Coding Agent 接入项目后的执行入口。",
  "spec": "项目执行规约。",
  "spec/custom": "可复用的自定义专项规约。",
  "spec/directories": "每个主目录的独立目录规约。",
  "spec/steps": "与 workflow Step 严格一一绑定的步骤规约。",
  "status": "当前工作状态和中断恢复信息。",
  "status/work": "每项主工作的子任务清单。",
  "view": "Easy Vibe 本地工作台文件；不属于业务代码。",
  "workflow": "工作流定义和可复用 Step。",
  "workflow/steps": "Step 的运行方式、路径权限和完成条件。"
};

export async function init({
  suggestedPath,
  acceptSafety = false,
  cwd = process.cwd(),
  input = stdin,
  output = stdout
} = {}) {
  const ui = createUi(output);
  ui.banner();
  const selected = await chooseProjectLocation({ suggestedPath, cwd, input, output });
  const root = resolveProjectPath(selected, cwd);
  ui.section("PROJECT DISCOVERY", "确认位置并识别现有项目");
  ui.item("项目位置", root);

  const existing = await readExistingProject(root);
  if (existing) {
    const agentEntry = path.join(root, existing.agentEntry);
    const codexSkillSource = path.join(root, CODEX_SKILL_SOURCE);
    ui.close("发现隐藏项目标记");
    ui.success("已识别为 Easy Vibe 项目，不会创建或覆盖任何内容");
    ui.section("AGENT ENTRY", "将以下路径交给 Coding Agent");
    ui.item("入口文件", agentEntry);
    ui.close("项目识别完成");
    if (!(await pathExists(agentEntry))) ui.warning("标记文件声明的 Agent 入口当前不存在，请人工检查项目完整性");
    ui.section("CODEX SKILL", "用 Codex 打开项目后，按项目内说明安装 Skill");
    ui.item("Skill 源码", codexSkillSource);
    ui.item("安装说明", path.join(root, "agent/codex/README.md"));
    ui.item("对 Codex 说", CODEX_INSTALL_PROMPT);
    ui.close("请 Codex 只安装 Skill，然后新建会话");
    if (!(await pathExists(path.join(codexSkillSource, "SKILL.md")))) ui.warning("当前项目没有 Codex Skill 源码；已标记项目不会由 init 自动修复");
    return { root, agentEntry, codexSkillSource, recognized: true, createdDirectories: 0, createdFiles: 0, preservedFiles: 0 };
  }

  ui.close("未发现项目标记，准备初始化");
  ui.section("PERMISSION CHECK", "验证目标位置是否允许创建内容");
  await assertWritableLocation(root);
  ui.close("权限检查通过");

  ui.section("WORKSPACE SETUP", "创建缺失项并保留全部已有内容");
  const result = { root, recognized: false, createdDirectories: 0, createdFiles: 0, preservedFiles: 0 };
  await createDirectory(root, result);

  for (const directory of Object.keys(SCAFFOLD_DIRECTORIES)) {
    await createDirectory(path.join(root, directory), result);
  }

  await copyTemplateDirectory(templateRoot, root, result);

  for (const [relativePath, content] of createDefaultFiles()) {
    const destination = path.join(root, relativePath);
    await createDirectory(path.dirname(destination), result);
    await writeIfMissing(destination, content, result);
  }

  for (const [directory, description] of Object.entries(SCAFFOLD_DIRECTORIES)) {
    if (directory.includes("/")) continue;
    if (await pathExists(path.join(templateRoot, directory, "README.md"))) continue;
    await writeIfMissing(
      path.join(root, directory, "README.md"),
      `# ${path.basename(directory)}\n\n${description}\n`,
      result
    );
  }

  const safety = await loadSafetyPolicy(root);
  await confirmSafetyPolicy({ safety, acceptSafety, input, output, ui });

  const safetyConfirmedAt = new Date().toISOString();
  const marker = {
    version: 1,
    type: "easyvibe-project",
    agentEntry: AGENT_ENTRY,
    safetyPolicy: "deploy/safe.json",
    safetyConfirmedAt,
    initializedAt: safetyConfirmedAt
  };
  await writeIfMissing(path.join(root, MARKER_FILE), `${JSON.stringify(marker, null, 2)}\n`, result);

  const agentEntry = path.join(root, AGENT_ENTRY);
  const codexSkillSource = path.join(root, CODEX_SKILL_SOURCE);
  ui.item("新建目录", String(result.createdDirectories));
  ui.item("新建文件", String(result.createdFiles));
  if (result.preservedFiles > 0) ui.item("保留已有文件", String(result.preservedFiles));
  ui.close("隐藏项目标记已写入");
  ui.success("Easy Vibe 初始化完成");
  ui.section("AGENT ENTRY", "将以下路径交给 Coding Agent");
  ui.item("入口文件", agentEntry);
  ui.close("请让 Coding Agent 首先读取该文件");
  ui.section("WORKBENCH", "项目内置的只读可视化工作台");
  ui.item("入口文件", path.join(root, "view", "index.html"));
  ui.item("运行方式", "easyvibe view <项目路径>");
  ui.close("已复制预构建 dist；不需要安装 Vue、Vite 或业务后端");
  ui.section("CODEX SKILL", "用 Codex 打开项目后，按项目内说明安装 Skill");
  ui.item("Skill 源码", codexSkillSource);
  ui.item("安装说明", path.join(root, "agent/codex/README.md"));
  ui.item("对 Codex 说", CODEX_INSTALL_PROMPT);
  ui.close("请 Codex 只安装 Skill，然后新建会话");

  return { ...result, agentEntry, codexSkillSource };
}

export async function chooseProjectLocation({ suggestedPath, cwd, input, output }) {
  const fallback = resolveProjectPath(suggestedPath || cwd, cwd);
  if (!input?.isTTY) return fallback;

  const rl = readline.createInterface({ input, output });
  try {
    const ui = createUi(output);
    const answer = await rl.question(ui.prompt(`请选择项目位置（直接回车使用 ${fallback}）：`));
    return answer.trim() || fallback;
  } finally {
    rl.close();
  }
}

export function resolveProjectPath(value, cwd = process.cwd()) {
  const raw = String(value || cwd).trim();
  let expanded = raw;
  if (raw === "~") expanded = homedir();
  else if (raw.startsWith("~/") || raw.startsWith("~\\")) expanded = path.join(homedir(), raw.slice(2));
  return path.resolve(cwd, expanded);
}

export async function readExistingProject(root) {
  let rootInfo;
  try {
    rootInfo = await lstat(root);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw normalizeReadError(error, root);
  }
  if (!rootInfo.isDirectory()) throw new Error(`目标位置不是目录：${root}`);

  const markerPath = path.join(root, MARKER_FILE);
  let content;
  try {
    content = await readFile(markerPath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw normalizeReadError(error, markerPath);
  }

  let marker;
  try {
    marker = JSON.parse(content);
  } catch (error) {
    throw new Error(`Easy Vibe 标记文件无效：${markerPath} 不是合法 JSON。为避免覆盖，初始化已停止。`);
  }
  if (marker?.version !== 1 || marker?.type !== "easyvibe-project") {
    throw new Error(`Easy Vibe 标记文件无效：${markerPath} 缺少受支持的 version 或 type。为避免覆盖，初始化已停止。`);
  }
  if (!isSafeRelativePath(marker.agentEntry)) {
    throw new Error(`Easy Vibe 标记文件无效：agentEntry 必须是项目内的相对路径。为避免覆盖，初始化已停止。`);
  }
  return marker;
}

export async function assertWritableLocation(target) {
  let cursor = target;
  while (true) {
    try {
      const info = await lstat(cursor);
      if (!info.isDirectory()) throw new Error(`目标位置不是目录：${cursor}`);
      try {
        await access(cursor, constants.W_OK | constants.X_OK);
      } catch (error) {
        throw permissionError(target, cursor, error);
      }
      return;
    } catch (error) {
      if (["EACCES", "EPERM", "EROFS"].includes(error.code)) throw permissionError(target, cursor, error);
      if (error.code !== "ENOENT") throw error;
      const parent = path.dirname(cursor);
      if (parent === cursor) throw new Error(`无法找到可创建项目的上级目录：${target}`);
      cursor = parent;
    }
  }
}

export async function loadSafetyPolicy(root) {
  const file = path.join(root, "deploy", "safe.json");
  let safety;
  try {
    safety = JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error(`总安全配置无效：${file} 不是合法 JSON。隐藏项目标记不会写入。`);
    throw normalizeReadError(error, file);
  }
  if (safety?.version !== 1 || !Array.isArray(safety.principles) || safety.principles.length === 0) {
    throw new Error(`总安全配置无效：${file} 必须包含 version=1 和非空 principles。隐藏项目标记不会写入。`);
  }
  for (const principle of safety.principles) {
    if (!principle?.id || !principle?.name || !principle?.requirement) {
      throw new Error(`总安全配置无效：每条 principle 都必须包含 id、name 和 requirement。隐藏项目标记不会写入。`);
    }
  }
  return safety;
}

export async function confirmSafetyPolicy({ safety, acceptSafety, input, output, ui = createUi(output) }) {
  ui.section("SAFETY AGREEMENT", "初始化完成前必须确认项目总安全准则");
  safety.principles.forEach((principle, index) => ui.item(`${index + 1}. ${principle.name}`, principle.requirement));
  ui.item("规则优先级", "对话中新安全规则 > 项目总安全规则 > Step 安全规则");

  if (acceptSafety) {
    ui.close("已通过 --accept-safety 明确确认");
    return true;
  }
  if (!input?.isTTY) {
    ui.close("等待确认");
    throw new Error("非交互环境无法询问安全确认。请阅读 deploy/safe.json 后使用 --accept-safety 重新运行；隐藏项目标记尚未写入。");
  }

  const rl = readline.createInterface({ input, output });
  try {
    const answer = (await rl.question(ui.prompt("是否确认并接受以上总安全准则？[y/N]："))).trim().toLowerCase();
    if (!["y", "yes", "是", "确认", "同意"].includes(answer)) {
      ui.close("未确认安全准则");
      throw new Error("初始化未完成：用户未确认总安全准则。已创建内容会保留，但隐藏项目标记不会写入。");
    }
    ui.close("总安全准则已确认");
    return true;
  } finally {
    rl.close();
  }
}

async function copyTemplateDirectory(source, destination, result) {
  let entries;
  try {
    entries = await readdir(source, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") throw new Error(`CLI 初始化模板缺失：${source}`);
    throw error;
  }

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      await createDirectory(destinationPath, result);
      await copyTemplateDirectory(sourcePath, destinationPath, result);
    } else if (entry.isFile()) {
      await writeIfMissing(destinationPath, await readFile(sourcePath), result);
    }
  }
}

async function createDirectory(directory, result) {
  try {
    const info = await lstat(directory);
    if (!info.isDirectory()) throw new Error(`需要创建目录，但路径已被文件占用：${directory}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw normalizeWriteError(error, directory);
    try {
      await mkdir(directory, { recursive: true });
      result.createdDirectories += 1;
    } catch (caught) {
      throw normalizeWriteError(caught, directory);
    }
  }
}

async function writeIfMissing(file, content, result) {
  try {
    await lstat(file);
    result.preservedFiles += 1;
    return;
  } catch (error) {
    if (error.code !== "ENOENT") throw normalizeWriteError(error, file);
  }

  try {
    await writeFile(file, content, { flag: "wx" });
    result.createdFiles += 1;
  } catch (error) {
    if (error.code === "EEXIST") {
      result.preservedFiles += 1;
      return;
    }
    throw normalizeWriteError(error, file);
  }
}

async function pathExists(target) {
  try {
    await lstat(target);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw normalizeReadError(error, target);
  }
}

function isSafeRelativePath(value) {
  if (typeof value !== "string" || !value.trim() || path.isAbsolute(value)) return false;
  return !value.split(/[\\/]+/).includes("..");
}

function normalizeReadError(error, target) {
  if (["EACCES", "EPERM"].includes(error.code)) return new Error(`无法读取 ${target}：当前用户没有读取权限。`);
  return error;
}

function normalizeWriteError(error, target) {
  if (["EACCES", "EPERM", "EROFS"].includes(error.code)) return permissionError(target, path.dirname(target), error);
  return error;
}

function permissionError(target, checkedPath, error) {
  const reason = error.code === "EROFS" ? "文件系统为只读" : "当前用户没有写入权限";
  return new Error(`无法在 ${target} 初始化项目：${reason}（检查位置：${checkedPath}）。请选择有写入权限的目录，或调整该目录权限后重试。`);
}
