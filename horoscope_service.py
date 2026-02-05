import asyncio
import logging
import os
from datetime import datetime
from typing import Dict, Optional, List
import re

import aiohttp
from bs4 import BeautifulSoup
from config import Config

log = logging.getLogger(__name__)

class HoroscopeService:
    def __init__(self) -> None:
        self._cache = {}
        self.api_key = Config.GROQ_API_KEY
        self.groq_client = None
        
        # Пытаемся импортировать Groq
        if self.api_key:
            try:
                from groq import AsyncGroq
                self.groq_client = AsyncGroq(api_key=self.api_key)
                log.info("✅ Groq API инициализирован")
            except ImportError:
                log.warning("⚠️ Библиотека groq не установлена. Установите: pip install groq")
            except Exception as e:
                log.error(f"❌ Ошибка инициализации Groq: {e}")
        else:
            log.warning("⚠️ GROQ_API_KEY не установлен. AI-функции будут недоступны.")

    # ---------------------------------------------------
    #  Маппинг знаков зодиака
    # ---------------------------------------------------
    def _get_zodiac_mapping(self) -> Dict[str, str]:
        """Возвращает маппинг русских знаков на английские"""
        return {
            "♈ Овен": "aries", "Овен": "aries",
            "♉ Телец": "taurus", "Телец": "taurus",
            "♊ Близнецы": "gemini", "Близнецы": "gemini",
            "♋ Рак": "cancer", "Рак": "cancer",
            "♌ Лев": "leo", "Лев": "leo",
            "♍ Дева": "virgo", "Дева": "virgo",
            "♎ Весы": "libra", "Весы": "libra",
            "♏ Скорпион": "scorpio", "Скорпион": "scorpio",
            "♐ Стрелец": "sagittarius", "Стрелец": "sagittarius",
            "♑ Козерог": "capricorn", "Козерог": "capricorn",
            "♒ Водолей": "aquarius", "Водолей": "aquarius",
            "♓ Рыбы": "pisces", "Рыбы": "pisces",
        }

    def _clean_zodiac_name(self, zodiac: str) -> str:
        """Очищает название знака от эмодзи"""
        # Убираем эмодзи и пробелы в начале
        cleaned = re.sub(r'^[^\w\s]+\s*', '', zodiac)
        return cleaned.strip()

    # ---------------------------------------------------
    #  Вспомогательный метод для HTTP-запросов
    # ---------------------------------------------------
    async def _fetch(self, url: str, timeout: int = 10) -> Optional[str]:
        """Выполняет HTTP-запрос с таймаутом и обработкой ошибок"""
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        }
        
        try:
            timeout_obj = aiohttp.ClientTimeout(total=timeout)
            async with aiohttp.ClientSession(headers=headers, timeout=timeout_obj) as session:
                async with session.get(url, ssl=False) as resp:
                    if resp.status == 200:
                        html = await resp.text()
                        log.info(f"✅ Успешно получен контент с {url} ({len(html)} символов)")
                        return html
                    else:
                        log.warning(f"⚠️ Статус {resp.status} для {url}")
        except asyncio.TimeoutError:
            log.error(f"⏱️ Таймаут при запросе к {url}")
        except Exception as exc:
            log.error(f"❌ Ошибка при запросе к {url}: {type(exc).__name__}: {exc}")
        return None

    # ---------------------------------------------------
    #  Парсинг Horo.mail.ru
    # ---------------------------------------------------
    async def _parse_mail_ru(self, zodiac_en: str) -> Optional[str]:
        """Парсит гороскоп с Horo.mail.ru"""
        url = f"https://horo.mail.ru/prediction/{zodiac_en}/today/"
        log.info(f"🔍 Парсинг Mail.ru: {url}")
        
        html = await self._fetch(url)
        if not html:
            return None

        try:
            soup = BeautifulSoup(html, "html.parser")
            
            # Ищем контент разными способами
            content = None
            
            # Способ 1: ищем div с классом article__item
            article = soup.find("div", class_="article__item")
            if article:
                paragraphs = article.find_all("p")
                if paragraphs:
                    content = " ".join([p.get_text(strip=True) for p in paragraphs])
            
            # Способ 2: ищем тег article
            if not content:
                article = soup.find("article")
                if article:
                    paragraphs = article.find_all("p")
                    if paragraphs:
                        content = " ".join([p.get_text(strip=True) for p in paragraphs])
            
            # Способ 3: ищем div с data-qa
            if not content:
                article = soup.find("div", {"data-qa": "Article"})
                if article:
                    paragraphs = article.find_all("p")
                    if paragraphs:
                        content = " ".join([p.get_text(strip=True) for p in paragraphs])
            
            if content and len(content) > 50:
                log.info(f"✅ Mail.ru: получено {len(content)} символов")
                return content[:600]  # Ограничиваем длину
            else:
                log.warning("⚠️ Mail.ru: контент не найден или слишком короткий")
                
        except Exception as e:
            log.error(f"❌ Ошибка парсинга Mail.ru: {e}")
        
        return None

    # ---------------------------------------------------
    #  Парсинг Rambler
    # ---------------------------------------------------
    async def _parse_rambler(self, zodiac_en: str) -> Optional[str]:
        """Парсит гороскоп с Rambler"""
        url = f"https://horoscopes.rambler.ru/{zodiac_en}/"
        log.info(f"🔍 Парсинг Rambler: {url}")
        
        html = await self._fetch(url)
        if not html:
            return None

        try:
            soup = BeautifulSoup(html, "html.parser")
            
            # Способ 1: ищем div с data-mt-part
            main_div = soup.find("div", {"data-mt-part": "article"})
            if main_div:
                paragraph = main_div.find("p")
                if paragraph:
                    content = paragraph.get_text(strip=True)
                    if len(content) > 50:
                        log.info(f"✅ Rambler: получено {len(content)} символов")
                        return content[:600]
            
            # Способ 2: ищем article
            article = soup.find("article")
            if article:
                paragraph = article.find("p")
                if paragraph:
                    content = paragraph.get_text(strip=True)
                    if len(content) > 50:
                        log.info(f"✅ Rambler: получено {len(content)} символов")
                        return content[:600]
            
            log.warning("⚠️ Rambler: контент не найден")
                
        except Exception as e:
            log.error(f"❌ Ошибка парсинга Rambler: {e}")
        
        return None

    # ---------------------------------------------------
    #  Парсинг внешних источников (главный метод)
    # ---------------------------------------------------
    async def parse_horoscopes(self, zodiac_sign: str) -> Dict[str, str]:
        """
        Парсит гороскопы из нескольких источников параллельно
        Возвращает словарь {источник: текст}
        """
        # Очищаем знак от эмодзи
        zodiac_clean = self._clean_zodiac_name(zodiac_sign)
        
        zodiac_map = self._get_zodiac_mapping()
        zodiac_en = zodiac_map.get(zodiac_clean, zodiac_map.get(zodiac_sign, "aries"))
        
        log.info(f"🔮 Начинаем парсинг для {zodiac_sign} ({zodiac_en})")
        
        # Запускаем парсинг параллельно
        tasks = [
            self._parse_mail_ru(zodiac_en),
            self._parse_rambler(zodiac_en),
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Собираем результаты
        horoscopes = {}
        
        if results[0] and not isinstance(results[0], Exception):
            horoscopes["Mail.ru"] = results[0]
        
        if results[1] and not isinstance(results[1], Exception):
            horoscopes["Rambler"] = results[1]
        
        log.info(f"✅ Получено гороскопов: {len(horoscopes)} из 2")
        
        return horoscopes

    # ---------------------------------------------------
    #  Генерация базового гороскопа (без AI)
    # ---------------------------------------------------
    def _generate_basic_horoscope(self, zodiac: str, horoscopes: Dict[str, str]) -> str:
        """Генерирует базовый гороскоп без использования AI"""
        today = datetime.now().strftime("%d.%m.%Y")
        
        if not horoscopes:
            return (
                f"🔮 *Гороскоп на {today}*\n\n"
                f"К сожалению, сейчас звезды скрыты за облаками. 😔\n\n"
                f"Попробуйте позже или проверьте подключение к интернету."
            )
        
        # Формируем красивый вывод
        result = []
        result.append(f"🔮 *Гороскоп на {today}*\n")
        
        for i, (source, text) in enumerate(horoscopes.items(), 1):
            result.append(f"📰 *Источник {i}: {source}*")
            result.append(text)
            result.append("")
        
        # Добавляем общий совет
        result.append("✨ *Совет дня:*")
        result.append("Доверяйте своей интуиции и будьте открыты новым возможностям!")
        
        return "\n".join(result)

    # ---------------------------------------------------
    #  AI-Агрегация через Groq
    # ---------------------------------------------------
    async def _generate_ai_aggregated(
        self, 
        user_data: Dict, 
        zodiac: str, 
        horoscopes: Dict[str, str]
    ) -> str:
        """Генерирует персонализированный гороскоп с помощью AI"""
        
        if not self.groq_client:
            log.warning("⚠️ Groq client недоступен, используем базовую генерацию")
            return self._generate_basic_horoscope(zodiac, horoscopes)
        
        if not horoscopes:
            return self._generate_basic_horoscope(zodiac, horoscopes)

        today = datetime.now().strftime("%d.%m.%Y")
        zodiac_clean = self._clean_zodiac_name(zodiac)
        
        # Подготавливаем контекст из источников
        context_parts = []
        for source, text in horoscopes.items():
            context_parts.append(f"• {source}: {text[:400]}")
        context = "\n".join(context_parts)
        
        # Извлекаем данные матрицы
        matrix = user_data.get("matrix", {})
        additional = matrix.get("additional", [])
        first_num = additional[0] if additional else "не указано"
        
        prompt = f"""Ты — профессиональный астролог. Составь ОДИН персонализированный гороскоп на {today} для знака {zodiac_clean}.

ДОСТУПНЫЕ ДАННЫЕ:
{context}

ДОПОЛНИТЕЛЬНО:
• Первое число судьбы: {first_num}

ТВОЯ ЗАДАЧА:
1. Объедини прогнозы из источников в одно связное повествование
2. Убери повторы и противоречия
3. Добавь практические советы на день
4. Используй мистический, но дружелюбный тон
5. Структурируй текст с эмодзи и заголовками

ФОРМАТ ОТВЕТА:
💫 **Общий прогноз:** [2-3 предложения]

❤️ **Личная жизнь:** [1-2 предложения]

💼 **Работа и финансы:** [1-2 предложения]

🎯 **Совет дня:** [1 предложение]

⚠️ **Предостережение:** [1 предложение]

ВАЖНО:
- Длина: 600-800 символов
- Только на русском языке
- Без вводных фраз типа "Вот ваш гороскоп"
- Конкретные советы, а не общие фразы"""

        try:
            model = Config.GROQ_MODEL or "llama-3.1-8b-instant"
            log.info(f"🤖 Генерация AI-гороскопа с моделью {model}")
            
            completion = await self.groq_client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system", 
                        "content": "Ты профессиональный астролог с 20-летним опытом. Твои прогнозы точны, практичны и вдохновляют людей."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1200,
                top_p=0.9,
            )
            
            ai_response = completion.choices[0].message.content.strip()
            log.info(f"✅ AI-гороскоп сгенерирован ({len(ai_response)} символов)")
            
            return ai_response
            
        except Exception as e:
            log.error(f"❌ Ошибка генерации AI: {type(e).__name__}: {e}")
            return self._generate_basic_horoscope(zodiac, horoscopes)

    # ---------------------------------------------------
    #  Главный метод (Оркестратор)
    # ---------------------------------------------------
    async def get_daily_horoscope(self, user_data: Dict) -> str:
        """
        Главный метод для получения дневного гороскопа
        1. Проверяет кеш
        2. Парсит источники
        3. Генерирует финальный прогноз (с AI или без)
        """
        zodiac = user_data.get("zodiac", "Овен")
        today = datetime.now().strftime("%Y-%m-%d")
        cache_key = f"{zodiac}_{today}"

        # Проверка кеша
        if cache_key in self._cache:
            log.info(f"📦 Используем кешированный гороскоп для {zodiac}")
            return self._cache[cache_key]

        log.info(f"🚀 Начинаем генерацию гороскопа для {zodiac}")
        
        # 1. Собираем данные из интернета
        horoscopes = await self.parse_horoscopes(zodiac)
        
        # 2. Генерируем финальный прогноз
        if self.groq_client and horoscopes:
            log.info("🤖 Используем AI для генерации")
            final_forecast = await self._generate_ai_aggregated(user_data, zodiac, horoscopes)
        else:
            log.info("📝 Используем базовую генерацию")
            final_forecast = self._generate_basic_horoscope(zodiac, horoscopes)
        
        # Сохраняем в кеш
        self._cache[cache_key] = final_forecast
        log.info(f"✅ Гороскоп готов и сохранен в кеш")
        
        return final_forecast
