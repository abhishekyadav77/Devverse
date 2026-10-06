import { BarChart3, FileText, FolderTree, LayoutDashboard, MessageSquare, Tags, Users } from 'lucide-react';
import SidebarLayout from './SidebarLayout.jsx';

const items = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/posts', label: 'Posts', icon: FileText },
  { to: '/admin/comments', label: 'Comments', icon: MessageSquare },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/tags', label: 'Tags', icon: Tags },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AdminLayout() {
  return <SidebarLayout title="Admin" items={items} />;
}
