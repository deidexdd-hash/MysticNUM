/**
 * ИНТЕРАКТИВНЫЙ РЕДАКТОР РОДОВОГО ДЕРЕВА
 * Позволяет создавать свое дерево и получать анализ на основе знаний
 */

class FamilyTreeBuilder {
    constructor(knowledgeBase) {
        this.kb = knowledgeBase;
        this.familyMembers = [];
        this.currentUser = null;
        this.relationshipTypes = {
            'parent': 'Родитель',
            'child': 'Ребенок',
            'sibling': 'Брат/Сестра',
            'grandparent': 'Бабушка/Дедушка',
            'grandchild': 'Внук/Внучка',
            'spouse': 'Супруг/Супруга',
            'aunt_uncle': 'Тетя/Дядя',
            'cousin': 'Двоюродный брат/сестра'
        };
    }

    // Добавить пользователя (точка отсчета)
    setCurrentUser(data) {
        this.currentUser = {
            id: 'user_0',
            name: data.name,
            birthDate: data.birthDate,
            gender: data.gender,
            generation: 0,
            isUser: true,
            matrix: this.calculateMatrix(data.birthDate),
            programs: []
        };
        
        this.familyMembers = [this.currentUser];
        this.analyzeUserPrograms();
        return this.currentUser;
    }

    // Добавить члена семьи
    addFamilyMember(data) {
        const member = {
            id: `member_${this.familyMembers.length}`,
            name: data.name,
            birthDate: data.birthDate,
            gender: data.gender,
            relationToUser: data.relationToUser,
            generation: this.calculateGeneration(data.relationToUser),
            isAlive: data.isAlive !== false,
            notes: data.notes || '',
            matrix: data.birthDate ? this.calculateMatrix(data.birthDate) : null,
            programs: []
        };

        this.familyMembers.push(member);
        
        // Анализ программ члена семьи
        if (member.matrix) {
            this.analyzeMemberPrograms(member);
        }

        return member;
    }

    // Удалить члена семьи
    removeFamilyMember(memberId) {
        this.familyMembers = this.familyMembers.filter(m => m.id !== memberId);
    }

    // Редактировать члена семьи
    editFamilyMember(memberId, data) {
        const member = this.familyMembers.find(m => m.id === memberId);
        if (!member) return null;

        Object.assign(member, data);
        
        if (data.birthDate) {
            member.matrix = this.calculateMatrix(data.birthDate);
            this.analyzeMemberPrograms(member);
        }

        return member;
    }

    // Рассчитать поколение
    calculateGeneration(relation) {
        const generations = {
            'grandparent': -2,
            'parent': -1,
            'sibling': 0,
            'child': 1,
            'grandchild': 2,
            'spouse': 0,
            'aunt_uncle': -1,
            'cousin': 0
        };
        return generations[relation] || 0;
    }

    // Упрощенный расчет матрицы
    calculateMatrix(birthDate) {
        if (!birthDate) return null;

        const numbers = birthDate.split('.').join('').split('').map(Number);
        const uniqueNumbers = [...new Set(numbers)];
        
        return {
            birthDate: birthDate,
            numbers: numbers,
            uniqueNumbers: uniqueNumbers,
            sum: numbers.reduce((a, b) => a + b, 0)
        };
    }

    // Анализ программ пользователя
    analyzeUserPrograms() {
        if (!this.currentUser || !this.currentUser.matrix) return;

        const programs = [];
        const numbers = this.currentUser.matrix.numbers;

        // Анализ по каждому числу
        numbers.forEach(num => {
            const program = this.getAncestralProgramFromKB(num);
            if (program) {
                programs.push(program);
            }
        });

        this.currentUser.programs = programs;
    }

    // Анализ программ члена семьи
    analyzeMemberPrograms(member) {
        if (!member.matrix) return;

        const programs = [];
        const numbers = member.matrix.numbers;

        numbers.forEach(num => {
            const program = this.getAncestralProgramFromKB(num);
            if (program) {
                programs.push(program);
            }
        });

        member.programs = programs;
    }

    // Получить программы из базы знаний
    getAncestralProgramFromKB(number) {
        // Поиск в базе знаний по категории "Родовые программы"
        const ancestralKnowledge = this.kb?.getByCategory?.('ancestral_programs') || [];
        
        const found = ancestralKnowledge.find(item => 
            item.number === number || item.title.includes(`${number}`)
        );

        if (found) {
            return {
                number: number,
                title: found.title,
                description: found.description || found.content,
                category: found.category,
                source: 'knowledge_base'
            };
        }

        // Fallback на встроенные программы
        return this.getBuiltInProgram(number);
    }

    // Встроенные программы (fallback)
    getBuiltInProgram(number) {
        const programs = {
            1: {
                title: 'Программа властолюбия',
                description: 'В Роду была борьба за власть. Важно научиться управлять без агрессии.',
                severity: 'high'
            },
            2: {
                title: 'Программа неуверенности',
                description: 'Род передал страх принятия решений и сомнения в себе.',
                severity: 'medium'
            },
            3: {
                title: 'Программа исключенных',
                description: 'В Роду были аборты и убийства, много исключенных душ.',
                severity: 'high'
            },
            4: {
                title: 'Программа насилия',
                description: 'Род передает опыт физического насилия через эмоциональное.',
                severity: 'high'
            },
            5: {
                title: 'Денежная программа',
                description: 'Блокировка денег и реализации в Роду.',
                severity: 'high'
            },
            6: {
                title: 'Отказ от предназначения',
                description: 'Род не выполнял свои задачи, опирался только на семью.',
                severity: 'medium'
            },
            7: {
                title: 'Отказ от духовности',
                description: 'Род не развивал духовные способности.',
                severity: 'medium'
            },
            8: {
                title: 'Потеря денег и репутации',
                description: 'В Роду теряли деньги и статус.',
                severity: 'high'
            },
            9: {
                title: 'Отказ от Рода',
                description: 'Программа ухода из Рода, экспансия в другие семьи.',
                severity: 'high'
            }
        };

        const program = programs[number];
        return program ? { number, ...program, source: 'built_in' } : null;
    }

    // Получить статистику по всему дереву
    getTreeStatistics() {
        const total = this.familyMembers.length;
        const generations = new Set(this.familyMembers.map(m => m.generation));
        const withMatrix = this.familyMembers.filter(m => m.matrix).length;
        const alive = this.familyMembers.filter(m => m.isAlive).length;

        // Анализ повторяющихся программ
        const allPrograms = this.familyMembers
            .flatMap(m => m.programs || [])
            .map(p => p.title);
        
        const programCounts = {};
        allPrograms.forEach(title => {
            programCounts[title] = (programCounts[title] || 0) + 1;
        });

        const repeatingPrograms = Object.entries(programCounts)
            .filter(([_, count]) => count > 1)
            .sort((a, b) => b[1] - a[1])
            .map(([title, count]) => ({ title, count }));

        return {
            totalMembers: total,
            generationsCount: generations.size,
            withMatrixCount: withMatrix,
            aliveCount: alive,
            repeatingPrograms: repeatingPrograms,
            mostCommonProgram: repeatingPrograms[0] || null
        };
    }

    // Получить рекомендации по работе с Родом
    getTreeRecommendations() {
        const stats = this.getTreeStatistics();
        const recommendations = [];

        // Если есть повторяющиеся программы
        if (stats.repeatingPrograms.length > 0) {
            const top = stats.repeatingPrograms[0];
            recommendations.push({
                priority: 1,
                icon: '⚠️',
                title: 'Работа с родовой программой',
                description: `Программа "${top.title}" повторяется у ${top.count} членов Рода. Это ключевая точка для работы.`,
                action: 'Изучите практики по данной программе в разделе Знаний'
            });
        }

        // Если мало данных о Роде
        if (stats.withMatrixCount < stats.totalMembers * 0.5) {
            recommendations.push({
                priority: 2,
                icon: '📝',
                title: 'Соберите больше данных',
                description: `У ${stats.totalMembers - stats.withMatrixCount} членов Рода нет даты рождения. Добавьте даты для полного анализа.`,
                action: 'Узнайте даты рождения у родственников'
            });
        }

        // Работа с поколениями
        if (stats.generationsCount >= 3) {
            recommendations.push({
                priority: 3,
                icon: '🌳',
                title: 'Глубинная родовая работа',
                description: `В дереве ${stats.generationsCount} поколений. Можно работать с глубинными программами.`,
                action: 'Практика "Исцеление 7 поколений"'
            });
        }

        return recommendations.sort((a, b) => a.priority - b.priority);
    }

    // Визуализация дерева
    generateTreeVisualization() {
        const byGeneration = {};
        
        this.familyMembers.forEach(member => {
            const gen = member.generation;
            if (!byGeneration[gen]) {
                byGeneration[gen] = [];
            }
            byGeneration[gen].push(member);
        });

        const generations = Object.keys(byGeneration)
            .map(Number)
            .sort((a, b) => a - b)
            .map(gen => ({
                level: gen,
                name: this.getGenerationName(gen),
                members: byGeneration[gen],
                count: byGeneration[gen].length
            }));

        return {
            generations: generations,
            totalMembers: this.familyMembers.length,
            userGeneration: 0
        };
    }

    // Название поколения
    getGenerationName(gen) {
        const names = {
            '-2': 'Прабабушки/Прадедушки',
            '-1': 'Родители/Бабушки/Дедушки',
            '0': 'Вы и Ваши братья/сестры',
            '1': 'Дети',
            '2': 'Внуки'
        };
        return names[gen] || `Поколение ${gen}`;
    }

    // Экспорт дерева
    exportTree() {
        return {
            version: '1.0',
            createdAt: new Date().toISOString(),
            user: this.currentUser,
            members: this.familyMembers,
            statistics: this.getTreeStatistics(),
            recommendations: this.getTreeRecommendations()
        };
    }

    // Импорт дерева
    importTree(data) {
        if (!data || !data.version) {
            throw new Error('Неверный формат данных');
        }

        this.currentUser = data.user;
        this.familyMembers = data.members;
    }

    // Сохранить в localStorage
    saveToLocalStorage() {
        const data = this.exportTree();
        localStorage.setItem('mysticnum_family_tree', JSON.stringify(data));
    }

    // Загрузить из localStorage
    loadFromLocalStorage() {
        const stored = localStorage.getItem('mysticnum_family_tree');
        if (stored) {
            const data = JSON.parse(stored);
            this.importTree(data);
            return true;
        }
        return false;
    }

    // Очистить дерево
    clearTree() {
        this.familyMembers = [];
        this.currentUser = null;
        localStorage.removeItem('mysticnum_family_tree');
    }
}

// Экспорт
window.FamilyTreeBuilder = FamilyTreeBuilder;
