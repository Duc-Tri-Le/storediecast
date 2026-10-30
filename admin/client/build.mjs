import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const clientDir = import.meta.dirname || process.cwd();
const entry = join(clientDir, "src", "main.tsx");
const outdir = join(clientDir, "dist");

if (!existsSync(outdir)) {
  mkdirSync(outdir, { recursive: true });
}

console.log("🔨 Đang build admin client bundle...");

// 1. Tạo index.html trong dist
const htmlContent = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="color-scheme" content="light" />
    <link rel="icon" href="data:," />
    <title>Web Quản Trị Bán Xe Mô Hình</title>
    <link rel="stylesheet" href="/main.css" />
    <script src="/main.js" type="module"></script>
  </head>
  <body>
    <div data-generated-space-root="" data-generated-space-slug="web-qu-n-tr-b-n-xe-m-h-nh"></div>
  </body>
</html>`;
writeFileSync(join(outdir, "index.html"), htmlContent, "utf-8");

// 2. Build JavaScript bundle bằng Bun
if (typeof Bun !== "undefined") {
  const result = await Bun.build({
    entrypoints: [entry],
    outdir: outdir,
    naming: "[name].[ext]",
    target: "browser",
  });
  if (!result.success) {
    console.error("Build JS thất bại:", result.logs);
    process.exit(1);
  }
  console.log("✅ Build JS thành công vào:", outdir);
} else {
  console.log("⚠️ Cần chạy bằng Bun để build bundle: bun ./client/build.mjs");
}

// 3. Build Tailwind CSS
try {
  const cssInput = join(clientDir, "src", "theme.css");
  const cssOutput = join(outdir, "main.css");
  console.log("🎨 Đang build Tailwind CSS...");
  execSync(`bun x @tailwindcss/cli -i "${cssInput}" -o "${cssOutput}" --minify`, {
    cwd: join(clientDir, ".."),
    stdio: "inherit",
  });
  console.log("✅ Build CSS thành công:", cssOutput);
} catch (e) {
  console.warn("Lưu ý: Không biên dịch được CSS qua @tailwindcss/cli, copy theme.css dự phòng.");
  try {
    const fs = await import("fs");
    fs.copyFileSync(join(clientDir, "src", "theme.css"), join(outdir, "main.css"));
  } catch {}
}
