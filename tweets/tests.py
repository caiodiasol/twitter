from django.test import TestCase
from .models import Tweet
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import User

class TweetModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="TestUser",
            email="test@example.com",
            password="password123"
        )
        self.tweet = Tweet.objects.create(
            author=self.user,
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
        self.user = User.objects.create_user(
            username="TestUser",
            email="test@example.com",
            password="password123"
        )
        self.tweet = Tweet.objects.create(
            author=self.user,
            content="This is a test tweet"
        )
        # Autenticar o usuário
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_get_tweets(self):
        response = self.client.get('/api/tweets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_tweet(self):
        data = {"content": "Another test tweet"}
        response = self.client.post('/api/tweets/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)