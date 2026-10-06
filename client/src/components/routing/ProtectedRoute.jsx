import { Navigate, useLocation } from 'react-router-dom';
import Spinner from '../common/Spinner.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner className="min-h-screen" />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}