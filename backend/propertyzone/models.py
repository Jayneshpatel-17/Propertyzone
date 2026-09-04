import uuid
from django.utils import timezone
from django.db import models , transaction
from datetime import datetime , timedelta

# Create your models here.
class buyerModel(models.Model):
    username = models.CharField(max_length=30)
    email = models.EmailField(max_length=50)
    password = models.CharField(max_length=15)
    cpassword = models.CharField(max_length=15)
    date = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return self.username
    
class sellerModel(models.Model):
    username = models.CharField(max_length=30)
    contact = models.CharField(max_length=10 , default='Null')
    email = models.EmailField(max_length=50)
    password = models.CharField(max_length=15)
    cpassword = models.CharField(max_length=15)
    address = models.CharField(max_length=500)
    date = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return self.username

    
STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("cancelled", "Cancelled"),
    ]


    
class sellerData(models.Model):
    seller = models.ForeignKey(
        sellerModel,
        on_delete=models.CASCADE,
        related_name="properties",
        null=True,
        blank=True
    )
    name = models.CharField(max_length=30)
    contact = models.CharField(max_length=10 , default='Null')
    email = models.EmailField(max_length=50)
    propertyType = models.CharField(max_length=30)
    buildingName = models.CharField(max_length=30)
    description = models.CharField(max_length=500)
    price = models.IntegerField(default=0)
    area = models.IntegerField(default=0)
    address = models.CharField(max_length=500)
    city = models.CharField(max_length=30, default='Null')
    pincode = models.CharField(max_length=30, default='Null')
    mapLink = models.URLField(max_length=200, blank=True, null=True)
    rooms = models.CharField(max_length=30, blank=True, null=True)
    parking = models.JSONField(default=list, blank=True, null=True)
    facilities = models.JSONField(default=list, blank=True, null=True)
    hospitalAddress = models.CharField(max_length=500, blank=True, null=True)
    hospitalLink = models.URLField(max_length=200, blank=True, null=True)
    schoolAddress = models.CharField(max_length=500, blank=True, null=True)
    schoolLink = models.URLField(max_length=200, blank=True, null=True)
    metroAddress = models.CharField(max_length=500, blank=True, null=True)
    metroLink = models.URLField(max_length=200, blank=True, null=True)
    mallAddress = models.CharField(max_length=500, blank=True, null=True)
    mallLink = models.URLField(max_length=200, blank=True, null=True)
    propertyImage = models.ImageField(upload_to='buildings/', blank=True, null=True)
    additionalImages = models.ImageField(upload_to='buildings/', blank=True, null=True)
    additionalImagesCount = models.IntegerField(default=0)
    additionalDetails = models.CharField(max_length=500, null=True, blank=True)
    role = models.CharField(max_length=30, default='Null')
    builderOfficeName = models.CharField(max_length=30 , blank=True, null=True)
    officeAddress = models.CharField(max_length=500 , blank=True, null=True)
    experience = models.CharField(max_length=30 , blank=True, null=True)
    status = models.CharField(max_length=20,choices=STATUS_CHOICES,default="pending")
    
    def save(self, *args, **kwargs):
        if not self.pk:
            with transaction.atomic():
                # Find highest current ID
                max_id = sellerData.objects.select_for_update().aggregate(models.Max('id'))['id__max']
                # Start at 1, or add 2 to the highest odd ID
                self.pk = 1 if max_id is None else max_id + 2
        super().save(*args, **kwargs)
    
    
    @staticmethod
    def get_all_sellerData():
        return sellerData.objects.all()
    

class rentData(models.Model):
    seller = models.ForeignKey(
        sellerModel,
        on_delete=models.CASCADE,
        related_name="rent_properties",
        null=True,
        blank=True
    )
    name = models.CharField(max_length=30)
    contact = models.CharField(max_length=10 , default='Null')
    email = models.EmailField(max_length=50)
    propertyType = models.CharField(max_length=30)
    buildingName = models.CharField(max_length=30)
    description = models.CharField(max_length=500)
    rent = models.IntegerField(default=0)
    area = models.IntegerField(default=0)
    rooms = models.CharField(max_length=30, blank=True, null=True)
    parking = models.JSONField(default=list, blank=True, null=True)
    address = models.CharField(max_length=500)
    city = models.CharField(max_length=30, default='Null')
    pincode = models.CharField(max_length=30, default='Null')
    mapLink = models.URLField(max_length=200, blank=True, null=True)
    propertyImage = models.ImageField(upload_to='buildings/', blank=True, null=True)
    additionalImages = models.ImageField(upload_to='buildings/', blank=True, null=True)
    additionalImagesCount = models.IntegerField(default=0)
    additionalDetails = models.CharField(max_length=500, null=True, blank=True)
    status = models.CharField(max_length=20,choices=STATUS_CHOICES,default="pending")
    
    def save(self, *args, **kwargs):
        if not self.pk:
            with transaction.atomic():
                # Find highest current ID
                max_id = rentData.objects.select_for_update().aggregate(models.Max('id'))['id__max']
                # Start at 2, or add 2 to the highest even ID
                self.pk = 2 if max_id is None else max_id + 2
        super().save(*args, **kwargs)
    
    @staticmethod
    def get_all_rentData():
        return rentData.objects.all()
    
class userReview(models.Model):
    name = models.CharField(max_length=30)
    rating = models.CharField(max_length=30)
    message = models.CharField(max_length=500)
    
    @staticmethod
    def get_all_userReview():
        return userReview.objects.all()
    
class buildingReview(models.Model):
    property_id = models.IntegerField(default=0)
    name = models.CharField(max_length=30)
    rating = models.CharField(max_length=30)
    message = models.CharField(max_length=500)
        
    @staticmethod
    def get_all_buildingReview():
        return buildingReview.objects.all()

class ContactUs(models.Model):
    title = models.CharField(max_length=200, blank=True)
    tagline = models.CharField(max_length=300, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    mapLink = models.URLField(blank=True)
    officeHours = models.TextField(blank=True)
    instagram = models.URLField(blank=True)
    facebook = models.URLField(blank=True)
    twitter = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title or "Contact Us"

class HelpRequest(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
    ]

    user_id = models.IntegerField()
    role = models.CharField(max_length=10)  # 'buyer' or 'seller'

    category = models.CharField(max_length=100)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subject} ({self.status})"

class Booking(models.Model):
    LISTING_TYPE_CHOICES = [('sell', 'Sell'), ('rent', 'Rent')]
    STATUS_CHOICES = [('Pending', 'Pending'), ('Confirmed', 'Confirmed'), ('Cancelled', 'Cancelled')]

    buyer_id = models.IntegerField()
    property_id = models.IntegerField()
    listing_type = models.CharField(max_length=10, choices=LISTING_TYPE_CHOICES)

    booking_date = models.DateField()
    booking_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking #{self.id} — {self.booking_date} {self.booking_time}"

class AboutUs(models.Model):
    title = models.CharField(max_length=200, blank=True)
    tagline = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='aboutus/', blank=True, null=True)

    mission = models.TextField(blank=True)
    vision = models.TextField(blank=True)

    # Stats — CharField (not Integer) so values like "1200+" or "50+" work
    totalProperties = models.CharField(max_length=50, blank=True)
    totalUsers = models.CharField(max_length=50, blank=True)
    totalCities = models.CharField(max_length=50, blank=True)
    foundedYear = models.CharField(max_length=10, blank=True)

    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    instagram = models.URLField(blank=True)
    facebook = models.URLField(blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title or "About Us"


class TeamMember(models.Model):
    about = models.ForeignKey(
        AboutUs,
        related_name='teamMembers',
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True)
    image = models.ImageField(upload_to='team/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.name
    
class PasswordResetToken(models.Model):
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    user_id = models.IntegerField()
    role = models.CharField(max_length=10)  # 'buyer' | 'seller'
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    def is_valid(self):
        return not self.used and (timezone.now() - self.created_at) < timedelta(minutes=30)