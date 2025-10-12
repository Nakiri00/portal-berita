import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Calendar, User, Eye, Share2, Bookmark, Heart, BookmarkCheck, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CommentSection } from './CommentSection';
import { toast } from 'sonner';
import { useArticles, Article as LocalArticle, mapApiToLocalArticle } from '../contexts/ArticleContext';
import { getWriterProfile } from '../services/userService'; // Import service untuk ambil Bio
import { getArticleById,  viewArticle , toggleArticleLike, Article as ApiArticleType } from '../services/articleService'; // Import service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Definisikan tipe untuk data penulis yang diperlukan
interface ArticleAuthor {
    name: string;
    avatar?: string;
    bio?: string;
}

interface ArticlePageProps {
  articleId: string;
  onBackClick: () => void;
  onAuthorClick: (authorId: string) => void;
  isLoggedIn: boolean;
//   onAddToHistory: (articleId: string, title: string) => void;
  onSaveArticle: (article: any) => void;
  onUnsaveArticle: (articleId: string) => void;
  isArticleSaved: (articleId: string) => boolean;
  onLogout?: () => void; 
}

export function ArticlePage({ 
  articleId, 
  onBackClick, 
  onAuthorClick, 
  isLoggedIn,
//   onAddToHistory,
  onSaveArticle,
  onUnsaveArticle,
  isArticleSaved,
  onLogout 
}: ArticlePageProps) {
    const [articleData, setArticleData] = useState<LocalArticle | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0); // Inisialisasi dengan 0 atau nilai awal yang sesuai
    const [authorBioData, setAuthorBioData] = useState<ArticleAuthor | null>(null);
    const {fetchArticles} = useArticles(); // Fungsi untuk refresh articles
    // Cari artikel dari published articles
//     let article = publishedArticles.find(a => a.id === articleId);
    const handleLike = useCallback(async () => {
        // if (!articleData) return;
        if (!isLoggedIn) {
            toast.error('Silakan login terlebih dahulu');
            return;
        }
        
        // 1. Optimistic UI Update
        const prevIsLiked = isLiked;
        const prevLikeCount = likeCount;
        setIsLiked(prev => !prev);
        setLikeCount(prev => prev + (prevIsLiked ? -1 : 1));
        try {
            // 2. Panggil API Toggle
            const response = await toggleArticleLike(articleId);
            if (response.success) {
                // 3. Update state berdasarkan respons server
                setIsLiked(response.data.isLiked);
                setLikeCount(response.data.totalLikes);
                toast.success(response.data.isLiked ? 'Artikel disukai' : 'Like dibatalkan');
                // 4. Update list artikel global agar hitungan like di homepage juga berubah
                fetchArticles(); 
            } else {
                // 3b. Revert state jika gagal dari server
                setIsLiked(prevIsLiked);
                setLikeCount(prevLikeCount);
                toast.error(response.message || 'Gagal memproses like artikel');
            }
        } catch (error) {
            // 3c. Revert state jika gagal total (network error)
            setIsLiked(prevIsLiked);
            setLikeCount(prevLikeCount);
            console.error("Like toggle error:", error);
            toast.error('Terjadi kesalahan koneksi saat memproses like.');
        }
    }, [articleId, isLoggedIn, isLiked, likeCount, fetchArticles]);

    useEffect(() => {
        let isCancelled = false;
        
        const fetchAndLogArticle = async () => {
            try {
                // 1. Fetch Artikel API (masih menghasilkan ApiArticleType)
                const articleResponse = await getArticleById(articleId);
                console.log("🔍 API Response:", articleResponse.data.article);
                const fetchedApiArticle = articleResponse.data.article; 
                
                if (isCancelled) return;
                
                // 2. MAPPING DATA API KE TIPE CONTEXT
                const mappedArticle = mapApiToLocalArticle(fetchedApiArticle);
                
                // 3. Set State Artikel, Like Count, dan Like Status dari MAPPED data
                setArticleData(mappedArticle);
                setLikeCount(mappedArticle.likes);
                setIsLiked(mappedArticle.isLikedByMe || false); 

                // 4. Log View (Conditional)
                if (isLoggedIn) {
                    const viewRes = await viewArticle(articleId);
                    
                    if (viewRes.data.becameFeatured) {
                        toast.info(`🎉 Artikel "${mappedArticle.title}" telah menjadi HEADLINE!`);
                        fetchArticles(); // Refresh list global
                    }
                    
                    if (viewRes.data.viewsIncremented) {
                         setArticleData(prev => prev ? ({ 
                             ...prev, 
                             readCount: prev.readCount + 1, // Update readCount di Context type
                         }) : null);
                    }
                }
                
                // 5. Fetch Bio
                if (fetchedApiArticle.author?._id) { // Gunakan fetchedApiArticle untuk ID penulis
                    const profile = await getWriterProfile(fetchedApiArticle.author._id);
                    if (!isCancelled) {
                        setAuthorBioData({
                            name: profile.name,
                            avatar: profile.avatar.url,
                            bio: profile.bio 
                        });
                    }
                }
            } catch (error) {
                console.error("Gagal memuat artikel atau memproses view:", error);
                if (!isCancelled) {
                    toast.error('Gagal memuat artikel atau terjadi masalah.');
                    setArticleData(null); 
                }
            }
        };

        if (articleId) {
            fetchAndLogArticle();
        }

        return () => { isCancelled = true; };
    }, [articleId, isLoggedIn, fetchArticles]); 

  if (!articleData) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
            <h1 className="text-3xl font-bold mb-4">Memuat Artikel...</h1>
            <p>Artikel mungkin sedang dimuat atau tidak ditemukan.</p>
        </div>
    );
  }
    
  const currentArticle = articleData;
  const isSaved = isArticleSaved(articleId);
    const displayAuthor = authorBioData || { 
        name: currentArticle.author, 
        bio: 'Memuat bio...', 
        avatar: '' 
    };

  const handleSave = () => {
    if (!isLoggedIn) {
      toast.error('Silakan login terlebih dahulu');
      return;
    }
    if (isSaved) {
      onUnsaveArticle(articleId);
      toast.success('Artikel dihapus dari tersimpan');
    } else {
      onSaveArticle({
        articleId: currentArticle.id,
        title: currentArticle.title,
        excerpt: currentArticle.excerpt,
        author: currentArticle.author,
        savedDate: new Date().toLocaleDateString('id-ID'),
        imageUrl: currentArticle.imageUrl,
        tag: currentArticle.tag
      });
      toast.success('Artikel berhasil disimpan');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: currentArticle.title,
        text: currentArticle.excerpt || 'Baca artikel menarik ini di Kamus Mahasiswa',
        url: window.location.href,
      });
    } catch (err) {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link artikel berhasil disalin');
    }
  };

  const handleAuthorProfileClick = () => {
    const authorId = currentArticle.authorId || 'default-author';
    onAuthorClick(authorId);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Button 
          variant="ghost" 
          onClick={onBackClick}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Kembali</span>
          <span className="sm:hidden">Kembali</span>
        </Button>
      </div>

      {/* Article Header */}
      <article className="bg-white rounded-lg shadow-sm">
        {/* Featured Image */}
        <div className="w-full h-48 sm:h-64 md:h-80 overflow-hidden rounded-t-lg">
          <img 
            src={API_BASE_URL + currentArticle.imageUrl} 
            alt={currentArticle.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Content */}
        <div className="p-4 sm:p-6 md:p-8">
          {/* Tags and Actions */}
          <div className="flex items-start justify-between mb-4 gap-2">
            <Badge variant="default" className="text-xs sm:text-sm flex-shrink-0">
              {currentArticle.tag}
            </Badge>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLike}
                className={`p-2 ${isLiked ? 'text-red-500 hover:text-red-600' : ''}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="ml-1 text-xs sm:text-sm">{likeCount}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleShare}
                className="p-2"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSave}
                className={`p-2 ${isSaved ? 'text-blue-500 hover:text-blue-600' : ''}`}
              >
                {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {currentArticle.title}
          </h1>

          {/* Meta Information - Stack on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b">
            <div className="flex items-center space-x-2">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Oleh </span>
              <button 
                onClick={handleAuthorProfileClick}
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
              >
                {currentArticle.author}
              </button>
            </div>
            <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{currentArticle.publishDate}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{currentArticle.readCount?.toLocaleString() || 0} pembaca</span>
                <span className="sm:hidden">{currentArticle.readCount?.toLocaleString() || 0}</span>
              </div>
              <span className="hidden sm:inline">{currentArticle.readTime || '5 menit baca'}</span>
            </div>
          </div>

          {/* Article Body - Better mobile typography */}
          <div 
            className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700"
            style={{ 
              fontSize: 'clamp(14px, 2.5vw, 16px)', 
              lineHeight: '1.6',
            }}
            dangerouslySetInnerHTML={{ __html: currentArticle.content }}
          />

          {/* Author Bio - Better responsive layout */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mt-6 sm:mt-8">
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-medium text-sm sm:text-lg">
                  {currentArticle.author.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <button 
                      onClick={handleAuthorProfileClick}
                      className="font-medium text-gray-900 hover:text-blue-600 text-sm sm:text-base hover:underline transition-colors"
                    >
                      {currentArticle.author}
                    </button>
                    <p className="text-gray-700">
                        {displayAuthor.bio || 'Penulis ini belum menambahkan deskripsi diri. Nantikan artikel-artikel menarik lainnya!'} 
                      </p>
                  </div>
                  <Button 
                    onClick={handleAuthorProfileClick}
                    variant="outline" 
                    size="sm"
                    className="w-full sm:w-auto hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    Lihat Profil
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Comment Section */}
      <CommentSection />
    </main>
  );
}