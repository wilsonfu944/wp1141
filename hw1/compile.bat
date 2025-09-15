@echo off
echo 正在編譯 TypeScript 到 JavaScript...

REM 檢查是否有 TypeScript 編譯器
where tsc >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 錯誤: 找不到 TypeScript 編譯器 (tsc)
    echo 請先安裝 Node.js 和 TypeScript:
    echo 1. 下載並安裝 Node.js: https://nodejs.org/
    echo 2. 執行: npm install -g typescript
    echo 3. 重新執行此腳本
    pause
    exit /b 1
)

REM 編譯 TypeScript
tsc script.ts --target ES2020 --module ES2020 --lib ES2020,DOM --outDir . --strict

if %ERRORLEVEL% EQU 0 (
    echo 編譯成功！已生成 script.js
    echo 現在可以打開 index.html 查看結果
) else (
    echo 編譯失敗，請檢查 TypeScript 語法錯誤
)

pause
