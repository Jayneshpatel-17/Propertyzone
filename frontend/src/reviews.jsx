import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';

export default function Reviews() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewLimit, setReviewLimit] = useState(3);
  const [reviewtemp , setReviewTemp] = useState(0);  

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8000/propertyzone/reviews/', {
        withCredentials: true,
      });
      const data = response.data.data || response.data;
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError('Could not load reviews.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen font-body bg-stone">
      <Sidebar />

      <main className="w-4/5 ml-[20%] min-h-screen px-[4vw] py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <span className="uppercase text-xs tracking-widest text-gold font-semibold mb-2 inline-block">
              Feedback
            </span>
            <h1 className="font-display font-semibold text-3xl text-ink mb-2">Reviews</h1>
            <p className="text-inksoft/60 text-sm">Reviews left on each of your properties.</p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <p className="text-inksoft/50 text-sm">Loading reviews…</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-white rounded-2xl shadow-[0_16px_40px_rgba(20,32,58,0.08)] px-8 py-14 text-center">
              <p className="text-red-500 text-sm mb-6">{error}</p>
              <button
                type="button"
                onClick={fetchReviews}
                className="bg-gold text-ink font-semibold rounded-full px-7 py-3 hover:-translate-y-0.5 transition-transform"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && properties.length === 0 && (
            <div className="bg-white rounded-2xl shadow-[0_16px_40px_rgba(20,32,58,0.08)] px-8 py-14 text-center">
              <h2 className="font-display text-xl font-semibold text-ink mb-2">No reviews yet</h2>
              <p className="text-inksoft/60 text-sm">
                Reviews left on your properties will show up here.
              </p>
            </div>
          )}

          {!loading && !error && properties.length > 0 && (
            <div className="flex flex-col gap-8">
              {properties.map((property, pIndex) => {
                const propertyReviews = property.reviews || [];
                return (
                  <div>
                  <div
                    key={property.id || pIndex}
                    className="bg-white rounded-2xl border border-ink/10 overflow-hidden"
                  >
                    {/* Property header */}
                    <div className="px-6 py-5 border-b border-ink/10 flex items-center justify-between gap-4">
                      <div>
                        <h2 className="font-display text-xl font-semibold text-ink">
                          {property.propertyName || property.buildingName}
                        </h2>
                        <span className="text-xs font-semibold uppercase tracking-wide text-gold">
                          {property.propertyType}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-inksoft/50 shrink-0">
                        {propertyReviews.length} review{propertyReviews.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Reviews for this property */}
                    <div className="px-6 py-5">
                      {propertyReviews.length === 0 ? (
                        <p className="text-sm text-inksoft/50">No reviews for this property yet.</p>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {propertyReviews.slice(reviewtemp,reviewLimit).map((review, rIndex) => (
                            <div
                              key={review.id || rIndex}
                              className="border-l-[3px] border-gold pl-4 py-1"
                            >
                              <div className="text-gold mb-1 text-sm" aria-label={`${review.rating} out of 5 stars`}>
                                {'★'.repeat(Number(review.rating) || 0)}
                                {'☆'.repeat(5 - (Number(review.rating) || 0))}
                              </div>
                              <p className="italic text-inksoft/80 leading-relaxed text-sm mb-1">
                                "{review.message}"
                              </p>
                              <span className="font-semibold text-xs text-sage">— {review.name}</span>
                            </div>
                          ))}
                        </div>
                        
                      )}
                </div>
                </div>
                <div className="flex justify-center mt-10">
                      {(reviewLimit < propertyReviews.length) && (
                      <button
                        onClick={() => {
                        setReviewLimit((prev) => prev + 3);
                        setReviewTemp((prev) => prev + 3);
                      }}
                      className="cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                     Load More
                    </button>
                  )}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
