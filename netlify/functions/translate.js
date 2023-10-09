const axios = require('axios');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { text, sourceLang, targetLang } = JSON.parse(event.body);
    const apiKey = process.env.DEEPL_API_KEY;

    try {
        const response = await axios.post(`https://api-free.deepl.com/v2/translate`, 
        {
            text: [text],
            source_lang: sourceLang,
            target_lang: targetLang
        },
        {
            headers: {
                'Authorization': `DeepL-Auth-Key ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        return { statusCode: 200, body: JSON.stringify(response.data) };
    } catch (error) {
        return { 
            statusCode: error.response?.status || 500, 
            body: JSON.stringify(error.response?.data || {}) 
        };
    }
};