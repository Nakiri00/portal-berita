import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  const [loading, setLoading] = useState(false);
  const [followedAuthors, setFollowedAuthors] = useState<string[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadHistory[]>([]);
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [writerArticles, setWriterArticles] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Load user data from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('portal_token');
    if (savedToken) {
      // Verify token with API
      verifyToken(savedToken);
    }
  }, []);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('portal_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  // Verify token with API
  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserProfile({
            ...data.data.user,
            joinDate: new Date(data.data.user.createdAt).toLocaleDateString('id-ID')
          });
          setIsLoggedIn(true);
          setIsWriter(data.data.user.role === 'writer' || data.data.user.role === 'admin');
        }
      } else {
        // Token invalid, remove it
        localStorage.removeItem('portal_token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('portal_token');
    }
  };

  // Login function with real API
  const login = async (email: string, password: string) => {
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
        setUserProfile({
          ...data.data.user,
          joinDate: new Date(data.data.user.createdAt).toLocaleDateString('id-ID')
        });
        setIsLoggedIn(true);
        setIsWriter(data.data.user.role === 'writer' || data.data.user.role === 'admin');
        
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
  };

  // Register function with real API
  const register = async (name: string, email: string, password: string, role: 'user' | 'writer' = 'user') => {
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
        setUserProfile({
          ...data.data.user,
          joinDate: new Date(data.data.user.createdAt).toLocaleDateString('id-ID')
        });
        setIsLoggedIn(true);
        setIsWriter(data.data.user.role === 'writer' || data.data.user.role === 'admin');
        
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
  };

  // Login with token (for OAuth)
  const loginWithToken = async (token: string) => {
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
        setUserProfile({
          ...data.data.user,
          joinDate: new Date(data.data.user.createdAt).toLocaleDateString('id-ID')
        });
        setIsLoggedIn(true);
        setIsWriter(data.data.user.role === 'writer' || data.data.user.role === 'admin');
        
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
  };

  const logout = () => {
    // Call logout API
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).catch(error => console.error('Logout API error:', error));

    // Clear local state
    localStorage.removeItem('portal_token');
    setIsLoggedIn(false);
    setIsWriter(false);
    setUserProfile(null);
    setFollowedAuthors([]);
    setReadingHistory([]);
    setSavedArticles([]);
    setWriterArticles([]);
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
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
        setUserProfile({
          ...data.data.user,
          joinDate: new Date(data.data.user.createdAt).toLocaleDateString('id-ID')
        });
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
  };

  const forgotPassword = async (email: string) => {
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
  };

  const followAuthor = (authorId: string) => {
    setFollowedAuthors(prev => [...prev, authorId]);
  };

  const unfollowAuthor = (authorId: string) => {
    setFollowedAuthors(prev => prev.filter(id => id !== authorId));
  };

  const isFollowing = (authorId: string) => {
    return followedAuthors.includes(authorId);
  };

  const addToReadingHistory = (articleId: string, title: string) => {
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
  };

  const saveArticle = (article: SavedArticle) => {
    setSavedArticles(prev => {
      if (prev.some(saved => saved.articleId === article.articleId)) {
        return prev; // Already saved
      }
      return [article, ...prev];
    });
  };

  const unsaveArticle = (articleId: string) => {
    setSavedArticles(prev => prev.filter(article => article.articleId !== articleId));
  };

  const isArticleSaved = (articleId: string) => {
    return savedArticles.some(article => article.articleId === articleId);
  };

  const addWriterArticle = (article: any) => {
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
  };

  const updateWriterArticle = (articleId: string, updatedArticle: any) => {
    setWriterArticles(prev => 
      prev.map(article => 
        article.id === articleId 
          ? { ...article, ...updatedArticle, lastModified: new Date().toISOString() }
          : article
      )
    );
  };

  const deleteWriterArticle = (articleId: string) => {
    setWriterArticles(prev => prev.filter(article => article.id !== articleId));
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      isWriter,
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
    }}>
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