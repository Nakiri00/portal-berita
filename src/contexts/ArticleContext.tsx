import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  author: string;
  authorId: string;
  publishDate: string;
  readCount: number;
  isHeadline: boolean;
  tag: string;
  readTime?: string;
  createdAt?: number; // Add timestamp to prevent duplicates
}

interface ArticleContextType {
  publishedArticles: Article[];
  publishArticle: (article: Omit<Article, 'id' | 'author' | 'authorId' | 'publishDate' | 'readCount' | 'isHeadline' | 'createdAt'>, authorName?: string, authorId?: string) => Article;
  incrementReadCount: (articleId: string) => void;
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

export function ArticleProvider({ children }: { children: ReactNode }) {
  const [publishedArticles, setPublishedArticles] = useState<Article[]>([]);

  // Simulate realistic reader growth for demo purposes
  React.useEffect(() => {
    const interval = setInterval(() => {
      setPublishedArticles(prev => prev.map(article => {
        // Only simulate growth for articles less than 24 hours old
        const isRecent = article.createdAt && (Date.now() - article.createdAt) < 24 * 60 * 60 * 1000;
        if (isRecent && Math.random() < 0.3) { // 30% chance to gain a reader
          const newReadCount = article.readCount + Math.floor(Math.random() * 3) + 1;
          return {
            ...article,
            readCount: newReadCount,
            // Auto-promote to headline if readCount reaches 50
            isHeadline: newReadCount >= 50 || article.isHeadline
          };
        }
        return article;
      }));
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const publishArticle = (article: Omit<Article, 'id' | 'author' | 'authorId' | 'publishDate' | 'readCount' | 'isHeadline' | 'createdAt'>, authorName?: string, authorId?: string) => {
    // Calculate reading time based on content length
    const wordCount = article.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // Assume 200 words per minute
    
    const now = Date.now();
    const uniqueId = `${now}-${Math.random().toString(36).substr(2, 9)}`; // More unique ID
    
    const newArticle: Article = {
      ...article,
      id: uniqueId,
      author: authorName || 'Penulis Kamus Mahasiswa',
      authorId: authorId || 'writer-1',
      publishDate: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      readCount: 1, // Start with 1 read count (the author's read)
      isHeadline: false, // Never start as headline
      excerpt: article.excerpt || article.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
      readTime: `${readingTime} menit baca`,
      createdAt: now
    };
    
    // Prevent duplicates and ensure only one article is added
    let addedArticle: Article | null = null;
    
    setPublishedArticles(prev => {
      const existingArticle = prev.find(a => 
        (a.title === newArticle.title && a.authorId === newArticle.authorId) ||
        a.id === newArticle.id
      );
      
      if (existingArticle) {
        console.warn('Article with same title or ID already exists');
        addedArticle = existingArticle;
        return prev; // Don't add duplicate
      }
      
      addedArticle = newArticle;
      return [newArticle, ...prev];
    });
    
    return addedArticle || newArticle;
  };

  const incrementReadCount = (articleId: string) => {
    setPublishedArticles(prev => prev.map(article => {
      if (article.id === articleId) {
        const newReadCount = article.readCount + 1;
        const wasHeadline = article.isHeadline;
        const becomeHeadline = newReadCount >= 50 && !wasHeadline;
        
        // Show notification when article becomes headline
        if (becomeHeadline) {
          console.log(`🎉 Artikel "${article.title}" telah menjadi HEADLINE dengan ${newReadCount} pembaca!`);
        }
        
        return {
          ...article,
          readCount: newReadCount,
          // Auto-promote to headline if readCount reaches 50
          isHeadline: newReadCount >= 50 || article.isHeadline
        };
      }
      return article;
    }));
  };

  return (
    <ArticleContext.Provider value={{
      publishedArticles,
      publishArticle,
      incrementReadCount
    }}>
      {children}
    </ArticleContext.Provider>
  );
}

export function useArticles() {
  const context = useContext(ArticleContext);
  if (context === undefined) {
    throw new Error('useArticles must be used within an ArticleProvider');
  }
  return context;
}