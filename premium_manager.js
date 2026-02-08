/**
 * PREMIUM INTEGRATION MANAGER
 * Связывает все премиум-системы и управляет UI
 */

class PremiumManager {
    constructor() {
        this.practicesSystem = null;
        this.ancestralSystem = null;
        this.forecastSystem = null;
        this.plansSystem = null;
        this.currentMatrix = null;
        this.knowledgeBase = null;
    }

    // Инициализация всех систем
    async initialize(knowledgeBase) {
        this.knowledgeBase = knowledgeBase;
        
        // Создаем экземпляры систем
        this.practicesSystem = new PracticesSystem(knowledgeBase);
        this.ancestralSystem = new AncestralSystem(knowledgeBase);
        this.forecastSystem = new ForecastSystem(knowledgeBase);
        this.plansSystem = new PlansSystem(knowledgeBase);
        
        console.log('✨ Premium системы инициализированы');
        
        // Устанавливаем обработчики событий
        this.setupEventHandlers();
    }

    // Установка обработчиков
    setupEventHandlers() {
        // Обработчики для практик
        document.querySelectorAll('[data-practice-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.practiceFilter;
                this.filterPractices(filter);
            });
        });

        // Обработчики для планов
        document.querySelectorAll('[data-plan-type]').forEach(element => {
            element.addEventListener('change', (e) => {
                const planType = e.currentTarget.dataset.planType;
                const itemId = e.currentTarget.dataset.itemId;
                this.handlePlanProgress(planType, itemId, e);
            });
        });
    }

    // Обновление матрицы пользователя
    setUserMatrix(matrix) {
        this.currentMatrix = matrix;
        
        // Передаем матрицу во все системы
        if (this.practicesSystem) {
            this.practicesSystem.setUserMatrix(matrix);
        }
        if (this.ancestralSystem) {
            this.ancestralSystem.setUserMatrix(matrix);
        }
        if (this.forecastSystem && matrix.birthDate) {
            this.forecastSystem.setBirthDate(matrix.birthDate);
        }
        if (this.plansSystem) {
            this.plansSystem.setUserMatrix(matrix);
        }

        // Обновляем все вкладки
        this.refreshAllTabs();
    }

    // Обновление всех вкладок
    refreshAllTabs() {
        this.renderPractices();
        this.renderAncestral();
        this.renderForecast();
        this.renderPlans();
    }

    // ========================================
    // ПРАКТИКИ
    // ========================================

    renderPractices() {
        const container = document.getElementById('practices-list');
        if (!container) return;

        const recommendations = this.practicesSystem.getRecommendedPractices();
        
        let html = '';
        
        // Рекомендованные практики (на основе матрицы)
        if (recommendations.length > 0) {
            html += `
                <div class="recommendations-widget fade-in-up">
                    <div class="recommendations-title">
                        ⭐ Рекомендовано для вашей матрицы
                    </div>
            `;
            
            recommendations.slice(0, 3).forEach(rec => {
                html += `
                    <div class="recommendation-item">
                        <div class="recommendation-icon">🎯</div>
                        <div class="recommendation-content">
                            <div class="recommendation-text">
                                <strong>${rec.issue.description}</strong><br>
                                Приоритет: <span class="priority-${rec.issue.severity}">${this.getSeverityLabel(rec.issue.severity)}</span>
                            </div>
                            <div class="recommendation-action" onclick="premiumManager.showPracticeDetails(${JSON.stringify(rec.practices[0])})">
                                Посмотреть практику →
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
        }

        // Все практики в виде карточек
        const allPractices = this.practicesSystem.getAllPractices();
        
        html += `<div class="practices-premium-grid">`;
        
        allPractices.forEach((practice, idx) => {
            html += this.createPracticeCard(practice, idx);
        });
        
        html += `</div>`;
        
        container.innerHTML = html;
    }

    createPracticeCard(practice, index) {
        return `
            <div class="practice-card-premium" onclick="premiumManager.showPracticeDetails(${index})">
                <div class="practice-header">
                    <div class="practice-icon-large">${practice.icon}</div>
                    <div class="practice-meta">
                        <div class="practice-title-large">${practice.name || 'Практика ' + (index + 1)}</div>
                        <div class="practice-badges">
                            <span class="practice-badge badge-duration">${this.formatDuration(practice.duration)}</span>
                            <span class="practice-badge badge-difficulty ${practice.difficulty}">${this.formatDifficulty(practice.difficulty)}</span>
                        </div>
                    </div>
                </div>
                <div class="practice-description">
                    ${this.truncate(practice.content, 150)}
                </div>
                <div class="practice-footer">
                    <div class="practice-priority priority-${practice.priority || 'medium'}">
                        ${this.getPriorityIcon(practice.priority)} ${this.getPriorityLabel(practice.priority)}
                    </div>
                    <span style="color: var(--accent-primary);">Подробнее →</span>
                </div>
            </div>
        `;
    }

    showPracticeDetails(practiceIndex) {
        const practice = this.practicesSystem.getAllPractices()[practiceIndex];
        if (!practice) return;

        const html = `
            <div style="max-width: 700px;">
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
                    <div style="font-size: 48px;">${practice.icon}</div>
                    <div>
                        <h2 style="margin: 0 0 8px 0;">${practice.name}</h2>
                        <div class="practice-badges">
                            <span class="practice-badge badge-duration">${this.formatDuration(practice.duration)}</span>
                            <span class="practice-badge badge-difficulty ${practice.difficulty}">${this.formatDifficulty(practice.difficulty)}</span>
                        </div>
                    </div>
                </div>
                <div style="color: var(--text-secondary); line-height: 1.8; white-space: pre-wrap;">
                    ${practice.content}
                </div>
                ${practice.category ? `<div style="margin-top: 20px; padding: 16px; background: rgba(99, 102, 241, 0.1); border-radius: 12px; font-size: 14px;">
                    <strong>Категория:</strong> ${practice.category}
                </div>` : ''}
            </div>
        `;
        
        showModal(html);
    }

    // ========================================
    // РОДОВЫЕ ПРОГРАММЫ
    // ========================================

    renderAncestral() {
        const container = document.getElementById('ancestralContent');
        if (!container) return;

        if (!this.currentMatrix) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <div style="font-size: 64px; margin-bottom: 20px;">🌳</div>
                    <h3>Сначала рассчитайте матрицу</h3>
                    <p>Перейдите во вкладку "Матрица" и введите дату рождения</p>
                </div>
            `;
            return;
        }

        const treeBuilder = this.ancestralSystem.getTreeBuilder();
        
        // Попытка загрузить сохраненное дерево
        const hasStoredTree = treeBuilder.loadFromLocalStorage();
        
        let html = `
            <div class="ancestral-header" style="margin-bottom: 30px;">
                <h2 style="font-size: 28px; margin-bottom: 12px;">🌳 Ваше Родовое Древо</h2>
                <p style="color: var(--text-muted); margin-bottom: 20px;">
                    Создайте карту своего рода, добавьте родственников и получите анализ родовых программ
                </p>
                
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <button onclick="premiumManager.showAddMemberForm()" class="btn-primary">
                        ➕ Добавить родственника
                    </button>
                    <button onclick="premiumManager.saveTree()" class="btn-secondary">
                        💾 Сохранить дерево
                    </button>
                    <button onclick="premiumManager.exportTreeData()" class="btn-secondary">
                        📥 Экспортировать
                    </button>
                    <button onclick="premiumManager.clearTreeConfirm()" class="btn-secondary" style="background: var(--danger);">
                        🗑️ Очистить дерево
                    </button>
                </div>
            </div>

            <!-- Форма добавления члена семьи (скрыта по умолчанию) -->
            <div id="addMemberForm" style="display: none; margin-bottom: 30px; padding: 24px; background: rgba(99, 102, 241, 0.05); border-radius: 16px; border: 1px solid rgba(99, 102, 241, 0.2);">
                <h3 style="margin-bottom: 20px;">👤 Добавить члена семьи</h3>
                <div style="display: grid; gap: 16px;">
                    <div>
                        <label style="display: block; margin-bottom: 6px; font-weight: 500;">Имя:</label>
                        <input type="text" id="memberName" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: var(--text-primary);">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 6px; font-weight: 500;">Дата рождения (ДД.ММ.ГГГГ):</label>
                        <input type="text" id="memberBirthDate" placeholder="01.01.1950" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: var(--text-primary);">
                        <small style="color: var(--text-muted);">Оставьте пустым, если не знаете</small>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 6px; font-weight: 500;">Пол:</label>
                        <select id="memberGender" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: var(--text-primary);">
                            <option value="male">Мужской</option>
                            <option value="female">Женский</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 6px; font-weight: 500;">Отношение к вам:</label>
                        <select id="memberRelation" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: var(--text-primary);">
                            <option value="parent">Родитель</option>
                            <option value="child">Ребенок</option>
                            <option value="sibling">Брат/Сестра</option>
                            <option value="grandparent">Бабушка/Дедушка</option>
                            <option value="grandchild">Внук/Внучка</option>
                            <option value="spouse">Супруг/Супруга</option>
                            <option value="aunt_uncle">Тетя/Дядя</option>
                            <option value="cousin">Двоюродный брат/сестра</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="memberAlive" checked style="width: 20px; height: 20px;">
                            <span>Жив/а</span>
                        </label>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 6px; font-weight: 500;">Заметки (необязательно):</label>
                        <textarea id="memberNotes" rows="3" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: var(--text-primary);"></textarea>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button onclick="premiumManager.addMemberSubmit()" class="btn-primary">
                            ✅ Добавить
                        </button>
                        <button onclick="premiumManager.cancelAddMember()" class="btn-secondary">
                            ❌ Отмена
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Статистика дерева
        if (treeBuilder.familyMembers.length > 0) {
            const stats = treeBuilder.getTreeStatistics();
            
            html += `
                <div class="plan-stats-card" style="margin-bottom: 30px;">
                    <h3 style="margin-bottom: 20px;">📊 Статистика Рода</h3>
                    <div class="plan-stats-grid">
                        <div class="plan-stat-item">
                            <div class="plan-stat-value">${stats.totalMembers}</div>
                            <div class="plan-stat-label">Членов Рода</div>
                        </div>
                        <div class="plan-stat-item">
                            <div class="plan-stat-value">${stats.generationsCount}</div>
                            <div class="plan-stat-label">Поколений</div>
                        </div>
                        <div class="plan-stat-item">
                            <div class="plan-stat-value">${stats.withMatrixCount}</div>
                            <div class="plan-stat-label">С датами рождения</div>
                        </div>
                        <div class="plan-stat-item">
                            <div class="plan-stat-value">${stats.repeatingPrograms.length}</div>
                            <div class="plan-stat-label">Повторяющихся программ</div>
                        </div>
                    </div>
                </div>
            `;

            // Визуализация дерева
            const tree = treeBuilder.generateTreeVisualization();
            
            html += `
                <div class="ancestral-tree fade-in-up" style="margin-bottom: 30px;">
                    <h3 style="text-align: center; margin-bottom: 30px; font-size: 24px;">
                        🌳 Структура Рода
                    </h3>
            `;
            
            tree.generations.forEach((gen, idx) => {
                html += `
                    <div class="tree-generation" style="animation-delay: ${idx * 0.1}s; margin-bottom: 20px;">
                        <div class="tree-node">
                            <div class="tree-node-level">Поколение ${gen.level}</div>
                            <div class="tree-node-name">${gen.name}</div>
                            <div class="tree-node-count">${gen.count} ${this.pluralize(gen.count, 'человек', 'человека', 'человек')}</div>
                        </div>
                        
                        <!-- Список членов в этом поколении -->
                        <div style="margin-top: 16px; display: grid; gap: 12px;">
                `;
                
                gen.members.forEach(member => {
                    const programsCount = member.programs?.length || 0;
                    const statusIcon = member.isAlive ? '✅' : '🕊️';
                    const genderIcon = member.gender === 'male' ? '👨' : '👩';
                    
                    html += `
                        <div style="padding: 12px 16px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                    <span>${genderIcon}</span>
                                    <strong>${member.name}</strong>
                                    ${member.isUser ? '<span style="background: var(--accent-primary); padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">ВЫ</span>' : ''}
                                    <span>${statusIcon}</span>
                                </div>
                                ${member.birthDate ? `<div style="font-size: 13px; color: var(--text-muted);">📅 ${member.birthDate}</div>` : ''}
                                ${programsCount > 0 ? `<div style="font-size: 13px; color: var(--warning); margin-top: 4px;">⚠️ ${programsCount} программ обнаружено</div>` : ''}
                                ${member.notes ? `<div style="font-size: 12px; color: var(--text-muted); margin-top: 6px; font-style: italic;">${member.notes}</div>` : ''}
                            </div>
                            ${!member.isUser ? `
                                <div style="display: flex; gap: 8px;">
                                    <button onclick="premiumManager.viewMemberDetails('${member.id}')" class="btn-icon" title="Подробнее">
                                        👁️
                                    </button>
                                    <button onclick="premiumManager.removeMemberConfirm('${member.id}')" class="btn-icon" title="Удалить" style="background: var(--danger);">
                                        🗑️
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;

            // Рекомендации
            const recommendations = treeBuilder.getTreeRecommendations();
            if (recommendations.length > 0) {
                html += `
                    <h3 style="margin: 30px 0 20px 0;">💡 Рекомендации по работе с Родом</h3>
                    <div class="recommendations-widget">
                `;
                
                recommendations.forEach(rec => {
                    html += `
                        <div class="recommendation-item">
                            <div class="recommendation-icon">${rec.icon}</div>
                            <div class="recommendation-content">
                                <h4 style="margin: 0 0 8px 0; color: var(--text-primary);">${rec.title}</h4>
                                <p class="recommendation-text">${rec.description}</p>
                                <div style="margin-top: 8px; padding: 8px 12px; background: rgba(16, 185, 129, 0.1); border-radius: 8px; font-size: 13px; color: var(--success);">
                                    <strong>Действие:</strong> ${rec.action}
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                html += `</div>`;
            }

            // Повторяющиеся программы
            if (stats.repeatingPrograms.length > 0) {
                html += `
                    <h3 style="margin: 30px 0 20px 0;">🔁 Повторяющиеся родовые программы</h3>
                `;
                
                stats.repeatingPrograms.forEach((prog, idx) => {
                    html += `
                        <div class="program-card severity-high" style="animation: fadeInUp 0.5s ease ${idx * 0.1}s backwards;">
                            <span class="program-type">Родовой паттерн</span>
                            <h4 class="program-title">${prog.title}</h4>
                            <p class="program-description">Эта программа повторяется у <strong>${prog.count}</strong> членов Рода. Высокая вероятность передачи через поколения.</p>
                            <div style="padding: 12px; background: rgba(245, 158, 11, 0.1); border-radius: 8px; font-size: 14px; margin-top: 12px;">
                                <strong style="color: var(--warning);">⚠️ Важно:</strong> Работа с этой программой поможет исцелить весь Род
                            </div>
                        </div>
                    `;
                });
            }
            
        } else {
            // Пустое состояние
            html += `
                <div style="text-align: center; padding: 60px 20px; background: rgba(99, 102, 241, 0.05); border-radius: 16px; border: 1px dashed rgba(99, 102, 241, 0.3);">
                    <div style="font-size: 64px; margin-bottom: 20px;">👥</div>
                    <h3 style="margin-bottom: 12px;">Дерево пустое</h3>
                    <p style="color: var(--text-muted); margin-bottom: 24px;">Начните добавлять родственников, чтобы построить карту Рода</p>
                    <button onclick="premiumManager.showAddMemberForm()" class="btn-primary">
                        ➕ Добавить первого родственника
                    </button>
                </div>
            `;
        }

        container.innerHTML = html;
    }
                `;
            });
            
            html += `</div>`;
        }

        container.innerHTML = html;
    }

    // ========================================
    // ПРОГНОЗЫ
    // ========================================

    renderForecast() {
        const yearContainer = document.getElementById('personalYear');
        const monthContainer = document.getElementById('personalMonth');
        const daysContainer = document.getElementById('favorableDays');

        if (!this.currentMatrix || !this.forecastSystem) {
            const emptyMessage = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔮</div>
                    <p>Сначала рассчитайте матрицу</p>
                </div>
            `;
            if (yearContainer) yearContainer.innerHTML = emptyMessage;
            if (monthContainer) monthContainer.innerHTML = emptyMessage;
            if (daysContainer) daysContainer.innerHTML = emptyMessage;
            return;
        }

        const forecast = this.forecastSystem.getFullForecast();

        // Персональный год
        if (yearContainer && forecast.personalYear) {
            const year = forecast.personalYear;
            yearContainer.innerHTML = `
                <div class="forecast-year-card">
                    <div class="forecast-year-number">${year.number}</div>
                    <div class="forecast-year-theme">${year.interpretation.theme}</div>
                    <div class="forecast-year-description">${year.interpretation.description}</div>
                    
                    <div class="forecast-energy-bar">
                        <div class="forecast-energy-fill" 
                             style="width: ${year.energy.level * 10}%; background: ${year.energy.color};">
                        </div>
                    </div>
                    <div style="text-align: center; font-size: 13px; color: var(--text-muted); margin-bottom: 20px;">
                        Энергия года: ${year.energy.level}/10 (${year.energy.type})
                    </div>
                    
                    <div class="forecast-keywords">
                        ${year.interpretation.keywords.map(kw => `
                            <span class="keyword-tag">${kw}</span>
                        `).join('')}
                    </div>
                    
                    <div style="margin-top: 30px; padding: 20px; background: rgba(0, 0, 0, 0.2); border-radius: 12px;">
                        <h4 style="margin: 0 0 12px 0;">✨ Рекомендации на год:</h4>
                        <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary);">
                            ${year.recommendations.map(rec => `<li style="margin-bottom: 8px;">${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }

        // Персональный месяц
        if (monthContainer && forecast.personalMonth) {
            const month = forecast.personalMonth;
            monthContainer.innerHTML = `
                <div style="padding: 24px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 32px;">${month.monthName} ${month.year}</h3>
                    <div style="font-size: 64px; font-weight: 700; text-align: center; margin: 20px 0;">
                        ${month.number}
                    </div>
                    <h4 style="text-align: center; color: var(--accent-primary); margin-bottom: 16px;">
                        ${month.interpretation.theme}
                    </h4>
                    <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
                        ${month.interpretation.description}
                    </p>
                    <div style="padding: 16px; background: rgba(99, 102, 241, 0.1); border-radius: 12px;">
                        <strong>🧘 Практика месяца:</strong><br>
                        <span style="color: var(--text-secondary);">${month.dailyPractice}</span>
                    </div>
                </div>
            `;
        }

        // Благоприятные дни
        if (daysContainer && forecast.favorableDays) {
            let html = '<div class="favorable-days-grid">';
            
            forecast.favorableDays.forEach(day => {
                const classes = [];
                if (day.isToday) classes.push('is-today');
                if (day.isTomorrow) classes.push('is-tomorrow');
                
                html += `
                    <div class="day-card ${classes.join(' ')}">
                        <div class="day-date">${day.day}</div>
                        <div class="day-name">${day.dayOfWeek}</div>
                        <div class="day-activity">
                            ${day.isToday ? '🌟 Сегодня: ' : day.isTomorrow ? '✨ Завтра: ' : ''}
                            ${day.activity}
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            daysContainer.innerHTML = html;
        }
    }

    // ========================================
    // ПЛАНЫ
    // ========================================

    renderPlans() {
        this.renderPlan('mental', 'mentalPlan');
        this.renderPlan('physical', 'physicalPlan');
        this.renderPlan('emotional', 'emotionalPlan');
    }

    renderPlan(planType, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const plan = this.plansSystem.getPlanByType(planType);
        const stats = this.plansSystem.getPlanStats(planType);
        
        let html = '';

        // Статистика
        html += `
            <div class="plan-stats-card">
                <div class="plan-stats-grid">
                    <div class="plan-stat-item">
                        <div class="plan-stat-value">${stats.completionPercentage}%</div>
                        <div class="plan-stat-label">Прогресс</div>
                    </div>
                    <div class="plan-stat-item">
                        <div class="plan-stat-value">${stats.completed}</div>
                        <div class="plan-stat-label">Завершено</div>
                    </div>
                    <div class="plan-stat-item">
                        <div class="plan-stat-value">${stats.inProgress}</div>
                        <div class="plan-stat-label">В работе</div>
                    </div>
                    <div class="plan-stat-item">
                        <div class="plan-stat-value" style="color: var(--warning);">${stats.highPriority}</div>
                        <div class="plan-stat-label">Приоритетных</div>
                    </div>
                </div>
            </div>
        `;

        // Элементы плана
        plan.forEach((item, idx) => {
            html += this.createPlanItem(item, planType, idx);
        });

        container.innerHTML = html;
    }

    createPlanItem(item, planType, index) {
        const progress = item.progress || {};
        const completed = progress.completed || false;
        const level = progress.level || 0;

        return `
            <div class="plan-item-premium priority-${item.priority} ${completed ? 'completed' : ''}" 
                 style="animation: fadeInUp 0.5s ease ${index * 0.05}s backwards;">
                <div class="plan-item-header">
                    <div class="plan-checkbox ${completed ? 'checked' : ''}"
                         onclick="premiumManager.togglePlanItem('${planType}', '${item.id}')">
                    </div>
                    <div class="plan-item-content">
                        <div class="plan-item-title">${item.name || item.content.substring(0, 50)}</div>
                        <div class="plan-item-description">${this.truncate(item.content, 200)}</div>
                        
                        ${!completed ? `
                            <div class="plan-progress-bar">
                                <div class="plan-progress-fill" style="width: ${level}%;"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                                <input type="range" min="0" max="100" value="${level}" 
                                       style="flex: 1; margin-right: 12px;"
                                       onchange="premiumManager.updatePlanLevel('${planType}', '${item.id}', this.value)">
                                <span style="font-size: 13px; color: var(--text-muted);">${level}%</span>
                            </div>
                        ` : ''}
                        
                        ${item.recommendations && item.recommendations.length > 0 ? `
                            <div style="margin-top: 12px;">
                                ${item.recommendations.map(rec => `
                                    <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 4px;">
                                        ${rec.icon} ${rec.text}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    togglePlanItem(planType, itemId) {
        const plan = this.plansSystem.getPlanByType(planType);
        const item = plan.find(p => p.id === itemId);
        if (!item) return;

        const newState = !item.progress?.completed;
        this.plansSystem.markCompleted(planType, itemId, newState);
        this.renderPlan(planType, this.getPlanContainerId(planType));
    }

    updatePlanLevel(planType, itemId, level) {
        this.plansSystem.setLevel(planType, itemId, parseInt(level));
        this.renderPlan(planType, this.getPlanContainerId(planType));
    }

    getPlanContainerId(planType) {
        const map = {
            'mental': 'mentalPlan',
            'physical': 'physicalPlan',
            'emotional': 'emotionalPlan'
        };
        return map[planType];
    }

    // ========================================
    // УТИЛИТЫ
    // ========================================

    formatDuration(duration) {
        const map = {
            'under 30min': 'До 30 мин',
            '1 day': '1 день',
            '3 days': '3 дня',
            '7 days': '7 дней',
            '10 days': '10 дней',
            '14 days': '14 дней',
            '21 days': '21 день',
            '40 days': '40 дней',
            'unknown': 'Не указано'
        };
        return map[duration] || duration;
    }

    formatDifficulty(difficulty) {
        const map = {
            'easy': 'Легко',
            'medium': 'Средне',
            'hard': 'Сложно'
        };
        return map[difficulty] || difficulty;
    }

    getPriorityIcon(priority) {
        const map = {
            'high': '🔥',
            'medium': '⭐',
            'low': '💡'
        };
        return map[priority] || '💡';
    }

    getPriorityLabel(priority) {
        const map = {
            'high': 'Высокий',
            'medium': 'Средний',
            'low': 'Низкий'
        };
        return map[priority] || 'Средний';
    }

    getSeverityLabel(severity) {
        const map = {
            'high': 'Высокий',
            'medium': 'Средний',
            'low': 'Низкий'
        };
        return map[severity] || severity;
    }

    getProgramTypeLabel(type) {
        const map = {
            'power': 'Властолюбие',
            'money': 'Деньги',
            'exclusion': 'Исключенные',
            'violence': 'Насилие',
            'uncertainty': 'Неуверенность',
            'destiny_refusal': 'Отказ от предназначения',
            'money_loss': 'Потеря денег',
            'family_refusal': 'Отказ от Рода',
            'karmic_debt': 'Кармический долг'
        };
        return map[type] || type;
    }

    truncate(text, length) {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    pluralize(num, one, two, five) {
        let n = Math.abs(num);
        n %= 100;
        if (n >= 5 && n <= 20) return five;
        n %= 10;
        if (n === 1) return one;
        if (n >= 2 && n <= 4) return two;
        return five;
    }

    // ========================================
    // УПРАВЛЕНИЕ РОДОВЫМ ДЕРЕВОМ
    // ========================================

    showAddMemberForm() {
        const form = document.getElementById('addMemberForm');
        if (form) {
            form.style.display = 'block';
            form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    cancelAddMember() {
        const form = document.getElementById('addMemberForm');
        if (form) {
            form.style.display = 'none';
            // Очистить поля
            document.getElementById('memberName').value = '';
            document.getElementById('memberBirthDate').value = '';
            document.getElementById('memberGender').value = 'male';
            document.getElementById('memberRelation').value = 'parent';
            document.getElementById('memberAlive').checked = true;
            document.getElementById('memberNotes').value = '';
        }
    }

    addMemberSubmit() {
        const name = document.getElementById('memberName').value.trim();
        const birthDate = document.getElementById('memberBirthDate').value.trim();
        const gender = document.getElementById('memberGender').value;
        const relation = document.getElementById('memberRelation').value;
        const isAlive = document.getElementById('memberAlive').checked;
        const notes = document.getElementById('memberNotes').value.trim();

        if (!name) {
            alert('Пожалуйста, введите имя');
            return;
        }

        // Валидация даты, если указана
        if (birthDate && !this.validateDate(birthDate)) {
            alert('Неверный формат даты. Используйте ДД.ММ.ГГГГ');
            return;
        }

        const treeBuilder = this.ancestralSystem.getTreeBuilder();
        
        // Если это первый член - установить как пользователя
        if (treeBuilder.familyMembers.length === 0 && this.currentMatrix) {
            treeBuilder.setCurrentUser({
                name: 'Я',
                birthDate: this.currentMatrix.birthDate,
                gender: gender
            });
        }

        // Добавить члена семьи
        treeBuilder.addFamilyMember({
            name: name,
            birthDate: birthDate || null,
            gender: gender,
            relationToUser: relation,
            isAlive: isAlive,
            notes: notes
        });

        // Автосохранение
        treeBuilder.saveToLocalStorage();

        // Обновить интерфейс
        this.cancelAddMember();
        this.renderAncestral();

        // Показать уведомление
        this.showNotification('✅ Член семьи добавлен');
    }

    validateDate(dateStr) {
        const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
        const match = dateStr.match(regex);
        if (!match) return false;

        const day = parseInt(match[1]);
        const month = parseInt(match[2]);
        const year = parseInt(match[3]);

        if (day < 1 || day > 31) return false;
        if (month < 1 || month > 12) return false;
        if (year < 1900 || year > 2100) return false;

        return true;
    }

    removeMemberConfirm(memberId) {
        if (confirm('Вы уверены, что хотите удалить этого члена семьи?')) {
            const treeBuilder = this.ancestralSystem.getTreeBuilder();
            treeBuilder.removeFamilyMember(memberId);
            treeBuilder.saveToLocalStorage();
            this.renderAncestral();
            this.showNotification('🗑️ Член семьи удален');
        }
    }

    viewMemberDetails(memberId) {
        const treeBuilder = this.ancestralSystem.getTreeBuilder();
        const member = treeBuilder.familyMembers.find(m => m.id === memberId);
        
        if (!member) return;

        let details = `
            <strong>Имя:</strong> ${member.name}<br>
            <strong>Пол:</strong> ${member.gender === 'male' ? 'Мужской' : 'Женский'}<br>
            <strong>Отношение:</strong> ${treeBuilder.relationshipTypes[member.relationToUser]}<br>
            <strong>Статус:</strong> ${member.isAlive ? 'Жив/а' : 'Умер/ла'}<br>
        `;

        if (member.birthDate) {
            details += `<strong>Дата рождения:</strong> ${member.birthDate}<br>`;
        }

        if (member.notes) {
            details += `<strong>Заметки:</strong> ${member.notes}<br>`;
        }

        if (member.programs && member.programs.length > 0) {
            details += `<br><strong>Обнаружено программ:</strong> ${member.programs.length}<br>`;
            member.programs.forEach(prog => {
                details += `• ${prog.title}<br>`;
            });
        }

        alert(details);
    }

    saveTree() {
        const treeBuilder = this.ancestralSystem.getTreeBuilder();
        treeBuilder.saveToLocalStorage();
        this.showNotification('💾 Дерево сохранено');
    }

    exportTreeData() {
        const treeBuilder = this.ancestralSystem.getTreeBuilder();
        const data = treeBuilder.exportTree();
        
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `family_tree_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('📥 Дерево экспортировано');
    }

    clearTreeConfirm() {
        if (confirm('Вы уверены, что хотите полностью очистить дерево? Это действие нельзя отменить.')) {
            const treeBuilder = this.ancestralSystem.getTreeBuilder();
            treeBuilder.clearTree();
            this.renderAncestral();
            this.showNotification('🗑️ Дерево очищено');
        }
    }

    showNotification(message) {
        // Простое уведомление
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-primary);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 600;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Создаем глобальный экземпляр
window.premiumManager = new PremiumManager();

// Инициализация после загрузки базы знаний
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.EMBEDDED_KNOWLEDGE || window.knowledgeBase) {
            const kb = window.EMBEDDED_KNOWLEDGE || window.knowledgeBase;
            premiumManager.initialize(kb);
        }
    }, 1500);
});
