import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import FormField from '../../components/common/FormField.jsx';
import PasswordInput from '../../components/common/PasswordInput.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function Register() {
  const { register: signUp } = useAuth();
  const toast = useToast();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ name, username, email, password }) => {
    setServerError('');
    try {
      const user = await signUp({ name, username, email, password });
      toast.success(`Welcome to DevVerse, ${user.name.split(' ')[0]}`);
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Create your account</h1>
      <p className="mt-2 text-sm text-ink-500">Start writing in a couple of minutes.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        {serverError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {serverError}
          </div>
        )}
        <FormField label="Full name" htmlFor="name" error={errors.name?.message}>
          <input id="name" autoComplete="name" className="input" aria-invalid={!!errors.name}
            {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' }, maxLength: { value: 60, message: 'Name must be 60 characters or fewer' } })} />
        </FormField>
        <FormField label="Username" htmlFor="username" error={errors.username?.message} hint="3 to 20 characters: letters, numbers, underscores">
          <input id="username" autoComplete="username" className="input" aria-invalid={!!errors.username}
            {...register('username', {
              required: 'Username is required',
              minLength: { value: 3, message: 'Username must be at least 3 characters' },
              maxLength: { value: 20, message: 'Username must be 20 characters or fewer' },
              pattern: { value: /^[A-Za-z0-9_]+$/, message: 'Use only letters, numbers and underscores' },
            })} />
        </FormField>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" className="input" aria-invalid={!!errors.email}
            {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' } })} />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password?.message} hint="At least 8 characters, with a letter and a number">
          <PasswordInput id="password" autoComplete="new-password" aria-invalid={!!errors.password}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
              validate: (v) => (/[A-Za-z]/.test(v) && /\d/.test(v)) || 'Include at least one letter and one number',
            })} />
        </FormField>
        <FormField label="Confirm password" htmlFor="confirm" error={errors.confirm?.message}>
          <PasswordInput id="confirm" autoComplete="new-password" aria-invalid={!!errors.confirm}
            {...register('confirm', { required: 'Confirm your password', validate: (v) => v === watch('password') || 'Passwords do not match' })} />
        </FormField>
        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 size={16} className="animate-spin" />} Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-700 hover:underline dark:text-brand-300">Log in</Link>
      </p>
    </div>
  );
}