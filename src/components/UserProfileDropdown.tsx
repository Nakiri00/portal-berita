import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

import { 
  User, 
  LogOut, 
  History, 
  Bookmark, 
  Edit,
  Camera,
  Calendar,
  ExternalLink,
  Eye,
  Instagram,
  Facebook,
  MessageCircle
} from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  joinDate: string;
  instagram?: string;
  facebook?: string;
  threads?: string;
}

interface ReadHistory {
  articleId: string;
  title: string;
  readDate: string;
  readCount: number;
}

interface SavedArticle {
  articleId: string;
  title: string;
  excerpt: string;
  author: string;
  savedDate: string;
  imageUrl: string;
  tag: string;
}

interface UserProfileDropdownProps {
  userProfile: UserProfile;
  readingHistory: ReadHistory[];
  savedArticles: SavedArticle[];
  onUpdateProfile: (profile: UserProfile) => void;
  onLogout: () => void;
  onArticleClick: (articleId: string) => void;
  isWriter?: boolean;
}

export function UserProfileDropdown({
  userProfile,
  readingHistory,
  savedArticles,
  onUpdateProfile,
  onLogout,
  onArticleClick,
  isWriter = false
}: UserProfileDropdownProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isSavedDialogOpen, setIsSavedDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState(userProfile);

  const handleSaveProfile = () => {
    onUpdateProfile(editForm);
    setIsEditDialogOpen(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditForm(prev => ({
          ...prev,
          avatar: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {userProfile.avatar ? (
                <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
              ) : (
                <AvatarFallback>
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end" forceMount>
          {/* User Info Header */}
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center space-x-3 p-2">
              <Avatar className="h-12 w-12">
                {userProfile.avatar ? (
                  <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                ) : (
                  <AvatarFallback className="text-lg">
                    {userProfile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{userProfile.name}</p>
                <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Bergabung {userProfile.joinDate}</span>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />

          {/* Quick Stats */}
          <div className="px-3 py-2">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="text-sm font-medium text-blue-700">{readingHistory.length}</div>
                <div className="text-xs text-blue-600">Artikel Dibaca</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-sm font-medium text-green-700">{savedArticles.length}</div>
                <div className="text-xs text-green-600">Artikel Disimpan</div>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            {/* Account Link - Mobile */}
            <DropdownMenuItem asChild className="sm:hidden">
              <Link 
                to="/account"
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>My Account</span>
                </div>
                <ExternalLink className="h-3 w-3 opacity-50" />
              </Link>
            </DropdownMenuItem>

            {/* Edit Profile */}
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit Profil</span>
            </DropdownMenuItem>

            {/* Reading History */}
            <DropdownMenuItem onClick={() => setIsHistoryDialogOpen(true)}>
              <History className="mr-2 h-4 w-4" />
              <span>Histori Baca ({readingHistory.length})</span>
            </DropdownMenuItem>

            {/* Saved Articles */}
            <DropdownMenuItem onClick={() => setIsSavedDialogOpen(true)}>
              <Bookmark className="mr-2 h-4 w-4" />
              <span>Artikel Disimpan ({savedArticles.length})</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="h-20 w-20">
                {editForm.avatar ? (
                  <AvatarImage src={editForm.avatar} alt={editForm.name} />
                ) : (
                  <AvatarFallback className="text-xl">
                    {editForm.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                )}
              </Avatar>
              <Label htmlFor="avatar" className="cursor-pointer">
                <div className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700">
                  <Camera className="h-4 w-4" />
                  <span>Ubah Foto</span>
                </div>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </Label>
            </div>

            {/* Form Fields */}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Ceritakan sedikit tentang diri Anda..."
                value={editForm.bio || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Media Sosial - Khusus Penulis */}
            {isWriter && (
              <>
                <div className="pt-2 border-t">
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Media Sosial (Opsional)</Label>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="text-sm text-gray-600">Instagram</Label>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="instagram"
                          placeholder="@username atau URL Instagram"
                          value={editForm.instagram || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, instagram: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="facebook" className="text-sm text-gray-600">Facebook</Label>
                      <div className="relative">
                        <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="facebook"
                          placeholder="Nama atau URL Facebook"
                          value={editForm.facebook || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, facebook: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="threads" className="text-sm text-gray-600">Threads</Label>
                      <div className="relative">
                        <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="threads"
                          placeholder="@username atau URL Threads"
                          value={editForm.threads || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, threads: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSaveProfile}>
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reading History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Histori Bacaan</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {readingHistory.length > 0 ? (
              <div className="space-y-3">
                {readingHistory.map((item) => (
                  <div key={item.articleId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.title}</h4>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>Dibaca {item.readDate}</span>
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          <span>{item.readCount}x</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onArticleClick(item.articleId);
                        setIsHistoryDialogOpen(false);
                      }}
                    >
                      Baca
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Belum ada histori bacaan</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Saved Articles Dialog */}
      <Dialog open={isSavedDialogOpen} onOpenChange={setIsSavedDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Artikel Tersimpan</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {savedArticles.length > 0 ? (
              <div className="grid gap-4">
                {savedArticles.map((article) => (
                  <div key={article.articleId} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-20 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-clamp-2">{article.title}</h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{article.excerpt}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="secondary" className="text-xs">{article.tag}</Badge>
                            <span className="text-xs text-gray-500">oleh {article.author}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            onArticleClick(article.articleId);
                            setIsSavedDialogOpen(false);
                          }}
                        >
                          Baca
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bookmark className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Belum ada artikel yang disimpan</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}