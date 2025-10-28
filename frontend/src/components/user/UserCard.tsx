import React from 'react';
import { UserPlus, UserMinus, User } from 'lucide-react';
import { getAvatarUrl } from '../../utils/avatar';

interface UserCardProps {
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    bio?: string;
    avatar?: string;
  };
  isFollowing?: boolean;
  onFollow?: (userId: number) => void;
  onUnfollow?: (userId: number) => void;
  onUserClick?: (userId: number) => void;
  showFollowButton?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  isFollowing = false,
  onFollow,
  onUnfollow,
  onUserClick,
  showFollowButton = true,
}) => {
  const handleUserClick = () => {
    if (onUserClick) {
      onUserClick(user.id);
    }
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que clique no botão acione o clique no usuário
    if (isFollowing && onUnfollow) {
      onUnfollow(user.id);
    } else if (!isFollowing && onFollow) {
      onFollow(user.id);
    }
  };

  return (
    <div
      className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
      onClick={handleUserClick}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
          {getAvatarUrl(user.avatar) ? (
            <img
              src={getAvatarUrl(user.avatar)!}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="h-6 w-6 text-gray-600" />
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-sm text-gray-500 truncate">@{user.username}</p>
            {user.bio && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {user.bio}
              </p>
            )}
          </div>

          {/* Follow Button */}
          {showFollowButton && (
            <button
              onClick={handleFollowClick}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isFollowing
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserMinus className="h-4 w-4" />
                  <span>Seguindo</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Seguir</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
