import React, { useState, useEffect, useRef } from 'react';
import { WordGroup, GroupName, GroupInfo, Row, Modal, ModalOverlay, ModalButton } from './styles';
import { useNavigate } from 'react-router-dom';

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

interface DEGroupPageProps {
  groups: DEGroup[];
  setGroups: React.Dispatch<React.SetStateAction<DEGroup[]>>;
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

interface GroupPageProps {
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
}

const GroupsPageDE: React.FC<DEGroupPageProps> = ({ groups, setGroups }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(null);

  const navigate = useNavigate();

  const flipButtonRef = React.useRef<HTMLButtonElement>(null);
  const typeButtonRef = React.useRef<HTMLButtonElement>(null);
  const readButtonRef = React.useRef<HTMLButtonElement>(null);

  const computeGroupData = (group: DEGroup) => {
    const totalWords = group.words.length;
    const averageMemorization = Math.round(
      (group.words.reduce((sum, word) => sum + word.memorization, 0) / group.words.length) * 100
    );
    return {
      totalWords,
      averageMemorization: averageMemorization.toFixed(0)
    };
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          typeButtonRef.current?.focus();
          break;
        case "ArrowLeft":
          flipButtonRef.current?.focus();
          break;
        case "ArrowDown":
          readButtonRef.current?.focus();
          break;
        case "Enter":
          if (document.activeElement === flipButtonRef.current) {
            handleTypeSelect('Flip');
          } else if (document.activeElement === typeButtonRef.current) {
            handleTypeSelect('Type');
          } else if (document.activeElement === readButtonRef.current) {
            handleTypeSelect('Read');
          }
          break;
        default:
          break;
      }
    };

    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  const handleGroupSelect = (groupName: string) => {
    setSelectedGroupName(groupName);
    setIsModalOpen(true);
  };

  const handleTypeSelect = (testType: string) => {
    setIsModalOpen(false);

    if (selectedGroupName) {
      if (testType === "Read") {
        navigate('/understand', { state: { groupName: selectedGroupName, testType } });
      } else {
        navigate('/memorize', { state: { groupName: selectedGroupName, testType } });
      }
    }
  };

  return (
    <>
      {isModalOpen && (
        <>
          <ModalOverlay onClick={() => setIsModalOpen(false)} />
          <Modal>
            <ModalButton ref={flipButtonRef} tabIndex={0} aria-label="Flip Test" onClick={() => handleTypeSelect('Flip')}>
              {"Flip"}
            </ModalButton>
            <ModalButton ref={typeButtonRef} tabIndex={0} aria-label="Type Test" onClick={() => handleTypeSelect('Type')}>
              {"Type"}
            </ModalButton>
            {/* <ModalButton ref={readButtonRef} tabIndex={0} aria-label="Read Test" onClick={() => handleTypeSelect('Read')}>
              {"Read"}
            </ModalButton> */}
          </Modal>
        </>
      )}

      {groups.map(group => {
        const { totalWords, averageMemorization } = computeGroupData(group);

        return (
          <WordGroup key={group.name} onClick={() => handleGroupSelect(group.name)}>
            <GroupName>{group.name}</GroupName>
            <GroupInfo>Total Words: {totalWords}</GroupInfo>
            <GroupInfo>Memorization: {averageMemorization}%</GroupInfo>
          </WordGroup>
        );
      })}
    </>
  );
}

export default GroupsPageDE;