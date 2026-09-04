from django.shortcuts import render
import json
# Create your views here.
from django.http import HttpResponse
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .serializers import BuyerSerializer , SellerSerializer  , sellerDataSerializer , buyerDataSerializer , userReviewSerializer , buildingReviewSerializer , ContactUsSerializer , HelpRequestSerializer , AboutUsSerializer
# views.py
from django.core.mail import send_mail
from django.contrib.auth.hashers import make_password
from .models import buyerModel , sellerModel , sellerData , rentData , userReview , buildingReview , ContactUs , HelpRequest , Booking , AboutUs , PasswordResetToken
from django.shortcuts import render ,redirect , get_object_or_404
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
from math import ceil, sqrt


@api_view(["POST"])
def buyer(request):

    serializer = BuyerSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()          # <-- Saves to MySQL
        return Response({"message": "User registered successfully"})

    return Response(serializer.errors, status=400)

@api_view(["POST"])
def seller(request):

    serializer = SellerSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()          #Saves to MySQL
        return Response({"message": "User registered successfully"})

    return Response(serializer.errors, status=400)


@api_view(["POST"])
def login(request):

    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({
            "status": False,
            "message": "Email and password are required"
        }, status=400)

    # Buyer
    buyer = buyerModel.objects.filter(email=email).first()

    if buyer:

        if buyer.password == password:

            request.session.flush()

            request.session["user_id"] = buyer.id
            request.session["role"] = "buyer"
            request.session["email"] = buyer.email

            request.session.modified = True

            print("LOGIN SESSION:")
            print(dict(request.session))

            return Response({
                "status": True,
                "message": "Login Successful",
                "user": {
                    "id": buyer.id,
                    "username": buyer.username,
                    "email": buyer.email,
                    "role": "buyer"
                }
            })

        return Response({
            "status": False,
            "message": "Incorrect password"
        }, status=401)

    # Seller
    seller = sellerModel.objects.filter(email=email).first()

    if seller:

        if seller.password == password:

            request.session.flush()

            request.session["user_id"] = seller.id
            request.session["role"] = "seller"
            request.session["email"] = seller.email

            request.session.save()

            print("SESSION KEY:", request.session.session_key)
            print("SESSION DATA:", dict(request.session))

            response = Response({
                "status": True,
                "message": "Login Successful",
                "user": {
                    "id": seller.id,
                    "username": seller.username,
                    "email": seller.email,
                    "role": "seller"
                }
            })
            
            print("COOKIES BEFORE RETURN:", response.cookies)
            return response

        return Response({
            "status": False,
            "message": "Incorrect password"
        }, status=401)

    return Response({
        "status": False,
        "message": "Email not found"
    }, status=404)
        

def create_collage(images):

    image_list = []

    for img in images:
        image = Image.open(img)
        image = image.convert("RGB")
        image = image.resize((300, 300))
        image_list.append(image)

    if(len(image_list) != 0):
        total = len(image_list)

        cols = ceil(sqrt(total))
        rows = ceil(total / cols)

        additionalImages = Image.new(
            "RGB",
            (cols * 300, rows * 300),
            color=(255, 255, 255)
        )

        for index, image in enumerate(image_list):

            x = (index % cols) * 300
            y = (index // cols) * 300

            additionalImages.paste(image, (x, y))

        output = BytesIO()

        additionalImages.save(output, format="JPEG", quality=90)

        return ContentFile(output.getvalue())


@api_view(["POST"])
def sell(request):
    
    print("========== SELL ==========")
    print("COOKIES:", request.COOKIES)
    print("SESSION KEY:", request.session.session_key)
    print("SESSION DATA:", dict(request.session))
    print("USER ID:", request.session.get("user_id"))
    print("ROLE:", request.session.get("role"))
    print("==========================")

    # Get logged-in seller from session
    seller_id = request.session.get("user_id")
    session_role = request.session.get("role")

    if seller_id is None or session_role != "seller":
        return Response({
            "status": False,
            "message": "Please login as seller"
        }, status=401)

    try:
        seller = sellerModel.objects.get(id=int(seller_id))
    except (sellerModel.DoesNotExist, ValueError, TypeError):
        return Response({
            "status": False,
            "message": "Seller not found"
        }, status=404)

    name = request.data.get("name")
    contact = request.data.get("contact")
    email = request.data.get("email")
    propertyType = request.data.get("propertyType")
    buildingName = request.data.get("buildingName")
    description = request.data.get("description")
    price = request.data.get("price")
    area = request.data.get("area")
    rooms = request.data.get("bhk")
    parking = request.data.get("parking")
    address = request.data.get("address")
    city = request.data.get("city")
    areaPincode = request.data.get("areaPincode")
    mapLink = request.data.get("mapLink")

    facilities = request.data.get("facilities", [])

    # Handle JSON string OR already parsed list
    if isinstance(facilities, str):
        try:
            facilities = json.loads(facilities)
        except json.JSONDecodeError:
            facilities = []

    hospitalAddress = request.data.get("hospitalAddress")
    hospitalLink = request.data.get("hospitalLink")

    schoolAddress = request.data.get("schoolAddress")
    schoolLink = request.data.get("schoolLink")

    metroAddress = request.data.get("metroAddress")
    metroLink = request.data.get("metroLink")

    mallAddress = request.data.get("mallAddress")
    mallLink = request.data.get("mallLink")

    propertyImage = request.data.get("propertyImage")
    additionalDetails = request.data.get("additionalDetails")

    # This is property role, e.g. builder
    property_role = request.data.get("role")

    builderOfficeName = None
    officeAddress = None
    builderWorkExperience = None

    if property_role and property_role.lower() == "builder":

        builderOfficeName = request.data.get(
            "builderOfficeName"
        )

        officeAddress = request.data.get(
            "officeAddress"
        )

        builderWorkExperience = request.data.get(
            "builderWorkExperience"
        )

    additionalImages = request.FILES.getlist("additionalImages")
    additionalImagesCount = len(additionalImages)
    property = sellerData.objects.create(
        seller=seller,

        name=name,
        contact=contact,
        email=email,
        propertyType=propertyType,
        buildingName=buildingName,
        description=description,
        price=price,
        area=area,
        rooms=rooms,
        parking=parking,
        address=address,
        city=city,
        pincode=areaPincode,
        mapLink=mapLink,
        facilities=facilities,

        hospitalAddress=hospitalAddress,
        hospitalLink=hospitalLink,

        schoolAddress=schoolAddress,
        schoolLink=schoolLink,

        metroAddress=metroAddress,
        metroLink=metroLink,

        mallAddress=mallAddress,
        mallLink=mallLink,

        propertyImage=propertyImage,
        additionalDetails=additionalDetails,

        role=property_role,
        builderOfficeName=builderOfficeName,
        officeAddress=officeAddress,
        experience=builderWorkExperience,
        additionalImagesCount=additionalImagesCount
    )

    # Multiple additional images
    collage = create_collage(additionalImages)

    if collage:
        property.additionalImages.save(
            "property.jpg",
            collage,
            save=False
        )

    property.save()

    return Response({
        "status": True,
        "message": "Property added successfully",
        "id": property.id
    }, status=201)

@api_view(["POST"])
def rent(request):

    seller_id = request.session.get("user_id")
    session_role = request.session.get("role")

    if seller_id is None or session_role != "seller":
        return Response({
            "status": False,
            "message": "Please login as seller"
        }, status=401)

    try:
        seller = sellerModel.objects.get(id=int(seller_id))
    except (sellerModel.DoesNotExist, ValueError, TypeError):
        return Response({
            "status": False,
            "message": "Seller not found"
        }, status=404)

    name = request.data.get("name")
    contact = request.data.get("contact")
    email = request.data.get("email")
    propertyType = request.data.get("propertyType")
    buildingName = request.data.get("buildingName")
    description = request.data.get("description")
    rent = request.data.get("rent")
    area = request.data.get("area")
    rooms = request.data.get("bhk")
    parking = request.data.get("parking")
    address = request.data.get("address")
    city = request.data.get("city")
    areaPincode = request.data.get("areaPincode")
    mapLink = request.data.get("mapLink")
    propertyImage = request.data.get("propertyImage")
    additionalDetails = request.data.get("additionalDetails")
    
    additionalImages = request.FILES.getlist("additionalImages")
    additionalImagesCount = len(additionalImages)
    

    property = rentData.objects.create(
        seller=seller,

        name=name,
        contact=contact,
        email=email,
        propertyType=propertyType,
        buildingName=buildingName,
        description=description,
        rent=rent,
        area=area,
        rooms=rooms,
        parking=parking,
        address=address,
        city=city,
        pincode=areaPincode,
        mapLink=mapLink,
        propertyImage=propertyImage,
        additionalDetails=additionalDetails,
        additionalImagesCount=additionalImagesCount
    )


    collage = create_collage(additionalImages)

    if collage:
        property.additionalImages.save(
            "property.jpg",
            collage,
            save=False
        )

    property.save()

    return Response({
        "status": True,
        "message": "Rental property added successfully",
        "id": property.id
    }, status=201)

@api_view(["GET"])
def property(request):

    seller_id = request.session.get("user_id")
    session_role = request.session.get("role")

    if seller_id is None or session_role != "seller":
        return Response({
            "status": False,
            "message": "Please login as seller"
        }, status=401)

    try:
        seller = sellerModel.objects.get(id=int(seller_id))
    except (sellerModel.DoesNotExist, ValueError, TypeError):
        return Response({
            "status": False,
            "message": "Seller not found"
        }, status=404)

    sellers = sellerData.objects.filter(
        seller_id=seller.id
    )

    rents = rentData.objects.filter(
        seller_id=seller.id
    )

    seller_serializer = sellerDataSerializer(
        sellers,
        many=True
    )

    rent_serializer = buyerDataSerializer(
        rents,
        many=True
    )

    return Response({
        "status": True,

        "user": {
            "id": seller.id,
            "username": seller.username,
            "email": seller.email,
            "role": "seller"
        },

        "seller": seller_serializer.data,
        "rent": rent_serializer.data,

        "total_sale_properties": sellers.count(),
        "total_rent_properties": rents.count()
    })

            
@api_view(["DELETE"])
def delete(request, id=None):

    seller_id = request.session.get("user_id")
    role = request.session.get("role")

    if seller_id is None or role != "seller":
        return Response({
            "status": False,
            "message": "Please login as seller"
        }, status=401)

    if id is None:
        return Response({
            "status": False,
            "message": "Property ID is required"
        }, status=400)

    try:
        property_id = int(id)
    except (ValueError, TypeError):
        return Response({
            "status": False,
            "message": "Invalid property ID"
        }, status=400)

    try:

        seller = sellerModel.objects.get(id=seller_id)

        try:
            property = sellerData.objects.get(
                id=property_id,
                seller=seller
            )

            property.delete()

            return Response({
                "status": True,
                "message": "Seller property deleted successfully"
            })

        except sellerData.DoesNotExist:
            pass

        try:
            propertyrent = rentData.objects.get(
                id=property_id,
                seller=seller
            )

            propertyrent.delete()

            return Response({
                "status": True,
                "message": "Rental property deleted successfully"
            })

        except rentData.DoesNotExist:
            return Response({
                "status": False,
                "message": "Property not found or you do not own this property"
            }, status=404)

    except sellerModel.DoesNotExist:

        return Response({
            "status": False,
            "message": "Seller not found"
        }, status=404)


@api_view(["GET", "PATCH"])
@parser_classes([MultiPartParser, FormParser])
def edit(request, id=None):

    seller_id = request.session.get("user_id")
    role = request.session.get("role")

    if seller_id is None or role != "seller":
        return Response({
            "status": False,
            "message": "Please login as seller"
        }, status=401)

    if id is None:
        return Response({
            "status": False,
            "message": "Property ID is required"
        }, status=400)

    try:
        property_id = int(id)
    except (ValueError, TypeError):
        return Response({
            "status": False,
            "message": "Invalid property ID"
        }, status=400)

    try:
        seller = sellerModel.objects.get(id=seller_id)
    except sellerModel.DoesNotExist:
        return Response({
            "status": False,
            "message": "Seller not found"
        }, status=404)

    try:

        property = sellerData.objects.get(
            id=property_id,
            seller=seller
        )

        serializer_class = sellerDataSerializer

    except sellerData.DoesNotExist:

        
        try:

            property = rentData.objects.get(
                id=property_id,
                seller=seller
            )

            serializer_class = buyerDataSerializer

        except rentData.DoesNotExist:

            return Response({
                "status": False,
                "message": "Property not found or you do not own this property"
            }, status=404)

    # GET
    if request.method == "GET":

        serializer = serializer_class(property)

        return Response({
            "status": True,
            "data": serializer.data
        })


    if request.method == "PATCH":

        serializer = serializer_class(
            property,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response({
                "status": True,
                "message": "Property updated successfully",
                "data": serializer.data
            })

        return Response({
            "status": False,
            "errors": serializer.errors
        }, status=400)

@api_view(["GET"])
def home(request):
        sellers = sellerDataSerializer(
            sellerData.objects.filter(status="approved"),
            many=True
        )
        
        buyers = buyerDataSerializer(
            rentData.objects.filter(status="approved"),
            many=True
        )
        
        reviews = userReviewSerializer(
            userReview.objects.all(),
            many=True
        )
        
        return Response({
            "seller": sellers.data,
            "buyer": buyers.data,
            "review": reviews.data,
        })
    
@api_view(["GET"])
def details(request,id=None):
    if(id%2 != 0):
        try:
            seller = sellerData.objects.get(id=id)

            serializer = sellerDataSerializer(seller)

            return Response({
                "status": True,
                "type": "seller",
                "seller": serializer.data
            }, status=200)

        except sellerData.DoesNotExist:

            return Response({
                "status": False,
                "message": "Seller property not found"
            }, status=404)
            
    else:
            try:
                rent = rentData.objects.get(id=id)

                serializer = buyerDataSerializer(rent)

                return Response({
                "status": True,
                "type": "rent",
                "rent": serializer.data
                }, status=200)

            except rentData.DoesNotExist:

                return Response({
                "status": False,
                "message": "Rental property not found"
                }, status=404)
            
@api_view(["POST"])
def logout(request):

    request.session.flush()

    return Response({
        "status": True,
        "message": "Logout successful"
    })

        


@api_view(["GET"])
def guest(request):
            sellers = sellerDataSerializer(
                sellerData.objects.filter(status="approved"),
                many=True
            )
            
            buyers = buyerDataSerializer(
                rentData.objects.filter(status="approved"),
                many=True
            )
            
            reviews = userReviewSerializer(
                userReview.objects.all(),
                many=True
            )
            
            return Response({
                "seller": sellers.data,
                "buyer": buyers.data,
                "review": reviews.data,
            })

@api_view(["POST"])
def buildingreview(request):
    serializer = buildingReviewSerializer(data=request.data)
        
    if serializer.is_valid():
        serializer.save()
        return Response({
                "status": True,
            }, status=201)
            # return Response({"message": "User registered successfully"})
        
    return Response(serializer.errors, status=400)


@api_view(["GET"])
def reviews(request):
    seller_id = request.session.get("user_id")
    session_role = request.session.get("role")

    if seller_id is None or session_role != "seller":
        return Response({
            "status": False,
            "message": "Please login as seller"
        }, status=401)

    try:
        seller = sellerModel.objects.get(id=int(seller_id))
    except (sellerModel.DoesNotExist, ValueError, TypeError):
        return Response({
            "status": False,
            "message": "Seller not found"
        }, status=404)

    
    sell_listings = sellerData.objects.filter(seller_id=seller.id)
    rent_listings = rentData.objects.filter(seller_id=seller.id)

    
    properties = []

    for listing in sell_listings:
        properties.append({
            "id": listing.id,
            "propertyName": listing.buildingName,
            "propertyType": listing.propertyType,
            "dealType": "Sell",
        })

    for listing in rent_listings:
        properties.append({
            "id": listing.id,
            "propertyName": listing.buildingName,
            "propertyType": listing.propertyType,
            "dealType": "Rent",
        })

    
    property_ids = [p["id"] for p in properties]
    all_reviews = buildingReview.objects.filter(property_id__in=property_ids)

    
    reviews_by_property = {}
    for review in all_reviews:
        reviews_by_property.setdefault(review.property_id, []).append(review)

    
    result = []
    for prop in properties:
        prop_reviews = reviews_by_property.get(prop["id"], [])
        serialized_reviews = buildingReviewSerializer(prop_reviews, many=True).data

        result.append({
            "id": prop["id"],
            "propertyName": prop["propertyName"],
            "propertyType": prop["propertyType"],
            "dealType": prop["dealType"],
            "reviews": serialized_reviews,
        })

    return Response({
        "status": True,
        "data": result,
    }, status=200)

@api_view(["GET"])
def buildingreviews(request,id=None):
    try:
        review = buildingReview.objects.filter(property_id=id)
        
        serializer = buildingReviewSerializer(review,many=True)
        
        return Response({
            "status": True,
            "review": serializer.data
        }, status=200)
        
    except buildingReview.DoesNotExist:
    
        return Response({
            "status": False,
            "message": "Review not found"
        }, status=404)
        

@api_view(["POST"])
def userreviews(request):
    serializer = userReviewSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()         
        # return Response({"message": "User registered successfully"})
    
    return Response(serializer.errors, status=400)


@api_view(["GET", "PATCH"])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def editprofile(request):
    user_id = request.session.get("user_id")
    role = request.session.get("role")

    if user_id is None or role not in ["seller", "buyer"]:
        return Response({
            "status": False,
            "message": "Please login first"
        }, status=401)

    if role == "seller":
        try:
            user = sellerModel.objects.get(id=user_id)
        except sellerModel.DoesNotExist:
            return Response({
                "status": False,
                "message": "Seller not found"
            }, status=404)

        serializer_class = SellerSerializer

    elif role == "buyer":
        try:
            user = buyerModel.objects.get(id=user_id)
        except buyerModel.DoesNotExist:
            return Response({
                "status": False,
                "message": "Buyer not found"
            }, status=404)

        serializer_class = BuyerSerializer

    if request.method == "GET":
        serializer = serializer_class(user)

        return Response({
            "status": True,
            "role": role,
            "data": serializer.data
        })

    if request.method == "PATCH":
        serializer = serializer_class(
            user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            return Response({
                "status": True,
                "message": f"{role.capitalize()} profile updated successfully",
                "data": serializer.data
            })

        return Response({
            "status": False,
            "errors": serializer.errors
        }, status=400)
            
@api_view(["GET"])
def about(request):
    pass

@api_view(["GET", "POST"])
def help_requests(request):

    user_id = request.session.get("user_id")
    role = request.session.get("role")

    if user_id is None or role is None:
        return Response({
            "status": False,
            "message": "Please log in to continue"
        }, status=401)

    if request.method == "GET":
        requests = HelpRequest.objects.filter(user_id=user_id, role=role)
        serializer = HelpRequestSerializer(requests, many=True)

        return Response({
            "status": True,
            "data": serializer.data
        }, status=200)

    # POST — create a new help request
    category = request.data.get("category")
    subject = request.data.get("subject")
    message = request.data.get("message")

    if not category or not subject or not message:
        return Response({
            "status": False,
            "message": "Category, subject, and message are required"
        }, status=400)

    help_request = HelpRequest.objects.create(
        user_id=user_id,
        role=role,
        category=category,
        subject=subject,
        message=message,
        status='Pending',
    )

    serializer = HelpRequestSerializer(help_request)

    return Response({
        "status": True,
        "message": "Your request has been sent to admin",
        "data": serializer.data
    }, status=201)

# views.py
@api_view(["GET"])
def contactus(request):
    contact = ContactUs.objects.first()

    if not contact:
        return Response({
            "status": False,
            "message": "Contact Us details not found"
        }, status=404)

    serializer = ContactUsSerializer(contact)
    return Response({"status": True, "data": serializer.data}, status=200)

@api_view(["POST"])
def booking(request):
    user_id = request.session.get("user_id")

    if user_id is None:
        return Response({
            "status": False,
            "message": "Please log in to book an appointment"
        }, status=401)

    property_id = request.data.get("property_id")
    booking_date = request.data.get("booking_date")
    booking_time = request.data.get("booking_time")

    if not property_id or not booking_date or not booking_time:
        return Response({
            "status": False,
            "message": "property_id, booking_date and booking_time are required"
        }, status=400)

    # details.jsx doesn't tell us whether this is a sell or rent listing —
    # figure it out by checking which table actually has this id.
    if sellerData.objects.filter(id=property_id).exists():
        listing_type = 'sell'
    elif rentData.objects.filter(id=property_id).exists():
        listing_type = 'rent'
    else:
        return Response({
            "status": False,
            "message": "Property not found"
        }, status=404)

    Booking.objects.create(
        buyer_id=user_id,
        property_id=property_id,
        listing_type=listing_type,
        booking_date=booking_date,
        booking_time=booking_time,
        status='Pending',
    )

    return Response({
        "status": True,
        "message": "Appointment booked successfully"
    }, status=201)


@api_view(["GET"])
def my_bookings(request):
    seller_id = request.session.get("user_id")
    role = request.session.get("role")

    if seller_id is None or role != "seller":
        return Response({
            "status": False,
            "message": "Please login as seller"
        }, status=401)

    try:
        seller = sellerModel.objects.get(id=int(seller_id))
    except (sellerModel.DoesNotExist, ValueError, TypeError):
        return Response({
            "status": False,
            "message": "Seller not found"
        }, status=404)

    sell_ids = list(sellerData.objects.filter(seller_id=seller.id).values_list('id', flat=True))
    rent_ids = list(rentData.objects.filter(seller_id=seller.id).values_list('id', flat=True))

    bookings = Booking.objects.filter(
        Q(listing_type='sell', property_id__in=sell_ids) |
        Q(listing_type='rent', property_id__in=rent_ids)
    )

    result = []
    for b in bookings:
        if b.listing_type == 'sell':
            listing = sellerData.objects.filter(id=b.property_id).first()
        else:
            listing = rentData.objects.filter(id=b.property_id).first()

        buyer = buyerModel.objects.filter(id=b.buyer_id).first()

        result.append({
            "id": b.id,
            "propertyName": listing.buildingName if listing else "Unknown",
            "propertyType": listing.propertyType if listing else "",
            "dealType": "Sell" if b.listing_type == 'sell' else "Rent",
            "buyerName": buyer.username if buyer else "Unknown",
            "buyerEmail": buyer.email if buyer else "",
            "bookingDate": b.booking_date,
            "bookingTime": b.booking_time,
            "status": b.status,
        })

    return Response({
        "status": True,
        "data": result
    }, status=200)
    
@api_view(["PATCH"])
def update_booking_status(request, id=None):
    seller_id = request.session.get("user_id")
    role = request.session.get("role")

    if seller_id is None or role != "seller":
        return Response({
            "status": False,
            "message": "Please login as seller"
        }, status=401)

    try:
        seller = sellerModel.objects.get(id=int(seller_id))
    except (sellerModel.DoesNotExist, ValueError, TypeError):
        return Response({
            "status": False,
            "message": "Seller not found"
        }, status=404)

    try:
        booking_obj = Booking.objects.get(id=id)
    except Booking.DoesNotExist:
        return Response({
            "status": False,
            "message": "Booking not found"
        }, status=404)

    # Authorization: confirm this booking actually belongs to one of THIS
    # seller's own properties — otherwise any logged-in seller could approve
    # someone else's bookings just by guessing an id.
    if booking_obj.listing_type == 'sell':
        owns_property = sellerData.objects.filter(id=booking_obj.property_id, seller_id=seller.id).exists()
    else:
        owns_property = rentData.objects.filter(id=booking_obj.property_id, seller_id=seller.id).exists()

    if not owns_property:
        return Response({
            "status": False,
            "message": "You do not have permission to update this booking"
        }, status=403)

    new_status = request.data.get("status")

    if new_status not in ('Confirmed', 'Cancelled', 'Pending'):
        return Response({
            "status": False,
            "message": "status must be Confirmed, Cancelled, or Pending"
        }, status=400)

    booking_obj.status = new_status
    booking_obj.save()

    return Response({
        "status": True,
        "message": f"Booking {new_status.lower()}",
    }, status=200)

@api_view(["GET"])
def my_created_bookings(request):
    buyer_id = request.session.get("user_id")

    if buyer_id is None:
        return Response({
            "status": False,
            "message": "Please log in to view your bookings"
        }, status=401)

    bookings = Booking.objects.filter(buyer_id=buyer_id)

    result = []
    for b in bookings:
        if b.listing_type == 'sell':
            listing = sellerData.objects.filter(id=b.property_id).first()
        else:
            listing = rentData.objects.filter(id=b.property_id).first()

        result.append({
            "id": b.id,
            "propertyId": b.property_id,
            "propertyName": listing.buildingName if listing else "Unknown",
            "propertyType": listing.propertyType if listing else "",
            "dealType": "Sell" if b.listing_type == 'sell' else "Rent",
            "bookingDate": b.booking_date,
            "bookingTime": b.booking_time,
            "status": b.status,
        })

    return Response({
        "status": True,
        "data": result
    }, status=200)
    
@api_view(["GET"])
def aboutus(request):
    about = AboutUs.objects.first()  # single "About Us" row for the whole site

    if not about:
        return Response({
            "status": False,
            "message": "About Us content not found"
        }, status=404)

    serializer = AboutUsSerializer(about)

    return Response({
        "status": True,
        "data": serializer.data
    }, status=200)
    
@api_view(["POST"])
def forgot_password(request):
    email = request.data.get("email")

    if not email:
        return Response({
            "status": False,
            "message": "Email is required"
        }, status=400)

    user = None
    role = None

    buyer = buyerModel.objects.filter(email=email).first()
    if buyer:
        user = buyer
        role = "buyer"
    else:
        seller = sellerModel.objects.filter(email=email).first()
        if seller:
            user = seller
            role = "seller"

    generic_response = Response({
        "status": True,
        "message": "If an account exists for this email, reset instructions have been sent."
    }, status=200)

    if not user:
        return generic_response

    reset_token = PasswordResetToken.objects.create(
        user_id=user.id,
        role=role,
    )

    reset_link = f"http://localhost:5173/reset-password/{reset_token.token}/"

    send_mail(
        subject="Reset your Property Zone password",
        message=(
            f"Click the link below to reset your password:\n\n{reset_link}\n\n"
            "This link expires in 30 minutes. If you didn't request this, ignore this email."
        ),
        from_email="noreply@propertyzone.com",
        recipient_list=[email],
        fail_silently=True,
    )

    return generic_response

@api_view(["POST"])
def reset_password(request):
    token = request.data.get("token")
    new_password = request.data.get("password")

    if not token or not new_password:
        return Response({
            "status": False,
            "message": "Token and new password are required"
        }, status=400)

    if len(new_password) < 6:
        return Response({
            "status": False,
            "message": "Password must be at least 6 characters"
        }, status=400)

    try:
        reset_token = PasswordResetToken.objects.get(token=token)
    except (PasswordResetToken.DoesNotExist, ValueError):
        return Response({
            "status": False,
            "message": "Invalid or expired reset link"
        }, status=400)

    if not reset_token.is_valid():
        return Response({
            "status": False,
            "message": "This reset link has expired. Please request a new one."
        }, status=400)

    if reset_token.role == "buyer":
        user = buyerModel.objects.filter(id=reset_token.user_id).first()
    else:
        user = sellerModel.objects.filter(id=reset_token.user_id).first()

    if not user:
        return Response({
            "status": False,
            "message": "Account not found"
        }, status=404)

    # user.password = make_password(new_password)  # hashed, unlike the rest of your app currently
    user.password = new_password
    user.save()

    reset_token.used = True
    reset_token.save()

    return Response({
        "status": True,
        "message": "Password reset successfully"
    }, status=200)