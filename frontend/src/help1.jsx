import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import Sidebar from './Sidebar';

const CATEGORY_OPTIONS = [
  'Account',
  'Property Listing',
  'Booking',
  'Technical Issue',
  'Other',
];

const initialForm = {
  category: '',
  subject: '',
  message: '',
};

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

export default function Help() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [contactInfo, setContactInfo] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const [username, setUsername] = useState("");
  const initial = username.trim().charAt(0).toUpperCase() || 'G';
  const avatarColor = colorForName(username);

  useEffect(() => {
    fetchRequests();
    contactUs();
  }, []);

  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/propertyzone/help/', {
        withCredentials: true,
      });
      const data = response.data.data || response.data;
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      // No requests yet, or endpoint not set up — fail quietly, the form
      // still works for submitting a new request.
      console.error(err.response?.data || err.message);
    } finally {
      setRequestsLoading(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.category) next.category = 'Please select a category.';
    if (!form.subject.trim()) next.subject = 'Subject is required.';
    if (!form.message.trim()) next.message = 'Please describe your issue.';
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        'http://localhost:8000/propertyzone/help/',
        {
          category: form.category,
          subject: form.subject.trim(),
          message: form.message.trim(),
        },
        { withCredentials: true }
      );

      const newRequest = response.data.data || response.data || {
        category: form.category,
        subject: form.subject.trim(),
        message: form.message.trim(),
        status: 'Pending',
      };

      setRequests((prev) => [newRequest, ...prev]);
      setForm(initialForm);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setErrors({ submit: 'Could not send your request. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (field) =>
    `w-full px-4 py-3 rounded-xl border bg-white text-ink placeholder:text-inksoft/40 focus:outline-none focus:ring-2 focus:ring-gold transition-shadow ${
      errors[field] ? 'border-red-400' : 'border-ink/10'
    }`;

  const statusClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'resolved') return 'bg-sage/10 text-sage';
    if (s === 'in progress') return 'bg-gold/10 text-gold';
    return 'bg-stone-dark text-inksoft/60';
  };

  return (
    <div className="w-full min-h-screen font-body bg-stone">
      {/* <Sidebar /> */}
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
            {/* <li><a href="/help" className="relative pb-1 hover:text-gold transition-colors">Help</a></li> */}
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
      <main className="w-3/5 ml-[20%] min-h-screen px-[4vw] py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <span className="uppercase text-xs tracking-widest text-gold font-semibold mb-2 inline-block">
              Support
            </span>
            <h1 className="font-display font-semibold text-3xl text-ink mb-2">Help &amp; Support</h1>
            <p className="text-inksoft/60 text-sm">
              Have a question or ran into an issue? Send a message to our admin team below.
            </p>
          </div>

          {/* Request form */}
          <div className="bg-white rounded-2xl shadow-[0_16px_40px_rgba(20,32,58,0.08)] px-8 py-10 mb-10">
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink">Category</label>
                <select name="category" value={form.category} onChange={handleChange} className={fieldClass('category')}>
                  <option value="">Select a category</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs">{errors.category}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink">Subject</label>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="A short summary of your issue"
                  className={fieldClass('subject')}
                />
                {errors.subject && <p className="text-red-500 text-xs">{errors.subject}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink">Message</label>
                <textarea
                  name="message"
                  rows="5"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Describe your issue in detail — the more context, the faster we can help."
                  className={`${fieldClass('message')} resize-y`}
                ></textarea>
                {errors.message && <p className="text-red-500 text-xs">{errors.message}</p>}
              </div>

              {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}
              {submitted && <p className="text-sage text-sm font-medium">Your request has been sent to admin.</p>}

              <button
                type="submit"
                disabled={submitting}
                className="cursor-pointer w-fit bg-gold text-ink font-semibold rounded-full px-7 py-3.5 hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:translate-y-0"
              >
                {submitting ? 'Sending…' : 'Send Request'}
              </button>
            </form>
          </div>

          {/* Previous requests */}
          <div>
            <h2 className="font-display text-xl font-semibold text-ink mb-4">Your Requests</h2>

            {requestsLoading ? (
              <p className="text-inksoft/50 text-sm">Loading…</p>
            ) : requests.length === 0 ? (
              <p className="text-inksoft/50 text-sm">You haven't sent any requests yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {requests.map((r, i) => (
                  <div key={r.id || i} className="bg-white rounded-xl border border-ink/10 px-5 py-4">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <p className="font-semibold text-ink text-sm">{r.subject}</p>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusClass(r.status)}`}>
                        {r.status || 'Pending'}
                      </span>
                    </div>
                    {r.category && <p className="text-xs text-gold font-semibold uppercase tracking-wide mb-1">{r.category}</p>}
                    <p className="text-sm text-inksoft/60 leading-relaxed">{r.message}</p>
                  </div>
                ))}
              </div>
            )}
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
