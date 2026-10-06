import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar.jsx';
import { plural } from '../../utils/format.js';

export default function AuthorCard({ author }) {
  return (
    <Link
      to={`/author/${author.username}`}
      className="card flex items-start gap-4 p-5 transition-colors hover:border-brand-500 dark:hover:border-brand-500"
    >
      <Avatar src={author.avatar} name={author.name} size="md" />
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink-900 dark:text-white">{author.name}</p>
        <p className="truncate text-sm text-ink-500">@{author.username}</p>
        {author.bio && <p className="mt-2 line-clamp-2 text-sm text-ink-600 dark:text-ink-300">{author.bio}</p>}
        <p className="mt-2 text-xs text-ink-500">{plural(author.posts, 'article')}</p>
      </div>
    </Link>
  );
}