import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ArrowLeft, Eye, Calendar, MapPin, Instagram, Facebook, Twitter, Share2, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useArticles } from '../contexts/ArticleContext';

interface AuthorProfileProps {
  authorId: string;
  onBackClick: () => void;
  onArticleClick: (articleId: string) => void;
}

export function AuthorProfile({ authorId, onBackClick, onArticleClick }: AuthorProfileProps) {
  const { isLoggedIn, isFollowing, followAuthor, unfollowAuthor, userProfile } = useAuth();
  const { publishedArticles } = useArticles();
  
  // Get author data based on authorId
  const getAuthorData = (id: string) => {
    // Check if this is writer-1 (current logged in writer)
    if (id === 'writer-1') {
      // Get articles from this writer
      const writerArticles = publishedArticles.filter(article => article.authorId === 'writer-1');
      
      return {
        name: userProfile?.name || 'Penulis Kamus Mahasiswa',
        title: 'Penulis Kamus Mahasiswa',
        institution: 'Kamus Mahasiswa',
        location: 'Indonesia',
        bio: 'Penulis aktif di Kamus Mahasiswa yang berbagi pengalaman dan tips untuk kehidupan mahasiswa.',
        avatar: '',
        followers: 0,
        following: 0,
        articlesCount: writerArticles.length,
        joinDate: 'Bergabung sebagai penulis',
        socialMedia: {
          instagram: '@kamusmahasiswa',
          facebook: 'Kamus Mahasiswa',
          twitter: '@kamusmahasiswa'
        },
        articles: writerArticles.map(article => ({
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          publishDate: article.publishDate,
          readCount: article.readCount,
          tag: article.tag
        }))
      };
    }
    
    // Mock data untuk penulis lain
    const authors = {
      'sari-wijaya': {
        name: 'Dr. Sari Wijaya',
        title: 'Dosen Psikologi Pendidikan',
        institution: 'Universitas Indonesia',
        location: 'Jakarta, Indonesia',
        bio: 'Dosen Psikologi Pendidikan di Universitas Indonesia dengan pengalaman lebih dari 10 tahun dalam penelitian metode pembelajaran efektif. Aktif menulis artikel ilmiah dan tips belajar untuk mahasiswa.',
        avatar: '',
        followers: 1250,
        following: 89,
        articlesCount: 3,
        joinDate: 'Bergabung sejak Maret 2023',
        socialMedia: {
          instagram: '@dr.sariwijaya',
          facebook: 'Dr. Sari Wijaya',
          twitter: '@sariwijaya_phd'
        },
        articles: [
          {
            id: 'mock-1',
            title: 'Strategi Belajar Efektif untuk Mahasiswa di Era Digital',
            excerpt: 'Tips dan trik untuk memaksimalkan hasil belajar dengan memanfaatkan teknologi digital.',
            publishDate: '15 Jan 2025',
            readCount: 2840,
            tag: 'Tips & Trik'
          },
          {
            id: 'mock-2',
            title: 'Mengatasi Prokrastinasi dalam Belajar',
            excerpt: 'Strategi psikologis untuk mengatasi kebiasaan menunda-nunda tugas kuliah.',
            publishDate: '8 Jan 2025',
            readCount: 1560,
            tag: 'Tips & Trik'
          },
          {
            id: 'mock-3',
            title: 'Pentingnya Self-Care untuk Mahasiswa',
            excerpt: 'Menjaga kesehatan mental dan fisik selama masa perkuliahan.',
            publishDate: '3 Jan 2025',
            readCount: 980,
            tag: 'Kehidupan Kampus'
          }
        ]
      },
      'ahmad-rizki': {
        name: 'Ahmad Rizki',
        title: 'Content Creator & Mahasiswa',
        institution: 'Institut Teknologi Bandung',
        location: 'Bandung, Indonesia',
        bio: 'Mahasiswa Teknik Informatika ITB yang aktif berbagi pengalaman kehidupan kampus dan tips produktivitas untuk sesama mahasiswa.',
        avatar: '',
        followers: 890,
        following: 156,
        articlesCount: 1,
        joinDate: 'Bergabung sejak Juni 2024',
        socialMedia: {
          instagram: '@ahmadrizki.dev',
          facebook: 'Ahmad Rizki',
          twitter: '@rizki_ahmad'
        },
        articles: [
          {
            id: 'mock-4',
            title: 'Kehidupan Sosial di Kampus: Membangun Networking yang Kuat',
            excerpt: 'Pentingnya membangun relasi sosial yang sehat selama masa perkuliahan.',
            publishDate: '14 Jan 2025',
            readCount: 1890,
            tag: 'Kehidupan Kampus'
          }
        ]
      }
    };
    
    return authors[id as keyof typeof authors] || authors['sari-wijaya'];
  };

  const author = getAuthorData(authorId);

  const isCurrentlyFollowing = isFollowing(authorId);

  const handleFollowClick = () => {
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
    const text = `Lihat profil ${author.name} di Kamus Mahasiswa`;
    
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

  const ArticleCard = ({ article }: { article: any }) => (
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
                  <div className="font-bold text-xl text-gray-900">{author.followers + (isCurrentlyFollowing ? 1 : 0)}</div>
                  <div className="text-sm text-gray-500">Pengikut</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="font-bold text-xl text-gray-900">{author.following}</div>
                  <div className="text-sm text-gray-500">Mengikuti</div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-gray-700 mb-6 leading-relaxed max-w-2xl">{author.bio}</p>

              {/* Social Media */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-6">
                <span className="text-sm text-gray-500">Ikuti di:</span>
                <div className="flex items-center justify-center lg:justify-start space-x-4">
                  {author.socialMedia.instagram && (
                    <a 
                      href="#" 
                      className="flex items-center space-x-1 text-pink-600 hover:text-pink-700 transition-colors"
                    >
                      <Instagram className="h-4 w-4" />
                      <span className="text-sm">{author.socialMedia.instagram}</span>
                    </a>
                  )}
                  {author.socialMedia.facebook && (
                    <a 
                      href="#" 
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Facebook className="h-4 w-4" />
                      <span className="text-sm hidden sm:inline">{author.socialMedia.facebook}</span>
                    </a>
                  )}
                  {author.socialMedia.twitter && (
                    <a 
                      href="#" 
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
                    <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSocialShare('telegram')}>
                    <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
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