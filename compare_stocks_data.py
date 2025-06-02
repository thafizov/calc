import json
import pandas as pd
from datetime import datetime

def load_all_data_stocks():
    """Загружаем данные по акциям из all_data_final.json"""
    with open('data/all_data_final.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Ищем данные по акциям
    for tool in data['tools']:
        if tool.get('name') == 'Акции':
            return tool['items']
    return None

def load_moex_stocks():
    """Загружаем данные из stocks_moex.json"""
    with open('data/stocks_moex.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def compare_data():
    """Сравниваем данные из двух источников"""
    print("🔍 СРАВНЕНИЕ ДАННЫХ ПО АКЦИЯМ\n")
    
    # Загружаем данные
    all_data_stocks = load_all_data_stocks()
    moex_stocks = load_moex_stocks()
    
    if not all_data_stocks:
        print("❌ Не найдены данные по акциям в all_data_final.json")
        return
    
    print(f"📊 Данные из all_data_final.json: {len(all_data_stocks)} записей")
    print(f"📊 Данные из stocks_moex.json: {len(moex_stocks)} записей\n")
    
    # Анализируем формат данных all_data
    print("=== ФОРМАТ ДАННЫХ all_data_final.json ===")
    print("Структура: [{\"date\": \"DD.MM.YYYY\", \"value\": число}, ...]")
    print("Данные выглядят как накопленные значения индекса")
    print(f"Первая запись: {all_data_stocks[0]}")
    print(f"Вторая запись: {all_data_stocks[1]}")
    print(f"Последняя запись: {all_data_stocks[-1]}")
    print()
    
    # Анализируем формат данных moex
    print("=== ФОРМАТ ДАННЫХ stocks_moex.json ===")
    print("Структура: {\"YYYY-MM\": значение, ...}")
    print("Данные выглядят как месячная доходность (returns)")
    moex_items = list(moex_stocks.items())
    print(f"Первая запись: {moex_items[0]}")
    print(f"Вторая запись: {moex_items[1]}")
    print(f"Последняя запись: {moex_items[-1]}")
    print()
    
    # Преобразуем данные all_data в месячную доходность
    print("=== РАСЧЕТ МЕСЯЧНОЙ ДОХОДНОСТИ ИЗ all_data_final.json ===")
    all_data_returns = {}
    
    for i in range(1, len(all_data_stocks)):
        current = all_data_stocks[i]
        previous = all_data_stocks[i-1]
        
        # Парсим дату и формируем ключ в формате YYYY-MM
        date = datetime.strptime(current['date'], '%d.%m.%Y')
        key = f"{date.year:04d}-{date.month:02d}"
        
        # Вычисляем доходность
        return_value = (current['value'] - previous['value']) / previous['value']
        all_data_returns[key] = return_value
    
    print(f"Вычислено {len(all_data_returns)} значений доходности\n")
    
    # Сравниваем значения
    print("=== СРАВНЕНИЕ ЗНАЧЕНИЙ ===")
    
    common_periods = set(all_data_returns.keys()) & set(moex_stocks.keys())
    print(f"Общих периодов: {len(common_periods)}")
    
    if len(common_periods) > 0:
        # Берем несколько периодов для сравнения
        sample_periods = sorted(list(common_periods))[:10]  # Первые 10
        
        print("\nСравнение первых 10 общих периодов:")
        print("Период       | all_data    | moex        | Разница")
        print("-" * 55)
        
        total_diff = 0
        for period in sample_periods:
            val1 = all_data_returns[period]
            val2 = moex_stocks[period]
            diff = abs(val1 - val2)
            total_diff += diff
            
            print(f"{period}    | {val1:+.6f}  | {val2:+.6f}  | {diff:.6f}")
        
        avg_diff = total_diff / len(sample_periods)
        print(f"\nСредняя абсолютная разница: {avg_diff:.6f}")
        
        # Проверяем последние периоды
        print("\nСравнение последних 5 общих периодов:")
        print("Период       | all_data    | moex        | Разница")
        print("-" * 55)
        
        last_periods = sorted(list(common_periods))[-5:]
        for period in last_periods:
            val1 = all_data_returns[period]
            val2 = moex_stocks[period]
            diff = abs(val1 - val2)
            
            print(f"{period}    | {val1:+.6f}  | {val2:+.6f}  | {diff:.6f}")
    
    # Проверяем покрытие периодов
    print(f"\n=== ПОКРЫТИЕ ПЕРИОДОВ ===")
    
    all_data_periods = set(all_data_returns.keys())
    moex_periods = set(moex_stocks.keys())
    
    only_in_all_data = all_data_periods - moex_periods
    only_in_moex = moex_periods - all_data_periods
    
    print(f"Только в all_data: {len(only_in_all_data)} периодов")
    if len(only_in_all_data) > 0:
        print(f"Примеры: {sorted(list(only_in_all_data))[:5]}")
    
    print(f"Только в moex: {len(only_in_moex)} периодов")
    if len(only_in_moex) > 0:
        print(f"Примеры: {sorted(list(only_in_moex))[:5]}")
    
    # Период данных
    print(f"\n=== ВРЕМЕННЫЕ РАМКИ ===")
    all_data_first = min(all_data_periods) if all_data_periods else "N/A"
    all_data_last = max(all_data_periods) if all_data_periods else "N/A"
    moex_first = min(moex_periods) if moex_periods else "N/A"
    moex_last = max(moex_periods) if moex_periods else "N/A"
    
    print(f"all_data_final.json: {all_data_first} - {all_data_last}")
    print(f"stocks_moex.json:    {moex_first} - {moex_last}")

if __name__ == "__main__":
    compare_data() 