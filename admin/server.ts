import { existsSync, createReadStream, statSync, mkdirSync } from "node:fs";
import http from "node:http";
import { join, extname, resolve, dirname } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { Actions } from "./server/src/actions";

// Khai báo biến toàn cục Bun để TypeScript/IDE nhận diện khi chạy đa nền tảng
declare const Bun: any;

const currentDir = dirname(fileURLToPath(import.meta.url));

function resolveSharedDbPath(): string {
  if (process.env.DB_PATH && existsSync(process.env.DB_PATH)) {
    return resolve(process.env.DB_PATH);
  }
  const candidates = [
    resolve(currentDir, "..", "data", "decast.db"),
    resolve(process.cwd(), "data", "decast.db"),
    resolve(process.cwd(), "..", "data", "decast.db"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  const defaultPath = resolve(currentDir, "..", "data", "decast.db");
  const dataDir = dirname(defaultPath);
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
  return defaultPath;
}

const dbPath = resolveSharedDbPath();
process.env.DB_PATH = dbPath;

const PORT = Number(process.env.PORT || 8001);
const DIST_DIR = join(currentDir, "client", "dist");

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};

async function handleAction(actionName: string, args: any) {
  const handlerDef = (Actions as any)[actionName];
  if (!handlerDef) {
    return { status: 404, payload: { ok: false, error: `Action '${actionName}' không tồn tại.` } };
  }
  try {
    const ctx = { invalidateQueries: () => {} };
    const result = await handlerDef.handler(ctx, args || {});
    return { status: 200, payload: { ok: true, result } };
  } catch (err: any) {
    console.error(`Lỗi thực thi action ${actionName}:`, err);
    return { status: 500, payload: { ok: false, error: err?.message || "Lỗi xử lý server." } };
  }
}

// ── NẾU CHẠY BẰNG BUN ────────────────────────────────────────────────
if (typeof Bun !== "undefined") {
  Bun.serve({
    port: PORT,
    async fetch(req: Request) {
      const url = new URL(req.url);

      // Xử lý RPC Actions
      if (req.method === "POST" && (url.pathname === "/actions" || url.pathname.endsWith("/actions"))) {
        try {
          const body = await req.json();
          const { status, payload } = await handleAction(body.action, body.args);
          return new Response(JSON.stringify(payload), {
            status,
            headers: { "Content-Type": "application/json; charset=utf-8" },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ ok: false, error: err?.message || "Yêu cầu không hợp lệ." }), {
            status: 400,
            headers: { "Content-Type": "application/json; charset=utf-8" },
          });
        }
      }

      // Xử lý Static Files
      let filePath = join(DIST_DIR, url.pathname === "/" ? "index.html" : url.pathname);
      let file = Bun.file(filePath);
      if (!(await file.exists())) {
        filePath = join(DIST_DIR, "index.html");
        file = Bun.file(filePath);
      }

      if (await file.exists()) {
        const ext = extname(filePath).toLowerCase();
        const mime = MIME_TYPES[ext] || "application/octet-stream";
        return new Response(file, {
          headers: {
            "Content-Type": mime,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
          },
        });
      }

      return new Response("404 Not Found", { status: 404 });
    },
  });

  console.log(`🚀 [Admin Server (Bun)] đang chạy tại http://localhost:${PORT}`);
  console.log(`📦 Database dùng chung: ${dbPath}`);
}
// ── NẾU CHẠY BẰNG NODE.JS ──────────────────────────────────────────────
else {
  const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = parsedUrl.pathname;

    if (req.method === "POST" && (pathname === "/actions" || pathname.endsWith("/actions"))) {
      let bodyData = "";
      req.on("data", (chunk) => {
        bodyData += chunk;
      });
      req.on("end", async () => {
        try {
          const body = JSON.parse(bodyData || "{}");
          const { status, payload } = await handleAction(body.action, body.args);
          const jsonStr = JSON.stringify(payload);
          res.writeHead(status, {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Length": Buffer.byteLength(jsonStr),
          });
          res.end(jsonStr);
        } catch (err: any) {
          console.error("Node action error:", err);
          const errStr = JSON.stringify({ ok: false, error: err?.message || "Lỗi hệ thống." });
          res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
          res.end(errStr);
        }
      });
      return;
    }

    // Static files
    let target = join(DIST_DIR, pathname === "/" ? "index.html" : pathname);
    if (!existsSync(target) || !statSync(target).isFile()) {
      target = join(DIST_DIR, "index.html");
    }

    if (existsSync(target) && statSync(target).isFile()) {
      const ext = extname(target).toLowerCase();
      const mime = MIME_TYPES[ext] || "application/octet-stream";
      res.writeHead(200, {
        "Content-Type": mime,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      });
      createReadStream(target).pipe(res);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 Not Found");
    }
  });

  server.listen(PORT, () => {
    console.log(`🚀 [Admin Server (Node)] đang chạy tại http://localhost:${PORT}`);
    console.log(`📦 Database dùng chung: ${dbPath}`);
  });
}
