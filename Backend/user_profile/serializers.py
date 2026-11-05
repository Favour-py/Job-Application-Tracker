from rest_framework import serializers
from django.contrib.auth.models import User
import cloudinary.uploader
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(write_only=True, required=False)
    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        return obj.image or None

    def update(self, instance, validated_data):
        image_file = validated_data.pop('image', None)
        if image_file:
            import cloudinary
            print("CLOUDINARY CONFIG:", cloudinary.config().cloud_name, cloudinary.config().api_key)
            result = cloudinary.uploader.upload(image_file, folder='profile_images')
            instance.image = result['secure_url']
        return super().update(instance, validated_data)

    def create(self, validated_data):
        image_file = validated_data.pop('image', None)
        instance = super().create(validated_data)
        if image_file:
            result = cloudinary.uploader.upload(image_file, folder='profile_images')
            instance.image = result['secure_url']
            instance.save()
        return instance

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'name', 'title', 'image', 'image_url']
        read_only_fields = ['user', 'image_url']
            
class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError("Passwords do not match.")

        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField(required=False, allow_blank=True)
    ui = serializers.CharField(required=False, allow_blank=True, write_only=True)
    token = serializers.CharField()
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        uid_value = attrs.get('uid') or attrs.get('ui')
        if not uid_value:
            raise serializers.ValidationError({"uid": "This field is required."})
        attrs['uid'] = uid_value
        attrs.pop('ui', None)

        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs