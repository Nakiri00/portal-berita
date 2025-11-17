// File: src/components/CreateWriterForm.tsx

import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { adminCreateWriter } from '../services/userService'; // Impor fungsi service
import { toast } from 'sonner';

export function CreateWriterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Semua field harus diisi');
      return;
    }

    if (password.length < 8) {
      toast.error('Password minimal harus 8 karakter');
      return;
    }

    setIsLoading(true);
    try {
      const result = await adminCreateWriter({ name, email, password });

      if (result.success) {
        toast.success(result.message);
        setName('');
        setEmail('');
        setPassword('');
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
        <CardTitle>Buat Akun Penulis Baru</CardTitle>
        <CardDescription>
          Buat akun baru yang akan memiliki role 'writer'.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="penulis@example.com"
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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Membuat...' : 'Buat Akun Penulis'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}