import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AmbientBackground from './components/AmbientBackground';
import GlitchedEarth from './components/GlitchedEarth';
import WhatsAppBtn from './components/WhatsAppBtn';
import Home from './pages/Home';
import Contact from './pages/Contact';
import './index.css';

function App() {
  return (
    <Router>
      <AmbientBackground />
      <GlitchedEarth />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      
      <WhatsAppBtn />
    </Router>
  );
}

export default App;
