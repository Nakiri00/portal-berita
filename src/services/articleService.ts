const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  status: 'draft' | 'published' | 'archived';
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
}

export interface CreateArticleData {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags?: string[];
  featuredImage?: string;
  status?: 'draft' | 'published' | 'archived';
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateArticleData extends Partial<CreateArticleData> {}

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
  const response = await fetch(`${API_BASE_URL}/articles/${id}`);
  
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
  const response = await fetch(`${API_BASE_URL}/articles/writer/create`, {
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
export const updateArticle = async (id: string, articleData: UpdateArticleData): Promise<ArticleResponse> => {
  const response = await fetch(`${API_BASE_URL}/articles/writer/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(articleData)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update article');
  }
  
  return response.json();
};

// Delete article
export const deleteArticle = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/articles/writer/${id}`, {
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
export const likeArticle = async (id: string): Promise<{ success: boolean; data: { likes: number } }> => {
  const response = await fetch(`${API_BASE_URL}/articles/${id}/like`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to like article');
  }
  
  return response.json();
};
