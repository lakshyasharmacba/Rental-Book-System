import { Routes, Route } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { AdminRoute } from '../components/layout/AdminRoute';

// Features
import HomePage from '../features/items/HomePage';
import SearchPage from '../features/items/SearchPage';
import ItemDetailPage from '../features/items/ItemDetailPage';
import CreateItemPage from '../features/items/CreateItemPage';
import EditItemPage from '../features/items/EditItemPage';

import LoginPage from '../features/auth/LoginPage';
import SignupPage from '../features/auth/SignupPage';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/ResetPasswordPage';
import VerifyEmailPage from '../features/auth/VerifyEmailPage';
import VerifyPhonePage from '../features/auth/VerifyPhonePage';
import GoogleCallbackPage from '../features/auth/GoogleCallbackPage';

import BookingPage from '../features/booking/BookingPage';
import BookingConfirmedPage from '../features/booking/BookingConfirmedPage';
import PickupPage from '../features/booking/PickupPage';
import ReturnPage from '../features/booking/ReturnPage';
import InspectionPage from '../features/booking/InspectionPage';
import MyBookingsPage from '../features/booking/MyBookingsPage';
import BookingDetailPage from '../features/booking/BookingDetailPage';

import DisputePage from '../features/dispute/DisputePage';
import DisputeForm from '../features/dispute/DisputeForm';

import OwnerDashboard from '../features/dashboard/OwnerDashboard';

import AdminDashboard from '../features/admin/AdminDashboard';
import AdminDisputes from '../features/admin/AdminDisputes';
import AdminUsers from '../features/admin/AdminUsers';
import AdminBookings from '../features/admin/AdminBookings';
import AdminConfig from '../features/admin/AdminConfig';
import AdminLedger from '../features/admin/AdminLedger';
import AdminAuditLog from '../features/admin/AdminAuditLog';

import ProfilePage from '../features/profile/ProfilePage';
import EditProfilePage from '../features/profile/EditProfilePage';
import PublicProfilePage from '../features/profile/PublicProfilePage';

import FavoritesPage from '../features/favorites/FavoritesPage';
import NotificationsPage from '../features/notifications/NotificationsPage';

export const Router = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/items/:id" element={<ItemDetailPage />} />
        <Route path="/profile/:id" element={<PublicProfilePage />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-phone" element={<VerifyPhonePage />} />
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

        {/* Protected user routes */}
        <Route path="/items/new" element={<ProtectedRoute><CreateItemPage /></ProtectedRoute>} />
        <Route path="/items/:id/edit" element={<ProtectedRoute><EditItemPage /></ProtectedRoute>} />
        
        <Route path="/booking/new" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="/booking/:id/confirmed" element={<ProtectedRoute><BookingConfirmedPage /></ProtectedRoute>} />
        <Route path="/booking/:id/pickup" element={<ProtectedRoute><PickupPage /></ProtectedRoute>} />
        <Route path="/booking/:id/return" element={<ProtectedRoute><ReturnPage /></ProtectedRoute>} />
        <Route path="/booking/:id/inspection" element={<ProtectedRoute><InspectionPage /></ProtectedRoute>} />
        
        <Route path="/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
        <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetailPage /></ProtectedRoute>} />
        
        <Route path="/dispute/new" element={<ProtectedRoute><DisputeForm /></ProtectedRoute>} />
        <Route path="/dispute/:id" element={<ProtectedRoute><DisputePage /></ProtectedRoute>} />
        
        <Route path="/owner/dashboard" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
        
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/disputes" element={<AdminRoute><AdminDisputes /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/bookings" element={<AdminRoute><AdminBookings /></AdminRoute>} />
        <Route path="/admin/config" element={<AdminRoute><AdminConfig /></AdminRoute>} />
        <Route path="/admin/ledger" element={<AdminRoute><AdminLedger /></AdminRoute>} />
        <Route path="/admin/audit" element={<AdminRoute><AdminAuditLog /></AdminRoute>} />
      </Route>
    </Routes>
  );
};
