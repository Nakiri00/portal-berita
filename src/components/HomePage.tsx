import { useState, useEffect } from 'react';
import { NewsCard } from './NewsCard';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useArticles } from '../contexts/ArticleContext';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  author: string;
  publishDate: string;
  tag: string;
  readCount: number;
  isHeadline?: boolean;
}

interface HomePageProps {
  onArticleClick: (articleId: string) => void;
  onTagClick: (tag: string) => void;
  selectedTag: string;
  searchQuery: string;
  pageTitle?: string;
  pageDescription?: string;
  publishedArticles?: any[];
}

export function HomePage({ 
  onArticleClick, 
  onTagClick, 
  selectedTag, 
  searchQuery,
  pageTitle,
  pageDescription,
  publishedArticles = []
}: HomePageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visibleArticles, setVisibleArticles] = useState(6); // For load more functionality
  const { publishedArticles: contextArticles } = useArticles();
  
  // Tags that will have their own sections
  const availableTags = ['Akademik', 'Kehidupan Kampus', 'Tips & Trik', 'Beasiswa', 'Karir'];
  
  // Mock data with more diverse articles
  const mockArticles: Article[] = [
    {
      id: '1',
      title: 'Strategi Belajar Efektif untuk Mahasiswa di Era Digital',
      excerpt: 'Tips dan trik untuk memaksimalkan hasil belajar dengan memanfaatkan teknologi digital dan mengelola waktu dengan baik.',
      imageUrl: 'https://images.unsplash.com/photo-1704748082614-8163a88e56b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBzdHVkeWluZ3xlbnwxfHx8fDE3NTgwNTU2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      author: 'Dr. Sari Wijaya',
      publishDate: '15 Jan 2025',
      tag: 'Tips & Trik',
      readCount: 2840,
      isHeadline: true
    },
    {
      id: '2',
      title: 'Kehidupan Sosial di Kampus: Membangun Networking yang Kuat',
      excerpt: 'Pentingnya membangun jaringan pertemanan dan profesional selama kuliah untuk masa depan yang cerah.',
      imageUrl: 'https://images.unsplash.com/photo-1693011142814-aa33d7d1535c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxjYW1wdXMlMjBsaWZlJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzU4MDkxNzU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      author: 'Ahmad Rizki',
      publishDate: '14 Jan 2025',
      tag: 'Kehidupan Kampus',
      readCount: 1520
    },
    {
      id: '3',
      title: 'Persiapan Wisuda: Panduan Lengkap untuk Mahasiswa Tingkat Akhir',
      excerpt: 'Segala hal yang perlu diketahui mahasiswa menjelang wisuda, dari persiapan administratif hingga tips tampil percaya diri.',
      imageUrl: 'https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFkdWF0aW9uJTIwY2VyZW1vbnl8ZW58MXx8fHwxNzU4MDEzODM2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      author: 'Prof. Maya Indira',
      publishDate: '13 Jan 2025',
      tag: 'Akademik',
      readCount: 1890
    },
    {
      id: '4',
      title: 'Mengelola Stress dan Burnout Akademik',
      excerpt: 'Cara mengenali dan mengatasi stress berlebihan yang sering dialami mahasiswa selama masa perkuliahan.',
      imageUrl: 'https://images.unsplash.com/photo-1650525218265-d6fef4ada666?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwdGlwcyUyMHN0dWR5fGVufDF8fHx8MTc1ODA5MTc1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      author: 'Putri Amalia',
      publishDate: '12 Jan 2025',
      tag: 'Tips & Trik',
      readCount: 2150
    },
    {
      id: '5',
      title: 'Beasiswa LPDP 2025: Panduan Lengkap Pendaftaran',
      excerpt: 'Strategi jitu untuk mendapatkan beasiswa LPDP beserta tips wawancara dan persiapan dokumen.',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvbGFyc2hpcCUyMGVkdWNhdGlvbnxlbnwxfHx8fDE3NTgwNTU2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      author: 'Andi Pratama',
      publishDate: '11 Jan 2025',
      tag: 'Beasiswa',
      readCount: 3200
    },
    {
      id: '6',
      title: 'Kuliah Sambil Kerja: Strategi Time Management',
      excerpt: 'Tips praktis untuk mahasiswa yang harus menyeimbangkan antara kuliah dan pekerjaan.',
      imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JrJTIwc3R1ZHklMjBiYWxhbmNlfGVufDF8fHx8MTc1ODA1NTYxMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      author: 'Lisa Maharani',
      publishDate: '10 Jan 2025',
      tag: 'Tips & Trik',
      readCount: 1680
    },
    {
      id: '7',
      title: 'Membangun Soft Skills untuk Dunia Kerja',
      excerpt: 'Keterampilan penting yang harus dikuasai mahasiswa untuk meningkatkan daya saing di dunia profesional.',
      imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHNraWxsc3xlbnwxfHx8fDE3NTgwNTU2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      author: 'Budi Setiawan',
      publishDate: '9 Jan 2025',
      tag: 'Karir',
      readCount: 1950
    },
    {
      id: '8',
      title: 'Organisasi Kemahasiswaan: Manfaat dan Tips Bergabung',
      excerpt: 'Mengapa mahasiswa perlu aktif berorganisasi dan bagaimana memilih organisasi yang tepat.',
      imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwb3JnYW5pemF0aW9ufGVufDF8fHx8MTc1ODA1NTYxMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      author: 'Indira Sari',
      publishDate: '8 Jan 2025',
      tag: 'Kehidupan Kampus',
      readCount: 1750
    },
    {
      id: '9',
      title: 'Tips Presentasi yang Menarik untuk Mahasiswa',
      excerpt: 'Cara membuat dan menyampaikan presentasi yang efektif dan berkesan di lingkungan akademik.',
      imageUrl: 'https://images.unsplash.com/photo-1560472355-536de3962603?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVzZW50YXRpb24lMjBza2lsbHN8ZW58MXx8fHwxNzU4MDU1NjEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      author: 'Rina Melati',
      publishDate: '7 Jan 2025',
      tag: 'Akademik',
      readCount: 1430
    },
    {
      id: '10',
      title: 'Panduan Magang untuk Mahasiswa Tingkat Akhir',
      excerpt: 'Langkah-langkah mencari dan mempersiapkan diri untuk program magang yang berkualitas.',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnRlcm5zaGlwJTIwb2ZmaWNlfGVufDF8fHx8MTc1ODA1NTYxMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      author: 'Fajar Ramadhan',
      publishDate: '6 Jan 2025',
      tag: 'Karir',
      readCount: 2100
    },
    {
      id: '11',
      title: 'Beasiswa Erasmus: Peluang Kuliah Gratis di Eropa',
      excerpt: 'Informasi lengkap tentang beasiswa Erasmus Mundus dan cara mendaftar program studi di Eropa.',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwZXVyb3BlfGVufDF8fHx8MTc1ODA1NTYxMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      author: 'Dewi Kartika',
      publishDate: '5 Jan 2025',
      tag: 'Beasiswa',
      readCount: 2800
    },
    {
      id: '12',
      title: 'Mengatasi Homesick di Rantau: Tips untuk Mahasiswa Perantau',
      excerpt: 'Cara mengatasi rasa rindu kampung halaman dan beradaptasi dengan lingkungan baru.',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwZG9ybXxlbnwxfHx8fDE3NTgwNTU2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      author: 'Galih Pratama',
      publishDate: '4 Jan 2025',
      tag: 'Kehidupan Kampus',
      readCount: 1620
    },
    {
      id: '13',
      title: 'Beasiswa BCA: Kesempatan Emas untuk Mahasiswa Berprestasi',
      excerpt: 'Informasi lengkap tentang beasiswa BCA, syarat, dan tips sukses mendaftar program beasiswa bergengsi ini.',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvbGFyc2hpcCUyMGVkdWNhdGlvbnxlbnwxfHx8fDE3NTgwNTU2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      author: 'Siska Amelia',
      publishDate: '3 Jan 2025',
      tag: 'Beasiswa',
      readCount: 1850
    },
    {
      id: '14',
      title: 'Beasiswa DIKTI: Panduan Lengkap untuk Mahasiswa S1',
      excerpt: 'Strategi dan tips mendapatkan beasiswa DIKTI untuk jenjang sarjana dengan persiapan yang matang.',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwZXVyb3BlfGVufDF8fHx8MTc1ODA1NTYxMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      author: 'Ahmad Fauzi',
      publishDate: '2 Jan 2025',
      tag: 'Beasiswa',
      readCount: 2240
    },
    {
      id: '15',
      title: 'Beasiswa Australia Awards: Studi ke Australia Gratis',
      excerpt: 'Peluang kuliah gratis di Australia melalui program Australia Awards Scholarship untuk mahasiswa Indonesia.',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvbGFyc2hpcCUyMGVkdWNhdGlvbnxlbnwxfHx8fDE3NTgwNTU2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      author: 'Maria Theresia',
      publishDate: '1 Jan 2025',
      tag: 'Beasiswa',
      readCount: 1970
    }
  ];

  // Combine mock articles with published articles from context and props
  // Prioritize published articles (newest first), then mock articles
  const allArticles = [
    ...contextArticles.map(article => ({ ...article, isNew: true })),
    ...publishedArticles.map(article => ({ ...article, isNew: true })),
    ...mockArticles.map(article => ({ ...article, isNew: false }))
  ];

  // Filter articles based on selected tag and search query
  const filteredArticles = allArticles.filter(article => {
    const matchesTag = !selectedTag || article.tag === selectedTag;
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTag && matchesSearch;
  });

  // Get multiple headline articles (prioritize new articles, then by read count)
  const headlineArticles = filteredArticles
    .filter(article => 
      article.isHeadline || // Articles marked as headline (50+ reads)
      article.readCount >= 50 || // Articles with 50+ reads
      (article.isNew && article.readCount >= 25) || // New articles with good traction
      (!contextArticles.length && article.readCount > 2000) // Fallback for mock data
    )
    .sort((a, b) => {
      // Prioritize officially marked headlines first
      if (a.isHeadline && !b.isHeadline) return -1;
      if (!a.isHeadline && b.isHeadline) return 1;
      // Then prioritize new articles
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      // Finally by read count
      return b.readCount - a.readCount;
    })
    .slice(0, 3);
  
  const regularArticles = filteredArticles
    .filter(article => !headlineArticles.some(headline => headline.id === article.id))
    .sort((a, b) => {
      // Prioritize new articles first
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      // Then by read count
      return b.readCount - a.readCount;
    });

  // Handle load more functionality
  const handleLoadMore = () => {
    setVisibleArticles(prev => prev + 6);
  };

  const hasMoreArticles = regularArticles.length > visibleArticles;

  // Auto-slide effect
  useEffect(() => {
    if (headlineArticles.length > 1 && !selectedTag && !searchQuery) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % headlineArticles.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [headlineArticles.length, selectedTag, searchQuery]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % headlineArticles.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + headlineArticles.length) % headlineArticles.length);
  };

  // Clear filter function
  const clearFilters = () => {
    onTagClick('');
    // Navigate to home without search params
    if (searchQuery) {
      window.history.pushState({}, '', '/');
      window.location.reload(); // Force reload to clear search params
    }
  };

  // Group articles by tags for section display
  const getArticlesByTag = (tag: string) => {
    return allArticles
      .filter(article => article.tag === tag)
      .sort((a, b) => {
        // Prioritize new articles first
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        // Then by read count
        return b.readCount - a.readCount;
      })
      .slice(0, 4); // Show top 4 articles per tag
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {pageTitle || (selectedTag ? `Artikel ${selectedTag}` : (searchQuery ? 'Hasil Pencarian' : 'Beranda'))}
        </h1>
        {pageDescription && (
          <p className="text-gray-600">{pageDescription}</p>
        )}
        {(selectedTag && !pageDescription) && (
          <p className="text-gray-600">Kumpulan artikel dengan tag {selectedTag}</p>
        )}
        {(searchQuery && !pageDescription) && (
          <p className="text-gray-600">Menampilkan hasil untuk "{searchQuery}"</p>
        )}
        
        {/* Active Filters */}
        {(selectedTag || searchQuery) && (
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
            <span className="text-sm text-gray-500">Filter aktif:</span>
            <div className="flex flex-wrap items-center gap-2">
              {selectedTag && (
                <Badge variant="default" className="cursor-pointer" onClick={clearFilters}>
                  {selectedTag} ×
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary">
                  "{searchQuery}"
                </Badge>
              )}
              <button 
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Hapus semua filter
              </button>
            </div>
          </div>
        )}
      </div>

      {filteredArticles.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.007-5.824-2.709A7.962 7.962 0 0112 9c2.34 0 4.29 1.007 5.824 2.709" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada artikel ditemukan</h3>
          <p className="text-gray-500 mb-4">
            {selectedTag || searchQuery ? 'Coba ubah filter atau kata kunci pencarian' : 'Belum ada artikel yang tersedia'}
          </p>
          {(selectedTag || searchQuery) && (
            <button 
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800"
            >
              Lihat semua artikel
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Hero Section with Headlines Carousel */}
          {headlineArticles.length > 0 && !selectedTag && !searchQuery && (
            <section className="mb-8 sm:mb-12">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Berita Utama</h2>
                <p className="text-sm sm:text-base text-gray-600">Berita paling banyak dibaca minggu ini</p>
              </div>
              
              <div className="relative">
                <div className="overflow-hidden rounded-lg">
                  <div 
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {headlineArticles.map((article) => (
                      <div key={article.id} className="w-full flex-shrink-0">
                        <NewsCard
                          {...article}
                          onClick={() => onArticleClick(article.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation arrows - only show if more than 1 headline and not mobile */}
                {headlineArticles.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                      onClick={prevSlide}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                      onClick={nextSlide}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Dots indicator */}
                {headlineArticles.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {headlineArticles.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentSlide ? 'bg-white' : 'bg-white/50'
                        }`}
                        onClick={() => setCurrentSlide(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Regular News Grid */}
          <section>
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {selectedTag || searchQuery ? 'Artikel' : 'Berita Terbaru'}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                {filteredArticles.length} artikel ditemukan
              </p>
            </div>
            
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {regularArticles.slice(0, visibleArticles).map((article) => (
                <NewsCard
                  key={article.id}
                  {...article}
                  onClick={() => onArticleClick(article.id)}
                />
              ))}
            </div>
          </section>

          {/* Load More Button */}
          {hasMoreArticles && (
            <div className="text-center mt-8 sm:mt-12">
              <Button 
                onClick={handleLoadMore}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Muat Lebih Banyak ({regularArticles.length - visibleArticles} artikel tersisa)
              </Button>
            </div>
          )}

          {/* Tags Sections - Only show on homepage without filters */}
          {!selectedTag && !searchQuery && (
            <div className="mt-12 sm:mt-16">
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Jelajahi Berdasarkan Kategori</h2>
                <p className="text-sm sm:text-base text-gray-600">Temukan artikel sesuai dengan minat dan kebutuhan Anda</p>
              </div>

              {availableTags.map((tag) => {
                const tagArticles = getArticlesByTag(tag);
                if (tagArticles.length === 0) return null;

                return (
                  <section key={tag} className="mb-10 sm:mb-12">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{tag}</h3>
                        <p className="text-sm text-gray-600">{tagArticles.length} artikel tersedia</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onTagClick(tag)}
                        className="hover:bg-blue-50 hover:border-blue-300"
                      >
                        Lihat Semua
                      </Button>
                    </div>
                    
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                      {tagArticles.map((article) => (
                        <NewsCard
                          key={article.id}
                          {...article}
                          onClick={() => onArticleClick(article.id)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}