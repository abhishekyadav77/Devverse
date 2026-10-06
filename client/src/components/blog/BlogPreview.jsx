import ArticleView from './ArticleView.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { calcReadingTime } from '../editor/readingTime.js';

export default function BlogPreview({ form, categories }) {
  const { user } = useAuth();
  const blog = {
    ...form,
    author: user,
    category: categories.find((c) => c._id === form.category) || null,
    tags: form.tags.map((name) => ({ name })),
    readingTime: calcReadingTime(form.content),
  };
  return (
    <div className="rounded-2xl border border-dashed border-ink-300 p-4 sm:p-8 dark:border-ink-700">
      <p className="mb-6 text-center text-sm text-ink-500">Preview. This is how readers will see your post.</p>
      <ArticleView blog={blog} preview />
    </div>
  );
}