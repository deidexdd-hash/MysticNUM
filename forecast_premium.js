/**
 * ПРЕМИУМ СИСТЕМА ПРОГНОЗОВ
 * Персональные циклы, благоприятные периоды, рекомендации
 */

class ForecastSystem {
    constructor(knowledgeBase) {
        this.kb = knowledgeBase;
        this.userBirthDate = null;
        this.currentDate = new Date();
    }

    setBirthDate(birthDate) {
        this.userBirthDate = this.parseBirthDate(birthDate);
    }

    parseBirthDate(dateString) {
        const parts = dateString.split('.');
        if (parts.length !== 3) return null;
        
        return {
            day: parseInt(parts[0]),
            month: parseInt(parts[1]),
            year: parseInt(parts[2]),
            string: dateString
        };
    }

    // Расчет персонального года
    calculatePersonalYear(year = null) {
        if (!this.userBirthDate) return null;
        
        const targetYear = year || this.currentDate.getFullYear();
        
        // Складываем день + месяц рождения + текущий год
        const sum = this.userBirthDate.day + 
                    this.userBirthDate.month + 
                    this.reduceToSingle(targetYear);
        
        const personalYear = this.reduceToSingle(sum);
        
        return {
            number: personalYear,
            year: targetYear,
            interpretation: this.getPersonalYearInterpretation(personalYear),
            energy: this.getYearEnergy(personalYear),
            recommendations: this.getYearRecommendations(personalYear),
            favorableMonths: this.getFavorableMonths(personalYear, targetYear),
            challenges: this.getYearChallenges(personalYear)
        };
    }

    // Редукция до однозначного числа
    reduceToSingle(num) {
        while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
            num = num.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
        }
        return num;
    }

    // Интерпретация персонального года
    getPersonalYearInterpretation(number) {
        const interpretations = {
            1: {
                theme: 'Новые начинания',
                description: 'Год новых возможностей, старта проектов, проявления лидерских качеств. Время действовать смело.',
                keywords: ['Начало', 'Инициатива', 'Лидерство', 'Независимость']
            },
            2: {
                theme: 'Партнерство и сотрудничество',
                description: 'Год отношений, дипломатии, терпения. Важно сотрудничать и идти на компромиссы.',
                keywords: ['Партнерство', 'Гармония', 'Дипломатия', 'Чувствительность']
            },
            3: {
                theme: 'Творчество и самовыражение',
                description: 'Год креативности, общения, самовыражения. Время раскрыть таланты и делиться ими.',
                keywords: ['Творчество', 'Общение', 'Радость', 'Самовыражение']
            },
            4: {
                theme: 'Построение фундамента',
                description: 'Год работы, дисциплины, создания стабильной основы. Важны усилия и практичность.',
                keywords: ['Труд', 'Стабильность', 'Дисциплина', 'Фундамент']
            },
            5: {
                theme: 'Перемены и свобода',
                description: 'Год изменений, путешествий, новых возможностей. Время выйти из зоны комфорта.',
                keywords: ['Перемены', 'Свобода', 'Путешествия', 'Адаптация']
            },
            6: {
                theme: 'Ответственность и забота',
                description: 'Год семьи, дома, ответственности. Важно заботиться о близких и создавать гармонию.',
                keywords: ['Семья', 'Забота', 'Ответственность', 'Гармония']
            },
            7: {
                theme: 'Духовный рост',
                description: 'Год самопознания, обучения, духовного развития. Время для рефлексии и мудрости.',
                keywords: ['Духовность', 'Познание', 'Анализ', 'Мудрость']
            },
            8: {
                theme: 'Материальный успех',
                description: 'Год достижений, финансового роста, власти. Время пожинать плоды усилий.',
                keywords: ['Успех', 'Власть', 'Деньги', 'Достижения']
            },
            9: {
                theme: 'Завершение и трансформация',
                description: 'Год завершения циклов, освобождения от старого. Время отпустить и трансформироваться.',
                keywords: ['Завершение', 'Освобождение', 'Служение', 'Трансформация']
            }
        };
        
        return interpretations[number] || interpretations[1];
    }

    // Энергия года
    getYearEnergy(number) {
        const energies = {
            1: { level: 9, type: 'dynamic', color: '#ef4444' },
            2: { level: 4, type: 'receptive', color: '#ec4899' },
            3: { level: 8, type: 'creative', color: '#f59e0b' },
            4: { level: 5, type: 'stable', color: '#84cc16' },
            5: { level: 10, type: 'dynamic', color: '#06b6d4' },
            6: { level: 6, type: 'harmonious', color: '#10b981' },
            7: { level: 3, type: 'introspective', color: '#8b5cf6' },
            8: { level: 9, type: 'powerful', color: '#eab308' },
            9: { level: 7, type: 'transformative', color: '#6366f1' }
        };
        
        return energies[number] || energies[1];
    }

    // Рекомендации на год
    getYearRecommendations(number) {
        const recommendations = {
            1: [
                'Начните новый проект или бизнес',
                'Проявляйте инициативу и лидерство',
                'Будьте смелыми в решениях',
                'Фокусируйтесь на личных целях'
            ],
            2: [
                'Развивайте партнерские отношения',
                'Практикуйте терпение и дипломатию',
                'Работайте в команде',
                'Укрепляйте эмоциональные связи'
            ],
            3: [
                'Раскрывайте творческие таланты',
                'Общайтесь и делитесь идеями',
                'Занимайтесь искусством',
                'Радуйтесь жизни'
            ],
            4: [
                'Работайте над долгосрочными целями',
                'Создавайте стабильный фундамент',
                'Будьте дисциплинированы',
                'Организуйте финансы и быт'
            ],
            5: [
                'Примите перемены с открытым сердцем',
                'Путешествуйте и познавайте новое',
                'Будьте гибкими и адаптивными',
                'Расширяйте горизонты'
            ],
            6: [
                'Уделяйте внимание семье',
                'Создавайте уют и гармонию дома',
                'Берите ответственность',
                'Помогайте близким'
            ],
            7: [
                'Посвятите время самопознанию',
                'Медитируйте и развивайтесь духовно',
                'Обучайтесь и исследуйте',
                'Анализируйте прошлый опыт'
            ],
            8: [
                'Фокусируйтесь на карьерных целях',
                'Развивайте финансовую грамотность',
                'Стремитесь к лидерству',
                'Реализуйте амбиции'
            ],
            9: [
                'Завершите старые проекты',
                'Отпустите отжившее',
                'Служите другим',
                'Готовьтесь к новому циклу'
            ]
        };
        
        return recommendations[number] || recommendations[1];
    }

    // Вызовы года
    getYearChallenges(number) {
        const challenges = {
            1: ['Не быть слишком агрессивным', 'Учитывать мнение других', 'Избегать импульсивности'],
            2: ['Не терять себя в отношениях', 'Не быть слишком зависимым', 'Преодолеть нерешительность'],
            3: ['Не распыляться на многое', 'Избегать поверхностности', 'Контролировать эмоции'],
            4: ['Не перерабатывать', 'Избегать ригидности', 'Находить баланс работы и отдыха'],
            5: ['Не быть безответственным', 'Избегать хаоса', 'Завершать начатое'],
            6: ['Не брать слишком много ответственности', 'Избегать контроля', 'Заботиться о себе'],
            7: ['Не уходить в изоляцию', 'Избегать критичности', 'Доверять интуиции'],
            8: ['Не стать материалистом', 'Избегать жадности', 'Помнить о духовном'],
            9: ['Не цепляться за прошлое', 'Избегать жертвенности', 'Прощать и отпускать']
        };
        
        return challenges[number] || challenges[1];
    }

    // Благоприятные месяцы
    getFavorableMonths(personalYear, year) {
        const favorable = [];
        
        // Месяцы, которые резонируют с персональным годом
        for (let month = 1; month <= 12; month++) {
            const monthEnergy = this.reduceToSingle(month + personalYear);
            
            // Благоприятны месяцы с энергией 1, 3, 5, 6, 9
            if ([1, 3, 5, 6, 9].includes(monthEnergy)) {
                favorable.push({
                    month: month,
                    name: this.getMonthName(month),
                    energy: monthEnergy,
                    reason: this.getMonthReason(monthEnergy)
                });
            }
        }
        
        return favorable;
    }

    // Название месяца
    getMonthName(month) {
        const months = [
            '', 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        return months[month];
    }

    // Причина благоприятности месяца
    getMonthReason(energy) {
        const reasons = {
            1: 'Начинания и новые возможности',
            3: 'Творчество и коммуникация',
            5: 'Перемены и рост',
            6: 'Гармония и стабильность',
            9: 'Завершение и трансформация'
        };
        return reasons[energy] || 'Позитивная энергия';
    }

    // Персональный месяц
    calculatePersonalMonth(year = null, month = null) {
        if (!this.userBirthDate) return null;
        
        const targetYear = year || this.currentDate.getFullYear();
        const targetMonth = month || (this.currentDate.getMonth() + 1);
        
        const personalYear = this.calculatePersonalYear(targetYear);
        const personalMonth = this.reduceToSingle(personalYear.number + targetMonth);
        
        return {
            number: personalMonth,
            month: targetMonth,
            monthName: this.getMonthName(targetMonth),
            year: targetYear,
            interpretation: this.getPersonalYearInterpretation(personalMonth),
            dailyPractice: this.getDailyPracticeForMonth(personalMonth),
            keyDates: this.getKeyDatesForMonth(personalMonth, targetMonth, targetYear)
        };
    }

    // Ежедневная практика для месяца
    getDailyPracticeForMonth(number) {
        const practices = {
            1: 'Утренняя аффирмация силы и уверенности',
            2: 'Медитация на гармонию в отношениях',
            3: 'Творческое выражение (рисование, письмо)',
            4: 'Планирование дня и организация',
            5: 'Практика выхода из зоны комфорта',
            6: 'Благодарность за семью и дом',
            7: 'Медитация и духовное чтение',
            8: 'Визуализация финансового успеха',
            9: 'Практика прощения и отпускания'
        };
        
        return practices[number] || practices[1];
    }

    // Ключевые даты месяца
    getKeyDatesForMonth(personalMonth, month, year) {
        const keyDates = [];
        
        // Мастер-числа (11, 22, 33) - особые дни
        const daysInMonth = new Date(year, month, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEnergy = this.reduceToSingle(day + personalMonth);
            
            if (dayEnergy === personalMonth) {
                keyDates.push({
                    day: day,
                    type: 'peak',
                    description: 'Пиковая энергия месяца - идеально для важных дел'
                });
            }
            
            if ([11, 22, 33].includes(day)) {
                keyDates.push({
                    day: day,
                    type: 'master',
                    description: 'Мастер-число - день духовного роста'
                });
            }
        }
        
        return keyDates.slice(0, 5); // Топ-5 дат
    }

    // Благоприятные дни текущего месяца
    getFavorableDaysThisMonth() {
        const currentMonth = this.calculatePersonalMonth();
        if (!currentMonth) return [];
        
        const days = [];
        const today = this.currentDate.getDate();
        const daysInMonth = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth() + 1,
            0
        ).getDate();
        
        // Ищем благоприятные дни вперед
        for (let day = today; day <= Math.min(today + 14, daysInMonth); day++) {
            const dayEnergy = this.reduceToSingle(day + currentMonth.number);
            
            if ([1, 3, 5, 6, 9].includes(dayEnergy)) {
                const date = new Date(
                    this.currentDate.getFullYear(),
                    this.currentDate.getMonth(),
                    day
                );
                
                days.push({
                    day: day,
                    date: date.toLocaleDateString('ru-RU'),
                    dayOfWeek: this.getDayOfWeek(date.getDay()),
                    energy: dayEnergy,
                    activity: this.getBestActivityForDay(dayEnergy),
                    isTomorrow: day === today + 1,
                    isToday: day === today
                });
            }
        }
        
        return days;
    }

    // День недели
    getDayOfWeek(day) {
        const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        return days[day];
    }

    // Лучшая активность для дня
    getBestActivityForDay(energy) {
        const activities = {
            1: 'Начать новый проект',
            3: 'Креативная работа',
            5: 'Путешествие или обучение',
            6: 'Время с семьей',
            9: 'Завершение дел'
        };
        
        return activities[energy] || 'Планирование';
    }

    // Полный прогноз
    getFullForecast() {
        const year = this.calculatePersonalYear();
        const month = this.calculatePersonalMonth();
        const days = this.getFavorableDaysThisMonth();
        
        return {
            personalYear: year,
            personalMonth: month,
            favorableDays: days,
            nextMilestone: this.getNextMilestone(year, month)
        };
    }

    // Следующая веха
    getNextMilestone(year, month) {
        const milestones = {
            1: 'Старт нового 9-летнего цикла',
            3: 'Пик творческого периода',
            5: 'Середина цикла - время перемен',
            9: 'Завершение 9-летнего цикла'
        };
        
        return {
            year: year.number,
            description: milestones[year.number] || 'Развитие и рост',
            yearsUntilNewCycle: 10 - year.number
        };
    }
}

// Экспорт
window.ForecastSystem = ForecastSystem;
