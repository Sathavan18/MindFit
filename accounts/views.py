from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import UserProfile
from .serializers import UserSerializer, UserProfileSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        # Get or create profile for the current user
        profile, created = UserProfile.objects.get_or_create(
            user=self.request.user
        )
        return profile
    
    def post(self, request, *args, **kwargs):
        # Allow creating profile via POST
        try:
            # Check if profile already exists
            profile = UserProfile.objects.get(user=request.user)
            # If exists, update it
            serializer = self.get_serializer(profile, data=request.data)
        except UserProfile.DoesNotExist:
            # If doesn't exist, create new one
            serializer = self.get_serializer(data=request.data)
        
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([AllowAny])
def check_username(request):
    username = request.GET.get('username', '')
    if not username:
        return Response({'available': False, 'message': 'Username is required'})
    
    exists = User.objects.filter(username=username).exists()
    return Response({
        'available': not exists,
        'message': 'Username available' if not exists else 'Username already taken'
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def check_email(request):
    email = request.GET.get('email', '')
    if not email:
        return Response({'available': False, 'message': 'Email is required'})
    
    exists = User.objects.filter(email=email).exists()
    return Response({
        'available': not exists,
        'message': 'Email available' if not exists else 'Email already registered'
    })