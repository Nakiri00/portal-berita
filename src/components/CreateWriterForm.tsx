import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { adminCreateUser } from '../services/userService'; 
import { toast } from 'sonner';

export function CreateWriterForm() { 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // State default 'intern' atau 'writer'
  const [role, setRole] = useState<'intern' | 'writer' | 'editor' | 'admin'>('writer');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      toast.error('Semua field harus diisi');
      return;
    }

    if (password.length < 8) {
      toast.error('Password minimal harus 8 karakter');
      return;
    }

    setIsLoading(true);
    try {
      // Mengirim role yang dipilih ke service
      const result = await adminCreateUser({ name, email, password, role });

      if (result.success) {
        toast.success(`Akun ${role} berhasil dibuat!`);
        setName('');
        setEmail('');
        setPassword('');
        setRole('writer'); // Reset ke default
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Akun Tim Baru</CardTitle>
        <CardDescription>
          Buat akun untuk Intern, Writer, Editor, atau Admin tambahan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            {/* Input Role Selection */}
            <div className="space-y-2">
              <Label>Role / Jabatan</Label>
              <Select 
                value={role} 
                onValueChange={(value: any) => setRole(value)} 
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intern">Intern (Magang)</SelectItem>
                  <SelectItem value="writer">Writer (Penulis Tetap)</SelectItem>
                  <SelectItem value="editor">Editor (Redaktur)</SelectItem>
                  <SelectItem value="admin">Admin (Administrator)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Memproses...' : `Buat Akun ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}