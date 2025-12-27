import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Breadcrumb } from "./components/Breadcrumb";
import { LoginDialog } from "./components/LoginDialog";
import { Toaster } from "./components/ui/sonner";

import { HomePage } from "./pages/HomePage";
import { ArticlePage } from "./pages/ArticlePage";
import { MyAccountPage } from "./pages/MyAccountPage";
import { WriterPage } from "./pages/WriterPage";
import { AuthorProfilePage } from "./pages/AuthorProfilePage";
import { TentangPage } from "./pages/TentangPage";
import { HubungiKamiPage } from "./pages/HubungiKamiPage";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AdminPage } from "./pages/AdminPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { ArticleList } from "./pages/ArticleList";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ArticleProvider } from "./contexts/ArticleContext";
import { BreadcrumbProvider } from "./contexts/BreadcrumbContext";
import { VerifyEmailPage } from "./pages/VerfifyEmailPage";

function AppContent() {
  const {
    isLoggedIn,
    isWriter,
    userProfile,
    readingHistory,
    savedArticles,
    logout,
    updateProfile,
  } = useAuth();

  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleArticleClick = (articleId: string) => {
    try {
      navigate(`/article/${articleId}`);
    } catch {
      window.location.href = `/article/${articleId}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        onLoginClick={() => setIsLoginDialogOpen(true)}
        onLogout={logout}
        isLoggedIn={isLoggedIn}
        isWriter={isWriter}
        userProfile={userProfile!}
        readingHistory={readingHistory}
        savedArticles={savedArticles}
        onUpdateProfile={updateProfile}
        onArticleClick={handleArticleClick}
      />

      <Breadcrumb />

      <main className="flex-1">
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="/" element={<HomePage />} />

          <Route path="/article/:id" element={<ArticlePage />} />

          <Route
            path="/account"
            element={
              isLoggedIn ? (
                <MyAccountPage
                  userProfile={userProfile!}
                  onUpdateProfile={updateProfile}
                  isWriter={isWriter}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/writer/edit/:articleId"
            element={
              isLoggedIn && isWriter ? (
                <WriterPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/writer"
            element={
              isLoggedIn && isWriter ? (
                <WriterPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/author/:id" element={<AuthorProfilePage />} />
          <Route path="/tentang" element={<TentangPage />} />
          <Route path="/hubungi-kami" element={<HubungiKamiPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          <Route path="/articles" element={<ArticleList />} />
          <Route path="/articles/:kategori" element={<ArticleList />} />
          <Route path="/articles/:kategori/:id" element={<ArticlePage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />

      <LoginDialog
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onLoginSuccess={() => setIsLoginDialogOpen(false)}
      />

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/">
      <AuthProvider>
        <ArticleProvider>
          <BreadcrumbProvider>
            <AppContent />
          </BreadcrumbProvider>
        </ArticleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
