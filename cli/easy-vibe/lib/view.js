import { createServer } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { resolveProjectPath } from "./init.js";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
};

export function parseViewArgs(args = []) {
  const positionals = [];
  const options = { help: false, noOpen: false, port: 4173 };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (["--help", "-h"].includes(argument)) {
      options.help = true;
      continue;
    }
    if (argument === "--no-open") {
      options.noOpen = true;
      continue;
    }
    if (argument === "--port" || argument.startsWith("--port=")) {
      const value = argument === "--port" ? args[++index] : argument.slice("--port=".length);
      if (!value || value.startsWith("-")) throw new Error(`${argument === "--port" ? argument : "--port"} 需要一个端口值`);
      const port = Number(value);
      if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error(`端口无效：${value}（应为 0-65535 的整数）`);
      options.port = port;
      continue;
    }
    if (argument.startsWith("-")) throw new Error(`view 不支持参数：${argument}`);
    positionals.push(argument);
  }
  if (positionals.length > 1) throw new Error("view 最多接受一个项目路径");
  return { positionals, options };
}

export async function startViewServer({ projectPath, cwd = process.cwd(), port = 4173, host = "127.0.0.1" } = {}) {
  const root = resolveProjectPath(projectPath, cwd);
  if (!(await isFile(path.join(root, "view", "index.html")))) throw new Error(`项目缺少可视化入口：${path.join(root, "view", "index.html")}`);

  const requestedPort = Number(port);
  if (!Number.isInteger(requestedPort) || requestedPort < 0 || requestedPort > 65535) throw new Error(`端口无效：${port}`);
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const candidate = requestedPort === 0 ? 0 : requestedPort + attempt;
    if (candidate > 65535) break;
    const server = createViewServer(root);
    try {
      const actualPort = await listen(server, candidate, host);
      return { root, port: actualPort, url: `http://${host}:${actualPort}/view/`, server };
    } catch (error) {
      if (error.code !== "EADDRINUSE") throw error;
    }
  }
  throw new Error(`无法找到可用端口：已尝试 ${requestedPort}-${Math.min(requestedPort + 24, 65535)}`);
}

export function openBrowser(url) {
  const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { detached: true, stdio: "ignore", windowsHide: true });
    const onError = (error) => reject(error);
    child.once("error", onError);
    child.once("spawn", () => {
      child.removeListener("error", onError);
      child.unref();
      resolve();
    });
  });
}

export function waitForServerShutdown(server) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      process.removeListener("SIGINT", shutdown);
      process.removeListener("SIGTERM", shutdown);
      resolve();
    };
    const shutdown = () => server.close(finish);
    server.once("close", finish);
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  });
}

function createViewServer(root) {
  return createServer((request, response) => {
    serveRequest(root, request, response).catch((error) => {
      if (response.headersSent) response.destroy(error);
      else respond(response, error.code === "ENOENT" ? 404 : 500, error.code === "ENOENT" ? "Not Found" : "Internal Server Error");
    });
  });
}

async function serveRequest(root, request, response) {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.setHeader("Allow", "GET, HEAD");
    respond(response, 405, "Method Not Allowed");
    return;
  }
  const requestUrl = new URL(request.url || "/", "http://easyvibe.local");
  const pathname = decodeURIComponent(requestUrl.pathname);
  if (pathname === "/") {
    response.writeHead(302, { Location: "/view/", "Cache-Control": "no-store" });
    response.end();
    return;
  }
  const filePath = resolveInside(root, pathname);
  let info;
  try {
    info = await stat(filePath);
  } catch (error) {
    if (error.code === "ENOENT") return respond(response, 404, "Not Found");
    throw error;
  }
  if (info.isDirectory()) {
    if (!pathname.endsWith("/")) {
      response.writeHead(301, { Location: `${pathname}/`, "Cache-Control": "no-store" });
      response.end();
      return;
    }
    const indexPath = path.join(filePath, "index.html");
    if (await isFile(indexPath)) return serveFile(indexPath, request, response);
    return serveDirectoryListing(filePath, pathname, request, response);
  }
  return serveFile(filePath, request, response);
}

async function serveFile(filePath, request, response) {
  const body = await readFile(filePath);
  response.writeHead(200, { "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream", "Content-Length": body.byteLength, "Cache-Control": "no-store" });
  if (request.method !== "HEAD") response.end(body);
  else response.end();
}

async function serveDirectoryListing(directoryPath, pathname, request, response) {
  const entries = (await readdir(directoryPath, { withFileTypes: true }))
    .filter((entry) => !entry.name.startsWith(".") && entry.name !== "node_modules")
    .sort((left, right) => left.name.localeCompare(right.name));
  const links = ["<li><a href=\"../\">../</a></li>", ...entries.map((entry) => {
    const href = `${encodeURIComponent(entry.name)}${entry.isDirectory() ? "/" : ""}`;
    return `<li><a href=\"${href}\">${escapeHtml(entry.name)}${entry.isDirectory() ? "/" : ""}</a></li>`;
  })].join("");
  const body = `<!doctype html><html><head><meta charset=\"utf-8\"><title>Directory listing for ${escapeHtml(pathname)}</title></head><body><h1>Directory listing for ${escapeHtml(pathname)}</h1><ul>${links}</ul></body></html>`;
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Content-Length": Buffer.byteLength(body), "Cache-Control": "no-store" });
  if (request.method !== "HEAD") response.end(body);
  else response.end();
}

function resolveInside(root, pathname) {
  const relativePath = pathname.replace(/^\/+/, "");
  const target = path.resolve(root, relativePath);
  const normalizedRoot = path.resolve(root);
  if (target !== normalizedRoot && !target.startsWith(`${normalizedRoot}${path.sep}`)) {
    const error = new Error("请求路径超出项目根目录");
    error.code = "EACCES";
    throw error;
  }
  return target;
}

function listen(server, port, host) {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      server.removeListener("listening", onListening);
      reject(error);
    };
    const onListening = () => {
      server.removeListener("error", onError);
      resolve(server.address().port);
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port, host);
  });
}

async function isFile(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function respond(response, status, message) {
  response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
  response.end(message);
}

function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character])); }
