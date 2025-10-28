from django.db import models
from users.models import User

class Tweet(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tweets')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.PositiveIntegerField(default=0)
    retweets = models.PositiveIntegerField(default=0)
    replies = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.content