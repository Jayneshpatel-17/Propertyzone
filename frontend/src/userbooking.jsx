import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const statusClass = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'confirmed') return 'bg-sage/10 text-sage';
  if (s === 'cancelled') return 'bg-red-50 text-red-500';
  return 'bg-gold/10 text-gold'; // Pending
};

const AVATAR_COLORS = ['#C9A227', '#4B6358', '#8A5A44', '#5C6B8A', '#A8632C', '#6B5B95'];

function colorForName(name) {
  const sum = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}


export default function UserBooking() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactInfo, setContactInfo] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const [username, setUsername] = useState("");
  const initial = username.trim().charAt(0).toUpperCase() || 'G';
  const avatarColor = colorForName(username);

  useEffect(() => {
    fetchBookings();
    contactUs();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8000/propertyzone/mycreatedbookings/', {
        withCredentials: true,
      });
      const data = response.data.data || response.data;
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError('Could not load your bookings.');
    } finally {
      setLoading(false);
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
      <main className="w-full  min-h-screen px-[4vw] py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <span className="uppercase text-xs tracking-widest text-gold font-semibold mb-2 inline-block">
              Appointments
            </span>
            <h1 className="font-display font-semibold text-3xl text-ink mb-2">My Bookings</h1>
            <p className="text-inksoft/60 text-sm">Site-visit appointments you've booked, and their current status.</p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <p className="text-inksoft/50 text-sm">Loading your bookings…</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-white rounded-2xl shadow-[0_16px_40px_rgba(20,32,58,0.08)] px-8 py-14 text-center">
              <p className="text-red-500 text-sm mb-6">{error}</p>
              <button
                type="button"
                onClick={fetchBookings}
                className="bg-gold text-ink font-semibold rounded-full px-7 py-3 hover:-translate-y-0.5 transition-transform"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && bookings.length === 0 && (
            <div className="bg-white rounded-2xl shadow-[0_16px_40px_rgba(20,32,58,0.08)] px-8 py-14 text-center">
              <h2 className="font-display text-xl font-semibold text-ink mb-2">No bookings yet</h2>
              <p className="text-inksoft/60 text-sm mb-6">
                Book a site visit from any property's details page to see it here.
              </p>
              <a
                href="/home"
                className="inline-block bg-gold text-ink font-semibold rounded-full px-7 py-3 hover:-translate-y-0.5 transition-transform"
              >
                Browse Properties
              </a>
            </div>
          )}

          {!loading && !error && bookings.length > 0 && (
            <div className="flex flex-col gap-4">
              {bookings.map((b, i) => (
                <div
                  key={b.id || i}
                  className="bg-white rounded-2xl border border-ink/10 px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
                >
                  {/* Property info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-display text-lg font-semibold text-ink truncate">
                        {b.propertyName}
                      </h2>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0 ${
                          b.dealType === 'Rent' ? 'bg-sage/10 text-sage' : 'bg-gold/10 text-gold'
                        }`}
                      >
                        {b.dealType}
                      </span>
                    </div>
                    <p className="text-xs text-inksoft/50">{b.propertyType}</p>
                  </div>

                  {/* Date & time */}
                  <div className="sm:w-40 shrink-0">
                    <p className="text-xs text-inksoft/50 mb-0.5">Date &amp; Time</p>
                    <p className="text-sm font-medium text-ink">{b.bookingDate}</p>
                    <p className="text-xs text-inksoft/60">{b.bookingTime}</p>
                  </div>

                  {/* Status */}
                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 text-center ${statusClass(b.status)}`}
                  >
                    {b.status || 'Pending'}
                  </span>

                  {/* View property */}
                  {b.propertyId && (
                    <a
                      href={`/details/${b.propertyId}`}
                      className="text-xs font-semibold text-gold hover:underline shrink-0"
                    >
                      View Property →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
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
