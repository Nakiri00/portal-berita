import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Eye, Share2, Bookmark, Heart, BookmarkCheck, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CommentSection } from './CommentSection';
import { toast } from 'sonner';
import { useArticles } from '../contexts/ArticleContext';
import { getWriterProfile } from '../services/userService'; // Import service untuk ambil Bio

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
  onAddToHistory: (articleId: string, title: string) => void;
  onSaveArticle: (article: any) => void;
  onUnsaveArticle: (articleId: string) => void;
  isArticleSaved: (articleId: string) => boolean;
  onLogout?: () => void; // <--- PERBAIKAN: DIUBAH MENJADI OPSIONAL
}

export function ArticlePage({ 
  articleId, 
  onBackClick, 
  onAuthorClick, 
  isLoggedIn,
  onAddToHistory,
  onSaveArticle,
  onUnsaveArticle,
  isArticleSaved,
  onLogout 
}: ArticlePageProps) {
    
    // --- HOOKS: HARUS DI ATAS DAN UNCONDITIONAL ---
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(42);
    // State untuk menyimpan bio penulis
    const [authorBioData, setAuthorBioData] = useState<ArticleAuthor | null>(null);

    // Context Hook
  const { publishedArticles, incrementReadCount } = useArticles();

    // Cari artikel dari published articles
  let article = publishedArticles.find(a => a.id === articleId);

    // --- EFFECT UNTUK AMBIL BIO PENULIS (HOOKS TETAP DI ATAS) ---
    useEffect(() => {
        // HANYA JALANKAN JIKA ARTIKEL SUDAH DITEMUKAN
        if (!article || !article.authorId) return; 

        const fetchAuthorBio = async () => {
            try {
                // Menggunakan service yang sudah kita buat
                const profile = await getWriterProfile(article.authorId);
                
                setAuthorBioData({
                    name: profile.name,
                    avatar: profile.avatar.url,
                    bio: profile.bio 
                });

            } catch (error) {
                console.error("Gagal mengambil data bio penulis:", error);
                setAuthorBioData({
                    name: article.author,
                    avatar: '',
                    bio: 'Gagal memuat bio penulis dari server.'
                });
            }
        };

        fetchAuthorBio();
    }, [article?.authorId]); 


    // --- EFFECT UNTUK HISTORY & READ COUNT (HOOKS TETAP DI ATAS) ---
  useEffect(() => {
    // HANYA JALANKAN JIKA ARTIKEL SUDAH DITEMUKAN
    if (!article) return;

    if (isLoggedIn) {
      onAddToHistory(articleId, article.title);
    }
    // Increment read count for published articles
    if (publishedArticles.find(a => a.id === articleId)) {
      // Simulate realistic user reading behavior - increment after 3 seconds
      const timer = setTimeout(() => {
        incrementReadCount(articleId);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [article, articleId, isLoggedIn, onAddToHistory, publishedArticles, incrementReadCount]);


    // --- KONDISI PENGEMBALIAN AWAL (HARUS SETELAH SEMUA HOOKS) ---
  if (!article) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
            <h1 className="text-3xl font-bold mb-4">Memuat Artikel...</h1>
            <p>Artikel mungkin sedang dimuat atau tidak ditemukan.</p>
        </div>
    );
  }
    
    // ... LANJUTKAN DENGAN KODE RENDERING NORMAL ...
    
  const currentArticle = article!;
  const isSaved = isArticleSaved(articleId);
    
    // Tentukan data penulis yang akan ditampilkan (prioritas dari fetch API)
    const displayAuthor = authorBioData || { 
        name: currentArticle.author, 
        bio: 'Memuat bio...', 
        avatar: '' 
    };

    // --- HANDLERS (Tidak Berubah) ---
  const handleLogoutClick = () => {
    // Pengecekan agar tidak error jika onLogout tidak didefinisikan
    if (onLogout) {
        onLogout();
    }
    window.location.replace('/');
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

  const handleLike = () => {
    if (!isLoggedIn) {
      toast.error('Silakan login terlebih dahulu');
      return;
    }
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    toast.success(isLiked ? 'Like dibatalkan' : 'Artikel disukai');
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

  const handleHomeClick = () => {
    // Most reliable home navigation method
    window.location.href = '/';
  };

  const handleEmergencyExit = () => {
    // Emergency exit function that always works
    window.location.replace('/');
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
        <Button 
          variant="outline" 
          onClick={handleHomeClick}
          className="hover:bg-blue-50 hover:border-blue-300"
        >
          <span>Beranda</span>
        </Button>
        {/* Tombol Logout - Hanya jika user login */}
        {isLoggedIn && (
            <Button
              variant="outline"
              onClick={handleLogoutClick} // MEMANGGIL HANDLER BARU
              className="ml-auto bg-red-500 text-white hover:bg-red-600"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
        )}
        {/* Emergency exit button (hidden but functional) */}
        <Button 
          variant="ghost" 
          onClick={handleEmergencyExit}
          className="opacity-50 hover:opacity-100 text-xs"
          size="sm"
          title="Keluar ke beranda (emergency)"
        >
          ⌂
        </Button>
      </div>

      {/* Article Header */}
      <article className="bg-white rounded-lg shadow-sm">
        {/* Featured Image */}
        <div className="w-full h-48 sm:h-64 md:h-80 overflow-hidden rounded-t-lg">
          <img 
            src={currentArticle.imageUrl} 
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
