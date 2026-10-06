import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Github, Globe, Linkedin } from 'lucide-react';
import FollowButton from '../../components/author/FollowButton.jsx';
import BlogGrid from '../../components/blog/BlogGrid.jsx';
import SortTabs from '../../components/blog/SortTabs.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useSeo } from '../../hooks/useSeo.js';
import { useListParams } from '../../hooks/useListParams.js';
import { usePagedBlogs } from '../../hooks/usePagedBlogs.js';
import { listBlogs } from '../../services/blogService.js';
import { getAuthor } from '../../services/userService.js';
import { formatCount } from '../../utils/format.js';

const SOCIALS = [
  { key: 'website', label: 'Website', icon: Globe },
  { key: 'github', label: 'GitHub', icon: Github },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
];

function Stat({ value, label }) {
  return (
    <div>
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="font-display text-2xl font-bold text-ink-900 dark:text-white">{formatCount(value)}</dd>
    </div>
  );
}

export default function Author() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const meId = me?._id;
  const { page, sort, setPage, setSort } = useListParams();
  const [profile, setProfile] = useState({ loading: true, data: null, error: null });

  // Re-fetched when the viewer logs in or out so "Following" is correct
  useEffect(() => {
    let active = true;
    setProfile({ loading: true, data: null, error: null });
    getAuthor(username)
      .then((data) => active && setProfile({ loading: false, data, error: null }))
      .catch((error) => active && setProfile({ loading: false, data: null, error }));
    return () => {
      active = false;
    };
  }, [username, meId]);

  const fetcher = useCallback(
    () => listBlogs({ author: username, sort, page, limit: 9 }),
    [username, sort, page]
  );
  const [posts, retry] = usePagedBlogs(fetcher);

  const author = profile.data?.user;
    useSeo(
    author
      ? {
          title: `${author.name} (@${author.username})`,
          description: author.bio || `Articles by ${author.name} on DevVerse.`,
          image: author.avatar,
          path: `/author/${author.username}`,
          type: 'profile',
        }
      : { noindex: !!profile.error }
  );

  const onFollowChange = (followersCount, isFollowing) =>
    setProfile((p) => ({
      ...p,
      data: { ...p.data, isFollowing, user: { ...p.data.user, followersCount } },
    }));

  if (profile.loading) return <Spinner className="min-h-[50vh]" />;

  if (profile.error) {
    const notFound = profile.error.response?.status === 404;
    return (
      <div className="container-page py-20">
        <EmptyState
          title={notFound ? "We couldn't find that author" : 'Could not load this profile'}
          text={notFound ? 'The username may be misspelled, or the account is no longer active.' : profile.error.message}
          action={<Link to="/explore" className="btn-primary">Browse articles</Link>}
        />
      </div>
    );
  }

  const isMe = !!me && me._id === author._id;
  const socials = SOCIALS.filter((s) => author[s.key]);

  return (
    <section className="container-page py-12">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <Avatar src={author.avatar} name={author.name} size="lg" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold">{author.name}</h1>
              <p className="text-ink-500">@{author.username}</p>
            </div>
            {isMe ? (
              <Link to="/dashboard/profile" className="btn-secondary">Edit profile</Link>
            ) : (
              <FollowButton userId={author._id} initialFollowing={profile.data.isFollowing} onChange={onFollowChange} />
            )}
          </div>

          {author.bio && <p className="mt-4 max-w-2xl whitespace-pre-line text-ink-700 dark:text-ink-200">{author.bio}</p>}

          {socials.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {socials.map(({ key, label, icon: Icon }) => (
                <li key={key}>
                  <a
                    href={author[key]}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-brand-700 dark:text-ink-300 dark:hover:text-brand-300"
                  >
                    <Icon size={16} /> {label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <dl className="mt-6 flex gap-8">
            <Stat value={author.postsCount} label="Posts" />
            <Stat value={author.followersCount} label="Followers" />
            <Stat value={author.followingCount} label="Following" />
          </dl>

          <p className="mt-4 text-xs text-ink-500">
            Joined {new Date(author.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </header>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 pt-8 dark:border-ink-800">
        <h2 className="text-2xl font-bold">Articles</h2>
        <SortTabs value={sort} onChange={setSort} />
      </div>

      <div className="mt-6">
        <BlogGrid
          state={posts}
          onRetry={retry}
          page={page}
          onPageChange={setPage}
          emptyTitle={isMe ? "You haven't published anything yet" : `${author.name.split(' ')[0]} hasn't published anything yet`}
          emptyText={isMe ? 'Publish a post and it will appear here.' : 'Follow them to be notified when they do.'}
          emptyAction={isMe ? <Link to="/dashboard/write" className="btn-primary">Start writing</Link> : undefined}
        />
      </div>
    </section>
  );
}