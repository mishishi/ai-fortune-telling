import { Routes, Route, useNavigate } from 'react-router-dom';
import { GameBoard } from './components/GameBoard';
import { PracticeBoard } from './components/PracticeBoard';
import { AsyncGameBoard } from './components/AsyncGameBoard';
import { ModeSelect } from './components/ModeSelect';
import './styles/cyberpunk.css';

function HomePage() {
  const navigate = useNavigate();
  return (
    <ModeSelect onSelect={(mode) => {
      if (mode === 'pvp') navigate('/pvp');
      else if (mode === 'practice') navigate('/practice');
      else if (mode === 'async') navigate('/async');
    }} />
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pvp" element={<GameBoard autoStart={true} />} />
      <Route path="/practice" element={<PracticeBoard onBack={() => { window.location.hash = '#/'; }} />} />
      <Route path="/async" element={<AsyncGameBoard />} />
    </Routes>
  );
}

export default App;
