import { useCallback } from 'react';

interface YandexMetrikaEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
}

export const useYandexMetrika = (metrikaId?: string) => {
  const id = metrikaId ? parseInt(metrikaId) : null;

  // Отправка цели (конверсии)
  const reachGoal = useCallback((goalName: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.ym && id) {
      window.ym(id, 'reachGoal', goalName, params);
    }
  }, [id]);

  // Отправка события
  const sendEvent = useCallback((event: YandexMetrikaEvent) => {
    if (typeof window !== 'undefined' && window.ym && id) {
      window.ym(id, 'hit', window.location.href, {
        params: {
          action: event.action,
          category: event.category,
          label: event.label,
          value: event.value
        }
      });
    }
  }, [id]);

  // Отправка пользовательских параметров
  const setUserParams = useCallback((params: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.ym && id) {
      window.ym(id, 'userParams', params);
    }
  }, [id]);

  // Отслеживание скачиваний файлов
  const trackDownload = useCallback((fileName: string, fileType?: string) => {
    reachGoal('file_download', {
      fileName,
      fileType
    });
  }, [reachGoal]);

  // Отслеживание использования калькуляторов
  const trackCalculatorUse = useCallback((calculatorType: string, params?: Record<string, any>) => {
    reachGoal('calculator_use', {
      calculatorType,
      ...params
    });
  }, [reachGoal]);

  // Отслеживание кликов по внешним ссылкам
  const trackExternalLink = useCallback((url: string, linkText?: string) => {
    reachGoal('external_link_click', {
      url,
      linkText
    });
  }, [reachGoal]);

  return {
    reachGoal,
    sendEvent,
    setUserParams,
    trackDownload,
    trackCalculatorUse,
    trackExternalLink,
    isEnabled: !!id
  };
}; 