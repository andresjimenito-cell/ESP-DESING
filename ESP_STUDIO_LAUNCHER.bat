@echo off
setlocal enabledelayedexpansion
title ESP Studio Premium Engine
color 0b

:: Set UTF-8 encoding
chcp 65001 > nul

:: Path Configuration
set "PROJECT_ROOT=%~dp0"
set "APP_DIR=%PROJECT_ROOT%app_unified"
set "ICON_PATH=%APP_DIR%\ICONO.png"

echo ===================================================
echo               ESP STUDIO PREMIUM
echo           Aviation Analysis Engine v2.0
echo ===================================================
echo.

:: 1. Create Desktop Shortcut if it doesn't exist (Optional/One-time)
if not exist "%USERPROFILE%\Desktop\ESP_Studio_Premium.lnk" (
    echo [INFO] Creando acceso directo en el escritorio para acceso rapido...
    
    set "ps_cmd=$s=(New-Object -ComObject WScript.Shell).CreateShortcut('%USERPROFILE%\Desktop\ESP_Studio_Premium.lnk'); $s.TargetPath='%~f0'; $s.IconLocation='%ICON_PATH%'; $s.Save()"
    powershell -nop -c "!ps_cmd!"
    
    echo [OK] Acceso directo con icono creado con exito.
    echo.
)

:: 2. Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado. 
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b
)

:: 3. Enter App Directory
if not exist "%APP_DIR%\" (
    echo [ERROR] No se encuentra la carpeta 'app_unified'.
    echo Asegurese de que el archivo .bat este en la carpeta raiz.
    pause
    exit /b
)

cd /d "%APP_DIR%"

:: 4. Check dependencies
if not exist "node_modules\" (
    echo [1/3] Preparando entorno (Primera vez)...
    echo Instalando dependencias necesarias...
    call npm install
) else (
    echo [1/3] Entorno optimizado.
)

:: 5. Launch UI
echo [2/3] Iniciando el motor de calculo...
echo.

:: Start Vite in background (hidden)
start /min "ESP_ENGINE" cmd /c "npm run dev"

:: 6. Auto-Open browser
echo [3/3] Lanzando interfaz de usuario...
echo.

:: Wait for server (delay)
timeout /t 3 /nobreak > nul

:: Open Browser
start http://localhost:3000

echo ===================================================
echo        SISTEMA OPERATIVO Y ACTIVO CON ÉXITO
echo ===================================================
echo.
echo Icono aplicado a:
echo - Pestaña del Navegador (Favicon)
echo - Acceso directo en Escritorio
echo.
echo No cierre esta ventana mientras use el programa.
echo Presione cualquier tecla para apagar el sistema.
pause > nul

:: Cleanup
taskkill /fi "windowtitle eq ESP_ENGINE*" /t /f >nul 2>nul
exit
