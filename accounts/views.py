from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import UserProfile
from .serializers import UserSerializer, UserProfileSerializer

class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration.
    Creates a new user account with username, email, and password.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint for user profile management.
    Handles creating, retrieving, and updating health profiles.
    Requires authentication - users can only access their own profile.
    """
    serializer_class = UserProfileSerializer
    # Must be logged in
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        # Get or create profile for the authenticated user
        # Creates empty one if needed
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile
    
    def post(self, request, *args, **kwargs):
        """
        Create or update user profile via POST request.
        Allows frontend to use POST for both create and update operations.
        Automatically links profile to the authenticated user.
        """
        try:
            # Check if profile already exists
            profile = UserProfile.objects.get(user=request.user)
            # If exists, update it with new data
            serializer = self.get_serializer(profile, data=request.data)
        except UserProfile.DoesNotExist:
            # If doesn't exist, create new one
            serializer = self.get_serializer(data=request.data)
        
        # Validate and save profile data
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([AllowAny])
def check_username(request):
    """
    Check if a username is available for registration.
    Used during registration to provide real-time validation feedback.
    """
    username = request.GET.get('username', '')
    # Require username parameter
    if not username:
        return Response({'available': False, 'message': 'Username is required'})
    
    # Check if username already exists in database
    exists = User.objects.filter(username=username).exists()
    return Response({
        'available': not exists,
        'message': 'Username available' if not exists else 'Username already taken'
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def check_email(request):
    """
    Check if an email is available for registration.
    Used during registration to provide real-time validation feedback.
    """
    email = request.GET.get('email', '')
    # Require email parameter
    if not email:
        return Response({'available': False, 'message': 'Email is required'})
    
    # Check is email already exists in database
    exists = User.objects.filter(email=email).exists()
    return Response({
        'available': not exists,
        'message': 'Email available' if not exists else 'Email already registered'
    })