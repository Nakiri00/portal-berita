import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  joinDate: string;
  instagram?: string;
  facebook?: string;
  threads?: string;
  role?: 'user' | 'writer' | 'admin';
}

interface ReadHistory {
  articleId: string;
  title: string;
  readDate: string;
  readCount: number;
}

interface SavedArticle {
  articleId: string;
  title: string;
  excerpt: string;
  author: string;
  savedDate: string;
  imageUrl: string;
  tag: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isWriter: boolean;
  isAdmin: boolean;
  userProfile: UserProfile | null;
  followedAuthors: string[];
  readingHistory: ReadHistory[];
  savedArticles: SavedArticle[];
  writerArticles: any[];
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, role?: 'user' | 'writer') => Promise<{ success: boolean; message?: string }>;
  loginWithToken: (token: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ success: boolean; message?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; resetLink?: string }>;
  followAuthor: (authorId: string) => void;
  unfollowAuthor: (authorId: string) => void;
  isFollowing: (authorId: string) => boolean;
  addToReadingHistory: (articleId: string, title: string) => void;
  saveArticle: (article: SavedArticle) => void;
  unsaveArticle: (articleId: string) => void;
  isArticleSaved: (articleId: string) => boolean;
  addWriterArticle: (article: any) => void;
  updateWriterArticle: (articleId: string, article: any) => void;
  deleteWriterArticle: (articleId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isWriter, setIsWriter] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followedAuthors, setFollowedAuthors] = useState<string[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadHistory[]>([]);
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [writerArticles, setWriterArticles] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Helper function to get auth headers (didefinisikan di awal karena digunakan di useEffect dan useCallback)
  const getAuthHeaders = React.useCallback(() => {
    const token = localStorage.getItem('portal_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }, []);

  // Verify token with API (didefinisikan di awal karena digunakan di useEffect)
  const verifyToken = React.useCallback(async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const role = data.data.user.role;
          
          setUserProfile({
            ...data.data.user,
            joinDate: new Date(data.data.user.createdAt).toLocaleDateString('id-ID')
          });
          setIsLoggedIn(true);
          
          // LOGIKA ROLE DIPISAH
          setIsAdmin(role === 'admin');
          setIsWriter(role === 'writer' || role === 'admin');
        }
      } else {
        // Token invalid, remove it
        localStorage.removeItem('portal_token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('portal_token');
    }
  }, []); 

  // Load user data from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('portal_token');
    if (savedToken) {
      // Verify token with API
      verifyToken(savedToken);
    }
  }, [verifyToken]); 

  // Login function with real API
  const login = React.useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token
        localStorage.setItem('portal_token', data.data.token);
        
        // Set user data
        const role = data.data.user.role; 
        setUserProfile({
          ...data.data.user,
          joinDate: new Date(data.data.user.createdAt).toLocaleDateString('id-ID')
        });
        setIsLoggedIn(true);
        
        // LOGIKA ROLE DIPISAH
        setIsAdmin(role === 'admin');
        setIsWriter(role === 'writer' || role === 'admin');
        
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Terjadi kesalahan saat login' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function with real API
  const register = React.useCallback(async (name: string, email: string, password: string, role: 'user' | 'writer' = 'user') => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token
        localStorage.setItem('portal_token', data.data.token);
        
        // Set user data
        const newRole = data.data.user.role; 
        setUserProfile({
          ...data.data.user,
          joinDate: new Date(data.data.user.createdAt).toLocaleDateString('id-ID')
        });
        setIsLoggedIn(true);
        
        // LOGIKA ROLE DIPISAH
        setIsAdmin(newRole === 'admin');
        setIsWriter(newRole === 'writer' || newRole === 'admin');
        
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Terjadi kesalahan saat registrasi' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Login with token (for OAuth)
  const loginWithToken = React.useCallback(async (token: string) => {
    setLoading(true);
    try {
      // Store token
      localStorage.setItem('portal_token', token);
      
      // Verify token and get user data
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        const role = data.data.user.role; 
        setUserProfile({
          ...data.data.user,
          joinDate: new Date(data.data.user.createdAt).toLocaleDateString('id-ID')
        });
        setIsLoggedIn(true);
        
        // LOGIKA ROLE DIPISAH
        setIsAdmin(role === 'admin');
        setIsWriter(role === 'writer' || role === 'admin');
        
        return { success: true };
      } else {
        localStorage.removeItem('portal_token');
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Token login error:', error);
      localStorage.removeItem('portal_token');
      return { success: false, message: 'Terjadi kesalahan saat login' };
    } finally {
      setLoading(false);
    }
  }, []);

  // FUNGSI LOGOUT DENGAN NAVIGASI KE HOME
  const logout = React.useCallback(() => {
    // Call logout API
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).catch(error => console.error('Logout API error:', error));

    // Clear local state
    localStorage.removeItem('portal_token');
    setIsLoggedIn(false);
    setIsWriter(false);
    setIsAdmin(false);
    setUserProfile(null);
    setFollowedAuthors([]);
    setReadingHistory([]);
    setSavedArticles([]);
    setWriterArticles([]);
    
    // PENGALIHAN KE HALAMAN UTAMA (/)
    window.location.replace('/'); 
  }, [getAuthHeaders]); 

  const updateProfile = React.useCallback(async (profile: Partial<UserProfile>) => {
    if (!userProfile) return { success: false, message: 'User not logged in' };
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (data.success) {
        const role = data.data.user.role; 
        setUserProfile({
          ...data.data.user,
          joinDate: new Date(data.data.user.createdAt).toLocaleDateString('id-ID')
        });
        
        // LOGIKA ROLE DIPISAH
        setIsAdmin(role === 'admin');
        setIsWriter(role === 'writer' || role === 'admin');
        
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Terjadi kesalahan saat memperbarui profil' };
    } finally {
      setLoading(false);
    }
  }, [userProfile, getAuthHeaders]);

  const forgotPassword = React.useCallback(async (email: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/password/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        return { 
          success: true, 
          message: data.message,
          resetLink: data.resetLink 
        };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, message: 'Terjadi kesalahan saat mengirim link reset password' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Perbaikan: Pastikan fungsi-fungsi ini di-wrap dengan useCallback
  const followAuthor = React.useCallback((authorId: string) => {
    setFollowedAuthors(prev => [...prev, authorId]);
  }, []);

  const unfollowAuthor = React.useCallback((authorId: string) => {
    setFollowedAuthors(prev => prev.filter(id => id !== authorId));
  }, []);

  const isFollowing = React.useCallback((authorId: string) => {
    return followedAuthors.includes(authorId);
  }, [followedAuthors]);

  const addToReadingHistory = React.useCallback((articleId: string, title: string) => {
    setReadingHistory(prev => {
      const existingIndex = prev.findIndex(item => item.articleId === articleId);
      const now = new Date().toLocaleDateString('id-ID');
      
      if (existingIndex >= 0) {
        // Update existing entry
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          readDate: now,
          readCount: updated[existingIndex].readCount + 1
        };
        return updated;
      } else {
        // Add new entry
        return [{
          articleId,
          title,
          readDate: now,
          readCount: 1
        }, ...prev.slice(0, 49)]; // Keep only latest 50 items
      }
    });
  }, []);

  const saveArticle = React.useCallback((article: SavedArticle) => {
    setSavedArticles(prev => {
      if (prev.some(saved => saved.articleId === article.articleId)) {
        return prev; // Already saved
      }
      return [article, ...prev];
    });
  }, []);

  const unsaveArticle = React.useCallback((articleId: string) => {
    setSavedArticles(prev => prev.filter(article => article.articleId !== articleId));
  }, []);

  const isArticleSaved = React.useCallback((articleId: string) => {
    return savedArticles.some(article => article.articleId === articleId);
  }, [savedArticles]);

  const addWriterArticle = React.useCallback((article: any) => {
    if (!userProfile) return;
    
    const newArticle = {
      ...article,
      id: Date.now().toString(),
      authorId: userProfile._id,
      author: userProfile.name,
      publishDate: new Date().toISOString(),
      status: 'published'
    };
    setWriterArticles(prev => [newArticle, ...prev]);
  }, [userProfile]);

  const updateWriterArticle = React.useCallback((articleId: string, updatedArticle: any) => {
    setWriterArticles(prev => 
      prev.map(article => 
        article.id === articleId 
          ? { ...article, ...updatedArticle, lastModified: new Date().toISOString() }
          : article
      )
    );
  }, []);

  const deleteWriterArticle = React.useCallback((articleId: string) => {
    setWriterArticles(prev => prev.filter(article => article.id !== articleId));
  }, []);

  // Nilai konteks yang di-memoized untuk mencegah re-render yang tidak perlu
  const contextValue = React.useMemo(() => ({
    isLoggedIn,
    isWriter,
    isAdmin, 
    userProfile,
    followedAuthors,
    readingHistory,
    savedArticles,
    writerArticles,
    loading,
    login,
    register,
    loginWithToken,
    logout,
    updateProfile,
    forgotPassword,
    followAuthor,
    unfollowAuthor,
    isFollowing,
    addToReadingHistory,
    saveArticle,
    unsaveArticle,
    isArticleSaved,
    addWriterArticle,
    updateWriterArticle,
    deleteWriterArticle
  }), [
    isLoggedIn, 
    isWriter, 
    isAdmin, 
    userProfile, 
    followedAuthors, 
    readingHistory, 
    savedArticles, 
    writerArticles, 
    loading, 
    login, 
    register, 
    loginWithToken, 
    logout, 
    updateProfile, 
    forgotPassword, 
    followAuthor, 
    unfollowAuthor, 
    isFollowing, 
    addToReadingHistory, 
    saveArticle, 
    unsaveArticle, 
    isArticleSaved, 
    addWriterArticle, 
    updateWriterArticle, 
    deleteWriterArticle
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
