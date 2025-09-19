import React from 'react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Upload, Image, Eye, Save, Plus, FileText, Edit, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useArticles } from '../contexts/ArticleContext';

interface WriterPageProps {
  onBackClick: () => void;
  onPublish?: (article: any) => void;
}

export function WriterPage({ onBackClick, onPublish }: WriterPageProps) {
  const { writerArticles, addWriterArticle, updateWriterArticle, deleteWriterArticle, userProfile } = useAuth();
  const { publishArticle } = useArticles();
  const [currentView, setCurrentView] = useState<'create' | 'manage'>('manage');
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [article, setArticle] = useState({
    title: '',
    excerpt: '',
    content: '',
    tag: '',
    image: null as File | null,
    imagePreview: ''
  });

  const [isPreview, setIsPreview] = useState(false);

  const tags = ['Akademik', 'Kehidupan Kampus', 'Tips & Trik', 'Beasiswa', 'Karir'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArticle(prev => ({ ...prev, image: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setArticle(prev => ({ ...prev, imagePreview: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDraft = () => {
    toast.success('Draft berhasil disimpan');
  };

  const handlePublish = () => {
    if (!article.title || !article.content || !article.tag) {
      toast.error('Lengkapi semua field yang diperlukan');
      return;
    }
    
    const publishedArticle = {
      title: article.title,
      excerpt: article.excerpt || article.content.substring(0, 150) + '...',
      content: article.content,
      tag: article.tag,
      imageUrl: article.imagePreview || 'https://images.unsplash.com/photo-1704748082614-8163a88e56b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTgwNTU2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      readCount: 0,
      isHeadline: false,
      author: userProfile.name,
      authorId: 'writer-1'
    };
    
    if (editingArticleId) {
      updateWriterArticle(editingArticleId, publishedArticle);
      toast.success('Artikel berhasil diperbarui!');
    } else {
      // Only publish to ArticleContext for homepage - this is the single source of truth
      const publishedToContext = publishArticle({
        title: article.title,
        excerpt: article.excerpt || article.content.substring(0, 150) + '...',
        content: article.content,
        tag: article.tag,
        imageUrl: article.imagePreview || 'https://images.unsplash.com/photo-1704748082614-8163a88e56b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fDE3NTgwNTU2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      }, userProfile?.name || 'Penulis Kamus Mahasiswa', 'writer-1');
      
      // Also add to writer's personal collection for management
      addWriterArticle({
        ...publishedToContext,
        readCount: publishedToContext.readCount || 1
      });
      
      if (onPublish) {
        onPublish(publishedToContext);
      }
      toast.success('Artikel berhasil dipublikasi di beranda!');
    }
    
    // Reset form and go back to manage view
    resetForm();
    setCurrentView('manage');
  };

  const resetForm = () => {
    setArticle({
      title: '',
      excerpt: '',
      content: '',
      tag: '',
      image: null,
      imagePreview: ''
    });
    setEditingArticleId(null);
    setIsPreview(false);
  };

  const handleCreateNew = () => {
    resetForm();
    setCurrentView('create');
  };

  const handleEditArticle = (articleId: string) => {
    const articleToEdit = writerArticles.find(a => a.id === articleId);
    if (articleToEdit) {
      setArticle({
        title: articleToEdit.title,
        excerpt: articleToEdit.excerpt,
        content: articleToEdit.content,
        tag: articleToEdit.tag,
        image: null,
        imagePreview: articleToEdit.imageUrl
      });
      setEditingArticleId(articleId);
      setCurrentView('create');
    }
  };

  const handleDeleteArticle = (articleId: string) => {
    if (confirm('Yakin ingin menghapus artikel ini?')) {
      deleteWriterArticle(articleId);
      toast.success('Artikel berhasil dihapus');
    }
  };

  // Manage Articles View
  if (currentView === 'manage') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Artikel</h1>
            <p className="text-gray-600">Lihat dan kelola artikel yang sudah Anda tulis</p>
          </div>
          <div className="space-x-2">
            <Button onClick={onBackClick} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Artikel Baru
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Artikel</p>
                  <p className="text-2xl font-bold text-gray-900">{writerArticles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pembaca</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {writerArticles.reduce((acc, article) => acc + (article.readCount || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Artikel Bulan Ini</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {writerArticles.filter(article => {
                      const publishDate = new Date(article.publishDate || '');
                      const now = new Date();
                      return publishDate.getMonth() === now.getMonth() && 
                             publishDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Articles List */}
        {writerArticles.length > 0 ? (
          <div className="space-y-4">
            {writerArticles.map((article) => (
              <Card key={article.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary">{article.tag}</Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(article.publishDate).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          <span>{article.readCount || 0} pembaca</span>
                        </div>
                        <span>•</span>
                        <span>Status: Dipublikasi</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 ml-0 sm:ml-4 mt-4 sm:mt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditArticle(article.id)}
                        className="w-full sm:w-auto"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteArticle(article.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 w-full sm:w-auto transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada artikel</h3>
              <p className="text-gray-500 mb-6">Mulai menulis artikel pertama Anda untuk berbagi pengetahuan dengan mahasiswa lain</p>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Tulis Artikel Pertama
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (isPreview) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            onClick={() => setIsPreview(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Editor
          </Button>
          <div className="space-x-2">
            <Button onClick={handleSaveDraft} variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Simpan Draft
            </Button>
            <Button onClick={handlePublish}>
              Publikasi
            </Button>
          </div>
        </div>

        {/* Preview */}
        <article className="bg-white rounded-lg shadow-sm">
          {article.imagePreview && (
            <div className="w-full h-64 md:h-80 overflow-hidden rounded-t-lg">
              <img 
                src={article.imagePreview} 
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            {article.tag && (
              <Badge variant="default" className="mb-4">
                {article.tag}
              </Badge>
            )}
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {article.title || 'Judul Artikel'}
            </h1>

            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-8 pb-6 border-b">
              <span>Oleh Anda</span>
              <span>{new Date().toLocaleDateString('id-ID')}</span>
              <span>5 menit baca</span>
            </div>

            <div 
              className="prose prose-lg max-w-none"
              style={{ fontSize: '16px', lineHeight: '1.7' }}
            >
              {article.content ? (
                <div dangerouslySetInnerHTML={{ 
                  __html: article.content.replace(/\n/g, '<br />') 
                }} />
              ) : (
                <p className="text-gray-500 italic">Konten artikel akan muncul di sini...</p>
              )}
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          onClick={onBackClick}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Beranda
        </Button>
        <div className="space-x-2">
          <Button onClick={() => setIsPreview(true)} variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSaveDraft} variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Simpan Draft
          </Button>
          <Button onClick={handlePublish}>
            Publikasi
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tulis Artikel Baru</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Judul Artikel *</Label>
                <Input
                  id="title"
                  placeholder="Masukkan judul artikel yang menarik..."
                  value={article.title}
                  onChange={(e) => setArticle(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">Ringkasan</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Tulis ringkasan singkat artikel..."
                  rows={3}
                  value={article.excerpt}
                  onChange={(e) => setArticle(prev => ({ ...prev, excerpt: e.target.value }))}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Konten Artikel *</Label>
                <Textarea
                  id="content"
                  placeholder="Mulai menulis artikel Anda di sini...

Anda dapat menulis paragraf, membuat daftar, dan menambahkan heading dengan format sederhana.

Tips menulis artikel yang baik:
- Gunakan judul yang menarik
- Buat paragraf pembuka yang engaging
- Gunakan subjudul untuk memudahkan pembacaan
- Berikan contoh atau analogi yang relatable
- Tutup dengan kesimpulan yang actionable"
                  rows={15}
                  value={article.content}
                  onChange={(e) => setArticle(prev => ({ ...prev, content: e.target.value }))}
                  style={{ fontSize: '16px' }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gambar Utama</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {article.imagePreview ? (
                  <div className="relative">
                    <img 
                      src={article.imagePreview} 
                      alt="Preview" 
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => setArticle(prev => ({ 
                        ...prev, 
                        image: null, 
                        imagePreview: '' 
                      }))}
                    >
                      Hapus
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 mb-4">
                      Upload gambar utama untuk artikel
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <Button size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Gambar
                        </span>
                      </Button>
                    </Label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Pilih Tag *</Label>
                <Select 
                  value={article.tag} 
                  onValueChange={(value: string) => setArticle(prev => ({ ...prev, tag: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori artikel" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Publishing Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Info Publikasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span>Draft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Penulis:</span>
                <span>Anda</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dibuat:</span>
                <span>{new Date().toLocaleDateString('id-ID')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}