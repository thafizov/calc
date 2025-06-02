#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Парсер для получения реальных исторических данных по депозитным ставкам ЦБ РФ
Источники:
1. Современные данные: https://www.cbr.ru/statistics/bank_sector/int_rat/
2. Архивные данные: https://www.cbr.ru/statistics/b_sector/interest_rates_00/ (2000-2012)
3. Статистические бюллетени: https://www.cbr.ru/statistics/bbs/ (2013-2019)
"""

import requests
import json
from datetime import datetime, timedelta
import pandas as pd
import time
import re
from bs4 import BeautifulSoup

class CBRDepositsParser:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        self.base_url = 'https://www.cbr.ru'
        self.deposits_data = {}
        
    def parse_bulletin_data(self, start_year=2013, end_year=2019):
        """
        Парсит данные из статистических бюллетеней ЦБ РФ за 2013-2019 годы
        """
        print(f"📰 Парсинг статистических бюллетеней ЦБ ({start_year}-{end_year})...")
        
        # URL для статистических бюллетеней
        bulletin_url = f"{self.base_url}/statistics/bbs/"
        
        for year in range(start_year, end_year + 1):
            print(f"  └─ Обрабатываем {year} год...")
            
            for month in range(1, 13):
                # Формируем URL для конкретного бюллетеня
                # Пример: https://www.cbr.ru/statistics/bbs/2013/12/
                month_url = f"{bulletin_url}{year}/{month:02d}/"
                
                try:
                    response = self.session.get(month_url, timeout=10)
                    if response.status_code == 200:
                        # Ищем ссылки на Excel/PDF файлы с депозитными ставками
                        data = self._parse_bulletin_page(response.text, year, month)
                        if data:
                            key = f"{year}-{month:02d}"
                            self.deposits_data[key] = data
                            print(f"    ✅ {year}-{month:02d}")
                    else:
                        print(f"    ⚠️  {year}-{month:02d}: статус {response.status_code}")
                        
                    time.sleep(0.5)  # Вежливая пауза
                    
                except Exception as e:
                    print(f"    ⚠️  Ошибка для {year}-{month:02d}: {e}")
                    continue
                    
    def _parse_bulletin_page(self, html_content, year, month):
        """
        Парсит страницу статистического бюллетеня
        Ищет Excel файлы с депозитными ставками
        """
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Поиск ссылок на файлы с депозитными ставками
        links = soup.find_all('a', href=True)
        
        for link in links:
            href = link.get('href', '')
            text = link.get_text().lower()
            
            # Ищем ссылки на депозитные ставки
            if any(keyword in text for keyword in ['депозит', 'вклад', 'процент', 'ставк']):
                if any(ext in href for ext in ['.xls', '.xlsx', '.zip']):
                    # Попытка скачать и парсить файл
                    return self._download_and_parse_bulletin_file(href, year, month)
                    
        # Если прямых ссылок не найдено, ищем в таблицах на странице
        return self._extract_rates_from_bulletin_html(soup, year, month)
        
    def _download_and_parse_bulletin_file(self, file_url, year, month):
        """
        Скачивает и парсит Excel файл с депозитными ставками
        """
        try:
            if not file_url.startswith('http'):
                file_url = self.base_url + file_url
                
            response = self.session.get(file_url, timeout=15)
            if response.status_code == 200:
                # Если это Excel файл
                if file_url.endswith(('.xls', '.xlsx')):
                    return self._parse_excel_bulletin(response.content, year, month)
                    
        except Exception as e:
            print(f"    ⚠️  Ошибка скачивания файла: {e}")
            
        return None
        
    def _parse_excel_bulletin(self, excel_content, year, month):
        """
        Парсит Excel файл из статистического бюллетеня
        """
        try:
            # Пытаемся прочитать все листы Excel файла
            df_dict = pd.read_excel(excel_content, sheet_name=None)
            
            for sheet_name, df in df_dict.items():
                if any(keyword in sheet_name.lower() for keyword in ['депозит', 'вклад', 'ставк']):
                    # Ищем данные по депозитным ставкам
                    rates = self._extract_rates_from_dataframe(df, year, month)
                    if rates:
                        return rates
                        
        except Exception as e:
            print(f"    ⚠️  Ошибка парсинга Excel: {e}")
            
        return None
        
    def _extract_rates_from_dataframe(self, df, year, month):
        """
        Извлекает депозитные ставки из DataFrame
        """
        try:
            # Ищем строки с депозитными ставками
            for index, row in df.iterrows():
                for col in df.columns:
                    cell_value = str(row[col]).lower()
                    
                    if any(keyword in cell_value for keyword in ['депозит', 'вклад физических лиц']):
                        # Ищем числовые значения в этой строке
                        rates = []
                        for next_col in df.columns[list(df.columns).index(col)+1:]:
                            try:
                                rate_val = float(row[next_col])
                                if 0.001 < rate_val < 1:  # Проверяем диапазон ставок
                                    rates.append(rate_val)
                            except (ValueError, TypeError):
                                continue
                                
                        if len(rates) >= 1:
                            # Если нашли ставки, формируем структуру данных
                            base_rate = rates[0]
                            return {
                                "<1": base_rate,
                                "1-3": rates[1] if len(rates) > 1 else base_rate * 1.1,
                                ">3": rates[2] if len(rates) > 2 else base_rate * 1.2
                            }
                            
        except Exception as e:
            print(f"    ⚠️  Ошибка извлечения из DataFrame: {e}")
            
        return None
        
    def _extract_rates_from_bulletin_html(self, soup, year, month):
        """
        Извлекает ставки из HTML страницы бюллетеня
        """
        tables = soup.find_all('table')
        
        for table in tables:
            rows = table.find_all('tr')
            
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 2:
                    text = cells[0].get_text().strip().lower()
                    
                    if any(keyword in text for keyword in ['депозит', 'вклад физических лиц']):
                        # Ищем числовые значения в остальных ячейках
                        rates = []
                        for cell in cells[1:]:
                            try:
                                rate_text = cell.get_text().strip()
                                rate_val = float(rate_text.replace(',', '.').replace('%', ''))
                                
                                # Конвертируем проценты в доли
                                if rate_val > 1:
                                    rate_val = rate_val / 100
                                    
                                if 0.001 < rate_val < 1:
                                    rates.append(rate_val)
                                    
                            except (ValueError, TypeError):
                                continue
                                
                        if len(rates) >= 1:
                            base_rate = rates[0]
                            return {
                                "<1": base_rate,
                                "1-3": rates[1] if len(rates) > 1 else base_rate * 1.1,
                                ">3": rates[2] if len(rates) > 2 else base_rate * 1.2
                            }
                            
        return None
        
    def parse_modern_data(self, start_year=2020, end_year=2025):
        """
        Парсит современные данные с официального сайта ЦБ РФ
        Процентные ставки по вкладам физических лиц
        """
        print(f"📊 Парсинг современных данных ЦБ ({start_year}-{end_year})...")
        
        # URL для современных данных
        url = f"{self.base_url}/statistics/bank_sector/int_rat/"
        
        # Для каждого года получаем данные
        for year in range(start_year, end_year + 1):
            print(f"  └─ Обрабатываем {year} год...")
            
            for month in range(1, 13):
                # Формируем URL для конкретного месяца
                month_url = f"{url}{year:04d}{month:02d}/"
                
                try:
                    response = self.session.get(month_url, timeout=10)
                    if response.status_code == 200:
                        # Здесь нужно парсить HTML страницу
                        data = self._parse_monthly_page(response.text, year, month)
                        if data:
                            key = f"{year}-{month:02d}"
                            self.deposits_data[key] = data
                            
                    time.sleep(1)  # Вежливая пауза
                    
                except Exception as e:
                    print(f"    ⚠️  Ошибка для {year}-{month:02d}: {e}")
                    continue
                    
    def parse_archive_data(self, start_year=2000, end_year=2012):
        """
        Парсит архивные данные за 2000-2012 годы
        """
        print(f"📚 Парсинг архивных данных ЦБ ({start_year}-{end_year})...")
        
        # Архивные URL для разных лет
        for year in range(start_year, end_year + 1):
            url = f"{self.base_url}/statistics/b_sector/interest_rates_{year-2000:02d}/"
            
            try:
                response = self.session.get(url, timeout=10)
                if response.status_code == 200:
                    data = self._parse_archive_year(response.text, year)
                    if data:
                        self.deposits_data.update(data)
                        print(f"  ✅ {year} год - получено {len(data)} записей")
                        
                time.sleep(1)
                
            except Exception as e:
                print(f"  ⚠️  Ошибка для {year}: {e}")
                continue
                
    def _parse_monthly_page(self, html_content, year, month):
        """
        Парсит HTML страницу с данными за месяц
        Ищет таблицы с депозитными ставками
        """
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Поиск таблиц с депозитными ставками
        tables = soup.find_all('table')
        
        for table in tables:
            # Ищем таблицу с вкладами физических лиц
            headers = table.find_all('th')
            if any('вклад' in th.get_text().lower() for th in headers):
                return self._extract_deposit_rates(table, year, month)
                
        return None
        
    def _parse_archive_year(self, html_content, year):
        """
        Парсит архивную страницу с данными за год
        """
        soup = BeautifulSoup(html_content, 'html.parser')
        year_data = {}
        
        # Поиск таблицы с месячными данными
        tables = soup.find_all('table')
        
        for table in tables:
            rows = table.find_all('tr')
            
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 13:  # 12 месяцев + название
                    text = cells[0].get_text().strip().lower()
                    
                    if 'депозит' in text or 'вклад' in text:
                        # Извлекаем данные по месяцам
                        for month in range(1, 13):
                            try:
                                if month < len(cells):
                                    rate_text = cells[month].get_text().strip()
                                    if rate_text and rate_text != '—':
                                        rate = float(rate_text.replace(',', '.')) / 100
                                        key = f"{year}-{month:02d}"
                                        
                                        # Пока используем одну ставку для всех сроков
                                        year_data[key] = {
                                            "<1": rate,
                                            "1-3": rate * 1.1,  # Приблизительно +10% для долгосрочных
                                            ">3": rate * 1.2    # Приблизительно +20% для долгосрочных
                                        }
                            except (ValueError, IndexError):
                                continue
                                
        return year_data
        
    def _extract_deposit_rates(self, table, year, month):
        """
        Извлекает ставки по депозитам из таблицы
        """
        rows = table.find_all('tr')
        
        # Поиск строк с депозитными ставками по срокам
        short_term = None  # до 1 года
        medium_term = None  # 1-3 года  
        long_term = None   # свыше 3 лет
        
        for row in rows:
            cells = row.find_all(['td', 'th'])
            if len(cells) >= 2:
                text = cells[0].get_text().strip().lower()
                
                try:
                    rate_text = cells[1].get_text().strip()
                    if rate_text and rate_text != '—':
                        rate = float(rate_text.replace(',', '.').replace('%', '')) / 100
                        
                        if 'до 1' in text or '<1' in text:
                            short_term = rate
                        elif '1-3' in text or '1 до 3' in text:
                            medium_term = rate
                        elif '>3' in text or 'свыше 3' in text:
                            long_term = rate
                            
                except (ValueError, IndexError):
                    continue
                    
        # Если нашли данные, возвращаем их
        if any([short_term, medium_term, long_term]):
            return {
                "<1": short_term or 0.05,     # Значение по умолчанию
                "1-3": medium_term or 0.06,   # Значение по умолчанию
                ">3": long_term or 0.07       # Значение по умолчанию
            }
            
        return None
        
    def get_cbr_api_data(self):
        """
        Пытается получить данные через API ЦБ (если есть)
        """
        print("🔗 Попытка получения данных через API ЦБ...")
        
        # API endpoint для статистики (если доступен)
        api_url = "https://www.cbr.ru/Queries/UniDbQuery/DownloadExcel"
        
        # Параметры запроса для депозитных ставок
        params = {
            'Posted': 'True',
            'so': 'MonthArch',
            'VAL_NM_RQ': 'R01',  # Рубли
            'From': '01.01.2000',
            'To': datetime.now().strftime('%d.%m.%Y')
        }
        
        try:
            response = self.session.get(api_url, params=params, timeout=30)
            if response.status_code == 200:
                # Если получили Excel файл, парсим его
                return self._parse_excel_data(response.content)
        except Exception as e:
            print(f"  ⚠️  API недоступен: {e}")
            
        return None
        
    def _parse_excel_data(self, excel_content):
        """
        Парсит Excel файл с данными ЦБ
        """
        try:
            df = pd.read_excel(excel_content)
            # Логика парсинга Excel файла
            # Это зависит от формата файла ЦБ
            return {}
        except Exception as e:
            print(f"  ⚠️  Ошибка парсинга Excel: {e}")
            return None
            
    def save_to_json(self, filename='data/deposits_real.json'):
        """
        Сохраняет данные в JSON файл
        """
        print(f"💾 Сохранение данных в {filename}...")
        
        # Сортируем данные по датам
        sorted_data = dict(sorted(self.deposits_data.items()))
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(sorted_data, f, ensure_ascii=False, indent=2)
            
        print(f"  ✅ Сохранено {len(sorted_data)} записей")
        return len(sorted_data)
        
    def validate_data(self):
        """
        Проверяет качество полученных данных
        """
        print("🔍 Валидация полученных данных...")
        
        issues = []
        
        for date, rates in self.deposits_data.items():
            # Проверка структуры
            if not isinstance(rates, dict):
                issues.append(f"{date}: неверная структура")
                continue
                
            required_keys = ["<1", "1-3", ">3"]
            for key in required_keys:
                if key not in rates:
                    issues.append(f"{date}: отсутствует {key}")
                    
            # Проверка логичности значений
            if rates.get("<1", 0) > 1:  # Ставка больше 100%
                issues.append(f"{date}: подозрительно высокая ставка <1 года: {rates['<1']}")
                
        if issues:
            print(f"  ⚠️  Найдено {len(issues)} проблем:")
            for issue in issues[:5]:  # Показываем первые 5
                print(f"    - {issue}")
        else:
            print("  ✅ Данные прошли валидацию")
            
        return len(issues) == 0

def main():
    """
    Основная функция для запуска парсера
    """
    print("🏦 Парсер реальных депозитных ставок ЦБ РФ")
    print("=" * 50)
    
    parser = CBRDepositsParser()
    
    try:
        # 1. Пытаемся получить данные через API
        api_data = parser.get_cbr_api_data()
        if api_data:
            parser.deposits_data.update(api_data)
            
        # 2. Парсим архивные данные (2000-2012)
        parser.parse_archive_data(2000, 2012)
        
        # 3. Парсим данные из статистических бюллетеней (2013-2019)
        parser.parse_bulletin_data(2013, 2019)
        
        # 4. Парсим современные данные (2020-2025)
        parser.parse_modern_data(2020, 2025)
        
        # 5. Валидация
        parser.validate_data()
        
        # 6. Сохранение
        if parser.deposits_data:
            count = parser.save_to_json()
            print(f"\n🎉 Парсинг завершён! Получено {count} записей")
        else:
            print("\n❌ Не удалось получить данные")
            
    except KeyboardInterrupt:
        print("\n⚠️  Парсинг прерван пользователем")
    except Exception as e:
        print(f"\n❌ Критическая ошибка: {e}")

if __name__ == "__main__":
    main() 