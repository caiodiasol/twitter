import React, { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  Bell,
  Mail,
  User,
  LogOut,
  Camera,
  Save,
  ArrowLeft,
} from 'lucide-react';
import Layout from '../components/ui/Layout';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import Input from '../components/ui/Input';
import api from '../services/api';
import { getAvatarUrl } from '../utils/avatar';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio?: string;
  avatar?: string;
}

interface UserStats {
  tweets_count: number;
  following_count: number;
  followers_count: number;
}

const Profile: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    email: '',
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async (): Promise<void> => {
    try {
      const response = await api.get('/users/me/');
      const userData = response.data;
      setProfile(userData);
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        bio: userData.bio || '',
        email: userData.email || '',
      });
      if (userData.avatar) {
        setAvatarPreview(getAvatarUrl(userData.avatar) || '');
      }
    } catch (err) {
      setError('Erro ao carregar perfil');
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (): Promise<void> => {
    try {
      const response = await api.get(`/users/${user?.id}/stats/`);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('email', formData.email);

      // Se há uma nova imagem de avatar
      const avatarInput = document.getElementById('avatar') as HTMLInputElement;
      if (avatarInput?.files?.[0]) {
        formDataToSend.append('avatar', avatarInput.files[0]);
      }

      const response = await api.put('/users/update_profile/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfile(response.data);
      updateUser(response.data);
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err: any) {
      if (err.response?.data) {
        const errors = err.response.data;
        if (typeof errors === 'object') {
          const errorMessages = Object.values(errors).flat();
          setError(errorMessages.join(', '));
        } else {
          setError(errors);
        }
      } else {
        setError('Erro ao atualizar perfil');
      }
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = (): void => {
    logout();
    navigate('/signin');
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <div className="flex items-center space-x-2 mb-8">
        <Logo size={32} />
        <span className="text-xl font-bold text-gray-900">Twitter</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          icon={Home}
          onClick={() => navigate('/')}
        >
          Home
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          icon={Search}
          onClick={() => {
            /* Navigate to explore */
          }}
        >
          Explore
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          icon={Bell}
          onClick={() => {
            /* Navigate to notifications */
          }}
        >
          Notifications
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          icon={Mail}
          onClick={() => {
            /* Navigate to messages */
          }}
        >
          Messages
        </Button>

        <Button variant="primary" className="w-full justify-start" icon={User}>
          Profile
        </Button>
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            {getAvatarUrl(user?.avatar) ? (
              <img
                src={getAvatarUrl(user?.avatar)!}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-600 font-medium text-sm">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500">@{user?.username}</p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full justify-start"
          icon={LogOut}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <Layout sidebar={<Sidebar />}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              icon={ArrowLeft}
              onClick={() => navigate('/')}
            >
              Voltar
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Perfil</h1>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white p-6">
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-medium text-2xl">
                      {profile?.username?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <label
                  htmlFor="avatar"
                  className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </label>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                <p className="text-gray-500">@{profile?.username}</p>
              </div>
            </div>

            {/* Stats Section */}
            {stats && (
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.tweets_count}
                    </div>
                    <div className="text-sm text-gray-500">Tweets</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.following_count}
                    </div>
                    <div className="text-sm text-gray-500">Seguindo</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.followers_count}
                    </div>
                    <div className="text-sm text-gray-500">Seguidores</div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nome"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Seu nome"
              />

              <Input
                label="Sobrenome"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Seu sobrenome"
              />
            </div>

            <div>
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biografia
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Conte um pouco sobre você..."
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.bio.length}/160 caracteres
              </p>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={saving} icon={Save}>
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
