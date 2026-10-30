# Chạy cả Web Quản Trị (Port 8001) và Web Bán Hàng (Port 3000) dùng chung 1 Database duy nhất tại data/decast.db
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  HỆ THỐNG MÔ HÌNH XE 'XE ĐỎ' — DÙNG CHUNG DATABASE       " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$dbPath = Resolve-Path "$PSScriptRoot\data\decast.db"
$env:DB_PATH = "$dbPath"
Write-Host "File Database dùng chung: $dbPath" -ForegroundColor Yellow
Write-Host ""

$hasBun = Get-Command bun -ErrorAction SilentlyContinue

# Kiểm tra cài đặt gói cho admin nếu chưa có node_modules
if (-not (Test-Path "$PSScriptRoot\admin\node_modules")) {
    Write-Host "[!] Chưa tìm thấy thư mục node_modules trong admin/ - Đang tự động cài đặt..." -ForegroundColor Yellow
    Push-Location "$PSScriptRoot\admin"
    if ($hasBun) { bun install } else { npm install }
    Pop-Location
    Write-Host "[*] Cài đặt gói admin hoàn tất!" -ForegroundColor Green
    Write-Host ""
}

# Kiểm tra cài đặt gói cho custom nếu chưa có node_modules
if (-not (Test-Path "$PSScriptRoot\custom\node_modules")) {
    Write-Host "[!] Chưa tìm thấy thư mục node_modules trong custom/ - Đang tự động cài đặt..." -ForegroundColor Yellow
    Push-Location "$PSScriptRoot\custom"
    if ($hasBun) { bun install } else { npm install }
    Pop-Location
    Write-Host "[*] Cài đặt gói custom hoàn tất!" -ForegroundColor Green
    Write-Host ""
}

Write-Host "[1/2] Đang khởi động Web Quản Trị (Cổng 8001)..." -ForegroundColor Green
if ($hasBun) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle='[Web Quản Trị - Port 8001 (Bun)]'; `$env:DB_PATH='$dbPath'; cd '$PSScriptRoot\admin'; bun start"
} else {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle='[Web Quản Trị - Port 8001 (Node)]'; `$env:DB_PATH='$dbPath'; cd '$PSScriptRoot\admin'; npm run start:node"
}

Write-Host "[2/2] Đang khởi động Web Bán Hàng (Cổng 3000)..." -ForegroundColor Green
if ($hasBun) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle='[Web Bán Hàng - Port 3000 (Bun)]'; `$env:DB_PATH='$dbPath'; cd '$PSScriptRoot\custom'; bun start"
} else {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle='[Web Bán Hàng - Port 3000 (Node)]'; `$env:DB_PATH='$dbPath'; cd '$PSScriptRoot\custom'; npm run start:node"
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Đã khởi động cả 2 server dùng chung Database thành công!" -ForegroundColor Green
Write-Host "-> Web Quản Trị:  http://localhost:8001" -ForegroundColor White
Write-Host "-> Web Bán Hàng: http://localhost:3000" -ForegroundColor White
Write-Host "Database dùng chung: $dbPath" -ForegroundColor Yellow
Write-Host "Mọi thay đổi trên Quản trị sẽ phản ánh ngay lập tức trên Web khách và ngược lại." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
