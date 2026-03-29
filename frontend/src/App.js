import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Tenants from './pages/Tenants';
import Payments from './pages/Payments';
import Maintenance from './pages/Maintenance';
import Notices from './pages/Notices';
import Properties from './pages/Properties'; 
import TenantDashboard from './pages/TenantDashboard';

const ProtectedRoute = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{padding:'40px',textAlign:'center'}}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/maintenance" />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />

      {/* <Route path="/" element={
        <ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>
      }/> */} 
      <Route path="/" element={
  <ProtectedRoute>
    {user?.role === 'admin' ? <Dashboard /> : <TenantDashboard />}
  </ProtectedRoute>
}/>
      <Route path="/properties" element={
        <ProtectedRoute adminOnly><Properties /></ProtectedRoute>
      }/>
      <Route path="/rooms" element={
        <ProtectedRoute adminOnly><Rooms /></ProtectedRoute>
      }/>
      <Route path="/tenants" element={
        <ProtectedRoute adminOnly><Tenants /></ProtectedRoute>
      }/>
      <Route path="/payments" element={
        <ProtectedRoute adminOnly><Payments /></ProtectedRoute>
      }/>
      <Route path="/maintenance" element={
        <ProtectedRoute><Maintenance /></ProtectedRoute>
      }/>
      <Route path="/notices" element={
        <ProtectedRoute><Notices /></ProtectedRoute>
      }/>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            fontWeight: '500',
          }
        }}/>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;