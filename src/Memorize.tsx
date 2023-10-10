import React, { useState, useEffect, useCallback, useRef } from 'react';

import { Button, TypeTestInput, WordCard, Title, Translation, Progress, ProgressBarContainer, ProgressBar } from './styles';

import { useLocation, useNavigate } from 'react-router-dom';

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

interface MemorizeProps {
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
}

interface MemorizeLocationState {
  groupName: string;
  testType: string;
}

const Memorize: React.FC<MemorizeProps> = ({ groups, setGroups }) => {
  const location = useLocation();
  const state = location.state as MemorizeLocationState;
  const { groupName, testType } = state;

  const [currentWords, setCurrentWords] = useState<Word[]>(groups.find(group => group.name === groupName)?.words || []);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [revealTranslation, setRevealTranslation] = useState<{ [key: string]: boolean }>({});
  const [evaluationStatus, setEvaluationStatus] = useState<{ [key: string]: 'correct' | 'incorrect' }>({});

  const navigate = useNavigate();
  const consecutiveEnters = useRef(0);

  const hasInitialized = useRef(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (currentWords) {
      const initialRevealStatus: { [key: string]: boolean } = {};
      currentWords.forEach(word => {
        initialRevealStatus[word.JA] = false;
      });
      setRevealTranslation(initialRevealStatus);

      hasInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (testType === "Type") {
      inputRefs.current[activeWordIndex]?.focus();
    }
  }, [activeWordIndex, testType]);

  useEffect(() => {
    if (testType === "Type") {
      inputRefs.current[activeWordIndex]?.focus();
    }
  }, [activeWordIndex, testType]);

  useEffect(() => {
    const handleSpace = (event: KeyboardEvent) => {
      const currentRevealStatus = revealTranslation[currentWords[activeWordIndex].JA];
      if (event.code === "Space") {
        if (currentRevealStatus) {
          handleNext();
        } else {
          handleReveal();
        }
      }
    };

    window.addEventListener('keydown', handleSpace);

    return () => {
      window.removeEventListener('keydown', handleSpace);
    };
  }, [activeWordIndex, currentWords]);

  if (!currentWords) {
    return <div>Error: Group not found</div>;
  }

  const handleNext = () => {
    setActiveWordIndex((prevIndex) => (prevIndex + 1) % currentWords.length);
  };

  const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>, correctAnswer: string) => {
    if (e.key !== 'Enter') {
      consecutiveEnters.current = 0;
      return;
    }

    consecutiveEnters.current++;

    if (consecutiveEnters.current < 2) {
      return;
    }

    const inputElement = e.target as HTMLInputElement;
    const typedValue = inputElement.value;

    const isCorrect = evaluateTypedAnswer(typedValue, correctAnswer);
    setEvaluationStatus(prev => ({ ...prev, [correctAnswer]: isCorrect ? 'correct' : 'incorrect' }));

    inputElement.value = "";

    consecutiveEnters.current = 0;

    handleNext();
  };

  const evaluateTypedAnswer = (typedValue: string, correctAnswer: string): boolean => {
    const accuracy = calculateAccuracy(typedValue, correctAnswer);

    if (accuracy >= 0.75) {
      handleCorrectTyping(correctAnswer);
      return true;
    } else {
      handleIncorrectTyping(correctAnswer);
      return false;
    }
  };

  const calculateAccuracy = (typed: string, correct: string) => {
    let matchedChars = 0;
    for (let i = 0; i < Math.min(typed.length, correct.length); i++) {
      if (typed[i] === correct[i]) matchedChars++;
    }
    return matchedChars / correct.length;
  };

  const handleCorrectTyping = (correctAnswer: string) => {
    const newRevealStatus = { ...revealTranslation, [correctAnswer]: true };
    setRevealTranslation(newRevealStatus);

    const newWords = [...currentWords];
    const index = newWords.findIndex(w => w.JA === correctAnswer);
    newWords[index].memorization = Math.min(newWords[index].memorization + 0.1, 1);
    setCurrentWords(newWords);
  };

  const handleIncorrectTyping = (correctAnswer: string) => {
    const newRevealStatus = { ...revealTranslation, [correctAnswer]: true };
    setRevealTranslation(newRevealStatus);

    const newWords = [...currentWords];
    const index = newWords.findIndex(w => w.JA === correctAnswer);
    newWords[index].memorization = Math.max(newWords[index].memorization - 0.2, 0);
    setCurrentWords(newWords);
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/.netlify/functions/updateGroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: groupName,
          words: currentWords
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong while saving.");
      }

      console.log(data.message);

      navigate('/groups');

    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleReveal = () => {
    const newRevealStatus = { ...revealTranslation, [currentWords[activeWordIndex].JA]: true };
    setRevealTranslation(newRevealStatus);

    const newWords = [...currentWords];
    newWords[activeWordIndex].memorization = Math.min(newWords[activeWordIndex].memorization + 0.05, 1);
    setCurrentWords(newWords);

    const updatedGroups = groups.map(g => g.name === groupName ? { ...g, words: newWords } : g);
    setGroups(updatedGroups);
  };

  return (
    <>
      {currentWords.map((word, index) => (
        <WordCard
          key={index}
          onClick={() => { setActiveWordIndex(index); }}
          className={activeWordIndex === index ? 'active' : ''}
        >
          {testType === 'Flip' ? (
            <>
              <Title>{word.JA}</Title>
              {revealTranslation[word.JA] && <Translation style={{ marginTop: -10, marginBottom: 25 }}>{word.KO}<br />{word.EN}<br />{word.ZH} {word.ZH_pinyin}<br />{word.FR}</Translation>}
            </>
          ) : (
            <>
              <Translation>{word.KO}<br />{word.EN}<br />{word.ZH} {word.ZH_pinyin}<br />{word.FR}</Translation>
              {revealTranslation[word.JA] ? (
                <Title style={{
                  marginTop: 0,
                  color: evaluationStatus[word.JA] === 'correct' ? 'green' : evaluationStatus[word.JA] === 'incorrect' ? 'red' : '#ddd'
                }}>{word.JA}</Title>
              ) : (
                testType === "Type" && (
                  <TypeTestInput
                    key={word.JA}
                    ref={(el) => inputRefs.current[index] = el}
                    type="text"
                    onKeyDown={e => e.key === 'Enter' && handleEnterPress(e, word.JA)}
                  />
                )
              )}
            </>
          )}
          <ProgressBarContainer>
            <ProgressBar width={word.memorization * 100} />
          </ProgressBarContainer>
        </WordCard>
      ))}
      <Button style={{ marginTop: 20 }} onClick={handleSave}>Save Progress</Button>
    </>
  );
}

export default Memorize;