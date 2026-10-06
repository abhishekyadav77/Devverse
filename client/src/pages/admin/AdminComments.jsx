import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { AdminTable, Badge, PageHeader, SearchBox } from '../../components/admin/AdminUI.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAdminList } from '../../hooks/useAdminList.js';
import { useAdminQuery } from '../../hooks/useAdminQuery.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { listAdminComments } from '../../services/adminService.js';
import { deleteComment } from '../../services/commentService.js';
import { timeAgo } from '../../utils/format.js';

const COLUMNS = [
  { label: 'Comment' },
  { label: 'Author' },
  { label: 'Article' },
  { label: 'Likes' },
  { label: 'Posted' },
  { label: 'Actions', srOnly: true },
];

export default function AdminComments() {
  const toast = useToast();
  const q = useAdminQuery();
  const [state, reload] = useAdminList(listAdminComments, q.params);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  useDocumentTitle('Comments | Admin');

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteComment(target._id);
      toast.success('Comment deleted');
      setTarget(null);
      if (state.items.length === 1 && q.page > 1) q.setPage((p) => p - 1);
      else reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const renderRow = (c) => (
    <tr key={c._id}>
      <td className="max-w-md px-4 py-3">
        {c.parent && <span className="mr-2"><Badge>Reply</Badge></span>}
        <span className="line-clamp-3 whitespace-pre-wrap break-words">{c.content}</span>
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        {c.author ? <Link to={`/author/${c.author.username}`} className="hover:underline">{c.author.name}</Link> : <span className="text-ink-400">Deleted user</span>}
      </td>
      <td className="max-w-[12rem] px-4 py-3">
        {c.blog ? <Link to={`/blog/${c.blog.slug}#comments`} className="line-clamp-2 hover:underline">{c.blog.title}</Link> : <span className="text-ink-400">Deleted post</span>}
      </td>
      <td className="px-4 py-3">{c.likesCount}</td>
      <td className="whitespace-nowrap px-4 py-3 text-ink-500">{timeAgo(c.createdAt)}</td>
      <td className="px-4 py-3">
        <div className="flex justify-end">
          <button className="btn-ghost !p-2 hover:!text-red-600" onClick={() => setTarget(c)} aria-label="Delete comment"><Trash2 size={16} /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <div>
      <PageHeader title="Comments" text="Newest first. Search the text to find specific comments." />
      <div className="mb-4"><SearchBox value={q.input} onChange={q.setInput} placeholder="Search comment text" /></div>

      <AdminTable columns={COLUMNS} state={state} onRetry={reload} renderRow={renderRow} emptyText="No comments match your search." page={q.page} onPage={q.setPage} />

      <ConfirmDialog
        open={!!target}
        title="Delete this comment?"
        message={
          !target?.parent && target?.repliesCount
            ? `This will also delete its ${target.repliesCount} ${target.repliesCount === 1 ? 'reply' : 'replies'}. This cannot be undone.`
            : 'This cannot be undone.'
        }
        loading={busy}
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}