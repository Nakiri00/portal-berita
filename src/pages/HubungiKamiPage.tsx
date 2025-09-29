import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

export function HubungiKamiPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Pesan Anda telah terkirim! Kami akan segera merespons.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Hubungi Kami</h1>
        <p className="text-lg text-gray-600">
          Ada pertanyaan atau saran? Jangan ragu untuk menghubungi tim Kamus Mahasiswa!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div>
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Informasi Kontak</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-gray-600">info@kamusmahasiswa.ac.id</p>
                  <p className="text-gray-600">redaksi@kamusmahasiswa.ac.id</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Telepon</p>
                  <p className="text-gray-600">+62 21 1234-5678</p>
                  <p className="text-gray-600">+62 812-3456-7890 (WhatsApp)</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Alamat</p>
                  <p className="text-gray-600">
                    Gedung Media Center Lt. 3<br />
                    Jl. Pendidikan No. 123<br />
                    Jakarta Pusat 10110
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Jam Operasional</p>
                  <p className="text-gray-600">Senin - Jumat: 08:00 - 17:00 WIB</p>
                  <p className="text-gray-600">Sabtu: 08:00 - 14:00 WIB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ikuti Kami</h3>
            <div className="flex space-x-3">
              <a 
                href="#" 
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.342-1.297-.894-.808-1.297-1.954-1.297-3.342 0-1.297.49-2.448 1.297-3.342.808-.894 1.954-1.297 3.342-1.297 1.297 0 2.448.49 3.342 1.297.894.808 1.297 1.954 1.297 3.342 0 1.297-.49 2.448-1.297 3.342-.808.894-1.954 1.297-3.342 1.297z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
                aria-label="Twitter"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Kirim Pesan</CardTitle>
            <CardDescription>
              Sampaikan pertanyaan, saran, atau kritik Anda kepada kami
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subjek
                </label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Subjek pesan"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Pesan
                </label>
                <Textarea
                  id="message"
                  rows={5}
                  placeholder="Tulis pesan Anda di sini..."
                  required
                />
              </div>
              
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Kirim Pesan
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}