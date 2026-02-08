/**
 * УЛУЧШЕННЫЙ МОДУЛЬ ВАЛИДАЦИИ ДАТ
 * Для интеграции в calculator.js или app.js
 */

class DateValidator {
    
    /**
     * Полная валидация даты рождения
     * @param {string} dateStr - Дата в формате DD.MM.YYYY
     * @returns {Object} - {valid: boolean, error: string}
     */
    static validate(dateStr) {
        // 1. Проверка формата
        const formatCheck = this.checkFormat(dateStr);
        if (!formatCheck.valid) {
            return formatCheck;
        }
        
        // 2. Извлечение компонентов
        const [, dayStr, monthStr, yearStr] = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
        const day = parseInt(dayStr, 10);
        const month = parseInt(monthStr, 10);
        const year = parseInt(yearStr, 10);
        
        // 3. Проверка диапазонов
        const rangeCheck = this.checkRanges(day, month, year);
        if (!rangeCheck.valid) {
            return rangeCheck;
        }
        
        // 4. Проверка реальности даты
        const realityCheck = this.checkReality(day, month, year);
        if (!realityCheck.valid) {
            return realityCheck;
        }
        
        // 5. Проверка что дата не в будущем
        const futureCheck = this.checkNotFuture(day, month, year);
        if (!futureCheck.valid) {
            return futureCheck;
        }
        
        // Все проверки пройдены
        return {
            valid: true,
            error: null,
            date: { day, month, year }
        };
    }
    
    /**
     * Проверка формата DD.MM.YYYY
     */
    static checkFormat(dateStr) {
        const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
        
        if (!dateStr || typeof dateStr !== 'string') {
            return {
                valid: false,
                error: 'Дата не указана'
            };
        }
        
        if (!regex.test(dateStr)) {
            return {
                valid: false,
                error: 'Неверный формат даты. Используйте формат ДД.ММ.ГГГГ (например, 15.05.1992)'
            };
        }
        
        return { valid: true };
    }
    
    /**
     * Проверка диапазонов значений
     */
    static checkRanges(day, month, year) {
        if (day < 1 || day > 31) {
            return {
                valid: false,
                error: `День должен быть от 1 до 31 (указано: ${day})`
            };
        }
        
        if (month < 1 || month > 12) {
            return {
                valid: false,
                error: `Месяц должен быть от 1 до 12 (указано: ${month})`
            };
        }
        
        if (year < 1900) {
            return {
                valid: false,
                error: `Год должен быть не ранее 1900 (указано: ${year})`
            };
        }
        
        if (year > 2100) {
            return {
                valid: false,
                error: `Год должен быть не позднее 2100 (указано: ${year})`
            };
        }
        
        return { valid: true };
    }
    
    /**
     * Проверка реальности даты (защита от 31 февраля и т.п.)
     */
    static checkReality(day, month, year) {
        // Создаем дату
        const date = new Date(year, month - 1, day);
        
        // Проверяем что дата не изменилась
        if (date.getFullYear() !== year) {
            return {
                valid: false,
                error: `Некорректный год в дате`
            };
        }
        
        if (date.getMonth() !== month - 1) {
            return {
                valid: false,
                error: this.getMonthError(day, month, year)
            };
        }
        
        if (date.getDate() !== day) {
            return {
                valid: false,
                error: this.getDayError(day, month, year)
            };
        }
        
        return { valid: true };
    }
    
    /**
     * Генерация понятной ошибки для месяца
     */
    static getMonthError(day, month, year) {
        const monthNames = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];
        
        const daysInMonth = this.getDaysInMonth(month, year);
        
        if (day > daysInMonth) {
            return `В ${monthNames[month - 1]} ${year} года ${daysInMonth} ${this.getDaysWord(daysInMonth)}, а не ${day}`;
        }
        
        return `Некорректная дата: ${day}.${String(month).padStart(2, '0')}.${year}`;
    }
    
    /**
     * Генерация понятной ошибки для дня
     */
    static getDayError(day, month, year) {
        return this.getMonthError(day, month, year);
    }
    
    /**
     * Количество дней в месяце
     */
    static getDaysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }
    
    /**
     * Правильное склонение слова "день"
     */
    static getDaysWord(count) {
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
            return 'дней';
        }
        
        if (lastDigit === 1) {
            return 'день';
        }
        
        if (lastDigit >= 2 && lastDigit <= 4) {
            return 'дня';
        }
        
        return 'дней';
    }
    
    /**
     * Проверка что дата не в будущем
     */
    static checkNotFuture(day, month, year) {
        const inputDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (inputDate > today) {
            return {
                valid: false,
                error: 'Дата рождения не может быть в будущем'
            };
        }
        
        return { valid: true };
    }
    
    /**
     * Быстрая проверка валидности (только true/false)
     */
    static isValid(dateStr) {
        return this.validate(dateStr).valid;
    }
    
    /**
     * Проверка високосного года
     */
    static isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }
}

// ============================================================
// ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ
// ============================================================

// Пример 1: Полная валидация с сообщением об ошибке
function validateAndShowError(dateStr) {
    const result = DateValidator.validate(dateStr);
    
    if (result.valid) {
        console.log(`✅ Дата ${dateStr} корректна`);
        return true;
    } else {
        console.log(`❌ Ошибка: ${result.error}`);
        alert(result.error); // Показать пользователю
        return false;
    }
}

// Пример 2: Быстрая проверка
function quickValidate(dateStr) {
    if (DateValidator.isValid(dateStr)) {
        // Продолжаем расчет
        calculate(dateStr);
    } else {
        // Показываем ошибку
        const result = DateValidator.validate(dateStr);
        showError(result.error);
    }
}

// Пример 3: Интеграция в форму
function handleFormSubmit(event) {
    event.preventDefault();
    
    const dateInput = document.getElementById('birthDate');
    const dateStr = dateInput.value;
    
    const validation = DateValidator.validate(dateStr);
    
    if (!validation.valid) {
        // Подсветить поле ошибкой
        dateInput.classList.add('error');
        
        // Показать сообщение
        const errorDiv = document.getElementById('dateError');
        errorDiv.textContent = validation.error;
        errorDiv.style.display = 'block';
        
        return false;
    }
    
    // Убрать ошибку
    dateInput.classList.remove('error');
    document.getElementById('dateError').style.display = 'none';
    
    // Продолжить обработку
    const { day, month, year } = validation.date;
    calculateMatrix(day, month, year);
}

// ============================================================
// ИНТЕГРАЦИЯ В СУЩЕСТВУЮЩИЙ КОД
// ============================================================

/**
 * Как заменить существующую валидацию:
 * 
 * БЫЛО:
 * function validateDate(dateStr) {
 *     const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
 *     if (!regex.test(dateStr)) return false;
 *     // ... простая проверка
 *     return true;
 * }
 * 
 * СТАЛО:
 * function validateDate(dateStr) {
 *     return DateValidator.isValid(dateStr);
 * }
 * 
 * С СООБЩЕНИЕМ ОБ ОШИБКЕ:
 * function validateDateWithError(dateStr) {
 *     const result = DateValidator.validate(dateStr);
 *     if (!result.valid) {
 *         alert(result.error);
 *     }
 *     return result.valid;
 * }
 */

// ============================================================
// ЭКСПОРТ ДЛЯ ИСПОЛЬЗОВАНИЯ В МОДУЛЯХ
// ============================================================

// Для Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DateValidator;
}

// Для браузера (глобальная переменная)
if (typeof window !== 'undefined') {
    window.DateValidator = DateValidator;
}
