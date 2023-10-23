import React, { useState, useEffect, useCallback, useRef } from 'react';

import { Button, TypeTestInput, WordCard, Title, Translation, Progress, ProgressBarContainer, ProgressBar } from './styles';

import { useLocation, useNavigate } from 'react-router-dom';
import { getTranslation } from './utils';

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

interface DEMemorizeProps {
  groups: DEGroup[];
  setGroups: React.Dispatch<React.SetStateAction<DEGroup[]>>;
}

interface MemorizeLocationState {
  groupName: string;
  testType: string;
}

const MemorizeDE: React.FC<DEMemorizeProps> = ({ groups, setGroups }) => {
  const location = useLocation();
  const state = location.state as MemorizeLocationState;
  const { groupName, testType } = state;

  const [currentWords, setCurrentWords] = useState<DEWord[]>(shuffleArray(groups.find(group => group.name === groupName)?.words || []));
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [revealTranslation, setRevealTranslation] = useState<{ [key: string]: boolean }>({});
  const [evaluationStatus, setEvaluationStatus] = useState<{ [key: string]: 'correct' | 'incorrect' }>({});

  const [hoveredWordIndex, setHoveredWordIndex] = useState<number | null>(null);
  const wordCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const navigate = useNavigate();
  const consecutiveEnters = useRef(0);

  const hasInitialized = useRef(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const synth = window.speechSynthesis;

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
        initialRevealStatus[word.DE_word] = false;
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

  const getWordColor = (gender: 'm' | 'f' | 'n' | 'N/A') => {
    switch (gender) {
      case 'm':
        return '#96C4DB';
      case 'f':
        return '#F9ACB1';
      case 'n':
        return '#F3D315';
      default:
        return 'white';
    }
  };

  useEffect(() => {
    if (testType === "Flip") {
      const handleSpace = (event: KeyboardEvent) => {
        const currentRevealStatus = revealTranslation[currentWords[activeWordIndex].DE_word];
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
    }
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

  const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      speak(currentWords[activeWordIndex].DE_word, currentWords[activeWordIndex].DE_sentence);
      const newRevealStatus = { ...revealTranslation, [currentWords[activeWordIndex].DE_word]: true };
      setRevealTranslation(newRevealStatus);
    }
  };

  const speak = (text: string, sentence: string) => {
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    synth.speak(utterance);

    const utterance2 = new SpeechSynthesisUtterance(sentence);
    utterance2.lang = 'de-DE';
    synth.speak(utterance2);
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
    speak(currentWords[activeWordIndex].DE_word, currentWords[activeWordIndex].DE_sentence);

    const newRevealStatus = { ...revealTranslation, [currentWords[activeWordIndex].DE_word]: true };
    setRevealTranslation(newRevealStatus);

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
          onClick={() => { setActiveWordIndex(index); }}
          className={activeWordIndex === index ? 'active' : ''}
        >
          {testType === 'Flip' ? (
            <>
              <Title style={{ color: getWordColor(word.gender) }}>{word.DE_word}</Title>
              <Translation>{word.DE_sentence}</Translation>
              {revealTranslation[word.DE_word] &&
                <>
                  <Translation>{word.EN_word}</Translation>
                  <Translation>{word.EN_sentence}</Translation>
                </>
              }
            </>
          ) : (
            <>
              <Translation>{word.EN_word}</Translation>
              <Translation>{word.EN_sentence}</Translation>
              <Title style={{ color: getWordColor(word.gender) }}>{word.DE_word}</Title>
              <TypeTestInput
                ref={(el) => inputRefs.current[index] = el}
                type="text"
                placeholder="Type the German sentence..."
                onKeyDown={e => e.key === 'Enter' && handleEnterPress(e)}
              />
              {revealTranslation[word.DE_word] &&
                <Translation>{word.DE_sentence}</Translation>
              }
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

export default MemorizeDE;