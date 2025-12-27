import React, { useState, useEffect} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  createArticle, 
  getWriterArticles,
  getEditorArticles, 
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, Save, Image as ImageIcon, Trash2, FileText, Pencil, X, Star, User as UserIcon, Info, ChevronLeft, ChevronRight ,MessageSquare, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog'; 
import { getArticleById } from '../services/articleService';
import { assetUrl } from '../utils/assets';


// --- Interfaces ---
interface ArticleForm extends CreateArticleData {
    imageFile: File | null;
    imagePreview: string; 
    tags: string[];
    articleId?: string;
    editorFeedback?: string;
}

interface EditorArticle extends Article {
    authorRole?: string;
    authorName: string;
}

interface PaginationState {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

const AVAILABLE_TAGS = ['Akademik', 'Kehidupan Kampus', 'Tips & Trik', 'Beasiswa', 'Karir', 'Infografis'];

const toTitleCase = (str: string): string => {
    if (!str) return '';
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
};

export function WriterPage() {
  const { userProfile, isWriter, refreshUser,writerArticles} = useAuth();
  
  // --- Data States ---
  const [articles, setArticles] = useState<Article[]>([]); 
  const [editorArticles, setEditorArticles] = useState<EditorArticle[]>([]); 
  const { articleId } = useParams(); 
  const navigate = useNavigate();

  // --- UI States ---
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [originalImage, setOriginalImage] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<{ id: string; title: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [originalAuthor, setOriginalAuthor] = useState<{ name: string; role: string } | null>(null);
  const [currentView, setCurrentView] = useState<'create' | 'manage'>('manage');
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  
  // --- Pagination State ---
  const [activeTab, setActiveTab] = useState('my-articles'); 
  const [pagination, setPagination] = useState<PaginationState>({
      page: 1,
      limit: 10,
      total: 0,
      pages: 1
  });

  const [formData, setFormData] = useState<ArticleForm>({
    title: '',
    content: '',
    category: 'berita',
    tags: [],
    status: 'draft',
    featuredImage: '', 
    isFeatured: false,
    imageFile: null,
    imagePreview: '',
    editorFeedback: ''
  });
  
  const isEditor = userProfile?.role === 'editor';

  // --- Handlers ---
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
      editorFeedback: '',
      articleId: undefined,
    });
    setOriginalImage('');
    setIsEditing(false);
    const fileInput = document.getElementById('imageFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleEditClick = (article: Article) => {
        const currentImageUrl = assetUrl(article.featuredImage);
        
        let rawTags = article.tags || [];
        let parsedTags: string[] = [];

        if (rawTags.length === 1 && typeof rawTags[0] === 'string' && rawTags[0].startsWith('[')) {
            try {
                const temp = JSON.parse(rawTags[0]);
                if (Array.isArray(temp)) rawTags = temp;
            } catch (e) {
                console.warn("Failed to parse corrupted tag string:", rawTags[0]);
            }
        }
        parsedTags = rawTags
            .filter(tag => typeof tag === 'string' && tag.trim() !== '')
            .map(tag => toTitleCase(tag));

        setFormData({
            title: article.title,
            content: article.content,
            category: toTitleCase(article.category) || 'berita', 
            tags: parsedTags, 
            status: article.status,
            featuredImage: currentImageUrl, 
            isFeatured: article.isFeatured || false,
            imageFile: null,
            imagePreview: '',
            editorFeedback: (article as any).editorFeedback || '',
            articleId: article._id,
        });
        
        setOriginalImage(currentImageUrl);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

  useEffect(() => {
    if (isWriter || isEditor) {
        fetchData();
    }
  }, [isWriter, isEditor, pagination.page, activeTab]);

  useEffect(() => {
    if (articleId) {
      const loadArticleForEdit = async () => {
        setLoading(true);
        
        try {
          // 1. Coba cari di context lokal (writerArticles) dulu
          // Perhatikan: properti di writerArticles mungkin menggunakan 'id' bukan '_id' dan 'tag' tunggal
          const formatTag = (t: string) => toTitleCase(t.trim());

          // 1. Coba cari di context lokal (writerArticles)
          const localArticle = writerArticles.find((a: any) => a.id === articleId || a._id === articleId);
          
          if (localArticle) {
            // Normalisasi Tags
            let tags: string[] = [];
            if (Array.isArray(localArticle.tags)) {
                tags = localArticle.tags.map(formatTag);
            } else if (typeof localArticle.tag === 'string') {
                tags = [formatTag(localArticle.tag)];
            }
            
            setFormData({
              title: localArticle.title,
              content: localArticle.content,
              category: localArticle.category || 'berita',
              tags: tags,
              status: localArticle.status || 'draft',
              featuredImage: localArticle.imageUrl || localArticle.featuredImage || '',
              isFeatured: localArticle.isFeatured || false,
              imageFile: null,
              imagePreview: localArticle.imageUrl || localArticle.featuredImage || '',
              articleId: articleId
            });
            
            setOriginalImage(localArticle.imageUrl || localArticle.featuredImage || '');
            setOriginalAuthor({
                name: userProfile?.name || 'Anda',
                role: userProfile?.role || 'writer'
            });
            setIsEditing(true);
            setEditingArticleId(articleId);
            // setCurrentView('create'); // 
          } else {
            // 2. Jika tidak ada di lokal (misal Editor mengedit punya Intern), ambil dari API
            const response = await getArticleById(articleId);
            const apiArticle = response.data.article;
            
            const imageUrl = assetUrl(apiArticle.featuredImage);

            // Normalisasi Tags dari API (yang lowercase) ke Title Case
            const tags = (apiArticle.tags || []).map(formatTag);

            setFormData({
              title: apiArticle.title,
              content: apiArticle.content,
              category: apiArticle.category || 'berita',
              tags: tags, // Tags yang sudah diformat
              status: apiArticle.status as any,
              featuredImage: imageUrl,
              isFeatured: apiArticle.isFeatured,
              imageFile: null,
              imagePreview: imageUrl,
              editorFeedback: apiArticle.editorFeedback || '',
              articleId: apiArticle._id
            });

            setOriginalImage(imageUrl);
            
            // [BARU] Set Info Penulis dari API
            setOriginalAuthor({
                name: apiArticle.authorName,
                role: (apiArticle.author as any)?.role || 'writer' // Pastikan backend populate field ini
            });

            setIsEditing(true);
            setEditingArticleId(apiArticle._id);
          }
          
          window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
          console.error("Gagal memuat artikel:", error);
          toast.error("Gagal memuat artikel untuk diedit");
          navigate('/writer'); 
        } finally {
          setLoading(false);
        }
      };

      loadArticleForEdit();
    }
  }, [articleId, writerArticles, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
        let response;
        const params = { page: pagination.page, limit: 10 };

        if (activeTab === 'my-articles') {
            response = await getWriterArticles(params);
            setArticles(response.data.articles);
        } else if (activeTab === 'other-articles' && isEditor) {
            response = await getEditorArticles(params);
            setEditorArticles(response.data.articles);
        }

        if (response && response.data.pagination) {
            setPagination({
                page: response.data.pagination.page,
                limit: response.data.pagination.limit,
                total: response.data.pagination.total,
                pages: response.data.pagination.pages
            });
        }
    } catch (error) {
        console.error('Error loading articles:', error);
        toast.error('Gagal memuat artikel');
    } finally {
        setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
      setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleTabChange = (value: string) => {
      setActiveTab(value);
      setPagination(prev => ({ ...prev, page: 1 }));
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

    const objectUrl = URL.createObjectURL(file);
    setFormData(prev => ({ 
      ...prev, 
      imageFile: file,
      imagePreview: objectUrl
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
    if (!isUpdate && !formData.imageFile) {
        toast.error('Wajib melampirkan Gambar untuk Thumbnail.');
        return;
    } else if (isUpdate && !originalImage && !formData.imageFile) {
        toast.error('Wajib ada Gambar Thumbnail.');
        return;
    }

    const dataToSend: any = { 
      title: formData.title,
      content: formData.content,
      category: primaryCategory.toLowerCase(),
      tags: formData.tags,
      status: formData.status ?? 'draft',
      isFeatured: formData.isFeatured,
      excerpt: formData.content.substring(0, 150) + '...',
      ...(formData.editorFeedback?.trim()
        ? { editorFeedback: formData.editorFeedback }
        : {})
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
      } else {
          const formDataToSend = new FormData();
          formDataToSend.append('title', dataToSend.title);
          formDataToSend.append('content', dataToSend.content);
          formDataToSend.append('category', dataToSend.category);
          formDataToSend.append('tags', JSON.stringify(dataToSend.tags));
          formDataToSend.append('status', dataToSend.status ?? 'draft');
          formDataToSend.append('isFeatured', dataToSend.isFeatured.toString());
          formDataToSend.append('excerpt', dataToSend.content.substring(0, 150) + '...');
          
          if (dataToSend.editorFeedback) {
            formDataToSend.append('editorFeedback', dataToSend.editorFeedback);
          }
      
          if (dataToSend.featuredImage instanceof File) {
              formDataToSend.append('imageFile', dataToSend.featuredImage); 
          }
          await createArticle(formDataToSend);
          toast.success('Artikel berhasil dibuat');
      }
      
      if (refreshUser) await refreshUser();
      resetForm();
      
      fetchData(); 
      
    } catch (error: any) {
      console.error('Error saving article:', error);
      toast.error(error.message || 'Gagal menyimpan artikel');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = (articleId: string, title: string) => {
      setArticleToDelete({ id: articleId, title });
      setIsDeleteDialogOpen(true);
  };
    
  const executeDelete = async () => {
      if (!articleToDelete) return;
      try {
          setSubmitting(true);
          await deleteArticle(articleToDelete.id);
          if (refreshUser) await refreshUser(); 
          
          toast.success('Artikel berhasil dihapus.');
          fetchData(); 
      } catch (error: any) {
          console.error('Error deleting article:', error);
          toast.error(error.message || 'Gagal menghapus artikel');
      } finally {
          setIsDeleteDialogOpen(false);
          setArticleToDelete(null);
          setSubmitting(false);
      }
  };

  if (!isWriter && !isEditor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Akses Ditolak</h1>
          <p className="text-gray-600">Anda tidak memiliki akses sebagai penulis.</p>
        </div>
      </div>
    );
  }

  const renderArticleList = (list: any[], isOtherPeople: boolean = false) => {
    if (loading) {
        return (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Memuat artikel...</p>
            </div>
        );
    }
    if (list.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50/50">
                <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2"/>
                <p className="text-gray-500">
                    {isOtherPeople ? 'Tidak ada artikel dari penulis lain.' : 'Belum ada artikel.'}
                </p>
            </div>
        );
    }
    return (
        <div className="space-y-4">
            {list.map((article) => (
              <div key={article._id} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {isOtherPeople && article.authorName && (
                         <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                           <UserIcon className="w-3 h-3 mr-1"/> 
                           {article.authorName} 
                         </Badge>
                    )}
                    <h3 className="font-semibold text-lg text-gray-900">{article.title}</h3>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                    <span className='flex items-center'>
                        Status: 
                        <Badge 
                          className="ml-2 text-xs"
                          variant={article.status === 'published' ? 'default' : article.status === 'rejected' ? 'destructive' : 'outline'}
                        >
                          {article.status.toUpperCase()}
                        </Badge>
                    </span>
                    <span>Views: {article.views}</span>
                    {article.isFeatured && (
                        <span className="flex items-center text-yellow-600 font-medium text-xs">
                             <Star className="w-3 h-3 mr-1 fill-yellow-600"/> Featured
                        </span>
                     )}
                  </div>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {article.excerpt}
                    </p>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditClick(article)}
                    title="Edit Artikel"
                    disabled={submitting}
                  >
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleConfirmDelete(article._id, article.title)}
                    title="Hapus Artikel"
                    disabled={submitting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {pagination.pages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t mt-6">
                    <div className="text-sm text-gray-500">
                        Halaman <span className="font-medium">{pagination.page}</span> dari <span className="font-medium">{pagination.pages}</span> 
                        <span className="mx-1">•</span> 
                        Total {pagination.total} Artikel
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1 || loading}
                            className="h-8 px-3"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.pages || loading}
                            className="h-8 px-3"
                        >
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
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
          {isEditor ? 'Dashboard Editor' : 'Dashboard Penulis'}
        </h1>
        <p className="text-gray-600">
          Selamat datang, {userProfile?.name}. Kelola artikel Anda di sini.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3 mb-8">
            {/* KOLOM KIRI: Editor Artikel */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-sm h-full border-t-4 border-t-green-600">
                <CardHeader className='flex flex-row items-center justify-between bg-gray-50/50 border-b pb-4'>
                    <CardTitle className="flex items-center text-xl">
                    {isEditing ? (
                        <><Pencil className="w-5 h-5 mr-2 text-blue-600" /> Edit Artikel</>
                    ) : (
                        <><Plus className="w-5 h-5 mr-2 text-green-600" /> Tulis Artikel Baru</>
                    )}
                    </CardTitle>
                    {isEditing && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetForm} 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        type="button" 
                        >
                        <X className="h-4 w-4 mr-1" /> Batal
                    </Button>
                    )}
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        <div className="mb-6">
                            {isEditor ? (
                                // TAMPILAN UNTUK EDITOR: Input Feedback
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <Label className="flex items-center text-yellow-800 font-semibold mb-2">
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Catatan Review / Feedback untuk Penulis
                                    </Label>
                                    <Textarea
                                        value={formData.editorFeedback}
                                        onChange={(e) => setFormData({...formData, editorFeedback: e.target.value})}
                                        placeholder="Tulis alasan penolakan atau saran perbaikan di sini..."
                                        rows={3}
                                        className="bg-white border-yellow-300 focus:border-yellow-500"
                                        disabled={submitting}
                                    />
                                    <p className="text-xs text-yellow-600 mt-2">
                                        Catatan ini akan muncul di dashboard penulis saat mereka mengedit artikel ini.
                                    </p>
                                </div>
                            ) : (
                                // TAMPILAN UNTUK PENULIS: Read-Only Feedback
                                formData.editorFeedback && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-red-800 text-sm mb-1">Catatan dari Editor:</h4>
                                            <p className="text-red-700 text-sm leading-relaxed">
                                                {formData.editorFeedback}
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                        <div>
                            <Label className="block text-base font-semibold text-gray-700 mb-2">
                            Judul Artikel <span className="text-red-500">*</span>
                            </Label>
                            <Input
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="Masukkan judul artikel yang menarik"
                            required
                            disabled={submitting}
                            className="text-lg py-5"
                            />
                        </div>
                        
                        <div className="space-y-3">
                            <Label className="block text-base font-semibold text-gray-700">
                                Gambar Thumbnail
                            </Label>
                            {formData.imagePreview || (isEditing && originalImage) ? (
                                <div className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50 relative group">
                                    
                                    {/* GAMBAR PREVIEW */}
                                    <img 
                                        // Prioritas: Preview Blob Baru -> Gambar Lama Server
                                        src={formData.imagePreview || originalImage} 
                                        alt="Thumbnail" 
                                        className="h-16 w-24 object-cover rounded-md border bg-white"
                                    />
                                    
                                    {/* TEKS INFO FILE */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-700 truncate">
                                            {/* Jika ada file baru (upload), ambil namanya dari object File */}
                                            {formData.imageFile 
                                                ? formData.imageFile.name 
                                                // Jika edit mode (dan belum ganti), ambil nama dari URL original
                                                : originalImage.split('/').pop() || "Gambar Tersimpan"
                                            }
                                        </p>
                                        {/* <p className="text-xs text-gray-500">
                                            {formData.imageFile 
                                                ? "Siap untuk disimpan (File Baru)." 
                                                : "Gambar saat ini (Dari Server)."
                                            }
                                        </p> */}
                                    </div>

                                    {/* TOMBOL HAPUS / RESET */}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                                        onClick={removeImage}
                                        title="Hapus / Ganti Gambar"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                // TAMPILAN INPUT UPLOAD (JIKA BELUM ADA GAMBAR SAMA SEKALI)
                                <Label htmlFor="imageFile" className="cursor-pointer block group">
                                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200">
                                        <input
                                            id="imageFile"
                                            type="file"
                                            accept="image/jpeg, image/png, image/jpg"
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                            disabled={submitting}
                                        />
                                        <div className="flex flex-col items-center justify-center pointer-events-none">
                                            <div className="bg-blue-100 p-3 rounded-full mb-3 group-hover:bg-blue-200 transition-colors">
                                                <ImageIcon className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <p className="text-base font-medium text-gray-700">Klik untuk Pilih Gambar</p>
                                            <p className="text-xs text-gray-500 mt-1">Maks. 5MB (JPG/PNG)</p>
                                        </div>
                                    </div>
                                </Label>
                            )}
                        </div>

                        <div>
                            <Label className="block text-base font-semibold text-gray-700 mb-2">
                                Konten <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                value={formData.content}
                                onChange={(e) => setFormData({...formData, content: e.target.value})}
                                placeholder="Tulis konten artikel Anda..."
                                rows={36}
                                required
                                disabled={submitting}
                                className="min-h-[300px] text-base leading-relaxed p-4"
                            />
                        </div>
                    </div>
                </CardContent>
                </Card>
            </div>

            {/* KOLOM KANAN: Sidebar (Tags, Featured, Info) */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader className="pb-3 border-b bg-gray-50/30">
                        <CardTitle className="text-base font-semibold">Kategori & Tags</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_TAGS.map((tag) => {
                                const isSelected = formData.tags?.includes(tag) || false;
                                return (
                                    <Badge
                                        key={tag}
                                        variant={isSelected ? 'default' : 'outline'}
                                        className={`cursor-pointer px-3 py-1.5 text-sm transition-all duration-200 ${
                                            isSelected 
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1' 
                                            : 'bg-white hover:bg-gray-100 text-gray-600 border-gray-300 hover:border-gray-400'
                                        }`}
                                        onClick={() => handleTagToggle(tag)}
                                    >
                                        {tag}
                                    </Badge>
                                );
                            })}
                        </div>
                        {formData.tags?.length === 0 && (
                            <p className="text-xs text-red-500 mt-2 font-medium">Wajib pilih minimal satu tag.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                <CardHeader className="pb-3 border-b bg-gray-50/30">
                    <CardTitle className="text-base font-semibold flex items-center">
                    <Star className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500" />
                        Featured
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="space-y-3">
                    <Label>Jadikan Headline?</Label>
                        <Select 
                        value={formData.isFeatured ? 'true' : 'false'} 
                        onValueChange={(value) => {
                            setFormData(prev => ({ ...prev, isFeatured: value === 'true' }));
                        }}
                        disabled={submitting}
                        >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="false">Tidak (Default)</SelectItem>
                            <SelectItem value="true">Ya, Jadikan Featured</SelectItem>
                        </SelectContent>
                        </Select>
                        <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-100">
                        Artikel featured akan muncul di carousel utama beranda.
                        </div>
                    </div>
                </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3 border-b bg-gray-50/30">
                        <CardTitle className="text-base font-semibold flex items-center">
                            <Info className="w-4 h-4 mr-2 text-blue-500" />
                            Info Publikasi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Status Artikel</Label>
                            {userProfile?.role === 'intern' ? (
                                // TAMPILAN KHUSUS INTERN (Terkunci)
                                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <span className="text-sm font-medium text-blue-700 flex items-center">
                                        <Info className="w-4 h-4 mr-2" />
                                        Menunggu Review Editor
                                    </span>
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                                        Otomatis
                                    </Badge>
                                </div>
                            ) : (
                                // TAMPILAN NORMAL (Writer/Editor) - Dropdown bisa dipilih
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData({...formData, status: val as any})}
                                    disabled={submitting}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft (Konsep)</SelectItem>
                                        <SelectItem value="published">Published (Tayang)</SelectItem>
                                        <SelectItem value="pending review">Pending Review (Menunggu Review)</SelectItem>
                                        {isEditor && <SelectItem value="rejected">Rejected (Tolak)</SelectItem>}
                                    </SelectContent>
                                </Select>
                            )}
                            
                            {/* Pesan bantuan kecil */}
                            {userProfile?.role === 'intern' && (
                                <p className="text-[10px] text-gray-500 mt-1">
                                    Sebagai Intern, artikel Anda akan dikirim ke Editor untuk ditinjau sebelum terbit.
                                </p>
                            )}
                        </div>

                        <div className="pt-2 border-t text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Penulis:</span>
                                {/* Tampilkan Nama Penulis Asli jika ada, kalau tidak pakai user login */}
                                <span className="font-medium text-gray-900">
                                    {originalAuthor ? originalAuthor.name : (userProfile?.name || 'Anda')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Role:</span>
                                <Badge variant="outline" className="text-xs">
                                    {originalAuthor ? originalAuthor.role : userProfile?.role}
                                </Badge>
                            </div>
                            
                            {/* Tambahan Info: Jika Editor sedang melihat artikel orang lain */}
                            {originalAuthor && originalAuthor.name !== userProfile?.name && (
                                <div className="mt-2 text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-200">
                                    Anda sedang meninjau artikel milik <strong>{originalAuthor.name}</strong>.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
        
        <div className="mb-8 flex justify-end">
            <Button type="submit" disabled={submitting} className="w-full md:w-auto h-12">
                {submitting ? (
                <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                </>
                ) : (
                <>
                    <Save className="w-5 h-5 mr-2" />
                    Simpan Artikel
                </>
                )}
            </Button>
        </div>
      </form>

      {/* KOLOM BAWAH: List Artikel */}
      <Card className="border-t-4 border-t-blue-600 shadow-md">
        <CardHeader className="border-b bg-gray-50/30 pb-4">
          <CardTitle className="text-xl">Manajemen Artikel</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
           <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className={`grid w-full mb-6 p-1 bg-gray-100 rounded-lg ${isEditor ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <TabsTrigger 
                    value="my-articles"
                    className="
                        data-[state=active]:bg-white 
                        data-[state=active]:text-blue-700 
                        data-[state=active]:shadow-sm
                        data-[state=active]:font-semibold
                        text-gray-500 
                        hover:text-blue-600 
                        hover:bg-white/60
                        transition-all duration-200
                        py-2.5
                    "
                  >
                    Artikel Saya
                  </TabsTrigger>
                  
                  {isEditor && (
                      <TabsTrigger 
                        value="other-articles"
                        className="
                            data-[state=active]:bg-white 
                            data-[state=active]:text-blue-700 
                            data-[state=active]:shadow-sm
                            data-[state=active]:font-semibold
                            text-gray-500 
                            hover:text-blue-600 
                            hover:bg-white/60
                            transition-all duration-200
                            py-2.5
                        "
                      >
                        Artikel Penulis Lain
                      </TabsTrigger>
                  )}
              </TabsList>

              <TabsContent value="my-articles" className="mt-0 animate-in fade-in-50 duration-300">
                  {renderArticleList(articles)}
              </TabsContent>

              {isEditor && (
                  <TabsContent value="other-articles" className="mt-0 animate-in fade-in-50 duration-300">
                       <div className="bg-blue-50 border border-blue-100 px-4 py-3 mb-4 rounded-md flex items-center justify-between">
                          <p className="text-sm text-blue-800 flex items-center font-medium">
                              <UserIcon className="w-4 h-4 mr-2"/> 
                              Menampilkan artikel dari role Writer & Intern
                          </p>
                      </div>
                      {renderArticleList(editorArticles, true)}
                  </TabsContent>
              )}
           </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}