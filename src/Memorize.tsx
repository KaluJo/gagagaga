import React, { useState, useEffect, useCallback, useRef } from 'react';

import { Button, TypeTestInput, WordCard, Title, Translation, Progress, ProgressBarContainer, ProgressBar } from './styles';

import { useLocation, useNavigate } from 'react-router-dom';
import { getTranslation } from './utils';

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

  const [currentWords, setCurrentWords] = useState<Word[]>(shuffleArray(groups.find(group => group.name === groupName)?.words || []));
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [revealTranslation, setRevealTranslation] = useState<{ [key: string]: boolean }>({});
  const [evaluationStatus, setEvaluationStatus] = useState<{ [key: string]: 'correct' | 'incorrect' }>({});

  const [hoveredWordIndex, setHoveredWordIndex] = useState<number | null>(null);
  const wordCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const navigate = useNavigate();
  const consecutiveEnters = useRef(0);

  const hasInitialized = useRef(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled: T[] = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap the elements
    }
    return shuffled;
  }

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
    const handleSpace = (event: KeyboardEvent) => {
      const currentRevealStatus = revealTranslation[currentWords[activeWordIndex].JA];
      if (event.code === "Space" || event.code === "KeyM") {
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
    setActiveWordIndex(prevIndex => {
      const nextIndex = (prevIndex + 1) % currentWords.length;
      wordCardRefs.current[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return nextIndex;
    });
  };

  const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>, correctAnswer: string, alternateAnswer: string) => {
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

    const isCorrect = evaluateTypedAnswer(typedValue, correctAnswer, alternateAnswer);
    setEvaluationStatus(prev => ({ ...prev, [correctAnswer]: isCorrect ? 'correct' : 'incorrect' }));

    inputElement.value = "";

    consecutiveEnters.current = 0;

    handleNext();
  };

  const evaluateTypedAnswer = (typedValue: string, correctAnswer: string, alternateAnswer: string): boolean => {
    const accuracy = calculateAccuracy(typedValue, correctAnswer, alternateAnswer);

    if (accuracy >= 0.75) {
      handleCorrectTyping(correctAnswer);
      return true;
    } else {
      handleIncorrectTyping(correctAnswer);
      return false;
    }
  };

  const speak = (text: string) => {
    const synth = window.speechSynthesis;

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';

    synth.speak(utterance);
  };

  const calculateAccuracy = (typed: string, correct: string, alt: string) => {
    let matchedChars = 0;
    let matchedAlt = 0;

    for (let i = 0; i < Math.min(typed.length, correct.length); i++) {
      if (typed[i] === correct[i]) matchedChars++;
    }

    for (let i = 0; i < Math.min(typed.length, alt.length); i++) {
      if (typed[i] === alt[i]) matchedAlt++;
    }
    return Math.max(matchedChars / correct.length, matchedAlt / alt.length);
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

    speak(currentWords[activeWordIndex].JA);

    const newWords = [...currentWords];
    newWords[activeWordIndex].memorization = Math.min(newWords[activeWordIndex].memorization + 0.05, 1);
    setCurrentWords(newWords);

    const updatedGroups = groups.map(g => g.name === groupName ? { ...g, words: newWords } : g);
    setGroups(updatedGroups);
  };

  return (
    <div style={{ marginBottom: 500 }}>
      {currentWords.map((word, index) => (
        <WordCard
          ref={(el) => wordCardRefs.current[index] = el}
          key={index}
          onClick={() => { setActiveWordIndex(index); speak(word.furigana); }}
          className={activeWordIndex === index ? 'active' : ''}
        >
          {testType === 'Flip' ? (
            <>
              <Title
                onMouseEnter={() => setHoveredWordIndex(index)}
                onMouseLeave={() => setHoveredWordIndex(null)}
              >
                {hoveredWordIndex === index ? word.furigana : word.JA}
              </Title>
              {revealTranslation[word.JA] && <Translation style={{ marginTop: -10, marginBottom: 25 }}>{word.KO}<br />{word.EN}<br />{word.ZH} {word.ZH_pinyin}<br />{word.FR}</Translation>}
            </>
          ) : (
            <>
              <Translation>{word.KO}<br />{word.EN}<br />{word.ZH} {word.ZH_pinyin}<br />{word.FR}</Translation>
              {revealTranslation[word.JA] ? (
                <Title
                  style={{
                    marginTop: 0,
                    color: evaluationStatus[word.JA] === 'correct' ? 'green' : evaluationStatus[word.JA] === 'incorrect' ? 'red' : '#ddd'
                  }}
                  onMouseEnter={() => setHoveredWordIndex(index)}
                  onMouseLeave={() => setHoveredWordIndex(null)}
                >
                  {hoveredWordIndex === index ? word.furigana : word.JA}
                </Title>
              ) : (
                testType === "Type" && (
                  <>
                    <TypeTestInput
                      key={word.JA}
                      ref={(el) => inputRefs.current[index] = el}
                      type="text"
                      onKeyDown={e => e.key === 'Enter' && handleEnterPress(e, word.JA, word.furigana)}
                    />
                  </>
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
    </div>
  );
}

export default Memorize;