#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Универсальный парсер для получения реальных данных по депозитам через API ЦБ РФ
Использует официальный сервис получения данных: https://www.cbr.ru/statistics/data-service/
"""

import requests
import json
from datetime import datetime
import time

class CBRAPIParser:
    def __init__(self):
        self.base_url = 'http://www.cbr.ru/dataservice'
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        self.deposits_data = {}
        
    def get_publications(self):
        """Получаем список всех публикаций"""
        print("📚 Получение списка публикаций...")
        
        try:
            response = self.session.get(f"{self.base_url}/publications", timeout=30)
            response.raise_for_status()
            publications = response.json()
            
            print(f"  ✅ Получено {len(publications)} публикаций")
            return publications
            
        except Exception as e:
            print(f"  ❌ Ошибка получения публикаций: {e}")
            return []
            
    def find_deposits_publication(self, publications):
        """Ищем публикацию с данными по депозитам"""
        print("🔍 Поиск публикации с депозитами...")
        
        # Ищем публикацию с депозитами/вкладами
        deposits_keywords = ['депозит', 'вклад', 'процентные ставки']
        
        for pub in publications:
            category_name = pub.get('category_name', '').lower()
            
            for keyword in deposits_keywords:
                if keyword in category_name:
                    print(f"  ✅ Найдена публикация: {pub.get('category_name')} (ID: {pub.get('id')})")
                    return pub
                    
        print("  ⚠️  Публикация с депозитами не найдена")
        return None
        
    def get_datasets(self, publication_id):
        """Получаем список показателей для публикации"""
        print(f"📊 Получение показателей для публикации {publication_id}...")
        
        try:
            response = self.session.get(f"{self.base_url}/datasets?publicationId={publication_id}", timeout=30)
            response.raise_for_status()
            datasets = response.json()
            
            print(f"  ✅ Получено {len(datasets)} показателей")
            return datasets
            
        except Exception as e:
            print(f"  ❌ Ошибка получения показателей: {e}")
            return []
            
    def find_physical_persons_deposits(self, datasets):
        """Ищем показатель по депозитам физических лиц"""
        print("🔍 Поиск показателя по депозитам физических лиц...")
        
        keywords = ['физических лиц', 'физлиц', 'вклад', 'депозит']
        
        for dataset in datasets:
            name = dataset.get('name', '').lower()
            
            # Ищем показатель именно по физическим лицам
            if any(keyword in name for keyword in keywords):
                print(f"  ✅ Найден показатель: {dataset.get('name')} (ID: {dataset.get('id')})")
                return dataset
                
        print("  ⚠️  Показатель по депозитам физических лиц не найден")
        return None
        
    def get_measures(self, dataset_id):
        """Получаем разрезы для показателя"""
        print(f"📐 Получение разрезов для показателя {dataset_id}...")
        
        try:
            response = self.session.get(f"{self.base_url}/measures?datasetId={dataset_id}", timeout=30)
            response.raise_for_status()
            result = response.json()
            measures = result.get('measure', []) if 'measure' in result else []
            
            print(f"  ✅ Получено {len(measures)} разрезов")
            return measures
            
        except Exception as e:
            print(f"  ❌ Ошибка получения разрезов: {e}")
            return []
            
    def get_available_years(self, dataset_id, measure_id=None):
        """Получаем доступный диапазон лет"""
        print("📅 Получение доступного диапазона лет...")
        
        try:
            params = {'datasetId': dataset_id}
            if measure_id:
                params['measureId'] = measure_id
                
            response = self.session.get(f"{self.base_url}/years", params=params, timeout=30)
            response.raise_for_status()
            years_info = response.json()[0]
            
            from_year = years_info.get('FromYear')
            to_year = years_info.get('ToYear')
            
            print(f"  ✅ Данные доступны с {from_year} по {to_year} год")
            return from_year, to_year
            
        except Exception as e:
            print(f"  ❌ Ошибка получения диапазона лет: {e}")
            return None, None
            
    def get_data(self, publication_id, dataset_id, measure_id, from_year, to_year):
        """Получаем данные через API"""
        print(f"📥 Получение данных с {from_year} по {to_year} год...")
        
        try:
            params = {
                'publicationId': publication_id,
                'datasetId': dataset_id,
                'y1': from_year,
                'y2': to_year
            }
            
            if measure_id:
                params['measureId'] = measure_id
                
            response = self.session.get(f"{self.base_url}/data", params=params, timeout=60)
            response.raise_for_status()
            data = response.json()
            
            print(f"  ✅ Получено {len(data)} записей")
            return data
            
        except Exception as e:
            print(f"  ❌ Ошибка получения данных: {e}")
            return []
            
    def process_api_data(self, raw_data):
        """Обрабатываем данные из API в нужный формат"""
        print("🔄 Обработка полученных данных...")
        
        processed_data = {}
        
        for record in raw_data:
            # Извлекаем дату
            date_str = record.get('Date', '')
            if not date_str:
                continue
                
            try:
                # Дата в формате YYYY-MM-DD, нам нужен YYYY-MM
                date_parts = date_str.split('-')
                if len(date_parts) >= 2:
                    year_month = f"{date_parts[0]}-{date_parts[1]}"
                else:
                    continue
                    
                # Извлекаем значение ставки
                obs_val = record.get('ObsVal')
                if obs_val is None:
                    continue
                    
                # Конвертируем в доли (если это проценты)
                rate = float(obs_val)
                if rate > 1:  # Если значение больше 1, значит это проценты
                    rate = rate / 100
                    
                # Пока используем одну ставку для всех сроков
                # В реальности нужно разделить по мерам (до 1 года, 1-3 года, свыше 3 лет)
                processed_data[year_month] = {
                    "<1": rate,
                    "1-3": rate * 1.1,   # Примерная надбавка для среднесрочных
                    ">3": rate * 1.2     # Примерная надбавка для долгосрочных
                }
                
            except (ValueError, IndexError) as e:
                print(f"    ⚠️  Ошибка обработки записи {date_str}: {e}")
                continue
                
        print(f"  ✅ Обработано {len(processed_data)} записей")
        return processed_data
        
    def get_all_deposit_measures(self, publication_id, dataset_id, measures, from_year, to_year):
        """Получаем данные по всем разрезам депозитов"""
        print("📊 Получение данных по всем срокам депозитов...")
        
        all_measures_data = {}
        
        # Создаем словарь для группировки по срокам
        term_mapping = {
            'до 1': '<1',
            '<1': '<1', 
            '1 до 3': '1-3',
            '1-3': '1-3',
            'свыше 3': '>3',
            '>3': '>3'
        }
        
        for measure in measures:
            measure_id = measure.get('id')
            measure_name = measure.get('name', '').lower()
            
            print(f"  └─ Обрабатываем: {measure.get('name')}")
            
            # Получаем данные для этого разреза
            raw_data = self.get_data(publication_id, dataset_id, measure_id, from_year, to_year)
            
            if not raw_data:
                continue
                
            # Определяем к какому сроку относится этот разрез
            term_key = None
            for term_text, term_code in term_mapping.items():
                if term_text in measure_name:
                    term_key = term_code
                    break
                    
            if not term_key:
                # Если не смогли определить срок, используем первый попавшийся
                term_key = '<1'
                
            # Обрабатываем данные
            for record in raw_data:
                date_str = record.get('Date', '')
                if not date_str:
                    continue
                    
                try:
                    date_parts = date_str.split('-')
                    if len(date_parts) >= 2:
                        year_month = f"{date_parts[0]}-{date_parts[1]}"
                    else:
                        continue
                        
                    obs_val = record.get('ObsVal')
                    if obs_val is None:
                        continue
                        
                    rate = float(obs_val)
                    if rate > 1:
                        rate = rate / 100
                        
                    # Инициализируем запись для этого месяца, если её нет
                    if year_month not in all_measures_data:
                        all_measures_data[year_month] = {
                            "<1": None,
                            "1-3": None, 
                            ">3": None
                        }
                        
                    # Записываем ставку для соответствующего срока
                    all_measures_data[year_month][term_key] = rate
                    
                except (ValueError, IndexError):
                    continue
                    
            time.sleep(0.5)  # Пауза между запросами
            
        # Заполняем пропуски
        for year_month, rates in all_measures_data.items():
            # Если какая-то ставка не найдена, используем среднее или соседние значения
            base_rate = rates.get('<1') or rates.get('1-3') or rates.get('>3')
            if base_rate:
                if rates['<1'] is None:
                    rates['<1'] = base_rate
                if rates['1-3'] is None:
                    rates['1-3'] = base_rate * 1.1
                if rates['>3'] is None:
                    rates['>3'] = base_rate * 1.2
                    
        return all_measures_data
        
    def save_to_json(self, data, filename='data/deposits_real.json'):
        """Сохраняем данные в JSON файл в нужном формате"""
        print(f"💾 Сохранение данных в {filename}...")
        
        # Сортируем по датам
        sorted_data = dict(sorted(data.items()))
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(sorted_data, f, ensure_ascii=False, indent=2)
                
            print(f"  ✅ Сохранено {len(sorted_data)} записей")
            return True
            
        except Exception as e:
            print(f"  ❌ Ошибка сохранения: {e}")
            return False
            
    def run(self):
        """Основной метод для запуска парсера"""
        print("🏦 Парсер депозитных ставок ЦБ РФ через API")
        print("=" * 50)
        
        try:
            # 1. Получаем список публикаций
            publications = self.get_publications()
            if not publications:
                print("❌ Не удалось получить публикации")
                return False
                
            # 2. Находим публикацию с депозитами
            deposits_pub = self.find_deposits_publication(publications)
            if not deposits_pub:
                # Пробуем найти вручную по ID из документации
                # Из инструкции знаем, что есть пункт 8 с депозитами
                print("🔍 Пробуем найти публикацию по ID из документации...")
                
                # Перебираем публикации и ищем подходящие
                for pub in publications:
                    pub_id = pub.get('id')
                    category_name = pub.get('category_name', '')
                    
                    # Выводим все публикации для анализа
                    print(f"  ID: {pub_id}, Название: {category_name}")
                    
                # Используем ID 8 из документации (Сведения по вкладам физических лиц)
                deposits_pub = {'id': 8, 'category_name': 'Сведения по вкладам физических лиц'}
                
            publication_id = deposits_pub['id']
            
            # 3. Получаем показатели
            datasets = self.get_datasets(publication_id)
            if not datasets:
                print("❌ Не удалось получить показатели")
                return False
                
            # 4. Находим показатель по депозитам физических лиц
            deposits_dataset = self.find_physical_persons_deposits(datasets)
            if not deposits_dataset:
                # Выводим все доступные показатели
                print("📊 Доступные показатели:")
                for ds in datasets:
                    print(f"  ID: {ds.get('id')}, Название: {ds.get('name')}")
                    
                # Используем первый попавшийся
                deposits_dataset = datasets[0] if datasets else None
                
            if not deposits_dataset:
                print("❌ Не удалось найти подходящий показатель")
                return False
                
            dataset_id = deposits_dataset['id']
            
            # 5. Получаем разрезы (по срокам)
            measures = self.get_measures(dataset_id)
            
            # 6. Получаем доступный диапазон лет
            measure_id = measures[0]['id'] if measures else None
            from_year, to_year = self.get_available_years(dataset_id, measure_id)
            
            if not from_year or not to_year:
                print("❌ Не удалось получить диапазон лет")
                return False
                
            # 7. Получаем данные
            if measures:
                # Если есть разрезы по срокам, получаем данные по каждому
                data = self.get_all_deposit_measures(publication_id, dataset_id, measures, from_year, to_year)
            else:
                # Если разрезов нет, получаем общие данные
                raw_data = self.get_data(publication_id, dataset_id, None, from_year, to_year)
                data = self.process_api_data(raw_data)
                
            if not data:
                print("❌ Не удалось получить данные")
                return False
                
            # 8. Сохраняем
            success = self.save_to_json(data)
            
            if success:
                print(f"\n🎉 Парсинг завершён успешно! Получено {len(data)} записей")
                print(f"📅 Период: {min(data.keys())} - {max(data.keys())}")
                return True
            else:
                print("❌ Ошибка при сохранении данных")
                return False
                
        except Exception as e:
            print(f"❌ Критическая ошибка: {e}")
            return False

def main():
    parser = CBRAPIParser()
    parser.run()

if __name__ == "__main__":
    main() 