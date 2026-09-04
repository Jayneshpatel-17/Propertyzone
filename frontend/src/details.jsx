import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const NEAREST_KEYS = [
  { key: 'hospital', label: 'Hospital' },
  { key: 'school', label: 'School' },
  { key: 'metro', label: 'Metro Station' },
  { key: 'mall', label: 'Shopping Mall' },
];

// Django packs every additional image into ONE collage: tiles are resized to
// 300x300, arranged into a cols x rows grid (cols = ceil(sqrt(total)),
// rows = ceil(total / cols)), left-to-right, top-to-bottom — see
// create_collage(). These helpers mirror that layout so the frontend can
// slice individual tiles back out using a CSS-sprite technique.
const COLLAGE_TILE_SRC_SIZE = 300;
const MAX_ADDITIONAL_THUMBS = 5;

function collageGrid(total) {
  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);
  return { cols, rows };
}

// Returns the CSS needed to render tile `index` of a `cols`x`rows` collage
// at `displaySize` px, given the collage image is displayed at `displaySize`
// px per tile (i.e. the whole collage element is cols*displaySize wide).
function collageTileStyle(collageUrl, index, cols, displaySize) {
  const col = index % cols;
  const row = Math.floor(index / cols);
  return {
    backgroundImage: `url(${collageUrl})`,
    backgroundSize: `${cols * displaySize}px auto`,
    backgroundPosition: `-${col * displaySize}px -${row * displaySize}px`,
    backgroundRepeat: 'no-repeat',
  };
}

// Facilities may arrive as a JSON-stringified array (from sell.jsx),
// a comma-separated string, or already an array — handle all three.
function parseFacilities(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // not JSON — fall through
  }
  return String(raw)
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);
}

const AVATAR_COLORS = ['#C9A227', '#4B6358', '#8A5A44', '#5C6B8A', '#A8632C', '#6B5B95'];

function colorForName(name) {
  const sum = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function BookingIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path strokeLinecap="round" d="M3.5 9.5h17" />
      <path strokeLinecap="round" d="M8 3v3M16 3v3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 13.5l2 2 4-4" />
    </svg>
  );
}

export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Gallery selection: null = show the main propertyImage.
  // A number = show that tile index sliced out of the additionalImages collage.
  const [activeTile, setActiveTile] = useState(null);

  // Booking
  const [showBooking, setShowBooking] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Feedback & reviews
  const [reviews, setReviews] = useState([]);
  const [reviewLimit, setReviewLimit] = useState(3);
  const [reviewtemp , setReviewTemp] = useState(0);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: '5', message: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const [contactInfo, setContactInfo] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const [username, setUsername] = useState("");
  const initial = username.trim().charAt(0).toUpperCase() || 'G';
  const avatarColor = colorForName(username);

  useEffect(() => {
    fetchProperty();
    fetchReviews();
    contactUs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:8000/propertyzone/details/${id}/`, {
        withCredentials: true,
      });
      const data = response.data.seller || response.data.rent || response.data;
      setProperty(data);
      setActiveTile(null);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError('Could not load this property.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/propertyzone/buildingreviews/${id}/`, {
        withCredentials: true,
      });
      const data = response.data.review || response.data;
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      // No reviews yet, or endpoint not set up — fail quietly, the section
      // still works for submitting the first review.
      console.error(err.response?.data || err.message);
    }
  };

  const contactUs = async () => {
    axios.get(`http://localhost:8000/propertyzone/contactus/`)
            .then((response) => {
                setContactInfo(response.data.data || response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    
    const name = localStorage.getItem("username");
        setUsername(name);

    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  // }, []);
  }
  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/login');
  };


  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.message.trim()) {
      setReviewError('Please fill in your name and feedback.');
      return;
    }

    setReviewSubmitting(true);
    setReviewError('');
    try {
      const response = await axios.post(
        'http://localhost:8000/propertyzone/buildingreview/',
        {
          property_id: id,
          name: reviewForm.name.trim(),
          rating: Number(reviewForm.rating),
          message: reviewForm.message.trim(),
        },
        { withCredentials: true }
      );

      // const savedReview = response.data.data || response.data || {
      //   name: reviewForm.name.trim(),
      //   rating: Number(reviewForm.rating),
      //   message: reviewForm.message.trim(),
      // };

      // setReviews((prev) => [savedReview, ...prev]);
      setReviewForm({ name: '', rating: '5', message: '' });
      setReviewSubmitted(true);
      setTimeout(() => setReviewSubmitted(false), 3000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setReviewError('Could not submit your feedback. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime) {
      setBookingError('Please select both a date and a time.');
      return;
    }

    setBookingSubmitting(true);
    setBookingError('');
    setBookingMessage('');
    try {
      await axios.post(
        'http://localhost:8000/propertyzone/booking/',
        {
          property_id: id,
          booking_date: bookingDate,
          booking_time: bookingTime,
        },
        { withCredentials: true }
      );
      setBookingMessage('Appointment booked! We\u2019ll confirm shortly.');
      setBookingDate('');
      setBookingTime('');
    } catch (err) {
      console.error(err.response?.data || err.message);
      setBookingError('Could not book this appointment. Please try again.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen font-body bg-stone">
        <main className="w-full min-h-screen flex items-center justify-center">
          <p className="text-inksoft/50 text-sm">Loading property…</p>
        </main>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="w-full min-h-screen font-body bg-stone">
        <main className="w-full min-h-screen flex items-center justify-center px-[4vw]">
          <div className="bg-white rounded-2xl shadow-[0_16px_40px_rgba(20,32,58,0.08)] px-8 py-14 text-center max-w-md">
            <p className="text-red-500 text-sm mb-6">{error || 'Property not found.'}</p>
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="bg-gold text-ink font-semibold rounded-full px-7 py-3 hover:-translate-y-0.5 transition-transform"
            >
              Back to Properties
            </button>
          </div>
        </main>
      </div>
    );
  }


  const isRent = property.rent !== undefined && property.rent !== null && property.rent !== '';
  const priceLabel = isRent ? `${property.rent} / month` : property.price;
  const isBuilder = (property.role || '').toLowerCase() === 'builder';
  const facilities = parseFacilities(property.facilities);
  const hasLandmarks = NEAREST_KEYS.some(
    ({ key }) => property[`${key}Address`] || property[`${key}Link`]
  );

  // additionalImages is a single collage URL. additionalImagesCount is the
  // number of original photos baked into it — the backend needs to send this
  // alongside the collage, since the frontend can't infer it from the image
  // alone (the last grid row can contain blank padding tiles).
  const collageUrl = property.additionalImages
    ? `http://localhost:8000${property.additionalImages}`
    : null;
  const collageCount =
    Number(
      property.additionalImageCount ??
        property.additionalImagesCount ??
        property.additional_image_count ??
        property.additional_images_count ??
        0
    ) || 0;
  const { cols: collageCols } = collageGrid(collageCount || 1);
  const thumbCount = Math.min(collageCount, MAX_ADDITIONAL_THUMBS);

  const heroIsTile = activeTile !== null && collageUrl;

  return (
    <div className="w-full min-h-screen font-body bg-stone">
      <header className="bg-ink text-white/85"
        // id="home"
        // className="relative min-h-screen flex flex-col text-white bg-cover bg-center"
        // style={{
        //   backgroundImage:
        //     "linear-gradient(180deg, rgba(20,32,58,0.75) 0%, rgba(20,32,58,0.55) 45%, rgba(20,32,58,0.85) 100%), url('https://picsum.photos/seed/propertyzone-hero/1600/1000')",
        // }}
      >
        <nav className="flex items-center justify-between px-[4vw] py-7">
          <div className="font-display text-2xl font-bold">Property Zone</div>

          <ul className="flex items-center gap-9 text-sm font-medium">
            <li><a href="/home" className="relative pb-1 hover:text-gold transition-colors">Home</a></li>
            <li><a href="/aboutus" className="relative pb-1 hover:text-gold transition-colors">About Us</a></li>
            <li><a href="#contactus" className="relative pb-1 hover:text-gold transition-colors">Contact Us</a></li>
            <li><a href="/help" className="relative pb-1 hover:text-gold transition-colors">Help</a></li>
          </ul>
          
          <div className="flex items-center gap-5">
            <a
              href="/booking"
              aria-label="Bookings"
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
            <BookingIcon className="w-6 h-6" />
            </a>

            {/* Profile icon + dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                aria-label="Profile"
                aria-expanded={showProfileMenu}
                onClick={() => setShowProfileMenu((prev) => !prev)}
                // className="p-2 rounded-full border border-white/70 hover:bg-gold hover:border-gold hover:text-ink transition-colors"
              ><div
                className="cursor-pointer w-8 h-8 rounded-full flex items-center justify-center font-display text-2xl font-semibold"
                style={{ backgroundColor: avatarColor }}
                >
                  {initial}
                </div>
                {/* <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                > */}
                  {/* <circle cx="12" cy="8" r="3.5" />
                  <path strokeLinecap="round" d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
                </svg> */}
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-white text-ink rounded-xl shadow-[0_16px_32px_rgba(20,32,58,0.18)] overflow-hidden z-50">
                  <div className="px-5 py-4 border-b border-ink/10">
                    <p className="text-xs text-inksoft/50 mb-0.5">Signed in as</p>
                    <p className="font-display font-semibold text-lg truncate">{username}</p>
                  </div>
                  <div className="flex flex-col p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/editprofile');
                      }}
                      className="cursor-pointer text-left px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-stone transition-colors"
                    >
                      Edit Profile
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="cursor-pointer text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>
      <main className="w-full min-h-screen px-[4vw] py-12">
        <div className="max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="cursor-pointer text-sm font-semibold text-inksoft/60 hover:text-ink transition-colors mb-6"
          >
            ← Back
          </button>

          {/* Image gallery */}
          <div className="mb-8">
            <div className="h-[420px] rounded-2xl overflow-hidden bg-stone-dark shadow-[0_16px_40px_rgba(20,32,58,0.08)] flex items-center justify-center">
              {heroIsTile ? (
                <div
                  className="h-[420px] w-[420px]"
                  style={collageTileStyle(collageUrl, activeTile, collageCols, 420)}
                />
              ) : property.propertyImage ? (
                <img
                  src={`http://localhost:8000${property.propertyImage}`}
                  alt={property.buildingName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <p className="text-inksoft/30">No image available</p>
              )}
            </div>

            {(property.propertyImage || thumbCount > 0) && (
              <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
                {property.propertyImage && (
                  <button
                    type="button"
                    onClick={() => setActiveTile(null)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      activeTile === null ? 'border-gold' : 'border-transparent'
                    }`}
                  >
                    <img src={`http://localhost:8000${property.propertyImage}`} alt="Main" className="w-full h-full object-cover" />
                  </button>
                )}

                {Array.from({ length: thumbCount }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveTile(i)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      activeTile === i ? 'border-gold' : 'border-transparent'
                    }`}
                    style={collageTileStyle(collageUrl, i, collageCols, 80)}
                    aria-label={`View additional image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-gold">
                    {property.propertyType}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-sage">
                    {isRent ? 'For Rent' : 'For Sale'}
                  </span>
                </div>
                <h1 className="font-display font-semibold text-3xl text-ink mb-2">{property.buildingName}</h1>
                <p className="text-inksoft/60 text-sm">
                  {[property.address, property.city, property.pincode].filter(Boolean).join(', ')}
                </p>
              </div>

              {/* Quick facts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {property.rooms && (
                  <div className="bg-white rounded-xl border border-ink/10 px-4 py-4 text-center">
                    <p className="font-display text-xl font-semibold text-ink">{property.rooms} BHK</p>
                    <p className="text-xs text-inksoft/50 mt-1">Configuration</p>
                  </div>
                )}
                {(property.sqft || property.area) && (
                  <div className="bg-white rounded-xl border border-ink/10 px-4 py-4 text-center">
                    <p className="font-display text-xl font-semibold text-ink">{property.sqft || property.area}</p>
                    <p className="text-xs text-inksoft/50 mt-1">Sq. Ft.</p>
                  </div>
                )}
                {property.parking && (
                  <div className="bg-white rounded-xl border border-ink/10 px-4 py-4 text-center">
                    <p className="font-display text-lg font-semibold text-ink">{property.parking}</p>
                    <p className="text-xs text-inksoft/50 mt-1">Parking</p>
                  </div>
                )}
                {property.propertyType && (
                  <div className="bg-white rounded-xl border border-ink/10 px-4 py-4 text-center">
                    <p className="font-display text-lg font-semibold text-ink">{property.propertyType}</p>
                    <p className="text-xs text-inksoft/50 mt-1">Type</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {property.description && (
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink mb-3">Description</h2>
                  <p className="text-inksoft/70 leading-relaxed whitespace-pre-line">{property.description}</p>
                </div>
              )}

              {/* Facilities & amenities */}
              {facilities.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink mb-3">Facilities &amp; Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {facilities.map((facility, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full bg-white border border-ink/10 text-sm text-inksoft/70"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Nearby landmarks */}
              {hasLandmarks && (
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink mb-3">Nearby Landmarks</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {NEAREST_KEYS.map(({ key, label }) => {
                      const address = property[`${key}Address`];
                      const link = property[`${key}Link`];
                      if (!address && !link) return null;
                      return (
                        <div key={key} className="bg-white rounded-xl border border-ink/10 p-4">
                          <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-1">{label}</p>
                          {address && <p className="text-sm text-inksoft/70 mb-1">{address}</p>}
                          {link && (
                            <a href={link} target="_blank" rel="noreferrer" className="text-sm font-semibold text-gold hover:underline">
                              View on map →
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Additional details */}
              {property.additionalDetails && (
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink mb-3">Additional Details</h2>
                  <p className="text-inksoft/70 leading-relaxed whitespace-pre-line">{property.additionalDetails}</p>
                </div>
              )}
            </div>

            {/* Sidebar: price + contact + builder — sticks together while scrolling */}
            <div className="flex flex-col gap-5 sticky top-6 self-start">
              <div className="bg-white rounded-2xl border border-ink/10 p-6">
                <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-1">
                  {isRent ? 'Monthly Rent' : 'Price'}
                </p>
                <p className="font-display text-3xl font-semibold text-ink mb-6">₹{priceLabel}</p>

                <div className="flex flex-col gap-3 text-sm">
                  {property.name && (
                    <div>
                      <p className="text-inksoft/50 text-xs mb-0.5">Contact Name</p>
                      <p className="text-ink font-medium">{property.name}</p>
                    </div>
                  )}
                  {property.contact && (
                    <div>
                      <p className="text-inksoft/50 text-xs mb-0.5">Contact No.</p>
                      <p className="text-ink font-medium">{property.contact}</p>
                    </div>
                  )}
                  {property.email && (
                    <div>
                      <p className="text-inksoft/50 text-xs mb-0.5">Email</p>
                      <p className="text-ink font-medium truncate">{property.email}</p>
                    </div>
                  )}
                </div>

                {property.mapLink && (
                  <a
                    href={property.mapLink}
                    target="_blank"
                    rel="noreferrer"
                    // className="block text-center mt-6 border border-ink/15 text-ink font-semibold rounded-full py-3 text-sm hover:bg-stone transition-colors"
                    className="block text-center mt-3 bg-gold text-ink font-semibold rounded-full py-3 text-sm hover:-translate-y-0.5 transition-transform"

                  >
                    View on Map
                  </a>
                )}

                {/* <a
                  href={property.contact ? `tel:${property.contact}` : '#'}
                  className="block text-center mt-3 bg-gold text-ink font-semibold rounded-full py-3 text-sm hover:-translate-y-0.5 transition-transform"
                >
                  Contact Now
                </a> */}

                <button
                  type="button"
                  onClick={() => {
                    setShowBooking((prev) => !prev);
                    setBookingMessage('');
                    setBookingError('');
                  }}
                  className="block w-full text-center mt-3 border border-ink/15 text-ink font-semibold rounded-full py-3 text-sm hover:bg-stone transition-colors"
                >
                  {showBooking ? 'Cancel Booking' : 'Book Appointment'}
                </button>

                {showBooking && (
                  <form onSubmit={handleBookingSubmit} className="mt-4 flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-inksoft/60">Date</label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-ink/10 bg-white text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-inksoft/60">Time</label>
                      <input
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-ink/10 bg-white text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>

                    {bookingError && <p className="text-red-500 text-xs">{bookingError}</p>}
                    {bookingMessage && <p className="text-sage text-xs font-medium">{bookingMessage}</p>}

                    <button
                      type="submit"
                      disabled={bookingSubmitting}
                      className="w-full bg-gold text-ink font-semibold rounded-full py-2.5 text-sm hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:translate-y-0"
                    >
                      {bookingSubmitting ? 'Booking…' : 'Confirm Booking'}
                    </button>
                  </form>
                )}
              </div>

              {isBuilder && (property.builderOfficeName || property.officeAddress || property.builderOfficeAddress || property.builderWorkExperience || property.builderExperience) && (
                <div className="bg-ink text-white rounded-2xl p-6">
                  <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-4">Builder Details</p>
                  <div className="flex flex-col gap-3 text-sm">
                    {property.builderOfficeName && (
                      <div>
                        <p className="text-white/50 text-xs mb-0.5">Office Name</p>
                        <p className="font-medium">{property.builderOfficeName}</p>
                      </div>
                    )}
                    {(property.officeAddress || property.builderOfficeAddress) && (
                      <div>
                        <p className="text-white/50 text-xs mb-0.5">Office Address</p>
                        <p className="font-medium">{property.officeAddress || property.builderOfficeAddress}</p>
                      </div>
                    )}
                    {(property.builderWorkExperience || property.builderExperience) && (
                      <div>
                        <p className="text-white/50 text-xs mb-0.5">Work Experience</p>
                        <p className="font-medium">{property.builderWorkExperience || property.builderExperience}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feedback & Reviews */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink mb-1">Share Your Feedback</h2>
              <p className="text-inksoft/60 text-sm mb-6">Tell us what you think about this property.</p>

              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-ink">Name</label>
                  <input
                    name="name"
                    value={reviewForm.name}
                    onChange={handleReviewChange}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-white text-ink placeholder:text-inksoft/40 focus:outline-none focus:ring-2 focus:ring-gold transition-shadow"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-ink">Rating</label>
                  <select
                    name="rating"
                    value={reviewForm.rating}
                    onChange={handleReviewChange}
                    className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-gold transition-shadow"
                  >
                    <option value="5">★★★★★ Excellent</option>
                    <option value="4">★★★★☆ Good</option>
                    <option value="3">★★★☆☆ Average</option>
                    <option value="2">★★☆☆☆ Below average</option>
                    <option value="1">★☆☆☆☆ Poor</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-ink">Feedback</label>
                  <textarea
                    name="message"
                    rows="4"
                    value={reviewForm.message}
                    onChange={handleReviewChange}
                    placeholder="Share your thoughts about this property"
                    className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-white text-ink placeholder:text-inksoft/40 focus:outline-none focus:ring-2 focus:ring-gold transition-shadow resize-y"
                  ></textarea>
                </div>

                {reviewError && <p className="text-red-500 text-sm">{reviewError}</p>}
                {reviewSubmitted && <p className="text-sage text-sm font-medium">Thanks for your feedback!</p>}

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-fit bg-gold text-ink font-semibold rounded-full px-7 py-3 hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:translate-y-0"
                >
                  {reviewSubmitting ? 'Submitting…' : 'Submit Feedback'}
                </button>
              </form>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-ink mb-1">Reviews</h2>
              <p className="text-inksoft/60 text-sm mb-6">
                {reviews.length > 0 ? `${reviews.length} review${reviews.length > 1 ? 's' : ''}` : 'No reviews yet — be the first.'}
              </p>

              <div className="flex flex-col gap-4 max-h-[520px] overflow-y-auto pr-1">
                {reviews.slice(reviewtemp,reviewLimit).map((review,i) => (
                  <div key={review.property_id || i} className="bg-white border-l-[3px] border-gold rounded px-6 py-5 shadow-[0_6px_18px_rgba(20,32,58,0.05)]">
                    <div className="tet-gold mxb-2 text-sm" aria-label={`${review.rating} out of 5 stars`}>
                      {'★'.repeat(Number(review.rating) || 0)}
                      {'☆'.repeat(5 - (Number(review.rating) || 0))}
                    </div>
                    <p className="italic text-inksoft/80 leading-relaxed mb-3 text-sm">"{review.message}"</p>
                    <span className="font-semibold text-xs text-sage">— {review.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-10">
              {(reviewLimit < reviews.length) && (
                <button
                  onClick={() => {
                    setReviewLimit((prev) => prev + 3);
                    setReviewTemp((prev) => prev + 3);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Load More
                </button>
              )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer id="contactus" className="bg-ink text-white/85 px-[4vw] pt-16 pb-6">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] md:grid-cols-2 gap-10 max-w-6xl mx-auto mb-10">
          <div>
            <div className="font-display text-2xl font-bold text-white">{contactInfo?.title || 'property zone'}</div>
            <p className="mt-3.5 text-white/55 text-sm leading-relaxed max-w-[280px]">
              {contactInfo?.tagline || 'Helping you find a place that actually feels like yours.'}
            </p>
          </div>


          <div>
            <h4 className="text-xs tracking-widest uppercase text-gold mb-4">Follow</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a
                  href={contactInfo?.instagram || 'https://instagram.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-white/75 hover:text-gold transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={contactInfo?.facebook || 'https://facebook.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-white/75 hover:text-gold transition-colors"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href={contactInfo?.twitter || 'https://twitter.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-white/75 hover:text-gold transition-colors"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href={contactInfo?.linkedin || 'https://linkedin.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-white/75 hover:text-gold transition-colors"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs tracking-widest uppercase text-gold mb-4">Contact</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a
                  href={`mailto:${contactInfo?.email || 'hello@propertyzone.com'}`}
                  className="text-sm text-white/75 hover:text-gold transition-colors"
                >
                  {contactInfo?.email || 'hello@propertyzone.com'}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${contactInfo?.phone || '+911234567890'}`}
                  className="text-sm text-white/75 hover:text-gold transition-colors"
                >
                  {contactInfo?.phone || '+91 12345 67890'}
                </a>
              </li>
              {contactInfo?.address && (
                <li className="text-sm text-white/55 leading-relaxed">{contactInfo.address}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-white/10 text-xs text-white/50">
          <span>© {new Date().getFullYear()} Property Zone. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
