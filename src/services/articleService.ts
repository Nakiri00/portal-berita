const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
import api from "./api";
import axios from "axios";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('portal_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};


export interface Article {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  author: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
  bio?: string;
  authorName: string;
  category: string;
  tags: string[];
  featuredImage: string;
  status: 'draft' | 'published' | 'pending review';
  editorFeedback?: string;
  publishedAt: string | null;
  views: number;
  likes: number;
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
  slug: string;
  isLikedByMe?: boolean;
}

export interface CreateArticleData {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags?: string[];
  featuredImage?: string;
  status?: 'draft' | 'published' | 'pending review' ;
  seoTitle?: string;
  seoDescription?: string;
  isFeatured?: boolean;
  editorFeedback?: string;
}

interface UpdateArticleData {
    title: string;
    content: string;
    excerpt?: string;
    category: string;
    tags?: string[];
    status?: 'draft' | 'published' | 'pending review' | 'rejected';
    featuredImage?: File | string; 
    isFeatured?: boolean;
    editorFeedback?: string;
}

export interface ArticlesResponse {
  success: boolean;
  data: {
    articles: Article[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ArticleResponse {
  success: boolean;
  data: {
    article: Article;
  };
  message?: string;
}

export interface LikeResponse {
  success: boolean;
  data: {
    likes: number;
    liked: boolean; 
  };
  message?: string;
}

export interface LikeToggleResponse {
  success: boolean;
  data: {
    isLiked: boolean;
    totalLikes: number;
  };
  message: string;
}

export interface ViewResponse {
  success: boolean;
  data: {
    viewsIncremented: boolean;
    becameFeatured: boolean;
  };
  message: string;
}

// Get all articles
export const getAllArticles = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
  tag?: string; 
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<ArticlesResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.category) queryParams.append('category', params.category);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.tag) queryParams.append('tag', params.tag);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const response = await fetch(`${API_BASE_URL}/articles?${queryParams}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }
  
  return response.json();
};

// Get article by ID
export const getArticleById = async (id: string): Promise<ArticleResponse> => {
  // Ambil token secara pasif, kirim jika ada.
  const headers = getAuthHeaders(); 
  
  const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
    headers: headers 
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch article');
  }
  
  return response.json();
};

// Get featured articles
export const getFeaturedArticles = async (limit?: number): Promise<ArticleResponse> => {
  const queryParams = limit ? `?limit=${limit}` : '';
  const response = await fetch(`${API_BASE_URL}/articles/featured${queryParams}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch featured articles');
  }
  
  return response.json();
};

// Get articles by author
export const getArticlesByAuthor = async (
  authorId: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
  }
): Promise<ArticlesResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);

  const response = await fetch(`${API_BASE_URL}/articles/author/${authorId}?${queryParams}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch author articles');
  }
  
  return response.json();
};

// Get writer's own articles
export const getWriterArticles = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<ArticlesResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);

  const response = await fetch(`${API_BASE_URL}/articles/writer/my-articles?${queryParams}`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch writer articles');
  }
  
  return response.json();
};

// Create new article
export const createArticle = async (articleData: FormData) => {
  const token = localStorage.getItem('portal_token');
  const response = await fetch(`${API_BASE_URL}/articles/create`, {
    method: 'POST',
    headers: { Authorization: token ? `Bearer ${token}` : '' },
    body: articleData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Gagal membuat artikel');
  }

  return response.json();
};

// Update article
export const updateArticle = async (articleId: string, articleData: UpdateArticleData) => {
    const token = localStorage.getItem('portal_token');
    if (!token) {
        throw new Error('Autentikasi diperlukan.');
    }

    // Karena kita mengizinkan upload file, kita harus menggunakan FormData
    const formData = new FormData();
    formData.append('title', articleData.title);
    formData.append('content', articleData.content);
    formData.append('category', articleData.category);
    formData.append('excerpt', articleData.excerpt || '');
    if (articleData.tags && Array.isArray(articleData.tags)) {
        articleData.tags.forEach(tag => {
             formData.append('tags[]', tag); 
        });
    }
    if (articleData.status) {
        formData.append('status', articleData.status);
    }
    if (articleData.featuredImage instanceof File) {
        formData.append('imageFile', articleData.featuredImage); 
    } else if (typeof articleData.featuredImage === 'string' && articleData.featuredImage === '') {
        formData.append('featuredImage', '');
    }
    if (articleData.isFeatured !== undefined) {
        formData.append('isFeatured', articleData.isFeatured.toString());
    }
    if (articleData.editorFeedback !== undefined) {
        formData.append('editorFeedback', articleData.editorFeedback);
    }
    
    const response = await fetch(`${API_BASE_URL}/articles/${articleId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengupdate artikel');
    }

    return response.json();
};

// Delete article
export const deleteArticle = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete article');
  }
  
  return response.json();
};

// Like article
// export const likeArticle = async (id: string): Promise<LikeResponse> => {
//   const response = await fetch(`${API_BASE_URL}/articles/${id}/like`, {
//     method: 'POST',
//     headers: getAuthHeaders()
//   });
  
//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(errorData.message || 'Gagal memberikan like');
//   }
  
//   return response.json();
// };

export const viewArticle = async (id: string): Promise<ViewResponse> => {
  const response = await fetch(`${API_BASE_URL}/articles/${id}/view`, {
    method: 'POST',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Gagal mencatat view artikel');
  }

  return response.json();
};

export const toggleArticleLike = async (articleId: string): Promise<LikeToggleResponse> => {
  // Menggunakan route yang benar (articles/:id/like) dan method POST (sudah terproteksi di Backend)
  const response = await fetch(`${API_BASE_URL}/articles/${articleId}/like`, {
    method: 'POST',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Gagal memproses suka artikel');
  }

  // Asumsi respons dari Backend sesuai dengan LikeToggleResponse
  return response.json();
};

export const getEditorArticles = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ArticlesResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);

  const response = await fetch(`${API_BASE_URL}/articles/editor/all?${queryParams}`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch editor articles');
  }
  
  return response.json();
};

export const getPendingDraftsForEditor = async () => {
  try {
    const response = await getEditorArticles({ limit: 100 });
    const articles = response.data.articles;
    const pendingReviews = articles.filter((article: any) => 
      article.status === 'pending review' && 
      (article.authorRole === 'intern' || article.authorRole === 'writer')
    );

    return pendingReviews;
  } catch (error) {
    console.error('Error fetching editor drafts:', error);
    return [];
  }
};

export const getArticlesWithFeedback = async () => {
  try {
    // Ambil artikel milik writer sendiri (limit 50 cukup)
    const response = await getWriterArticles({ limit: 50 });
    const articles = response.data.articles;

    // Filter artikel yang:
    // 1. Memiliki feedback dari editor (editorFeedback tidak kosong)
    // 2. DAN statusnya 'draft' (dikembalikan untuk revisi) atau 'rejected'
    const feedbackArticles = articles.filter((article: any) => 
      (article.editorFeedback && article.editorFeedback.trim() !== '') &&
      (article.status === 'draft' || article.status === 'rejected')
    );

    return feedbackArticles;
  } catch (error) {
    console.error('Error fetching feedback articles:', error);
    return [];
  }
};