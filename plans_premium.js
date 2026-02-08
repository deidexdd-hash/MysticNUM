/**
 * ПРЕМИУМ СИСТЕМА ПЛАНОВ
 * Интерактивные планы с прогрессом и привязкой к матрице
 */

class PlansSystem {
    constructor(knowledgeBase) {
        this.kb = knowledgeBase;
        this.userMatrix = null;
        this.progress = {
            mental: {},
            physical: {},
            emotional: {}
        };
        this.loadProgress();
    }

    setUserMatrix(matrix) {
        this.userMatrix = matrix;
    }

    // Загрузка прогресса из localStorage
    loadProgress() {
        try {
            const saved = localStorage.getItem('mysticnum_plans_progress');
            if (saved) {
                this.progress = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Не удалось загрузить прогресс');
        }
    }

    // Сохранение прогресса
    saveProgress() {
        try {
            localStorage.setItem('mysticnum_plans_progress', JSON.stringify(this.progress));
        } catch (e) {
            console.warn('Не удалось сохранить прогресс');
        }
    }

    // Получить ментальный план с прогрессом
    getMentalPlan() {
        const items = this.kb?.modules?.plans?.mental || [];
        return this.enrichPlanWithProgress(items, 'mental');
    }

    // Получить физический план
    getPhysicalPlan() {
        const items = this.kb?.modules?.plans?.physical || [];
        return this.enrichPlanWithProgress(items, 'physical');
    }

    // Получить эмоциональный план
    getEmotionalPlan() {
        const items = this.kb?.modules?.plans?.emotional || [];
        return this.enrichPlanWithProgress(items, 'emotional');
    }

    // Обогащение плана прогрессом и анализом
    enrichPlanWithProgress(items, planType) {
        return items.map((item, index) => {
            const id = this.generateItemId(item, index);
            const progress = this.progress[planType][id] || {
                completed: false,
                level: 0,
                notes: '',
                lastUpdated: null
            };

            return {
                ...item,
                id: id,
                progress: progress,
                priority: this.calculatePriority(item, planType),
                recommendations: this.getItemRecommendations(item, planType),
                relatedPractices: this.findRelatedPractices(item),
                difficulty: this.estimateDifficulty(item)
            };
        });
    }

    // Генерация ID для элемента
    generateItemId(item, index) {
        return `${item.name || item.content.substring(0, 20)}_${index}`.replace(/\s/g, '_');
    }

    // Расчет приоритета на основе матрицы
    calculatePriority(item, planType) {
        if (!this.userMatrix) return 'medium';

        // Анализируем содержимое на ключевые слова
        const content = (item.name + ' ' + item.content).toLowerCase();
        
        // Высокий приоритет для недостающих качеств
        const emptyCells = this.userMatrix.cells?.filter(c => c.count === 0) || [];
        for (const cell of emptyCells) {
            const keywords = this.getNumberKeywords(cell.number);
            if (keywords.some(kw => content.includes(kw))) {
                return 'high';
            }
        }

        // Средний приоритет для перегруженных
        const overloadedCells = this.userMatrix.cells?.filter(c => c.count > 5) || [];
        for (const cell of overloadedCells) {
            const keywords = this.getNumberKeywords(cell.number);
            if (keywords.some(kw => content.includes(kw))) {
                return 'medium';
            }
        }

        return 'low';
    }

    // Ключевые слова для чисел
    getNumberKeywords(number) {
        const keywords = {
            1: ['энергия', 'воля', 'лидер', 'начало', 'действие'],
            2: ['партнер', 'чувств', 'баланс', 'дипломат'],
            3: ['творчес', 'общен', 'радост', 'экспресс'],
            4: ['работ', 'структур', 'порядок', 'дисциплин'],
            5: ['свобод', 'изменен', 'путеш', 'адаптац'],
            6: ['семь', 'ответствен', 'забот', 'гармон'],
            7: ['духов', 'мудрост', 'анализ', 'познан'],
            8: ['матери', 'деньг', 'власт', 'успех'],
            9: ['служен', 'трансформ', 'заверш', 'прощен']
        };
        return keywords[number] || [];
    }

    // Рекомендации для элемента
    getItemRecommendations(item, planType) {
        const recommendations = [];
        
        if (!item.progress || !item.progress.completed) {
            recommendations.push({
                type: 'action',
                text: 'Начните с малого - уделите 10 минут в день',
                icon: '▶️'
            });
        }

        if (item.priority === 'high') {
            recommendations.push({
                type: 'important',
                text: 'Высокий приоритет для вашей матрицы',
                icon: '⚡'
            });
        }

        // Связь с практиками
        const practices = this.findRelatedPractices(item);
        if (practices.length > 0) {
            recommendations.push({
                type: 'practice',
                text: `Доступно ${practices.length} практик для усиления`,
                icon: '🧘'
            });
        }

        return recommendations;
    }

    // Поиск связанных практик
    findRelatedPractices(item) {
        // Заглушка - будет интегрировано с PracticesSystem
        return [];
    }

    // Оценка сложности
    estimateDifficulty(item) {
        const content = item.content?.toLowerCase() || '';
        const length = content.length;

        if (content.includes('глубок') || content.includes('сложн') || length > 500) {
            return 'hard';
        }

        if (content.includes('прост') || content.includes('базов') || length < 200) {
            return 'easy';
        }

        return 'medium';
    }

    // Обновление прогресса
    updateProgress(planType, itemId, progressData) {
        if (!this.progress[planType]) {
            this.progress[planType] = {};
        }

        this.progress[planType][itemId] = {
            ...this.progress[planType][itemId],
            ...progressData,
            lastUpdated: new Date().toISOString()
        };

        this.saveProgress();
    }

    // Отметить как выполненное
    markCompleted(planType, itemId, completed = true) {
        this.updateProgress(planType, itemId, { completed: completed });
    }

    // Установить уровень освоения
    setLevel(planType, itemId, level) {
        // level: 0-100
        this.updateProgress(planType, itemId, { level: level });
    }

    // Добавить заметку
    addNote(planType, itemId, note) {
        this.updateProgress(planType, itemId, { notes: note });
    }

    // Статистика по плану
    getPlanStats(planType) {
        const plan = this.getPlanByType(planType);
        const total = plan.length;
        const completed = plan.filter(item => item.progress?.completed).length;
        const inProgress = plan.filter(item => 
            item.progress?.level > 0 && !item.progress?.completed
        ).length;
        const notStarted = total - completed - inProgress;

        return {
            total: total,
            completed: completed,
            inProgress: inProgress,
            notStarted: notStarted,
            completionPercentage: Math.round((completed / total) * 100),
            averageLevel: this.calculateAverageLevel(plan),
            highPriority: plan.filter(item => item.priority === 'high').length
        };
    }

    // Получить план по типу
    getPlanByType(type) {
        switch (type) {
            case 'mental': return this.getMentalPlan();
            case 'physical': return this.getPhysicalPlan();
            case 'emotional': return this.getEmotionalPlan();
            default: return [];
        }
    }

    // Средний уровень освоения
    calculateAverageLevel(plan) {
        const withProgress = plan.filter(item => item.progress?.level > 0);
        if (withProgress.length === 0) return 0;

        const sum = withProgress.reduce((acc, item) => acc + item.progress.level, 0);
        return Math.round(sum / withProgress.length);
    }

    // Общая статистика
    getOverallStats() {
        return {
            mental: this.getPlanStats('mental'),
            physical: this.getPlanStats('physical'),
            emotional: this.getPlanStats('emotional')
        };
    }

    // Следующий рекомендованный шаг
    getNextStep(planType) {
        const plan = this.getPlanByType(planType);
        
        // Сначала высокий приоритет
        const highPriority = plan.filter(item => 
            item.priority === 'high' && !item.progress?.completed
        );
        if (highPriority.length > 0) {
            return highPriority[0];
        }

        // Затем незавершенные
        const notCompleted = plan.filter(item => !item.progress?.completed);
        if (notCompleted.length > 0) {
            return notCompleted[0];
        }

        return null;
    }

    // Создать персональный план развития
    createPersonalDevelopmentPlan(durationDays = 90) {
        const plan = {
            duration: durationDays,
            phases: [],
            dailyRoutine: []
        };

        // Фаза 1: Ментальный план (30 дней)
        const mentalStats = this.getPlanStats('mental');
        if (mentalStats.notStarted > 0 || mentalStats.inProgress > 0) {
            plan.phases.push({
                name: 'Ментальное развитие',
                days: [1, 30],
                plan: 'mental',
                focus: 'Развитие мышления и осознанности',
                weeklyGoals: this.getWeeklyGoals('mental', 4)
            });
        }

        // Фаза 2: Физический план (30 дней)
        const physicalStats = this.getPlanStats('physical');
        if (physicalStats.notStarted > 0 || physicalStats.inProgress > 0) {
            plan.phases.push({
                name: 'Физическое развитие',
                days: [31, 60],
                plan: 'physical',
                focus: 'Укрепление тела и здоровья',
                weeklyGoals: this.getWeeklyGoals('physical', 4)
            });
        }

        // Фаза 3: Эмоциональный план (30 дней)
        const emotionalStats = this.getPlanStats('emotional');
        if (emotionalStats.notStarted > 0 || emotionalStats.inProgress > 0) {
            plan.phases.push({
                name: 'Эмоциональное развитие',
                days: [61, 90],
                plan: 'emotional',
                focus: 'Гармонизация эмоций и чувств',
                weeklyGoals: this.getWeeklyGoals('emotional', 4)
            });
        }

        // Ежедневная рутина
        plan.dailyRoutine = [
            {
                time: 'Утро',
                duration: '15 мин',
                activity: 'Медитация и настройка на день'
            },
            {
                time: 'День',
                duration: '30 мин',
                activity: 'Работа по текущему плану'
            },
            {
                time: 'Вечер',
                duration: '10 мин',
                activity: 'Рефлексия и заметки о прогрессе'
            }
        ];

        return plan;
    }

    // Недельные цели
    getWeeklyGoals(planType, weeks) {
        const plan = this.getPlanByType(planType);
        const highPriority = plan.filter(item => item.priority === 'high');
        const itemsPerWeek = Math.ceil(highPriority.length / weeks);

        const goals = [];
        for (let week = 1; week <= weeks; week++) {
            const startIdx = (week - 1) * itemsPerWeek;
            const weekItems = highPriority.slice(startIdx, startIdx + itemsPerWeek);
            
            if (weekItems.length > 0) {
                goals.push({
                    week: week,
                    items: weekItems.map(item => item.name || item.content.substring(0, 50)),
                    target: `Освоить ${weekItems.length} важных аспектов`
                });
            }
        }

        return goals;
    }

    // Экспорт прогресса
    exportProgress() {
        return {
            date: new Date().toISOString(),
            stats: this.getOverallStats(),
            progress: this.progress
        };
    }

    // Импорт прогресса
    importProgress(data) {
        if (data && data.progress) {
            this.progress = data.progress;
            this.saveProgress();
            return true;
        }
        return false;
    }

    // Сброс прогресса
    resetProgress(planType = null) {
        if (planType) {
            this.progress[planType] = {};
        } else {
            this.progress = {
                mental: {},
                physical: {},
                emotional: {}
            };
        }
        this.saveProgress();
    }
}

// Экспорт
window.PlansSystem = PlansSystem;
