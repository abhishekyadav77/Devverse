import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ExternalLink, Trash2 } from 'lucide-react';
import { AdminTable, Badge, FilterSelect, PageHeader, SearchBox } from '../../components/admin/AdminUI.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAdminList } from '../../hooks/useAdminList.js';
import { useAdminQuery } from '../../hooks/useAdminQuery.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { deletePost, hidePost, listAdminPosts, restorePost } from '../../services/adminService.js';
import { formatCount, formatDate, isFuture } from '../../utils/format.js';

const COLUMNS = [
  { label: 'Title' },
  { label: 'Author' },
  { label: 'Status' },
  { label: 'Views' },
  { label: 'Likes' },
  { label: 'Comments' },
  { label: 'Published' },
  { label: 'Actions', srOnly: true },
];

function StatusBadge({ post }) {
  if (post.isHidden) return <Badge tone="red">Hidden</Badge>;
  if (post.status === 'archived') return <Badge>Archived</Badge>;
  if (isFuture(post.publishedAt)) return <Badge tone="amber">Scheduled</Badge>;
  return <Badge tone="green">Live</Badge>;
}

export default function AdminPosts() {
  const toast = useToast();
  const q = useAdminQuery({ state: '' });
  const [state, reload] = useAdminList(listAdminPosts, q.params);
  const [toHide, setToHide] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  useDocumentTitle('Posts | Admin');

  const afterRemove = () => {
    if (state.items.length === 1 && q.page > 1) q.setPage((p) => p - 1);
    else reload();
  };

  const run = async (action, success, close) => {
    setBusy(true);
    try {
      await action();
      toast.success(success);
      close?.();
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const confirmHide = async () => {
    if (await run(() => hidePost(toHide._id), 'Post hidden', () => setToHide(null))) reload();
  };
  const confirmDelete = async () => {
    if (await run(() => deletePost(toDelete._id), 'Post deleted', () => setToDelete(null))) afterRemove();
  };
  const restore = async (post) => {
    if (await run(() => restorePost(post._id), 'Post restored')) reload();
  };

  const renderRow = (p) => (
    <tr key={p._id}>
      <td className="max-w-[16rem] px-4 py-3">
        <Link to={`/blog/${p.slug}`} className="line-clamp-2 font-medium text-ink-900 hover:underline dark:text-white">{p.title}</Link>
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        {p.author ? <Link to={`/author/${p.author.username}`} className="hover:underline">{p.author.name}</Link> : <span className="text-ink-400">Deleted user</span>}
      </td>
      <td className="px-4 py-3"><StatusBadge post={p} /></td>
      <td className="px-4 py-3">{formatCount(p.views)}</td>
      <td className="px-4 py-3">{formatCount(p.likesCount)}</td>
      <td className="px-4 py-3">{formatCount(p.commentsCount)}</td>
      <td className="whitespace-nowrap px-4 py-3 text-ink-500">{formatDate(p.publishedAt)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Link to={`/blog/${p.slug}`} className="btn-ghost !p-2" aria-label={`View ${p.title}`}><ExternalLink size={16} /></Link>
          {p.isHidden ? (
            <button className="btn-ghost !p-2" onClick={() => restore(p)} aria-label={`Restore ${p.title}`} title="Restore"><Eye size={16} /></button>
          ) : (
            <button className="btn-ghost !p-2" onClick={() => setToHide(p)} aria-label={`Hide ${p.title}`} title="Hide"><EyeOff size={16} /></button>
          )}
          <button className="btn-ghost !p-2 hover:!text-red-600" onClick={() => setToDelete(p)} aria-label={`Delete ${p.title}`}><Trash2 size={16} /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <div>
      <PageHeader title="Posts" text="Hide or delete published posts. Drafts are private to their authors." />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox value={q.input} onChange={q.setInput} placeholder="Search post titles" />
        <FilterSelect label="Filter posts" value={q.filters.state} onChange={(v) => q.setFilter('state', v)}
          options={[{ value: '', label: 'All posts' }, { value: 'live', label: 'Live' }, { value: 'hidden', label: 'Hidden' }]} />
      </div>

      <AdminTable columns={COLUMNS} state={state} onRetry={reload} renderRow={renderRow} emptyText="No posts match your search." page={q.page} onPage={q.setPage} />

      <ConfirmDialog
        open={!!toHide}
        title="Hide this post?"
        message={`"${toHide?.title}" disappears from DevVerse for everyone except its author and admins. You can restore it later.`}
        confirmLabel="Hide post"
        loading={busy}
        onConfirm={confirmHide}
        onCancel={() => setToHide(null)}
      />
      <ConfirmDialog
        open={!!toDelete}
        title="Delete this post?"
        message={`"${toDelete?.title}" and all its comments, likes and bookmarks will be permanently deleted. This cannot be undone.`}
        loading={busy}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}