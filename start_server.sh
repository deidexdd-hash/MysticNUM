#!/bin/bash

echo "============================================"
echo " MysticNUM Complete - Запуск сервера"
echo "============================================"
echo ""
echo "Запускаем локальный сервер..."
echo ""
echo "После запуска откройте в браузере:"
echo "http://localhost:8000"
echo ""
echo "Для остановки нажмите Ctrl+C"
echo "============================================"
echo ""

# Проверяем наличие Python
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m http.server 8000
else
    echo "Python не найден!"
    echo "Установите Python или используйте другой способ запуска"
fi
