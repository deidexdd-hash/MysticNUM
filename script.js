// Конфигурация
const CONFIG = {
    // ЗАМЕНИ на свой актуальный URL бэкенда
    API_URL: "https://mystic2-1.onrender.com",
    GENDERS: {
        MALE: "мужской",
        FEMALE: "женский"
    }
};

/**
 * Основная функция запуска расчета
 */
async function handleCalculation() {
    const dateInput = document.getElementById('birthDate').value;
    const genderInput = document.getElementById('gender').value;
    const btn = document.getElementById('calcBtn');
    
    // Валидация формата ДД.ММ.ГГГГ
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(dateInput)) {
        showError("Пожалуйста, введите дату в формате ДД.ММ.ГГГГ (например, 15.05.1992)");
        return;
    }

    setLoading(true);

    try {
        // Формируем запрос к твоему API (FastAPI эндпоинт)
        const response = await fetch(`${CONFIG.API_URL}/api/calculate?date=${dateInput}&gender=${genderInput}`);
        
        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        renderResults(data);
    } catch (err) {
        console.error("Calculation error:", err);
        showError("Не удалось связаться с магическим сервером. Попробуйте снова через минуту.");
    } finally {
        setLoading(false);
    }
}

/**
 * Отрисовка полученных данных в HTML
 */
function renderResults(data) {
    const resultsSection = document.getElementById('results');
    resultsSection.classList.remove('hidden');

    // 1. Вывод дополнительных чисел (first.second.third.fourth)
    // В твоем matrix_calculator.py это массив 'additional'
    const addNumsContainer = document.getElementById('additionalNums');
    if (data.numbers) {
        addNumsContainer.innerHTML = data.numbers
            .map(num => `<span class="num-badge">${num}</span>`)
            .join('<span class="separator">.</span>');
    }

    // 2. Заполнение квадрата (матрицы 1-9)
    // Используем 'full_array' из твоего бэкенда для подсчета количества цифр
    fillMatrixGrid(data.full_array);

    // 3. Вывод интерпретации
    const interpContainer = document.getElementById('interpretationText');
    interpContainer.innerHTML = cleanMarkdown(data.interpretation);

    // Плавная прокрутка к результатам
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Распределяет цифры по ячейкам 1-9
 */
function fillMatrixGrid(fullArray) {
    if (!fullArray) return;

    for (let i = 1; i <= 9; i++) {
        // Находим все ячейки с аттрибутом data-cell="i"
        const cell = document.querySelector(`.matrix-cell[data-cell="${i}"] .val`);
        if (cell) {
            // Считаем сколько раз цифра 'i' встречается в массиве
            const count = fullArray.filter(num => num === i).length;
            
            if (count > 0) {
                // Если есть, пишем цифру столько раз, сколько она встретилась (например, 111)
                cell.innerText = i.toString().repeat(count);
                cell.classList.add('has-value');
            } else {
                cell.innerText = "нет";
                cell.classList.remove('has-value');
            }
        }
    }
}

/**
 * Очистка Markdown-символов из твоих файлов интерпретаций
 */
function cleanMarkdown(text) {
    if (!text) return "";
    return text
        // Заменяем *Текст* на жирный <b>
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
        // Заменяем переносы строк на <br>
        .replace(/\n/g, '<br>')
        // Подсвечиваем заголовки (Цифра X)
        .replace(/(Цифра \d)/g, '<span class="gold-text">$1</span>');
}

/**
 * Состояние загрузки кнопки
 */
function setLoading(isLoading) {
    const btn = document.getElementById('calcBtn');
    if (isLoading) {
        btn.disabled = true;
        btn.dataset.originalText = btn.innerText;
        btn.innerText = "Считывание хроник Акаши...";
    } else {
        btn.disabled = false;
        btn.innerText = btn.dataset.originalText || "Рассчитать Судьбу";
    }
}

function showError(msg) {
    alert(msg);
}
