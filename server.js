const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

// MIME типы
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Определяем путь к файлу
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './mysticnum_pro_ultimate.html';
    }

    // Определяем MIME тип
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Читаем файл
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 - Файл не найден</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Ошибка сервера: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log('========================================');
    console.log('  MysticNUM Ultimate - Локальный сервер');
    console.log('========================================');
    console.log('');
    console.log(`✅ Сервер запущен на порту ${PORT}`);
    console.log('');
    console.log('📱 Откройте в браузере:');
    console.log(`   http://localhost:${PORT}/mysticnum_pro_ultimate.html`);
    console.log('');
    console.log('🛑 Для остановки нажмите Ctrl+C');
    console.log('========================================');
    console.log('');
});
