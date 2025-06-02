import json
import pandas as pd
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

def load_data():
    """Загружаем данные из файла"""
    with open('data/all_data.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def create_final_clean_data(data):
    """Создаем финальные очищенные данные"""
    print("=== СОЗДАНИЕ ФИНАЛЬНЫХ ОЧИЩЕННЫХ ДАННЫХ ===\n")
    
    current_date = datetime(2025, 5, 31)  # Май 2025
    
    def clean_items(items, path=""):
        if 'items' in items and isinstance(items['items'], list):
            # Фильтруем элементы
            cleaned_items = []
            for item in items['items']:
                if isinstance(item, dict):
                    item_path = f"{path} -> {item.get('name', '')}" if path else item.get('name', '')
                    
                    # Удаляем ненужные элементы
                    if 'code' in item:
                        # Удаляем долларовые депозиты
                        if 'dollar' in item['code'].lower():
                            print(f"🗑️  Удаляем: {item_path} (код: {item['code']})")
                            continue
                        
                        # Удаляем недвижимость и золото
                        if item['code'] in ['gold', 'real_estate'] or 'недвижимость' in item.get('name', '').lower() or 'золото' in item.get('name', '').lower():
                            print(f"🗑️  Удаляем: {item_path} (код: {item['code']})")
                            continue
                    
                    # Удаляем по названию
                    if any(word in item.get('name', '').lower() for word in ['недвижимость', 'золото', 'gold']):
                        print(f"🗑️  Удаляем: {item_path}")
                        continue
                    
                    # Рекурсивно очищаем вложенные элементы
                    cleaned_item = clean_items(item, item_path)
                    if cleaned_item and (cleaned_item.get('items') or 'date' in str(cleaned_item)):
                        cleaned_items.append(cleaned_item)
                else:
                    cleaned_items.append(item)
            
            # Упрощаем структуру депозитов - убираем "Рублевые"
            result = items.copy()
            
            # Если это "Рублевые" депозиты, поднимаем их содержимое на уровень выше
            if items.get('name') == 'Рублевые' and path and 'Депозиты' in path:
                print(f"📝 Упрощаем структуру: убираем уровень 'Рублевые'")
                return cleaned_items  # Возвращаем только содержимое, без обертки
            
            result['items'] = cleaned_items
            return result
        else:
            return items
    
    # Очищаем данные
    cleaned_data = {'tools': []}
    for tool in data['tools']:
        # Проверяем на верхнем уровне - удаляем золото и недвижимость
        if tool.get('name') in ['Золото', 'Недвижимость']:
            print(f"🗑️  Удаляем инструмент: {tool.get('name', '')} (код: {tool.get('code', '')})")
            continue
        
        if tool.get('code') in ['gold', 'realty']:
            print(f"🗑️  Удаляем инструмент: {tool.get('name', '')} (код: {tool.get('code', '')})")
            continue
            
        cleaned_tool = clean_items(tool)
        
        # Специальная обработка депозитов
        if cleaned_tool.get('name') == 'Депозиты':
            # Извлекаем рублевые депозиты на верхний уровень
            new_items = []
            for item in cleaned_tool.get('items', []):
                if isinstance(item, list):  # Это содержимое "Рублевых"
                    new_items.extend(item)
                elif item.get('name') != 'Рублевые':
                    new_items.append(item)
                elif item.get('name') == 'Рублевые':
                    new_items.extend(item.get('items', []))
            
            cleaned_tool['items'] = new_items
        
        if cleaned_tool and cleaned_tool.get('items'):
            cleaned_data['tools'].append(cleaned_tool)
    
    return cleaned_data

def analyze_missing_data(data):
    """Анализируем недостающие данные до мая 2025"""
    print("=== АНАЛИЗ НЕДОСТАЮЩИХ ДАННЫХ (до мая 2025) ===\n")
    
    current_date = datetime(2025, 5, 31)
    results = {}
    
    def process_items(items, path=""):
        if 'items' in items and isinstance(items['items'], list):
            # Проверяем, есть ли данные временных рядов
            dates = []
            for item in items['items']:
                if isinstance(item, dict) and 'date' in item:
                    dates.append(datetime.strptime(item['date'], '%d.%m.%Y'))
            
            if dates:
                dates.sort()
                instrument_name = f"{path} -> {items['name']}" if path else items['name']
                last_date = max(dates)
                
                # Вычисляем недостающие месяцы
                months_missing = 0
                temp_date = last_date
                while temp_date < current_date:
                    temp_date += relativedelta(months=1)
                    months_missing += 1
                
                # Если последняя дата не в конце месяца, корректируем
                if months_missing > 0:
                    months_missing -= 1
                
                years_missing = months_missing // 12
                months_only = months_missing % 12
                
                results[instrument_name] = {
                    'last_date': last_date.strftime('%d.%m.%Y'),
                    'months_missing': months_missing,
                    'years_missing': years_missing,
                    'months_only': months_only,
                    'total_points': len(dates)
                }
                
                print(f"📊 {instrument_name}")
                print(f"   Последние данные: {last_date.strftime('%d.%m.%Y')}")
                print(f"   Всего точек: {len(dates)}")
                
                if months_missing > 0:
                    if years_missing > 0:
                        print(f"   ❌ Не хватает: {years_missing} лет {months_only} месяцев ({months_missing} месяцев)")
                    else:
                        print(f"   ❌ Не хватает: {months_missing} месяцев")
                else:
                    print(f"   ✅ Данные актуальны")
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

def analyze_inflation_data():
    """Отдельно анализируем данные по инфляции"""
    print("=== АНАЛИЗ ДАННЫХ ПО ИНФЛЯЦИИ ===\n")
    
    try:
        with open('data/inflation_data.json', 'r', encoding='utf-8') as f:
            inflation_data = json.load(f)
        
        if inflation_data and len(inflation_data) > 0:
            # Данные в формате {"YYYY-MM": value}
            dates = []
            for date_str in inflation_data.keys():
                try:
                    # Парсим формат "YYYY-MM"
                    year, month = date_str.split('-')
                    # Создаем последний день месяца
                    import calendar
                    last_day = calendar.monthrange(int(year), int(month))[1]
                    date_obj = datetime(int(year), int(month), last_day)
                    dates.append(date_obj)
                except:
                    continue
            
            if dates:
                dates.sort()
                last_date = max(dates)
                current_date = datetime(2025, 5, 31)
                
                months_missing = 0
                temp_date = last_date
                while temp_date < current_date:
                    temp_date += relativedelta(months=1)
                    months_missing += 1
                
                if months_missing > 0:
                    months_missing -= 1
                
                years_missing = months_missing // 12
                months_only = months_missing % 12
                
                print(f"📊 Инфляция")
                print(f"   Последние данные: {last_date.strftime('%d.%m.%Y')}")
                print(f"   Всего точек: {len(dates)}")
                
                if months_missing > 0:
                    if years_missing > 0:
                        print(f"   ❌ Не хватает: {years_missing} лет {months_only} месяцев ({months_missing} месяцев)")
                    else:
                        print(f"   ❌ Не хватает: {months_missing} месяцев")
                else:
                    print(f"   ✅ Данные актуальны")
                print()
                
                return {
                    'last_date': last_date.strftime('%d.%m.%Y'),
                    'months_missing': months_missing,
                    'years_missing': years_missing,
                    'months_only': months_only,
                    'total_points': len(dates)
                }
        
    except FileNotFoundError:
        print("❌ Файл inflation_data.json не найден")
    except Exception as e:
        print(f"❌ Ошибка при анализе инфляции: {e}")
    
    return None

def main():
    print("🔍 ФИНАЛЬНЫЙ АНАЛИЗ И ОЧИСТКА ДАННЫХ\n")
    print("📅 Текущая дата: май 2025\n")
    
    # Загружаем данные
    data = load_data()
    print(f"📁 Загружено инструментов: {len(data['tools'])}\n")
    
    # Создаем финальные очищенные данные
    cleaned_data = create_final_clean_data(data)
    
    # Анализируем недостающие данные в очищенных данных
    missing_analysis = analyze_missing_data(cleaned_data)
    
    # Анализируем инфляцию отдельно
    inflation_analysis = analyze_inflation_data()
    
    # Сохраняем финальные очищенные данные
    with open('data/all_data_final.json', 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, ensure_ascii=False, indent=2)
    
    print(f"💾 Финальные очищенные данные сохранены в data/all_data_final.json")
    
    # Создаем сводку по недостающим данным
    print("\n=== СВОДКА ПО НЕДОСТАЮЩИМ ДАННЫМ ===\n")
    
    all_missing = {}
    all_missing.update(missing_analysis)
    if inflation_analysis:
        all_missing['Инфляция'] = inflation_analysis
    
    # Сортируем по количеству недостающих месяцев
    sorted_missing = sorted(all_missing.items(), key=lambda x: x[1]['months_missing'], reverse=True)
    
    for name, info in sorted_missing:
        if info['months_missing'] > 0:
            print(f"⚠️  {name}: {info['months_missing']} месяцев (до {info['last_date']})")
        else:
            print(f"✅ {name}: актуально")
    
    # Сохраняем финальный отчет
    final_report = {
        'analysis_date': datetime.now().isoformat(),
        'current_reference_date': '31.05.2025',
        'missing_data_analysis': all_missing,
        'instruments_kept': list(all_missing.keys()),
        'instruments_removed': ['Недвижимость', 'Золото', 'Долларовые депозиты']
    }
    
    with open('data/final_analysis_report.json', 'w', encoding='utf-8') as f:
        json.dump(final_report, f, ensure_ascii=False, indent=2)
    
    print(f"\n📋 Финальный отчет сохранен в data/final_analysis_report.json")

if __name__ == "__main__":
    main() 