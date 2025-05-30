# Задача: Улучшение UX калькулятора теста заемщика

## Контекст
В проекте `/Users/timurhafizov/Desktop/Projects/calculator` есть рабочий калькулятор теста заемщика с компонентами:
- `pages/borrower.tsx` - основная страница
- `hooks/useBorrowerTest.ts` - логика расчетов
- `components/CreditAlert.tsx` - компонент уведомлений

## Проблемы для решения

### 1. Мобильная верстка результатов
**Проблема:** На мобильных устройствах слишком большое расстояние между подписями и значениями в секции результатов (когда блоки становятся в 1 колонку).

**Что исправить:**
- В `pages/borrower.tsx` найти блоки результатов (строки ~450-520)
- Уменьшить `space-y-1` до `space-y-0` в блоках результатов
- Оптимизировать `min-h-[44px]` для мобильных (возможно `min-h-[36px]` на `sm:`)
- Добавить более плотную верстку для мобильных

### 2. Плавающая кнопка-индикатор
**Требование:** Создать круглую плавающую кнопку, которая:
- Показывается после расчета уведомления
- Отображает иконку статуса кредитоспособности
- Цвет фона соответствует статусу (зеленый/желтый/оранжевый/красный)
- Позиционируется `fixed` справа снизу
- При клике скроллит к уведомлению

**Создать компонент:** `components/FloatingCreditButton.tsx`
```typescript
interface FloatingCreditButtonProps {
  alert: CreditAlert;
  onClick: () => void;
  isVisible: boolean;
}
```

### 3. Скролл к уведомлению
**Требование:** 
- Добавить `ref` к компоненту `CreditAlert`
- Создать функцию плавного скролла
- Привязать к клику плавающей кнопки

### 4. Анимации
**Требования:**
- Уведомление появляется с анимацией `slideUp` + `fadeIn`
- Плавающая кнопка появляется с `scale` + `bounce`
- Кнопка имеет пульсацию для привлечения внимания
- Плавный скролл с `smooth behavior`

## Технические требования

### ⚠️ КРИТИЧНО - НЕ СЛОМАТЬ:
1. **Не трогать логику расчетов** в `useBorrowerTest.ts`
2. **Не менять API хука** - только добавлять новые поля
3. **Сохранить все существующие стили** результатов
4. **Не ломать адаптивность** - только улучшать
5. **Тестировать на всех режимах** (monthly/amount/term)

### Безопасные изменения:
- Добавление новых компонентов
- Изменение `space-y` и `min-h` в результатах
- Добавление `ref` и функций скролла
- CSS анимации через Tailwind

### Структура файлов:
```
components/
├── CreditAlert.tsx (обновить с ref)
├── FloatingCreditButton.tsx (создать)

pages/
├── borrower.tsx (исправить мобильную верстку, добавить кнопку)

hooks/
├── useBorrowerTest.ts (НЕ ТРОГАТЬ логику, можно добавить ref)
```

### Пример интеграции:
```typescript
// В borrower.tsx
const alertRef = useRef<HTMLDivElement>(null);

const scrollToAlert = () => {
  alertRef.current?.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'center' 
  });
};

// Плавающая кнопка показывается только если:
// 1. Есть creditAlert
// 2. Уведомление не в viewport (опционально)
```

## Ожидаемый результат
1. ✅ Компактная мобильная верстка результатов
2. ✅ Красивая плавающая кнопка-индикатор
3. ✅ Плавный скролл к уведомлению
4. ✅ Анимации появления
5. ✅ Ничего не сломано в существующей функциональности

## Приоритет: Высокий
Задача улучшает UX без риска сломать рабочую логику. 