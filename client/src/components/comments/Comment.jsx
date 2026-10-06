import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import Avatar from '../common/Avatar.jsx';
import CommentForm from './CommentForm.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useRequireAuth } from '../../hooks/useRequireAuth.js';
import { formatCount, timeAgo } from '../../utils/format.js';

// Renders one comment. Replies render as <Comment isReply /> inside their parent (one level deep).
export default function Comment({ comment, topId, isReply = false, handlers }) {
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);

  const author = comment.author;
  const isOwner = !!user && author?._id === user._id;
  const canDelete = isOwner || user?.role === 'admin';

  const startReply = () => requireAuth('Log in to reply') && setReplying(true);
  const like = () => requireAuth('Log in to like comments') && handlers.onLike(comment);

  return (
    <div className="flex gap-3">
      <Avatar src={author?.avatar} name={author?.name} size={isReply ? 'sm' : 'md'} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
          {author ? (
            <Link to={`/author/${author.username}`} className="font-semibold text-ink-900 hover:underline dark:text-white">{author.name}</Link>
          ) : (
            <span className="font-semibold">Deleted user</span>
          )}
          <span className="text-xs text-ink-500">
            {timeAgo(comment.createdAt)}{comment.editedAt && ' (edited)'}
          </span>
        </div>

        {editing ? (
          <div className="mt-2">
            <CommentForm
              autoFocus
              initialValue={comment.content}
              submitLabel="Save"
              placeholder="Edit your comment"
              onCancel={() => setEditing(false)}
              onSubmit={async (text) => {
                await handlers.onEdit(comment, text);
                setEditing(false);
              }}
            />
          </div>
        ) : (
          <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink-800 dark:text-ink-200">
            {isReply && comment.replyTo && (
              <Link to={`/author/${comment.replyTo.username}`} className="mr-1 font-medium text-brand-700 hover:underline dark:text-brand-300">
                @{comment.replyTo.username}
              </Link>
            )}
            {comment.content}
          </p>
        )}

        {!editing && (
          <div className="-ml-2 mt-1 flex flex-wrap items-center gap-1 text-xs">
            <button
              type="button"
              onClick={like}
              aria-pressed={comment.liked}
              aria-label={comment.liked ? 'Unlike comment' : 'Like comment'}
              className={`btn-ghost !gap-1.5 !px-2 !py-1 ${comment.liked ? '!text-red-600 dark:!text-red-400' : ''}`}
            >
              <Heart size={14} fill={comment.liked ? 'currentColor' : 'none'} /> {formatCount(comment.likesCount)}
            </button>
            <button type="button" onClick={startReply} className="btn-ghost !gap-1.5 !px-2 !py-1">
              <MessageCircle size={14} /> Reply
            </button>
            {isOwner && (
              <button type="button" onClick={() => setEditing(true)} className="btn-ghost !gap-1.5 !px-2 !py-1">
                <Pencil size={14} /> Edit
              </button>
            )}
            {canDelete && (
              <button type="button" onClick={() => handlers.onDelete(comment, topId)} className="btn-ghost !gap-1.5 !px-2 !py-1 hover:!text-red-600">
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
        )}

        {replying && (
          <div className="mt-3">
            <CommentForm
              autoFocus
              submitLabel="Reply"
              placeholder={`Reply to ${author?.name || 'this comment'}`}
              onCancel={() => setReplying(false)}
              onSubmit={async (text) => {
                await handlers.onReply(comment, text);
                setReplying(false);
              }}
            />
          </div>
        )}

        {!isReply && comment.replies?.length > 0 && (
          <div className="mt-4 space-y-5 border-l-2 border-ink-100 pl-4 dark:border-ink-800">
            {comment.replies.map((reply) => (
              <Comment key={reply._id} comment={reply} topId={comment._id} isReply handlers={handlers} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}