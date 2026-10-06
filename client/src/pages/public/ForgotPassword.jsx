import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, MailCheck } from 'lucide-react';
import FormField from '../../components/common/FormField.jsx';
import { forgotPassword } from '../../services/authService.js';

export default function ForgotPassword() {
  const [message, setMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ email }) => {
    setServerError('');
    try {
      setMessage(await forgotPassword(email));
    } catch (err) {
      setServerError(err.message);
    }
  };

  if (message) {
    return (
      <div className="text-center">
        <MailCheck className="mx-auto text-brand-600" size={36} />
        <h1 className="mt-4 text-2xl font-bold">Check your email</h1>
        <p className="mt-2 text-sm text-ink-500">{message} The link works for 15 minutes.</p>
        <Link to="/login" className="btn-secondary mt-6">Back to log in</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Forgot your password?</h1>
      <p className="mt-2 text-sm text-ink-500">Enter your email and we'll send you a reset link.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        {serverError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {serverError}
          </div>
        )}
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" className="input" aria-invalid={!!errors.email}
            {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' } })} />
        </FormField>
        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 size={16} className="animate-spin" />} Send reset link
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="font-medium text-brand-700 hover:underline dark:text-brand-300">Back to log in</Link>
      </p>
    </div>
  );
}