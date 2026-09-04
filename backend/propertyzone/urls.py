from django.urls import path
from .import views


urlpatterns = [
    path("buyer/", views.buyer, name="buyer"),
    path("seller/", views.seller, name="seller"),
    path("login/", views.login),
    path("sell/", views.sell),
    path("rent/", views.rent),
    path("property/", views.property),
    path("delete/<int:id>/", views.delete),
    path("edit/<int:id>/", views.edit, name="edit"),
    path("home/", views.home),
    path("details/<int:id>/", views.details, name="details"),
    path("logout/", views.logout),
    path("reviews/", views.reviews),
    path("buildingreview/", views.buildingreview),
    path("buildingreviews/<int:id>/", views.buildingreviews),
    path("userreviews/", views.userreviews),
    path("editprofile/", views.editprofile),
    path("about/", views.about),
    path("contactus/", views.contactus),
    path('help/', views.help_requests),
    path("guest/", views.guest),
    path('booking/', views.booking),        # POST — from details.jsx
    path('mybookings/', views.my_bookings),
    path('mybookings/<int:id>/', views.update_booking_status),
    path('mycreatedbookings/', views.my_created_bookings),
    path('aboutus/', views.aboutus),
    path('forgot-password/', views.forgot_password),
    path('reset-password/', views.reset_password),
]