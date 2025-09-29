import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // Verify token when component mounts
  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setTokenValid(false);
      setError('Token reset password tidak ditemukan');
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/password/verify-reset-token/${token}`);
      const data = await response.json();
      
      if (data.success) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
        setError('Token tidak valid atau sudah kadaluarsa');
      }
    } catch (error) {
      console.error('Token verification error:', error);
      setTokenValid(false);
      setError('Terjadi kesalahan saat memverifikasi token');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setError('Semua field harus diisi');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password dan konfirmasi password tidak sama');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/password/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Terjadi kesalahan saat mereset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Terjadi kesalahan saat mereset password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/');
  };

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-red-600">Token Tidak Valid</CardTitle>
            <CardDescription>
              Token reset password tidak valid atau sudah kadaluarsa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Token reset password tidak valid atau sudah kadaluarsa. 
                Silakan request link reset password yang baru.
              </AlertDescription>
            </Alert>
            
            <Button onClick={handleGoToLogin} className="w-full">
              Kembali ke Halaman Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Lock className="h-12 w-12 text-blue-500" />
          </div>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Masukkan password baru untuk akun Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Masukkan password baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Konfirmasi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-green-600 mb-2">
                  Password Berhasil Direset!
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Password Anda telah berhasil direset. Silakan login dengan password baru.
                </p>
              </div>
              
              <Button onClick={handleGoToLogin} className="w-full">
                Kembali ke Halaman Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
