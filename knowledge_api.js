/**
 * ПОЛНАЯ БАЗА ЗНАНИЙ - 807+ единиц
 * Все знания из JSON базы структурированы и готовы к использованию
 */

// Загружаем и парсим JSON базу
let FULL_KNOWLEDGE_BASE = null;

async function loadKnowledgeBase() {
    try {
        const response = await fetch('knowledge_structured_full.json');
        FULL_KNOWLEDGE_BASE = await response.json();
        console.log('✅ База знаний загружена:', FULL_KNOWLEDGE_BASE.metadata);
    } catch (error) {
        console.error('❌ Ошибка загрузки базы:', error);
        // Fallback на встроенные данные
        FULL_KNOWLEDGE_BASE = FALLBACK_KNOWLEDGE;
    }
}

// Вспомогательные функции для работы с базой
const KnowledgeAPI = {
    
    // Получить все записи по категории
    getByCategory(category) {
        if (!FULL_KNOWLEDGE_BASE) return [];
        return FULL_KNOWLEDGE_BASE.knowledge.filter(
            item => item.category === category
        );
    },
    
    // Получить все записи по типу
    getByType(type) {
        if (!FULL_KNOWLEDGE_BASE) return [];
        return FULL_KNOWLEDGE_BASE.knowledge.filter(
            item => item.type === type
        );
    },
    
    // Поиск по ключевым словам
    search(query) {
        if (!FULL_KNOWLEDGE_BASE) return [];
        query = query.toLowerCase();
        return FULL_KNOWLEDGE_BASE.knowledge.filter(item => {
            const searchText = [
                item.name,
                item.content,
                item.category,
                item.type
            ].join(' ').toLowerCase();
            return searchText.includes(query);
        });
    },
    
    // Получить перекрестные ссылки
    getCrossReferences(item) {
        const refs = [];
        const category = item.category;
        const relatedItems = this.getByCategory(category);
        
        relatedItems.forEach(related => {
            if (related !== item && related.content) {
                // Ищем упоминания
                const content = item.content.toLowerCase();
                const name = related.name ? related.name.toLowerCase() : '';
                
                if (content.includes(name) || name.includes(content.split(' ')[0])) {
                    refs.push(related);
                }
            }
        });
        
        return refs;
    },
    
    // Получить все формулы
    getAllFormulas() {
        return this.getByType('formula');
    },
    
    // Получить все методы
    getAllMethods() {
        return this.getByType('method');
    },
    
    // Получить все интерпретации
    getAllInterpretations() {
        return this.getByType('interpretation');
    },
    
    // Получить все последовательности/практики
    getAllSequences() {
        return this.getByType('sequence');
    },
    
    // Получить все константы
    getAllConstants() {
        return this.getByType('constant');
    },
    
    // Категории
    CATEGORIES: {
        BUSINESS: 'business',
        BUSINESS_SALE: 'business_sale',
        BUSINESS_SUCCESS: 'business_success',
        MEDITATION: 'meditation',
        PRAYER: 'prayer',
        RITUAL: 'ritual',
        CAR_NUMBER: 'car_number',
        APARTMENT_NUMBER: 'apartment_number',
        BIRTH_NUMBER: 'birth_number',
        MENTAL_PLAN: 'mental_plan',
        PHYSICAL_PLAN: 'physical_plan',
        EMOTIONAL_PLAN: 'emotional_plan',
        RELATIONSHIP: 'relationship_analysis',
        COMPATIBILITY: 'compatibility',
        CHAKRA: 'chakra',
        ANCESTRAL: 'ancestral_programs'
    }
};

// Fallback данные (на случай если JSON не загрузится)
const FALLBACK_KNOWLEDGE = {
    metadata: {
        totalKnowledge: 807,
        totalDocuments: 98
    },
    knowledge: []
};

// Индексация для быстрого поиска
class KnowledgeIndex {
    constructor() {
        this.index = new Map();
        this.categoryIndex = new Map();
        this.typeIndex = new Map();
    }
    
    build(knowledge) {
        knowledge.forEach((item, idx) => {
            // Индекс по ID
            if (item.id) {
                this.index.set(item.id, item);
            }
            
            // Индекс по категориям
            if (item.category) {
                if (!this.categoryIndex.has(item.category)) {
                    this.categoryIndex.set(item.category, []);
                }
                this.categoryIndex.get(item.category).push(item);
            }
            
            // Индекс по типам
            if (item.type) {
                if (!this.typeIndex.has(item.type)) {
                    this.typeIndex.set(item.type, []);
                }
                this.typeIndex.get(item.type).push(item);
            }
        });
    }
    
    findById(id) {
        return this.index.get(id);
    }
    
    findByCategory(category) {
        return this.categoryIndex.get(category) || [];
    }
    
    findByType(type) {
        return this.typeIndex.get(type) || [];
    }
}

// Создаем глобальный индекс
const knowledgeIndex = new KnowledgeIndex();

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    await loadKnowledgeBase();
    if (FULL_KNOWLEDGE_BASE && FULL_KNOWLEDGE_BASE.knowledge) {
        knowledgeIndex.build(FULL_KNOWLEDGE_BASE.knowledge);
        console.log('📚 Индекс построен. Доступно записей:', FULL_KNOWLEDGE_BASE.knowledge.length);
    }
});

// Экспорт для глобального использования
window.KnowledgeAPI = KnowledgeAPI;
window.knowledgeIndex = knowledgeIndex;
