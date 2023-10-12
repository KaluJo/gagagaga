import React, { useState, useEffect, useCallback, useRef } from 'react';

import { Button, Input, TypeTestInput, WordCard, Title, Translation, Progress, ProgressBarContainer, ProgressBar } from './styles';

import { useLocation, useNavigate } from 'react-router-dom';
import { getTranslation } from './utils';

import OpenAIApi from 'openai';

interface Word {
  JA: string;
  KO: string;
  EN: string;
  ZH: string;
  ZH_pinyin?: string;
  FR: string;
  memorization: number;
  notes: string[];
}

interface Group {
  name: string;
  words: Word[];
}

interface Sentence {
  JA: string;
  furigana: string;
  KO: string;
  EN: string;
  ZH: string;
  FR: string;
  memorization: number;
  notes: string[];
}

interface Sentences {
  name: string;
  sentences: Sentence[];
}

interface UnderstandProps {
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  sentences: Sentences[];
  setSentences: React.Dispatch<React.SetStateAction<Sentences[]>>;
}

interface UnderstandLocationState {
  groupName: string;
  testType: string;
}

const Understand: React.FC<UnderstandProps> = ({ groups, setGroups, sentences, setSentences }) => {
  const location = useLocation();
  const state = location.state as UnderstandLocationState;

  const [groupSentences, setGroupSentences] = useState<Sentence[]>([]);

  const { groupName, testType } = state;

  const navigate = useNavigate();

  if (!groups || !sentences) {
    navigate('/groups');
  }

  const [currentWords, setCurrentWords] = useState<Word[]>(shuffleArray(groups.find(group => group.name === groupName)?.words || []));
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  const [inputTranslations, setInputTranslations] = useState<{ [key: string]: string }>({});

  const hasInitialized = useRef(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (!groups || !sentences) {
      navigate('/groups');
    }

    const matchingSentences = sentences.find(s => s.name === groupName);
    if (matchingSentences) {
      setGroupSentences(matchingSentences.sentences);

      const initialTranslations: { [key: string]: string } = {};
      matchingSentences.sentences.forEach(sentence => {
        if (sentence.EN) {
          initialTranslations[sentence.JA] = sentence.EN;
        }
      });
      setInputTranslations(initialTranslations);
    }
  }, [groupName, sentences]);

  const extractSentenceAndFurigana = (text) => {
    const match = text.match(/(.*?)\((.*?)\)/);
    if (!match) return { sentence: text, furigana: "" };

    const sentence = match[1].trim();
    const furigana = match[2].trim();
    return { sentence, furigana };
  };

  const handleGenerateSentence = async () => {
    const maxWords = 20;
    const selectedWords = shuffleArray(currentWords).slice(0, maxWords).map(word => word.JA);
    const promptContent = `Generate 7 natural sentences (a sentence can have multiple sentences, up to 5) in Japanese using at least 7 of these words, formatting the sentences in array format, including the correct furigana in parentheses beside the sentence: ${selectedWords.join(", ")}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: 'system', content: 'You are an assistant that creates natural sentences based on a Japanese word for the purpose of language learning to fluency, returning an array of 5 sentences, including the correct furigana reading in parentheses.' },
          { role: 'user', content: `Generate 5 natural sentences in Japanese using at least 5 of these words, formatting the sentences in array format, including the correct furigana in parentheses beside the sentence: 食べる, とっても, 難しい, ありがとうございます` },
          { role: 'assistant', content: "['この問題はとっても難しいです。(このもんだいはとってもむずかしいです。)','昨日の晩御飯を食べるのがとっても楽しかった。(きのうのばんごはんをたべるのがとってもたのしかった)','難しい問題を解決してくれて、ありがとうございます。(むずかしいもんだいをかいけつしてくれて、ありがとうございます。)','私は新しい料理を食べるのがとっても好きです。(わたしはあたらしいりょうりをたべるのがとってもすきです。)','このゲームは食べることが関連していて、とっても難しいです。(このげーむはたべることがかんれんしていて、とってもむずかしいです。)']" },
          { role: 'user', content: promptContent }
        ]
      });

      let generatedSentencesData = response.choices[0].message.content.split(',').map(text => {
        // Cleaning up any unwanted characters before parsing
        const cleanedText = text.replace(/[\[\]'"A-Za-z]/g, "").trim();
        return extractSentenceAndFurigana(cleanedText);
      });

      const newSentences = await Promise.all(generatedSentencesData.map(async ({ sentence, furigana }) => {
        const korean = await getTranslation(sentence, 'JA', 'KO');
        return {
          JA: sentence,
          furigana: furigana,
          EN: "",
          KO: korean.translations[0].text,
          ZH: "",
          FR: "",
          memorization: 0,
          notes: []
        };
      }));

      setGroupSentences(prev => [...prev, ...newSentences]);
    } catch (error) {
      console.error("Error fetching sentences:", error);
    }
  };

  const openai = new OpenAIApi({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled: T[] = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  useEffect(() => {
    if (testType === "Type") {
      inputRefs.current[activeWordIndex]?.focus();
    }
  }, [activeWordIndex, testType]);

  if (!currentWords) {
    return <div>Error: Group not found</div>;
  }

  const handleNext = () => {
    setActiveWordIndex((prevIndex) => (prevIndex + 1) % currentWords.length);
  };

  const handleSave = async () => {
    const updatedSentences = groupSentences.map(sentence => {
      if (inputTranslations[sentence.JA]) {
        return { ...sentence, EN: inputTranslations[sentence.JA] };
      }
      return sentence;
    });

    const endpoint = sentences.find(s => s.name === groupName)
      ? "/.netlify/functions/updateSentences"
      : "/.netlify/functions/insertSentences";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: groupName,
          sentences: updatedSentences
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error saving sentences.");
      }

      setSentences(prevSentences => {
        const otherSentences = prevSentences.filter(s => s.name !== groupName);
        return [...otherSentences, { name: groupName, sentences: updatedSentences }];
      });

      navigate('/groups');
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteSentence = (sentenceToDelete: string) => {
    setGroupSentences(prev => prev.filter(sentence => sentence.JA !== sentenceToDelete));
  };

  return (
    <>
      <Button onClick={handleGenerateSentence}>Generate Sentences</Button>
      {groupSentences.map((sentence, index) => (
        <WordCard style={{ width: '100%' }} key={index}>
          <Title>{sentence.JA}</Title>
          <Translation style={{ marginTop: -10 }}>{sentence.furigana}</Translation>
          <Translation style={{ marginTop: -10 }}>{sentence.KO}</Translation>
          <Input
            style={{ width: '96%', marginBottom: 5 }}
            placeholder="Type English translation..."
            value={inputTranslations[sentence.JA] || ''}
            onChange={(e) => setInputTranslations(prev => ({ ...prev, [sentence.JA]: e.target.value }))}
          />
          <Button onClick={() => handleDeleteSentence(sentence.JA)}>Delete</Button> {/* Delete button next to each sentence */}
        </WordCard>
      ))}

      <Button style={{ marginTop: 20 }} onClick={handleSave}>Save Progress</Button>
    </>
  );
}

export default Understand;