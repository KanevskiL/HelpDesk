async function fetchFAQ() {
  const { BASE_URL, API_KEY } = HelpDeskConfig;

  const headers = {
    Accept: 'application/json',
  };

  if (API_KEY) {
    headers.Authorization = `Bearer ${API_KEY}`;
  }

  try {
    const response = await fetch(BASE_URL, { method: 'GET', headers });

    if (!response.ok) {
      let detail = response.statusText;
      try {
        const errBody = await response.json();
        detail = errBody.error?.message || errBody.message || detail;
      } catch (_) {}
      throw new Error(`HTTP ${response.status}: ${detail}`);
    }

    return await response.json();
  } catch (error) {
    console.error('fetchFAQ:', error);
    throw error;
  }
}
