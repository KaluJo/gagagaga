import React, { useState, useEffect } from 'react';
import { InputGroup, PartOfSpeechButton, PartOfSpeechContainer, StyledSelect, Label, TranslationCard, Input, Button, TranslationGroup, TranslationLabel, StyledInput } from './styles';
import pinyin from 'pinyin';
import { getTranslation } from './utils';

import OpenAIApi from 'openai';

interface DEWord {
  DE_word: string;
  EN_word: string;
  DE_sentence: string;
  EN_sentence: string;
  memorization: number;
  notes: string[];
  gender: 'm' | 'f' | 'n' | 'N/A';
}

interface DEGroup {
  name: string;
  words: DEWord[];
}

interface Word {
  JA: string;
  furigana: string;
  KO: string;
  EN: string;
  ZH: string;
  ZH_pinyin?: string;
  FR: string;
  memorization: number;
  notes: string[];
  partOfSpeech: 'Verb' | 'Grammar' | 'Phrase' | 'Noun' | 'Descriptor';
}

interface Group {
  name: string;
  words: Word[];
}

interface AddPageProps {
  groups: DEGroup[];
  setGroups: React.Dispatch<React.SetStateAction<DEGroup[]>>;
}

const AddPageDE: React.FC<AddPageProps> = ({ groups, setGroups }) => {
  const [text, setText] = useState<string>('');
  const [translations, setTranslations] = useState<DEWord[]>([]);
  const [currentGroupName, setCurrentGroupName] = useState<string>('');
  const [creatingNewGroup, setCreatingNewGroup] = useState(true);
  const [partOfSpeeches, setPartOfSpeeches] = useState<string[]>([]);
  const partOfSpeechOptions = ['Verb', 'Grammar', 'Phrase', 'Noun', 'Descriptor'];

  const openai = new OpenAIApi({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const handleBulkTranslate = async () => {
    const words = text.split(/,+/); // Split by comma and whitespace

    let germanSentences = [];

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: 'system', content: 'You are a German teacher that takes comma-separated German words with and returns an array of sentences, with each sentence corresponding to each word in the given list.' },
          { role: 'user', content: `Given this list of comma-separated German words, generate useful sentences highlighting it's usage, for example with correct article conjugation and adjective conjugation: die Ente, der Rock` },
          { role: 'assistant', content: '["Kannst du die gelbe Ente im Wasser sehen?","Der Rock, den sie trägt, ist sehr elegant."]' },
          { role: 'user', content: `Given this list of comma-separated German words, generate useful sentences highlighting it's usage, for example with correct article conjugation and adjective conjugation: ${text}` }
        ]
      });

      const germanResponse = response.choices[0].message.content;

      const cleanedResponse = germanResponse.replace(/[\[\]]/g, '');

      const regex = /"(.*?)"/g;
      let match;

      while ((match = regex.exec(cleanedResponse)) !== null) {
        germanSentences.push(match[1]);
      }

      console.log(germanSentences);
    } catch (error) {
      console.error("Error fetching sentences:", error);
    }

    if (germanSentences.length !== words.length) {
      console.log(germanSentences);
      console.log(words);
      console.log("Error with response!");
      return;
    }

    let newTranslations = [...translations];

    for (let i = 0; i < words.length; i++) {
      let germanSentence = germanSentences[i];
      let englishWord = await getTranslation(words[i], 'DE', 'EN');
      let englishSentence = await getTranslation(germanSentence, 'DE', 'EN');

      if (words[i] && germanSentence && englishSentence) {
        newTranslations.push({
          DE_word: words[i],
          EN_word: englishWord.translations[0].text,
          DE_sentence: germanSentence,
          EN_sentence: englishSentence.translations[0].text,
          memorization: 0.0,
          notes: [],
          gender: 'N/A'
        });
      }
    }
    console.log(newTranslations);
    setTranslations(newTranslations);
  };

  const updateTranslation = (index, lang, value) => {
    setTranslations(prevTranslations => {
      let updatedTranslations = [...prevTranslations];
      updatedTranslations[index][lang] = value;
      return updatedTranslations;
    });
  };

  const addToGroup = async () => {
    let existingGroup: DEGroup | undefined;
    if (Array.isArray(groups)) {
      existingGroup = groups.find(group => group.name === currentGroupName);
    }

    const newWords = translations.filter(
      trans => !existingGroup?.words.some(word => word.DE_word === trans.DE_word)
    );

    if (existingGroup) {
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.name === currentGroupName ? { ...group, words: [...group.words, ...newWords] } : group
        )
      );

      const updatedWords = existingGroup ? [...existingGroup.words, ...newWords] : newWords;

      const response = await fetch('/.netlify/functions/updateGroupDE', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: currentGroupName, words: updatedWords })
      });
      if (!response.ok) {
        console.error('Failed to update group', response);
      }
    } else {
      setGroups(Array.isArray(groups) ? [...groups, { name: currentGroupName, words: newWords }] : [{ name: currentGroupName, words: newWords }]);

      const response = await fetch('/.netlify/functions/insertGroupDE', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: currentGroupName, words: newWords })
      });
      if (!response.ok) {
        console.error('Failed to insert group', response);
      }
    }
    setTranslations([]);
  };

  return (
    <>
      <InputGroup>
        <Input
          id="text-input"
          type="text"
          placeholder="Input words (in German), separated by commas"
          value={text}
          onChange={e => setText(e.target.value)}
        />
      </InputGroup>

      <Button onClick={handleBulkTranslate}>Translate</Button>

      {translations.map((trans, index) => (
        <TranslationGroup key={index}>

          <PartOfSpeechContainer>
            {['m', 'f', 'n', 'N/A'].map((genderOption) => (
              <PartOfSpeechButton
                key={genderOption}
                isActive={trans.gender === genderOption}
                onClick={() => {
                  const updatedTranslations = [...translations];
                  updatedTranslations[index].gender = genderOption as any;
                  setTranslations(updatedTranslations);
                }}
              >
                {genderOption === 'm' ? 'Male' :
                  genderOption === 'f' ? 'Female' :
                    genderOption === 'n' ? 'Neutral' : 'N/A'}
              </PartOfSpeechButton>
            ))}
          </PartOfSpeechContainer>

          <TranslationCard>
            <TranslationLabel>Deutsch</TranslationLabel>
            <StyledInput value={trans.DE_word} onChange={e => updateTranslation(index, 'DE_word', e.target.value)} />
          </TranslationCard>

          <TranslationCard>
            <TranslationLabel>English</TranslationLabel>
            <StyledInput value={trans.EN_word} onChange={e => updateTranslation(index, 'EN_word', e.target.value)} />
          </TranslationCard>

          <TranslationCard>
            <TranslationLabel>Satz auf Deutsch</TranslationLabel>
            <StyledInput value={trans.DE_sentence} onChange={e => updateTranslation(index, 'DE_sentence', e.target.value.split(', '))} />
          </TranslationCard>

          <TranslationCard>
            <TranslationLabel>Sentence in English</TranslationLabel>
            <StyledInput value={trans.EN_sentence} onChange={e => updateTranslation(index, 'EN_sentence', e.target.value.split(', '))} />
          </TranslationCard>
        </TranslationGroup>
      ))}

      <InputGroup>
        <StyledSelect
          id="group-selection"
          value={creatingNewGroup ? "newGroup" : currentGroupName}
          onChange={e => {
            if (e.target.value === "newGroup") {
              setCreatingNewGroup(true);
              setCurrentGroupName('');
            } else {
              setCreatingNewGroup(false);
              setCurrentGroupName(e.target.value);
            }
          }}
        >
          {groups.map(group => (
            <option key={group.name} value={group.name}>
              {group.name}
            </option>
          ))}
          <option value="newGroup">Create New Group</option>
        </StyledSelect>
      </InputGroup>

      {creatingNewGroup && (
        <InputGroup>
          <Input
            id="group-name-input"
            type="text"
            placeholder="New Group Name"
            value={currentGroupName}
            onChange={e => setCurrentGroupName(e.target.value)}
          />
        </InputGroup>
      )}

      <Button onClick={addToGroup}>Add to Group</Button>
    </>
  );
}

export default AddPageDE;