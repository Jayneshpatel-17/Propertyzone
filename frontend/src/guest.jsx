import { Link } from 'react-router-dom';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { data, useNavigate } from 'react-router-dom';
import axios from 'axios';



export default function GuestPage() {
const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ name: '', rating: '5', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [search, setSearch] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  // Replace with the actual logged-in user's name (e.g. from context, a decoded
  // JWT, or a /propertyzone/profile/ API call) — falls back to a stored value.
  const [username, setUsername] = useState("");
  const [builders, setBuilders] = useState([]);
  const [persons, setPersons] = useState([]);
  const [builderLimit, setBuilderLimit] = useState(6);
  const [personLimit, setPersonLimit] = useState(6);
  const [reviewLimit, setReviewLimit] = useState(6);
  const [temp , setTemp] = useState(0);
  const [reviewtemp , setReviewTemp] = useState(0);
  const [contactInfo, setContactInfo] = useState(null);


  useEffect(() => {
    axios.get("http://localhost:8000/propertyzone/guest/")
            .then((response) => {

                setBuilders(response.data.seller);
                setPersons(response.data.buyer);
                setReviews(response.data.review);
            })
            .catch((error) => {

                console.log(error);

            });

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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/login');
  };

  const filteredBuilders = useMemo(() => {
    const term = search.toLowerCase();

    if(term == 'sell'){
      return builders;
    }
    
    return builders.filter(builder => 
        builder.buildingName.toLowerCase().includes(term) ||
        builder.description.toLowerCase().includes(term) ||
        builder.price.toString().toLowerCase().includes(term)
    );
    
}, [builders, search]);

const filteredPersons = useMemo(() => {
    const term = search.toLowerCase();

    if(term == 'rent'){
      return persons;
    }

    return persons.filter(person =>
        person.buildingName.toLowerCase().includes(term) ||
        person.description.toLowerCase().includes(term) ||
        person.rent.toString().toLowerCase().includes(term)
    );
}, [persons, search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
      navigate('/login')
    };

  const formatPrice = (price) => {
  const amount = Number(price);

  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
  }

  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(2).replace(/\.00$/, "")} Lakh`;
  }

  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(2).replace(/\.00$/, "")} Thousand`;
  }

  return amount.toLocaleString("en-IN");
};

  return (
    <div className="w-full font-body text-ink bg-stone">
      {/* Section 1: Navbar + full-page hero photo */}
      <header
        id="home"
        className="relative min-h-screen flex flex-col text-white bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(20,32,58,0.75) 0%, rgba(20,32,58,0.55) 45%, rgba(20,32,58,0.85) 100%), url('https://picsum.photos/seed/propertyzone-hero/1600/1000')",
        }}
      >
        <nav className="flex items-center justify-between px-[4vw] py-7">
          <div className="font-display text-2xl font-bold">Property Zone</div>
          <ul className="flex items-center gap-9 text-sm font-medium">
            <li><a href="/aboutus" className="relative pb-1 hover:text-gold transition-colors">About Us</a></li>
            <li><a href="#contactus" className="relative pb-1 hover:text-gold transition-colors">Contact Us</a></li>
            {/* <li><a href="/help" className="relative pb-1 hover:text-gold transition-colors">Help</a></li> */}
            <li>
              <Link to="/login" className="border border-white/90 rounded-full px-5 py-2 hover:bg-gold hover:border-gold hover:text-ink transition-colors">
                Login
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex-1 flex flex-col justify-center max-w-xl px-[4vw]">
          <span className="uppercase text-xs tracking-widest text-gold font-semibold mb-3">
            Find your next address
          </span>
          <h1 className="font-display font-semibold leading-[1.08] text-[clamp(2.6rem,5.5vw,4.2rem)] mb-5">
            Properties worth
            <br />
            coming home to.
          </h1>
          <p className="text-white/85 max-w-md mb-8 leading-relaxed">
            Curated listings across the city, vetted for comfort, location and light.
          </p>
          <a
            href="#properties"
            className="w-fit bg-gold text-ink font-semibold rounded-full px-7 py-3.5 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold/30 transition-all"
          >
            Browse Properties
          </a>
        </div>

        <div
          className="absolute left-0 right-0 -bottom-px h-[90px] bg-stone"
          style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 40%, 0 100%)' }}
          aria-hidden="true"
        ></div>
      </header>

      {/* Section 2: Property listings + search */}
      <section id="properties" className="px-[4vw] pt-24 pb-20">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="uppercase text-xs tracking-widest text-gold font-semibold mb-2 inline-block">
            Listings
          </span>
          <h2 className="font-display font-semibold text-4xl mb-2">Featured Properties</h2>
        </div>

        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-inksoft/50"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by property name or description…"
              className="w-full pl-12 pr-4 py-3.5 rounded-full border border-ink/10 bg-white text-ink placeholder:text-inksoft/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold transition-shadow"
            />
          </div>
        </div>

        {filteredBuilders.length === 0 && filteredPersons.length === 0 ? (
          <p className="text-center text-inksoft/60 max-w-md mx-auto">
            No properties match "{search}". Try a different name or area.
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 max-w-6xl mx-auto">
            
            {filteredBuilders.slice(temp, builderLimit).map((builder) => (
              <article
                key={builder.id}
                className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(20,32,58,0.06)] hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(20,32,58,0.12)] transition-all duration-300 group"
              >
                <div className="h-[190px] overflow-hidden">
                  <img
                    src={`http://127.0.0.1:8000${builder.propertyImage}`}
                    alt={builder.buildingName}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="px-6 pt-5 pb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-display text-xl font-semibold">
                      {builder.buildingName}
                    </h3>

                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Sell
                    </span>
                  </div>
                  <p className="text-sm text-inksoft/60 leading-relaxed mb-4">{builder.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sage">~₹{formatPrice(builder.price)}</span>
                    <a href="/login" className="text-sm font-semibold text-gold">
                      View details →
                    </a>
                  </div>
                </div>
              </article>
            ))}
            {filteredPersons.slice(temp, personLimit).map((person) => (
              <article
                key={person.id}
                className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(20,32,58,0.06)] hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(20,32,58,0.12)] transition-all duration-300 group"
              >
                <div className="h-[190px] overflow-hidden">
                  <img
                    src={`http://127.0.0.1:8000${person.propertyImage}`}
                    alt={person.buildingName}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="px-6 pt-5 pb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-display text-xl font-semibold">
                      {person.buildingName}
                    </h3>

                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Rent
                    </span>
                  </div>
                  <p className="text-sm text-inksoft/60 leading-relaxed mb-4">{person.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sage">~₹{formatPrice(person.rent)}</span>
                    <a href="/login" className="text-sm font-semibold text-gold">
                      View details →
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
          )}
          <div className="flex justify-center mt-10">
              {(builderLimit < builders.length || personLimit < persons.length) && (
                <button
                  onClick={() => {
                    setBuilderLimit((prev) => prev + 6);
                    setPersonLimit((prev) => prev + 6);
                    setTemp((prev) => prev + 6);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Load More
                </button>
              )}
          </div>
      </section>

      {/* Section 3: Review / feedback form */}
      <section id="feedback" className="bg-ink text-white px-[4vw] py-22">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="uppercase text-xs tracking-widest text-gold font-semibold mb-2 inline-block">
            Your Voice
          </span>
          <h2 className="font-display font-semibold text-4xl mb-2 text-white">Share Your Feedback</h2>
          <p className="text-white/65">Tell us about your search, your stay, or your new address.</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="hm-name" className="text-sm tracking-wide text-white/70">
              Name
            </label>
            <input
              id="hm-name"
              name="name"
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              required
              className="bg-inksoft border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="hm-rating" className="text-sm tracking-wide text-white/70">
              Rating
            </label>
            <select
              id="hm-rating"
              name="rating"
              value={form.rating}
              onChange={handleChange}
              className="bg-inksoft border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="5">★★★★★ Excellent</option>
              <option value="4">★★★★☆ Good</option>
              <option value="3">★★★☆☆ Average</option>
              <option value="2">★★☆☆☆ Below average</option>
              <option value="1">★☆☆☆☆ Poor</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="hm-message" className="text-sm tracking-wide text-white/70">
              Feedback
            </label>
            <textarea
              id="hm-message"
              name="message"
              rows="4"
              placeholder="Tell us about your experience"
              value={form.message}
              onChange={handleChange}
              required
              className="bg-inksoft border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/40 resize-y focus:outline-none focus:ring-2 focus:ring-gold"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-fit bg-gold text-ink font-semibold rounded-full px-7 py-3.5 hover:-translate-y-0.5 transition-transform"
          >
            Submit Feedback
          </button>
          {submitted && <p className="text-gold text-sm">Thanks — your feedback has been added below.</p>}
        </form>
      </section>

      {/* Section 4: All reviews */}
      <section id="reviews" className="px-[4vw] py-24">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="uppercase text-xs tracking-widest text-gold font-semibold mb-2 inline-block">
            Testimonials
          </span>
          <h2 className="font-display font-semibold text-4xl">What Guests Say</h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-7 max-w-5xl mx-auto">
          {reviews.slice(reviewtemp,reviewLimit).map((r, i) => (
            <div
              key={i}
              className="bg-white border-l-[3px] border-gold rounded px-7 py-6 shadow-[0_6px_18px_rgba(20,32,58,0.05)]"
            >
              <div className="text-gold mb-3" aria-label={`${r.rating} out of 5 stars`}>
                {'★'.repeat(r.rating)}
                {'☆'.repeat(5 - r.rating)}
              </div>
              <p className="italic text-inksoft leading-relaxed mb-4">"{r.message}"</p>
              <span className="font-semibold text-sm text-sage">— {r.name}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-10">
              {(reviewLimit < reviews.length) && (
                <button
                  onClick={() => {
                    setReviewLimit((prev) => prev + 6);
                    setReviewTemp((prev) => prev + 6);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Load More
                </button>
              )}
          </div>
      </section>

      {/* Section 5: Footer — contact, socials, quick links */}
      <footer id="contactus" className="bg-ink text-white/85 px-[4vw] pt-16 pb-6">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] md:grid-cols-2 gap-10 max-w-6xl mx-auto mb-10">
          <div>
            <div className="font-display text-2xl font-bold text-white">Property Zone</div>
            <p className="mt-3.5 text-white/55 text-sm leading-relaxed max-w-[280px]">
              Helping you find a place that actually feels like yours.
            </p>
          </div>

          <div>
            <h4 className="text-xs tracking-widest uppercase text-gold mb-4">Quick Links</h4>
            <ul className="flex flex-col gap-2.5">
              <li><a href="#home" className="text-sm text-white/75 hover:text-gold transition-colors">Home</a></li>
              <li><a href="#properties" className="text-sm text-white/75 hover:text-gold transition-colors">Properties</a></li>
              <li><a href="#feedback" className="text-sm text-white/75 hover:text-gold transition-colors">Feedback</a></li>
              <li><a href="#reviews" className="text-sm text-white/75 hover:text-gold transition-colors">Reviews</a></li>
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
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-white/10 text-xs text-white/50">
          <span>© {new Date().getFullYear()} Property Zone. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
