import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {  useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Property() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [propertiesrent, setPropertiesrent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
  setLoading(true);
  setError('');

  try {
    const response = await fetch(
      "http://localhost:8000/propertyzone/property/",
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await response.json();

    console.log("PROPERTY API:", data);

    // if (!response.ok) {
    //   throw new Error(data.message || "Failed to load properties");
    // }

    setProperties(data.seller || []);
    setPropertiesrent(data.rent || []);

  } catch (err) {
    console.error(err);

    setError(
      err.message ||
      "Could not load your properties. Please try again."
    );

  } finally {
    setLoading(false);
  }
};

  // const fetchProperties = async () => {
  //   setLoading(true);
  //   setError('');
    // try {
    //   const response = await axios.get('http://127.0.0.1:8000/propertyzone/property/'
    //     , {
    //     headers: { Authorization: `Bearer ${localStorage.getItem('username')}` },
    //   }
    // );
    //   setProperties(response.data.seller  || []);
    //   setPropertiesrent(response.data.rent || []);
    // } catch (err) {
    //   console.error(err.response?.data || err.message);
    //   setError('Could not load your properties. Please try again.');
    // } finally {
    //   setLoading(false);
    // }
    // const getDashboard = async () => {
    
// };
  // };

  const handleEdit = (id) => {
    navigate(`/edit/${id}`);
  };

  // const handleDelete = async (id) => {
  //   const confirmed = window.confirm('Are you sure you want to delete this property listing?');
  //   if (!confirmed) return;

  //   setDeletingId(id);
  //   try {
  //     await axios.delete(`http://127.0.0.1:8000/propertyzone/delete/${id}/`,
  //     {
  //       withCredentials: true,
  //     }
  //       // , {
  //       // headers: { Authorization: `Bearer ${localStorage.getItem('username')}` },
  //     // }
  //   );
  //     // setProperties((prev) => prev.filter((p) => p.id !== id));
  //     // setPropertiesrent((prev) => prev.filter((p) => p.id !== id));
  //   } catch (err) {
  //     console.error(err.response?.data || err.message);
  //     alert('Could not delete this listing. Please try again.');
  //   } finally {
  //     setDeletingId(null);
  //   }
  // };

  const handleDelete = async (id) => {

  if (!id) {
    alert("Invalid property ID");
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to delete this property?"
  );

  if (!confirmed) return;

  setDeletingId(id);

  try {

    const response = await axios.delete(
      `http://localhost:8000/propertyzone/delete/${id}/`,
      {
        withCredentials: true,
      }
    );

    console.log(response.data);

    // Remove from sale list
    setProperties((prev) =>
      prev.filter((property) => property.id !== id)
    );

    // Remove from rent list
    setPropertiesrent((prev) =>
      prev.filter((property) => property.id !== id)
    );

  } catch (err) {

    console.error(
      err.response?.data || err.message
    );

    alert(
      err.response?.data?.message ||
      "Could not delete this listing."
    );

  } finally {

    setDeletingId(null);

  }
};

  return (
    <div className="w-full min-h-screen font-body bg-stone">
      {/* Left: shared sidebar navbar (20%) */}
      <Sidebar />

      {/* Right: your listed properties (offset by sidebar width) */}
      <main className="w-4/5 ml-[20%] min-h-screen px-[4vw] py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <span className="uppercase text-xs tracking-widest text-gold font-semibold mb-2 inline-block">
              Your Listings
            </span>
            <h1 className="font-display font-semibold text-3xl text-ink mb-2">My Properties</h1>
            <p className="text-inksoft/60 text-sm">Manage the properties you've listed for sale or rent.</p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <p className="text-inksoft/50 text-sm">Loading your properties…</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-white rounded-2xl shadow-[0_16px_40px_rgba(20,32,58,0.08)] px-8 py-14 text-center">
              <p className="text-red-500 text-sm mb-6">{error}</p>
              <button
                type="button"
                onClick={fetchProperties}
                className="bg-gold text-ink font-semibold rounded-full px-7 py-3 hover:-translate-y-0.5 transition-transform"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && properties.length === 0 && propertiesrent.length === 0 && (
            <div className="bg-white rounded-2xl shadow-[0_16px_40px_rgba(20,32,58,0.08)] px-8 py-14 text-center">
              <h2 className="font-display text-xl font-semibold text-ink mb-2">No properties listed yet</h2>
              <p className="text-inksoft/60 text-sm mb-6">
                Properties you list for sale or rent will show up here.
              </p>
              <a
                href="/dashboard/sell"
                className="inline-block bg-gold text-ink font-semibold rounded-full px-7 py-3 hover:-translate-y-0.5 transition-transform"
              >
                List a Property
              </a>
            </div>
          )}

          {!loading && !error && properties.length > 0 &&  (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-7">
              {properties.map((property) => (
                <article
                  key={`sale-${property.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(20,32,58,0.06)] hover:shadow-[0_16px_32px_rgba(20,32,58,0.12)] transition-shadow"
                >
                  <div className="h-[190px] overflow-hidden bg-stone-dark">
                    {property.propertyImage ? (
                      <img
                        src={`http://localhost:8000${property.propertyImage}`}
                        alt={property.buildingName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-inksoft/30 text-sm">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="px-6 pt-5 pb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-xl truncate">{property.buildingName}</h3>
                      <span className="text-xs font-semibold uppercase tracking-wide text-gold shrink-0 ml-2">
                        {property.propertyType}
                      </span>
                    </div>

                    <p className="text-sm text-inksoft/60 leading-relaxed mb-4 line-clamp-2">
                      {property.description}
                    </p>

                    <div className="font-semibold text-sage mb-5">{property.price}</div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(property.id)}
                        className="cursor-pointer flex-1 border border-ink/15 text-ink font-semibold text-sm rounded-full py-2.5 hover:bg-stone transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(property.id)}
                        disabled={deletingId === property.id}
                        className="cursor-pointer flex-1 border border-red-200 text-red-500 font-semibold text-sm rounded-full py-2.5 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deletingId === property.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
          <br />
          {!loading && !error && propertiesrent.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-7"> 
              {propertiesrent.map((propertyrent) => (
                <article
                  key={`rent-${propertyrent.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(20,32,58,0.06)] hover:shadow-[0_16px_32px_rgba(20,32,58,0.12)] transition-shadow"
                >
                  <div className="h-[190px] overflow-hidden bg-stone-dark">
                    {propertyrent.propertyImage ? (
                      <img
                        src={`http://localhost:8000${propertyrent.propertyImage}`}
                        alt={propertyrent.buildingName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-inksoft/30 text-sm">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="px-6 pt-5 pb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-xl truncate">{propertyrent.buildingName}</h3>
                      <span className="text-xs font-semibold uppercase tracking-wide text-gold shrink-0 ml-2">
                        {propertyrent.propertyType}
                      </span>
                    </div>

                    <p className="text-sm text-inksoft/60 leading-relaxed mb-4 line-clamp-2">
                      {propertyrent.description}
                    </p>

                    <div className="font-semibold text-sage mb-5">{propertyrent.rent}</div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(propertyrent.id)}
                        className="cursor-pointer flex-1 border border-ink/15 text-ink font-semibold text-sm rounded-full py-2.5 hover:bg-stone transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(propertyrent.id)}
                        disabled={deletingId === propertyrent.id}
                        className="cursor-pointer flex-1 border border-red-200 text-red-500 font-semibold text-sm rounded-full py-2.5 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deletingId === propertyrent.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
