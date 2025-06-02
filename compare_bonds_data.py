import json
import pandas as pd
from datetime import datetime

def load_main_data_bonds():
    """Загружаем данные по облигациям из all_data_final.json"""
    with open('data/all_data_final.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    bonds_data = {}
    
    # Ищем данные по облигациям
    for tool in data['tools']:
        if tool.get('name') == 'Облигации':
            for item in tool.get('items', []):
                if 'name' in item and 'items' in item:
                    bonds_data[item['name']] = item['items']
    
    return bonds_data

def load_separate_bonds_files():
    """Загружаем данные из отдельных файлов облигаций"""
    bonds_files = {}
    
    try:
        with open('data/bonds_corp.json', 'r', encoding='utf-8') as f:
            bonds_files['corp'] = json.load(f)
        print("✅ Загружен bonds_corp.json")
    except FileNotFoundError:
        print("❌ Файл bonds_corp.json не найден")
        bonds_files['corp'] = {}
    
    try:
        with open('data/bonds_ofz.json', 'r', encoding='utf-8') as f:
            bonds_files['ofz'] = json.load(f)
        print("✅ Загружен bonds_ofz.json")
    except FileNotFoundError:
        print("❌ Файл bonds_ofz.json не найден")
        bonds_files['ofz'] = {}
    
    return bonds_files

def analyze_data_format(data, data_name):
    """Анализируем формат данных"""
    print(f"\n=== АНАЛИЗ ФОРМАТА {data_name} ===")
    
    if isinstance(data, dict):
        if len(data) > 0:
            # Проверяем формат ключей
            sample_keys = list(data.keys())[:5]
            print(f"Формат ключей: {sample_keys}")
            
            # Проверяем формат значений
            sample_values = [data[key] for key in sample_keys]
            print(f"Формат значений: {sample_values}")
            
            # Проверяем временной период
            all_keys = sorted(data.keys())
            print(f"Период: {all_keys[0]} - {all_keys[-1]}")
            print(f"Всего записей: {len(data)}")
            
        else:
            print("Данные пустые")
    
    elif isinstance(data, list):
        if len(data) > 0:
            print(f"Структура: список из {len(data)} элементов")
            print(f"Первый элемент: {data[0]}")
            print(f"Последний элемент: {data[-1]}")
        else:
            print("Список пустой")
    else:
        print(f"Неожиданный тип данных: {type(data)}")

def convert_main_data_to_returns(main_data_items):
    """Преобразуем данные из главного файла в месячную доходность"""
    if not main_data_items or len(main_data_items) < 2:
        return {}
    
    returns = {}
    
    for i in range(1, len(main_data_items)):
        current = main_data_items[i]
        previous = main_data_items[i-1]
        
        if 'date' in current and 'value' in current and 'value' in previous:
            # Парсим дату и формируем ключ в формате YYYY-MM
            date = datetime.strptime(current['date'], '%d.%m.%Y')
            key = f"{date.year:04d}-{date.month:02d}"
            
            # Вычисляем доходность
            if previous['value'] != 0:
                return_value = (current['value'] - previous['value']) / previous['value']
                returns[key] = return_value
    
    return returns

def compare_bond_data(main_data, separate_data, bond_type):
    """Сравниваем данные по конкретному типу облигаций"""
    print(f"\n=== СРАВНЕНИЕ ДАННЫХ ПО {bond_type.upper()} ===")
    
    # Определяем соответствия названий
    main_name_mapping = {
        'corp': 'Индекс корпоративных облигаций',
        'ofz': 'Индекс ОФЗ'
    }
    
    main_name = main_name_mapping.get(bond_type)
    main_bonds = main_data.get(main_name, [])
    separate_bonds = separate_data
    
    if not main_bonds:
        print(f"❌ Данные по {main_name} не найдены в главном файле")
        return
    
    if not separate_bonds:
        print(f"❌ Данные в отдельном файле пустые")
        return
    
    print(f"📊 Главный файл ({main_name}): {len(main_bonds)} записей")
    print(f"📊 Отдельный файл (bonds_{bond_type}.json): {len(separate_bonds)} записей")
    
    # Преобразуем данные главного файла в месячную доходность
    main_returns = convert_main_data_to_returns(main_bonds)
    
    print(f"📊 Главный файл (преобразовано в доходность): {len(main_returns)} записей")
    
    # Сравниваем общие периоды
    common_periods = set(main_returns.keys()) & set(separate_bonds.keys())
    print(f"📊 Общих периодов: {len(common_periods)}")
    
    if len(common_periods) > 0:
        # Берем несколько периодов для сравнения
        sample_periods = sorted(list(common_periods))[:10]  # Первые 10
        
        print(f"\nСравнение первых 10 общих периодов:")
        print("Период       | Главный файл | Отдельный файл | Разница")
        print("-" * 65)
        
        total_diff = 0
        for period in sample_periods:
            val1 = main_returns[period]
            val2 = separate_bonds[period]
            diff = abs(val1 - val2)
            total_diff += diff
            
            print(f"{period}    | {val1:+.6f}     | {val2:+.6f}       | {diff:.6f}")
        
        avg_diff = total_diff / len(sample_periods)
        print(f"\nСредняя абсолютная разница: {avg_diff:.6f}")
        
        # Проверяем последние периоды
        print(f"\nСравнение последних 5 общих периодов:")
        print("Период       | Главный файл | Отдельный файл | Разница")
        print("-" * 65)
        
        last_periods = sorted(list(common_periods))[-5:]
        max_diff = 0
        for period in last_periods:
            val1 = main_returns[period]
            val2 = separate_bonds[period]
            diff = abs(val1 - val2)
            max_diff = max(max_diff, diff)
            
            print(f"{period}    | {val1:+.6f}     | {val2:+.6f}       | {diff:.6f}")
        
        print(f"\nМаксимальная разница в последних периодах: {max_diff:.6f}")
        
        # Оценка качества данных
        if avg_diff < 0.0001:
            print("✅ Отличное совпадение данных!")
        elif avg_diff < 0.001:
            print("🟡 Хорошее совпадение с небольшими различиями")
        else:
            print("🔴 Значительные различия в данных - требует проверки")
    
    # Проверяем покрытие периодов
    print(f"\n=== ПОКРЫТИЕ ПЕРИОДОВ ===")
    
    main_periods = set(main_returns.keys())
    separate_periods = set(separate_bonds.keys())
    
    only_in_main = main_periods - separate_periods
    only_in_separate = separate_periods - main_periods
    
    print(f"Только в главном файле: {len(only_in_main)} периодов")
    if len(only_in_main) > 0:
        print(f"Примеры: {sorted(list(only_in_main))[:5]}")
    
    print(f"Только в отдельном файле: {len(only_in_separate)} периодов")
    if len(only_in_separate) > 0:
        print(f"Примеры: {sorted(list(only_in_separate))[:5]}")
    
    # Временные рамки
    print(f"\n=== ВРЕМЕННЫЕ РАМКИ ===")
    main_first = min(main_periods) if main_periods else "N/A"
    main_last = max(main_periods) if main_periods else "N/A"
    separate_first = min(separate_periods) if separate_periods else "N/A"
    separate_last = max(separate_periods) if separate_periods else "N/A"
    
    print(f"Главный файл:    {main_first} - {main_last}")
    print(f"Отдельный файл:  {separate_first} - {separate_last}")

def main():
    print("🔍 СРАВНЕНИЕ ДАННЫХ ПО ОБЛИГАЦИЯМ\n")
    
    # Загружаем данные
    print("📁 Загрузка данных...")
    main_bonds = load_main_data_bonds()
    separate_bonds = load_separate_bonds_files()
    
    print(f"\nДанные в главном файле:")
    for name, items in main_bonds.items():
        print(f"   • {name}: {len(items)} записей")
    
    print(f"\nДанные в отдельных файлах:")
    for file_type, data in separate_bonds.items():
        print(f"   • bonds_{file_type}.json: {len(data)} записей")
    
    # Анализируем форматы данных
    print("\n" + "="*60)
    
    if main_bonds:
        for name, items in main_bonds.items():
            analyze_data_format(items, f"Главный файл - {name}")
    
    for file_type, data in separate_bonds.items():
        if data:
            analyze_data_format(data, f"bonds_{file_type}.json")
    
    # Сравниваем данные
    print("\n" + "="*60)
    
    # Сравниваем корпоративные облигации
    if separate_bonds.get('corp'):
        compare_bond_data(main_bonds, separate_bonds['corp'], 'corp')
    
    # Сравниваем ОФЗ
    if separate_bonds.get('ofz'):
        compare_bond_data(main_bonds, separate_bonds['ofz'], 'ofz')

if __name__ == "__main__":
    main() 