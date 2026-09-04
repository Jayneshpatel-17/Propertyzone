import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';

export default function ContactUs() {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContactUs();
  }, []);

  const fetchContactUs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8000/propertyzone/contactus/', {
        withCredentials: true,
      });
      const data = response.data.data || response.data;
      setContact(data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError('Could not load Contact Us details.');
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

  if (error || !contact) {
    return (
      <div className="w-full min-h-screen font-body bg-stone">
        <Sidebar />
        <main className="w-4/5 ml-[20%] min-h-screen flex items-center justify-center px-[4vw]">
          <div className="bg-white rounded-2xl shadow-[0_16px_40px_rgba(20,32,58,0.08)] px-8 py-14 text-center max-w-md">
            <p className="text-red-500 text-sm mb-6">{error || 'Contact Us details not found.'}</p>
            <button
              type="button"
              onClick={fetchContactUs}
              className="bg-gold text-ink font-semibold rounded-full px-7 py-3 hover:-translate-y-0.5 transition-transform"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen font-body bg-stone">
      <Sidebar />

      <main className="w-4/5 ml-[20%] min-h-screen px-[4vw] py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <span className="uppercase text-xs tracking-widest text-gold font-semibold mb-2 inline-block">
              Get in Touch
            </span>
            <h1 className="font-display font-semibold text-4xl text-ink mb-3">
              {contact.title || 'Contact Us'}
            </h1>
            {contact.tagline && <p className="text-inksoft/60 text-lg">{contact.tagline}</p>}
          </div>

          {/* Primary contact details */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {contact.email && (
              <div className="bg-white rounded-xl border border-ink/10 p-6">
                <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-2">Email</p>
                <a href={`mailto:${contact.email}`} className="font-display text-lg text-ink hover:text-gold transition-colors">
                  {contact.email}
                </a>
              </div>
            )}
            {contact.phone && (
              <div className="bg-white rounded-xl border border-ink/10 p-6">
                <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-2">Phone</p>
                <a href={`tel:${contact.phone}`} className="font-display text-lg text-ink hover:text-gold transition-colors">
                  {contact.phone}
                </a>
              </div>
            )}
          </div>

          {/* Address */}
          {contact.address && (
            <div className="bg-white rounded-xl border border-ink/10 p-6 mb-8">
              <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-2">Address</p>
              <p className="text-inksoft/70 leading-relaxed whitespace-pre-line">{contact.address}</p>
              {contact.mapLink && (
                <a
                  href={contact.mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-3 text-sm font-semibold text-gold hover:underline"
                >
                  View on map →
                </a>
              )}
            </div>
          )}

          {/* Office hours */}
          {contact.officeHours && (
            <div className="bg-white rounded-xl border border-ink/10 p-6 mb-8">
              <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-2">Office Hours</p>
              <p className="text-inksoft/70 leading-relaxed whitespace-pre-line">{contact.officeHours}</p>
            </div>
          )}

          {/* Socials */}
          {(contact.instagram || contact.facebook || contact.twitter || contact.linkedin) && (
            <div className="bg-ink text-white rounded-2xl p-8">
              <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-4">Follow Us</p>
              <div className="flex flex-wrap gap-5 text-sm">
                {contact.instagram && (
                  <a href={contact.instagram} target="_blank" rel="noreferrer" className="font-medium hover:text-gold transition-colors">
                    Instagram
                  </a>
                )}
                {contact.facebook && (
                  <a href={contact.facebook} target="_blank" rel="noreferrer" className="font-medium hover:text-gold transition-colors">
                    Facebook
                  </a>
                )}
                {contact.twitter && (
                  <a href={contact.twitter} target="_blank" rel="noreferrer" className="font-medium hover:text-gold transition-colors">
                    Twitter
                  </a>
                )}
                {contact.linkedin && (
                  <a href={contact.linkedin} target="_blank" rel="noreferrer" className="font-medium hover:text-gold transition-colors">
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
