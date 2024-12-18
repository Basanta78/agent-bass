// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SonarQubeProjectPage from './components/SonarQubeProjectPage';
import Dashboard from './components/Dashboard';
import ProjectInfoPage from './components/ProjectInfoPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProjectInfoPage />} />
        <Route path="/add-project" element={<Dashboard />} />
        <Route path="/sonarqube-project/:projectName" element={<SonarQubeProjectPage />} /> {/* Route for individual project */}

      </Routes>
    </Router>
  );
}

export default App;
