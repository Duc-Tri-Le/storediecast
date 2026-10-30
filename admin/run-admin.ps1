# Chạy riêng Web Quản Trị (Port 8001) dùng chung database data/decast.db
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  WEB QUẢN TRỊ BÁN XE MÔ HÌNH (PORT 8001)                 " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$dbPath = Resolve-Path "$PSScriptRoot\..\data\decast.db"
$env:DB_PATH = "$dbPath"
Write-Host "Database dùng chung: $dbPath" -ForegroundColor Yellow
Write-Host ""

$hasBun = Get-Command bun -ErrorAction SilentlyContinue

if ($hasBun) {
    Write-Host "[*] Đang khởi động Web Quản Trị bằng Bun..." -ForegroundColor Green
    bun run server.ts
} else {
    Write-Host "[*] Đang khởi động Web Quản Trị bằng Node.js / tsx..." -ForegroundColor Green
    npx tsx server.ts
}

