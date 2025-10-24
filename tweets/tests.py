from django.test import TestCase
from .models import Tweet
from rest_framework.test import APIClient
from rest_framework import status

class TweetModelTest(TestCase):
    def setUp(self):
        self.tweet = Tweet.objects.create(
            author="TestUser",
            content="This is a test tweet",
            likes=10,
            retweets=2,
            replies=1
        )

    def test_tweet_creation(self):
        self.assertEqual(self.tweet.content, "This is a test tweet")
        self.assertEqual(self.tweet.likes, 10)

class TweetAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.tweet = Tweet.objects.create(
            author="TestUser",
            content="This is a test tweet"
        )

    def test_get_tweets(self):
        response = self.client.get('/api/tweets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_tweet(self):
        data = {"author": "TestUser2", "content": "Another test tweet"}
        response = self.client.post('/api/tweets/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

# Create your tests here.
