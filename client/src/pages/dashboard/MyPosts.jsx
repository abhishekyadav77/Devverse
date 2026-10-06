import { Link } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import PostsTable from '../../components/dashboard/PostsTable.jsx';

export default function MyPosts() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My posts</h1>
          <p className="mt-1 text-sm text-ink-500">Published and scheduled articles.</p>
        </div>
        <Link to="/dashboard/write" className="btn-primary"><PenLine size={16} /> New post</Link>
      </div>
      <PostsTable
        status="published"
        emptyTitle="Nothing published yet"
        emptyText="Publish a draft and it will show up here."
      />
    </div>
  );
}