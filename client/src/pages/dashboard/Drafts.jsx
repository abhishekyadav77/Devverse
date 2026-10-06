import { Link } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import PostsTable from '../../components/dashboard/PostsTable.jsx';

export default function Drafts() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Drafts</h1>
          <p className="mt-1 text-sm text-ink-500">Work in progress. Only you can see these.</p>
        </div>
        <Link to="/dashboard/write" className="btn-primary"><PenLine size={16} /> New post</Link>
      </div>
      <PostsTable status="draft" emptyTitle="No drafts" emptyText="Anything you start writing is saved here automatically." />
    </div>
  );
}