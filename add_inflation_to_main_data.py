import json
import calendar
from datetime import datetime

def load_inflation_data():
    """Загружаем данные по инфляции"""
    with open('data/inflation_data.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def load_main_data():
    """Загружаем главный файл данных"""
    with open('data/all_data_final.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def convert_inflation_to_main_format(inflation_data):
    """Преобразуем данные инфляции в формат главного файла"""
    print("🔄 Преобразование данных инфляции...")
    
    result = []
    
    # Сортируем периоды по датам
    sorted_periods = sorted(inflation_data.keys())
    
    for period in sorted_periods:
        year, month = period.split('-')
        year, month = int(year), int(month)
        
        # Получаем последний день месяца
        last_day = calendar.monthrange(year, month)[1]
        date_str = f"{last_day:02d}.{month:02d}.{year}"
        
        # Добавляем запись
        result.append({
            "date": date_str,
            "value": inflation_data[period]
        })
    
    print(f"✅ Преобразовано {len(result)} записей")
    print(f"   Период: {result[0]['date']} - {result[-1]['date']}")
    print(f"   Значения: {result[0]['value']:.6f} - {result[-1]['value']:.6f}")
    
    return result

def add_inflation_to_main_data(main_data, inflation_items):
    """Добавляем инфляцию в главный файл"""
    print("📝 Добавление инфляции в главный файл...")
    
    # Проверяем, есть ли уже инфляция
    inflation_exists = False
    for tool in main_data['tools']:
        if tool.get('name') == 'Инфляция' or tool.get('code') == 'inflation':
            print("⚠️  Инфляция уже есть в файле, заменяем...")
            tool['items'] = inflation_items
            inflation_exists = True
            break
    
    if not inflation_exists:
        # Создаем новый инструмент для инфляции
        inflation_tool = {
            "name": "Инфляция",
            "code": "inflation",
            "sort": 100,  # Ставим в начало
            "items": inflation_items
        }
        
        # Добавляем в начало списка
        main_data['tools'].insert(0, inflation_tool)
        print("✅ Инфляция добавлена как новый инструмент")
    else:
        print("✅ Данные инфляции обновлены")
    
    return True

def backup_files():
    """Создаем резервные копии файлов"""
    print("💾 Создание резервных копий...")
    
    try:
        # Копируем главный файл
        with open('data/all_data_final.json', 'r', encoding='utf-8') as f:
            main_data = f.read()
        
        with open('data/all_data_final_with_inflation_backup.json', 'w', encoding='utf-8') as f:
            f.write(main_data)
        
        print("✅ Резервная копия создана: data/all_data_final_with_inflation_backup.json")
        return True
    except Exception as e:
        print(f"❌ Ошибка создания резервной копии: {e}")
        return False

def analyze_final_result(main_data):
    """Анализируем итоговый результат"""
    print("\n📊 АНАЛИЗ ИТОГОВОГО ФАЙЛА:")
    
    print(f"   Всего инструментов: {len(main_data['tools'])}")
    
    current_date = datetime(2025, 5, 31)
    
    for tool in main_data['tools']:
        name = tool.get('name', 'Неизвестно')
        items = tool.get('items', [])
        
        if items and isinstance(items, list) and len(items) > 0:
            # Ищем последнюю дату
            last_item = items[-1]
            if 'date' in last_item:
                last_date = datetime.strptime(last_item['date'], '%d.%m.%Y')
                
                # Вычисляем отставание
                if last_date >= current_date:
                    status = "✅ Актуально"
                else:
                    months_behind = (current_date.year - last_date.year) * 12 + (current_date.month - last_date.month)
                    status = f"❌ Отстает на {months_behind} мес."
                
                print(f"   • {name}: {len(items)} записей, до {last_date.strftime('%d.%m.%Y')} - {status}")
            else:
                print(f"   • {name}: {len(items)} записей")
        else:
            print(f"   • {name}: нет данных")

def main():
    print("🚀 ДОБАВЛЕНИЕ ИНФЛЯЦИИ В ГЛАВНЫЙ ФАЙЛ\n")
    
    # Создаем резервную копию
    if not backup_files():
        print("❌ Не удалось создать резервную копию. Прерываем операцию.")
        return
    
    try:
        # Загружаем данные
        print("\n📁 Загрузка данных...")
        inflation_data = load_inflation_data()
        main_data = load_main_data()
        
        print(f"   inflation_data.json: {len(inflation_data)} записей")
        print(f"   all_data_final.json: {len(main_data['tools'])} инструментов")
        
        # Преобразуем данные инфляции
        print("\n🔄 Преобразование формата...")
        inflation_items = convert_inflation_to_main_format(inflation_data)
        
        # Добавляем инфляцию в главный файл
        print("\n📝 Обновление главного файла...")
        if add_inflation_to_main_data(main_data, inflation_items):
            
            # Сохраняем обновленный файл
            print("\n💾 Сохранение обновленного файла...")
            with open('data/all_data_final.json', 'w', encoding='utf-8') as f:
                json.dump(main_data, f, ensure_ascii=False, indent=2)
            
            print("✅ Файл all_data_final.json успешно обновлен!")
            
            # Анализируем результат
            analyze_final_result(main_data)
            
            print("\n🎉 ГОТОВО! Теперь у вас один файл для калькулятора:")
            print("   📁 data/all_data_final.json - содержит ВСЕ данные")
            print("   📁 data/inflation_data.json - больше не нужен для калькулятора")
            
        else:
            print("❌ Не удалось добавить инфляцию")
            
    except FileNotFoundError as e:
        print(f"❌ Файл не найден: {e}")
    except Exception as e:
        print(f"❌ Ошибка при обновлении: {e}")
        print("💡 Восстановите из резервной копии: data/all_data_final_with_inflation_backup.json")

if __name__ == "__main__":
    main() 