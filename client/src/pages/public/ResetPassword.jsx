import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import FormField from '../../components/common/FormField.jsx';
import PasswordInput from '../../components/common/PasswordInput.jsx';
import { resetPassword } from '../../services/authService.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ password }) => {
    setServerError('');
    try {
      await resetPassword(token, password);
      toast.success('Password updated. Log in with your new password.');
      navigate('/login', { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Choose a new password</h1>
      <p className="mt-2 text-sm text-ink-500">Use at least 8 characters, with a letter and a number.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        {serverError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {serverError}{' '}
            <Link to="/forgot-password" className="font-medium underline">Request a new link</Link>
          </div>
        )}
        <FormField label="New password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="new-password" aria-invalid={!!errors.password}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
              validate: (v) => (/[A-Za-z]/.test(v) && /\d/.test(v)) || 'Include at least one letter and one number',
            })} />
        </FormField>
        <FormField label="Confirm new password" htmlFor="confirm" error={errors.confirm?.message}>
          <PasswordInput id="confirm" autoComplete="new-password" aria-invalid={!!errors.confirm}
            {...register('confirm', { required: 'Confirm your password', validate: (v) => v === watch('password') || 'Passwords do not match' })} />
        </FormField>
        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 size={16} className="animate-spin" />} Update password
        </button>
      </form>
    </div>
  );
}