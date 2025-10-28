from rest_framework import serializers
from .models import User, UserFollowing


class UserSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    tweets_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "bio",
            "avatar",
            "followers_count",
            "following_count",
            "tweets_count",
        ]

    def get_followers_count(self, obj):
        return UserFollowing.objects.filter(following_user=obj).count()

    def get_following_count(self, obj):
        return UserFollowing.objects.filter(user=obj).count()

    def get_tweets_count(self, obj):
        return obj.tweets.count()


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "bio",
            "avatar",
        ]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            bio=validated_data.get("bio", ""),
        )
        return user
