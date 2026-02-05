from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from matrix_calculator import MatrixCalculator
from horoscope_service import HoroscopeService
from interpretations import Interpretations

app = FastAPI()
calc = MatrixCalculator()
horo = HoroscopeService()
interp = Interpretations()

# Разрешаем сайту обращаться к API
app.add_middleware(CORSMiddleware, allow_origins=["*"])

@app.get("/calculate")
async def calculate(date: str, gender: str):
    # Используем твою логику расчета
    matrix_data = calc.calculate_matrix(date)
    if not matrix_data:
        return {"error": "Invalid date"}
    
    # Генерируем текст интерпретации
    # (Допустим, в Interpretations есть метод format_full_matrix)
    text = interp.format_full_matrix(matrix_data, gender)
    
    return {
        "matrix": matrix_data, # Цифры для таблицы
        "interpretation": text # Готовый текст
    }

@app.get("/horoscope")
async def get_horo(zodiac: str):
    # Используем твой сервис гороскопов
    prediction = await horo.get_daily_horoscope({"zodiac": zodiac})
    return {"text": prediction}
