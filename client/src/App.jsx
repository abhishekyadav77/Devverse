import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Spinner from './components/common/Spinner.jsx';
import ProtectedRoute from './components/routing/ProtectedRoute.jsx';
import AdminRoute from './components/routing/AdminRoute.jsx';
import GuestRoute from './components/routing/GuestRoute.jsx';

import About from './pages/About.jsx';

// Route-level code splitting: each page is its own chunk
const Home = lazy(() => import('./pages/public/Home.jsx'));
const Explore = lazy(() => import('./pages/public/Explore.jsx'));
const BlogDetails = lazy(() => import('./pages/public/BlogDetails.jsx'));
const Category = lazy(() => import('./pages/public/Category.jsx'));
const Tag = lazy(() => import('./pages/public/Tag.jsx'));
const Author = lazy(() => import('./pages/public/Author.jsx'));
const Search = lazy(() => import('./pages/public/Search.jsx'));
const Login = lazy(() => import('./pages/public/Login.jsx'));
const Register = lazy(() => import('./pages/public/Register.jsx'));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./pages/public/ResetPassword.jsx'));
const NotFound = lazy(() => import('./pages/public/NotFound.jsx'));

const DashboardOverview = lazy(() => import('./pages/dashboard/Overview.jsx'));
const Write = lazy(() => import('./pages/dashboard/Write.jsx'));
const MyPosts = lazy(() => import('./pages/dashboard/MyPosts.jsx'));
const EditPost = lazy(() => import('./pages/dashboard/EditPost.jsx'));
const Drafts = lazy(() => import('./pages/dashboard/Drafts.jsx'));
const Bookmarks = lazy(() => import('./pages/dashboard/Bookmarks.jsx'));
const Notifications = lazy(() => import('./pages/dashboard/Notifications.jsx'));
const Profile = lazy(() => import('./pages/dashboard/Profile.jsx'));
const Settings = lazy(() => import('./pages/dashboard/Settings.jsx'));

const AdminOverview = lazy(() => import('./pages/admin/AdminOverview.jsx'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers.jsx'));
const AdminPosts = lazy(() => import('./pages/admin/AdminPosts.jsx'));
const AdminComments = lazy(() => import('./pages/admin/AdminComments.jsx'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories.jsx'));
const AdminTags = lazy(() => import('./pages/admin/AdminTags.jsx'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics.jsx'));

export default function App() {
  return (
    <Suspense fallback={<Spinner className="min-h-screen" />}>
      <Routes>

        {/* Public */}
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="about" element={<About />} />
          <Route path="blog/:slug" element={<BlogDetails />} />
          <Route path="category/:slug" element={<Category />} />
          <Route path="tag/:slug" element={<Tag />} />
          <Route path="author/:username" element={<Author />} />
          <Route path="search" element={<Search />} />
        </Route>

        {/* Auth */}
        <Route element={<GuestRoute><AuthLayout /></GuestRoute>}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* User dashboard */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="write" element={<Write />} />
          <Route path="posts" element={<MyPosts />} />
          <Route path="posts/:id/edit" element={<EditPost />} />
          <Route path="drafts" element={<Drafts />} />
          <Route path="bookmarks" element={<Bookmarks />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Admin */}
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="posts" element={<AdminPosts />} />
          <Route path="comments" element={<AdminComments />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="tags" element={<AdminTags />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>

      </Routes>
    </Suspense>
  );
}