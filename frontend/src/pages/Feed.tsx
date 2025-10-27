import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Bell, 
  Mail, 
  User, 
  LogOut,
  Plus
} from 'lucide-react';
import Layout from '../components/ui/Layout';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import TweetList from '../components/tweet/TweetList';
import api from '../services/api';

interface Tweet {
  id: number;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
  author?: {
    id: number;
    username: string;
    avatar?: string;
    first_name: string;
    last_name: string;
  };
}

const Feed: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [newTweet, setNewTweet] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchTweets();
  }, []);

  const fetchTweets = async (): Promise<void> => {
    try {
      const response = await api.get('/tweets/');
      setTweets(response.data);
    } catch (err) {
      setError('Erro ao carregar tweets');
      console.error('Failed to fetch tweets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTweet = async (): Promise<void> => {
    if (!newTweet.trim()) return;

    try {
      const response = await api.post('/tweets/', { content: newTweet });
      setTweets([response.data, ...tweets]);
      setNewTweet('');
    } catch (err) {
      setError('Erro ao criar tweet');
      console.error('Failed to create tweet:', err);
    }
  };

  const handleLogout = (): void => {
    logout();
    navigate('/signin');
  };

// Feed.tsx - Sidebar completo corrigido
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
        variant="primary"
        className="w-full justify-start"
        icon={Home}
      >
        Home
      </Button>
      
      <Button
        variant="outline"
        className="w-full justify-start"
        icon={Search}
        onClick={() => {/* Navigate to explore */}}
      >
        Explore
      </Button>
      
      <Button
        variant="outline"
        className="w-full justify-start"
        icon={Bell}
        onClick={() => {/* Navigate to notifications */}}
      >
        Notifications
      </Button>
      
      <Button
        variant="outline"
        className="w-full justify-start"
        icon={Mail}
        onClick={() => {/* Navigate to messages */}}
      >
        Messages
      </Button>
      
      <Button
        variant="outline"
        className="w-full justify-start"
        icon={User}
        onClick={() => navigate('/profile')}
      >
        Profile
      </Button>
    </nav>

    {/* User Info & Logout */}
    <div className="border-t border-gray-200 pt-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
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
          <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
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
          <h1 className="text-xl font-bold text-gray-900">Home</h1>
        </div>

        {/* Tweet Composer */}
        <div className="bg-white border-b border-gray-200 p-4">
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="O que está acontecendo?"
            value={newTweet}
            onChange={(e) => setNewTweet(e.target.value)}
          />
          <div className="flex justify-end mt-3">
            <Button onClick={handleCreateTweet}>
              <Plus className="mr-2 h-4 w-4" />
              Tweet
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
            {error}
          </div>
        )}

        {/* Tweets */}
        <TweetList tweets={tweets} />
      </div>
    </Layout>
  );
};

export default Feed;