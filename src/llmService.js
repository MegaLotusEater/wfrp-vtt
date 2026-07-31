const GM_ENDPOINT = 'http://localhost:8787/api/gm';

export async function sendMessageToGM(chatHistory) {
  try {
    const response = await fetch(GM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chatHistory }),
    });

    const payload = await response.json();

    if (!response.ok) {
      return `SYSTEM ERROR: The Virtual GM is offline. ${payload?.error ? `(${payload.error})` : ''}`;
    }

    return payload.text;
  } catch (error) {
    console.error('AI Generation Error:', error);
    return 'SYSTEM ERROR: The Virtual GM is offline. Please start the local Gemini proxy server.';
  }
}
