// src/components/CommentSection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Heart, MessageCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
// 💡 IMPORT SERVICE BARU
import { getComments, postComment, postReply, toggleCommentLike, Comment, Reply, CommentLikeResponse } from '../services/commentService';
import { assetUrl } from '../utils/assets';
import { AvatarImage } from '@radix-ui/react-avatar';

function isMainComment(data: Comment | Reply): data is Comment {
    return (data as Comment).replies !== undefined;
}

// Component untuk satu Komentar atau Balasan
interface CommentItemProps {
    data: Comment | Reply; 
    articleId: string;
    onReply: (commentId: string, text: string) => Promise<void>; 
    onLikeToggle: (commentId: string, replyId?: string) => Promise<CommentLikeResponse>; 
    isLoggedIn: boolean;
    isReply?: boolean; 
    commentId: string; 
}

const CommentItem: React.FC<CommentItemProps> = ({ 
    data, 
    articleId, 
    onReply, 
    onLikeToggle, 
    isLoggedIn, 
    isReply, 
    commentId 
}) => {
    const { userProfile : user } = useAuth();
    const currentUserId = user?._id;

    // 💡 FIX 1.1: Inisialisasi state dari data props.likedBy
    const isUserLoggedIn = typeof currentUserId === 'string';
    const initialLiked = isUserLoggedIn ? data.likedBy.includes(currentUserId) : false;
    const initialLikesCount = data.likedBy?.length ?? 0;
    
    const [isLiked, setIsLiked] = useState<boolean>(initialLiked);
    const [likesCount, setLikesCount] = useState<number>(initialLikesCount);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');

    // Sinkronisasi status like ketika data berubah
    useEffect(() => {
        const userId = user?._id;
        const isUserActive = typeof userId === 'string';
        
        setIsLiked(isUserActive && data.likedBy.includes(userId));
        setLikesCount(data.likedBy?.length ?? 0);
    }, [data.likedBy, data._id, user]);

    const handleReplySubmit = async () => {
        if (!isLoggedIn) {
            toast.error('Silakan login untuk membalas.');
            return;
        }
        if (!replyText.trim()) {
            toast.error('Balasan tidak boleh kosong.');
            return;
        }

        try {
            const targetCommentId = data._id; 
            
            await onReply(targetCommentId, replyText); 

            setReplyText('');
            setIsReplying(false);
            
        } catch (error) {
            console.error('Gagal mengirim balasan:', error);
            toast.error('Gagal mengirim balasan. Coba lagi.');
        }
    };

    const handleLike = () => {
        if (!isLoggedIn) {
            toast.error('Silakan login untuk menyukai komentar.');
            return;
        }

        // 1. Optimistic UI update
        const prevIsLiked = isLiked;
        const prevLikesCount = likesCount;
        const newLikeStatus = !prevIsLiked;
        
        setIsLiked(newLikeStatus);
        setLikesCount(prev => prev + (newLikeStatus ? 1 : -1));

        // 2. Tentukan ID yang akan di-like
        const targetCommentId = isReply ? commentId : data._id;
        const targetReplyId = isReply ? data._id : undefined;

        onLikeToggle(targetCommentId, targetReplyId)
            .catch(error => {
                // Revert state jika gagal
                setIsLiked(prevIsLiked);
                setLikesCount(prevLikesCount);
                toast.error('Gagal memproses like. Coba lagi.');
                console.error(error);
            });
    };
    
    // Asumsi data.replies hanya ada di Comment utama, bukan di Reply
     const isThisMainComment = isMainComment(data);

    return (
        // 💡 KOREKSI LAYOUT: Gunakan className conditional untuk membedakan komentar dan balasan
        <div className={`space-y-3 ${isReply ? 'mt-3 pt-3 border-gray-100' : 'mb-6'}`}>
            <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                    {data.userAvatar ? (
                        <AvatarImage className='object-cover'
                            src={assetUrl(data.userAvatar)}
                            alt={data.userName} />
                        ) : (
                            <AvatarFallback>{data.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        )}
                </Avatar>
                
                <div className="flex-1">
                    <div className={` bg-white rounded-lg p-3 sm:p-4`}>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-gray-900">{data.userName}</span>
                            <span className="text-xs text-gray-500">{new Date(data.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-sm text-gray-700">{data.text}</p>
                    </div>
                    
                    {/* Aksi Komentar/Balasan */}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <button 
                            onClick={handleLike} 
                            className={`flex items-center space-x-1 hover:text-red-500 ${isLiked ? 'text-red-500' : ''}`}
                        >
                            <Heart className={`h-3 w-3 ${isLiked ? 'fill-red-500' : ''}`} />
                            <span>{likesCount}</span>
                        </button>
                        {isThisMainComment && ( // Hanya Komentar Utama yang bisa dibalas
                            <button 
                                className="flex items-center space-x-1 hover:text-blue-500"
                                onClick={() => setIsReplying(prev => !prev)}
                            >
                                <MessageCircle className="h-3 w-3" />
                                <span>Balas ({data.replies?.length || 0})</span>
                            </button>
                        )}
                    </div>

                    {/* Input Balasan */}
                    {isReplying && isThisMainComment && (
                        <div className="mt-3 space-y-2">
                            <Textarea
                                placeholder="Tulis balasan..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={2}
                            />
                            <div className="flex space-x-2">
                                <Button size="sm" onClick={handleReplySubmit}>
                                    Kirim Balasan
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setIsReplying(false)}>
                                    Batal
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tampilkan Balasan (hanya untuk Komentar Utama) */}
            {isThisMainComment && data.replies && data.replies.length > 0 && (
                <div className="pl-10 mt-2 border-l-2 border-gray-200">
                    {data.replies.map(reply => (
                        <CommentItem 
                            key={reply._id} 
                            data={reply} 
                            articleId={articleId}
                            onReply={onReply}
                            onLikeToggle={onLikeToggle}
                            isLoggedIn={isLoggedIn}
                            isReply={true} 
                            commentId={data._id} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


// 💡 KOMPONEN UTAMA COMMENT SECTION
export function CommentSection({ articleId }: { articleId: string }) { // 💡 TERIMA articleId
    const { isLoggedIn } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCommentText, setNewCommentText] = useState('');

    // Fetch Komentar
    const fetchComments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getComments(articleId);
            setComments(response.comments);
        } catch (error) {
            console.error('Gagal fetch komentar:', error);
            toast.error('Gagal memuat komentar.');
        } finally {
            setLoading(false);
        }
    }, [articleId]);

    useEffect(() => {
        if (articleId) { // PENTING: Hanya fetch jika articleId tersedia
            fetchComments();
        }
    }, [articleId, fetchComments]);

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoggedIn) {
            toast.error('Silakan login untuk mengirim komentar.');
            return;
        }
        if (!newCommentText.trim()) return;

        try {
            const response = await postComment(articleId, newCommentText);
            
            if (response.comment) {
                setComments(prev => [response.comment!, ...prev]);
                setNewCommentText('');
                toast.success('Komentar berhasil dikirim.');
            }
        } catch (error) {
            toast.error('Gagal mengirim komentar.');
        }
    };

    // Handler untuk balasan (Dipanggil dari CommentItem)
    const handleReplyComment = useCallback(async (commentId: string, text: string) => {
        try {
            const response = await postReply(articleId, commentId, text);

            if (response.reply) {
                setComments(prev => prev.map(comment => {
                    if (comment._id === commentId) {
                        return { 
                            ...comment, 
                            replies: [...(comment.replies || []), response.reply!]
                        };
                    }
                    return comment;
                }));
                toast.success('Balasan berhasil dikirim.');
            }
        } catch (error) {
             toast.error('Gagal mengirim balasan.');
        }
    }, [articleId]);
    
    // Toggle Like Handler untuk Komentar atau Balasan
    const handleLikeToggle = useCallback(async (commentId: string, replyId?: string): Promise<CommentLikeResponse> => {
        try {
            const response = await toggleCommentLike(articleId, commentId, replyId);
            
            // Update state: Cari komen/reply dan update totalLikes dan isLikedByMe
            setComments(prev => prev.map(comment => {
                if (comment._id === commentId) {
                    if (replyId) {
                        // Jika ini adalah balasan
                        const updatedReplies = comment.replies.map(reply => {
                            if (reply._id === replyId) {
                                return {
                                    ...reply,
                                    likes: response.totalLikes,
                                    isLikedByMe: response.isLiked
                                };
                            }
                            return reply;
                        });
                        return { ...comment, replies: updatedReplies };
                    } else {
                        // Jika ini adalah komentar utama
                        return {
                            ...comment,
                            likes: response.totalLikes,
                            isLikedByMe: response.isLiked
                        };
                    }
                }
                return comment;
            }));
            
            return response; // Kembalikan response untuk logic .catch() di CommentItem
        } catch (error) {
            console.error("Gagal toggle like:", error);
            throw error; 
        }
    }, [articleId]);


    return (
        <div id="comment-section" className="mt-8 sm:mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Komentar ({comments.length})</h2>

            {/* Input Komentar Baru */}
            <form onSubmit={handlePostComment} className="bg-white p-4 rounded-lg shadow mb-6">
                <Textarea
                    placeholder={isLoggedIn ? "Tulis komentar Anda di sini..." : "Silakan login untuk berkomentar."}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    disabled={!isLoggedIn}
                    className="mb-3"
                />
                <Button type="submit" disabled={!isLoggedIn || !newCommentText.trim()}>
                    Kirim Komentar
                </Button>
            </form>

            {/* Daftar Komentar */}
            <div className="space-y-4">
                {loading ? (
                    <p className="text-gray-500">Memuat komentar...</p>
                ) : comments.length === 0 ? (
                    <p className="text-gray-500">Belum ada komentar. Jadilah yang pertama!</p>
                ) : (
                    comments.map(comment => (
                        <CommentItem 
                            key={comment._id} 
                            data={comment} 
                            articleId={articleId}
                            onReply={handleReplyComment}
                            onLikeToggle={handleLikeToggle}
                            isLoggedIn={isLoggedIn}
                            commentId={comment._id}
                        />
                    ))
                )}
            </div>
        </div>
    );
}