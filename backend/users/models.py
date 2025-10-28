from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class User(AbstractUser):
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    groups = models.ManyToManyField(Group, related_name='custom_user_groups', blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name='custom_user_permissions', blank=True)

    def __str__(self):
        return self.username

# users/models.py - Adicionar
class UserFollowing(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'following_user')