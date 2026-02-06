/**
 * ПРЕМИУМ СИСТЕМА РОДОВЫХ ПРОГРАММ
 * Визуализация, анализ и работа с Родом
 */

class AncestralSystem {
    constructor(knowledgeBase) {
        this.kb = knowledgeBase;
        this.userMatrix = null;
        this.familyTree = null;
    }

    setUserMatrix(matrix) {
        this.userMatrix = matrix;
    }

    // Анализ родовых программ на основе матрицы
    analyzeAncestralPrograms() {
        if (!this.userMatrix) return null;

        const programs = {
            detected: [],
            severity: {},
            recommendations: []
        };

        // Анализ по числам рождения
        const birthNumbers = this.extractBirthNumbers();
        
        birthNumbers.forEach(num => {
            const program = this.getAncestralProgramForNumber(num);
            if (program) {
                programs.detected.push(program);
            }
        });

        // Анализ по пустым ячейкам (исключенные качества)
        const emptyCells = this.userMatrix.cells?.filter(c => c.count === 0) || [];
        emptyCells.forEach(cell => {
            programs.detected.push({
                type: 'exclusion',
                number: cell.number,
                title: `Исключенное качество ${cell.number}`,
                description: `В Роду было отвержение ${this.getQualityDescription(cell.number)}`,
                severity: 'medium',
                practices: this.findPracticesForNumber(cell.number)
            });
        });

        // Анализ кармических долгов (по датам)
        const karmicDebts = this.detectKarmicDebts();
        programs.detected.push(...karmicDebts);

        // Расчет общей тяжести
        programs.severity = this.calculateSeverityLevel(programs.detected);

        // Рекомендации
        programs.recommendations = this.generateRecommendations(programs.detected);

        return programs;
    }

    // Извлечь числа рождения из матрицы
    extractBirthNumbers() {
        if (!this.userMatrix || !this.userMatrix.birthDate) return [];
        
        const date = this.userMatrix.birthDate;
        const numbers = date.split('').filter(c => c !== '.').map(Number);
        
        return numbers;
    }

    // Получить родовую программу для числа
    getAncestralProgramForNumber(number) {
        const programs = {
            1: {
                type: 'power',
                title: 'Программа властолюбия',
                description: 'В Роду была борьба за власть. Важно научиться управлять без агрессии.',
                severity: 'high',
                signs: ['Упрямство', 'Желание контролировать', 'Сложность делегирования'],
                healing: 'Практики на смирение и принятие'
            },
            2: {
                type: 'uncertainty',
                title: 'Программа неуверенности',
                description: 'Род передал страх принятия решений и сомнения в себе.',
                severity: 'medium',
                signs: ['Нерешительность', 'Созависимость', 'Страх одиночества'],
                healing: 'Практики на уверенность и границы'
            },
            3: {
                type: 'exclusion',
                title: 'Программа исключенных',
                description: 'В Роду были аборты и убийства, много исключенных душ.',
                severity: 'high',
                signs: ['Растрачивание ресурсов', 'Поиск опоры', 'Жадность'],
                healing: 'Практика принятия исключенных'
            },
            4: {
                type: 'violence',
                title: 'Программа насилия',
                description: 'Род передает опыт физического насилия через эмоциональное.',
                severity: 'high',
                signs: ['Требовательность', 'Эмоциональное давление', 'Контроль'],
                healing: 'Практики на мягкость и принятие'
            },
            5: {
                type: 'money',
                title: 'Денежная программа',
                description: 'Блокировка денег и реализации в Роду.',
                severity: 'high',
                signs: ['Невозможность заработать', 'Безответственность', 'Игромания'],
                healing: 'Практики на изобилие и ответственность'
            },
            6: {
                type: 'destiny_refusal',
                title: 'Отказ от предназначения',
                description: 'Род не выполнял свои задачи, опирался только на семью.',
                severity: 'medium',
                signs: ['Требовательность к другим', 'Заносчивость', 'Страхи'],
                healing: 'Практики на доверие Роду'
            },
            7: {
                type: 'destiny_refusal',
                title: 'Отказ от духовности',
                description: 'Род не развивал духовные способности.',
                severity: 'medium',
                signs: ['Высокомерие', 'Болтливость', 'Хитрость'],
                healing: 'Медитации и духовные практики'
            },
            8: {
                type: 'money_loss',
                title: 'Потеря денег и репутации',
                description: 'В Роду теряли деньги и статус.',
                severity: 'high',
                signs: ['Страх потери', 'Скупость', 'Воровство ресурсов'],
                healing: 'Практики на изобилие и щедрость'
            },
            9: {
                type: 'family_refusal',
                title: 'Отказ от Рода',
                description: 'Программа ухода из Рода, экспансия в другие семьи.',
                severity: 'high',
                signs: ['Интриги', 'Сомнения', 'Желание контролировать'],
                healing: 'Практики на принятие Рода'
            }
        };

        return programs[number] || null;
    }

    // Описание качеств
    getQualityDescription(number) {
        const qualities = {
            1: 'лидерства и силы воли',
            2: 'партнерства и чувствительности',
            3: 'творчества и самовыражения',
            4: 'дисциплины и структуры',
            5: 'свободы и адаптации',
            6: 'ответственности и заботы',
            7: 'духовности и мудрости',
            8: 'материального успеха',
            9: 'служения и завершения'
        };
        return qualities[number] || 'важного качества';
    }

    // Поиск практик для числа
    findPracticesForNumber(number) {
        // Заглушка - будет интегрировано с PracticesSystem
        return [];
    }

    // Определение кармических долгов
    detectKarmicDebts() {
        const debts = [];
        
        if (!this.userMatrix || !this.userMatrix.birthDate) return debts;
        
        const date = this.userMatrix.birthDate;
        
        // Кармические числа: 13, 14, 16, 19
        if (date.includes('13')) {
            debts.push({
                type: 'karmic_debt',
                number: 13,
                title: 'Кармический долг 13',
                description: 'Лень и эгоизм в прошлых жизнях. Нужно упорно трудиться.',
                severity: 'high',
                signs: ['Лень', 'Прокрастинация', 'Нежелание работать'],
                healing: 'Дисциплина и регулярный труд'
            });
        }
        
        if (date.includes('14')) {
            debts.push({
                type: 'karmic_debt',
                number: 14,
                title: 'Кармический долг 14',
                description: 'Злоупотребление свободой. Важна умеренность.',
                severity: 'high',
                signs: ['Зависимости', 'Безответственность', 'Хаос'],
                healing: 'Практики на самоконтроль'
            });
        }
        
        if (date.includes('16')) {
            debts.push({
                type: 'karmic_debt',
                number: 16,
                title: 'Кармический долг 16',
                description: 'Разрушенные отношения. Нужно учиться любви.',
                severity: 'high',
                signs: ['Проблемы в отношениях', 'Эгоцентризм', 'Одиночество'],
                healing: 'Практики на открытие сердца'
            });
        }
        
        if (date.includes('19')) {
            debts.push({
                type: 'karmic_debt',
                number: 19,
                title: 'Кармический долг 19',
                description: 'Злоупотребление властью. Важно служить.',
                severity: 'high',
                signs: ['Гордыня', 'Доминирование', 'Игнорирование других'],
                healing: 'Практики на смирение и служение'
            });
        }
        
        return debts;
    }

    // Расчет уровня тяжести
    calculateSeverityLevel(programs) {
        const highCount = programs.filter(p => p.severity === 'high').length;
        const mediumCount = programs.filter(p => p.severity === 'medium').length;
        
        let level = 'light';
        let score = mediumCount * 1 + highCount * 2;
        
        if (score >= 5) level = 'critical';
        else if (score >= 3) level = 'heavy';
        else if (score >= 1) level = 'medium';
        
        return {
            level: level,
            score: score,
            highIssues: highCount,
            mediumIssues: mediumCount,
            totalIssues: programs.length
        };
    }

    // Генерация рекомендаций
    generateRecommendations(programs) {
        const recommendations = [];
        
        // Группируем по типам
        const byType = {};
        programs.forEach(p => {
            if (!byType[p.type]) byType[p.type] = [];
            byType[p.type].push(p);
        });
        
        // Рекомендации по типам
        if (byType.exclusion && byType.exclusion.length > 0) {
            recommendations.push({
                priority: 1,
                title: 'Работа с исключенными',
                description: 'В первую очередь примите всех исключенных членов Рода',
                practices: ['Практика принятия исключенных', 'Практика с генограммой'],
                duration: '14 дней'
            });
        }
        
        if (byType.power || byType.violence) {
            recommendations.push({
                priority: 2,
                title: 'Трансформация агрессии',
                description: 'Преобразуйте родовую агрессию в созидательную силу',
                practices: ['Медитация прощения', 'Практика снятия проклятия'],
                duration: '24 дня'
            });
        }
        
        if (byType.money || byType.money_loss) {
            recommendations.push({
                priority: 3,
                title: 'Восстановление денежного потока',
                description: 'Снимите родовые блоки на финансы',
                practices: ['Практика усиления денежной энергии', 'Родовой обережный пояс'],
                duration: '40 дней'
            });
        }
        
        if (byType.karmic_debt && byType.karmic_debt.length > 0) {
            recommendations.push({
                priority: 4,
                title: 'Отработка кармических долгов',
                description: 'Работайте с кармическими уроками через служение и дисциплину',
                practices: ['Ежедневные духовные практики', 'Служение другим'],
                duration: 'постоянно'
            });
        }
        
        return recommendations.sort((a, b) => a.priority - b.priority);
    }

    // Создать план работы с Родом
    createAncestralWorkPlan(userPrograms) {
        const plan = {
            totalDuration: 0,
            phases: [],
            dailyPractices: []
        };
        
        const recommendations = userPrograms.recommendations;
        
        recommendations.forEach((rec, index) => {
            const phase = {
                number: index + 1,
                title: rec.title,
                description: rec.description,
                practices: rec.practices,
                duration: rec.duration,
                startDay: plan.totalDuration + 1
            };
            
            // Конвертируем длительность в дни
            const days = this.parseDuration(rec.duration);
            phase.endDay = phase.startDay + days - 1;
            plan.totalDuration += days;
            
            plan.phases.push(phase);
        });
        
        return plan;
    }

    // Парсинг длительности
    parseDuration(duration) {
        if (duration.includes('40')) return 40;
        if (duration.includes('24')) return 24;
        if (duration.includes('14')) return 14;
        if (duration.includes('10')) return 10;
        if (duration.includes('7')) return 7;
        if (duration === 'постоянно') return 365; // год
        return 30; // по умолчанию месяц
    }

    // Визуализация родового древа (базовая)
    generateFamilyTreeVisualization() {
        // Простая визуализация - можно расширить
        return {
            generations: [
                {
                    level: 3,
                    name: 'Прабабушки/Прадедушки',
                    members: 8,
                    influence: 'Родовые паттерны и традиции'
                },
                {
                    level: 2,
                    name: 'Бабушки/Дедушки',
                    members: 4,
                    influence: 'Семейные установки и убеждения'
                },
                {
                    level: 1,
                    name: 'Родители',
                    members: 2,
                    influence: 'Прямые программы и сценарии'
                },
                {
                    level: 0,
                    name: 'Вы',
                    members: 1,
                    influence: 'Точка трансформации'
                }
            ],
            totalInfluence: 15,
            keyMessage: 'Вы - точка, где Род может измениться'
        };
    }

    // Статистика по Роду
    getAncestralStats(programs) {
        return {
            totalPrograms: programs.detected.length,
            criticalIssues: programs.detected.filter(p => p.severity === 'high').length,
            karmicDebts: programs.detected.filter(p => p.type === 'karmic_debt').length,
            estimatedWorkDuration: this.estimateTotalDuration(programs.recommendations),
            priorityFocus: programs.recommendations[0]?.title || 'Не определено'
        };
    }

    // Оценка общей длительности работы
    estimateTotalDuration(recommendations) {
        return recommendations.reduce((total, rec) => {
            return total + this.parseDuration(rec.duration);
        }, 0);
    }
}

// Экспорт
window.AncestralSystem = AncestralSystem;
