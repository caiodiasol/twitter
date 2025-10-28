from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from users.models import UserFollowing
from .models import Tweet, TweetLike, TweetRetweet
from .serializers import TweetSerializer, TweetCommentSerializer


class TweetViewSet(viewsets.ModelViewSet):
    queryset = Tweet.objects.all().order_by("-timestamp")
    serializer_class = TweetSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=False, methods=["get"])
    def feed(self, request):
        following = UserFollowing.objects.filter(user=request.user)
        following_users = [f.following_user for f in following]

        # Incluir o próprio usuário logado + usuários seguidos
        all_users = following_users + [request.user]

        tweets = Tweet.objects.filter(author__in=all_users).order_by("-timestamp")
        serializer = TweetSerializer(tweets, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        tweet = self.get_object()
        like, created = TweetLike.objects.get_or_create(user=request.user, tweet=tweet)
        if created:
            tweet.likes += 1
            tweet.save()
            return Response({"message": "Tweet liked"})
        return Response({"message": "Tweet already liked"})

    @action(detail=True, methods=["delete"])
    def unlike(self, request, pk=None):
        tweet = self.get_object()
        try:
            like = TweetLike.objects.get(user=request.user, tweet=tweet)
            like.delete()
            tweet.likes -= 1
            tweet.save()
            return Response({"message": "Tweet unliked"})
        except TweetLike.DoesNotExist:
            return Response({"error": "Tweet not liked"}, status=400)

    # tweets/views.py - Adicionar
    @action(detail=True, methods=["post"])
    def comment(self, request, pk=None):
        tweet = self.get_object()
        serializer = TweetCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user, tweet=tweet)
            # Atualizar contador de replies
            tweet.replies += 1
            tweet.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=["get"])
    def comments(self, request, pk=None):
        tweet = self.get_object()
        comments = tweet.comments.all().order_by("-created_at")
        serializer = TweetCommentSerializer(comments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def retweet(self, request, pk=None):
        original_tweet = self.get_object()
        retweet, created = TweetRetweet.objects.get_or_create(
            user=request.user, tweet=original_tweet
        )
        if created:
            original_tweet.retweets += 1
            original_tweet.save()
            return Response({"message": "Tweet retweeted"})
        return Response({"message": "Tweet already retweeted"})

    @action(detail=True, methods=["delete"])
    def unretweet(self, request, pk=None):
        tweet = self.get_object()
        try:
            retweet = TweetRetweet.objects.get(user=request.user, tweet=tweet)
            retweet.delete()
            tweet.retweets -= 1
            tweet.save()
            return Response({"message": "Retweet removed"})
        except TweetRetweet.DoesNotExist:
            return Response({"error": "Tweet not retweeted"}, status=400)
