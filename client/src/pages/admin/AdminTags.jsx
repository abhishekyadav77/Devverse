import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { AdminTable, PageHeader, SearchBox } from '../../components/admin/AdminUI.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import FormField from '../../components/common/FormField.jsx';
import Modal from '../../components/common/Modal.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAdminList } from '../../hooks/useAdminList.js';
import { useAdminQuery } from '../../hooks/useAdminQuery.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { deleteTag, listAdminTags, renameTag } from '../../services/adminService.js';

const COLUMNS = [
  { label: 'Tag' },
  { label: 'Link' },
  { label: 'Posts' },
  { label: 'Actions', srOnly: true },
];

function RenameForm({ tag, onSaved, onClose }) {
  const toast = useToast();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { name: tag.name } });

  const onSubmit = async ({ name }) => {
    setServerError('');
    try {
      await renameTag(tag._id, name);
      toast.success('Tag renamed');
      onSaved();
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">{serverError}</p>}
      <FormField label="Name" htmlFor="tag-name" error={errors.name?.message}>
        <input id="tag-name" className="input" {...register('name', {
          required: 'Name is required',
          minLength: { value: 2, message: 'Name must be at least 2 characters' },
          maxLength: { value: 30, message: 'Name must be 30 characters or fewer' },
        })} />
      </FormField>
      <p className="text-xs text-ink-500">Renaming changes the tag link, so old links to it stop working.</p>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting && <Loader2 size={16} className="animate-spin" />} Save changes
        </button>
      </div>
    </form>
  );
}

export default function AdminTags() {
  const toast = useToast();
  const q = useAdminQuery();
  const [state, reload] = useAdminList(listAdminTags, q.params);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  useDocumentTitle('Tags | Admin');

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteTag(toDelete._id);
      toast.success('Tag deleted');
      setToDelete(null);
      if (state.items.length === 1 && q.page > 1) q.setPage((p) => p - 1);
      else reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const renderRow = (t) => (
    <tr key={t._id}>
      <td className="px-4 py-3 font-medium text-ink-900 dark:text-white">#{t.name}</td>
      <td className="px-4 py-3 font-mono text-xs text-ink-500">/tag/{t.slug}</td>
      <td className="px-4 py-3">{t.postCount}</td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-1">
          <button className="btn-ghost !p-2" onClick={() => setEditing(t)} aria-label={`Rename ${t.name}`}><Pencil size={16} /></button>
          <button className="btn-ghost !p-2 hover:!text-red-600" onClick={() => setToDelete(t)} aria-label={`Delete ${t.name}`}><Trash2 size={16} /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <div>
      <PageHeader title="Tags" text="Tags are created by writers in the editor. Rename or remove them here." />
      <div className="mb-4"><SearchBox value={q.input} onChange={q.setInput} placeholder="Search tags" /></div>

      <AdminTable columns={COLUMNS} state={state} onRetry={reload} renderRow={renderRow} emptyText="No tags found." page={q.page} onPage={q.setPage} />

      <Modal open={!!editing} title="Rename tag" onClose={() => setEditing(null)}>
        {editing && <RenameForm tag={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete #${toDelete?.name}?`}
        message={
          toDelete?.postCount
            ? `It will be removed from ${toDelete.postCount} ${toDelete.postCount === 1 ? 'post' : 'posts'}. The posts themselves are not deleted.`
            : 'No posts use this tag.'
        }
        loading={busy}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}