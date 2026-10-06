import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth.js';
import { useToast } from '../context/ToastContext.jsx';

// Returns a function: true when logged in; otherwise sends the visitor to login and returns false.
// After logging in they come back to the page they were on.
export function useRequireAuth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  return useCallback(
    (message = 'Log in to continue') => {
      if (user) return true;
      toast.error(message);
      navigate('/login', { state: { from: location } });
      return false;
    },
    [user, navigate, location, toast]
  );
}