#!/usr/bin/env python3
"""
Проверка полноты всех датасетов в папке data
"""
import json
import os
from datetime import datetime

def check_dataset(filename, expected_structure=None):
    """Проверяет датасет на полноту и структуру"""
    filepath = f"data/{filename}"
    
    if not os.path.exists(filepath):
        print(f"❌ {filename}: файл не найден")
        return
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        dates = list(data.keys())
        dates.sort()
        
        print(f"✅ {filename}:")
        print(f"   Период: {dates[0]} - {dates[-1]}")
        print(f"   Количество записей: {len(dates)}")
        
        # Проверяем структуру данных
        first_entry = data[dates[0]]
        if expected_structure:
            if isinstance(first_entry, dict):
                keys = list(first_entry.keys())
                print(f"   Структура: {keys}")
                
                # Проверяем все ключи
                missing_keys = set(expected_structure) - set(keys)
                if missing_keys:
                    print(f"   ⚠️  Отсутствующие ключи: {missing_keys}")
                    
                extra_keys = set(keys) - set(expected_structure)
                if extra_keys:
                    print(f"   ℹ️  Дополнительные ключи: {extra_keys}")
            else:
                print(f"   Тип данных: {type(first_entry).__name__}")
        else:
            if isinstance(first_entry, dict):
                print(f"   Структура: {list(first_entry.keys())}")
            else:
                print(f"   Тип данных: {type(first_entry).__name__}")
        
        # Проверяем полноту данных (должно быть с 2000-01 по 2025-05)
        expected_start = "2000-01"
        expected_end = "2025-05"
        
        if dates[0] != expected_start:
            print(f"   ⚠️  Данные начинаются с {dates[0]}, ожидается {expected_start}")
        if dates[-1] != expected_end:
            print(f"   ⚠️  Данные заканчиваются на {dates[-1]}, ожидается {expected_end}")
        
        # Проверяем количество записей (должно быть 305: 25 лет * 12 месяцев + 5 месяцев 2025)
        expected_count = 305
        if len(dates) != expected_count:
            print(f"   ⚠️  Записей {len(dates)}, ожидается {expected_count}")
        
        # Показываем примеры значений
        example_dates = ["2000-01", "2008-12", "2014-12", "2020-04", "2025-05"]
        print(f"   Примеры данных:")
        for date in example_dates:
            if date in data:
                value = data[date]
                if isinstance(value, dict):
                    formatted_values = {}
                    for k, v in value.items():
                        if isinstance(v, (int, float)):
                            formatted_values[k] = f"{v:.2%}"
                        else:
                            formatted_values[k] = str(v)
                    print(f"     {date}: {formatted_values}")
                else:
                    if isinstance(value, (int, float)):
                        print(f"     {date}: {value:.2%}")
                    else:
                        print(f"     {date}: {value}")
        
    except Exception as e:
        print(f"❌ {filename}: ошибка чтения - {e}")
    
    print()

def main():
    print("🔍 Проверка датасетов в папке data\n")
    
    # Проверяем каждый датасет
    datasets = [
        ("inflation_data.json", None),
        ("deposits.json", ["<1", "1-3", ">3"]),
        ("stocks_moex.json", None),
        ("bonds_ofz.json", None),
        ("bonds_corp.json", None)
    ]
    
    for filename, expected_structure in datasets:
        check_dataset(filename, expected_structure)
    
    print("✨ Проверка завершена!")

if __name__ == "__main__":
    main() 