from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import create_db, SessionLocal, LessonDB

# === МАЯЧОК: Если ты увидишь эту надпись в терминале, значит всё ок ===
print("\n🔥 ЗАПУСКАЮСЬ С РАБОЧЕГО СТОЛА! ВЕРСИЯ С УРОКАМИ! 🔥\n")

app = FastAPI()

# Разрешаем все подключения
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# --- СТРУКТУРА КУРСА ---
def seed_data():
    db = SessionLocal()
    # Если база пустая — наполняем
    if db.query(LessonDB).count() == 0:
        print("📢 Наполняем базу уроками...")
        lessons = [
            # Введение
            LessonDB(unit_id=1, title="Первая команда", description="print('Привет') выводит текст.", question="Как вывести текст?", options=["print('Hi')", "print(Hi)", "out(Hi)"], correct_answer="print('Hi')", explanation="Текст должен быть в кавычках."),
            LessonDB(unit_id=1, title="Скобки", description="Всегда закрывай скобки!", question="Где ошибка?", options=["print('Da')", "print('Da'", "print(1)"], correct_answer="print('Da'", explanation="Нет закрывающей скобки."),
            # Переменные
            LessonDB(unit_id=2, title="Переменная", description="x = 5. Это коробка с данными.", question="Создай переменную:", options=["x = 5", "5 = x", "var x"], correct_answer="x = 5", explanation="Слева имя, справа значение."),
            LessonDB(unit_id=2, title="Snake Case", description="Пиши так: my_variable", question="Правильно:", options=["my_var", "MyVar", "my-var"], correct_answer="my_var", explanation="Маленькие буквы и подчеркивание."),
            # Типы
            LessonDB(unit_id=3, title="Типы", description="Строки в кавычках, числа нет.", question="Тип '10'?", options=["Строка", "Число", "Бул"], correct_answer="Строка", explanation="Кавычки = Строка.")
        ]
        for l in lessons: db.add(l)
        db.commit()
    db.close()

# Создаем базу
create_db()
seed_data()

# --- API ---
@app.get("/")
def read_root():
    return {"message": "Backend OK"}

@app.get("/api/units")
def get_units():
    return [
        {"id": 1, "title": "Введение", "description": "Основы", "total_lessons": 2},
        {"id": 2, "title": "Переменные", "description": "Коробки", "total_lessons": 2},
        {"id": 3, "title": "Типы данных", "description": "Виды данных", "total_lessons": 1},
    ]

@app.get("/api/lessons/{unit_id}")
def get_lessons_by_unit(unit_id: int, db: Session = Depends(get_db)):
    return db.query(LessonDB).filter(LessonDB.unit_id == unit_id).all()