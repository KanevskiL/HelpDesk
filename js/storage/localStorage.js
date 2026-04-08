/**
 * Кэширование данных FAQ в localStorage.
 * @param {string} key
 * @param {unknown} data — сериализуется через JSON.stringify
 */
function saveToCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('saveToCache:', e);
    throw e;
  }
}

/**
 * @param {string} key
 * @returns {unknown | null} Распарсенные данные или null, если ключа нет или JSON невалиден
 */
function getFromCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('getFromCache: неверный JSON для ключа', key, e);
    return null;
  }
}
