import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  RefreshCw,
  Users,
  Shield,
  ArrowLeft,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { CreateWriterForm } from '../components/CreateWriterForm';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

interface UserData {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  joinDate: string;
  role: 'user' | 'writer' | 'admin';
  lastLogin: string;
  isActive: boolean;
}

export function AdminPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'writer' | 'admin' | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWriters: 0,
    totalAdmins: 0,
    usersThisMonth: 0,
    recentUsers: 0,
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Load users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('portal_token');
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const formattedUsers = data.data.users.map((user: any) => ({
            ...user,
            joinDate: new Date(user.createdAt).toLocaleDateString('id-ID'),
            lastLogin: new Date(user.lastLogin).toLocaleString('id-ID'),
          }));
          setUsers(formattedUsers);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const token = localStorage.getItem('portal_token');
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data.stats);
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  const refreshData = () => {
    loadUsers();
    loadStats();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'writer':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtering logic
  const filteredUsers = users.filter((u) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'writer') return u.role === 'writer';
    if (activeFilter === 'admin') return u.role === 'admin';
    return true;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const displayedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handleCardClick = (filter: 'all' | 'writer' | 'admin') => {
    setActiveFilter(filter);
    setCurrentPage(1);
    setActiveTab('users');
  };

  const handleAddWriterClick = () => {
    setActiveTab('create_writer');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Kelola data pengguna website</p>
        </div>

        <Button onClick={refreshData} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {/* <TabsTrigger value="users">Manajemen User</TabsTrigger> */}
          {/* <TabsTrigger value="create_writer">Tambah Penulis</TabsTrigger> */}
        </TabsList>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 my-6">

            {/* Total Users */}
            <Card
              onClick={() => handleCardClick('all')}
              className="cursor-pointer hover:shadow-lg transition"
            >
              <CardContent className="p-6 flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </CardContent>
            </Card>

            {/* Writers */}
            <Card
              onClick={() => handleCardClick('writer')}
              className="cursor-pointer hover:shadow-lg transition"
            >
              <CardContent className="p-6 flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Writers</p>
                  <p className="text-2xl font-bold">{stats.totalWriters}</p>
                </div>
              </CardContent>
            </Card>

            {/* Admins */}
            <Card
              onClick={() => handleCardClick('admin')}
              className="cursor-pointer hover:shadow-lg transition"
            >
              <CardContent className="p-6 flex items-center">
                <Shield className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Admins</p>
                  <p className="text-2xl font-bold">{stats.totalAdmins}</p>
                </div>
              </CardContent>
            </Card>

            {/* This Month - NOT clickable */}
            <Card>
              <CardContent className="p-6 flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">{stats.usersThisMonth}</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent - NOT clickable */}
            <Card>
              <CardContent className="p-6 flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Recent (7d)</p>
                  <p className="text-2xl font-bold">{stats.recentUsers}</p>
                </div>
              </CardContent>
            </Card>

            {/* Tambah Penulis */}
            <Card
              onClick={handleAddWriterClick}
              className="cursor-pointer hover:shadow-lg transition bg-blue-50"
            >
              <CardContent className="p-6 flex items-center">
                <Plus className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Tambah Penulis Baru</p>
                  <p className="text-lg font-semibold text-blue-800">Buat Penulis</p>
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* TAB 2: USERS */}
        <TabsContent value="users">
          {loading ? (
            <p>Memuat data user...</p>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-4 mt-6">
              {displayedUsers.map((user) => (
                <Card key={user._id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-gray-600">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{user.name}</h3>
                          <p className="text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-500">
                            Bergabung: {user.joinDate} | Login: {user.lastLogin}
                          </p>
                        </div>
                      </div>

                      <Badge className={getRoleColor(user.role)}>
                        {user.role.toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Sebelumnya
                  </Button>

                  <span className="text-sm text-gray-600">
                    Halaman {currentPage} dari {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Berikutnya <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card className="mt-6 p-6 text-center text-gray-500">
              Tidak ada user ditemukan.
            </Card>
          )}
        </TabsContent>

        {/* TAB 3: CREATE WRITER */}
        <TabsContent value="create_writer">
          <div className="mt-6">
            <CreateWriterForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
