import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';

export default function AboutUs() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAboutUs();
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

  if (loading) {
    return (
      <div className="w-full min-h-screen font-body bg-stone">
        <Sidebar />
        <main className="w-4/5 ml-[20%] min-h-screen flex items-center justify-center">
          <p className="text-inksoft/50 text-sm">Loading…</p>
        </main>
      </div>
    );
  }

  if (error || !about) {
    return (
      <div className="w-full min-h-screen font-body bg-stone">
        <Sidebar />
        <main className="w-4/5 ml-[20%] min-h-screen flex items-center justify-center px-[4vw]">
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
      <Sidebar />

      <main className="w-4/5 ml-[20%] min-h-screen px-[4vw] py-12">
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
            <div className="bg-ink text-white rounded-2xl p-8">
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
