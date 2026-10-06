import { Bell, Bookmark, FileText, LayoutDashboard, PenLine, PencilRuler, Settings, UserRound } from 'lucide-react';
import SidebarLayout from './SidebarLayout.jsx';

const items = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/write', label: 'Write', icon: PenLine },
  { to: '/dashboard/posts', label: 'My posts', icon: FileText },
  { to: '/dashboard/drafts', label: 'Drafts', icon: PencilRuler },
  { to: '/dashboard/bookmarks', label: 'Saved', icon: Bookmark },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { to: '/dashboard/profile', label: 'Profile', icon: UserRound },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout() {
  return <SidebarLayout title="Dashboard" items={items} />;
}