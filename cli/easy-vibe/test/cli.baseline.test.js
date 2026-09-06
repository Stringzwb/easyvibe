import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import test from "node:test";

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

async function withTempDirectory(run) {
  const dir = await mkdtemp(path.join(tmpdir(), "evb-cli-"));
  try {
    await run(dir);
  } finally {
    await import("node:fs/promises").then(({ rm }) => rm(dir, { recursive: true, force: true }));
  }
}

test("CLI --version prints the current version", async () => {
  const { stdout, stderr } = await runCli(["--version"]);
  assert.match(stdout, /^0\.5\.0\n?$/);
  assert.equal(stderr, "");
});

test("CLI --help prints usage with logo and init command", async () => {
  const { stdout, stderr } = await runCli(["--help"]);
  assert.match(stdout, /EASY VIBE/);
  assert.match(stdout, /easyvibe init/);
  assert.match(stdout, /easyvibe --version/);
  assert.equal(stderr, "");
});

test("CLI without arguments prints usage", async () => {
  const { stdout, stderr } = await runCli([]);
  assert.match(stdout, /EASY VIBE/);
  assert.match(stdout, /easyvibe init/);
  assert.equal(stderr, "");
});

test("CLI unknown command exits 1 and prints error to stderr", async () => {
  await assert.rejects(
    runCli(["unknown-command"]),
    (error) => {
      assert.ok(error.stderr.includes("未知命令"), `expected 未知命令 in stderr, got: ${error.stderr}`);
      assert.equal(error.code, 1);
      return true;
    }
  );
});

test("CLI init --help prints init-specific usage", async () => {
  const { stdout, stderr } = await runCli(["init", "--help"]);
  assert.match(stdout, /INIT/);
  assert.match(stdout, /--accept-safety/);
  assert.equal(stderr, "");
});

test("CLI init with unknown flag exits 1", async () => {
  await withTempDirectory(async (dir) => {
    await assert.rejects(
      runCli(["init", dir, "--unknown-flag"]),
      (error) => {
        assert.ok(error.stderr.includes("不支持参数"), `expected 不支持参数 in stderr, got: ${error.stderr}`);
        assert.equal(error.code, 1);
        return true;
      }
    );
  });
});

test("CLI init with too many paths exits 1", async () => {
  await withTempDirectory(async (dir) => {
    await assert.rejects(
      runCli(["init", dir, "extra-path"]),
      (error) => {
        assert.ok(error.stderr.includes("最多接受一个项目路径"), `expected 最多接受一个项目路径 in stderr, got: ${error.stderr}`);
        assert.equal(error.code, 1);
        return true;
      }
    );
  });
});
