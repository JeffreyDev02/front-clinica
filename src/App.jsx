import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Home from './pages/Home';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Specialties from './pages/Specialties';
import Consultations from './pages/Consultations';
import CreateConsultation from './pages/CreateConsultation';
import Reports from './pages/Reports';
import Expediente from './pages/Expediente';

const ProtectedLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <MainLayout>{children}</MainLayout>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedLayout><Home /></ProtectedLayout>} />
      <Route path="/pacientes" element={<ProtectedLayout><Patients /></ProtectedLayout>} />
      <Route path="/doctores" element={<ProtectedLayout><Doctors /></ProtectedLayout>} />
      <Route path="/citas" element={<ProtectedLayout><Appointments /></ProtectedLayout>} />
      <Route path="/especialidades" element={<ProtectedLayout><Specialties /></ProtectedLayout>} />
      <Route path="/consultas" element={<ProtectedLayout><Consultations /></ProtectedLayout>} />
      <Route path="/consultas/nueva/:idCita" element={<ProtectedLayout><CreateConsultation /></ProtectedLayout>} />
      <Route path="/reportes" element={<ProtectedLayout><Reports /></ProtectedLayout>} />
      <Route path="/expediente/:id" element={<ProtectedLayout><Expediente /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
