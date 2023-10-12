import React, { useState, useEffect } from 'react';
import { InputGroup, PartOfSpeechButton, PartOfSpeechContainer, StyledSelect, Label, TranslationCard, Input, Button, TranslationGroup, TranslationLabel, StyledInput } from './styles';
import pinyin from 'pinyin';
import { getTranslation } from './utils';

interface Word {
  JA: string;
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
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
}

const AddPage: React.FC<AddPageProps> = ({ groups, setGroups }) => {
  const [text, setText] = useState<string>('');
  const [translations, setTranslations] = useState<Word[]>([]);
  const [currentGroupName, setCurrentGroupName] = useState<string>('');
  const [creatingNewGroup, setCreatingNewGroup] = useState(false);
  const [partOfSpeeches, setPartOfSpeeches] = useState<string[]>([]);
  const partOfSpeechOptions = ['Verb', 'Grammar', 'Phrase', 'Noun', 'Descriptor'];

  const handleBulkTranslate = async () => {
    const words = text.split(/[\s,、]+/);
    console.log(words);

    let newTranslations = [...translations];

    for (let word of words) {
      let korean = await getTranslation(word, 'JA', 'KO');
      let english = await getTranslation(word, 'JA', 'EN');
      let chinese = await getTranslation(word, 'JA', 'ZH');
      let pinyinText = pinyin(chinese.translations[0].text, {
        style: pinyin.STYLE_TONE,
        heteronym: false,
        segment: true
      }).join(' ');

      let french = await getTranslation(word, 'JA', 'FR');

      if (korean && english && chinese) {
        newTranslations.push({
          JA: word,
          KO: korean.translations[0].text,
          EN: english.translations[0].text,
          ZH: chinese.translations[0].text,
          ZH_pinyin: pinyinText,
          FR: french.translations[0].text,
          memorization: 0.0,
          notes: [],
          partOfSpeech: 'Noun'
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
    let existingGroup: Group | undefined;
    if (Array.isArray(groups)) {
      existingGroup = groups.find(group => group.name === currentGroupName);
    }

    const newWords = translations.filter(
      trans => !existingGroup?.words.some(word => word.JA === trans.JA)
    );

    if (existingGroup) {
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.name === currentGroupName ? { ...group, words: [...group.words, ...newWords] } : group
        )
      );

      const updatedWords = existingGroup ? [...existingGroup.words, ...newWords] : newWords;

      const response = await fetch('/.netlify/functions/updateGroup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: currentGroupName, words: updatedWords })
      });
      if (!response.ok) {
        console.error('Failed to update group', response);
      }
    } else {
      setGroups(Array.isArray(groups) ? [...groups, { name: currentGroupName, words: newWords }] : [{ name: currentGroupName, words: newWords }]);

      const response = await fetch('/.netlify/functions/insertGroup', {
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
          placeholder="Input words or phrases (in Japanese), separated by commas"
          value={text}
          onChange={e => setText(e.target.value)}
        />
      </InputGroup>

      <Button onClick={handleBulkTranslate}>Translate</Button>

      {translations.map((trans, index) => (
        <TranslationGroup key={index}>

          <PartOfSpeechContainer>
            {partOfSpeechOptions.map((pos, posIndex) => (
              <PartOfSpeechButton
                key={pos}
                firstButton={posIndex === 0}
                isActive={trans.partOfSpeech === pos}
                onClick={() => {
                  const updatedTranslations = [...translations];
                  updatedTranslations[index].partOfSpeech = pos as any;
                  setTranslations(updatedTranslations);
                }}
              >
                {pos}
              </PartOfSpeechButton>
            ))}
          </PartOfSpeechContainer>

          <TranslationCard>
            <TranslationLabel>日本語</TranslationLabel>
            <StyledInput value={trans.JA} onChange={e => updateTranslation(index, 'JA', e.target.value)} />
          </TranslationCard>

          <TranslationCard>
            <TranslationLabel>한국어</TranslationLabel>
            <StyledInput value={trans.KO} onChange={e => updateTranslation(index, 'KO', e.target.value)} />
          </TranslationCard>

          <TranslationCard>
            <TranslationLabel>English</TranslationLabel>
            <StyledInput value={trans.EN} onChange={e => updateTranslation(index, 'EN', e.target.value)} />
          </TranslationCard>

          <TranslationCard>
            <TranslationLabel>普通话</TranslationLabel>
            <StyledInput value={trans.ZH} onChange={e => updateTranslation(index, 'ZH', e.target.value)} />
          </TranslationCard>

          <TranslationCard>
            <TranslationLabel>Français</TranslationLabel>
            <StyledInput value={trans.FR} onChange={e => updateTranslation(index, 'FR', e.target.value)} />
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

export default AddPage;