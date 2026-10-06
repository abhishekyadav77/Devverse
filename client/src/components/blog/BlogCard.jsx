import { Link } from 'react-router-dom';
import { Eye, Heart } from 'lucide-react';
import Avatar from '../common/Avatar.jsx';
import BookmarkButton from './BookmarkButton.jsx';
import { formatCount, formatDate } from '../../utils/format.js';
import { optimizeImage } from '../../utils/image.js';

export default function BlogCard({ blog, onBookmarkChange }) {
  const url = `/blog/${blog.slug}`;
  return (
    <article className="card flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link to={url} className="block aspect-[16/9] bg-ink-100 dark:bg-ink-800" tabIndex={-1} aria-hidden="true">
        {blog.coverImage && <img src={optimizeImage(blog.coverImage, 800)} alt="" loading="lazy" className="h-full w-full object-cover" />}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {blog.category && (
          <Link to={`/category/${blog.category.slug}`} className="text-xs font-semibold text-brand-700 hover:underline dark:text-brand-300">
            {blog.category.name}
          </Link>
        )}
        <h3 className="mt-2 text-lg font-bold leading-snug">
          <Link to={url} className="hover:text-brand-700 dark:hover:text-brand-300">{blog.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink-500">{blog.excerpt}</p>

        <div className="mt-auto pt-5">
          <div className="flex items-center gap-2.5">
            <Avatar src={blog.author?.avatar} name={blog.author?.name} />
            <div className="min-w-0 text-xs">
              <Link to={`/author/${blog.author?.username}`} className="block truncate font-semibold text-ink-800 hover:underline dark:text-ink-100">
                {blog.author?.name}
              </Link>
              <span className="text-ink-500">{formatDate(blog.publishedAt)} &middot; {blog.readingTime} min read</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="flex items-center gap-4 text-xs text-ink-500">
              <span className="flex items-center gap-1.5"><Heart size={14} /> {formatCount(blog.likesCount)}</span>
              <span className="flex items-center gap-1.5"><Eye size={14} /> {formatCount(blog.views)}</span>
            </p>
            <BookmarkButton blogId={blog._id} onChange={onBookmarkChange} />
          </div>
        </div>
      </div>
    </article>
  );
}