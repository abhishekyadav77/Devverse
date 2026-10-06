import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, LogOut } from 'lucide-react';
import FormField from '../../components/common/FormField.jsx';
import PasswordInput from '../../components/common/PasswordInput.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import { changePassword } from '../../services/authService.js';

export default function Settings() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ currentPassword, newPassword }) => {
    setServerError('');
    try {
      await changePassword({ currentPassword, newPassword });
      reset();
      toast.success('Password changed');
    } catch (err) {
      setServerError(err.message);
    }
  };

  const onLogout = async () => {
    navigate('/');
    await logout();
    toast.success('Logged out');
  };

  return (
    <div className="max-w-xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Account settings</h1>
        <p className="mt-1 text-sm text-ink-500">Signed in as {user.email}</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold">Change password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-5" noValidate>
          {serverError && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {serverError}
            </div>
          )}
          <FormField label="Current password" htmlFor="currentPassword" error={errors.currentPassword?.message}>
            <PasswordInput id="currentPassword" autoComplete="current-password"
              {...register('currentPassword', { required: 'Enter your current password' })} />
          </FormField>
          <FormField label="New password" htmlFor="newPassword" error={errors.newPassword?.message} hint="At least 8 characters, with a letter and a number">
            <PasswordInput id="newPassword" autoComplete="new-password"
              {...register('newPassword', {
                required: 'Enter a new password',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                validate: (v) => (/[A-Za-z]/.test(v) && /\d/.test(v)) || 'Include at least one letter and one number',
              })} />
          </FormField>
          <FormField label="Confirm new password" htmlFor="confirm" error={errors.confirm?.message}>
            <PasswordInput id="confirm" autoComplete="new-password"
              {...register('confirm', { required: 'Confirm your new password', validate: (v) => v === watch('newPassword') || 'Passwords do not match' })} />
          </FormField>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting && <Loader2 size={16} className="animate-spin" />} Update password
          </button>
        </form>
      </section>

      <section className="border-t border-ink-200 pt-8 dark:border-ink-800">
        <h2 className="text-lg font-semibold">Session</h2>
        <p className="mt-1 text-sm text-ink-500">Log out of DevVerse on this device.</p>
        <button onClick={onLogout} className="btn-secondary mt-4"><LogOut size={16} /> Log out</button>
      </section>
    </div>
  );
}