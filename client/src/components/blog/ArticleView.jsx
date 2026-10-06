import { Link } from 'react-router-dom';
import { Clock, Eye } from 'lucide-react';
import Avatar from '../common/Avatar.jsx';
import { cleanHtml } from '../../utils/sanitize.js';
import { formatCount, formatDate } from '../../utils/format.js';

// Shared by the public article page and the editor preview.
export default function ArticleView({ blog, preview = false }) {
  const author = blog.author || {};
  return (
    <article className="mx-auto max-w-3xl">
      {blog.category &&
        (preview ? (
          <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">{blog.category.name}</span>
        ) : (
          <Link to={`/category/${blog.category.slug}`} className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">
            {blog.category.name}
          </Link>
        ))}

      <h1 className="mt-3 text-4xl font-extrabold leading-[1.1] sm:text-5xl">{blog.title || 'Untitled'}</h1>
      {blog.subtitle && <p className="mt-4 text-xl text-ink-500">{blog.subtitle}</p>}

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-ink-200 py-4 dark:border-ink-800">
        <div className="flex items-center gap-3">
          <Avatar src={author.avatar} name={author.name} size="md" />
          <div className="text-sm">
            {preview ? (
              <span className="font-semibold">{author.name}</span>
            ) : (
              <Link to={`/author/${author.username}`} className="font-semibold hover:underline">{author.name}</Link>
            )}
                       <p className="text-ink-500">
              <time dateTime={new Date(blog.publishedAt || Date.now()).toISOString()}>{formatDate(blog.publishedAt || new Date())}</time>
            </p>
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-ink-500"><Clock size={15} /> {blog.readingTime} min read</p>
        {!preview && <p className="flex items-center gap-1.5 text-sm text-ink-500"><Eye size={15} /> {formatCount(blog.views)} views</p>}
      </div>

      {blog.coverImage && (
               <img src={blog.coverImage} alt="" fetchpriority="high" decoding="async" className="mt-8 w-full rounded-2xl object-cover" />
      )}

      <div className="article mt-10" dangerouslySetInnerHTML={{ __html: cleanHtml(blog.content) }} />

      {blog.tags?.length > 0 && (
        <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
          {blog.tags.map((tag) => (
            <li key={tag.slug || tag.name}>
              {preview ? (
                <span className="rounded-full bg-ink-100 px-3 py-1 text-sm dark:bg-ink-800">{tag.name}</span>
              ) : (
                <Link to={`/tag/${tag.slug}`} className="rounded-full bg-ink-100 px-3 py-1 text-sm hover:bg-ink-200 dark:bg-ink-800 dark:hover:bg-ink-700">
                  {tag.name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}