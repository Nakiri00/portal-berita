import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  createArticle, 
  getWriterArticles, 
  Article,
  CreateArticleData 
} from '../services/articleService';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label'; // Import Label
import { Plus, Save, Image as ImageIcon, Upload, Trash2, FileText } from 'lucide-react'; // Import ikon gambar

// Definisikan tipe untuk data form lokal
interface ArticleForm extends CreateArticleData {
    imageFile: File | null;
    imagePreview: string;
    tags: string[]
}

// Daftar tags yang tersedia
const AVAILABLE_TAGS = ['Akademik', 'Kehidupan Kampus', 'Tips & Trik', 'Beasiswa', 'Karir', 'Lainnya'];

export function WriterPage() {
  const { userProfile, isWriter } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ArticleForm>({
    title: '',
    content: '',
    category: 'berita',
    tags: [],
    status: 'draft',
    featuredImage: '', 
    imageFile: null,
    imagePreview: '' 
  });
  const [submitting, setSubmitting] = useState(false);

  // URL gambar placeholder default
  const DEFAULT_IMAGE_URL = 'https://placehold.co/600x400/007bff/ffffff?text=Thumbnail'; 

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
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png']; 
    
      if (!allowedTypes.includes(file.type) && !file.type.includes('jpg')) { 
        toast.error("Format file harus JPG, JPEG, atau PNG.");
        e.target.value = '';
        return;
      }
    
      if (file.size > 10 * 1024 * 1024) { 
        toast.error("Ukuran gambar maksimal 10MB.");
        e.target.value = '';
        return;
      }

      setFormData(prev => ({ 
        ...prev, 
        imageFile: file,
        imagePreview: file.name 
      }));
    }
  };
  
  const removeImage = () => {
    // Reset semua state terkait gambar dan kosongkan input file
    const fileInput = document.getElementById('imageFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    
    setFormData(prev => ({ ...prev, imageFile: null, imagePreview: '', featuredImage: '' }));
  };

  // LOGIKA BARU: HANDLE TAG
  const handleTagToggle = (tag: string) => {
    setFormData(prev => {
        const currentTags = prev.tags || [];
        if (currentTags.includes(tag)) {
            // Hapus tag jika sudah ada
            return { ...prev, tags: currentTags.filter(t => t !== tag) };
        } else {
            // Tambahkan tag jika belum ada
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


    // Logika penentuan URL gambar yang akan dikirim ke API
    let finalImageUrl = formData.featuredImage;
    if (formData.imageFile && !formData.featuredImage) {
        finalImageUrl = DEFAULT_IMAGE_URL; 
    }
    if (!finalImageUrl) {
        finalImageUrl = DEFAULT_IMAGE_URL;
    }
    const primaryCategory = formData.tags.length > 0 ? formData.tags[0] : 'berita';

    // Buat objek data yang akan dikirim, tanpa imageFile dan imagePreview
    const dataToSend: CreateArticleData = {
        title: formData.title,
        content: formData.content,
        category: primaryCategory.toLowerCase(), 
        tags: formData.tags, // MENGIRIM ARRAY TAGS
        status: formData.status,
        featuredImage: finalImageUrl,
        excerpt: formData.content.substring(0, 150) + '...'
    };

    try {
      setSubmitting(true);
      await createArticle(dataToSend); // Kirim data dengan array tags
      toast.success('Artikel berhasil dibuat');
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        category: 'berita',
        tags: [],
        status: 'draft',
        featuredImage: '',
        imageFile: null,
        imagePreview: ''
      });
      
      const fileInput = document.getElementById('imageFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      await loadArticles();
    } catch (error: any) {
      console.error('Error saving article:', error);
      toast.error(error.message || 'Gagal menyimpan artikel');
    } finally {
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
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Tulis Artikel Baru
            </CardTitle>
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
                />
              </div>
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Gambar Thumbnail
                </Label>
                {formData.imageFile ? (
                    <div className="relative flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-2 truncate">
                            <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                            <span className="text-sm font-medium truncate">{formData.imageFile.name}</span>
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
                                <p className="text-xs text-gray-500 mt-1">(Maks. 10MB, JPG/PNG/JPEG)</p>
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
                  <div key={article._id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <span>Status: </span>
                      <Badge className={article.status === 'published' ? 'bg-green-500' : 'bg-gray-500'}>
                        {article.status}
                      </Badge>
                      <span>Views: {article.views}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {article.excerpt}
                    </p>
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
