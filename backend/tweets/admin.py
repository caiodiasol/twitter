from django.contrib import admin
from .models import Tweet

@admin.register(Tweet)
class TweetAdmin(admin.ModelAdmin):
    list_display = ('author', 'content', 'timestamp', 'likes', 'retweets', 'replies')
    search_fields = ('author', 'content')
    list_filter = ('timestamp',)