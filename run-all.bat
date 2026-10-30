@echo off
chcp 65001 > nul
echo ==========================================================
echo   HỆ THỐNG MÔ HÌNH XE 'XE ĐỎ' — DÙNG CHUNG DATABASE
echo ==========================================================
echo.

set DB_PATH=%~dp0data\decast.db
echo Database dùng chung duy nhất: %DB_PATH%
echo.

:: Kiểm tra cài đặt gói cho Web Quản Trị nếu chưa có node_modules
if not exist "%~dp0admin\node_modules" (
    echo [!] Chưa tìm thấy thư mục node_modules trong admin/
    echo [*] Đang tự động cài đặt các gói cần thiết...
    where bun >nul 2>nul
    if %errorlevel% equ 0 (
        cd /d "%~dp0admin" && bun install
    ) else (
        cd /d "%~dp0admin" && npm install
    )
    echo [*] Cài đặt gói admin hoàn tất!
    echo.
)

:: Kiểm tra cài đặt gói cho Web Bán Hàng nếu chưa có node_modules
if not exist "%~dp0custom\node_modules" (
    echo [!] Chưa tìm thấy thư mục node_modules trong custom/
    echo [*] Đang tự động cài đặt các gói cần thiết...
    where bun >nul 2>nul
    if %errorlevel% equ 0 (
        cd /d "%~dp0custom" && bun install
    ) else (
        cd /d "%~dp0custom" && npm install
    )
    echo [*] Cài đặt gói custom hoàn tất!
    echo.
)

echo [1/2] Đang khởi động Web Quản Trị (Cổng 8001)...
where bun >nul 2>nul
if %errorlevel% equ 0 (
    echo Phát hiện runtime: Bun
    start "Web Quan Tri [Port 8001 - Bun]" cmd /k "cd /d %~dp0admin && set DB_PATH=%~dp0data\decast.db && bun start"
) else (
    echo Phát hiện runtime: Node.js (Bun không có sẵn)
    start "Web Quan Tri [Port 8001 - Node]" cmd /k "cd /d %~dp0admin && set DB_PATH=%~dp0data\decast.db && npm run start:node"
)

echo [2/2] Đang khởi động Web Bán Hàng (Cổng 3000)...
where bun >nul 2>nul
if %errorlevel% equ 0 (
    echo Phát hiện runtime: Bun
    start "Web Ban Hang [Port 3000 - Bun]" cmd /k "cd /d %~dp0custom && set DB_PATH=%~dp0data\decast.db && bun start"
) else (
    echo Phát hiện runtime: Node.js (Bun không có sẵn)
    start "Web Ban Hang [Port 3000 - Node]" cmd /k "cd /d %~dp0custom && set DB_PATH=%~dp0data\decast.db && npm run start:node"
)

echo.
echo ==========================================================
echo Khởi động hoàn tất!
echo -> Web Quản Trị:  http://localhost:8001
echo -> Web Bán Hàng: http://localhost:3000
echo Database dùng chung duy nhất: %DB_PATH%
echo ==========================================================
echo.
pause
