import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext.tsx';
import { EventProvider } from './context/EventContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/common/Navbar.tsx';
import { Footer } from './components/common/Footer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { RegistrationPage } from './pages/RegistrationPage.tsx';
import { RegistrationSuccessPage } from './pages/RegistrationSuccessPage.tsx';
import { CheckRegistrationPage } from './pages/CheckRegistrationPage.tsx';
import { PrivacyPage } from './pages/PrivacyPage.tsx';
import { TermsPage } from './pages/TermsPage.tsx';
import { PublicCertificatePage } from './pages/PublicCertificatePage.tsx';
import { AdminLoginPage } from './pages/AdminLoginPage.tsx';
import { AdminLayout } from './components/admin/AdminLayout.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { AdminRegistrationsPage } from './pages/AdminRegistrationsPage.tsx';
import { AdminCheckinPage } from './pages/AdminCheckinPage.tsx';
import { AdminReportsPage } from './pages/AdminReportsPage.tsx';
import { AdminSettingsPage } from './pages/AdminSettingsPage.tsx';
import { AdminUsersPage } from './pages/AdminUsersPage.tsx';
import { AdminCertificatesPage } from './pages/AdminCertificatesPage.tsx';
import { AdminBadgesPage } from './pages/AdminBadgesPage.tsx';
import { Registration } from './types/index.ts';

function AppContent() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Route state initialized from current URL
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const p = window.location.pathname;
    return p && p !== '' ? p : '/';
  });

  const [recentRegistration, setRecentRegistration] = useState<Registration | null>(null);

  // Sync browser popstate (back/forward button)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    try {
      window.history.pushState({}, '', path);
    } catch {
      // In some sandbox environments pushState may be restricted
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth redirect guards for admin routes
  const isAdminRoute = currentPath.startsWith('/admin');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If navigating to an admin route (other than /admin/login) while not logged in, show login page
  if (isAdminRoute && currentPath !== '/admin/login' && !isAuthenticated) {
    return <AdminLoginPage onNavigate={navigate} />;
  }

  // If on /admin/login while already logged in, redirect to dashboard
  if (currentPath === '/admin/login' && isAuthenticated) {
    return (
      <AdminLayout currentPath="/admin/dashboard" onNavigate={navigate}>
        <AdminDashboardPage onNavigate={navigate} />
      </AdminLayout>
    );
  }

  // Render Admin Layout and Views
  if (isAdminRoute && isAuthenticated) {
    let adminComponent = <AdminDashboardPage onNavigate={navigate} />;

    if (currentPath === '/admin/inscritos') {
      adminComponent = <AdminRegistrationsPage />;
    } else if (currentPath === '/admin/crachas') {
      adminComponent = <AdminBadgesPage />;
    } else if (currentPath === '/admin/checkin') {
      adminComponent = <AdminCheckinPage />;
    } else if (currentPath === '/admin/certificados') {
      adminComponent = <AdminCertificatesPage />;
    } else if (currentPath === '/admin/relatorios') {
      adminComponent = <AdminReportsPage />;
    } else if (currentPath === '/admin/configuracoes') {
      adminComponent = <AdminSettingsPage />;
    } else if (currentPath === '/admin/usuarios') {
      adminComponent = isAdmin ? <AdminUsersPage /> : <AdminDashboardPage onNavigate={navigate} />;
    } else {
      adminComponent = <AdminDashboardPage onNavigate={navigate} />;
    }

    return (
      <AdminLayout currentPath={currentPath} onNavigate={navigate}>
        {adminComponent}
      </AdminLayout>
    );
  }

  // Public Pages Layout
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      <Navbar currentPath={currentPath} onNavigate={navigate} />

      <main className="flex-1">
        {currentPath === '/' && <HomePage onNavigate={navigate} />}

        {currentPath === '/inscricao' && (
          <RegistrationPage
            onNavigate={navigate}
            onSuccess={(reg) => {
              setRecentRegistration(reg);
            }}
          />
        )}

        {currentPath === '/inscricao/sucesso' && (
          <RegistrationSuccessPage
            registration={recentRegistration}
            onNavigate={navigate}
          />
        )}

        {currentPath === '/consultar-inscricao' && (
          <CheckRegistrationPage onNavigate={navigate} />
        )}

        {(currentPath === '/certificado' || currentPath.startsWith('/certificado/')) && (
          <PublicCertificatePage onNavigate={navigate} />
        )}

        {currentPath === '/privacidade' && <PrivacyPage onNavigate={navigate} />}

        {currentPath === '/termos' && <TermsPage onNavigate={navigate} />}

        {currentPath === '/admin/login' && <AdminLoginPage onNavigate={navigate} />}
      </main>

      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <EventProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </EventProvider>
    </ToastProvider>
  );
}
