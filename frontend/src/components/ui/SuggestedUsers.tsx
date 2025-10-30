/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Users } from 'lucide-react';
import { getAvatarUrl } from '../../utils/avatar';
import api from '../../services/api';

interface SuggestedUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  bio?: string;
}

interface SuggestedUsersProps {
  currentUserId: number;
}

const SuggestedUsers: React.FC<SuggestedUsersProps> = ({ currentUserId }) => {
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [following, setFollowing] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestedUsers();
    fetchFollowing();
  }, []);

  const fetchSuggestedUsers = async (): Promise<void> => {
    try {
      const response = await api.get('/users/');
      // Filtrar o usuário atual e usuários já seguidos
      const allUsers = response.data.filter(
        (user: SuggestedUser) => user.id !== currentUserId
      );
      setSuggestedUsers(allUsers.slice(0, 5)); // Mostrar apenas 5 sugestões
    } catch (err) {
      console.error('Failed to fetch suggested users:', err);
    }
  };

  const fetchFollowing = async (): Promise<void> => {
    try {
      const response = await api.get('/users/following/');
      const followingIds = response.data.map((user: SuggestedUser) => user.id);
      setFollowing(followingIds);
    } catch (err) {
      console.error('Failed to fetch following:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: number): Promise<void> => {
    try {
      await api.post(`/users/${userId}/follow/`);
      setFollowing([...following, userId]);
    } catch (err) {
      console.error('Failed to follow user:', err);
    }
  };

  const handleUnfollow = async (userId: number): Promise<void> => {
    try {
      await api.delete(`/users/${userId}/unfollow/`);
      setFollowing(following.filter(id => id !== userId));
    } catch (err) {
      console.error('Failed to unfollow user:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Seguestões de usuários
        </h3>
      </div>

      <div className="space-y-3">
        {suggestedUsers.map(user => {
          const isFollowing = following.includes(user.id);

          return (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {/* Avatar */}
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {getAvatarUrl(user.avatar) ? (
                    <img
                      src={getAvatarUrl(user.avatar)!}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-medium text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    @{user.username}
                  </p>
                  {user.bio && (
                    <p className="text-xs text-gray-600 truncate mt-1">
                      {user.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Follow Button */}
              <button
                onClick={() =>
                  isFollowing ? handleUnfollow(user.id) : handleFollow(user.id)
                }
                className={`px-5 py-1 rounded-full text-xs font-medium transition-colors flex-shrink-0 flex items-center ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="h-3 w-4 mr-1" />
                    Seguindo
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3 w-4 mr-1" />
                    Seguir
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {suggestedUsers.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          Nenhuma sugestão disponível
        </p>
      )}
    </div>
  );
};

export default SuggestedUsers;
