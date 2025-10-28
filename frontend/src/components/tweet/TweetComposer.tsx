import React, { useState, useRef } from 'react';
import { Image, MapPin, Smile, Calendar, X } from 'lucide-react';
import { getAvatarUrl } from '../../utils/avatar';

interface TweetComposerProps {
  user: {
    username: string;
    avatar?: string;
    first_name: string;
    last_name: string;
  };
  onSubmit: (data: { content: string; image?: File; location?: string }) => void;
  loading?: boolean;
}

const TweetComposer: React.FC<TweetComposerProps> = ({ user, onSubmit, loading = false }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() || image) {
      onSubmit({ content, image: image || undefined, location: location || undefined });
      setContent('');
      setImage(null);
      setImagePreview(null);
      setLocation('');
      setShowLocationInput(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const isDisabled = (!content.trim() && !image) || loading;

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              {getAvatarUrl(user.avatar) ? (
                <img 
                  src={getAvatarUrl(user.avatar)!} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Text Input */}
            <textarea
              className="w-full p-3 border-none resize-none focus:outline-none text-lg placeholder-gray-500"
              rows={3}
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative mb-3">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full max-w-md rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Location Input */}
            {showLocationInput && (
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Add location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-4">
                {/* Image Upload */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center w-8 h-8 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <Image className="h-5 w-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {/* Emoji */}
                <button
                  type="button"
                  className="flex items-center justify-center w-8 h-8 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <Smile className="h-5 w-5" />
                </button>

                {/* Calendar */}
                <button
                  type="button"
                  className="flex items-center justify-center w-8 h-8 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <Calendar className="h-5 w-5" />
                </button>

                {/* Location */}
                <button
                  type="button"
                  onClick={() => setShowLocationInput(!showLocationInput)}
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                    showLocationInput 
                      ? 'text-blue-500 bg-blue-50' 
                      : 'text-blue-500 hover:bg-blue-50'
                  }`}
                >
                  <MapPin className="h-5 w-5" />
                </button>
              </div>

              {/* Tweet Button */}
              <button
                type="submit"
                disabled={isDisabled}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  isDisabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Tweet
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TweetComposer;
