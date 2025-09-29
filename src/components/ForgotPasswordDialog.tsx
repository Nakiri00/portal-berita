import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Mail, CheckCircle } from 'lucide-react';

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ForgotPasswordDialog({ isOpen, onClose, onSuccess }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email diperlukan');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/password/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        if (data.resetLink) {
          setResetLink(data.resetLink);
        }
        onSuccess?.();
      } else {
        setError(data.message || 'Terjadi kesalahan saat mengirim link reset password');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Terjadi kesalahan saat mengirim link reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    setResetLink('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Lupa Password?
          </DialogTitle>
        </DialogHeader>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading || !email}
                className="flex-1"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kirim Link Reset
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Link reset password telah dikirim!</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Silakan cek email Anda untuk mendapatkan link reset password. 
              Link akan berlaku selama 1 jam.
            </p>

            {resetLink && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground mb-2">Development Mode - Reset Link:</p>
                <code className="text-xs break-all">{resetLink}</code>
              </div>
            )}

            <Button onClick={handleClose} className="w-full">
              Tutup
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
