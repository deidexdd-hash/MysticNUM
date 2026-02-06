/**
 * ПРЕМИУМ СИСТЕМА ПРАКТИК
 * Интеллектуальная привязка практик к матрице и состоянию пользователя
 */

class PracticesSystem {
    constructor(knowledgeBase) {
        this.kb = knowledgeBase;
        this.userMatrix = null;
        this.currentFilters = {
            type: 'all',
            difficulty: 'all',
            duration: 'all',
            goal: 'all'
        };
    }

    // Устанавливаем матрицу пользователя для персонализации
    setUserMatrix(matrix) {
        this.userMatrix = matrix;
    }

    // Получить рекомендованные практики на основе матрицы
    getRecommendedPractices() {
        if (!this.userMatrix) return [];

        const recommendations = [];
        const issues = this.analyzeMatrixIssues();
        
        // Подбираем практики для каждой проблемы
        issues.forEach(issue => {
            const practices = this.findPracticesForIssue(issue);
            recommendations.push({
                issue: issue,
                practices: practices,
                priority: this.calculatePriority(issue)
            });
        });

        // Сортируем по приоритету
        return recommendations.sort((a, b) => b.priority - a.priority);
    }

    // Анализ проблем в матрице
    analyzeMatrixIssues() {
        const issues = [];
        
        if (!this.userMatrix) return issues;

        // Пустые ячейки = недостаток качеств
        const emptyСells = this.userMatrix.cells.filter(c => c.count === 0);
        emptyСells.forEach(cell => {
            issues.push({
                type: 'deficiency',
                number: cell.number,
                severity: 'high',
                description: `Отсутствие ${cell.number} - нужно развивать ${this.getQualityName(cell.number)}`
            });
        });

        // Перегруженные ячейки = избыток
        const overloadedCells = this.userMatrix.cells.filter(c => c.count > 5);
        overloadedCells.forEach(cell => {
            issues.push({
                type: 'excess',
                number: cell.number,
                severity: 'medium',
                description: `Избыток ${cell.number} - нужно балансировать ${this.getQualityName(cell.number)}`
            });
        });

        // Родовые программы
        if (this.userMatrix.ancestralPrograms) {
            this.userMatrix.ancestralPrograms.forEach(program => {
                issues.push({
                    type: 'ancestral',
                    program: program.name,
                    severity: 'high',
                    description: program.description
                });
            });
        }

        return issues;
    }

    // Находим практики для конкретной проблемы
    findPracticesForIssue(issue) {
        const allPractices = this.getAllPractices();
        
        return allPractices.filter(practice => {
            // Проверяем соответствие по числу
            if (issue.number && practice.relatedNumbers) {
                return practice.relatedNumbers.includes(issue.number);
            }
            
            // Проверяем соответствие по категории
            if (issue.type === 'ancestral' && practice.category) {
                return practice.category.includes('ancestral') || 
                       practice.category.includes('род');
            }
            
            // Проверяем по ключевым словам
            if (practice.content) {
                const content = practice.content.toLowerCase();
                const keywords = this.getIssueKeywords(issue);
                return keywords.some(kw => content.includes(kw));
            }
            
            return false;
        }).slice(0, 5); // Топ-5 практик для каждой проблемы
    }

    // Ключевые слова для поиска практик
    getIssueKeywords(issue) {
        const keywordMap = {
            1: ['лидерство', 'воля', 'начинания', 'энергия'],
            2: ['партнерство', 'дипломатия', 'чувствительность'],
            3: ['творчество', 'самовыражение', 'общение'],
            4: ['стабильность', 'порядок', 'работа', 'структура'],
            5: ['свобода', 'путешествия', 'изменения'],
            6: ['семья', 'ответственность', 'забота', 'гармония'],
            7: ['духовность', 'анализ', 'мудрость', 'познание'],
            8: ['власть', 'деньги', 'материальный мир'],
            9: ['служение', 'завершение', 'трансформация']
        };
        
        if (issue.number) {
            return keywordMap[issue.number] || [];
        }
        
        return [];
    }

    // Получить название качества по числу
    getQualityName(number) {
        const qualities = {
            1: 'лидерские качества и волю',
            2: 'партнерство и дипломатию',
            3: 'творчество и самовыражение',
            4: 'дисциплину и структуру',
            5: 'свободу и адаптивность',
            6: 'ответственность и заботу',
            7: 'духовность и мудрость',
            8: 'материальное благополучие',
            9: 'служение и трансформацию'
        };
        return qualities[number] || 'важные качества';
    }

    // Приоритет проблемы
    calculatePriority(issue) {
        const severityScore = {
            'high': 100,
            'medium': 50,
            'low': 25
        };
        
        const typeScore = {
            'ancestral': 90,
            'deficiency': 70,
            'excess': 40
        };
        
        return (severityScore[issue.severity] || 0) + (typeScore[issue.type] || 0);
    }

    // Получить все практики
    getAllPractices() {
        if (!this.kb || !this.kb.modules || !this.kb.modules.practices) {
            return [];
        }
        
        const practices = this.kb.modules.practices;
        const all = [];
        
        // Медитации
        if (practices.meditations) {
            practices.meditations.forEach(p => {
                all.push({
                    ...p,
                    type: 'meditation',
                    icon: '🧘',
                    duration: this.extractDuration(p.content),
                    difficulty: this.estimateDifficulty(p.content)
                });
            });
        }
        
        // Молитвы
        if (practices.prayers) {
            practices.prayers.forEach(p => {
                all.push({
                    ...p,
                    type: 'prayer',
                    icon: '🙏',
                    duration: this.extractDuration(p.content),
                    difficulty: 'easy'
                });
            });
        }
        
        // Ритуалы
        if (practices.rituals) {
            practices.rituals.forEach(p => {
                all.push({
                    ...p,
                    type: 'ritual',
                    icon: '🕯️',
                    duration: this.extractDuration(p.content),
                    difficulty: this.estimateDifficulty(p.content)
                });
            });
        }
        
        // Техники
        if (practices.items) {
            practices.items.forEach(p => {
                if (p.type === 'method' || p.type === 'sequence') {
                    all.push({
                        ...p,
                        type: 'technique',
                        icon: '⚙️',
                        duration: this.extractDuration(p.content),
                        difficulty: this.estimateDifficulty(p.content)
                    });
                }
            });
        }
        
        return all;
    }

    // Извлечь длительность из описания
    extractDuration(content) {
        if (!content) return 'unknown';
        
        const text = content.toLowerCase();
        
        if (text.includes('40 дней') || text.includes('40 день')) return '40 days';
        if (text.includes('21 день') || text.includes('21 день')) return '21 days';
        if (text.includes('14 дней') || text.includes('14 день')) return '14 days';
        if (text.includes('10 дней') || text.includes('10 день')) return '10 days';
        if (text.includes('7 дней') || text.includes('неделя')) return '7 days';
        if (text.includes('3 дня')) return '3 days';
        if (text.includes('20 минут') || text.includes('минут')) return 'under 30min';
        if (text.includes('одн')) return '1 day';
        
        return 'unknown';
    }

    // Оценить сложность
    estimateDifficulty(content) {
        if (!content) return 'medium';
        
        const text = content.toLowerCase();
        const length = text.length;
        
        // Длинные практики = сложные
        if (length > 2000 || text.includes('40 дней') || text.includes('генограмма')) {
            return 'hard';
        }
        
        // Простые молитвы и медитации
        if (length < 500 || text.includes('молитва') || text.includes('простая')) {
            return 'easy';
        }
        
        return 'medium';
    }

    // Получить практики с фильтрами
    getFilteredPractices(filters = {}) {
        const all = this.getAllPractices();
        
        return all.filter(p => {
            if (filters.type && filters.type !== 'all' && p.type !== filters.type) {
                return false;
            }
            
            if (filters.difficulty && filters.difficulty !== 'all' && p.difficulty !== filters.difficulty) {
                return false;
            }
            
            if (filters.duration && filters.duration !== 'all') {
                const durationMatch = {
                    'quick': ['under 30min', '1 day'],
                    'medium': ['3 days', '7 days', '10 days'],
                    'long': ['14 days', '21 days', '40 days']
                };
                
                if (!durationMatch[filters.duration]?.includes(p.duration)) {
                    return false;
                }
            }
            
            return true;
        });
    }

    // Создать программу практик для пользователя
    createPersonalProgram(durationDays = 30) {
        const recommendations = this.getRecommendedPractices();
        const program = {
            duration: durationDays,
            phases: [],
            totalPractices: 0
        };
        
        // Фаза 1: Работа с самыми критичными проблемами (первые 10 дней)
        if (recommendations.length > 0) {
            const topIssue = recommendations[0];
            program.phases.push({
                name: 'Фаза 1: Основа',
                days: [1, 10],
                focus: topIssue.issue.description,
                practices: topIssue.practices.slice(0, 2),
                goal: 'Устранение критичной проблемы'
            });
        }
        
        // Фаза 2: Балансировка (следующие 10 дней)
        if (recommendations.length > 1) {
            const secondIssue = recommendations[1];
            program.phases.push({
                name: 'Фаза 2: Балансировка',
                days: [11, 20],
                focus: secondIssue.issue.description,
                practices: secondIssue.practices.slice(0, 2),
                goal: 'Гармонизация энергий'
            });
        }
        
        // Фаза 3: Интеграция (последние 10 дней)
        if (recommendations.length > 2) {
            const thirdIssue = recommendations[2];
            program.phases.push({
                name: 'Фаза 3: Интеграция',
                days: [21, 30],
                focus: thirdIssue.issue.description,
                practices: thirdIssue.practices.slice(0, 2),
                goal: 'Закрепление результатов'
            });
        }
        
        program.totalPractices = program.phases.reduce((sum, phase) => 
            sum + phase.practices.length, 0
        );
        
        return program;
    }

    // Поиск практик
    searchPractices(query) {
        const all = this.getAllPractices();
        const q = query.toLowerCase();
        
        return all.filter(p => {
            return (p.name && p.name.toLowerCase().includes(q)) ||
                   (p.content && p.content.toLowerCase().includes(q)) ||
                   (p.category && p.category.toLowerCase().includes(q));
        });
    }
}

// Экспорт
window.PracticesSystem = PracticesSystem;
