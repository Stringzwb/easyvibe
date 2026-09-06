import assert from "node:assert/strict";
import { chmod, mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { PassThrough } from "node:stream";
import test from "node:test";
import {
  AGENT_ENTRY,
  CODEX_INSTALL_PROMPT,
  CODEX_SKILL_SOURCE,
  MARKER_FILE,
  SCAFFOLD_DIRECTORIES,
  assertWritableLocation,
  chooseProjectLocation,
  init,
  readExistingProject,
  resolveProjectPath
} from "../lib/init.js";
import { DEFAULT_STEPS, DEFAULT_WORKFLOWS } from "../lib/defaults.js";

const silentInput = { isTTY: false };

function captureOutput() {
  let value = "";
  return {
    stream: { write(chunk) { value += String(chunk); } },
    value() { return value; }
  };
}

async function withTemporaryDirectory(run) {
  const directory = await mkdtemp(path.join(tmpdir(), "easyvibe-test-"));
  try {
    await run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("resolveProjectPath resolves relative paths from the selected cwd", () => {
  assert.equal(resolveProjectPath("../project", "/work/current"), path.resolve("/work/current", "../project"));
});

test("default workflows only reference strictly defined default steps", () => {
  const stepIds = new Set(DEFAULT_STEPS.map((step) => step.id));
  assert.equal(stepIds.size, 10);
  assert.equal(DEFAULT_WORKFLOWS.length, 5);
  const projectInfoStep = DEFAULT_STEPS.find((step) => step.id === "project-info-approval");
  assert.ok(projectInfoStep);
  assert.deepEqual(projectInfoStep.paths.write, ["/README.md", "/spec/namespec.md", "/status"]);
  assert.ok(projectInfoStep.rules.some((rule) => rule.id === "STP-PROJECT-INFO-APPROVAL-004"));
  for (const step of DEFAULT_STEPS) {
    assert.ok(step.paths.read.length > 0, `${step.id} read paths`);
    assert.ok(step.paths.write.length > 0, `${step.id} write paths`);
    assert.ok(step.rules.length >= 4, `${step.id} spec rules`);
  }
  for (const workflow of DEFAULT_WORKFLOWS) {
    assert.ok(workflow.nodes.some((node) => node.id === workflow.entry), `${workflow.id} entry`);
    for (const node of workflow.nodes) assert.ok(stepIds.has(node.step), `${workflow.id}/${node.id}`);
  }
  for (const workflow of DEFAULT_WORKFLOWS.filter((workflow) => workflow.id !== "release-deployment")) {
    assert.equal(workflow.entry, "project-information", `${workflow.id} entry`);
    assert.ok(workflow.nodes.some((node) => node.step === "project-info-approval"), `${workflow.id} project info`);
  }
});

test("interactive location selection prompts and defaults to the current directory", async () => {
  const input = new PassThrough();
  input.isTTY = true;
  const output = new PassThrough();
  let prompt = "";
  output.on("data", (chunk) => { prompt += chunk; });
  setImmediate(() => input.end("\n"));

  const selected = await chooseProjectLocation({ cwd: "/work/current", input, output });

  assert.equal(selected, "/work/current");
  assert.match(prompt, /请选择项目位置.*直接回车/);
});

test("init creates the complete scaffold and writes the marker last", async () => {
  await withTemporaryDirectory(async (temporaryRoot) => {
    const target = path.join(temporaryRoot, "existing-project");
    const output = captureOutput();
    const result = await init({ suggestedPath: target, acceptSafety: true, input: silentInput, output: output.stream });

    assert.equal(result.recognized, false);
    assert.equal(result.preservedFiles, 0);
    assert.equal(result.agentEntry, path.join(target, AGENT_ENTRY));
    assert.match(output.value(), /AGENT ENTRY[\s\S]*入口文件:/);
    assert.equal(result.codexSkillSource, path.join(target, CODEX_SKILL_SOURCE));
    assert.match(output.value(), /CODEX SKILL[\s\S]*Skill 源码:/);
    assert.match(output.value(), new RegExp(CODEX_INSTALL_PROMPT.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

    for (const directory of Object.keys(SCAFFOLD_DIRECTORIES)) {
      assert.equal((await stat(path.join(target, directory))).isDirectory(), true, directory);
    }

    const marker = JSON.parse(await readFile(path.join(target, MARKER_FILE), "utf8"));
    assert.equal(marker.type, "easyvibe-project");
    assert.equal(marker.agentEntry, AGENT_ENTRY);
    assert.equal(marker.safetyPolicy, "deploy/safe.json");
    assert.ok(marker.safetyConfirmedAt);
    assert.match(await readFile(result.agentEntry, "utf8"), /Easy Vibe Agent Guide/);
    assert.match(await readFile(path.join(result.codexSkillSource, "SKILL.md"), "utf8"), /name: easy-vibe/);
    const workflowConfig = JSON.parse(await readFile(path.join(target, "workflow", "workflows.json"), "utf8"));
    assert.equal(workflowConfig.version, 1);
    assert.equal(workflowConfig.workflows.length, DEFAULT_WORKFLOWS.length);
    for (const step of DEFAULT_STEPS) {
      assert.equal((await stat(path.join(target, "workflow", "steps", step.id, "step.json"))).isFile(), true);
      assert.equal((await stat(path.join(target, "workflow", "steps", step.id, "README.md"))).isFile(), true);
      assert.equal((await stat(path.join(target, "spec", "steps", step.id, "README.md"))).isFile(), true);
    }
    assert.equal((await stat(path.join(target, "view/index.html"))).isFile(), true);
    assert.equal((await stat(path.join(target, "view/assets"))).isDirectory(), true);
    assert.match(await readFile(path.join(target, "view/index.html"), "utf8"), /\.\/assets\/index-[^"']+\.(?:js|css)/);

    await assert.rejects(stat(path.join(target, "cli")), { code: "ENOENT" });
    await assert.rejects(stat(path.join(target, ".agents", "skills", "easy-vibe")), { code: "ENOENT" });
  });
});

test("init preserves files that already exist before first initialization", async () => {
  await withTemporaryDirectory(async (target) => {
    const original = "# Existing project\n\nDo not overwrite me.\n";
    await writeFile(path.join(target, "README.md"), original, "utf8");
    const output = captureOutput();

    const result = await init({ suggestedPath: target, acceptSafety: true, input: silentInput, output: output.stream });

    assert.equal(await readFile(path.join(target, "README.md"), "utf8"), original);
    assert.ok(result.preservedFiles > 0);
    assert.match(output.value(), /保留已有文件:/);
  });
});

test("a marked project is only recognized and is never repaired or changed", async () => {
  await withTemporaryDirectory(async (target) => {
    await init({ suggestedPath: target, acceptSafety: true, input: silentInput, output: captureOutput().stream });
    const markerBefore = await readFile(path.join(target, MARKER_FILE), "utf8");
    await rm(path.join(target, "status"), { recursive: true });

    const output = captureOutput();
    const result = await init({ suggestedPath: target, input: silentInput, output: output.stream });

    assert.equal(result.recognized, true);
    assert.equal(result.createdDirectories, 0);
    assert.equal(result.createdFiles, 0);
    assert.equal(await readFile(path.join(target, MARKER_FILE), "utf8"), markerBefore);
    await assert.rejects(stat(path.join(target, "status")), { code: "ENOENT" });
    assert.match(output.value(), /不会创建或覆盖任何内容/);
  });
});

test("an invalid marker stops initialization without overwriting it", async () => {
  await withTemporaryDirectory(async (target) => {
    const markerPath = path.join(target, MARKER_FILE);
    await writeFile(markerPath, "not-json\n", "utf8");

    await assert.rejects(
      init({ suggestedPath: target, input: silentInput, output: captureOutput().stream }),
      /标记文件无效.*不会覆盖|标记文件无效.*初始化已停止/
    );
    assert.equal(await readFile(markerPath, "utf8"), "not-json\n");
  });
});

test("readExistingProject rejects an agent entry outside the project", async () => {
  await withTemporaryDirectory(async (target) => {
    await writeFile(path.join(target, MARKER_FILE), JSON.stringify({
      version: 1,
      type: "easyvibe-project",
      agentEntry: "../outside.md"
    }), "utf8");

    await assert.rejects(readExistingProject(target), /agentEntry 必须是项目内的相对路径/);
  });
});

test("init reports a clear conflict when the selected location is a file", async () => {
  await withTemporaryDirectory(async (temporaryRoot) => {
    const target = path.join(temporaryRoot, "project-file");
    await writeFile(target, "occupied", "utf8");

    await assert.rejects(
      init({ suggestedPath: target, input: silentInput, output: captureOutput().stream }),
      /目标位置不是目录/
    );
  });
});

test("non-interactive initialization requires explicit safety acceptance and leaves no marker", async () => {
  await withTemporaryDirectory(async (target) => {
    await assert.rejects(
      init({ suggestedPath: target, input: silentInput, output: captureOutput().stream }),
      /--accept-safety.*标记尚未写入/
    );
    await assert.rejects(stat(path.join(target, MARKER_FILE)), { code: "ENOENT" });
    assert.equal((await stat(path.join(target, AGENT_ENTRY))).isFile(), true);

    const completed = await init({
      suggestedPath: target,
      acceptSafety: true,
      input: silentInput,
      output: captureOutput().stream
    });
    assert.equal(completed.recognized, false);
    assert.equal((await stat(path.join(target, MARKER_FILE))).isFile(), true);
  });
});

test("permission failures explain the blocked location and next action", async (context) => {
  if (process.platform === "win32") return context.skip("POSIX permission test");

  await withTemporaryDirectory(async (temporaryRoot) => {
    const locked = path.join(temporaryRoot, "locked");
    await mkdir(locked);
    await chmod(locked, 0o500);
    try {
      await assert.rejects(
        assertWritableLocation(path.join(locked, "project")),
        /没有写入权限.*请选择有写入权限的目录/
      );
    } finally {
      await chmod(locked, 0o700);
    }
  });
});
