/**
 * Вспомогательные функции для sessionStorage (сессионные данные вкладки).
 * Для ЛР: базовое сохранение/чтение строковых или JSON-данных.
 */
function saveToSession(key, data) {
  try {
    sessionStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
  } catch (e) {
    console.error('saveToSession:', e);
    throw e;
  }
}

function getFromSession(key, parseJson) {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw === null) return null;
    return parseJson ? JSON.parse(raw) : raw;
  } catch (e) {
    console.warn('getFromSession:', key, e);
    return null;
  }
}

function removeFromSession(key) {
  try {
    sessionStorage.removeItem(key);
  } catch (e) {
    console.error('removeFromSession:', e);
  }
}
