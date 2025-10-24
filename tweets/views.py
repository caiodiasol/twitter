from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from users.models import UserFollowing
from .models import Tweet, TweetLike
from .serializers import TweetSerializer

class TweetViewSet(viewsets.ModelViewSet):
    queryset = Tweet.objects.all().order_by('-timestamp')
    serializer_class = TweetSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=False, methods=['get'])
    def feed(self, request):
        following = UserFollowing.objects.filter(user=request.user)
        following_users = [f.following_user for f in following]
        
        tweets = Tweet.objects.filter(author__in=following_users).order_by('-timestamp')
        serializer = TweetSerializer(tweets, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        tweet = self.get_object()
        like, created = TweetLike.objects.get_or_create(
            user=request.user,
            tweet=tweet
        )
        if created:
            tweet.likes += 1
            tweet.save()
            return Response({'message': 'Tweet liked'})
        return Response({'message': 'Tweet already liked'})
    
    @action(detail=True, methods=['delete'])
    def unlike(self, request, pk=None):
        tweet = self.get_object()
        try:
            like = TweetLike.objects.get(user=request.user, tweet=tweet)
            like.delete()
            tweet.likes -= 1
            tweet.save()
            return Response({'message': 'Tweet unliked'})
        except TweetLike.DoesNotExist:
            return Response({'error': 'Tweet not liked'}, status=400)