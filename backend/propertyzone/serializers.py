from rest_framework import serializers
from .models import buyerModel , sellerModel , sellerData , rentData , userReview , buildingReview , ContactUs , HelpRequest , TeamMember , AboutUs
# serializers.py



class BuyerSerializer(serializers.ModelSerializer):
    class Meta:
        model = buyerModel
        fields = "__all__"
 
class SellerSerializer(serializers.ModelSerializer):
    class Meta:
        model = sellerModel
        fields = "__all__" 

class sellerDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = sellerData
        fields = "__all__"
        
class buyerDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = rentData
        fields = "__all__"
        
class userReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = userReview
        fields = "__all__"
        
class buildingReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = buildingReview
        fields = "__all__"

class ContactUsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactUs
        fields = '__all__'
        
class HelpRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = HelpRequest
        fields = ['id', 'category', 'subject', 'message', 'status', 'created_at']
        
class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = ['id', 'name', 'role', 'bio', 'image']

class AboutUsSerializer(serializers.ModelSerializer):
    teamMembers = TeamMemberSerializer(many=True, read_only=True)

    class Meta:
        model = AboutUs
        fields = [
            'id', 'title', 'tagline', 'description', 'image',
            'mission', 'vision',
            'totalProperties', 'totalUsers', 'totalCities', 'foundedYear',
            'email', 'phone', 'address', 'instagram', 'facebook',
            'teamMembers',
        ]