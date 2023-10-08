import React, { useState } from 'react';
import { Container, InputGroup, Label, Input, Button, TranslationBox } from './styles';

// i am going to try to become a 2-spacer
// ._.

function App() {
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');

  const handleTranslate = async () => {
    const response = await fetch('/.netlify/functions/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        sourceLang: 'en',
        targetLang: 'ko'
      })
    });

    if (response.ok) {
      const data = await response.json();
      setTranslatedText(data.message.result.translatedText);
    } else {
      console.error('Failed to translate');
    }
  };

  return (
    <Container>
      <h1>gagagaga</h1>

      <InputGroup>
        <Label htmlFor="text-input">Enter Text:</Label>
        <Input
          id="text-input"
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
        />
      </InputGroup>

      <Button onClick={handleTranslate}>Translate</Button>

      {translatedText && (
        <TranslationBox>
          <strong>Translated:</strong> {translatedText}
        </TranslationBox>
      )}
    </Container>
  );
}

export default App;