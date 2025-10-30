from rest_framework import status
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User, UserFollowing
from .serializers import UserCreateSerializer, UserSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = User.objects.get(username=request.data.get("username"))
            response.data["user"] = UserSerializer(user).data
        return response


class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=["post"])
    def register(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Gerar tokens JWT após criar o usuário
            from rest_framework_simplejwt.tokens import RefreshToken

            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token

            return Response(
                {
                    "user": UserSerializer(user).data,
                    "access": str(access_token),
                    "refresh": str(refresh),
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def me(self, request):
        if request.user.is_authenticated:
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        return Response({"error": "Not authenticated"}, status=401)

    @action(
        detail=False,
        methods=["put", "patch"],
        parser_classes=[MultiPartParser, FormParser],
    )
    def update_profile(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=["post"])
    def change_password(self, request):
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not request.user.check_password(old_password):
            return Response({"error": "Old password is incorrect"}, status=400)

        request.user.set_password(new_password)
        request.user.save()
        return Response({"message": "Password changed successfully"})

    @action(detail=True, methods=["post"])
    def follow(self, request, pk=None):
        user_to_follow = self.get_object()
        if user_to_follow != request.user:
            UserFollowing.objects.get_or_create(
                user=request.user, following_user=user_to_follow
            )
            return Response({"message": "User followed successfully"})
        return Response({"error": "Cannot follow yourself"}, status=400)

    @action(detail=True, methods=["delete"])
    def unfollow(self, request, pk=None):
        user_to_unfollow = self.get_object()
        UserFollowing.objects.filter(
            user=request.user, following_user=user_to_unfollow
        ).delete()
        return Response({"message": "User unfollowed successfully"})

    @action(detail=False, methods=["get"])
    def following(self, request):
        following = UserFollowing.objects.filter(user=request.user)
        users = [f.following_user for f in following]
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def followers(self, request):
        followers = UserFollowing.objects.filter(following_user=request.user)
        users = [f.user for f in followers]
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def stats(self, request, pk=None):
        user = self.get_object()
        tweets_count = user.tweets.count()
        following_count = UserFollowing.objects.filter(user=user).count()
        followers_count = UserFollowing.objects.filter(following_user=user).count()

        return Response(
            {
                "tweets_count": tweets_count,
                "following_count": following_count,
                "followers_count": followers_count,
            }
        )

    @action(detail=True, methods=["get"])
    def tweets(self, request, pk=None):
        user = self.get_object()
        tweets = user.tweets.all().order_by("-timestamp")

        # Importar o serializer de tweets
        from tweets.serializers import TweetSerializer

        serializer = TweetSerializer(tweets, many=True)
        return Response(serializer.data)
