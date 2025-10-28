from django.db import models

class Tweet(models.Model):
    author = models.CharField(max_length=100)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.PositiveIntegerField(default=0)
    retweets = models.PositiveIntegerField(default=0)
    replies = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.content