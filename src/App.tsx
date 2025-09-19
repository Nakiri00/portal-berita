import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { ArticlePage } from './pages/ArticlePage';
import { MyAccountPage } from './pages/MyAccountPage';
import { WriterPage } from './pages/WriterPage';
import { AuthorProfilePage } from './pages/AuthorProfilePage';
import { BeritaTerkiniPage } from './pages/BeritaTerkiniPage';
import { TipsTrikPage } from './pages/TipsTrikPage';
import { TentangPage } from './pages/TentangPage';
import { HubungiKamiPage } from './pages/HubungiKamiPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoginDialog } from './components/LoginDialog';
import { Footer } from './components/Footer';
import { Breadcrumb } from './components/Breadcrumb';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ArticleProvider } from './contexts/ArticleContext';

function AppContent() {
  const { 
    isLoggedIn, 
    isWriter, 
    userProfile, 
    readingHistory, 
    savedArticles, 
    login, 
    logout, 
    updateProfile 
  } = useAuth();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    setIsLoginDialogOpen(true);
  };

  const handleLoginClose = () => {
    setIsLoginDialogOpen(false);
  };

  const handleLoginSuccess = (asWriter: boolean = false) => {
    login(asWriter);
    setIsLoginDialogOpen(false);
  };

  const handleArticleClick = (articleId: string) => {
    try {
      navigate(`/article/${articleId}`);
    } catch (error) {
      // Fallback navigation
      window.location.href = `/article/${articleId}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        onLoginClick={handleLoginClick}
        onLogout={logout}
        isLoggedIn={isLoggedIn}
        isWriter={isWriter}
        userProfile={userProfile}
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
                  userProfile={userProfile} 
                  onUpdateProfile={updateProfile}
                  isWriter={isWriter}
                />
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
          <Route path="/author/:id" element={<AuthorProfilePage />} />
          <Route path="/berita-terkini" element={<BeritaTerkiniPage />} />
          <Route path="/tips-trik" element={<TipsTrikPage />} />
          <Route path="/tentang" element={<TentangPage />} />
          <Route path="/hubungi-kami" element={<HubungiKamiPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />

      <LoginDialog 
        isOpen={isLoginDialogOpen}
        onClose={handleLoginClose}
        onLoginSuccess={handleLoginSuccess}
      />

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ArticleProvider>
          <AppContent />
        </ArticleProvider>
      </AuthProvider>
    </Router>
  );
}