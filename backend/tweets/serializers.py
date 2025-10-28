from rest_framework import serializers

from users.serializers import UserSerializer

from .models import Tweet, TweetComment


class TweetSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Tweet
        fields = [
            "id",
            "content",
            "image",
            "location",
            "timestamp",
            "likes",
            "retweets",
            "replies",
            "author",
        ]
        read_only_fields = ["id", "timestamp", "likes", "retweets", "replies", "author"]


class TweetCommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = TweetComment
        fields = ["id", "content", "author", "created_at"]
        read_only_fields = ["id", "author", "created_at"]
