const fs = require('fs');

// Читаем JSON файл
const jsonData = fs.readFileSync('knowledge_structured_full.json', 'utf8');

// Создаем JS файл с встроенными данными
const jsContent = `/**
 * ВСТРОЕННАЯ БАЗА ЗНАНИЙ - 807+ единиц
 * Этот файл содержит полную базу знаний в формате JavaScript
 * Решает проблему CORS при локальном запуске
 */

const EMBEDDED_KNOWLEDGE = ${jsonData};

// Делаем доступным глобально
window.EMBEDDED_KNOWLEDGE = EMBEDDED_KNOWLEDGE;

console.log('✅ Встроенная база знаний загружена:', EMBEDDED_KNOWLEDGE.meta);
`;

// Сохраняем
fs.writeFileSync('knowledge_embedded.js', jsContent, 'utf8');

console.log('✅ Файл knowledge_embedded.js создан успешно!');
console.log('📊 Размер:', fs.statSync('knowledge_embedded.js').size, 'байт');
