from rest_framework import serializers
from .models import Tweet, TweetComment

class TweetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tweet
        fields = ['id', 'content', 'timestamp', 'likes', 'retweets', 'replies']
        read_only_fields = ['id', 'timestamp', 'likes', 'retweets', 'replies']

class TweetCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TweetComment
        fields = ['id', 'content', 'author', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']