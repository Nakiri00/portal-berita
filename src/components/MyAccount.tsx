import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Edit, User, Eye, Bookmark, Save, X, Camera, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'; 
import { toast } from 'sonner';
import { assetUrl } from '../utils/assets';
import { CropAvatarModal } from './CropAvatarModal';
import { useAuth } from '../contexts/AuthContext';

interface MyAccountProps {
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

export function MyAccount({ userProfile, onUpdateProfile, onArticleClick }: MyAccountProps) {
  const [activeTab, setActiveTab] = useState('profile');
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
  const { readingHistory, savedArticles } = useAuth();
  const [activityPage, setActivityPage] = useState(1);
  const [savedPage, setSavedPage] = useState(1);

  useEffect(() => {
    setEditedProfile({
      ...userProfile,
      bio: userProfile.bio || ''
    });
  }, [userProfile]);

  useEffect(() => {
    if (activeTab === 'activities') setActivityPage(1);
    if (activeTab === 'saved') setSavedPage(1);
  }, [activeTab]);

  const totalActivityPages = Math.ceil(readingHistory.length / ITEMS_PER_PAGE);
  const currentActivities = readingHistory.slice(
    (activityPage - 1) * ITEMS_PER_PAGE,
    activityPage * ITEMS_PER_PAGE
  );

  const totalSavedPages = Math.ceil(savedArticles.length / ITEMS_PER_PAGE);
  const currentSaved = savedArticles.slice(
    (savedPage - 1) * ITEMS_PER_PAGE,
    savedPage * ITEMS_PER_PAGE
  );
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

  // Helper untuk format tanggal
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Helper untuk format waktu relatif (misal: 2 jam lalu)
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    return formatDate(dateString);
  };

  // Mock data for saved and recently viewed articles
  // const savedArticles = [
  //   {
  //     id: '1',
  //     title: 'Strategi Belajar Efektif untuk Mahasiswa di Era Digital',
  //     author: 'Dr. Sari Wijaya',
  //     date: '15 Jan 2025',
  //     tag: 'Tips & Trik'
  //   },
  //   {
  //     id: '3',
  //     title: 'Persiapan Wisuda: Panduan Lengkap untuk Mahasiswa Tingkat Akhir',
  //     author: 'Prof. Maya Indira',
  //     date: '13 Jan 2025',
  //     tag: 'Akademik'
  //   }
  // ];

  // const recentlyViewed = [
  //   {
  //     id: '1',
  //     title: 'Strategi Belajar Efektif untuk Mahasiswa di Era Digital',
  //     author: 'Dr. Sari Wijaya',
  //     date: '15 Jan 2025',
  //     tag: 'Tips & Trik',
  //     viewedAt: '2 jam yang lalu'
  //   },
  //   {
  //     id: '2',
  //     title: 'Kehidupan Sosial di Kampus: Membangun Networking yang Kuat',
  //     author: 'Ahmad Rizki',
  //     date: '14 Jan 2025',
  //     tag: 'Kehidupan Kampus',
  //     viewedAt: '1 hari yang lalu'
  //   }
  // ];

  const ArticleItem = ({ 
    id, 
    title, 
    author, 
    date, 
    tag, 
    viewedAt, 
    showViewedAt = false 
  }: { 
    id: string; 
    title: string; 
    author?: string; 
    date?: string; 
    tag?: string; 
    viewedAt?: string;
    showViewedAt?: boolean 
  }) => (
    <div 
      className="p-3 sm:p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onArticleClick(id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 mb-2 hover:text-blue-600 text-sm sm:text-base line-clamp-2">
            {title}
          </h4>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
            {author && <span>{author}</span>}
            {date && <span>{date}</span>}
            {showViewedAt && viewedAt && <span className="text-blue-600 font-medium">{viewedAt}</span>}
          </div>
        </div>
        {tag && (
          <Badge variant="secondary" className="flex-shrink-0 text-xs">
            {tag}
          </Badge>
        )}
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-sm sm:text-base text-gray-600">Kelola profil dan aktivitas Anda</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-4 sm:p-6">
                {/* Profile Summary */}
                <div className="text-center mb-6 relative">
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
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{editedProfile.name}</h3>
                  <p className="text-sm text-gray-500">{editedProfile.email}</p>
                  {userProfile.joinDate && (
                    <div className="flex items-center justify-center text-xs text-gray-400 gap-1.5">
                      <Calendar className="h-3 w-3" />
                      <span>Bergabung {formatDate(userProfile.joinDate)}</span>
                    </div>
                  )}
                  
                  {/* Stats */}
                  <div className="flex justify-center space-x-6 mt-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-blue-600">{savedArticles.length}</div>
                      <div className="text-xs text-gray-500">ARTIKEL DISIMPAN</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-blue-600">{readingHistory.length}</div>
                      <div className="text-xs text-gray-500">ARTIKEL TERBACA</div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
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
                  <button
                    onClick={() => setActiveTab('activities')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'activities' 
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">Aktivitas</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('saved')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'saved' 
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Bookmark className="h-4 w-4" />
                    <span className="text-sm">Tersimpan</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="min-h-[500px]">
              <CardContent className="p-4 sm:p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Informasi Profil</h2>
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
                          <Button onClick={handleSave} disabled={isLoading}>
                            <Save className="h-4 w-4 mr-2" />
                            {isLoading ? 'Menyimpan...' : 'Simpan'}
                          </Button>
                          <Button 
                            onClick={handleCancel} 
                            variant="outline" 
                            size="sm"
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
                            disabled={!isEditing}
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
                            disabled={!isEditing}
                            className={isEditing ? 'border-blue-200' : 'bg-gray-50'}
                          />
                          
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                        <Textarea
                          id="bio"
                          rows={4}
                          value={editedProfile.bio}
                          onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                          disabled={!isEditing}
                          className={isEditing ? 'border-blue-200' : 'bg-gray-50'}
                          placeholder="Ceritakan sedikit tentang diri Anda..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Activities Tab */}
                {activeTab === 'activities' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Aktivitas Membaca</h2>
                    {readingHistory.length === 0 ? (
                      <div className="text-center py-12">
                        <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">Belum ada aktivitas membaca</p>
                        <p className="text-sm text-gray-400">Mulai membaca artikel untuk melihat riwayat Anda</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {currentActivities.map((history) => (
                          <ArticleItem 
                            key={history.articleId} 
                            id={history.articleId}
                            title={history.title}
                            viewedAt={formatTimeAgo(history.lastReadAt)}
                            showViewedAt={true}
                          />
                        ))}
                        <PaginationControls 
                          page={activityPage}
                          totalPages={totalActivityPages}
                          setPage={setActivityPage}
                        />
                      </div>
                    )}
                  </div>
                )}
            
                {/* Saved Articles Tab */}
                {activeTab === 'saved' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Artikel Tersimpan</h2>
                    {savedArticles.length === 0 ? (
                      <div className="text-center py-12">
                        <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">Belum ada artikel yang disimpan</p>
                        <p className="text-sm text-gray-400">Simpan artikel yang menarik untuk dibaca nanti</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {currentSaved.map((article) => (
                          <ArticleItem 
                            key={article.articleId} 
                            id={article.articleId}
                            title={article.title}
                            author={article.author}
                            date={formatDate(article.savedDate)}
                            tag={article.tag}
                          />
                        ))}
                        <PaginationControls 
                          page={savedPage}
                          totalPages={totalSavedPages}
                          setPage={setSavedPage}
                        />
                      </div>
                    )}
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