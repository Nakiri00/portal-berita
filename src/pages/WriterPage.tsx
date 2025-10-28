import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  createArticle, 
  getWriterArticles, 
  Article,
  CreateArticleData ,
  updateArticle,
  deleteArticle
} from '../services/articleService';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Save, Image as ImageIcon, Trash2, FileText, Loader2,Pencil,X, Star} from 'lucide-react';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog'; 
// Definisikan tipe untuk data form lokal
interface ArticleForm extends CreateArticleData {
    imageFile: File | null;
    imagePreview: string; 
    tags: string[];
    articleId?: string;
}

// Daftar tags yang tersedia
const AVAILABLE_TAGS = ['Akademik', 'Kehidupan Kampus', 'Tips & Trik', 'Beasiswa', 'Karir', 'Lainnya'];
const toTitleCase = (str: string): string => {
    if (!str) return '';
    return str.replace(
        /\w\S*/g,
        function(txt) {
            // Mengubah huruf pertama menjadi Kapital, dan sisanya menjadi lowercase
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
};
export function WriterPage() {
  const { userProfile, isWriter, refreshUser } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // State baru untuk mode edit
  const [originalImage, setOriginalImage] = useState(''); // State baru untuk menyimpan URL gambar lama
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<{ id: string; title: string } | null>(null);
  const [formData, setFormData] = useState<ArticleForm>({
    title: '',
    content: '',
    category: 'berita',
    tags: [],
    status: 'draft',
    featuredImage: '', 
    isFeatured: false,
    imageFile: null,
    imagePreview: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'berita',
      tags: [],
      status: 'draft',
      featuredImage: '',
      isFeatured: false,
      imageFile: null,
      imagePreview: '',
      articleId: undefined, // Reset ID artikel
    });
    setOriginalImage('');
    setIsEditing(false);
    const fileInput = document.getElementById('imageFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  
  const handleEditClick = (article: Article) => {
        const currentImageUrl = article.featuredImage || '';
        
        let rawTags = article.tags || [];
        let parsedTags: string[] = [];

        // 1. Parsing tags yang terlanjur rusak di database (seperti "[\"akademik\"]")
        if (rawTags.length === 1 && typeof rawTags[0] === 'string' && rawTags[0].startsWith('[')) {
            try {
                const temp = JSON.parse(rawTags[0]);
                if (Array.isArray(temp)) {
                     rawTags = temp;
                }
            } catch (e) {
                console.warn("Failed to parse corrupted tag string:", rawTags[0]);
            }
        }
        parsedTags = rawTags
            .filter(tag => typeof tag === 'string' && tag.trim() !== '')
            .map(tag => toTitleCase(tag)); // FIX: Gunakan TitleCase

        setFormData({
            title: article.title,
            content: article.content,
            category: toTitleCase(article.category) || 'berita', 
            tags: parsedTags, 
            status: article.status,
            featuredImage: currentImageUrl, 
            isFeatured: article.isFeatured || false,
            imageFile: null,
            imagePreview: currentImageUrl ? currentImageUrl.split('/').pop() || 'Gambar Saat Ini' : '',
            articleId: article._id,
        });
        
        setOriginalImage(currentImageUrl);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

  useEffect(() => {
    if (isWriter) {
      loadArticles();
    }
  }, [isWriter]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await getWriterArticles(); 
      setArticles(response.data.articles);
    } catch (error) {
      console.error('Error loading articles:', error);
      toast.error('Gagal memuat artikel');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return removeImage();

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']; 
    if (!allowedTypes.includes(file.type) && !file.type.includes('jpg')) { 
      toast.error("Format file harus JPG, JPEG, atau PNG.");
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) { 
      toast.error("Ukuran gambar maksimal 5MB.");
      e.target.value = '';
      return;
    }

    setFormData(prev => ({ 
      ...prev, 
      imageFile: file,
      imagePreview: file.name
    }));
  };
  
  const removeImage = () => {
    const fileInput = document.getElementById('imageFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    
    setFormData(prev => ({ 
        ...prev, 
        imageFile: null, 
        imagePreview: '', 
        featuredImage: '' 
    }));

    setOriginalImage('');
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => {
        const currentTags = prev.tags || [];
        if (currentTags.includes(tag)) {
            return { ...prev, tags: currentTags.filter(t => t !== tag) };
        } else {
            return { ...prev, tags: [...currentTags, tag] };
        }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Judul dan konten harus diisi');
      return;
    }
    if (!formData.tags || formData.tags.length === 0) {
        toast.error('Pilih setidaknya satu Tag untuk artikel');
        return;
    }

    const primaryCategory = formData.tags.length > 0 ? formData.tags[0] : 'berita';
    const isUpdate = !!formData.articleId;
    if (!isUpdate) {
        if (!formData.imageFile) {
            toast.error('Wajib melampirkan Gambar untuk Thumbnail.');
            return;
        }
    } else {
        if (!originalImage && !formData.imageFile) {
            toast.error('Wajib ada Gambar Thumbnail. Silakan upload gambar atau pastikan gambar lama ada.');
            return;
        }
    }
    const dataToSend: any = { 
      title: formData.title,
      content: formData.content,
      category: primaryCategory.toLowerCase(),
      tags: formData.tags,
      status: formData.status ?? 'draft',
      isFeatured: formData.isFeatured,
      excerpt: formData.content.substring(0, 150) + '...',
    };

    if (isUpdate && !formData.imageFile && originalImage) {
      dataToSend.featuredImage = originalImage;
    } else if (formData.imageFile) {
      dataToSend.featuredImage = formData.imageFile;
    }

    try {
      setSubmitting(true);
      if (isUpdate && formData.articleId) {
          await updateArticle(formData.articleId, dataToSend); 
          toast.success('Artikel berhasil diupdate');
          if (refreshUser) {
                await refreshUser();
            } else {
                console.warn("syncUserData tidak tersedia di AuthContext."); 
            }
      } else {
          const formDataToSend = new FormData();
            formDataToSend.append('title', dataToSend.title);
            formDataToSend.append('content', dataToSend.content);
            formDataToSend.append('category', dataToSend.category);
            formDataToSend.append('tags', JSON.stringify(dataToSend.tags));
            formDataToSend.append('status', dataToSend.status ?? 'draft');
            formDataToSend.append('isFeatured', dataToSend.isFeatured.toString());
            formDataToSend.append('excerpt', dataToSend.content.substring(0, 150) + '...');
        
            if (dataToSend.featuredImage instanceof File) {
                formDataToSend.append('imageFile', dataToSend.featuredImage); 
            }
            
            await createArticle(formDataToSend);
            toast.success('Artikel berhasil dibuat');
      }
      resetForm();
      await loadArticles();
    } catch (error: any) {
      console.error('Error saving article:', error);
      toast.error(error.message || 'Gagal menyimpan artikel');
    } finally {
      setSubmitting(false);
    }
  };

  // const handleDelete = async (articleId: string, title: string) => {
  //   if (window.confirm(`Yakin ingin menghapus artikel: "${title}"? Tindakan ini tidak dapat dibatalkan.`)) {
  //     try {
  //       await deleteArticle(articleId);
  //       toast.success('Artikel berhasil dihapus.');
  //       loadArticles(); // Refresh daftar
  //     } catch (error: any) {
  //       console.error('Error deleting article:', error);
  //       toast.error(error.message || 'Gagal menghapus artikel');
  //     }
  //   }
  // };

  const handleConfirmDelete = (articleId: string, title: string) => {
      setArticleToDelete({ id: articleId, title });
      setIsDeleteDialogOpen(true);
  };
    
  const executeDelete = async () => {
      if (!articleToDelete) return;
      try {
          setSubmitting(true);
          await deleteArticle(articleToDelete.id);
          if (refreshUser) {
              await refreshUser(); 
          }
          
          toast.success('Artikel berhasil dihapus dan data pengguna terkait dibersihkan.');
          loadArticles(); // Refresh daftar
      } catch (error: any) {
          console.error('Error deleting article:', error);
          toast.error(error.message || 'Gagal menghapus artikel');
      } finally {
          setIsDeleteDialogOpen(false);
          setArticleToDelete(null);
          setSubmitting(false);
      }
  };

  if (!isWriter) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Akses Ditolak
          </h1>
          <p className="text-gray-600">
            Anda tidak memiliki akses sebagai penulis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {articleToDelete && (
        <ConfirmDeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={executeDelete}
          articleTitle={articleToDelete.title}
        />
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Penulis
        </h1>
        <p className="text-gray-600">
          Selamat datang, {userProfile?.name}. Kelola artikel Anda di sini.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Tulis Artikel */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle className="flex items-center">
              {isEditing ? (
                <Pencil className="w-5 h-5 mr-2" />
              ) : (
                <Plus className="w-5 h-5 mr-2" />
              )}
              {isEditing ? 'Edit Artikel' : 'Tulis Artikel Baru'}
            </CardTitle>
            {isEditing && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetForm} 
                className="text-red-500 hover:text-red-700"
                >
                <X className="h-4 w-4 mr-1" /> Batalkan Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Artikel *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Masukkan judul artikel"
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Gambar Thumbnail
                </Label>
                {/* Kondisi untuk menampilkan gambar yang ada saat EDIT */}
                {isEditing && originalImage && !formData.imageFile ? (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">Gambar saat ini:</p>
                    <img 
                      src={originalImage} // URL gambar lama
                      alt="Current Thumbnail" 
                      className="h-20 w-auto object-cover rounded-md"
                    />
                  </div>
                ) : null} 
                {formData.imageFile || (isEditing && originalImage && !formData.imageFile) ? (
                  <div className="relative flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {formData.imageFile ? formData.imagePreview : originalImage.split('/').pop()}
                        </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50"
                      onClick={removeImage}
                      disabled={submitting}
                    >
                    <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Label htmlFor="imageFile" className="cursor-pointer block">
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <input
                        id="imageFile"
                        type="file"
                        accept="image/jpeg, image/png, image/jpg"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        disabled={submitting}
                      />
                      <div className="flex flex-col items-center justify-center pointer-events-none">
                        <ImageIcon className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                        <p className="text-sm font-medium text-gray-700">Klik untuk Pilih Gambar</p>
                        <p className="text-xs text-gray-500 mt-1">(Maks. 5MB, JPG/PNG/JPEG)</p>
                      </div>
                    </div>
                  </Label>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konten *
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Tulis konten artikel Anda..."
                  rows={8}
                  required
                  disabled={submitting}
                />
              </div>
              
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Artikel
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Pilih Tags *</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {AVAILABLE_TAGS.map((tag) => {
                            const isSelected = formData.tags?.includes(tag) || false;
                            return (
                                <Badge
                                    key={tag}
                                    variant={isSelected ? 'default' : 'outline'}
                                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-gray-100 text-gray-600 border-gray-300'}`}
                                    onClick={() => handleTagToggle(tag)}
                                >
                                    {tag}
                                </Badge>
                            );
                        })}
                    </div>
                    {formData.tags?.length === 0 && (
                        <p className="text-xs text-red-500 mt-2">Wajib pilih minimal satu tag.</p>
                    )}
                </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Star className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500" />
                    Featured / Headline
                  </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Jadikan Artikel Unggulan?</Label>
                    <Select 
                      value={formData.isFeatured ? 'true' : 'false'} 
                      onValueChange={(value) => {
                        console.log("Raw value:", value);
                        const boolValue = value === 'true';
                        console.log("Parsed bool:", boolValue);
                        setFormData(prev => ({ ...prev, isFeatured: boolValue }));
                        console.log("FormData setelah set:", { ...formData, isFeatured: boolValue });
                      }}
                      disabled={submitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status unggulan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Tidak (Default)</SelectItem>
                        <SelectItem value="true">Ya, Jadikan Featured</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Artikel unggulan akan ditampilkan di halaman utama (seperti carousel utama).
                    </p>
                  </div>
              </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Info Artikel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Penulis:</span>
                        <span>{userProfile?.name || 'Anda'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Status Awal:</span>
                        <span>Draft Baru</span>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Daftar Artikel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Artikel Saya</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Memuat artikel...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Belum ada artikel.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <div key={article._id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <span>Status: </span>
                        <Badge 
                          className="text-xs"
                          variant={article.status === 'published' ? 'default' : 'outline'}
                          >
                        {article.status}
                        </Badge>
                        <span>Views: {article.views}</span>
                      </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {article.excerpt}
                        </p>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleEditClick(article)}
                        title="Edit Artikel"
                        disabled={submitting}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => handleConfirmDelete(article._id, article.title)}
                        title="Hapus Artikel"
                        disabled={submitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
