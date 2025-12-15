// src/services/userService.ts

import axios from 'axios';

// Tipe data yang diharapkan dari API
export interface WriterProfile {
  _id: string;
  name: string;
  avatar: { url: string }; // Asumsi avatar punya field url
  bio: string;
  joinedAt: string;
  publishedArticles: number;
}

interface UserProfileResponse {
  success: boolean;
  user: WriterProfile;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'intern' | 'writer' | 'editor' | 'admin'; // Tambahkan tipe role
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('portal_token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Fungsi untuk mengambil profil penulis
export const getWriterProfile = async (userId: string): Promise<WriterProfile> => {
  try {
    const response = await axios.get<UserProfileResponse>(`${API_BASE_URL}/user/${userId}`);
    return response.data.user;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Melemparkan pesan error dari backend jika ada
      throw new Error(error.response.data.message || 'Gagal mengambil profil penulis.');
    }
    throw new Error('Terjadi kesalahan jaringan.');
  }
};

export const updateProfile = async (formData: FormData) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(), 
    body: formData 
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Gagal memperbarui profil');
  }

  return response.json();
};

export const adminCreateUser = async (userData: CreateUserData) => {
  const token = localStorage.getItem('portal_token');
  const response = await fetch(`${API_BASE_URL}/admin/create-user`, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Gagal membuat user');
  }

  return data;
};