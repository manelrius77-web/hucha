import React from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PiggyBankDetail from './pages/PiggyBankDetail';
import Statistics from './pages/Statistics';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/mis-huchas" element={<Dashboard />} />
          <Route path="/piggy-bank/:id" element={<PiggyBankDetail />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/" element={<Navigate to="/mis-huchas" replace />} />
          <Route path="*" element={<Navigate to="/mis-huchas" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;