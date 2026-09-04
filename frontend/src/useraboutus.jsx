import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

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

export default function AboutUs() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [contactInfo, setContactInfo] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const [username, setUsername] = useState("");
  const initial = username.trim().charAt(0).toUpperCase() || 'G';
  const avatarColor = colorForName(username);

  useEffect(() => {
    fetchAboutUs();
    contactUs();
  }, []);

  const fetchAboutUs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8000/propertyzone/aboutus/', {
        withCredentials: true,
      });
      const data = response.data.data || response.data;
      setAbout(data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError('Could not load About Us content.');
    } finally {
      setLoading(false);
    }
  };

  const contactUs = async () => {
    // axios.get(`http://localhost:8000/propertyzone/contactus/`)
    //         .then((response) => {
    //             setContactInfo(response.data.data || response.data);
    //         })
    //         .catch((error) => {
    //             console.log(error);
    //         });
    
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

  if (loading) {
    return (
      <div className="w-full min-h-screen font-body bg-stone">
        <main className="w-full min-h-screen flex items-center justify-center">
          <p className="text-inksoft/50 text-sm">Loading…</p>
        </main>
      </div>
    );
  }

  if (error || !about) {
    return (
      <div className="w-full min-h-screen font-body bg-stone">
        <main className="w-full min-h-screen flex items-center justify-center px-[4vw]">
          <div className="bg-white rounded-2xl shadow-[0_16px_40px_rgba(20,32,58,0.08)] px-8 py-14 text-center max-w-md">
            <p className="text-red-500 text-sm mb-6">{error || 'About Us content not found.'}</p>
            <button
              type="button"
              onClick={fetchAboutUs}
              className="bg-gold text-ink font-semibold rounded-full px-7 py-3 hover:-translate-y-0.5 transition-transform"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Stats can arrive either as a ready-made array (about.stats = [{label, value}])
  // or as flat fields — support both without assuming which one the backend sends.
  const stats =
    Array.isArray(about.stats) && about.stats.length > 0
      ? about.stats
      : [
          about.totalProperties && { label: 'Properties Listed', value: about.totalProperties },
          about.totalUsers && { label: 'Happy Users', value: about.totalUsers },
          about.totalCities && { label: 'Cities Covered', value: about.totalCities },
          about.foundedYear && { label: 'Founded', value: about.foundedYear },
        ].filter(Boolean);

  const team = Array.isArray(about.teamMembers) ? about.teamMembers : [];

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
            {/* <li><a href="/aboutus" className="relative pb-1 hover:text-gold transition-colors">About Us</a></li> */}
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <span className="uppercase text-xs tracking-widest text-gold font-semibold mb-2 inline-block">
              About Us
            </span>
            <h1 className="font-display font-semibold text-4xl text-ink mb-3">
              {about.title || 'About Property Zone'}
            </h1>
            {about.tagline && <p className="text-inksoft/60 text-lg">{about.tagline}</p>}
          </div>

          {/* Banner image */}
          {about.image && (
            <div className="h-[320px] rounded-2xl overflow-hidden mb-10 shadow-[0_16px_40px_rgba(20,32,58,0.08)]">
              <img
                src={`http://localhost:8000${about.image}`}
                alt={about.title || 'About Property Zone'}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          {about.description && (
            <div className="bg-white rounded-2xl border border-ink/10 p-8 mb-8">
              <p className="text-inksoft/70 leading-relaxed whitespace-pre-line">{about.description}</p>
            </div>
          )}

          {/* Stats */}
          {stats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white rounded-xl border border-ink/10 px-4 py-6 text-center">
                  <p className="font-display text-2xl font-semibold text-ink">{stat.value}</p>
                  <p className="text-xs text-inksoft/50 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Mission & Vision */}
          {(about.mission || about.vision) && (
            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              {about.mission && (
                <div className="bg-white rounded-2xl border border-ink/10 p-6">
                  <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-2">Our Mission</p>
                  <p className="text-inksoft/70 leading-relaxed whitespace-pre-line">{about.mission}</p>
                </div>
              )}
              {about.vision && (
                <div className="bg-white rounded-2xl border border-ink/10 p-6">
                  <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-2">Our Vision</p>
                  <p className="text-inksoft/70 leading-relaxed whitespace-pre-line">{about.vision}</p>
                </div>
              )}
            </div>
          )}

          {/* Team */}
          {team.length > 0 && (
            <div className="mb-10">
              <h2 className="font-display text-2xl font-semibold text-ink mb-5">Meet the Team</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {team.map((member, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-ink/10 p-5 text-center">
                    {member.image ? (
                      <img
                        src={`http://localhost:8000${member.image}`}
                        alt={member.name}
                        className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-ink text-white flex items-center justify-center font-display text-xl font-semibold mx-auto mb-3">
                        {(member.name || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <p className="font-display font-semibold text-ink">{member.name}</p>
                    {member.role && <p className="text-xs text-inksoft/50 mt-0.5">{member.role}</p>}
                    {member.bio && <p className="text-xs text-inksoft/60 mt-2 leading-relaxed">{member.bio}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact info */}
          {(about.email || about.phone || about.address || about.instagram || about.facebook) && (
            <div id="contactus" className="bg-ink text-white rounded-2xl p-8">
              <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-4">Get in Touch</p>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {about.email && (
                  <div>
                    <p className="text-white/50 text-xs mb-0.5">Email</p>
                    <a href={`mailto:${about.email}`} className="font-medium hover:text-gold transition-colors">
                      {about.email}
                    </a>
                  </div>
                )}
                {about.phone && (
                  <div>
                    <p className="text-white/50 text-xs mb-0.5">Phone</p>
                    <a href={`tel:${about.phone}`} className="font-medium hover:text-gold transition-colors">
                      {about.phone}
                    </a>
                  </div>
                )}
                {about.address && (
                  <div className="sm:col-span-2">
                    <p className="text-white/50 text-xs mb-0.5">Address</p>
                    <p className="font-medium">{about.address}</p>
                  </div>
                )}
                {(about.instagram || about.facebook) && (
                  <div className="sm:col-span-2 flex gap-4 pt-2">
                    {about.instagram && (
                      <a
                        href={about.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium hover:text-gold transition-colors"
                      >
                        Instagram
                      </a>
                    )}
                    {about.facebook && (
                      <a
                        href={about.facebook}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium hover:text-gold transition-colors"
                      >
                        Facebook
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
