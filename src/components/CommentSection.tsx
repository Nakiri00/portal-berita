import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { MessageCircle, Reply, Heart } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: Comment[];
}

export function CommentSection() {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'Ahmad Rizki',
      content: 'Artikel yang sangat bermanfaat! Saya jadi lebih tahu cara mengatur waktu belajar dengan efektif.',
      timestamp: '2 jam yang lalu',
      likes: 12,
      replies: [
        {
          id: '1-1',
          author: 'Sarah Putri',
          content: 'Setuju banget! Tips nomor 3 paling helpful buat saya.',
          timestamp: '1 jam yang lalu',
          likes: 5,
          replies: []
        }
      ]
    },
    {
      id: '2',
      author: 'Maya Sari',
      content: 'Terima kasih untuk artikelnya. Bisa ditambahkan tips untuk mahasiswa yang kuliah sambil kerja?',
      timestamp: '3 jam yang lalu',
      likes: 8,
      replies: []
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Pengguna Baru',
      content: newComment,
      timestamp: 'Baru saja',
      likes: 0,
      replies: []
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim()) return;

    const reply: Comment = {
      id: `${parentId}-${Date.now()}`,
      author: 'Pengguna Baru',
      content: replyContent,
      timestamp: 'Baru saja',
      likes: 0,
      replies: []
    };

    setComments(comments.map(comment => 
      comment.id === parentId 
        ? { ...comment, replies: [...comment.replies, reply] }
        : comment
    ));

    setReplyContent('');
    setReplyingTo(null);
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-12 mt-4' : 'mb-6'} space-y-3`}>
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {comment.author.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-gray-900">{comment.author}</span>
              <span className="text-xs text-gray-500">{comment.timestamp}</span>
            </div>
            <p className="text-sm text-gray-700">{comment.content}</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <button className="flex items-center space-x-1 hover:text-red-500">
              <Heart className="h-3 w-3" />
              <span>{comment.likes}</span>
            </button>
            {!isReply && (
              <button 
                className="flex items-center space-x-1 hover:text-blue-500"
                onClick={() => setReplyingTo(comment.id)}
              >
                <Reply className="h-3 w-3" />
                <span>Balas</span>
              </button>
            )}
          </div>

          {replyingTo === comment.id && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Tulis balasan..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={2}
              />
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={() => handleSubmitReply(comment.id)}
                >
                  Kirim Balasan
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setReplyingTo(null)}
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg p-6 mt-8">
      <div className="flex items-center space-x-2 mb-6">
        <MessageCircle className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-medium">Komentar ({comments.length})</h3>
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8 space-y-3">
        <Textarea
          placeholder="Tulis komentar Anda..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
        />
        <Button type="submit" disabled={!newComment.trim()}>
          Kirim Komentar
        </Button>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Belum ada komentar. Jadilah yang pertama berkomentar!
          </p>
        ) : (
          comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}