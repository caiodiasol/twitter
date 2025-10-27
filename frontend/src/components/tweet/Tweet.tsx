// Tweet.tsx - Correção para o erro
import React from 'react';
import { Heart, MessageCircle, Repeat2, Share } from 'lucide-react';

interface TweetProps {
  id: number;
  content: string;
  author?: {  // ✅ Tornar author opcional
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
}

// Tweet.tsx - Atualizar para mostrar avatar do autor
const Tweet: React.FC<TweetProps> = ({
  id,
  content,
  author,
  timestamp,
  likes,
  retweets,
  replies,
  onLike,
  onRetweet,
  onReply
}) => {
  return (
    <div className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
      <div className="flex space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            {author?.avatar ? (
              <img 
                src={author.avatar} 
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
          
          {/* Actions */}
          <div className="mt-3 flex items-center space-x-6 text-gray-500">
            {/* ... botões de ação ... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tweet;