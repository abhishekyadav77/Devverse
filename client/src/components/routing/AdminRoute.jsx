import { Navigate, useLocation } from 'react-router-dom';
import Spinner from '../common/Spinner.jsx';
import { useAuth } from '../../hooks/useAuth.js';

// UX only. The API enforces admin access independently on every request.
export default function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner className="min-h-screen" />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}