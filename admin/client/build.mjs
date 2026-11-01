import { join } from "path";
import { existsSync, mkdirSync, writeFileSync, watch } from "fs";
import { execSync } from "child_process";

const clientDir = import.meta.dirname || process.cwd();
const entry = join(clientDir, "src", "main.tsx");
const outdir = join(clientDir, "dist");

if (!existsSync(outdir)) {
  mkdirSync(outdir, { recursive: true });
}

const htmlContent = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="color-scheme" content="light" />
    <base href="/" />
    <link rel="icon" href="data:," />
    <title>Web Quản Trị Bán Xe Mô Hình</title>
    <link rel="stylesheet" href="/main.css" />
    <script src="/main.js" type="module"></script>
  </head>
  <body>
    <div data-generated-space-root="" data-generated-space-slug="web-qu-n-tr-b-n-xe-m-h-nh"></div>
  </body>
</html>`;

export async function runBuild(options = { buildCss: true }) {
  const startTime = Date.now();
  console.log("🔨 Đang build admin client bundle...");

  // 1. Tạo index.html trong dist
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
      console.error("❌ Build JS thất bại:", result.logs);
      if (!isWatch) process.exit(1);
      return false;
    }
    console.log("✅ Build JS thành công vào:", outdir);
  } else {
    console.log("⚠️ Cần chạy bằng Bun để build bundle: bun ./client/build.mjs");
    return false;
  }

  // 3. Build Tailwind CSS
  if (options.buildCss) {
    try {
      const cssInput = join(clientDir, "src", "theme.css");
      const cssOutput = join(outdir, "main.css");
      console.log("🎨 Đang build Tailwind CSS...");
      execSync(`bun run tailwindcss -i "${cssInput}" -o "${cssOutput}" --minify`, {
        cwd: join(clientDir, ".."),
        stdio: "inherit",
      });
      console.log("✅ Build CSS thành công:", cssOutput);
    } catch (e) {
      console.error("❌ Lỗi biên dịch CSS qua tailwindcss:", e);
    }
  }

  const duration = Date.now() - startTime;
  console.log(`⚡ Xong trong ${duration}ms!`);
  return true;
}

const isWatch = process.argv.includes("--watch") || process.argv.includes("-w");

if (isWatch) {
  await runBuild({ buildCss: true });
  console.log("👀 [Watch Mode] Đang theo dõi file trong admin/client/src... Bấm Ctrl+C để dừng.");

  let debounceTimer = null;
  const srcDir = join(clientDir, "src");

  watch(srcDir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    // Bỏ qua các file ẩn/tạm
    if (filename.startsWith(".") || filename.endsWith("~")) return;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      console.log(`\n🔄 File thay đổi: ${filename} -> Rebuilding...`);
      await runBuild({ buildCss: true });
    }, 150);
  });
} else {
  await runBuild({ buildCss: true });
}
