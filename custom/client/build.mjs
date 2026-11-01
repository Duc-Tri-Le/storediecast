import { join } from "path";
import { existsSync, mkdirSync, copyFileSync } from "fs";
import { execSync } from "child_process";

const clientDir = import.meta.dirname || process.cwd();
const entry = join(clientDir, "src", "main.tsx");
const outdir = join(clientDir, "dist");

if (!existsSync(outdir)) {
  mkdirSync(outdir, { recursive: true });
}

console.log("🔨 Đang build custom client bundle...");

// 1. Copy index.html vào dist
copyFileSync(join(clientDir, "index.html"), join(outdir, "index.html"));
console.log("📄 Đã copy index.html vào dist/");

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

// 3. Build Tailwind CSS (giống admin)
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
    copyFileSync(join(clientDir, "src", "theme.css"), join(outdir, "main.css"));
  } catch {}
}
