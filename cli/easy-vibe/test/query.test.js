import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import test from "node:test";
import { init } from "../lib/init.js";
import { parseCsv } from "../lib/query.js";

const execFileAsync = promisify(execFile);
const CLI = path.resolve(import.meta.dirname, "../bin/easy-vibe.js");

async function runCli(args, options = {}) {
  const { stdout, stderr } = await execFileAsync(process.execPath, [CLI, ...args], {
    encoding: "utf8",
    timeout: 15000,
    ...options
  });
  return { stdout: stdout || "", stderr: stderr || "" };
}

async function withTemporaryDirectory(run) {
  const directory = await mkdtemp(path.join(tmpdir(), "easyvibe-query-test-"));
  try {
    await run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function initializeProject(directory) {
  const project = path.join(directory, "project");
  await init({
    suggestedPath: project,
    acceptSafety: true,
    input: { isTTY: false },
    output: { write() {} }
  });
  return project;
}

test("parseCsv supports quoted commas and escaped quotes", () => {
  assert.deepEqual(parseCsv("id,title,notes\n1,\"A, B\",\"say \"\"hi\"\"\"\n"), [
    { id: "1", title: "A, B", notes: 'say "hi"' }
  ]);
});

test("CLI help lists read-only query commands", async () => {
  const { stdout } = await runCli(["--help"]);
  for (const command of ["info", "status", "workflows", "steps", "docs", "bugs", "context", "specs"]) {
    assert.match(stdout, new RegExp(`easyvibe ${command}`));
  }
  assert.match(stdout, /--json/);
});

test("query commands return project facts as JSON", async () => {
  await withTemporaryDirectory(async (directory) => {
    const project = await initializeProject(directory);
    await mkdir(path.join(project, "docs", "demand"), { recursive: true });
    await writeFile(path.join(project, "docs", "demand", "REQ-query-20260905.md"), "# Query\n", "utf8");
    await writeFile(path.join(project, "status", "works.csv"), [
      "work_id,title,workflow_id,status,current_task_id,summary,next_action,updated_at,task_file,notes",
      "work-20260905-001,CLI 查询,backend-feature,in_progress,T001,查询功能已实现,运行测试,2026-09-05T00:00:00+08:00,status/work/work-20260905-001.csv,"
    ].join("\n") + "\n", "utf8");
    await writeFile(path.join(project, "status", "work", "work-20260905-001.csv"), [
      "task_id,step_id,title,status,depends_on,progress,next_action,changed_paths,result,updated_at,notes",
      "T001,coding,实现查询,in_progress,,已完成实现,补充测试,cli/easy-vibe,,2026-09-05T00:00:00+08:00,"
    ].join("\n") + "\n", "utf8");
    await writeFile(path.join(project, "docs", "bug", "bugs.csv"), [
      "bug_id,title,status,severity,found_date,updated_date,detail_file,notes",
      "BUG-001,查询输出异常,open,high,2026-09-05,2026-09-05,docs/bug/list/BUG-query-20260905.md,"
    ].join("\n") + "\n", "utf8");

    const info = JSON.parse((await runCli(["info", project, "--json"])).stdout);
    assert.equal(info.command, "info");
    assert.equal(info.marker.type, "easyvibe-project");
    assert.equal(info.agentEntry.exists, true);

    const status = JSON.parse((await runCli(["status", project, "--work", "work-20260905-001", "--json"])).stdout);
    assert.equal(status.summary.workCount, 1);
    assert.equal(status.summary.taskCount, 1);
    assert.equal(status.works[0].tasks[0].task_id, "T001");

    const workflow = JSON.parse((await runCli(["workflow", project, "backend-feature", "--json"])).stdout);
    assert.equal(workflow.workflow.id, "backend-feature");
    assert.ok(workflow.workflow.nodes.length > 0);

    const step = JSON.parse((await runCli(["steps", project, "coding", "--json"])).stdout);
    assert.equal(step.step.id, "coding");
    assert.equal(step.step.safety.riskLevel, "medium");
    assert.ok(step.step.files.specification.endsWith("spec/steps/coding/README.md"));

    const docs = JSON.parse((await runCli(["docs", project, "--type", "demand", "--json"])).stdout);
    assert.equal(docs.count, 1);
    assert.equal(docs.files[0].relativePath, "docs/demand/REQ-query-20260905.md");

    const bugs = JSON.parse((await runCli(["bugs", project, "--severity=high", "--json"])).stdout);
    assert.equal(bugs.count, 1);
    assert.equal(bugs.bugs[0].bug_id, "BUG-001");
    assert.equal(bugs.bugs[0].detailExists, false);

    const context = JSON.parse((await runCli(["context", project, "--json"])).stdout);
    assert.equal(context.command, "context");
    assert.equal(context.current.activeWorks[0].work_id, "work-20260905-001");
    assert.ok(context.available.workflows.some((item) => item.id === "backend-feature"));
    assert.ok(context.available.steps.some((item) => item.id === "coding"));
    assert.equal(context.indexes.documents.byType.demand, 1);

    const specs = JSON.parse((await runCli(["specs", project, "--json"])).stdout);
    assert.equal(specs.command, "specs");
    assert.equal(specs.count, 4);
    assert.ok(specs.specs.some((item) => item.id === "engineering-ui" && item.exists));
    const databaseSpec = JSON.parse((await runCli(["spec", project, "engineering-database", "--json"])).stdout);
    assert.equal(databaseSpec.spec.id, "engineering-database");

    const markerBefore = await readFile(path.join(project, ".easyvibe.json"), "utf8");
    await runCli(["status", project, "--json"]);
    assert.equal(await readFile(path.join(project, ".easyvibe.json"), "utf8"), markerBefore);
  });
});

test("query commands reject uninitialized projects", async () => {
  await withTemporaryDirectory(async (directory) => {
    await assert.rejects(
      runCli(["status", directory, "--json"]),
      (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, /未发现 Easy Vibe 项目标记/);
        return true;
      }
    );
  });
});

test("query argument validation rejects unsupported flags and selectors", async () => {
  await withTemporaryDirectory(async (directory) => {
    const project = await initializeProject(directory);
    await assert.rejects(
      runCli(["status", project, "--unknown", "--json"]),
      (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, /不支持参数/);
        return true;
      }
    );
    await assert.rejects(
      runCli(["docs", project, "--type", "unknown", "--json"]),
      (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, /不支持文档类型/);
        return true;
      }
    );
  });
});
