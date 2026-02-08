const http = require('http');
const fs = require('fs');
const path = require('path');

// Порт из окружения (для Render) или 8000 по умолчанию
const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DEBUG = NODE_ENV !== 'production';

// MIME типы для статических файлов
const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

// Создание HTTP сервера
const server = http.createServer((req, res) => {
    // Логирование только в режиме разработки
    if (DEBUG) {
        console.log(`${req.method} ${req.url}`);
    }

    // Определяем путь к файлу
    let filePath = '.' + req.url;
    
    // Главная страница
    if (filePath === './' || filePath === './') {
        filePath = './mysticnum_pro_ultimate.html';
    }

    // Защита от выхода за пределы директории
    const safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
    
    // Определяем MIME тип
    const extname = String(path.extname(safePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Читаем и отдаем файл
    fs.readFile(safePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // 404 - Файл не найден
                res.writeHead(404, { 
                    'Content-Type': 'text/html; charset=utf-8',
                    'X-Content-Type-Options': 'nosniff'
                });
                res.end(`
                    <!DOCTYPE html>
                    <html lang="ru">
                    <head>
                        <meta charset="UTF-8">
                        <title>404 - Страница не найдена</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                            }
                            .error-box {
                                text-align: center;
                                background: rgba(255,255,255,0.1);
                                padding: 40px;
                                border-radius: 20px;
                                backdrop-filter: blur(10px);
                            }
                            h1 { font-size: 72px; margin: 0; }
                            p { font-size: 20px; }
                            a { color: #ffd700; text-decoration: none; }
                        </style>
                    </head>
                    <body>
                        <div class="error-box">
                            <h1>404</h1>
                            <p>Страница не найдена</p>
                            <p><a href="/">← Вернуться на главную</a></p>
                        </div>
                    </body>
                    </html>
                `, 'utf-8');
            } else {
                // 500 - Ошибка сервера
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(`Ошибка сервера: ${error.code}`, 'utf-8');
                
                if (DEBUG) {
                    console.error('Server error:', error);
                }
            }
        } else {
            // 200 - Успех
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': NODE_ENV === 'production' ? 'public, max-age=3600' : 'no-cache',
                'X-Content-Type-Options': 'nosniff'
            });
            res.end(content, 'utf-8');
        }
    });
});

// Обработка ошибок сервера
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Порт ${PORT} уже занят`);
        process.exit(1);
    } else {
        console.error('❌ Ошибка сервера:', error);
        process.exit(1);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM получен. Закрытие сервера...');
    server.close(() => {
        console.log('✅ Сервер закрыт');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n🛑 Остановка сервера...');
    server.close(() => {
        console.log('✅ Сервер остановлен');
        process.exit(0);
    });
});

// Запуск сервера
server.listen(PORT, () => {
    console.log('========================================');
    console.log('  MysticNUM Ultimate v5.0');
    console.log('========================================');
    console.log('');
    console.log(`✅ Сервер запущен`);
    console.log(`📍 Порт: ${PORT}`);
    console.log(`🌍 Режим: ${NODE_ENV}`);
    console.log('');
    
    if (DEBUG) {
        console.log('📱 Откройте в браузере:');
        console.log(`   http://localhost:${PORT}/`);
        console.log('');
        console.log('🛑 Для остановки нажмите Ctrl+C');
    } else {
        console.log('🚀 Production режим активен');
    }
    
    console.log('========================================');
    console.log('');
});
