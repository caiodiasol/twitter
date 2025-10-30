/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Users, RefreshCw } from 'lucide-react';
import UserCard from './UserCard';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface SuggestedUsersProps {
  onUserClick?: (userId: number) => void;
}

const SuggestedUsers: React.FC<SuggestedUsersProps> = ({ onUserClick }) => {
  const { user: currentUser } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [following, setFollowing] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const init = async () => {
      await fetchFollowing();
      await fetchSuggestedUsers();
    };
    init();
    // reavaliar quando o usuário atual mudar
  }, [currentUser?.id]);

  const fetchSuggestedUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/');
      // Filtrar o usuário atual e usuários já seguidos
      const filteredUsers = response.data.filter(
        (user: any) => user.id !== currentUser?.id && !following.has(user.id)
      );
      // Pegar apenas os primeiros 5 usuários
      setSuggestedUsers(filteredUsers.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch suggested users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewUserToSuggest = async () => {
    try {
      const response = await api.get('/users/');
      // Filtrar o usuário atual, usuários já seguidos e usuários já na lista de sugestões
      const currentSuggestionIds = new Set(suggestedUsers.map(user => user.id));
      const filteredUsers = response.data.filter(
        (user: any) =>
          user.id !== currentUser?.id &&
          !following.has(user.id) &&
          !currentSuggestionIds.has(user.id)
      );

      // Se há usuários disponíveis, adicionar o primeiro à lista
      if (filteredUsers.length > 0) {
        setSuggestedUsers(prev => [...prev, filteredUsers[0]]);
      }
    } catch (error) {
      console.error('Failed to fetch new user suggestion:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await api.get('/users/following/');
      const followingIds = new Set<number>(
        response.data.map((user: any) => user.id as number)
      );
      setFollowing(followingIds);
    } catch (error) {
      console.error('Failed to fetch following:', error);
    }
  };

  const handleFollow = async (userId: number) => {
    try {
      await api.post(`/users/${userId}/follow/`);
      setFollowing(prev => new Set([...Array.from(prev), userId]));

      // Remover usuário da lista de sugestões
      setSuggestedUsers(prev => prev.filter(user => user.id !== userId));

      // Buscar um novo usuário para substituir
      await fetchNewUserToSuggest();
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const handleUnfollow = async (userId: number) => {
    try {
      await api.delete(`/users/${userId}/unfollow/`);
      setFollowing(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(userId);
        return newSet;
      });
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Atualizar lista de seguindo primeiro
    await fetchFollowing();
    // Depois buscar novas sugestões baseadas na lista atualizada
    await fetchSuggestedUsers();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Sugestões para você
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center space-x-3 p-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (suggestedUsers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Sugestões para você
            </h3>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
        <p className="text-gray-500 text-center py-4">
          Não há mais usuários para sugerir no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Sugestões para você
          </h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      <div className="space-y-1">
        {suggestedUsers.map(user => (
          <UserCard
            key={user.id}
            user={user}
            isFollowing={following.has(user.id)}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            onUserClick={onUserClick}
            showFollowButton={true}
          />
        ))}
      </div>
    </div>
  );
};

export default SuggestedUsers;
