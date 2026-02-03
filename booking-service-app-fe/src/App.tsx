import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { SplashScreen } from '@/screens/SplashScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { BookingScreen } from '@/screens/BookingScreen';
import { ConfirmationScreen } from '@/screens/ConfirmationScreen';
import { PaymentScreen } from '@/screens/PaymentScreen';
import { PaymentSuccessScreen } from '@/screens/PaymentSuccessScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { TableMapScreen } from '@/screens/TableMapScreen';
import { AdminDashboard } from '@/screens/AdminDashboard';
import { LogoPage } from '@/components/LogoPage';
import { NotificationScreen } from '@/screens/NotificationScreen';

import { setFavicon, setDocumentTitle } from '@/utils/favicon';
import { NotificationProvider } from '@/context/NotificationContext';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  const [userRole, setUserRole] = useState<'guest' | 'staff'>('guest');

  useEffect(() => {
    setFavicon();
    setDocumentTitle('Quản Lý Đặt Bàn - Dễ dàng & Nhanh chóng');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <div className="min-h-screen bg-white">
          <Routes>
            {/* Splash */}
            <Route path="/" element={<SplashScreen />} />

            {/* Auth */}
            <Route path="/login" element={<LoginScreen onLogin={(role) => setUserRole(role)} />} />

            {/* Guest routes */}
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/booking" element={<BookingScreen />} />
            <Route path="/confirmation" element={<ConfirmationScreen />} />
            <Route path="/payment" element={<PaymentScreen />} />
            <Route path="/payment-success" element={<PaymentSuccessScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/table-map" element={<TableMapScreen />} />
            <Route path="/notifications" element={<NotificationScreen />} />

            {/* Admin */}
            <Route
              path="/admin"
              element={userRole === 'staff' ? <AdminDashboard /> : <Navigate to="/login" replace />}
            />

            {/* Misc */}
            <Route path="/logo" element={<LogoPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </NotificationProvider>
    </QueryClientProvider>
  );
}
