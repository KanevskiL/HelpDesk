/**
 * Ответ GET …/faq от My JSON Server — массив объектов { id, question, answer }.
 * Возвращает тот же смысл плюс source: 'Custom API'.
 */

/**
 * @param {unknown} raw — массив из API
 * @returns {Array<{ id: number | string, question: string, answer: string, source: string }>}
 */
function parseFAQData(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item, index) => {
      const row = /** @type {{ id?: unknown, question?: unknown, answer?: unknown }} */ (item);
      return {
        id: row.id != null ? row.id : index,
        question: String(row.question ?? '').trim(),
        answer: String(row.answer ?? '').trim(),
        source: 'Custom API',
      };
    })
    .filter((row) => row.question.length > 0 || row.answer.length > 0);
}
