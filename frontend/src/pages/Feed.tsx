import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Bell, 
  Mail, 
  User, 
  LogOut
} from 'lucide-react';
import Layout from '../components/ui/Layout';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import TweetComposer from '../components/tweet/TweetComposer';
import TweetList from '../components/tweet/TweetList';
import SuggestedUsers from '../components/user/SuggestedUsers';
import api from '../services/api';
import { getAvatarUrl } from '../utils/avatar';

interface Tweet {
  id: number;
  content: string;
  image?: string;
  location?: string;
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchTweets();
  }, []);

  const fetchTweets = async (): Promise<void> => {
    try {
      const response = await api.get('/tweets/feed/');
      setTweets(response.data);
    } catch (err) {
      setError('Erro ao carregar tweets');
      console.error('Failed to fetch tweets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTweet = async (data: { content: string; image?: File; location?: string }): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('content', data.content);
      
      if (data.image) {
        formData.append('image', data.image);
      }
      
      if (data.location) {
        formData.append('location', data.location);
      }

      const response = await api.post('/tweets/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setTweets([response.data, ...tweets]);
    } catch (err) {
      setError('Erro ao criar tweet');
      console.error('Failed to create tweet:', err);
    }
  };

  const handleLike = async (tweetId: number): Promise<void> => {
    try {
      await api.post(`/tweets/${tweetId}/like/`);
      // Atualizar contador local
      setTweets(tweets.map(tweet => 
        tweet.id === tweetId 
          ? { ...tweet, likes: tweet.likes + 1 }
          : tweet
      ));
    } catch (err) {
      console.error('Failed to like tweet:', err);
    }
  };

  const handleRetweet = async (tweetId: number): Promise<void> => {
    try {
      await api.post(`/tweets/${tweetId}/retweet/`);
      // Atualizar contador local
      setTweets(tweets.map(tweet => 
        tweet.id === tweetId 
          ? { ...tweet, retweets: tweet.retweets + 1 }
          : tweet
      ));
    } catch (err) {
      console.error('Failed to retweet:', err);
    }
  };

  const handleReply = (tweetId: number): void => {
    // Implementar modal de resposta
    console.log('Reply to tweet:', tweetId);
  };

  const handleShare = (tweetId: number): void => {
    // Implementar compartilhamento
    const tweetUrl = `${window.location.origin}/tweet/${tweetId}`;
    navigator.clipboard.writeText(tweetUrl);
    console.log('Tweet shared:', tweetUrl);
  };

  const handleUserClick = (userId: number): void => {
    navigate(`/user/${userId}`);
  };

  const handleCommentAdded = (tweetId: number): void => {
    // Atualizar o contador de replies do tweet específico
    setTweets(tweets.map(tweet =>
      tweet.id === tweetId
        ? { ...tweet, replies: tweet.replies + 1 }
        : tweet
    ));
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
      <div className="max-w-4xl mx-auto flex">
        {/* Main Content */}
        <div className="flex-1 max-w-2xl">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <h1 className="text-xl font-bold text-gray-900">Home</h1>
          </div>

          {/* Tweet Composer */}
          {user && (
            <TweetComposer
              user={user}
              onSubmit={handleCreateTweet}
              loading={loading}
            />
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
              {error}
            </div>
          )}

          {/* Tweets */}
          <TweetList
            tweets={tweets}
            onLike={handleLike}
            onRetweet={handleRetweet}
            onReply={handleReply}
            onShare={handleShare}
            currentUser={user || undefined}
            onCommentAdded={handleCommentAdded}
          />
        </div>

        {/* Right Sidebar */}
        <div className="w-80 ml-6 space-y-4">
          {/* Suggested Users */}
          {user && (
            <SuggestedUsers onUserClick={handleUserClick} />
          )}
          
          {/* Trending Topics (placeholder) */}
          <div className="bg-white rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assuntos do momento</h3>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">#tecnologia</div>
              <div className="text-sm text-gray-600">#programação</div>
              <div className="text-sm text-gray-600">#django</div>
              <div className="text-sm text-gray-600">#react</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Feed;