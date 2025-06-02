import json
import calendar
from datetime import datetime

def load_moex_stocks():
    """Загружаем данные из stocks_moex.json"""
    with open('data/stocks_moex.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def load_main_data():
    """Загружаем главный файл данных"""
    with open('data/all_data_final.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def convert_moex_to_accumulated_format(moex_data):
    """Преобразуем данные из формата доходности в накопленные значения индекса"""
    print("🔄 Преобразование данных из stocks_moex.json...")
    
    # Начинаем со 100 (базовое значение индекса на 31.12.1999)
    base_value = 100
    current_value = base_value
    
    # Добавляем стартовую точку
    result = [{
        "date": "31.12.1999",
        "value": base_value
    }]
    
    # Сортируем периоды по датам
    sorted_periods = sorted(moex_data.keys())
    
    for period in sorted_periods:
        year, month = period.split('-')
        year, month = int(year), int(month)
        
        # Получаем последний день месяца
        last_day = calendar.monthrange(year, month)[1]
        date_str = f"{last_day:02d}.{month:02d}.{year}"
        
        # Применяем доходность к текущему значению
        monthly_return = moex_data[period]
        current_value = current_value * (1 + monthly_return)
        
        result.append({
            "date": date_str,
            "value": round(current_value, 2)
        })
    
    print(f"✅ Преобразовано {len(result)} записей")
    print(f"   Период: {result[0]['date']} - {result[-1]['date']}")
    print(f"   Значения: {result[0]['value']} - {result[-1]['value']}")
    
    return result

def update_main_data_with_stocks(main_data, new_stocks_data):
    """Обновляем данные по акциям в главном файле"""
    print("🔄 Обновление данных по акциям в главном файле...")
    
    updated = False
    
    for tool in main_data['tools']:
        if tool.get('name') == 'Акции' and tool.get('code') == 'stock':
            old_count = len(tool.get('items', []))
            tool['items'] = new_stocks_data
            new_count = len(new_stocks_data)
            
            print(f"✅ Обновлены данные по акциям:")
            print(f"   Было записей: {old_count}")
            print(f"   Стало записей: {new_count}")
            print(f"   Добавлено: {new_count - old_count} записей")
            
            updated = True
            break
    
    if not updated:
        print("❌ Не найдена секция с акциями в главном файле")
        return False
    
    return True

def backup_original_file():
    """Создаем резервную копию оригинального файла"""
    print("💾 Создание резервной копии...")
    
    try:
        with open('data/all_data_final.json', 'r', encoding='utf-8') as f:
            original_data = f.read()
        
        with open('data/all_data_final_backup.json', 'w', encoding='utf-8') as f:
            f.write(original_data)
        
        print("✅ Резервная копия создана: data/all_data_final_backup.json")
        return True
    except Exception as e:
        print(f"❌ Ошибка создания резервной копии: {e}")
        return False

def main():
    print("🚀 ОБНОВЛЕНИЕ ДАННЫХ ПО АКЦИЯМ\n")
    
    # Создаем резервную копию
    if not backup_original_file():
        print("❌ Не удалось создать резервную копию. Прерываем операцию.")
        return
    
    try:
        # Загружаем данные
        print("\n📁 Загрузка данных...")
        moex_data = load_moex_stocks()
        main_data = load_main_data()
        
        print(f"   stocks_moex.json: {len(moex_data)} записей")
        print(f"   all_data_final.json: {len(main_data['tools'])} инструментов")
        
        # Преобразуем данные MOEX в нужный формат
        print("\n🔄 Преобразование формата...")
        new_stocks_data = convert_moex_to_accumulated_format(moex_data)
        
        # Обновляем главный файл
        print("\n📝 Обновление главного файла...")
        if update_main_data_with_stocks(main_data, new_stocks_data):
            
            # Сохраняем обновленный файл
            print("\n💾 Сохранение обновленного файла...")
            with open('data/all_data_final.json', 'w', encoding='utf-8') as f:
                json.dump(main_data, f, ensure_ascii=False, indent=2)
            
            print("✅ Файл all_data_final.json успешно обновлен!")
            
            # Показываем статистику
            print("\n📊 СТАТИСТИКА ОБНОВЛЕНИЯ:")
            
            # Найдем обновленные данные для статистики
            for tool in main_data['tools']:
                if tool.get('name') == 'Акции':
                    updated_stocks = tool['items']
                    print(f"   Новый период данных: {updated_stocks[0]['date']} - {updated_stocks[-1]['date']}")
                    print(f"   Всего записей: {len(updated_stocks)}")
                    
                    # Проверяем актуальность
                    last_date = datetime.strptime(updated_stocks[-1]['date'], '%d.%m.%Y')
                    current_date = datetime(2025, 5, 31)
                    
                    if last_date >= current_date:
                        print("   ✅ Данные актуальны до мая 2025!")
                    else:
                        months_behind = (current_date.year - last_date.year) * 12 + (current_date.month - last_date.month)
                        print(f"   ⚠️  Отстают на {months_behind} месяцев")
                    break
            
        else:
            print("❌ Не удалось обновить данные")
            
    except Exception as e:
        print(f"❌ Ошибка при обновлении: {e}")
        print("💡 Восстановите из резервной копии: data/all_data_final_backup.json")

if __name__ == "__main__":
    main() 