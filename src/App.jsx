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
import Facturacion from './pages/Facturacion';
import CreateFactura from './pages/CreateFactura';
import ViewFactura from './pages/ViewFactura';
import Medicamentos from './pages/Medicamentos';

const ProtectedLayout = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.rol)) return <Navigate to="/" replace />;
  return <MainLayout>{children}</MainLayout>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedLayout><Home /></ProtectedLayout>} />
      <Route path="/pacientes" element={<ProtectedLayout roles={['admin', 'medico', 'recepcion']}><Patients /></ProtectedLayout>} />
      <Route path="/doctores" element={<ProtectedLayout roles={['admin']}><Doctors /></ProtectedLayout>} />
      <Route path="/citas" element={<ProtectedLayout roles={['admin', 'medico', 'recepcion']}><Appointments /></ProtectedLayout>} />
      <Route path="/especialidades" element={<ProtectedLayout roles={['admin']}><Specialties /></ProtectedLayout>} />
      <Route path="/medicamentos" element={<ProtectedLayout roles={['admin']}><Medicamentos /></ProtectedLayout>} />
      <Route path="/consultas" element={<ProtectedLayout roles={['admin', 'medico']}><Consultations /></ProtectedLayout>} />
      <Route path="/consultas/nueva/:idCita" element={<ProtectedLayout roles={['admin', 'medico']}><CreateConsultation /></ProtectedLayout>} />
      <Route path="/consultas/editar/:idConsulta" element={<ProtectedLayout roles={['admin', 'medico']}><CreateConsultation /></ProtectedLayout>} />
      <Route path="/facturacion" element={<ProtectedLayout roles={['admin', 'recepcion']}><Facturacion /></ProtectedLayout>} />
      <Route path="/facturacion/nueva" element={<ProtectedLayout roles={['admin', 'recepcion']}><CreateFactura /></ProtectedLayout>} />
      <Route path="/facturacion/:id" element={<ProtectedLayout roles={['admin', 'recepcion']}><ViewFactura /></ProtectedLayout>} />
      <Route path="/reportes" element={<ProtectedLayout roles={['admin']}><Reports /></ProtectedLayout>} />
      <Route path="/expediente/:id" element={<ProtectedLayout roles={['admin', 'medico']}><Expediente /></ProtectedLayout>} />
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
