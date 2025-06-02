import requests
import json
from datetime import datetime, timedelta
import time

print("📈 Парсер индекса МосБиржи (IMOEX) с 2000 года")
print("="*50)

def get_moex_data(start_date, end_date, start_row=0):
    """
    Получает данные индекса IMOEX через API МосБиржи
    """
    base_url = "https://iss.moex.com/iss/history/engines/stock/markets/index/securities/IMOEX.json"
    
    params = {
        'from': start_date,
        'till': end_date,
        'start': start_row,
        'limit': 100  # Максимум записей за запрос
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
    }
    
    try:
        response = requests.get(base_url, params=params, headers=headers, timeout=30)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Ошибка HTTP {response.status_code}")
            return None
            
    except requests.RequestException as e:
        print(f"❌ Ошибка запроса: {e}")
        return None

def parse_all_data():
    """
    Получает все данные с 2000 года по настоящее время
    """
    start_date = "2000-01-01"
    end_date = datetime.now().strftime("%Y-%m-%d")
    
    print(f"📅 Период: {start_date} - {end_date}")
    
    all_data = []
    start_row = 0
    page = 1
    
    while True:
        print(f"\n📄 Загружаем страницу {page} (записи с {start_row})...")
        
        data = get_moex_data(start_date, end_date, start_row)
        
        if not data:
            print("❌ Не удалось получить данные")
            break
            
        history = data.get('history', {})
        records = history.get('data', [])
        cursor = data.get('history.cursor', {}).get('data', [[0, 0, 0]])[0]
        
        if not records:
            print("✅ Данные закончились")
            break
            
        print(f"   Получено записей: {len(records)}")
        print(f"   Первая дата: {records[0][2] if records else 'нет'}")
        print(f"   Последняя дата: {records[-1][2] if records else 'нет'}")
        
        # Добавляем данные
        all_data.extend(records)
        
        # Проверяем курсор для пагинации
        total_records = cursor[1] if len(cursor) > 1 else 0
        current_start = cursor[0] if len(cursor) > 0 else 0
        
        print(f"   Курсор: начало={current_start}, всего={total_records}")
        
        # Если получили все данные, выходим
        if len(records) < 100 or current_start + len(records) >= total_records:
            print("✅ Все данные получены")
            break
            
        start_row += len(records)
        page += 1
        
        # Пауза между запросами
        time.sleep(0.5)
    
    return all_data

def process_data(raw_data):
    """
    Обрабатывает сырые данные и преобразует в нужный формат
    """
    print(f"\n📊 Обработка {len(raw_data)} записей...")
    
    # Структура данных: ['BOARDID', 'SECID', 'TRADEDATE', 'SHORTNAME', 'NAME', 'CLOSE', 'OPEN', 'HIGH', 'LOW', ...]
    processed = {}
    
    for record in raw_data:
        if len(record) < 6:
            continue
            
        date_str = record[2]  # TRADEDATE
        close_price = record[5]  # CLOSE
        
        if not date_str or close_price is None:
            continue
            
        try:
            # Преобразуем дату в формат YYYY-MM
            date_obj = datetime.strptime(date_str, "%Y-%m-%d")
            month_key = date_obj.strftime("%Y-%m")
            
            # Сохраняем данные (берем последнее значение месяца)
            processed[month_key] = {
                'date': date_str,
                'close': float(close_price),
                'open': float(record[6]) if record[6] is not None else None,
                'high': float(record[7]) if record[7] is not None else None,
                'low': float(record[8]) if record[8] is not None else None,
            }
            
        except (ValueError, IndexError) as e:
            print(f"⚠️ Ошибка обработки записи: {record[:3]} - {e}")
            continue
    
    return processed

def save_results(data):
    """
    Сохраняет результаты в JSON файл
    """
    # Сортируем по датам
    sorted_data = dict(sorted(data.items()))
    
    # Сохраняем полные данные
    with open('moex_index_full.json', 'w', encoding='utf-8') as f:
        json.dump(sorted_data, f, ensure_ascii=False, indent=2)
    
    # Создаем упрощенную версию только с ценами закрытия
    simple_data = {month: values['close'] for month, values in sorted_data.items()}
    
    with open('moex_index_simple.json', 'w', encoding='utf-8') as f:
        json.dump(simple_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Данные сохранены:")
    print(f"   📁 moex_index_full.json - полные данные ({len(sorted_data)} месяцев)")
    print(f"   📁 moex_index_simple.json - только цены закрытия")
    
    # Показываем статистику
    if sorted_data:
        years = sorted(set(month.split('-')[0] for month in sorted_data.keys()))
        print(f"\n📈 Статистика:")
        print(f"   Диапазон лет: {years[0]} - {years[-1]}")
        print(f"   Всего месяцев: {len(sorted_data)}")
        
        # Первые и последние значения
        first_month = min(sorted_data.keys())
        last_month = max(sorted_data.keys())
        
        print(f"\n📊 Первое значение:")
        print(f"   {first_month}: {sorted_data[first_month]['close']:.2f}")
        
        print(f"\n📊 Последнее значение:")
        print(f"   {last_month}: {sorted_data[last_month]['close']:.2f}")
        
        # Рост за весь период
        first_price = sorted_data[first_month]['close']
        last_price = sorted_data[last_month]['close']
        total_growth = ((last_price / first_price) - 1) * 100
        
        print(f"\n🚀 Общий рост за период: {total_growth:.1f}%")

def main():
    try:
        # Получаем все данные
        raw_data = parse_all_data()
        
        if not raw_data:
            print("❌ Не удалось получить данные")
            return
        
        # Обрабатываем данные
        processed_data = process_data(raw_data)
        
        if not processed_data:
            print("❌ Не удалось обработать данные")
            return
        
        # Сохраняем результаты
        save_results(processed_data)
        
    except KeyboardInterrupt:
        print("\n⏹️ Прервано пользователем")
    except Exception as e:
        print(f"❌ Критическая ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 