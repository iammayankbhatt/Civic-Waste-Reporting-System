import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ReportWaste from './pages/ReportWaste';
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

export default function App() {
  // 1. Get the user state here to decide redirects
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="container mx-auto p-4 flex-grow">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/report" 
            element={
              <ProtectedRoute>
                <ReportWaste />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* 2. SMART REDIRECT: If user exists, go to /report. If not, go to /login */}
          <Route 
            path="/" 
            element={<Navigate to={user ? "/report" : "/login"} replace />} 
          />
          
          {/* Catch-all: Apply the same smart logic */}
          <Route 
            path="*" 
            element={<Navigate to={user ? "/report" : "/login"} replace />} 
          />
        </Routes>
      </div>
    </div>
  );
}