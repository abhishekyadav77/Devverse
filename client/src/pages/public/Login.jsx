import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import FormField from '../../components/common/FormField.jsx';
import PasswordInput from '../../components/common/PasswordInput.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  // On success GuestRoute redirects to the page the user was heading to
  const onSubmit = async (values) => {
    setServerError('');
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Log in</h1>
      <p className="mt-2 text-sm text-ink-500">Pick up where you left off.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        {serverError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {serverError}
          </div>
        )}
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <input
            id="email" type="email" autoComplete="email" className="input" aria-invalid={!!errors.email}
            {...register('email', { required: 'Email is required' })}
          />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput
            id="password" autoComplete="current-password" aria-invalid={!!errors.password}
            {...register('password', { required: 'Password is required' })}
          />
        </FormField>
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">
            Forgot password?
          </Link>
        </div>
        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 size={16} className="animate-spin" />} Log in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        New to DevVerse?{' '}
        <Link to="/register" className="font-medium text-brand-700 hover:underline dark:text-brand-300">Create an account</Link>
      </p>
    </div>
  );
}