import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';

const statusClass = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'confirmed') return 'bg-sage/10 text-sage';
  if (s === 'cancelled') return 'bg-red-50 text-red-500';
  return 'bg-gold/10 text-gold'; // Pending
};

export default function Booking() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8000/propertyzone/mybookings/', {
        withCredentials: true,
      });
      const data = response.data.data || response.data;
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError('Could not load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      await axios.patch(
        `http://localhost:8000/propertyzone/mybookings/${bookingId}/`,
        { status: newStatus },
        { withCredentials: true }
      );
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert('Could not update this booking. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="w-full min-h-screen font-body bg-stone">
      <Sidebar />

      <main className="w-4/5 ml-[20%] min-h-screen px-[4vw] py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <span className="uppercase text-xs tracking-widest text-gold font-semibold mb-2 inline-block">
              Appointments
            </span>
            <h1 className="font-display font-semibold text-3xl text-ink mb-2">Bookings</h1>
            <p className="text-inksoft/60 text-sm">Site-visit appointments booked across all of your properties.</p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <p className="text-inksoft/50 text-sm">Loading bookings…</p>
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
              <p className="text-inksoft/60 text-sm">
                Appointments booked on your properties will show up here.
              </p>
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

                  {/* Buyer info */}
                  <div className="sm:w-48 shrink-0">
                    <p className="text-xs text-inksoft/50 mb-0.5">Booked by</p>
                    <p className="text-sm font-medium text-ink truncate">{b.buyerName}</p>
                    {b.buyerEmail && <p className="text-xs text-inksoft/50 truncate">{b.buyerEmail}</p>}
                  </div>

                  {/* Date & time */}
                  <div className="sm:w-40 shrink-0">
                    <p className="text-xs text-inksoft/50 mb-0.5">Date &amp; Time</p>
                    <p className="text-sm font-medium text-ink">{b.bookingDate}</p>
                    <p className="text-xs text-inksoft/60">{b.bookingTime}</p>
                  </div>

                  {/* Status / actions */}
                  <div className="sm:w-44 shrink-0 flex flex-col items-start sm:items-end gap-2">
                    <span
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full text-center ${statusClass(b.status)}`}
                    >
                      {b.status || 'Pending'}
                    </span>

                    {(b.status || 'Pending') === 'Pending' ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(b.id, 'Confirmed')}
                          disabled={updatingId === b.id}
                          className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-full border border-red-200 text-sage hover:bg-red-50 transition-transform disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(b.id, 'Cancelled')}
                          disabled={updatingId === b.id}
                          className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(b.id, 'Pending')}
                        disabled={updatingId === b.id}
                        className="cursor-pointer text-xs font-medium text-inksoft/40 hover:text-inksoft/60 transition-colors disabled:opacity-50"
                      >
                        Reset to pending
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
