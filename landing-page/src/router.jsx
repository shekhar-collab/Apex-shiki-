import { Navigate, createBrowserRouter } from 'react-router-dom';
import WebsiteLayout from './layouts/WebsiteLayout';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import HomePage from './pages/website/HomePage';
import AboutPage from './pages/website/AboutPage';
import ServicesPage from './pages/website/ServicesPage';
import ProductsPage from './pages/website/ProductsPage';
import ContactPage from './pages/website/ContactPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserDashboardPage from './pages/user/UserDashboardPage';
import PlaceholderPage from './pages/shared/PlaceholderPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <WebsiteLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <AdminDashboardPage /> },
          { path: 'products', element: <PlaceholderPage title="Admin Products" description="Products management will be routed here." /> },
          { path: 'orders', element: <PlaceholderPage title="Admin Orders" description="Orders management will be routed here." /> },
          { path: 'users', element: <PlaceholderPage title="Admin Users" description="Users management will be routed here." /> },
          { path: 'settings', element: <PlaceholderPage title="Admin Settings" description="Admin settings will be routed here." /> },
        ],
      },
    ],
  },
  {
    path: '/user',
    element: <ProtectedRoute allowedRoles={['member']} />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <UserDashboardPage /> },
          { path: 'profile', element: <PlaceholderPage title="User Profile" description="Profile management will be routed here." /> },
          { path: 'orders', element: <PlaceholderPage title="User Orders" description="Order history will be routed here." /> },
          { path: 'wishlist', element: <PlaceholderPage title="User Wishlist" description="Wishlist will be routed here." /> },
          { path: 'notifications', element: <PlaceholderPage title="User Notifications" description="Notifications will be routed here." /> },
          { path: 'settings', element: <PlaceholderPage title="User Settings" description="Account settings will be routed here." /> },
        ],
      },
    ],
  },
]);
