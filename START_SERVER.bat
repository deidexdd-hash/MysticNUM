@echo off
echo ============================================
echo  MysticNUM Complete - Запуск сервера
echo ============================================
echo.
echo Запускаем локальный сервер...
echo.
echo После запуска откройте в браузере:
echo http://localhost:8000
echo.
echo Для остановки нажмите Ctrl+C
echo ============================================
echo.

python -m http.server 8000

pause
