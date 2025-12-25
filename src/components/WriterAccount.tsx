import { useState, useRef, useEffect} from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Edit, User, Eye, FileText, TrendingUp, Users, Save, X, BarChart3, Camera, Calendar, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { assetUrl } from '../utils/assets';
import { CropAvatarModal } from './CropAvatarModal';
import { getWriterArticles, Article } from '../services/articleService';
interface WriterAccountProps {
  userProfile: {
    name: string;
    email: string;
    avatar: string;
    bio?: string;
    joinDate?: string;
  };
  onUpdateProfile: (formData: FormData) => Promise<{ success: boolean; message?: string }>;
  onArticleClick: (articleId: string) => void;
}

const ITEMS_PER_PAGE = 5;

export function WriterAccount({ userProfile, onUpdateProfile, onArticleClick }: WriterAccountProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    ...userProfile,
    bio: userProfile.bio || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [articlesPage, setArticlesPage] = useState(1);
  const [analyticsPage, setAnalyticsPage] = useState(1); 

  useEffect(() => {
      setEditedProfile({
        ...userProfile,
        bio: userProfile.bio || ''
      });
    }, [userProfile]);

    useEffect(() => {
    const fetchWriterData = async () => {
      setIsLoadingArticles(true);
      try {
        // Ambil artikel penulis (limit besar untuk kalkulasi statistik)
        const response = await getWriterArticles({ limit: 100 });
        setArticles(response.data.articles);
      } catch (error) {
        console.error("Gagal memuat data penulis", error);
        toast.error("Gagal memuat statistik penulis");
      } finally {
        setIsLoadingArticles(false);
      }
    };

    fetchWriterData();
  }, []);

  const totalArticlesPages = Math.ceil(articles.length / ITEMS_PER_PAGE);
  const currentArticlesList = articles.slice(
    (articlesPage - 1) * ITEMS_PER_PAGE,
    articlesPage * ITEMS_PER_PAGE
  );

  const totalAnalyticsPages = Math.ceil(articles.length / ITEMS_PER_PAGE);
  const currentAnalyticsList = articles.slice(
    (analyticsPage - 1) * ITEMS_PER_PAGE,
    analyticsPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (activeTab === 'articles') setArticlesPage(1);
    if (activeTab === 'analytics') setAnalyticsPage(1);
  }, [activeTab]);

  const totalArticles = articles.length;
  const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
  const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0);
  // Note: Saat ini interface Article belum memiliki field 'comments count', jadi kita set 0 atau perlu update backend.
  const totalComments = 0;

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setCropImage(objectUrl); // buka modal crop
  };

  const handleCropComplete = (file: File) => {
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
    setCropImage(null);
  };


  const handleSave = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', editedProfile.name);
      formData.append('email', editedProfile.email);
      formData.append('bio', editedProfile.bio);
      
      if (selectedFile) {
        formData.append('avatar', selectedFile); // Kunci 'avatar' harus sesuai backend
      }

      const result = await onUpdateProfile(formData);

      if (result.success) {
        toast.success('Profil berhasil diperbarui');
        setIsEditing(false);
        setPreviewImage(null); // Reset preview karena userProfile sudah update
        setSelectedFile(null);
      } else {
        toast.error(result.message || 'Gagal memperbarui profil');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menyimpan perubahan');
    } finally {
      setIsLoading(false);
    }
  };


  const handleCancel = () => {
    setEditedProfile({
      ...userProfile,
      bio: userProfile.bio || ''
    });

    setPreviewImage(null);
    setSelectedFile(null);
    setCropImage(null);
    setIsEditing(false);
  };

  // Mock data untuk artikel yang ditulis penulis
  const myArticles = [
    {
      id: '1',
      title: 'Strategi Belajar Efektif untuk Mahasiswa di Era Digital',
      publishDate: '15 Jan 2025',
      views: 2840,
      likes: 89,
      comments: 23,
      status: 'Published',
      tag: 'Tips & Trik'
    },
    {
      id: '5',
      title: 'Mengelola Keuangan Mahasiswa dengan Bijak',
      publishDate: '10 Jan 2025',
      views: 1520,
      likes: 45,
      comments: 12,
      status: 'Published',
      tag: 'Kehidupan Kampus'
    }
  ];

  // Mock data untuk statistik
  const readerStats = [
    {
      articleTitle: 'Strategi Belajar Efektif untuk Mahasiswa di Era Digital',
      views: 2840,
      uniqueReaders: 2156,
      avgReadTime: '4.2 menit',
      date: '15 Jan 2025'
    },
    {
      articleTitle: 'Mengelola Keuangan Mahasiswa dengan Bijak',
      views: 1520,
      uniqueReaders: 1203,
      avgReadTime: '3.8 menit',
      date: '10 Jan 2025'
    }
  ];


  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Draft';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  const ArticleItem = ({ article }: { article: Article }) => (
    <div 
      className="p-3 sm:p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onArticleClick(article._id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 mb-2 hover:text-blue-600 text-sm sm:text-base line-clamp-2">
            {article.title}
          </h4>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-2">
            <span>{formatDate(article.publishedAt || article.createdAt)}</span>
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{article.views.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-xs sm:text-sm">
            <span className="text-blue-600">{article.likes} likes</span>
            {/* Jika backend nanti support comment count, ganti angka 0 ini */}
            <span className="text-green-600">0 komentar</span> 
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <Badge 
            variant={article.status === 'published' ? 'default' : article.status === 'draft' ? 'secondary' : 'destructive'} 
            className="text-xs capitalize"
          >
            {article.status}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {article.category || 'Umum'}
          </Badge>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
      return () => {
        if (previewImage) URL.revokeObjectURL(previewImage);
        if (cropImage) URL.revokeObjectURL(cropImage);
      };
    }, [previewImage, cropImage]);

  const PaginationControls = ({ 
    page, 
    totalPages, 
    setPage 
  }: { 
    page: number; 
    totalPages: number; 
    setPage: (p: number) => void 
  }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <div className="text-sm text-gray-500">
          Hal {page} dari {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };
  
  
  return (
  <>
    {cropImage && (
        <CropAvatarModal
          image={cropImage}
          onCancel={() => setCropImage(null)}
          onCropComplete={handleCropComplete}
        />
      )}

    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Writer Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Kelola profil penulis dan analisis artikel Anda</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-4 sm:p-6">
                {/* Profile Summary */}
                <div className="text-center mb-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={
                          previewImage
                            ? previewImage
                            : editedProfile.avatar
                            ? assetUrl(editedProfile.avatar)
                            : undefined
                        }
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {editedProfile.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    {isEditing && (
                    <>
                      <button
                        onClick={handleAvatarClick}
                        className="
                          mt-2
                          flex items-center gap-2
                          text-sm
                          text-blue-600
                          hover:text-blue-700
                        "
                      >
                        <Camera className="h-4 w-4" />
                        Ganti foto
                      </button>
                      <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept="image/*"
                        />
                        </>
                    )}
                    
                  </div>
                    <h3 className="font-medium text-gray-900 mb-1">{editedProfile.name}</h3>
                    <p className="text-sm text-gray-500">Penulis</p>
                    <p className="text-sm text-gray-500">{editedProfile.email}</p>
                    {userProfile.joinDate && (
                    <div className="flex items-center justify-center text-xs text-gray-400 gap-1.5">
                      <Calendar className="h-3 w-3" />
                      <span>Bergabung {formatDate(userProfile.joinDate)}</span>
                    </div>
                  )}
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-blue-600">
                        {isLoadingArticles ? '-' : totalArticles}
                      </div>
                      <div className="text-xs text-gray-500">ARTIKEL</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-green-600">
                         {isLoadingArticles ? '-' : totalViews.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">VIEWS</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-red-600">
                        {isLoadingArticles ? '-' : totalLikes}
                      </div>
                      <div className="text-xs text-gray-500">LIKES</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-purple-600">
                        {isLoadingArticles ? '-' : totalComments}
                      </div>
                      <div className="text-xs text-gray-500">KOMENTAR</div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'overview' 
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-sm">Overview</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('articles')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'articles' 
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Artikel Saya</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'analytics' 
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Analitik</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'profile' 
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span className="text-sm">Profil</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="min-h-[500px]">
              <CardContent className="p-4 sm:p-6">
                
                {isLoadingArticles && activeTab !== 'profile' ? (
                   <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                   </div>
                ) : (
                  <>
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Overview</h2>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                          {/* Quick Stats sama seperti sebelumnya */}
                          <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-blue-600">{totalArticles}</div>
                            <div className="text-xs text-gray-600">Total Artikel</div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg text-center">
                            <Eye className="h-6 w-6 text-green-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-green-600">{totalViews.toLocaleString()}</div>
                            <div className="text-xs text-gray-600">Total Views</div>
                          </div>
                          <div className="bg-red-50 p-4 rounded-lg text-center">
                            <TrendingUp className="h-6 w-6 text-red-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-red-600">{totalLikes}</div>
                            <div className="text-xs text-gray-600">Total Likes</div>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg text-center">
                            <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-purple-600">{totalComments}</div>
                            <div className="text-xs text-gray-600">Komentar</div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Artikel Terbaru</h3>
                          <div className="space-y-4">
                            {articles.length > 0 ? (
                                articles.slice(0, 3).map((article) => (
                                  <ArticleItem key={article._id} article={article} />
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">Belum ada artikel yang dipublikasikan.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Articles Tab dengan Pagination */}
                    {activeTab === 'articles' && (
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Artikel yang Telah Ditulis</h2>
                        {articles.length === 0 ? (
                          <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-2">Belum ada artikel</p>
                            <p className="text-sm text-gray-400">Mulai menulis artikel pertama Anda</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Render artikel yang sudah dipotong sesuai halaman */}
                            {currentArticlesList.map((article) => (
                              <ArticleItem key={article._id} article={article} />
                            ))}
                            
                            {/* Kontrol Pagination */}
                            <PaginationControls 
                              page={articlesPage}
                              totalPages={totalArticlesPages}
                              setPage={setArticlesPage}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Analytics Tab dengan Pagination (UPDATE DI SINI) */}
                    {activeTab === 'analytics' && (
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Analitik Pembaca</h2>
                         {articles.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">Belum ada data analitik untuk ditampilkan.</p>
                         ) : (
                            <div className="space-y-6">
                              {/* Menggunakan currentAnalyticsList, bukan articles full */}
                              {currentAnalyticsList.map((article) => (
                                <div key={article._id} className="border-b pb-4 last:border-b-0">
                                  <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">{article.title}</h4>
                                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <p className="text-gray-600">Total Views</p>
                                      <p className="font-medium">{article.views.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Likes</p>
                                      <p className="font-medium">{article.likes}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Est. Read Time</p>
                                      <p className="font-medium">{article.readingTime || 1} menit</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Published</p>
                                      <p className="font-medium">{formatDate(article.publishedAt)}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {/* Kontrol Pagination Analitik */}
                              <PaginationControls 
                                page={analyticsPage}
                                totalPages={totalAnalyticsPages}
                                setPage={setAnalyticsPage}
                              />
                            </div>
                         )}
                      </div>
                    )}
                  </>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Profil Penulis</h2>
                      {!isEditing ? (
                        <Button 
                          onClick={() => setIsEditing(true)}
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profil
                        </Button>
                      ) : (
                        <div className="flex space-x-2">
                          <Button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Simpan
                          </Button>
                          <Button 
                            onClick={handleCancel} 
                            variant="outline" 
                            size="sm"
                            disabled={isSaving}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Batal
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">Nama Lengkap</Label>
                          <Input
                            id="name"
                            value={editedProfile.name}
                            onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                            disabled={!isEditing || isSaving}
                            className={isEditing ? 'border-blue-200' : 'bg-gray-50'}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={editedProfile.email}
                            onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                            disabled={!isEditing || isSaving}
                            className={isEditing ? 'border-blue-200' : 'bg-gray-50'}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-sm font-medium">Bio Penulis</Label>
                        <Textarea
                          id="bio"
                          rows={4}
                          value={editedProfile.bio}
                          onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                          disabled={!isEditing || isSaving}
                          className={isEditing ? 'border-blue-200' : 'bg-gray-50'}
                          placeholder="Ceritakan tentang pengalaman menulis Anda..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}