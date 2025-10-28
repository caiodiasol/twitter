import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, UserMinus, Users, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/ui/Layout';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import TweetList from '../components/tweet/TweetList';
import { getAvatarUrl } from '../utils/avatar';
import api from '../services/api';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio?: string;
  avatar?: string;
  followers_count?: number;
  following_count?: number;
  tweets_count?: number;
}

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

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tweetsLoading, setTweetsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserTweets();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${userId}/`);
      setProfile(response.data);
      
      // Verificar se o usuário atual está seguindo este usuário
      if (currentUser?.id !== response.data.id) {
        checkFollowingStatus(response.data.id);
      }
    } catch (err) {
      setError('Erro ao carregar perfil do usuário');
      console.error('Failed to fetch user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTweets = async () => {
    try {
      setTweetsLoading(true);
      const response = await api.get(`/users/${userId}/tweets/`);
      setTweets(response.data);
    } catch (err) {
      console.error('Failed to fetch user tweets:', err);
    } finally {
      setTweetsLoading(false);
    }
  };

  const checkFollowingStatus = async (userId: number) => {
    try {
      const response = await api.get('/users/following/');
      const followingIds = response.data.map((user: any) => user.id);
      setIsFollowing(followingIds.includes(userId));
    } catch (err) {
      console.error('Failed to check following status:', err);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;
    
    try {
      await api.post(`/users/${profile.id}/follow/`);
      setIsFollowing(true);
      // Atualizar contador de seguidores
      setProfile(prev => prev ? { ...prev, followers_count: (prev.followers_count || 0) + 1 } : null);
    } catch (err) {
      console.error('Failed to follow user:', err);
    }
  };

  const handleUnfollow = async () => {
    if (!profile) return;
    
    try {
      await api.delete(`/users/${profile.id}/unfollow/`);
      setIsFollowing(false);
      // Atualizar contador de seguidores
      setProfile(prev => prev ? { ...prev, followers_count: Math.max((prev.followers_count || 0) - 1, 0) } : null);
    } catch (err) {
      console.error('Failed to unfollow user:', err);
    }
  };

  const handleLike = async (tweetId: number) => {
    try {
      await api.post(`/tweets/${tweetId}/like/`);
      setTweets(tweets.map(tweet => 
        tweet.id === tweetId 
          ? { ...tweet, likes: tweet.likes + 1 }
          : tweet
      ));
    } catch (err) {
      console.error('Failed to like tweet:', err);
    }
  };

  const handleRetweet = async (tweetId: number) => {
    try {
      await api.post(`/tweets/${tweetId}/retweet/`);
      setTweets(tweets.map(tweet => 
        tweet.id === tweetId 
          ? { ...tweet, retweets: tweet.retweets + 1 }
          : tweet
      ));
    } catch (err) {
      console.error('Failed to retweet:', err);
    }
  };

  const handleReply = (tweetId: number) => {
    console.log('Reply to tweet:', tweetId);
  };

  const handleShare = (tweetId: number) => {
    const tweetUrl = `${window.location.origin}/tweet/${tweetId}`;
    navigator.clipboard.writeText(tweetUrl);
    console.log('Tweet shared:', tweetUrl);
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
          onClick={() => navigate('/')}
        >
          Home
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => navigate('/profile')}
        >
          Meu Perfil
        </Button>
      </nav>

      {/* Current User Info */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            {getAvatarUrl(currentUser?.avatar) ? (
              <img 
                src={getAvatarUrl(currentUser?.avatar)!} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-600 font-medium text-sm">
                {currentUser?.username?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{currentUser?.first_name} {currentUser?.last_name}</p>
            <p className="text-xs text-gray-500">@{currentUser?.username}</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout sidebar={<Sidebar />}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Carregando perfil...</div>
        </div>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout sidebar={<Sidebar />}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Usuário não encontrado</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/')}>
              Voltar ao início
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <Layout sidebar={<Sidebar />}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              icon={ArrowLeft} 
              onClick={() => navigate('/')}
            >
              Voltar
            </Button>
            <h1 className="text-xl font-bold text-gray-900">
              {profile.first_name} {profile.last_name}
            </h1>
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                {getAvatarUrl(profile.avatar) ? (
                  <img 
                    src={getAvatarUrl(profile.avatar)!} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-gray-600" />
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="text-gray-500">@{profile.username}</p>
                {profile.bio && (
                  <p className="mt-2 text-gray-700">{profile.bio}</p>
                )}
              </div>
            </div>

            {/* Follow Button */}
            {!isOwnProfile && (
              <Button
                variant={isFollowing ? "secondary" : "primary"}
                icon={isFollowing ? UserMinus : UserPlus}
                onClick={isFollowing ? handleUnfollow : handleFollow}
              >
                {isFollowing ? 'Seguindo' : 'Seguir'}
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                <span className="font-semibold">{profile.followers_count || 0}</span> seguidores
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                <span className="font-semibold">{profile.following_count || 0}</span> seguindo
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{profile.tweets_count || tweets.length}</span> tweets
            </div>
          </div>
        </div>

        {/* Tweets */}
        <div className="bg-white">
          <div className="border-b border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900">Tweets</h3>
          </div>
          
          {tweetsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-lg">Carregando tweets...</div>
            </div>
          ) : (
            <TweetList 
              tweets={tweets} 
              onLike={handleLike}
              onRetweet={handleRetweet}
              onReply={handleReply}
              onShare={handleShare}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserProfilePage;
