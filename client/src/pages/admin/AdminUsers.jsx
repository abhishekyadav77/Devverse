import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ban, UserCheck } from 'lucide-react';
import { AdminTable, Badge, FilterSelect, PageHeader, SearchBox } from '../../components/admin/AdminUI.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAdminList } from '../../hooks/useAdminList.js';
import { useAdminQuery } from '../../hooks/useAdminQuery.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { listAdminUsers, restoreUser, suspendUser } from '../../services/adminService.js';
import { formatDate } from '../../utils/format.js';

const COLUMNS = [
  { label: 'User' },
  { label: 'Role' },
  { label: 'Status' },
  { label: 'Posts' },
  { label: 'Joined' },
  { label: 'Actions', srOnly: true },
];

export default function AdminUsers() {
  const { user: me } = useAuth();
  const toast = useToast();
  const q = useAdminQuery({ status: '', role: '' });
  const [state, reload] = useAdminList(listAdminUsers, q.params);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  useDocumentTitle('Users | Admin');

  const doSuspend = async () => {
    setBusy(true);
    try {
      await suspendUser(target._id);
      toast.success(`${target.name} was suspended`);
      setTarget(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const doRestore = async (u) => {
    try {
      await restoreUser(u._id);
      toast.success(`${u.name} was restored`);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const renderRow = (u) => (
    <tr key={u._id}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar src={u.avatar} name={u.name} />
          <div className="min-w-0">
            <Link to={`/author/${u.username}`} className="block truncate font-medium text-ink-900 hover:underline dark:text-white">{u.name}</Link>
            <p className="truncate text-xs text-ink-500">@{u.username}, {u.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3"><Badge tone={u.role === 'admin' ? 'green' : 'gray'}>{u.role === 'admin' ? 'Admin' : 'User'}</Badge></td>
      <td className="px-4 py-3"><Badge tone={u.status === 'suspended' ? 'red' : 'green'}>{u.status === 'suspended' ? 'Suspended' : 'Active'}</Badge></td>
      <td className="px-4 py-3">{u.postsCount}</td>
      <td className="whitespace-nowrap px-4 py-3 text-ink-500">{formatDate(u.createdAt)}</td>
      <td className="px-4 py-3">
        <div className="flex justify-end">
          {u._id === me._id || u.role === 'admin' ? (
            <span className="px-2 text-xs text-ink-400">Protected</span>
          ) : u.status === 'suspended' ? (
            <button className="btn-secondary !px-3 !py-1.5" onClick={() => doRestore(u)}><UserCheck size={15} /> Restore</button>
          ) : (
            <button className="btn-ghost !px-3 !py-1.5 hover:!text-red-600" onClick={() => setTarget(u)}><Ban size={15} /> Suspend</button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div>
      <PageHeader title="Users" text="Search accounts and suspend or restore access." />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox value={q.input} onChange={q.setInput} placeholder="Search name, username or email" />
        <FilterSelect label="Filter by status" value={q.filters.status} onChange={(v) => q.setFilter('status', v)}
          options={[{ value: '', label: 'All statuses' }, { value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }]} />
        <FilterSelect label="Filter by role" value={q.filters.role} onChange={(v) => q.setFilter('role', v)}
          options={[{ value: '', label: 'All roles' }, { value: 'user', label: 'Users' }, { value: 'admin', label: 'Admins' }]} />
      </div>

      <AdminTable columns={COLUMNS} state={state} onRetry={reload} renderRow={renderRow} emptyText="No users match your search." page={q.page} onPage={q.setPage} />

      <ConfirmDialog
        open={!!target}
        title={`Suspend ${target?.name}?`}
        message="They will be logged out and blocked from logging in or doing anything on DevVerse. Their published posts stay visible until you hide them. You can restore the account at any time."
        confirmLabel="Suspend"
        loading={busy}
        onConfirm={doSuspend}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}