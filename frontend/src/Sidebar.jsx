import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Edit Profile', to: '/editprofileseller' },
  { label: 'Sell', to: '/dashboard/sell' },
  { label: 'Rent', to: '/dashboard/rent' },
  { label: 'Property', to: '/dashboard/property' },
  { label: 'Booking', to: '/dashboard/booking' },
  { label: 'Reviews', to: '/dashboard/reviews' },
  { label: 'Home', to: '/dashboard/home' },
  { label: 'About Us', to: '/dashboard/aboutus' },
  { label: 'Contact Us', to: '/dashboard/contact' },
  { label: 'Help', to: '/dashboard/help' },
];

// A small, fixed palette so each username consistently gets the same
// avatar color (deterministic, not re-randomized on every render).
const AVATAR_COLORS = ['#C9A227', '#4B6358', '#8A5A44', '#5C6B8A', '#A8632C', '#6B5B95'];

function colorForName(name) {
  const sum = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const userName = localStorage.getItem('username') || 'Guest';
  const initial = userName.trim().charAt(0).toUpperCase() || 'G';
  const avatarColor = colorForName(userName);

  // const handleLogout = () => {
  //   localStorage.removeItem('username');
  //   navigate('/login');
  // };

  const handleLogout = async () => {

  try {

    await fetch(
      "http://localhost:8000/propertyzone/logout/",
      {
        method: "POST",
        credentials: "include",
      }
    );

  } catch (error) {
    console.error(error);
  }

  localStorage.removeItem("username");

  navigate("/login");
};

  return (
    <aside className="fixed top-0 left-0 w-1/5 h-screen overflow-y-auto bg-ink text-white flex flex-col justify-between px-5 py-8 z-40">
      <div>
        {/* Profile */}
        <div className="flex flex-col items-center text-center mb-10">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center font-display text-2xl font-semibold"
            style={{ backgroundColor: avatarColor }}
          >
            {initial}
          </div>
          <p className="mt-3 font-display text-lg font-semibold truncate max-w-full">{userName}</p>
        </div>

        {/* Nav links */}
        <nav>
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map(({ label, to }) => {
              const isActive = location.pathname === to;
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-gold text-ink' : 'text-white/75 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

            <br />
      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full border border-white/20 text-white font-semibold rounded-full py-2.5 text-sm hover:bg-red-500 hover:border-red-500 transition-colors"
      >
        Logout
      </button>
    </aside>
  );
}
