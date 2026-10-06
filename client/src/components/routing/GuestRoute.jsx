import { Navigate, useLocation } from 'react-router-dom';
import Spinner from '../common/Spinner.jsx';
import { useAuth } from '../../hooks/useAuth.js';

// Keeps logged-in users off the login/register pages and sends them where they were headed.
export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner className="min-h-screen" />;
  if (user) return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />;
  return children;
}