from rest_framework import serializers
from .models import Tweet

class TweetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tweet
        fields = ['id', 'content', 'timestamp', 'likes', 'retweets', 'replies']
        read_only_fields = ['id', 'timestamp', 'likes', 'retweets', 'replies']