import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Tweet {
  id: number;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
  author?: {
    username: string;
  };
}

const Feed: React.FC = () => {
  const { user, logout } = useAuth();
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

  const handleCreateTweet = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Twitter Clone</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Olá, {user?.username}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Create Tweet Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <form onSubmit={handleCreateTweet}>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="O que está acontecendo?"
              value={newTweet}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewTweet(e.target.value)}
            />
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
              >
                Tweetar
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tweets Feed */}
        <div className="space-y-4">
          {tweets.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <p className="text-gray-500 text-lg">Nenhum tweet encontrado</p>
              <p className="text-gray-400 text-sm mt-2">Seja o primeiro a tweetar!</p>
            </div>
          ) : (
            tweets.map((tweet) => (
              <div key={tweet.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {tweet.author?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        {tweet.author?.username || 'Usuário'}
                      </p>
                      <span className="text-gray-500">·</span>
                      <p className="text-sm text-gray-500">
                        {new Date(tweet.timestamp).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <p className="mt-1 text-gray-900">{tweet.content}</p>
                    <div className="mt-3 flex items-center space-x-6 text-gray-500 text-sm">
                      <span>❤️ {tweet.likes}</span>
                      <span>🔄 {tweet.retweets}</span>
                      <span>💬 {tweet.replies}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Feed;