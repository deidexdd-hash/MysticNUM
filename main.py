import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from telegram.ext import Application
from matrix_calculator import MatrixCalculator
from horoscope_service import HoroscopeService

# 1. Инициализация API
api = FastAPI()

# Разрешаем сайту делать запросы (CORS)
api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

calc = MatrixCalculator()

# 2. Эндпоинт для сайта
@api.get("/api/calculate")
async def get_matrix(date: str, gender: str):
    # Используем твой существующий класс
    matrix_data = calc.calculate_matrix(date)
    if not matrix_data:
        return {"error": "Invalid date format"}
    
    # Получаем расшифровку (метод из твоего matrix_calculator)
    interp_text = calc.get_interpretations(matrix_data, gender)
    
    return {
        "numbers": matrix_data, # [first, second, third, fourth]
        "interpretation": interp_text
    }

# 3. Запуск бота параллельно
@api.on_event("startup")
async def startup_event():
    # Твой существующий код инициализации бота
    from config import Config
    bot_app = Application.builder().token(Config.BOT_TOKEN).build()
    # ... (добавление хендлеров как в твоем main.py)
    
    await bot_app.initialize()
    await bot_app.start()
    await bot_app.updater.start_polling()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(api, host="0.0.0.0", port=port)
