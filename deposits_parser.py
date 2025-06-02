import requests
from bs4 import BeautifulSoup
import re
import json

print("🔍 Парсим депозитные ставки с сайта ЦБ РФ (с 2009 года)...")

# Формируем URL с параметрами для получения данных с 2009 года
base_url = "https://www.cbr.ru/statistics/avgprocstav/"
params = {
    'UniDbQuery.Posted': 'True',
    'UniDbQuery.From': '1.01.2009',  # Начало 2009 года
    'UniDbQuery.To': '31.12.2025'    # Конец 2025 года
}

print(f"📅 Запрашиваем данные с {params['UniDbQuery.From']} по {params['UniDbQuery.To']}")

response = requests.get(base_url, params=params)
response.encoding = 'utf-8'

print(f"🌐 URL запроса: {response.url}")
print(f"📄 Размер ответа: {len(response.text)} символов")

soup = BeautifulSoup(response.text, 'html.parser')

# Расширенный шаблон для разбора дат
pattern = re.compile(r"(I|II|III)\.(\d{2})\.(\d{4})")
priority = {"I": 1, "II": 2, "III": 3}
monthly = {}

# Найдем все таблицы
tables = soup.find_all("table")
print(f"📊 Найдено таблиц: {len(tables)}")

processed_dates = set()
total_rows = 0

for i, table in enumerate(tables):
    print(f"\n🔍 Анализируем таблицу {i+1}")
    rows = table.find_all("tr")
    print(f"   Строк в таблице: {len(rows)}")
    
    for j, row in enumerate(rows[1:], 1):  # Пропускаем заголовок
        total_rows += 1
        cols = row.find_all(['td', 'th'])
        if len(cols) < 2:
            continue
            
        date_raw = cols[0].text.strip()
        rate_raw = cols[1].text.strip().replace(",", ".")
        
        # Отладочная информация для первых нескольких строк
        if j <= 5:
            print(f"   Строка {j}: дата='{date_raw}', ставка='{rate_raw}'")
        
        match = pattern.match(date_raw)
        if match:
            dec, month, year = match.groups()
            key = f"{year}-{month}"
            
            # Добавляем в множество обработанных дат для отладки
            processed_dates.add(f"{dec}.{month}.{year}")
            
            try:
                rate = float(rate_raw)
                # Проверяем разумность ставки (от 0.1% до 50%)
                if 0.1 <= rate <= 50:
                    if (key not in monthly) or (priority[dec] > monthly[key]['priority']):
                        monthly[key] = {
                            "rate": round(rate / 100, 6),
                            "priority": priority[dec]
                        }
                        # Отладка для старых данных
                        if int(year) <= 2012:
                            print(f"   ✅ Добавлена старая дата: {key} = {rate}%")
            except ValueError:
                continue

print(f"\n📈 Обработано строк: {total_rows}")
print(f"📅 Найдено уникальных дат: {len(processed_dates)}")
print(f"💾 Записей в итоговой структуре: {len(monthly)}")

# Показываем диапазон годов
if monthly:
    years = sorted(set(key.split('-')[0] for key in monthly.keys()))
    print(f"📊 Диапазон годов: {years[0]} - {years[-1]}")
    
    # Показываем количество записей по годам
    year_counts = {}
    for key in monthly.keys():
        year = key.split('-')[0]
        year_counts[year] = year_counts.get(year, 0) + 1
    
    print(f"📈 Записей по годам:")
    for year in sorted(year_counts.keys()):
        print(f"   {year}: {year_counts[year]} записей")

# Формируем итоговую структуру JSON
result = {}
for ym, data in sorted(monthly.items()):
    result[ym] = {
        "<1": data["rate"],
        "1-3": data["rate"],
        ">3": data["rate"]
    }

# Сохраняем
with open("deposits.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"\n✅ JSON сохранён в deposits.json")
print(f"📊 Всего записей: {len(result)}")

# Показываем несколько первых и последних записей
if result:
    sorted_keys = sorted(result.keys())
    print(f"\n📅 Первые записи:")
    for key in sorted_keys[:5]:
        rate_percent = result[key]["<1"] * 100
        print(f"   {key}: {rate_percent:.3f}%")
    
    print(f"\n📅 Последние записи:")
    for key in sorted_keys[-5:]:
        rate_percent = result[key]["<1"] * 100
        print(f"   {key}: {rate_percent:.3f}%") 