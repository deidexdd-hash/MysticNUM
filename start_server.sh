#!/bin/bash

echo "========================================"
echo "  MysticNUM Ultimate - Локальный сервер"
echo "========================================"
echo ""
echo "Запускаю Python сервер на порту 8000..."
echo ""
echo "После запуска откройте браузер и перейдите:"
echo "http://localhost:8000/mysticnum_pro_ultimate.html"
echo ""
echo "Для остановки нажмите Ctrl+C"
echo "========================================"
echo ""

python3 -m http.server 8000
