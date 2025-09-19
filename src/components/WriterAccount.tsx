import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Edit, User, Eye, FileText, TrendingUp, Users, Save, X, BarChart3 } from 'lucide-react';

interface WriterAccountProps {
  userProfile: {
    name: string;
    email: string;
    avatar: string;
  };
  onUpdateProfile: (profile: any) => void;
  onArticleClick: (articleId: string) => void;
}

export function WriterAccount({ userProfile, onUpdateProfile, onArticleClick }: WriterAccountProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    ...userProfile,
    bio: 'Penulis yang berpengalaman dalam dunia pendidikan dan teknologi. Suka berbagi pengetahuan melalui tulisan.'
  });

  const handleSave = () => {
    onUpdateProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile({
      ...userProfile,
      bio: 'Penulis yang berpengalaman dalam dunia pendidikan dan teknologi. Suka berbagi pengetahuan melalui tulisan.'
    });
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

  const totalViews = myArticles.reduce((sum, article) => sum + article.views, 0);
  const totalLikes = myArticles.reduce((sum, article) => sum + article.likes, 0);
  const totalComments = myArticles.reduce((sum, article) => sum + article.comments, 0);

  const ArticleItem = ({ article }: { article: any }) => (
    <div 
      className="p-3 sm:p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onArticleClick(article.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 mb-2 hover:text-blue-600 text-sm sm:text-base line-clamp-2">
            {article.title}
          </h4>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-2">
            <span>{article.publishDate}</span>
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{article.views.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-xs sm:text-sm">
            <span className="text-blue-600">{article.likes} likes</span>
            <span className="text-green-600">{article.comments} komentar</span>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <Badge variant={article.status === 'Published' ? 'default' : 'secondary'} className="text-xs">
            {article.status}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {article.tag}
          </Badge>
        </div>
      </div>
    </div>
  );

  return (
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
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4">
                    <AvatarFallback className="text-lg sm:text-xl">
                      {editedProfile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-medium text-gray-900 mb-1">{editedProfile.name}</h3>
                  <p className="text-sm text-gray-500">Penulis</p>
                  <p className="text-xs text-gray-400">Bergabung sejak Jan 2025</p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-blue-600">{myArticles.length}</div>
                      <div className="text-xs text-gray-500">ARTIKEL</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-green-600">{totalViews.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">VIEWS</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-red-600">{totalLikes}</div>
                      <div className="text-xs text-gray-500">LIKES</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-purple-600">{totalComments}</div>
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
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Overview</h2>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-600">{myArticles.length}</div>
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

                    {/* Recent Articles */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Artikel Terbaru</h3>
                      <div className="space-y-4">
                        {myArticles.slice(0, 3).map((article) => (
                          <ArticleItem key={article.id} article={article} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Articles Tab */}
                {activeTab === 'articles' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Artikel yang Telah Ditulis</h2>
                    {myArticles.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">Belum ada artikel</p>
                        <p className="text-sm text-gray-400">Mulai menulis artikel pertama Anda</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {myArticles.map((article) => (
                          <ArticleItem key={article.id} article={article} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Analitik Pembaca</h2>
                    <div className="space-y-6">
                      {readerStats.map((stat, index) => (
                        <div key={index} className="border-b pb-4 last:border-b-0">
                          <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">{stat.articleTitle}</h4>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Total Views</p>
                              <p className="font-medium">{stat.views.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Unique Readers</p>
                              <p className="font-medium">{stat.uniqueReaders.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Avg Read Time</p>
                              <p className="font-medium">{stat.avgReadTime}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Published</p>
                              <p className="font-medium">{stat.date}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
                        <Label htmlFor="bio" className="text-sm font-medium">Bio Penulis</Label>
                        <Textarea
                          id="bio"
                          rows={4}
                          value={editedProfile.bio}
                          onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                          disabled={!isEditing}
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
  );
}