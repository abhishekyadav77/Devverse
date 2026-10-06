import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import AvatarUploader from '../../components/profile/AvatarUploader.jsx';
import FormField from '../../components/common/FormField.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import { updateProfile } from '../../services/authService.js';

const urlRule = (label) => ({
  validate: (v) => !v || /^https?:\/\/\S+$/i.test(v) || `${label} must start with http:// or https://`,
});

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, watch, formState: { errors, isSubmitting, isDirty }, reset } = useForm({
    defaultValues: {
      name: user.name, username: user.username, bio: user.bio || '',
      website: user.website || '', github: user.github || '', linkedin: user.linkedin || '',
    },
  });
  const bioLength = watch('bio')?.length || 0;

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const updated = await updateProfile(values);
      updateUser(updated);
      reset(values);
      toast.success('Profile saved');
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-1 text-sm text-ink-500">This is what readers see on your author page.</p>

            <AvatarUploader />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        {serverError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {serverError}
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Full name" htmlFor="name" error={errors.name?.message}>
            <input id="name" className="input" {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })} />
          </FormField>
          <FormField label="Username" htmlFor="username" error={errors.username?.message}>
            <input id="username" className="input" {...register('username', {
              required: 'Username is required',
              minLength: { value: 3, message: 'Username must be at least 3 characters' },
              maxLength: { value: 20, message: 'Username must be 20 characters or fewer' },
              pattern: { value: /^[A-Za-z0-9_]+$/, message: 'Use only letters, numbers and underscores' },
            })} />
          </FormField>
        </div>
        <FormField label="Bio" htmlFor="bio" error={errors.bio?.message} hint={`${bioLength}/300`}>
          <textarea id="bio" rows={4} className="input" {...register('bio', { maxLength: { value: 300, message: 'Bio must be 300 characters or fewer' } })} />
        </FormField>
        <FormField label="Website" htmlFor="website" error={errors.website?.message}>
          <input id="website" placeholder="https://yoursite.dev" className="input" {...register('website', urlRule('Website'))} />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="GitHub" htmlFor="github" error={errors.github?.message}>
            <input id="github" placeholder="https://github.com/you" className="input" {...register('github', urlRule('GitHub'))} />
          </FormField>
          <FormField label="LinkedIn" htmlFor="linkedin" error={errors.linkedin?.message}>
            <input id="linkedin" placeholder="https://linkedin.com/in/you" className="input" {...register('linkedin', urlRule('LinkedIn'))} />
          </FormField>
        </div>
        <button type="submit" className="btn-primary" disabled={isSubmitting || !isDirty}>
          {isSubmitting && <Loader2 size={16} className="animate-spin" />} Save changes
        </button>
      </form>
    </div>
  );
}