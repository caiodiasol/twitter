/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { getAvatarUrl } from '../../utils/avatar';
import api from '../../services/api';

interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  created_at: string;
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

interface CommentsModalProps {
  tweet: Tweet;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    id: number;
    username: string;
    avatar?: string;
    first_name: string;
    last_name: string;
  };
  onCommentAdded?: (tweetId: number) => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  tweet,
  isOpen,
  onClose,
  currentUser,
  onCommentAdded,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, tweet.id]);

  const fetchComments = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get(`/tweets/${tweet.id}/comments/`);
      setComments(response.data);
    } catch (err) {
      setError('Erro ao carregar comentários');
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    try {
      setSubmitting(true);
      setError('');

      const response = await api.post(`/tweets/${tweet.id}/comment/`, {
        content: newComment.trim(),
      });

      setComments([response.data, ...comments]);
      setNewComment('');

      // Notificar o componente pai que um comentário foi adicionado
      if (onCommentAdded) {
        onCommentAdded(tweet.id);
      }
    } catch (err) {
      setError('Erro ao enviar comentário');
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return 'Agora mesmo';
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">Comentários</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tweet */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-3">
            {/* Tweet Author Avatar */}
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              {getAvatarUrl(tweet.author?.avatar) ? (
                <img
                  src={getAvatarUrl(tweet.author?.avatar)!}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-medium">
                  {tweet.author?.username?.charAt(0).toUpperCase() || '?'}
                </span>
              )}
            </div>

            {/* Tweet Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900">
                  {tweet.author?.first_name} {tweet.author?.last_name}
                </p>
                <span className="text-gray-500">·</span>
                <p className="text-sm text-gray-500">
                  @{tweet.author?.username}
                </p>
                <span className="text-gray-500">·</span>
                <p className="text-sm text-gray-500">
                  {formatDate(tweet.timestamp)}
                </p>
              </div>

              <p className="mt-1 text-gray-900">{tweet.content}</p>

              {tweet.image && (
                <div className="mt-3">
                  <img
                    src={getAvatarUrl(tweet.image)!}
                    alt="Tweet content"
                    className="rounded-lg max-h-60 w-full object-cover"
                  />
                </div>
              )}

              {tweet.location && (
                <div className="flex items-center text-gray-500 text-sm mt-2">
                  <span>{tweet.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Carregando comentários...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : comments.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhum comentário ainda</p>
              <p className="text-sm">Seja o primeiro a comentar!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {comments.map(comment => (
                <div key={comment.id} className="p-4">
                  <div className="flex space-x-3">
                    {/* Comment Author Avatar */}
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {getAvatarUrl(comment.author.avatar) ? (
                        <img
                          src={getAvatarUrl(comment.author.avatar)!}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-medium text-sm">
                          {comment.author.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {comment.author.first_name} {comment.author.last_name}
                        </p>
                        <span className="text-gray-500">·</span>
                        <p className="text-sm text-gray-500">
                          @{comment.author.username}
                        </p>
                        <span className="text-gray-500">·</span>
                        <p className="text-sm text-gray-500">
                          {formatDate(comment.created_at)}
                        </p>
                      </div>

                      <p className="mt-1 text-gray-900">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Form */}
        {currentUser && (
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSubmitComment}>
              <div className="flex space-x-3">
                {/* Current User Avatar */}
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {getAvatarUrl(currentUser.avatar) ? (
                    <img
                      src={getAvatarUrl(currentUser.avatar)!}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-medium text-sm">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Comment Input */}
                <div className="flex-1 flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Escreva um comentário..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={submitting}
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                  >
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline">Enviar</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsModal;
