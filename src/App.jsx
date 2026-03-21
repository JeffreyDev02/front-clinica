import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Specialties from './pages/Specialties';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pacientes" element={<Patients />} />
          <Route path="/doctores" element={<Doctors />} />
          <Route path="/citas" element={<Appointments />} />
          <Route path="/especialidades" element={<Specialties />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
