import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar.jsx';
import FollowButton from './FollowButton.jsx';

export default function AuthorBox({ author }) {
  if (!author) return null;
  return (
    <section className="card mt-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center" aria-label="About the author">
      <Avatar src={author.avatar} name={author.name} size="md" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-ink-500">Written by</p>
        <Link to={`/author/${author.username}`} className="font-display text-lg font-bold hover:underline">
          {author.name}
        </Link>
        {author.bio && <p className="mt-1 line-clamp-2 text-sm text-ink-600 dark:text-ink-300">{author.bio}</p>}
      </div>
      <FollowButton userId={author._id} />
    </section>
  );
}