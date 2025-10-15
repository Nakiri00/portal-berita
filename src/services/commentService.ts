const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('portal_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export interface Reply {
    _id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
    createdAt: string;
    likes: number;
    likedBy: string[]; 
    isLikedByMe: boolean;
    
}

export interface Comment extends Reply {
    replies: Reply[];
}

export interface CommentsResponse {
    success: boolean;
    comments: Comment[];
}

export interface CommentActionResponse {
    success: boolean;
    message: string;
    comment?: Comment;
    reply?: Reply;
}

export interface CommentLikeResponse {
    success: boolean;
    message: string;
    isLiked: boolean;
    totalLikes: number;
}


// 1. Ambil Komentar
export const getComments = async (articleId: string): Promise<CommentsResponse> => {
    const response = await fetch(`${API_BASE_URL}/comments/${articleId}`, {
        headers: getAuthHeaders() 
    });
    
    if (!response.ok) {
        throw new Error('Gagal mengambil komentar');
    }
    
    return response.json();
};

// 2. Tambah Komentar Utama
export const postComment = async (articleId: string, text: string): Promise<CommentActionResponse> => {
    const response = await fetch(`${API_BASE_URL}/comments/${articleId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengirim komentar');
    }
    
    return response.json();
};

// 3. Balas Komentar
export const postReply = async (articleId: string, commentId: string, text: string): Promise<CommentActionResponse> => {
    const response = await fetch(`${API_BASE_URL}/comments/${articleId}/${commentId}/reply`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal membalas komentar');
    }
    
    return response.json();
};

// 4. Like/Unlike Komentar atau Balasan
export const toggleCommentLike = async (articleId: string, commentId: string, replyId?: string): Promise<CommentLikeResponse> => {
    const query = replyId ? `?replyId=${replyId}` : '';

    const response = await fetch(`${API_BASE_URL}/comments/${articleId}/${commentId}/like${query}`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal memproses like komentar');
    }
    
    return response.json();
};