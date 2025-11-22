import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Roleplay from './pages/Roleplay';
import Live from './pages/Live';
import Pronunciation from './pages/Pronunciation';
import Vocabulary from './pages/Vocabulary';
import Lessons from './pages/Lessons';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/roleplay" element={<Roleplay />} />
          <Route path="/live" element={<Live />} />
          <Route path="/pronunciation" element={<Pronunciation />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;