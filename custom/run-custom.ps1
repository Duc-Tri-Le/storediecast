# Khởi động Web Bán Hàng React (cổng 3000) dùng chung Database
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  WEB BÁN HÀNG XE ĐỎ (REACT 19 + TYPESCRIPT + BUN)        " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$dbPath = Resolve-Path "$PSScriptRoot\..\data\decast.db"
$env:DB_PATH = "$dbPath"
Write-Host "[*] Database dùng chung duy nhất: $dbPath" -ForegroundColor Yellow

$bunCmd = Get-Command bun -ErrorAction SilentlyContinue

if ($bunCmd) {
    Write-Host "[*] Phát hiện runtime Bun. Đang khởi động cổng 3000..." -ForegroundColor Green
    bun run server.ts
} else {
    Write-Host "[*] Không tìm thấy Bun, chạy bằng npx tsx..." -ForegroundColor Yellow
    npx tsx server.ts
}

