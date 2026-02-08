#!/usr/bin/env node

/**
 * 🔍 СКРИПТ ПРОВЕРКИ UNIFIED EDITION
 * Проверяет целостность и готовность проекта к деплою
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  MysticNUM Ultimate - Unified Edition');
console.log('  Проверка целостности проекта');
console.log('========================================\n');

// Счетчики
let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

// Функция проверки существования файла
function checkFile(filePath, description) {
    totalChecks++;
    const fullPath = path.join(__dirname, filePath);
    
    if (fs.existsSync(fullPath)) {
        console.log(`✅ ${description}`);
        passedChecks++;
        return true;
    } else {
        console.log(`❌ ${description}`);
        console.log(`   Отсутствует: ${filePath}`);
        failedChecks++;
        return false;
    }
}

// Функция проверки содержимого файла
function checkFileContent(filePath, searchString, description) {
    totalChecks++;
    const fullPath = path.join(__dirname, filePath);
    
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes(searchString)) {
            console.log(`✅ ${description}`);
            passedChecks++;
            return true;
        }
    }
    
    console.log(`❌ ${description}`);
    console.log(`   Файл: ${filePath}`);
    failedChecks++;
    return false;
}

console.log('📁 ПРОВЕРКА ОСНОВНЫХ ФАЙЛОВ:\n');

// Основные файлы
checkFile('server.js', 'Server.js (production-ready)');
checkFile('package.json', 'Package.json');
checkFile('render.yaml', 'Render.yaml (конфигурация деплоя)');
checkFile('.gitignore', '.gitignore');

console.log('\n🎨 ПРОВЕРКА FRONTEND:\n');

checkFile('mysticnum_pro_ultimate.html', 'HTML главная страница');
checkFile('style_ultimate.css', 'Основные стили');
checkFile('ui_premium.css', 'Премиум стили');

console.log('\n🧮 ПРОВЕРКА МОДУЛЕЙ:\n');

checkFile('app_ultimate.js', 'Главное приложение');
checkFile('calculator.js', 'Калькулятор');
checkFile('interpretations.js', 'Интерпретации');
checkFile('premium_manager.js', 'Премиум менеджер');
checkFile('ancestral_premium.js', 'Родовая система');
checkFile('family_tree_builder.js', 'Редактор родового дерева');
checkFile('forecast_premium.js', 'Прогнозы');
checkFile('plans_premium.js', 'Планы развития');
checkFile('practices_premium.js', 'Практики');

console.log('\n📚 ПРОВЕРКА БАЗЫ ЗНАНИЙ:\n');

checkFile('knowledge_structured_full.json', 'База знаний JSON');
checkFile('knowledge_embedded.js', 'Встроенная база знаний');
checkFile('knowledge_api.js', 'API базы знаний');
checkFile('create_embedded.js', 'Генератор встроенной базы');

console.log('\n📖 ПРОВЕРКА ДОКУМЕНТАЦИИ:\n');

checkFile('README.md', 'Главный README');
checkFile('INTEGRATION_GUIDE.md', 'Инструкция по интеграции');
checkFile('CHANGELOG_UNIFIED.md', 'История изменений Unified');
checkFile('CHANGELOG.md', 'История изменений (оригинал)');
checkFile('PREMIUM_FEATURES.md', 'Описание премиум функций');
checkFile('README_ULTIMATE.md', 'Документация Ultimate');
checkFile('DEPLOYMENT_GUIDE.md', 'Гайд по развертыванию');

checkFile('docs/INDEX.md', 'Индекс документации');
checkFile('docs/QUICK_START.md', 'Быстрый старт');
checkFile('docs/DEPLOY_GUIDE.md', 'Подробный гайд по деплою');
checkFile('docs/FINAL_REPORT.md', 'Итоговый отчет');
checkFile('docs/README_PRODUCTION.md', 'Production документация');
checkFile('docs/SUMMARY.md', 'Краткое резюме');
checkFile('docs/audit_report.md', 'Аудит приложения');

console.log('\n🔧 ПРОВЕРКА УЛУЧШЕНИЙ:\n');

checkFile('improvements/fixes_code.js', 'Улучшения кода');
checkFile('improvements/date_validator.js', 'Валидация дат');

console.log('\n✅ ПРОВЕРКА ТЕСТОВ:\n');

checkFile('tests/calculator_tests.js', 'Тесты калькулятора');

console.log('\n🖥️ ПРОВЕРКА СКРИПТОВ:\n');

checkFile('start_server.sh', 'Скрипт запуска (Linux/Mac)');
checkFile('START_SERVER.bat', 'Скрипт запуска (Windows)');

console.log('\n🔍 ПРОВЕРКА СОДЕРЖИМОГО:\n');

checkFileContent('server.js', 'process.env.PORT', 'Server.js содержит поддержку PORT');
checkFileContent('server.js', 'SIGTERM', 'Server.js содержит graceful shutdown');
checkFileContent('package.json', '"engines"', 'Package.json содержит engines');
checkFileContent('render.yaml', 'node', 'Render.yaml корректный');
checkFileContent('knowledge_api.js', 'knowledge_structured_full.json', 'Knowledge API использует правильное имя файла');
checkFileContent('mysticnum_pro_ultimate.html', 'favicon.ico', 'HTML содержит ссылку на favicon');
checkFileContent('mysticnum_pro_ultimate.html', 'family_tree_builder.js', 'HTML подключает редактор дерева');
checkFile('favicon.ico', 'Favicon присутствует');

console.log('\n========================================');
console.log('  ИТОГИ ПРОВЕРКИ');
console.log('========================================\n');

console.log(`📊 Всего проверок: ${totalChecks}`);
console.log(`✅ Успешно: ${passedChecks}`);
console.log(`❌ Ошибок: ${failedChecks}`);

const successRate = ((passedChecks / totalChecks) * 100).toFixed(1);
console.log(`📈 Процент успеха: ${successRate}%\n`);

if (failedChecks === 0) {
    console.log('🎉 ОТЛИЧНО! Все проверки пройдены!');
    console.log('✅ Проект готов к деплою на 100%\n');
    console.log('Следующие шаги:');
    console.log('1. npm start - запустить локально');
    console.log('2. Прочитать docs/QUICK_START.md');
    console.log('3. Задеплоить на Render.com\n');
    process.exit(0);
} else {
    console.log('⚠️  ВНИМАНИЕ! Есть проблемы.');
    console.log(`❌ Не пройдено проверок: ${failedChecks}`);
    console.log('\nРекомендации:');
    console.log('1. Проверьте отсутствующие файлы');
    console.log('2. Убедитесь, что все файлы скопированы');
    console.log('3. Запустите проверку снова\n');
    process.exit(1);
}
