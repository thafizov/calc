// Утилита для правильных путей с basePath
export const getAssetPath = (path: string): string => {
  // В режиме разработки basePath не используется
  if (process.env.NODE_ENV === 'development') {
    return path;
  }
  
  // В продакшене добавляем basePath
  return `/calc${path}`;
};

// Специально для данных - пробуем всегда использовать basePath
export const getDataPath = (path: string): string => {
  // В development данные доступны напрямую
  if (process.env.NODE_ENV === 'development') {
    return path;
  }
  // В продакшене добавляем basePath
  return `/calc${path}`;
}; 