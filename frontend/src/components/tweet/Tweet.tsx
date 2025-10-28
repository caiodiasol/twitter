import React, { useState } from 'react';
import { Heart, MessageCircle, Repeat2, Share, MapPin } from 'lucide-react';
import { getAvatarUrl } from '../../utils/avatar';
import CommentsModal from './CommentsModal';

interface TweetProps {
  id: number;
  content: string;
  image?: string;
  location?: string;
  author?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
  onLike?: (id: number) => void;
  onRetweet?: (id: number) => void;
  onReply?: (id: number) => void;
  onShare?: (id: number) => void;
  currentUser?: {
    id: number;
    username: string;
    avatar?: string;
    first_name: string;
    last_name: string;
  };
  onCommentAdded?: (tweetId: number) => void;
}

const Tweet: React.FC<TweetProps> = ({
  id,
  content,
  image,
  location,
  author,
  timestamp,
  likes,
  retweets,
  replies,
  onLike,
  onRetweet,
  onReply,
  onShare,
  currentUser,
  onCommentAdded
}) => {
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
      <div className="flex space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            {getAvatarUrl(author?.avatar) ? (
              <img 
                src={getAvatarUrl(author?.avatar)!} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-600 font-medium">
                {author?.username?.charAt(0).toUpperCase() || '?'}
              </span>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900">
              {author?.first_name} {author?.last_name}
            </p>
            <span className="text-gray-500">·</span>
            <p className="text-sm text-gray-500">@{author?.username || 'Usuário Desconhecido'}</p>
            <span className="text-gray-500">·</span>
            <p className="text-sm text-gray-500">
              {new Date(timestamp).toLocaleDateString('pt-BR')}
            </p>
          </div>
          
          <p className="mt-1 text-gray-900">{content}</p>
          
          {/* Image */}
          {image && (
            <div className="mt-3">
              <img 
                src={getAvatarUrl(image) || image} 
                alt="Tweet image" 
                className="w-full max-w-md rounded-lg object-cover"
              />
            </div>
          )}
          
          {/* Location */}
          {location && (
            <div className="mt-2 flex items-center text-gray-500 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{location}</span>
            </div>
          )}
          
          {/* Actions */}
          <div className="mt-3 flex items-center space-x-6 text-gray-500">
            {/* Comments */}
            <button 
              onClick={() => setIsCommentsModalOpen(true)}
              className="flex items-center space-x-2 hover:text-blue-500 transition-colors group px-2 py-1 rounded-full hover:bg-blue-50"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{replies}</span>
            </button>
            
            {/* Retweet */}
            <button 
              onClick={() => onRetweet?.(id)}
              className="flex items-center space-x-2 hover:text-green-500 transition-colors group px-2 py-1 rounded-full hover:bg-green-50"
            >
              <Repeat2 className="h-5 w-5" />
              <span className="text-sm font-medium">{retweets}</span>
            </button>
            
            {/* Like */}
            <button 
              onClick={() => onLike?.(id)}
              className="flex items-center space-x-2 hover:text-red-500 transition-colors group px-2 py-1 rounded-full hover:bg-red-50"
            >
              <Heart className="h-5 w-5" />
              <span className="text-sm font-medium">{likes}</span>
            </button>
            
            {/* Share */}
            <button 
              onClick={() => onShare?.(id)}
              className="flex items-center space-x-2 hover:text-blue-500 transition-colors group px-2 py-1 rounded-full hover:bg-blue-50"
            >
              <Share className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      {currentUser && (
        <CommentsModal
          tweet={{
            id,
            content,
            image,
            location,
            timestamp,
            likes,
            retweets,
            replies,
            author
          }}
          isOpen={isCommentsModalOpen}
          onClose={() => setIsCommentsModalOpen(false)}
          currentUser={currentUser}
          onCommentAdded={onCommentAdded}
        />
      )}
    </div>
  );
};

export default Tweet;