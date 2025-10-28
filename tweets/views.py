from rest_framework import viewsets
from .models import Tweet
from .serializers import TweetSerializer

class TweetViewSet(viewsets.ModelViewSet):
    queryset = Tweet.objects.all().order_by('-timestamp')
    serializer_class = TweetSerializer
    
    def perform_create(self, serializer):
        # Auto-preencher o author com o usuário logado
        serializer.save(author=self.request.user)