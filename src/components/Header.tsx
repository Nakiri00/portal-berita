import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { UserProfileDropdown } from './UserProfileDropdown';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Search, User, Edit3, LogOut, UserCircle, Menu } from 'lucide-react';
import logoImage from '../assets/logo.png';

interface HeaderProps {
  onLoginClick: () => void;
  onLogout: () => void;
  isLoggedIn: boolean;
  isWriter: boolean;
  userProfile: {
    name: string;
    email: string;
    avatar: string;
    bio?: string;
  };
  readingHistory: any[];
  savedArticles: any[];
  onUpdateProfile: (profile: any) => void;
  onArticleClick: (articleId: string) => void;
}

export function Header({ 
  onLoginClick, 
  onLogout, 
  isLoggedIn, 
  isWriter, 
  userProfile,
  readingHistory,
  savedArticles,
  onUpdateProfile,
  onArticleClick
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const tags = ['Akademik', 'Kehidupan Kampus', 'Tips & Trik', 'Beasiswa', 'Karir'];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      } catch (error) {
        window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
      }
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleTagClick = (tag: string) => {
    try {
      navigate(`articles/${encodeURIComponent(tag)}`);
    } catch (error) {
      window.location.href = `/?tag=${encodeURIComponent(tag)}`;
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Force navigation to home - most reliable method
    window.location.href = '/';
  };

  const handleMobileSearch = () => {
    setIsSearchOpen(true);
  };

  const isActivePage = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    try {
      navigate(path);
    } catch (error) {
      window.location.href = path;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header */}
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={handleLogoClick}
          >
            <img 
              src={logoImage} 
              alt="Kamus Mahasiswa Logo" 
              className="h-10 w-10"
            />
            <div>
              <h1 className="text-xl font-bold text-blue-600">Kamus Mahasiswa</h1>
              <p className="text-xs text-gray-500">Portal Berita Mahasiswa</p>
            </div>
          </div>

          {/* Navigation */}
          {/* <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleNavigation('/berita-terkini')}
              className={`text-gray-700 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer ${
                isActivePage('/berita-terkini') ? 'text-blue-600 font-medium' : ''
              }`}
            >
              Berita Terkini
            </button>
            <button 
              onClick={() => handleNavigation('/tips-trik')}
              className={`text-gray-700 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer ${
                isActivePage('/tips-trik') ? 'text-blue-600 font-medium' : ''
              }`}
            >
              Tips & Trik
            </button>
            <button 
              onClick={() => handleNavigation('/tentang')}
              className={`text-gray-700 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer ${
                isActivePage('/tentang') ? 'text-blue-600 font-medium' : ''
              }`}
            >
              Tentang
            </button>
          </nav> */}

          {/* Mobile Navigation */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-6">
                {/* Search Section - Mobile */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <button 
                    onClick={() => {
                      handleMobileSearch();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full py-2 px-3 rounded-lg hover:bg-white border border-gray-200 transition-colors"
                  >
                    <Search className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="text-gray-600">Cari artikel...</span>
                  </button>
                </div>

                {/* Writer Actions - Mobile */}
                {isWriter && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <button 
                      onClick={() => {
                        handleNavigation('/writer');
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full py-2 px-3 rounded-lg hover:bg-blue-100 border border-blue-300 bg-white transition-colors"
                    >
                      <Edit3 className="h-4 w-4 mr-3 text-blue-600" />
                      <span className="text-blue-600 font-medium">Tulis Artikel</span>
                    </button>
                  </div>
                )}

                {/* Navigation Links */}
                {/* <div className="space-y-2">
                  <button 
                    onClick={() => {
                      handleNavigation('/berita-terkini');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2 px-3 rounded-lg transition-colors bg-transparent border-none ${
                      isActivePage('/berita-terkini') ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                    }`}
                  >
                    Berita Terkini
                  </button>
                  <button 
                    onClick={() => {
                      handleNavigation('/tips-trik');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2 px-3 rounded-lg transition-colors bg-transparent border-none ${
                      isActivePage('/tips-trik') ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                    }`}
                  >
                    Tips & Trik
                  </button>
                  <button 
                    onClick={() => {
                      handleNavigation('/tentang');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2 px-3 rounded-lg transition-colors bg-transparent border-none ${
                      isActivePage('/tentang') ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                    }`}
                  >
                    Tentang
                  </button>
                </div> */}
                
                <div className="border-t pt-4">
                  {isLoggedIn ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          handleNavigation('/account');
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center py-3 px-3 rounded-lg hover:bg-blue-50 border border-blue-200 bg-blue-50/50 transition-all duration-200 w-full bg-transparent"
                      >
                        <UserCircle className="mr-3 h-5 w-5 text-blue-600" />
                        <span className="text-blue-600 font-medium">My Account</span>
                      </button>

                      <button 
                        onClick={() => {
                          onLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full py-2 px-3 rounded-lg hover:bg-gray-100 text-left"
                      >
                        <LogOut className="mr-3 h-5 w-5" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => {
                        onLoginClick();
                        setIsMobileMenuOpen(false);
                      }}
                      variant="outline" 
                      className="w-full"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-4">
            {/* Desktop Search */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Cari berita..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm border-none outline-none w-48"
              />
            </form>

            {/* Mobile Search Icon */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={handleMobileSearch}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Writer Create Button - Desktop Only */}
            {isWriter && (
              <Button 
                onClick={() => handleNavigation('/writer')}
                size="sm"
                className="hidden md:inline-flex bg-blue-600 hover:bg-blue-700"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Tulis Artikel
              </Button>
            )}

            {/* User Menu */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                {/* Account Button - Removed since we have dropdown instead */}

                {/* User Profile Dropdown */}
                <UserProfileDropdown
                  userProfile={userProfile}
                  readingHistory={readingHistory}
                  savedArticles={savedArticles}
                  onUpdateProfile={onUpdateProfile}
                  onLogout={onLogout}
                  onArticleClick={onArticleClick}
                  isWriter={isWriter}
                />
              </div>
            ) : (
              <Button onClick={onLoginClick} variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>

        {/* Tags Section */}
        <div className="py-2 sm:py-3 border-t">
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-2">
            <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Tags Populer:</span>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="hover:bg-blue-100 cursor-pointer text-xs transition-colors"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cari Artikel</DialogTitle>
            <DialogDescription>
              Masukkan kata kunci untuk mencari artikel di portal berita
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Masukkan kata kunci..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsSearchOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit">
                Cari
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
}