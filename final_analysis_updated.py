import json
import pandas as pd
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

def load_data():
    """Загружаем данные из файла"""
    with open('data/all_data_final.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def analyze_missing_data(data):
    """Анализируем недостающие данные до мая 2025"""
    print("=== ФИНАЛЬНЫЙ АНАЛИЗ ОБНОВЛЕННЫХ ДАННЫХ ===\n")
    print("📅 Референсная дата: май 2025\n")
    
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
    print("🎯 ФИНАЛЬНЫЙ АНАЛИЗ ОБНОВЛЕННЫХ ДАННЫХ КАЛЬКУЛЯТОРА\n")
    
    # Загружаем данные
    data = load_data()
    print(f"📁 Загружено инструментов: {len(data['tools'])}\n")
    
    # Анализируем недостающие данные в очищенных данных
    missing_analysis = analyze_missing_data(data)
    
    # Анализируем инфляцию отдельно
    inflation_analysis = analyze_inflation_data()
    
    # Создаем сводку по недостающим данным
    print("=== ИТОГОВАЯ СВОДКА ПО НЕДОСТАЮЩИМ ДАННЫМ ===\n")
    
    all_missing = {}
    all_missing.update(missing_analysis)
    if inflation_analysis:
        all_missing['Инфляция'] = inflation_analysis
    
    # Сортируем по количеству недостающих месяцев
    sorted_missing = sorted(all_missing.items(), key=lambda x: x[1]['months_missing'])
    
    print("| 🏦 Инструмент | 📅 Последние данные | ❌ Недостает месяцев | 📈 Всего точек |")
    print("|---------------|---------------------|---------------------|-----------------|")
    
    for name, info in sorted_missing:
        status = "✅ Актуально" if info['months_missing'] == 0 else f"❌ {info['months_missing']} мес."
        clean_name = name.replace(" -> ", " ")
        print(f"| **{clean_name}** | {info['last_date']} | {status} | {info['total_points']} |")
    
    print("\n=== СТАТУС АКТУАЛИЗАЦИИ ===")
    
    fully_updated = [name for name, info in all_missing.items() if info['months_missing'] == 0]
    partially_updated = [name for name, info in all_missing.items() if 0 < info['months_missing'] < 5]
    needs_update = [name for name, info in all_missing.items() if info['months_missing'] >= 5]
    
    if fully_updated:
        print(f"\n✅ АКТУАЛЬНЫЕ ({len(fully_updated)}):")
        for name in fully_updated:
            print(f"   • {name}")
    
    if partially_updated:
        print(f"\n🔶 ЧАСТИЧНО УСТАРЕЛИ ({len(partially_updated)}):")
        for name in partially_updated:
            months = all_missing[name]['months_missing']
            print(f"   • {name}: {months} месяцев")
    
    if needs_update:
        print(f"\n🚨 ТРЕБУЮТ ОБНОВЛЕНИЯ ({len(needs_update)}):")
        for name in needs_update:
            months = all_missing[name]['months_missing']
            print(f"   • {name}: {months} месяцев")

if __name__ == "__main__":
    main() 