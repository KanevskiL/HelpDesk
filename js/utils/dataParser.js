function parseFAQData(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item, index) => {
      const row = item && typeof item === 'object' ? item : {};
      return {
        id: row.id != null ? row.id : index,
        question: String(row.question ?? '').trim(),
        answer: String(row.answer ?? '').trim(),
        source: 'Custom API',
      };
    })
    .filter((row) => row.question.length > 0 || row.answer.length > 0);
}
