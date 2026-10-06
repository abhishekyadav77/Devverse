import { Link } from 'react-router-dom';
import { CornerDownRight, Heart, MessageCircle, UserPlus } from 'lucide-react';
import Avatar from '../common/Avatar.jsx';
import { timeAgo } from '../../utils/format.js';

const ICONS = { follow: UserPlus, like: Heart, comment: MessageCircle, reply: CornerDownRight };

// Where clicking a notification should go (null when its target no longer exists)
const targetFor = (n) => {
  if (n.type === 'follow') return n.sender ? `/author/${n.sender.username}` : null;
  if (!n.blog) return null;
  return `/blog/${n.blog.slug}${n.type === 'like' ? '' : '#comments'}`;
};

export default function NotificationItem({ notification: n, onOpen }) {
  const Icon = ICONS[n.type] || MessageCircle;
  const to = targetFor(n);

  const body = (
    <>
      <div className="relative shrink-0">
        <Avatar src={n.sender?.avatar} name={n.sender?.name} size="md" />
        <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white ring-2 ring-white dark:ring-ink-900">
          <Icon size={11} />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${n.read ? 'text-ink-600 dark:text-ink-300' : 'font-medium text-ink-900 dark:text-white'}`}>
          {n.message}
        </p>
        <p className="mt-0.5 text-xs text-ink-500">{timeAgo(n.createdAt)}</p>
      </div>
      {!n.read && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" aria-label="Unread" />}
    </>
  );

  const cls = `flex items-start gap-3 px-4 py-3 ${n.read ? '' : 'bg-brand-50/60 dark:bg-brand-900/10'}`;

  return to ? (
    <Link to={to} onClick={() => onOpen(n)} className={`${cls} hover:bg-ink-50 dark:hover:bg-ink-800`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}