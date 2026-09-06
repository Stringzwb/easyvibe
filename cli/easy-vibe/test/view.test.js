import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { parseViewArgs, startViewServer } from "../lib/view.js";

async function withTemporaryDirectory(run) {
  const directory = await mkdtemp(path.join(tmpdir(), "easyvibe-view-test-"));
  try {
    await run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("view argument parsing accepts a project path, no-open, and an automatic port", () => {
  assert.deepEqual(parseViewArgs(["./project", "--no-open", "--port=0"]), {
    positionals: ["./project"],
    options: { help: false, noOpen: true, port: 0 }
  });
});

test("view server starts from a project without an Easy Vibe marker", async () => {
  await withTemporaryDirectory(async (directory) => {
    await mkdir(path.join(directory, "view"), { recursive: true });
    await writeFile(path.join(directory, "view", "index.html"), "<!doctype html><title>view</title>", "utf8");

    const started = await startViewServer({ projectPath: directory, port: 0 });
    try {
      const response = await fetch(started.url);
      assert.equal(response.status, 200);
      assert.match(await response.text(), /<title>view<\/title>/);
    } finally {
      await new Promise((resolve) => started.server.close(resolve));
    }
  });
});

test("view snapshot keeps loading when a new Step directory has no step.json yet", async () => {
  await withTemporaryDirectory(async (directory) => {
    await mkdir(path.join(directory, "view"), { recursive: true });
    await mkdir(path.join(directory, "workflow", "steps", "data-acquisition"), { recursive: true });
    await writeFile(path.join(directory, "view", "index.html"), "<!doctype html><title>view</title>", "utf8");
    await writeFile(path.join(directory, "workflow", "workflows.json"), JSON.stringify({ workflows: [] }), "utf8");

    const started = await startViewServer({ projectPath: directory, port: 0 });
    const previousDocument = globalThis.document;
    globalThis.document = { baseURI: started.url, body: { dataset: { projectRoot: "../" } } };
    try {
      const { createSnapshot } = await import(`../../../view-src/src/data/projectSnapshot.js?test=${Date.now()}`);
      const snapshot = await createSnapshot();
      const step = snapshot.steps.find((item) => item.id === "data-acquisition");

      assert.ok(step);
      assert.equal(step.available, false);
      assert.equal(step.name, "Step 创建中");
      assert.ok(snapshot.warnings.some((warning) => warning.includes("workflow/steps/data-acquisition/step.json")));
    } finally {
      globalThis.document = previousDocument;
      await new Promise((resolve) => started.server.close(resolve));
    }
  });
});
