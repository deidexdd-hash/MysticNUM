/**
 * FIXES_CODE.JS
 * Исправления и улучшения для MysticNUM Ultimate v5
 * 
 * Этот файл содержит код, который нужно интегрировать в основное приложение
 */

// ============================================================
// ИСПРАВЛЕНИЕ 1: Добавление обработки ошибок в модули
// ============================================================

// Для practices_premium.js, forecast_premium.js, ancestral_premium.js

/**
 * Обертка для безопасного выполнения функций
 */
function safeExecute(fn, errorMessage = 'Ошибка выполнения') {
    try {
        return fn();
    } catch (error) {
        console.error(errorMessage, error);
        return null;
    }
}

// Пример использования в practices_premium.js:
// 
// getPersonalizedPractices() {
//     return safeExecute(() => {
//         if (!this.userMatrix || !this.birthDate) {
//             return null;
//         }
//         // ... остальной код
//     }, 'Ошибка получения практик');
// }

// ============================================================
// ИСПРАВЛЕНИЕ 2: Улучшенная валидация даты
// ============================================================

/**
 * Улучшенная валидация даты рождения
 * @param {string} dateStr - Дата в формате DD.MM.YYYY
 * @returns {boolean} - true если дата валидна
 */
function validateDateImproved(dateStr) {
    // Проверка формата
    const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    if (!regex.test(dateStr)) {
        return false;
    }
    
    // Извлечение компонентов
    const [, dayStr, monthStr, yearStr] = dateStr.match(regex);
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);
    
    // Проверка диапазонов
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < 1900 || year > 2100) return false;
    
    // Проверка реальности даты (защита от 31 февраля и т.п.)
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || 
        date.getMonth() !== month - 1 || 
        date.getDate() !== day) {
        return false;
    }
    
    // Проверка, что дата не в будущем
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date > today) {
        return false;
    }
    
    return true;
}

// Интеграция в calculator.js:
// Заменить существующую функцию validateDate на validateDateImproved

// ============================================================
// ИСПРАВЛЕНИЕ 3: Управление логированием
// ============================================================

/**
 * Класс для управления логированием
 */
class Logger {
    constructor() {
        this.enabled = process?.env?.NODE_ENV !== 'production';
    }
    
    log(...args) {
        if (this.enabled) {
            console.log(...args);
        }
    }
    
    error(...args) {
        console.error(...args); // Ошибки логируем всегда
    }
    
    warn(...args) {
        if (this.enabled) {
            console.warn(...args);
        }
    }
    
    info(...args) {
        if (this.enabled) {
            console.info(...args);
        }
    }
}

// Создание глобального логгера
const logger = new Logger();

// Использование в коде:
// logger.log('🚀 Инициализация MysticNUM Complete...');
// вместо
// console.log('🚀 Инициализация MysticNUM Complete...');

// ============================================================
// ИСПРАВЛЕНИЕ 4: Проверка данных перед экспортом PDF
// ============================================================

/**
 * Безопасное получение дополнительных чисел для PDF
 */
function getAdditionalNumbersForPDF(userData) {
    if (!userData || !userData.matrix) {
        return {
            first: '—',
            second: '—',
            third: '—',
            fourth: '—'
        };
    }
    
    const numbers = userData.matrix.numbers || [];
    
    return {
        first: numbers[0] || '—',
        second: numbers[1] || '—',
        third: numbers[2] || '—',
        fourth: numbers[3] || '—'
    };
}

// Использование в export.js:
// const nums = getAdditionalNumbersForPDF(this.userData);
// doc.text(`Первое доп. число: ${nums.first}`, 20, y);

// ============================================================
// ИСПРАВЛЕНИЕ 5: Кэширование результатов расчета
// ============================================================

/**
 * Простое кэширование результатов
 */
class CalculationCache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }
    
    generateKey(birthDate, gender) {
        return `${birthDate}_${gender}`;
    }
    
    get(birthDate, gender) {
        const key = this.generateKey(birthDate, gender);
        return this.cache.get(key);
    }
    
    set(birthDate, gender, result) {
        const key = this.generateKey(birthDate, gender);
        
        // Если превышен размер, удаляем самый старый элемент
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            result,
            timestamp: Date.now()
        });
    }
    
    clear() {
        this.cache.clear();
    }
}

// Создание глобального кэша
const calculationCache = new CalculationCache();

// Использование в calculator.js:
// 
// calculate(birthDate, gender) {
//     // Проверяем кэш
//     const cached = calculationCache.get(birthDate, gender);
//     if (cached) {
//         logger.log('📦 Результат из кэша');
//         return cached.result;
//     }
//     
//     // Вычисляем
//     const result = this.performCalculation(birthDate, gender);
//     
//     // Сохраняем в кэш
//     calculationCache.set(birthDate, gender, result);
//     
//     return result;
// }

// ============================================================
// ИСПРАВЛЕНИЕ 6: Улучшенная обработка состояния загрузки
// ============================================================

/**
 * Класс для управления состоянием загрузки
 */
class LoadingState {
    constructor() {
        this.isLoading = false;
        this.loadingElement = null;
    }
    
    init(elementId = 'loadingIndicator') {
        this.loadingElement = document.getElementById(elementId);
        
        // Создаем индикатор, если его нет
        if (!this.loadingElement) {
            this.loadingElement = document.createElement('div');
            this.loadingElement.id = elementId;
            this.loadingElement.className = 'loading-overlay';
            this.loadingElement.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Вычисление матрицы...</p>
                </div>
            `;
            document.body.appendChild(this.loadingElement);
        }
    }
    
    show(message = 'Загрузка...') {
        if (this.loadingElement) {
            const messageEl = this.loadingElement.querySelector('p');
            if (messageEl) {
                messageEl.textContent = message;
            }
            this.loadingElement.style.display = 'flex';
            this.isLoading = true;
        }
    }
    
    hide() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
            this.isLoading = false;
        }
    }
}

// Создание глобального состояния загрузки
const loadingState = new LoadingState();

// CSS для индикатора загрузки (добавить в style_ultimate.css):
/*
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 10000;
}

.loading-spinner {
    text-align: center;
    color: white;
}

.spinner {
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid #fff;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
*/

// Использование в app.js:
// 
// async calculateMatrix() {
//     loadingState.show('Вычисление матрицы...');
//     
//     try {
//         // ... расчет
//     } catch (error) {
//         logger.error('Ошибка расчета:', error);
//     } finally {
//         loadingState.hide();
//     }
// }

// ============================================================
// ИСПРАВЛЕНИЕ 7: Добавление Analytics (опционально)
// ============================================================

/**
 * Простая обертка для Google Analytics
 */
class Analytics {
    constructor() {
        this.enabled = typeof gtag !== 'undefined';
    }
    
    trackEvent(category, action, label = '', value = 0) {
        if (this.enabled) {
            gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value
            });
        }
        logger.log('📊 Analytics:', category, action, label);
    }
    
    trackPageView(page) {
        if (this.enabled) {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_path: page
            });
        }
        logger.log('📄 Page view:', page);
    }
}

// Создание глобального analytics
const analytics = new Analytics();

// Использование:
// analytics.trackEvent('Matrix', 'Calculate', birthDate);
// analytics.trackEvent('Export', 'PDF', 'Success');

// ============================================================
// ИСПРАВЛЕНИЕ 8: Улучшенная обработка ошибок в calculator.js
// ============================================================

/**
 * Обертка для функции calculateMatrix с обработкой ошибок
 */
function calculateMatrixSafe(birthDate, gender) {
    try {
        // Валидация входных данных
        if (!birthDate || !gender) {
            throw new Error('Не указаны обязательные параметры');
        }
        
        // Валидация даты
        if (!validateDateImproved(birthDate)) {
            throw new Error('Некорректная дата рождения');
        }
        
        // Валидация пола
        if (!['male', 'female'].includes(gender)) {
            throw new Error('Некорректно указан пол');
        }
        
        // Вызов оригинальной функции
        const calculator = new MatrixCalculator();
        const result = calculator.calculate(birthDate, gender);
        
        // Проверка результата
        if (!result || !result.matrix) {
            throw new Error('Не удалось рассчитать матрицу');
        }
        
        return {
            success: true,
            data: result
        };
        
    } catch (error) {
        logger.error('❌ Ошибка расчета матрицы:', error.message);
        
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
}

// ============================================================
// ИСПРАВЛЕНИЕ 9: Debounce для поиска
// ============================================================

/**
 * Debounce функция для оптимизации поиска
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Использование для поиска в базе знаний:
// 
// const searchInput = document.getElementById('searchInput');
// const debouncedSearch = debounce((query) => {
//     performSearch(query);
// }, 300);
// 
// searchInput.addEventListener('input', (e) => {
//     debouncedSearch(e.target.value);
// });

// ============================================================
// ИСПРАВЛЕНИЕ 10: LocalStorage обертка с защитой
// ============================================================

/**
 * Безопасная работа с localStorage
 */
class SafeStorage {
    static isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    static set(key, value) {
        if (!this.isAvailable()) {
            logger.warn('localStorage недоступен');
            return false;
        }
        
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            logger.error('Ошибка сохранения в localStorage:', error);
            return false;
        }
    }
    
    static get(key, defaultValue = null) {
        if (!this.isAvailable()) {
            return defaultValue;
        }
        
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            logger.error('Ошибка чтения из localStorage:', error);
            return defaultValue;
        }
    }
    
    static remove(key) {
        if (!this.isAvailable()) {
            return false;
        }
        
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            logger.error('Ошибка удаления из localStorage:', error);
            return false;
        }
    }
    
    static clear() {
        if (!this.isAvailable()) {
            return false;
        }
        
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            logger.error('Ошибка очистки localStorage:', error);
            return false;
        }
    }
}

// Использование:
// SafeStorage.set('lastCalculation', matrixData);
// const data = SafeStorage.get('lastCalculation');

// ============================================================
// КОНЕЦ ФАЙЛА
// ============================================================

/**
 * ИНСТРУКЦИИ ПО ИНТЕГРАЦИИ:
 * 
 * 1. Logger - заменить все console.log на logger.log
 * 2. validateDateImproved - заменить validateDate в calculator.js
 * 3. safeExecute - обернуть критичные функции
 * 4. CalculationCache - добавить кэширование в calculator.js
 * 5. LoadingState - добавить индикаторы загрузки
 * 6. SafeStorage - использовать для сохранения данных
 * 7. debounce - оптимизировать поиск
 * 8. Analytics - добавить трекинг (опционально)
 * 
 * Приоритет интеграции:
 * - Высокий: 1, 2, 3
 * - Средний: 4, 5, 6, 7
 * - Низкий: 8
 */
