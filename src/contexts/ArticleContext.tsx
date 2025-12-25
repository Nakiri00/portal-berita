import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { getAllArticles, Article as ApiArticle } from '../services/articleService'; 

interface FilterParams {
  tag?: string;
  search?: string;
  limit?: number;
}

export interface Article {
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
  likes: number;
  isLikedByMe?: boolean;
  readTime?: string;
  createdAt?: number; // Add timestamp to prevent duplicates
}

interface ArticleContextType {
  publishedArticles: Article[];
  publishArticle: (article: Omit<Article, 'id' | 'author' | 'authorId' | 'publishDate' | 'readCount' | 'isHeadline' | 'createdAt'>, authorName?: string, authorId?: string) => Article;
//   incrementReadCount: (articleId: string) => void;
  fetchArticles: (params?: FilterParams) => Promise<void>; 
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

export const mapApiToLocalArticle = (apiArticle: ApiArticle): Article => {
    const publishDateString = apiArticle.publishedAt
        ? new Date(apiArticle.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'N/A';
    
    return {
        id: apiArticle._id, 
        title: apiArticle.title,
        excerpt: apiArticle.excerpt,
        content: apiArticle.content,
        imageUrl: apiArticle.featuredImage || '',
        author: apiArticle.authorName,
        authorId: apiArticle.author?._id || '',
        publishDate: publishDateString,
        readCount: apiArticle.views, 
        likes: apiArticle.likes,
        isLikedByMe: apiArticle.isLikedByMe || false,
        isHeadline: apiArticle.isFeatured, 
        tag: apiArticle.category,
        readTime: `${apiArticle.readingTime} menit baca`,
        createdAt: new Date(apiArticle.createdAt).getTime(),
    } as Article;
};

export function ArticleProvider({ children }: { children: ReactNode }) {
  const [publishedArticles, setPublishedArticles] = useState<Article[]>([]);
 
  const fetchArticles = useCallback(async (params?: FilterParams) => {
    const limit = params?.limit || 100;
    try {
        const response = await getAllArticles({
            status: 'published',
            tag: params?.tag,
            search: params?.search,
            limit : limit,
            
        });

        const mappedArticles = response.data.articles.map(mapApiToLocalArticle);

        setPublishedArticles(mappedArticles);
    } catch (error) {
        console.error("Gagal mengambil artikel:", error);
    }
  }, []);

  useEffect(() => {
      fetchArticles();
  }, [fetchArticles]); 

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setPublishedArticles(prev => prev.map(article => {
//         const isRecent = article.createdAt && (Date.now() - article.createdAt) < 24 * 60 * 60 * 1000;
//         if (isRecent && Math.random() < 0.3) { // 30% chance to gain a reader
//           const newReadCount = article.readCount + Math.floor(Math.random() * 3) + 1;
//           return {
//             ...article,
//             readCount: newReadCount,
//             isHeadline: newReadCount >= 50 || article.isHeadline
//           };
//         }
//         return article;
//       }));
//     }, 10000); 

//     return () => clearInterval(interval);
//   }, []);

  const publishArticle = useCallback((article: Omit<Article, 'id' | 'author' | 'authorId' | 'publishDate' | 'readCount' | 'isHeadline' | 'createdAt'>, authorName?: string, authorId?: string) => {
    const wordCount = article.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200)); 
    
    const now = Date.now();
    const uniqueId = `${now}-${Math.random().toString(36).substr(2, 9)}`; 
    
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
      isHeadline: false, 
      excerpt: article.excerpt || article.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
      readTime: `${readingTime} menit baca`,
      createdAt: now
    };
    
    let addedArticle: Article | null = null;
    
    setPublishedArticles(prev => {
      const existingArticle = prev.find(a => 
        (a.title === newArticle.title && a.authorId === newArticle.authorId) ||
        a.id === newArticle.id
      );
      
      if (existingArticle) {
        console.warn('Article with same title or ID already exists');
        addedArticle = existingArticle;
        return prev; 
      }
      
      addedArticle = newArticle;
      return [newArticle, ...prev];
    });
    
    return addedArticle || newArticle;
  }, []);

//   const incrementReadCount = useCallback((articleId: string) => {
//     setPublishedArticles(prev => prev.map(article => {
//       if (article.id === articleId) {
//         const newReadCount = article.readCount + 1;
//         const wasHeadline = article.isHeadline;
//         const becomeHeadline = newReadCount >= 50 && !wasHeadline;
//         
//         // Show notification when article becomes headline
//         if (becomeHeadline) {
//           console.log(`🎉 Artikel "${article.title}" telah menjadi HEADLINE dengan ${newReadCount} pembaca!`);
//         }
//         
//         return {
//           ...article,
//           readCount: newReadCount,
//           // Auto-promote to headline if readCount reaches 50
//           isHeadline: newReadCount >= 50 || article.isHeadline
//         };
//       }
//       return article;
//     }));
//   }, []);

  const contextValue = useMemo(() => ({
    publishedArticles,
    publishArticle,
    // incrementReadCount,
    fetchArticles, 
  }), [
    publishedArticles,
    publishArticle,
    // incrementReadCount,
    fetchArticles,
  ]);


  return (
    <ArticleContext.Provider value={contextValue}>
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
