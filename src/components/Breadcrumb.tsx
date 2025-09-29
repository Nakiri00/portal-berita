import { useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useArticles } from '../contexts/ArticleContext';

interface BreadcrumbItem {
  label: string;
  path: string;
}

export function Breadcrumb() {
  const location = useLocation();
  const { publishedArticles } = useArticles();
  const pathnames = location.pathname.split('/').filter(x => x);

  const getBreadcrumbLabel = (path: string, index: number): string => {
    const labels: Record<string, string> = {
      'berita-terkini': 'Berita Terkini',
      'tips-trik': 'Tips & Trik',
      'tentang': 'Tentang',
      'account': 'My Account',
      'writer': 'Tulis Artikel',
      'article': 'Artikel',
      'author': 'Profil Penulis'
    };

    // Handle dynamic article and author IDs
    if (path === 'article' && index === 0 && pathnames.length > 1) {
      return 'Artikel';
    }
    
    if (pathnames[index - 1] === 'article' && index > 0) {
      // This is an article ID, try to get the article title
      const articleId = path;
      const mockArticles = [
        { id: '1', title: 'Strategi Belajar Efektif untuk Mahasiswa di Era Digital' },
        { id: '2', title: 'Kehidupan Sosial di Kampus: Membangun Networking yang Kuat' },
        { id: '3', title: 'Persiapan Wisuda: Panduan Lengkap untuk Mahasiswa Tingkat Akhir' },
        { id: '4', title: 'Mengelola Stress dan Burnout Akademik' },
        { id: '5', title: 'Beasiswa LPDP 2025: Panduan Lengkap Pendaftaran' },
        { id: '6', title: 'Kuliah Sambil Kerja: Strategi Time Management' },
        { id: '7', title: 'Membangun Soft Skills untuk Dunia Kerja' },
        { id: '8', title: 'Organisasi Kemahasiswaan: Manfaat dan Tips Bergabung' },
        { id: '9', title: 'Tips Presentasi yang Menarik untuk Mahasiswa' },
        { id: '10', title: 'Panduan Magang untuk Mahasiswa Tingkat Akhir' },
        { id: '11', title: 'Beasiswa Erasmus: Peluang Kuliah Gratis di Eropa' },
        { id: '12', title: 'Mengatasi Homesick di Rantau: Tips untuk Mahasiswa Perantau' }
      ];
      
      const allArticles = [...publishedArticles, ...mockArticles];
      const article = allArticles.find(a => a.id === articleId);
      return article ? article.title : `Artikel ${articleId}`;
    }
    
    if (pathnames[index - 1] === 'author' && index > 0) {
      // This is an author ID, return a generic label for now
      return `Profil Penulis`;
    }

    return labels[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Beranda', path: '/' }
  ];

  pathnames.forEach((path, index) => {
    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
    breadcrumbs.push({
      label: getBreadcrumbLabel(path, index),
      path: routeTo
    });
  });

  // Don't show breadcrumb on home page or if no additional paths
  if (location.pathname === '/' || pathnames.length === 0) {
    return null;
  }

  return (
    <nav className="bg-gray-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={breadcrumb.path} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />}
              {index === 0 && <Home className="h-4 w-4 mr-2 text-gray-500" />}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900 font-medium">{breadcrumb.label}</span>
              ) : (
                <button 
                  onClick={() => {
                    // Guaranteed navigation to home or path
                    window.location.href = breadcrumb.path;
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer bg-transparent border-none p-0 underline-offset-4 hover:underline"
                >
                  {breadcrumb.label}
                </button>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}