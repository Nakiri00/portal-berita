import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Edit, User, Eye, Bookmark, Save, X } from 'lucide-react';

interface MyAccountProps {
  userProfile: {
    name: string;
    email: string;
    avatar: string;
  };
  onUpdateProfile: (profile: any) => void;
  onArticleClick: (articleId: string) => void;
}

export function MyAccount({ userProfile, onUpdateProfile, onArticleClick }: MyAccountProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    ...userProfile,
    bio: 'Mahasiswa Teknik Informatika yang suka menulis dan berbagi pengalaman.'
  });

  const handleSave = () => {
    onUpdateProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile({
      ...userProfile,
      bio: 'Mahasiswa Teknik Informatika yang suka menulis dan berbagi pengalaman.'
    });
    setIsEditing(false);
  };

  // Mock data for saved and recently viewed articles
  const savedArticles = [
    {
      id: '1',
      title: 'Strategi Belajar Efektif untuk Mahasiswa di Era Digital',
      author: 'Dr. Sari Wijaya',
      date: '15 Jan 2025',
      tag: 'Tips & Trik'
    },
    {
      id: '3',
      title: 'Persiapan Wisuda: Panduan Lengkap untuk Mahasiswa Tingkat Akhir',
      author: 'Prof. Maya Indira',
      date: '13 Jan 2025',
      tag: 'Akademik'
    }
  ];

  const recentlyViewed = [
    {
      id: '1',
      title: 'Strategi Belajar Efektif untuk Mahasiswa di Era Digital',
      author: 'Dr. Sari Wijaya',
      date: '15 Jan 2025',
      tag: 'Tips & Trik',
      viewedAt: '2 jam yang lalu'
    },
    {
      id: '2',
      title: 'Kehidupan Sosial di Kampus: Membangun Networking yang Kuat',
      author: 'Ahmad Rizki',
      date: '14 Jan 2025',
      tag: 'Kehidupan Kampus',
      viewedAt: '1 hari yang lalu'
    }
  ];

  const ArticleItem = ({ article, showViewedAt = false }: { article: any; showViewedAt?: boolean }) => (
    <div 
      className="p-3 sm:p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onArticleClick(article.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 mb-2 hover:text-blue-600 text-sm sm:text-base line-clamp-2">
            {article.title}
          </h4>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
            <span>{article.author}</span>
            <span>{article.date}</span>
            {showViewedAt && <span>{article.viewedAt}</span>}
          </div>
        </div>
        <Badge variant="secondary" className="flex-shrink-0 text-xs">
          {article.tag}
        </Badge>
      </div>
    </div>
  );

  return (
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
                <div className="text-center mb-6">
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4">
                    <AvatarFallback className="text-lg sm:text-xl">
                      {editedProfile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-medium text-gray-900 mb-1">{editedProfile.name}</h3>
                  <p className="text-sm text-gray-500">{editedProfile.email}</p>
                  
                  {/* Stats */}
                  <div className="flex justify-center space-x-6 mt-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-blue-600">{savedArticles.length}</div>
                      <div className="text-xs text-gray-500">ARTIKEL DISIMPAN</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-blue-600">{recentlyViewed.length}</div>
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
                          <Button 
                            onClick={handleSave} 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Simpan
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
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Aktivitas</h2>
                    {recentlyViewed.length === 0 ? (
                      <div className="text-center py-12">
                        <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">Belum ada aktivitas</p>
                        <p className="text-sm text-gray-400">Mulai membaca artikel untuk melihat aktivitas Anda</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentlyViewed.map((article) => (
                          <ArticleItem key={article.id} article={article} showViewedAt />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Saved Tab */}
                {activeTab === 'saved' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Tersimpan</h2>
                    {savedArticles.length === 0 ? (
                      <div className="text-center py-12">
                        <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">Belum ada artikel yang disimpan</p>
                        <p className="text-sm text-gray-400">Simpan artikel yang menarik untuk dibaca nanti</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {savedArticles.map((article) => (
                          <ArticleItem key={article.id} article={article} />
                        ))}
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
  );
}