// TweetList.tsx - Correção para o erro
import React from 'react';
import Tweet from './Tweet';

interface TweetData {
  id: number;
  content: string;
  author?: {  // ✅ Tornar author opcional
    id: number;
    username: string;
    avatar?: string;
    first_name: string;
    last_name: string;
  };
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
}

interface TweetListProps {
  tweets: TweetData[];
  onLike?: (id: number) => void;
  onRetweet?: (id: number) => void;
  onReply?: (id: number) => void;
}

const TweetList: React.FC<TweetListProps> = ({ tweets, onLike, onRetweet, onReply }) => {
  if (tweets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">Nenhum tweet encontrado</p>
        <p className="text-gray-400 text-sm mt-2">Seja o primeiro a tweetar!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {tweets.map((tweet) => (
        <Tweet
          key={tweet.id}
          {...tweet}
          onLike={onLike}
          onRetweet={onRetweet}
          onReply={onReply}
        />
      ))}
    </div>
  );
};

export default TweetList;