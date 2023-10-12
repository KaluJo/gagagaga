export const getTranslation = async (text, sourceLang, targetLang) => {
    const response = await fetch('/.netlify/functions/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        sourceLang: sourceLang,
        targetLang: targetLang
      })
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error('Failed to translate', response);
      return null;
    }
  };
