from django.contrib import admin
from .models import buyerModel, sellerModel , sellerData , rentData , userReview , buildingReview , ContactUs , HelpRequest , Booking , TeamMember , AboutUs
# Register your models here.

class Admincustomer(admin.ModelAdmin):
    list_display = ['username','email','password','date']
    
class Adminbuilder(admin.ModelAdmin):
    list_display = ['username','email','contact','password','date']
    
class AdminsellerData(admin.ModelAdmin):
    list_display = ['propertyType','name','contact','email']
    
class AdminrentData(admin.ModelAdmin):
    list_display = ['propertyType','name','contact','email']
    
class AdminuserReview(admin.ModelAdmin):
    list_display = ['name','rating','message']

class AdminbuildingReview(admin.ModelAdmin):
    list_display = ['property_id','name','rating','message']

class AdminContactus(admin.ModelAdmin):
    list_display = ['title','tagline','address','officeHours']
    
class TeamMemberInline(admin.TabularInline):
    model = TeamMember
    extra = 1


@admin.register(AboutUs)
class AboutUsAdmin(admin.ModelAdmin):
    inlines = [TeamMemberInline]
    
@admin.register(HelpRequest)
class HelpRequestAdmin(admin.ModelAdmin):
    list_display = ['subject', 'category', 'role', 'status', 'created_at']
    list_filter = ['status', 'category', 'role']
    list_editable = ['status']  # lets an admin change status right from the list view
    search_fields = ['subject', 'message']
    
@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'buyer_id', 'property_id', 'listing_type', 'booking_date', 'booking_time', 'status']
    list_editable = ['status']

admin.site.register(buyerModel , Admincustomer)
admin.site.register(sellerModel , Adminbuilder)
admin.site.register(sellerData, AdminsellerData)
admin.site.register(rentData, AdminrentData)
admin.site.register(userReview, AdminuserReview)
admin.site.register(buildingReview, AdminbuildingReview)
admin.site.register(ContactUs, AdminContactus)