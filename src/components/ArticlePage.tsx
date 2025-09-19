import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Eye, Share2, Bookmark, Heart, BookmarkCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CommentSection } from './CommentSection';
import { toast } from 'sonner';
import { useArticles } from '../contexts/ArticleContext';

interface ArticlePageProps {
  articleId: string;
  onBackClick: () => void;
  onAuthorClick: (authorId: string) => void;
  isLoggedIn: boolean;
  onAddToHistory: (articleId: string, title: string) => void;
  onSaveArticle: (article: any) => void;
  onUnsaveArticle: (articleId: string) => void;
  isArticleSaved: (articleId: string) => boolean;
}

export function ArticlePage({ 
  articleId, 
  onBackClick, 
  onAuthorClick, 
  isLoggedIn,
  onAddToHistory,
  onSaveArticle,
  onUnsaveArticle,
  isArticleSaved
}: ArticlePageProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(42);
  const { publishedArticles, incrementReadCount } = useArticles();

  // Try to find article from published articles first
  let article = publishedArticles.find(a => a.id === articleId);
  
  // If not found, use mock data
  if (!article) {
    article = {
      id: articleId,
      title: 'Strategi Belajar Efektif untuk Mahasiswa di Era Digital',
      excerpt: 'Tips dan trik untuk memaksimalkan hasil belajar dengan memanfaatkan teknologi digital dan mengelola waktu dengan baik.',
      content: `
        <p>Di era digital saat ini, mahasiswa memiliki akses ke berbagai sumber belajar yang tidak terbatas. Namun, dengan banyaknya informasi yang tersedia, mahasiswa justru sering merasa kewalahan dan tidak tahu harus mulai dari mana. Artikel ini akan membahas strategi belajar efektif yang dapat membantu mahasiswa memaksimalkan potensi mereka.</p>

        <h3>1. Buat Jadwal Belajar yang Terstruktur</h3>
        <p>Salah satu kunci sukses dalam belajar adalah memiliki jadwal yang terstruktur. Buatlah time table harian dan mingguan yang mencakup waktu untuk kuliah, belajar mandiri, istirahat, dan aktivitas lainnya. Pastikan jadwal tersebut realistis dan dapat dijalankan secara konsisten.</p>

        <h3>2. Manfaatkan Teknologi dengan Bijak</h3>
        <p>Teknologi dapat menjadi sahabat terbaik dalam belajar jika digunakan dengan bijak. Beberapa aplikasi yang dapat membantu antara lain:</p>
        <ul>
          <li>Aplikasi note-taking seperti Notion atau Obsidian</li>
          <li>Aplikasi time management seperti Forest atau Pomodoro Timer</li>
          <li>Platform pembelajaran online seperti Coursera atau Khan Academy</li>
        </ul>

        <h3>3. Teknik Pomodoro untuk Konsentrasi Maksimal</h3>
        <p>Teknik Pomodoro adalah metode manajemen waktu yang membagi waktu belajar menjadi interval 25 menit yang diselingi dengan istirahat 5 menit. Teknik ini sangat efektif untuk mempertahankan konsentrasi dan mencegah burnout.</p>

        <h3>4. Active Learning vs Passive Learning</h3>
        <p>Hindari passive learning seperti hanya membaca atau mendengarkan. Sebagai gantinya, praktikkan active learning dengan cara:</p>
        <ul>
          <li>Membuat mind map dari materi yang dipelajari</li>
          <li>Mengajarkan materi kepada teman atau keluarga</li>
          <li>Membuat pertanyaan dan menjawabnya sendiri</li>
          <li>Menerapkan konsep dalam praktik nyata</li>
        </ul>

        <h3>5. Bangun Study Group yang Efektif</h3>
        <p>Belajar bersama teman dapat meningkatkan pemahaman dan motivasi. Namun, pastikan study group tetap fokus dan produktif. Tentukan tujuan yang jelas untuk setiap sesi dan bagi tugas dengan merata.</p>

        <h3>Kesimpulan</h3>
        <p>Belajar efektif di era digital membutuhkan strategi yang tepat. Dengan menggabungkan manajemen waktu yang baik, pemanfaatan teknologi yang bijak, dan teknik pembelajaran yang aktif, mahasiswa dapat mencapai hasil belajar yang optimal. Ingat, konsistensi adalah kunci utama kesuksesan dalam belajar.</p>
      `,
      imageUrl: 'https://images.unsplash.com/photo-1704748082614-8163a88e56b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTgwNTU2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      author: 'Dr. Sari Wijaya',
      authorId: 'sari-wijaya',
      publishDate: '15 Januari 2025',
      tag: 'Tips & Trik',
      readCount: 2840,
      readTime: '5 menit baca',
      isHeadline: false
    };
  }

  // Type assertion to help TypeScript understand that article is always defined
  const currentArticle = article!;

  const isSaved = isArticleSaved(articleId);

  // Add to reading history and increment read count when component mounts
  useEffect(() => {
    if (isLoggedIn) {
      onAddToHistory(articleId, currentArticle.title);
    }
    // Increment read count for published articles
    if (publishedArticles.find(a => a.id === articleId)) {
      // Simulate realistic user reading behavior - increment after 3 seconds
      const timer = setTimeout(() => {
        incrementReadCount(articleId);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [articleId, currentArticle.title, isLoggedIn, onAddToHistory, publishedArticles, incrementReadCount]);

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
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                      {currentArticle.authorId === 'writer-1' ? 
                        'Penulis aktif di Kamus Mahasiswa yang berbagi pengalaman dan tips untuk kehidupan mahasiswa.' :
                        'Dosen Psikologi Pendidikan di Universitas Indonesia. Memiliki pengalaman lebih dari 10 tahun dalam penelitian metode pembelajaran efektif.'
                      }
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