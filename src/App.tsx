import React, { useEffect, useState } from 'react';
import { Container, GlobalStyle, Button, StyledLink, SwitchButton, SwitchButtonGroup } from './styles';
import GroupsPage from './GroupsPage';
import AddPage from './AddPage';

import { Helmet } from 'react-helmet';

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Memorize from './Memorize';

interface Word {
  JA: string;
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

const App: React.FC = () => {

  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const response = await fetch('/.netlify/functions/getGroups');
    const data = await response.json();
    if (Array.isArray(data)) {
      setGroups(data);
    } else {
      console.error('Expected an array but got:', data);
    }
  };

  return (
    <BrowserRouter>
      <GlobalStyle />
      <Helmet>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      </Helmet>
      <Container>
        <h1>は哈하ha</h1>

        <SwitchButtonGroup>
          <StyledLink to="/add">
            <SwitchButton style={{ marginRight: 5 }} >Add Words</SwitchButton>
          </StyledLink>
          <StyledLink style={{ marginLeft: 5 }} to="/groups">
            <SwitchButton>Select Group</SwitchButton>
          </StyledLink>
        </SwitchButtonGroup>

        <Routes>
          <Route path="/add" element={<AddPage groups={groups} setGroups={setGroups} />} />
          <Route path="/groups" element={<GroupsPage groups={groups} setGroups={setGroups} />} />
          <Route path="/memorize" element={<Memorize groups={groups} setGroups={setGroups} />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;