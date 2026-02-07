const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware для логирования
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Статические файлы
app.use(express.static(__dirname));

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Здоровье сервиса
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
    console.log('🌟 ==========================================');
    console.log('   MysticNUM Professional запущен!');
    console.log('==========================================');
    console.log(`📍 Локально: http://localhost:${PORT}`);
    console.log(`🌐 Render: https://[ваш-сервис].onrender.com`);
    console.log('==========================================');
});
