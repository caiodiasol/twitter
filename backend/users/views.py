import logging
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User, UserFollowing
from .serializers import UserCreateSerializer, UserSerializer

logger = logging.getLogger(__name__)


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
        logger.info(f"Registration attempt with data: {request.data}")

        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Usar transaction.atomic() para garantir commit
                # Django gerencia o commit automaticamente em blocos atômicos
                with transaction.atomic():
                    logger.info("Creating user in database...")
                    user = serializer.save()
                    logger.info(
                        f"User created with id: {user.id}, "
                        f"username: {user.username}"
                    )

                    # Forçar refresh do banco para garantir que foi salvo
                    user.refresh_from_db()
                    logger.info(
                        f"User refreshed from DB: id={user.id}, "
                        f"username={user.username}"
                    )

                    # Verificar se realmente foi salvo
                    user_exists = User.objects.filter(id=user.id).exists()
                    logger.info(f"User exists check: {user_exists}")

                # Verificar APÓS a transação se o usuário foi salvo
                # (fora do bloco atômico para garantir que commit foi feito)
                user_refresh = User.objects.filter(id=user.id).first()
                if not user_refresh:
                    logger.error(f"User {user.id} was not found after transaction!")
                    return Response(
                        {"error": "Failed to save user to database"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )

                logger.info(
                    f"User verified in DB after transaction: id={user_refresh.id}, "
                    f"username={user_refresh.username}"
                )

                # Gerar tokens JWT após criar o usuário
                from rest_framework_simplejwt.tokens import RefreshToken

                refresh = RefreshToken.for_user(user_refresh)
                access_token = refresh.access_token

                logger.info(
                    f"Registration successful for user: " f"{user_refresh.username}"
                )

                return Response(
                    {
                        "user": UserSerializer(user_refresh).data,
                        "access": str(access_token),
                        "refresh": str(refresh),
                    },
                    status=status.HTTP_201_CREATED,
                )
            except Exception as e:
                logger.error(f"Error creating user: {e}", exc_info=True)
                return Response(
                    {"error": f"Failed to create user: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        logger.warning(f"Serializer validation failed: {serializer.errors}")
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
