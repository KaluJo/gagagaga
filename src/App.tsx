import React, { useEffect, useState } from 'react';
import { Container, GlobalStyle, Button, StyledLink, SwitchButton, SwitchButtonGroup } from './styles';
import GroupsPage from './GroupsPage';
import AddPage from './AddPage';
import AddPageDE from './AddPageDE';
import GroupsPageDE from './GroupsPageDE';
import MemorizeDE from './MemorizeDE';

import { Helmet } from 'react-helmet';

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Memorize from './Memorize';
import Understand from './Understand';

interface Word {
  JA: string;
  furigana: string;
  KO: string;
  EN: string;
  ZH: string;
  FR: string;
  memorization: number;
  notes: string[];
  partOfSpeech: 'Verb' | 'Grammar' | 'Phrase' | 'Noun' | 'Descriptor';
}

interface Group {
  name: string;
  words: Word[];
}

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

const App: React.FC = () => {

  const [groups, setGroups] = useState<DEGroup[]>([]);
  // const [sentences, setSentences] = useState<Sentences[]>();

  useEffect(() => {
    fetchGroups();
    // fetchSentences();
  }, []);

  const fetchGroups = async () => {
    const response = await fetch('/.netlify/functions/getGroupsDE');
    const data = await response.json();
    if (Array.isArray(data)) {
      setGroups(data);
    } else {
      console.error('Expected an array but got:', data);
    }
  };

  // const fetchSentences = async () => {
  //   const response = await fetch('/.netlify/functions/getSentences');
  //   const data = await response.json();
  //   if (Array.isArray(data)) {
  //     setSentences(data);
  //   } else {
  //     console.error('Expected an array but got:', data);
  //   }
  // };

  return (
    <BrowserRouter>
      <GlobalStyle />
      <Helmet>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      </Helmet>
      <Container>
        <h1>Retreev</h1>

        <SwitchButtonGroup>
          <StyledLink to="/add">
            <SwitchButton style={{ marginRight: 5 }} >Add Words</SwitchButton>
          </StyledLink>
          <StyledLink style={{ marginLeft: 5 }} to="/groups">
            <SwitchButton>Select Group</SwitchButton>
          </StyledLink>
        </SwitchButtonGroup>

        <Routes>
          <Route path="/add" element={<AddPageDE groups={groups} setGroups={setGroups} />} />
          <Route path="/groups" element={<GroupsPageDE groups={groups} setGroups={setGroups} />} />
          <Route path="/memorize" element={<MemorizeDE groups={groups} setGroups={setGroups} />} />
          {/* <Route path="/understand" element={<Understand groups={groups} setGroups={setGroups} sentences={sentences} setSentences={setSentences} />} /> */}
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;