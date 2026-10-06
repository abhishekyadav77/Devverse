import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/admin/AdminUI.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import FormField from '../../components/common/FormField.jsx';
import Modal from '../../components/common/Modal.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { createCategory, deleteCategory, updateCategory } from '../../services/adminService.js';
import { getCategories } from '../../services/taxonomyService.js';

function CategoryForm({ category, onSaved, onClose }) {
  const toast = useToast();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: category?.name || '', description: category?.description || '' },
  });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      if (category) await updateCategory(category._id, values);
      else await createCategory(values);
      toast.success(category ? 'Category updated' : 'Category created');
      onSaved();
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">{serverError}</p>}
      <FormField label="Name" htmlFor="cat-name" error={errors.name?.message}>
        <input id="cat-name" className="input" {...register('name', {
          required: 'Name is required',
          minLength: { value: 2, message: 'Name must be at least 2 characters' },
          maxLength: { value: 40, message: 'Name must be 40 characters or fewer' },
        })} />
      </FormField>
      <FormField label="Description" htmlFor="cat-desc" error={errors.description?.message} hint="Optional. Shown on the category page.">
        <textarea id="cat-desc" rows={3} className="input" {...register('description', { maxLength: { value: 200, message: 'Description must be 200 characters or fewer' } })} />
      </FormField>
      {category && <p className="text-xs text-ink-500">Renaming changes the category link, so old links to it stop working.</p>}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting && <Loader2 size={16} className="animate-spin" />} {category ? 'Save changes' : 'Create category'}
        </button>
      </div>
    </form>
  );
}

function DeleteCategory({ category, others, onDeleted, onClose }) {
  const toast = useToast();
  const [reassignTo, setReassignTo] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      const result = await deleteCategory(category._id, reassignTo);
      toast.success(result.moved ? `Category deleted. ${result.moved} posts moved.` : 'Category deleted');
      onDeleted();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-600 dark:text-ink-300">
        "{category.name}" will be permanently deleted. If any posts use it, move them to another category first.
      </p>
      <FormField label="Move posts to" htmlFor="reassign">
        <select id="reassign" className="input" value={reassignTo} onChange={(e) => setReassignTo(e.target.value)}>
          <option value="">Don't move (only works if no posts use it)</option>
          {others.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </FormField>
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">{error}</p>}
      <div className="flex justify-end gap-2">
        <button className="btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="btn-danger" onClick={confirm} disabled={busy}>{busy ? 'Deleting...' : 'Delete category'}</button>
      </div>
    </div>
  );
}

export default function AdminCategories() {
  const [state, setState] = useState({ loading: true, items: [], error: '' });
  const [modal, setModal] = useState(null); // { type: 'form' | 'delete', category? }
  useDocumentTitle('Categories | Admin');

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    getCategories()
      .then((items) => setState({ loading: false, items, error: '' }))
      .catch((err) => setState({ loading: false, items: [], error: err.message }));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const close = () => setModal(null);
  const refresh = () => {
    close();
    load();
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        text="Writers pick one category per post."
        action={<button className="btn-primary" onClick={() => setModal({ type: 'form' })}><Plus size={16} /> New category</button>}
      />

      {state.error ? (
        <EmptyState title="Could not load categories" text={state.error} action={<button className="btn-primary" onClick={load}>Try again</button>} />
      ) : state.loading && state.items.length === 0 ? (
        <div className="space-y-3" role="status" aria-label="Loading categories">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="border-b border-ink-200 text-xs text-ink-500 dark:border-ink-800">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Link</th>
                <th className="px-4 py-3 font-medium">Live posts</th>
                <th className="px-4 py-3 font-medium"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {state.items.map((c) => (
                <tr key={c._id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900 dark:text-white">{c.name}</p>
                    {c.description && <p className="line-clamp-1 text-xs text-ink-500">{c.description}</p>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-500">/category/{c.slug}</td>
                  <td className="px-4 py-3">{c.postCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button className="btn-ghost !p-2" onClick={() => setModal({ type: 'form', category: c })} aria-label={`Edit ${c.name}`}><Pencil size={16} /></button>
                      <button className="btn-ghost !p-2 hover:!text-red-600" onClick={() => setModal({ type: 'delete', category: c })} aria-label={`Delete ${c.name}`}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal?.type === 'form'} title={modal?.category ? 'Edit category' : 'New category'} onClose={close}>
        {modal?.type === 'form' && <CategoryForm category={modal.category} onSaved={refresh} onClose={close} />}
      </Modal>

      <Modal open={modal?.type === 'delete'} title="Delete category" onClose={close}>
        {modal?.type === 'delete' && (
          <DeleteCategory
            category={modal.category}
            others={state.items.filter((c) => c._id !== modal.category._id)}
            onDeleted={refresh}
            onClose={close}
          />
        )}
      </Modal>
    </div>
  );
}