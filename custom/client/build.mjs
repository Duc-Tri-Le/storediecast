import { join } from "path";

const clientDir = import.meta.dirname || process.cwd();
const entry = join(clientDir, "src", "main.tsx");
const outdir = join(clientDir, "dist");

console.log("🔨 Đang build client bundle...");

if (typeof Bun !== "undefined") {
  const result = await Bun.build({
    entrypoints: [entry],
    outdir: outdir,
    target: "browser",
  });
  if (!result.success) {
    console.error("Build thất bại:", result.logs);
    process.exit(1);
  }
  console.log("✅ Build thành công vào:", outdir);
} else {
  console.log("⚠️ Chạy bằng Bun để build bundle nhanh nhất: bun run build");
}
