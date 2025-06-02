import pandas as pd
import json
import os

# Путь к локальному файлу с данными об инфляции
file_path = 'ipc_mes_04-2025.xlsx'

def parse_inflation_data():
    try:
        # Проверяем, что файл существует
        if not os.path.exists(file_path):
            print(f"Файл {file_path} не найден!")
            return None
        
        print(f"Читаю данные из файла: {file_path}")
        
        # Читаем лист с общими индексами потребительских цен
        df = pd.read_excel(file_path, sheet_name='01', engine='openpyxl')
        
        print("Исходные данные:")
        print(df.head(15))
        
        # Находим строку с годами (обычно это 2-3 строка)
        years_row_idx = None
        for i, row in df.iterrows():
            # Ищем строку, где есть числа больше 1990 (годы)
            for col in df.columns:
                try:
                    val = row[col]
                    if pd.notna(val) and isinstance(val, (int, float)) and 1990 <= val <= 2030:
                        years_row_idx = i
                        break
                except:
                    continue
            if years_row_idx is not None:
                break
        
        if years_row_idx is None:
            print("Не удалось найти строку с годами")
            return None
            
        print(f"Строка с годами найдена на позиции: {years_row_idx}")
        
        # Извлекаем годы
        years_row = df.iloc[years_row_idx]
        years = []
        year_columns = []
        
        for col in df.columns:
            val = years_row[col]
            if pd.notna(val) and isinstance(val, (int, float)) and 1990 <= val <= 2030:
                years.append(int(val))
                year_columns.append(col)
        
        print(f"Найденные годы: {years}")
        
        # Находим строки с месяцами
        month_names = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 
                      'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь']
        
        inflation_data = {}
        
        for i, row in df.iterrows():
            month_name = None
            if pd.notna(row.iloc[0]):
                row_name = str(row.iloc[0]).lower().strip()
                for month in month_names:
                    if month in row_name:
                        month_name = month
                        break
            
            if month_name:
                month_idx = month_names.index(month_name) + 1
                print(f"Обрабатываю месяц: {month_name} ({month_idx})")
                
                # Извлекаем данные по годам для этого месяца
                for j, col in enumerate(year_columns):
                    if j < len(years):
                        year = years[j]
                        value = row[col]
                        
                        if pd.notna(value) and isinstance(value, (int, float)):
                            # Конвертируем индекс в проценты и затем в доли
                            # Например: 101.23 -> 1.23% -> 0.0123
                            inflation_rate = (value - 100) / 100
                            key = f"{year}-{month_idx:02d}"
                            inflation_data[key] = inflation_rate
                            print(f"  {key}: {value} -> {inflation_rate:.4f}")
        
        # Отсортируем по датам
        inflation_data = dict(sorted(inflation_data.items()))
        
        # Сохраняем в JSON
        output_file = 'inflation_data.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(inflation_data, f, ensure_ascii=False, indent=2)
        
        print(f'\n✅ Готово! Данные сохранены в {output_file}')
        print(f'Всего записей: {len(inflation_data)}')
        
        # Показываем последние несколько записей
        last_entries = list(inflation_data.items())[-10:]
        print('\nПоследние 10 записей:')
        for key, value in last_entries:
            print(f"{key}: {value:.4f} ({value*100:.2f}%)")
        
        return inflation_data
        
    except Exception as e:
        print(f"Ошибка при обработке файла: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    parse_inflation_data() 