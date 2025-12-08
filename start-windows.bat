@echo off
echo ========================================
echo  Sistema de Engenharia de Foguetes
echo  Iniciando Aplicacao...
echo ========================================
echo.

echo [1/2] Iniciando backend Python (FastAPI)...
start "Backend Python" cmd /k "cd python_backend && venv\Scripts\activate.bat && python main.py"
timeout /t 3 /nobreak >nul

echo [2/2] Iniciando servidor Node.js...
start "Servidor Node.js" cmd /k "npx cross-env NODE_ENV=development tsx watch server/_core/index.ts"

echo.
echo ========================================
echo  Aplicacao iniciada!
echo ========================================
echo.
echo Backend Python: http://localhost:8000
echo Frontend React: http://localhost:3000
echo.
echo Pressione qualquer tecla para abrir no navegador...
pause >nul
start http://localhost:3000
