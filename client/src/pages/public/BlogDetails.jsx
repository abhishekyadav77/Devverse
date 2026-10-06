import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import AuthorBox from '../../components/author/AuthorBox.jsx';
import ArticleView from '../../components/blog/ArticleView.jsx';
import BookmarkButton from '../../components/blog/BookmarkButton.jsx';
import LikeButton from '../../components/blog/LikeButton.jsx';
import ShareButton from '../../components/blog/ShareButton.jsx';
import CommentSection from '../../components/comments/CommentSection.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { useSeo } from '../../hooks/useSeo.js';
import { getBlogBySlug } from '../../services/blogService.js';
import { isFuture } from '../../utils/format.js';
import { blogJsonLd, ogImage } from '../../utils/seo.js';

export default function BlogDetails() {
  const { slug } = useParams();
  const { hash } = useLocation();
  const [state, setState] = useState({ loading: true, blog: null, error: null });

  useEffect(() => {
    let active = true;
    setState({ loading: true, blog: null, error: null });
    getBlogBySlug(slug)
      .then((blog) => active && setState({ loading: false, blog, error: null }))
      .catch((error) => active && setState({ loading: false, blog: null, error }));
    return () => {
      active = false;
    };
  }, [slug]);

  const { blog } = state;
  const notLive = !!blog && (blog.status !== 'published' || blog.isHidden || isFuture(blog.publishedAt));

  // Drafts, scheduled and hidden previews are never indexed
  useSeo(
    blog
      ? notLive
        ? { title: blog.title || 'Draft', noindex: true }
        : {
            title: blog.seo?.title || blog.title,
            description: blog.seo?.description || blog.subtitle || blog.excerpt,
            image: ogImage(blog.coverImage),
            path: `/blog/${blog.slug}`,
            type: 'article',
            jsonLd: blogJsonLd(blog),
          }
      : state.error
        ? { title: 'Article not found', noindex: true }
        : {}
  );

  // Arriving from a comment/reply notification: jump to the discussion once the page has loaded
  useEffect(() => {
    if (blog && hash === '#comments') {
      requestAnimationFrame(() => document.getElementById('comments')?.scrollIntoView());
    }
  }, [blog, hash]);

  if (state.loading) return <Spinner className="min-h-[50vh]" />;

  if (state.error) {
    const notFound = state.error.response?.status === 404;
    return (
      <div className="container-page py-20">
        <EmptyState
          title={notFound ? "This article isn't available" : 'Could not load this article'}
          text={notFound ? 'It may have been moved, unpublished or deleted.' : state.error.message}
          action={<Link to="/explore" className="btn-primary">Browse articles</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      {notLive && (
        <div className="mx-auto mb-8 flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          <span>
            {blog.isHidden
              ? 'This post was hidden by moderators. Only you and admins can see it.'
              : `${blog.status === 'draft' ? 'This is a draft.' : 'This post is not public yet.'} Only you can see it.`}
          </span>
          <Link to={`/dashboard/posts/${blog._id}/edit`} className="font-semibold underline">Edit post</Link>
        </div>
      )}

      <ArticleView blog={blog} />

      {/* Likes, saves, follows and comments only exist for publicly visible posts */}
      {!notLive && (
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-ink-200 py-3 dark:border-ink-800">
            <div className="flex items-center gap-1">
              <LikeButton blogId={blog._id} initialCount={blog.likesCount} />
              <a href="#comments" className="btn-ghost"><MessageCircle size={18} /> Comments</a>
            </div>
            <div className="flex items-center gap-1">
              <BookmarkButton blogId={blog._id} label />
              <ShareButton title={blog.title} />
            </div>
          </div>

          <AuthorBox author={blog.author} />
          <CommentSection blogId={blog._id} initialCount={blog.commentsCount} />
        </div>
      )}
    </div>
  );
}