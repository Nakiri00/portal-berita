import React, { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ArrowLeft, Eye, Calendar, MapPin, Instagram, Facebook, Twitter, Share2, Check, Copy, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton'; // Import Skeleton untuk loading

// --- Perbaikan Import Services ---
// Asumsi: getArticlesByAuthor dan Article di-export dari articleService
import { getArticlesByAuthor, Article as ApiArticle } from '../services/articleService'; 

// Asumsi: getWriterProfile di-export dari userService (Pastikan file ini ada)
import { getWriterProfile } from '../services/userService';

// Definisikan tipe dasar yang diharapkan dari API Profil Penulis (WriterProfile)
interface WriterProfile {
  _id: string;
  name: string;
  avatar: { url: string }; 
  bio: string;
  joinedAt: string;
  publishedArticles: number; // Jumlah artikel terpublikasi
  followers?: number;
  following?: number;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

// Definisikan tipe untuk AuthorProfile yang akan disimpan di state
interface AuthorProfileData extends WriterProfile {
  title: string;
  location: string;
  joinDate: string; // String yang sudah diformat
  articlesCount: number;
  articles: AuthorArticle[];
  // PERBAIKAN: Menetapkan ulang socialMedia secara eksplisit (Non-optional)
  socialMedia: { 
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

// Definisikan tipe untuk artikel penulis agar sesuai dengan tampilan di ArticleCard
interface AuthorArticle {
  id: string;
  title: string;
  excerpt: string;
  publishDate: string;
  readCount: number;
  tag: string;
}

interface AuthorProfileProps {
  authorId: string;
  onBackClick: () => void;
  onArticleClick: (articleId: string) => void;
}

export function AuthorProfile({ authorId, onBackClick, onArticleClick }: AuthorProfileProps) {
  const [author, setAuthor] = useState<AuthorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isLoggedIn, isFollowing, followAuthor, unfollowAuthor } = useAuth();
  
  // Ambil data penulis dan artikel saat authorId berubah
  useEffect(() => {
    if (!authorId) return;

    const fetchAuthorData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. Ambil Profil Penulis dari userService
        const profile: WriterProfile = await getWriterProfile(authorId);

        // 2. Ambil Artikel yang Sudah Dipublikasikan oleh Penulis dari articleService
        // Catatan: Pastikan getArticlesByAuthor ada di articleService dan mengembalikan ArticlesResponse
        const articlesResponse = await getArticlesByAuthor(authorId, { status: 'published' });
        
        // 3. Mapping data artikel ke format lokal yang dibutuhkan ArticleCard
        const mappedArticles: AuthorArticle[] = articlesResponse.data.articles.map((article: ApiArticle) => ({
            id: article._id,
            title: article.title,
            excerpt: article.excerpt,
            tag: article.category, // Map category ke tag
            readCount: article.views, // Map views ke readCount
            publishDate: article.publishedAt 
                ? new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'N/A',
        }));

        // 4. Gabungkan dan Set State
        const joinedDate = new Date(profile.joinedAt).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        
        setAuthor({
          ...profile,
          // Field yang ditambahkan/dikonfigurasi untuk tampilan UI
          title: 'Penulis', 
          location: 'Indonesia', 
          joinDate: `Bergabung sejak ${joinedDate}`,
          articlesCount: articlesResponse.data.pagination.total, // Gunakan total dari respons artikel
          articles: mappedArticles,
          // socialMedia dijamin ada di sini (non-nullable)
          socialMedia: profile.socialMedia || { instagram: '', facebook: '', twitter: '' },
          followers: profile.followers || 0,
          following: profile.following || 0,
        } as AuthorProfileData); 
        
      } catch (err) {
        // Penanganan error yang lebih umum
        const errorMessage = (err instanceof Error) ? err.message : 'Terjadi kesalahan saat mengambil data.';
        setError(errorMessage);
        console.error('Error fetching author data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorData();
  }, [authorId]);


  const isCurrentlyFollowing = isFollowing(authorId);

  // --- Handlers (tetap sama) ---

  const handleFollowClick = () => {
    // ... (Logika follow/unfollow)
    if (!isLoggedIn) {
      toast.error('Silakan login terlebih dahulu untuk mengikuti penulis');
      return;
    }

    if (isCurrentlyFollowing) {
      unfollowAuthor(authorId);
      toast.success('Berhenti mengikuti penulis');
    } else {
      followAuthor(authorId);
      toast.success('Mulai mengikuti penulis');
    }
  };

  const handleShareProfile = () => {
    const profileUrl = window.location.href;
    navigator.clipboard.writeText(profileUrl).then(() => {
      toast.success('Link profil disalin ke clipboard');
    }).catch(() => {
      toast.error('Gagal menyalin link');
    });
  };

  const handleSocialShare = (platform: string) => {
    const profileUrl = window.location.href;
    const text = `Lihat profil ${author?.name || 'Penulis'} di Kamus Mahasiswa`;
    
    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + profileUrl)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(text)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const ArticleCard = ({ article }: { article: AuthorArticle }) => (
    <div 
      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-md"
      onClick={() => onArticleClick(article.id)}
    >
      <Badge variant="secondary" className="mb-3 text-xs">
        {article.tag}
      </Badge>
      <h3 className="font-semibold text-gray-900 mb-3 hover:text-blue-600 text-base leading-tight">
        {article.title}
      </h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
        {article.excerpt}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3" />
          <span>{article.publishDate}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Eye className="h-3 w-3" />
          <span>{article.readCount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
  
  // --- Loading State ---
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Button variant="outline" className="mb-6" disabled>
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>
        <Card className="mb-8">
          <CardContent className="p-8 flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-8 items-center lg:items-start">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-3 w-full lg:w-auto">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="flex space-x-8 pt-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
              <Skeleton className="h-4 w-full pt-4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="flex space-x-3 lg:flex-col lg:space-x-0 lg:space-y-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
          <CardContent><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div></CardContent>
        </Card>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 text-center text-red-600">
        <h2 className="text-2xl font-bold mb-4">Gagal Memuat Profil</h2>
        <p>Terjadi kesalahan: {error}</p>
        <Button onClick={onBackClick} className="mt-4"><ArrowLeft className="h-4 w-4 mr-2" /> Kembali</Button>
      </div>
    );
  }

  // --- No Author Data ---
  if (!author) {
    return (
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-gray-600">
            <h2 className="text-2xl font-bold mb-4">Penulis Tidak Ditemukan</h2>
            <p>Profil dengan ID tersebut tidak tersedia atau bukan penulis.</p>
            <Button onClick={onBackClick} className="mt-4"><ArrowLeft className="h-4 w-4 mr-2" /> Kembali</Button>
        </div>
    );
  }

  // --- Render Utama ---
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Back Button */}
      <Button 
        variant="outline" 
        onClick={onBackClick}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali
      </Button>

      {/* Author Header */}
      <Card className="mb-8">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Avatar */}
            <div className="flex justify-center lg:justify-start">
              <Avatar className="h-28 w-28 sm:h-32 sm:w-32">
                {/* Menggunakan URL Avatar dari data database */}
                <AvatarImage src={author.avatar?.url || undefined} alt={`@${author.name}`} />
                <AvatarFallback className="text-2xl">
                  {author.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Main Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{author.name}</h1>
              <p className="text-lg text-gray-600 mb-3">{author.title}</p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center justify-center lg:justify-start">
                  <MapPin className="h-4 w-4 mr-1" />
                  {author.location}
                </span>
                <span>{author.joinDate}</span>
              </div>
              
              {/* Stats */}
              <div className="flex items-center justify-center lg:justify-start space-x-8 mb-6">
                <div className="text-center lg:text-left">
                  <div className="font-bold text-xl text-gray-900">{author.articlesCount}</div>
                  <div className="text-sm text-gray-500">Artikel</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="font-bold text-xl text-gray-900">{(author.followers || 0) + (isCurrentlyFollowing ? 1 : 0)}</div>
                  <div className="text-sm text-gray-500">Pengikut</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="font-bold text-xl text-gray-900">{author.following || 0}</div>
                  <div className="text-sm text-gray-500">Mengikuti</div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-gray-700 mb-6 leading-relaxed max-w-2xl">{author.bio || 'Penulis ini belum menambahkan deskripsi diri. Nantikan artikel-artikel menarik dari beliau!'}</p>

              {/* Social Media - Sekarang menggunakan data dari state/database */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-6">
                <span className="text-sm text-gray-500">Ikuti di:</span>
                <div className="flex items-center justify-center lg:justify-start space-x-4">
                  {author.socialMedia?.instagram && (
                    <a 
                      href={`https://instagram.com/${author.socialMedia.instagram.replace('@', '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-pink-600 hover:text-pink-700 transition-colors"
                    >
                      <Instagram className="h-4 w-4" />
                      <span className="text-sm">{author.socialMedia.instagram}</span>
                    </a>
                  )}
                  {author.socialMedia?.facebook && (
                    <a 
                      href={`https://facebook.com/${author.socialMedia.facebook}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Facebook className="h-4 w-4" />
                      <span className="text-sm hidden sm:inline">{author.socialMedia.facebook}</span>
                    </a>
                  )}
                  {author.socialMedia?.twitter && (
                    <a 
                      href={`https://twitter.com/${author.socialMedia.twitter.replace('@', '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-sky-600 hover:text-sky-700 transition-colors"
                    >
                      <Twitter className="h-4 w-4" />
                      <span className="text-sm hidden sm:inline">{author.socialMedia.twitter}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row lg:flex-col space-x-3 lg:space-x-0 lg:space-y-3 justify-center lg:justify-start">
              <Button 
                onClick={handleFollowClick}
                className={`flex-1 lg:w-32 ${isCurrentlyFollowing ? 'bg-green-600 hover:bg-green-700' : ''}`}
                disabled={!isLoggedIn} // Disable jika belum login
              >
                {isCurrentlyFollowing ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Mengikuti
                  </>
                ) : (
                  'Ikuti'
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 lg:w-32">
                    <Share2 className="h-4 w-4 mr-2" />
                    Bagikan
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleShareProfile}>
                    <Copy className="mr-2 h-4 w-4" />
                    Salin Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSocialShare('whatsapp')}>
                    <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
                    WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSocialShare('telegram')}>
                    <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    Telegram
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSocialShare('facebook')}>
                    <Facebook className="mr-2 h-4 w-4" />
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSocialShare('twitter')}>
                    <Twitter className="mr-2 h-4 w-4" />
                    Twitter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Artikel oleh {author.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {author.articles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.007-5.824-2.709A7.962 7.962 0 0112 9c2.34 0 4.29 1.007 5.824 2.709" />
                </svg>
              </div>
              <p className="text-gray-500">Belum ada artikel yang dipublikasikan</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {author.articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
