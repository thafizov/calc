import json
import pandas as pd
from datetime import datetime, timedelta
from collections import defaultdict

def load_data():
    """Загружаем данные из файла"""
    with open('data/all_data.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def analyze_data_gaps(data):
    """Анализируем пропуски в данных"""
    print("=== АНАЛИЗ ПРОПУСКОВ В ДАННЫХ ===\n")
    
    results = {}
    
    def process_items(items, path=""):
        if 'items' in items:
            # Если есть данные в виде временных рядов
            dates = []
            for item in items['items']:
                if 'date' in item:
                    dates.append(datetime.strptime(item['date'], '%d.%m.%Y'))
            
            if dates:
                dates.sort()
                instrument_name = f"{path} -> {items['name']}"
                
                # Находим пропуски
                gaps = []
                for i in range(1, len(dates)):
                    gap_days = (dates[i] - dates[i-1]).days
                    if gap_days > 32:  # Более месяца
                        gaps.append({
                            'from': dates[i-1].strftime('%d.%m.%Y'),
                            'to': dates[i].strftime('%d.%m.%Y'),
                            'days': gap_days
                        })
                
                results[instrument_name] = {
                    'first_date': dates[0].strftime('%d.%m.%Y'),
                    'last_date': dates[-1].strftime('%d.%m.%Y'),
                    'total_points': len(dates),
                    'gaps': gaps
                }
                
                print(f"📊 {instrument_name}")
                print(f"   Период: {dates[0].strftime('%d.%m.%Y')} - {dates[-1].strftime('%d.%m.%Y')}")
                print(f"   Точек данных: {len(dates)}")
                if gaps:
                    print(f"   ❌ Пропуски (> месяца): {len(gaps)}")
                    for gap in gaps:
                        print(f"      {gap['from']} -> {gap['to']} ({gap['days']} дней)")
                else:
                    print(f"   ✅ Пропусков нет")
                print()
        
        # Рекурсивно обрабатываем вложенные элементы
        if 'items' in items and isinstance(items['items'], list):
            for item in items['items']:
                if isinstance(item, dict) and 'items' in item:
                    new_path = f"{path} -> {items['name']}" if path else items['name']
                    process_items(item, new_path)
    
    # Обрабатываем все инструменты
    for tool in data['tools']:
        process_items(tool)
    
    return results

def find_dollar_deposits(data):
    """Находим долларовые депозиты для удаления"""
    print("=== ДОЛЛАРОВЫЕ ДЕПОЗИТЫ ДЛЯ УДАЛЕНИЯ ===\n")
    
    dollar_items = []
    
    def find_dollar_items(items, path=""):
        if 'code' in items and 'dollar' in items['code'].lower():
            full_path = f"{path} -> {items['name']}" if path else items['name']
            dollar_items.append({
                'path': full_path,
                'code': items['code'],
                'name': items['name']
            })
            print(f"💵 {full_path}")
            print(f"   Код: {items['code']}")
            if 'items' in items and isinstance(items['items'], list) and len(items['items']) > 0:
                if 'date' in items['items'][0]:
                    print(f"   Точек данных: {len(items['items'])}")
            print()
        
        # Рекурсивно ищем во вложенных элементах
        if 'items' in items and isinstance(items['items'], list):
            for item in items['items']:
                if isinstance(item, dict):
                    new_path = f"{path} -> {items['name']}" if path else items['name']
                    find_dollar_items(item, new_path)
    
    # Ищем во всех инструментах
    for tool in data['tools']:
        find_dollar_items(tool)
    
    return dollar_items

def analyze_time_coverage(data):
    """Анализируем временное покрытие по всем инструментам"""
    print("=== ОБЩЕЕ ВРЕМЕННОЕ ПОКРЫТИЕ ===\n")
    
    all_dates = set()
    instruments = {}
    
    def collect_dates(items, path=""):
        if 'items' in items and isinstance(items['items'], list):
            dates = []
            for item in items['items']:
                if 'date' in item:
                    date_obj = datetime.strptime(item['date'], '%d.%m.%Y')
                    dates.append(date_obj)
                    all_dates.add(date_obj)
            
            if dates:
                instrument_name = f"{path} -> {items['name']}" if path else items['name']
                instruments[instrument_name] = {
                    'dates': set(dates),
                    'first': min(dates),
                    'last': max(dates)
                }
        
        # Рекурсивно обрабатываем
        if 'items' in items and isinstance(items['items'], list):
            for item in items['items']:
                if isinstance(item, dict) and ('items' in item or 'date' in item):
                    new_path = f"{path} -> {items['name']}" if path else items['name']
                    collect_dates(item, new_path)
    
    # Собираем все даты
    for tool in data['tools']:
        collect_dates(tool)
    
    if all_dates:
        min_date = min(all_dates)
        max_date = max(all_dates)
        print(f"📅 Общий период данных: {min_date.strftime('%d.%m.%Y')} - {max_date.strftime('%d.%m.%Y')}")
        print(f"📊 Общее количество уникальных дат: {len(all_dates)}")
        print()
        
        # Анализируем покрытие каждого инструмента
        print("📈 Покрытие по инструментам:")
        for name, info in instruments.items():
            coverage = len(info['dates']) / len(all_dates) * 100
            print(f"   {name}: {coverage:.1f}% ({len(info['dates'])} из {len(all_dates)} дат)")
        print()
    
    return instruments

def create_clean_data(data):
    """Создаем очищенные данные без долларовых депозитов"""
    print("=== СОЗДАНИЕ ОЧИЩЕННЫХ ДАННЫХ ===\n")
    
    def clean_items(items):
        if 'items' in items and isinstance(items['items'], list):
            # Фильтруем элементы - убираем долларовые
            cleaned_items = []
            for item in items['items']:
                if isinstance(item, dict):
                    # Проверяем код на наличие dollar
                    if 'code' in item and 'dollar' in item['code'].lower():
                        print(f"🗑️  Удаляем: {item['name']} (код: {item['code']})")
                        continue
                    # Рекурсивно очищаем вложенные элементы
                    cleaned_item = clean_items(item)
                    if cleaned_item:
                        cleaned_items.append(cleaned_item)
                else:
                    cleaned_items.append(item)
            
            # Возвращаем очищенный объект
            result = items.copy()
            result['items'] = cleaned_items
            return result
        else:
            return items
    
    # Очищаем данные
    cleaned_data = {'tools': []}
    for tool in data['tools']:
        cleaned_tool = clean_items(tool)
        if cleaned_tool and cleaned_tool.get('items'):  # Только если остались элементы
            cleaned_data['tools'].append(cleaned_tool)
    
    return cleaned_data

def main():
    print("🔍 АНАЛИЗ ДАННЫХ all_data.json\n")
    
    # Загружаем данные
    data = load_data()
    print(f"📁 Загружено инструментов: {len(data['tools'])}\n")
    
    # Анализируем пропуски
    gaps_analysis = analyze_data_gaps(data)
    
    # Находим долларовые депозиты
    dollar_items = find_dollar_deposits(data)
    
    # Анализируем общее покрытие
    coverage_analysis = analyze_time_coverage(data)
    
    # Создаем очищенные данные
    cleaned_data = create_clean_data(data)
    
    # Сохраняем очищенные данные
    with open('data/all_data_cleaned.json', 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, ensure_ascii=False, indent=2)
    
    print(f"💾 Очищенные данные сохранены в data/all_data_cleaned.json")
    print(f"📊 Удалено {len(dollar_items)} долларовых депозитов")
    
    # Сохраняем отчет об анализе
    report = {
        'analysis_date': datetime.now().isoformat(),
        'gaps_analysis': gaps_analysis,
        'dollar_items_removed': dollar_items,
        'coverage_analysis': {name: {
            'first_date': info['first'].strftime('%d.%m.%Y'),
            'last_date': info['last'].strftime('%d.%m.%Y'),
            'total_dates': len(info['dates'])
        } for name, info in coverage_analysis.items()}
    }
    
    with open('data/data_analysis_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"📋 Отчет об анализе сохранен в data/data_analysis_report.json")

if __name__ == "__main__":
    main() 