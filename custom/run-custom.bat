@echo off
chcp 65001 > nul
echo ==========================================================
echo   WEB BÁN HÀNG XE ĐỎ (REACT 19 + TYPESCRIPT + BUN)
echo ==========================================================
echo.

set DB_PATH=%~dp0..\data\decast.db
echo [*] Database dung chung duy nhat: %DB_PATH%
echo.

where bun >nul 2>nul
if %errorlevel% equ 0 (
    echo [*] Đang khởi động bằng Bun trên cổng 3000...
    bun run server.ts
) else (
    echo [*] Bun không có sẵn, thử chạy bằng Node/tsx...
    npx tsx server.ts
)

pause

