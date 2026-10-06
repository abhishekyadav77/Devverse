import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar.jsx';
import { formatDate } from '../../utils/format.js';
import { optimizeImage } from '../../utils/image.js';

export default function FeaturedBlog({ blog }) {
  const url = `/blog/${blog.slug}`;
  return (
    <article className="grid gap-8 lg:grid-cols-2 lg:items-center">
      <Link to={url} className="block aspect-[16/10] overflow-hidden rounded-3xl bg-ink-100 dark:bg-ink-800" tabIndex={-1} aria-hidden="true">
        {blog.coverImage && <img src={optimizeImage(blog.coverImage, 1200)} alt="" className="h-full w-full object-cover" />}
      </Link>
      <div>
        {blog.category && (
          <Link to={`/category/${blog.category.slug}`} className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">
            {blog.category.name}
          </Link>
        )}
        <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
          <Link to={url} className="hover:text-brand-700 dark:hover:text-brand-300">{blog.title}</Link>
        </h2>
        <p className="mt-4 line-clamp-3 text-lg text-ink-600 dark:text-ink-300">{blog.excerpt}</p>
        <div className="mt-6 flex items-center gap-3">
          <Avatar src={blog.author?.avatar} name={blog.author?.name} size="md" />
          <div className="text-sm">
            <Link to={`/author/${blog.author?.username}`} className="font-semibold hover:underline">{blog.author?.name}</Link>
            <p className="text-ink-500">{formatDate(blog.publishedAt)} &middot; {blog.readingTime} min read</p>
          </div>
        </div>
        <Link to={url} className="btn-primary mt-8">Read article</Link>
      </div>
    </article>
  );
}