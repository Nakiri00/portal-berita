import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

// Pastikan sesuaikan dengan URL backend Anda
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth(); // Opsional: jika ingin auto-login di context
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Memverifikasi email Anda...');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Token verifikasi tidak ditemukan.');
        return;
      }

      try {
        // Panggil endpoint backend yang sudah kita buat sebelumnya
        const response = await fetch(`${API_URL}/auth/verify/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Email berhasil diverifikasi! Akun Anda kini aktif.');
          
          // Opsional: Simpan token login otomatis jika backend mengirimnya
          if (data.data?.token) {
            localStorage.setItem('portal_token', data.data.token);
            localStorage.setItem('portal_user', JSON.stringify(data.data.user));
            // Reload atau update context agar state login berubah
            // window.location.href = '/'; 
          }
        } else {
          setStatus('error');
          setMessage(data.message || 'Verifikasi gagal. Token mungkin sudah kedaluwarsa.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Terjadi kesalahan jaringan. Silakan coba lagi nanti.');
      }
    };

    verifyToken();
  }, [searchParams]);

  const handleContinue = () => {
    if (status === 'success') {
      navigate('/'); // Ke Home jika sukses
    } else {
      navigate('/'); // Atau buka dialog login
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-blue-600">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 bg-blue-50 p-3 rounded-full w-fit">
            {status === 'loading' && <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />}
            {status === 'success' && <CheckCircle2 className="h-8 w-8 text-green-600" />}
            {status === 'error' && <XCircle className="h-8 w-8 text-red-600" />}
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            {status === 'loading' && 'Verifikasi Email'}
            {status === 'success' && 'Verifikasi Berhasil'}
            {status === 'error' && 'Verifikasi Gagal'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6 pt-2">
          <p className="text-gray-600">
            {message}
          </p>

          {status !== 'loading' && (
            <Button 
              onClick={handleContinue} 
              className={`w-full ${status === 'success' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'}`}
            >
              {status === 'success' ? 'Lanjut ke Dashboard' : 'Kembali ke Beranda'}
            </Button>
          )}
          
          {status === 'error' && (
            <div className="text-sm text-gray-500 mt-4 bg-gray-100 p-3 rounded-md">
              <p className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                Butuh bantuan? Hubungi admin.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}