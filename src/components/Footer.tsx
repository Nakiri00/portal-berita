import { Link, useNavigate } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';
import logoImage from '../assets/logo.png';

export function Footer() {
  const navigate = useNavigate();
  
  const categories = [
    'Akademik',
    'Kehidupan Kampus', 
    'Tips & Trik',
    'Beasiswa',
    'Karir'
  ];

  const links = [
    { label: 'Tentang Kamus Mahasiswa', path: '/tentang' },
    { label: 'Berita Terkini', path: '/' },
    { label: 'Hubungi Kami', path: '/hubungi-kami' }
  ];

  const handleTagClick = (tag: string) => {
    try {
      navigate(`articles/${encodeURIComponent(tag)}`);
    } catch (error) {
      window.location.href = `/?tag=${encodeURIComponent(tag)}`;
    }
  };

  return (
    <footer style={{ backgroundColor: '#0c4070' }} className="text-white mt-8 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 sm:col-span-2 md:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <img 
                src={logoImage} 
                alt="Kamus Mahasiswa Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 bg-white rounded-lg p-1"
              />
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Kamus Mahasiswa</h3>
                <p className="text-blue-200 text-xs sm:text-sm">Portal Berita Mahasiswa</p>
              </div>
            </Link>
            <p className="text-blue-200 mb-4 sm:mb-6 max-w-md text-sm sm:text-base leading-relaxed">
              Platform berita dan informasi terpercaya untuk mahasiswa Indonesia. 
              Kami hadir untuk mendukung perjalanan akademik dan kehidupan kampus Anda.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-3 sm:space-x-4">
              <a 
                href="https://www.instagram.com/kamusmahasiswa/" 
                className="bg-blue-600 hover:bg-blue-500 p-2 rounded-lg transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a 
                href="#" 
                className="bg-blue-600 hover:bg-blue-500 p-2 rounded-lg transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a 
                href="#" 
                className="bg-blue-600 hover:bg-blue-500 p-2 rounded-lg transition-colors"
                aria-label="Threads"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.5 8c-1.4 0-2.5 1.1-2.5 2.5S8.1 13 9.5 13s2.5-1.1 2.5-2.5S10.9 8 9.5 8zm0 3.5c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm7.3 8.8c-.1-.4-.2-.7-.4-1.1-.4-1.2-1.2-2.2-2.3-2.8-1.1-.6-2.4-.8-3.7-.6-1.3.2-2.5.8-3.4 1.7-.9.9-1.4 2.1-1.5 3.4-.1 1.3.2 2.6.8 3.7.6 1.1 1.6 1.9 2.8 2.3.4.1.7.2 1.1.2h.1c1.4 0 2.8-.6 3.8-1.6s1.6-2.4 1.6-3.8c0-.5-.1-.9-.2-1.4z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="col-span-1">
            <h4 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Kategori Konten</h4>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category}>
                  <button
                    onClick={() => handleTagClick(category)}
                    className="text-blue-200 hover:text-white transition-colors text-left text-sm sm:text-base"
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div className="col-span-1">
            <h4 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Tautan</h4>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-blue-200 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-blue-600 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
          <p className="text-blue-200 text-xs sm:text-sm">
            © 2025 Kamus Mahasiswa. Semua hak dilindungi undang-undang.
          </p>
        </div>
      </div>
    </footer>
  );
}