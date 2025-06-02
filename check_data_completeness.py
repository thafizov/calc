import json
import os
from datetime import datetime, timedelta

def analyze_data_completeness():
    """Анализирует полноту всех данных в проекте"""
    print("🔍 ПРОВЕРКА ПОЛНОТЫ И АКТУАЛЬНОСТИ ВСЕХ ДАННЫХ")
    print("=" * 60)
    
    # Анализируем главный файл
    print("\n📊 АНАЛИЗ ГЛАВНОГО ФАЙЛА (all_data_final.json):")
    with open('data/all_data_final.json', 'r', encoding='utf-8') as f:
        main_data = json.load(f)
    
    main_analysis = {}
    
    for tool in main_data['tools']:
        tool_name = tool['name']
        
        if tool_name == 'Облигации':
            # Анализируем подразделы облигаций
            for item in tool['items']:
                item_name = f"{tool_name} -> {item['name']}"
                items_data = item['items']
                
                if items_data:
                    first_date = items_data[0]['date']
                    last_date = items_data[-1]['date']
                    count = len(items_data)
                    
                    main_analysis[item_name] = {
                        'count': count,
                        'first_date': first_date,
                        'last_date': last_date,
                        'data_type': 'index'
                    }
        else:
            # Обычные разделы
            items_data = tool.get('items', [])
            
            if items_data and isinstance(items_data[0], dict) and 'date' in items_data[0]:
                first_date = items_data[0]['date']
                last_date = items_data[-1]['date']
                count = len(items_data)
                
                main_analysis[tool_name] = {
                    'count': count,
                    'first_date': first_date,
                    'last_date': last_date,
                    'data_type': 'monthly_data'
                }
    
    # Выводим анализ главного файла
    for name, data in main_analysis.items():
        print(f"  📈 {name}:")
        print(f"    Записей: {data['count']}")
        print(f"    Период: {data['first_date']} → {data['last_date']}")
    
    # Анализируем отдельные файлы
    print(f"\n📊 АНАЛИЗ ОТДЕЛЬНЫХ ФАЙЛОВ:")
    
    separate_files = [
        'bonds_ofz.json',
        'bonds_corp.json', 
        'stocks_moex.json',
        'inflation_data.json',
        'deposits.json'
    ]
    
    separate_analysis = {}
    
    for filename in separate_files:
        filepath = f'data/{filename}'
        if os.path.exists(filepath):
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                if isinstance(data, dict):
                    # Формат {период: значение}
                    periods = sorted(data.keys())
                    if periods:
                        first_period = periods[0] 
                        last_period = periods[-1]
                        count = len(periods)
                        
                        separate_analysis[filename] = {
                            'count': count,
                            'first_period': first_period,
                            'last_period': last_period,
                            'data_type': 'monthly_returns'
                        }
                elif isinstance(data, list):
                    # Формат [{"date": "...", "value": ...}]
                    if data and 'date' in data[0]:
                        first_date = data[0]['date']
                        last_date = data[-1]['date']
                        count = len(data)
                        
                        separate_analysis[filename] = {
                            'count': count,
                            'first_date': first_date,
                            'last_date': last_date,
                            'data_type': 'date_value'
                        }
                        
            except Exception as e:
                print(f"    ❌ Ошибка при чтении {filename}: {e}")
    
    # Выводим анализ отдельных файлов
    for filename, data in separate_analysis.items():
        print(f"  📁 {filename}:")
        print(f"    Записей: {data['count']}")
        if 'first_period' in data:
            print(f"    Период: {data['first_period']} → {data['last_period']}")
        else:
            print(f"    Период: {data['first_date']} → {data['last_date']}")
    
    # Сравнение актуальности
    print(f"\n🎯 АНАЛИЗ АКТУАЛЬНОСТИ ДО МАЯ 2025:")
    
    target_date = "2025-05"
    current_date = datetime.now()
    may_2025 = datetime(2025, 5, 31)
    
    print(f"  🎯 Целевая дата: май 2025")
    print(f"  📅 Текущая дата: {current_date.strftime('%Y-%m-%d')}")
    print(f"  ⏰ До мая 2025: {(may_2025 - current_date).days} дней")
    
    gaps_found = []
    
    # Проверяем главный файл
    print(f"\n  📊 Главный файл:")
    for name, data in main_analysis.items():
        last_date = data['last_date']
        # Преобразуем дату DD.MM.YYYY в YYYY-MM для сравнения
        try:
            day, month, year = last_date.split('.')
            last_period = f"{year}-{month.zfill(2)}"
            
            if last_period < target_date:
                gap = f"до {target_date}"
                print(f"    ❌ {name}: {last_period} (нужно обновить {gap})")
                gaps_found.append(name)
            else:
                print(f"    ✅ {name}: {last_period} (актуально)")
        except:
            print(f"    ⚠️ {name}: Не удалось проанализировать дату {last_date}")
    
    # Проверяем отдельные файлы
    print(f"\n  📁 Отдельные файлы:")
    for filename, data in separate_analysis.items():
        if 'last_period' in data:
            last_period = data['last_period']
            if last_period < target_date:
                gap = f"до {target_date}"
                print(f"    ❌ {filename}: {last_period} (нужно обновить {gap})")
                gaps_found.append(filename)
            else:
                print(f"    ✅ {filename}: {last_period} (актуально)")
        else:
            # Для файлов с датами в формате DD.MM.YYYY
            last_date = data['last_date']
            try:
                day, month, year = last_date.split('.')
                last_period = f"{year}-{month.zfill(2)}"
                
                if last_period < target_date:
                    gap = f"до {target_date}"
                    print(f"    ❌ {filename}: {last_period} (нужно обновить {gap})")
                    gaps_found.append(filename)
                else:
                    print(f"    ✅ {filename}: {last_period} (актуально)")
            except:
                print(f"    ⚠️ {filename}: Не удалось проанализировать дату {last_date}")
    
    return {
        'main_analysis': main_analysis,
        'separate_analysis': separate_analysis,
        'gaps_found': gaps_found,
        'target_date': target_date
    }

def suggest_data_sources():
    """Предлагает источники для обновления данных"""
    print(f"\n" + "="*60)
    print("💡 РЕКОМЕНДАЦИИ ПО ОБНОВЛЕНИЮ ДАННЫХ")
    print("="*60)
    
    # Ищем файлы с актуальными данными
    print(f"\n🔍 Поиск файлов с более актуальными данными:")
    
    all_json_files = []
    for root, dirs, files in os.walk('data'):
        for file in files:
            if file.endswith('.json'):
                filepath = os.path.join(root, file)
                all_json_files.append(filepath)
    
    # Анализируем каждый файл на предмет актуальных данных
    potential_sources = {}
    
    for filepath in all_json_files:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            filename = os.path.basename(filepath)
            
            # Пропускаем служебные файлы
            if any(word in filename.lower() for word in ['backup', 'report', 'temp', 'analysis']):
                continue
            
            latest_period = None
            
            if isinstance(data, dict):
                # Формат {период: значение}
                periods = [k for k in data.keys() if k.startswith('20')]
                if periods:
                    latest_period = max(periods)
            elif isinstance(data, list) and data:
                # Формат [{"date": "...", "value": ...}]
                if 'date' in data[-1]:
                    last_date = data[-1]['date']
                    try:
                        day, month, year = last_date.split('.')
                        latest_period = f"{year}-{month.zfill(2)}"
                    except:
                        pass
            elif isinstance(data, dict) and 'tools' in data:
                # Главный файл - пропускаем
                continue
            
            if latest_period and latest_period >= "2025-01":
                potential_sources[filename] = latest_period
                
        except Exception as e:
            continue
    
    if potential_sources:
        print(f"\n  📁 Файлы с данными за 2025 год:")
        for filename, last_period in sorted(potential_sources.items(), key=lambda x: x[1], reverse=True):
            print(f"    ✨ {filename}: до {last_period}")
    else:
        print(f"\n  ❌ Не найдено файлов с данными за 2025 год")
    
    print(f"\n📋 ПЛАН ДЕЙСТВИЙ:")
    print(f"  1️⃣ Проверить актуальность данных в основных файлах")
    print(f"  2️⃣ Найти источники для недостающих данных")
    print(f"  3️⃣ Обновить главный файл актуальными данными")
    print(f"  4️⃣ Проверить консистентность всех данных")

if __name__ == "__main__":
    analysis = analyze_data_completeness()
    suggest_data_sources()
    
    print(f"\n🎯 КРАТКИЙ ИТОГ:")
    if analysis['gaps_found']:
        print(f"  ❌ Найдены пробелы в данных: {len(analysis['gaps_found'])} файлов")
        print(f"  📝 Требуют обновления: {', '.join(analysis['gaps_found'][:3])}...")
    else:
        print(f"  ✅ Все данные актуальны до мая 2025!")
    
    print(f"\n📁 Создам детальный отчет для дальнейших действий...") 