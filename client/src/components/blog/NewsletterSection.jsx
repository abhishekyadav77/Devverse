import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { subscribeNewsletter } from '../../services/newsletterService.js';

export default function NewsletterSection() {
  const toast = useToast();
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      await subscribeNewsletter(email);
      setDone(true);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <section className="rounded-3xl bg-ink-900 px-6 py-12 text-center sm:px-12 dark:border dark:border-ink-800" aria-labelledby="newsletter-title">
      <h2 id="newsletter-title" className="text-3xl font-extrabold text-white">The best new writing, in your inbox</h2>
      <p className="mx-auto mt-3 max-w-lg text-ink-300">A short roundup of standout articles. No spam, unsubscribe any time.</p>

      {done ? (
        <p className="mt-8 flex items-center justify-center gap-2 font-medium text-brand-300" role="status">
          <CheckCircle2 size={18} /> You're on the list.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row" noValidate>
          <div className="flex-1 text-left">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="input"
              aria-invalid={!!errors.email}
              {...register('email', {
                required: 'Enter your email address',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
              })}
            />
            {errors.email && <p className="mt-1 text-xs text-red-300" role="alert">{errors.email.message}</p>}
          </div>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting && <Loader2 size={16} className="animate-spin" />} Subscribe
          </button>
        </form>
      )}
    </section>
  );
}