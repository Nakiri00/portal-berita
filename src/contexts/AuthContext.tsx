import { createContext, useContext, useState, ReactNode } from 'react';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  joinDate: string;
  instagram?: string;
  facebook?: string;
  threads?: string;
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
  userProfile: UserProfile;
  followedAuthors: string[];
  readingHistory: ReadHistory[];
  savedArticles: SavedArticle[];
  writerArticles: any[];
  login: (asWriter?: boolean) => void;
  logout: () => void;
  updateProfile: (profile: UserProfile) => void;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isWriter, setIsWriter] = useState(false);
  const [followedAuthors, setFollowedAuthors] = useState<string[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadHistory[]>([]);
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [writerArticles, setWriterArticles] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Ahmad Rizki',
    email: 'ahmad.rizki@email.com',
    avatar: '',
    bio: 'Mahasiswa aktif yang tertarik dengan teknologi dan pendidikan',
    joinDate: '15 Jan 2024',
    instagram: '',
    facebook: '',
    threads: ''
  });

  const login = (asWriter: boolean = false) => {
    setIsLoggedIn(true);
    setIsWriter(asWriter);
    
    // Update profile based on user type
    if (asWriter) {
      setUserProfile(prev => ({
        ...prev,
        name: prev.name || 'Penulis Kamus Mahasiswa'
      }));
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setIsWriter(false);
    setFollowedAuthors([]);
    setReadingHistory([]);
    setSavedArticles([]);
    setWriterArticles([]);
  };

  const updateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
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
    const newArticle = {
      ...article,
      id: Date.now().toString(),
      authorId: 'writer-1', // Current writer's ID
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
      login,
      logout,
      updateProfile,
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