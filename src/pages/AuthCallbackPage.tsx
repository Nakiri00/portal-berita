import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const token = searchParams.get('token');
        const provider = searchParams.get('provider');
        const error = searchParams.get('error');
        const isDev = searchParams.get('dev') === 'true';

        if (error) {
          // Handle OAuth errors
          switch (error) {
            case 'google_not_configured':
              toast.error('Google OAuth belum dikonfigurasi. Menggunakan mode development.');
              break;
            case 'facebook_not_configured':
              toast.error('Facebook OAuth belum dikonfigurasi. Menggunakan mode development.');
              break;
            case 'google_failed':
            case 'facebook_failed':
              toast.error('Gagal login dengan akun sosial media');
              break;
            case 'google_callback_failed':
            case 'facebook_callback_failed':
              toast.error('Terjadi kesalahan saat memproses login');
              break;
            case 'dev_google_failed':
            case 'dev_facebook_failed':
              toast.error('Gagal login dengan mode development');
              break;
            default:
              toast.error('Terjadi kesalahan saat login');
          }
          navigate('/');
          return;
        }

        if (token && provider) {
          // Login with the token from OAuth
          const result = await loginWithToken(token);
          
          if (result.success) {
            const providerName = provider === 'google' ? 'Google' : 'Facebook';
            const modeText = isDev ? ' (Development Mode)' : '';
            toast.success(`Login berhasil dengan ${providerName}${modeText}!`);
            navigate('/');
          } else {
            toast.error('Gagal memproses login');
            navigate('/');
          }
        } else {
          toast.error('Token tidak ditemukan');
          navigate('/');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error('Terjadi kesalahan saat memproses login');
        navigate('/');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, loginWithToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Memproses Login...
          </h2>
          <p className="text-gray-600">
            Mohon tunggu sebentar, kami sedang memproses login Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
