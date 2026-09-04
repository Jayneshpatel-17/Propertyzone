import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const NEAREST_KEYS = [
  { key: 'hospital', label: 'Hospital' },
  { key: 'school', label: 'School' },
  { key: 'metro', label: 'Metro Station' },
  { key: 'mall', label: 'Shopping Mall' },
];

// Django packs every additional image into ONE collage: tiles are resized to
// 300x300, arranged into a cols x rows grid (cols = ceil(sqrt(total)),
// rows = ceil(total / cols)), left-to-right, top-to-bottom — see
// create_collage(). These helpers mirror that layout so the frontend can
// slice individual tiles back out using a CSS-sprite technique.
const COLLAGE_TILE_SRC_SIZE = 300;
const MAX_ADDITIONAL_THUMBS = 5;

function collageGrid(total) {
  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);
  return { cols, rows };
}

// Returns the CSS needed to render tile `index` of a `cols`x`rows` collage
// at `displaySize` px, given the collage image is displayed at `displaySize`
// px per tile (i.e. the whole collage element is cols*displaySize wide).
function collageTileStyle(collageUrl, index, cols, displaySize) {
  const col = index % cols;
  const row = Math.floor(index / cols);
  return {
    backgroundImage: `url(${collageUrl})`,
    backgroundSize: `${cols * displaySize}px auto`,
    backgroundPosition: `-${col * displaySize}px -${row * displaySize}px`,
    backgroundRepeat: 'no-repeat',
  };
}

// Facilities may arrive as a JSON-stringified array (from sell.jsx),
// a comma-separated string, or already an array — handle all three.
function parseFacilities(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // not JSON — fall through
  }
  return String(raw)
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);
}

export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Gallery selection: null = show the main propertyImage.
  // A number = show that tile index sliced out of the additionalImages collage.
  const [activeTile, setActiveTile] = useState(null);

  useEffect(() => {
    fetchProperty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:8000/propertyzone/details/${id}/`, {
        withCredentials: true,
      });
      const data = response.data.seller || response.data.rent || response.data;
      setProperty(data);
      setActiveTile(null);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError('Could not load this property.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen font-body bg-stone">
        <main className="w-full min-h-screen flex items-center justify-center">
          <p className="text-inksoft/50 text-sm">Loading property…</p>
        </main>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="w-full min-h-screen font-body bg-stone">
        <main className="w-full min-h-screen flex items-center justify-center px-[4vw]">
          <div className="bg-white rounded-2xl shadow-[0_16px_40px_rgba(20,32,58,0.08)] px-8 py-14 text-center max-w-md">
            <p className="text-red-500 text-sm mb-6">{error || 'Property not found.'}</p>
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="bg-gold text-ink font-semibold rounded-full px-7 py-3 hover:-translate-y-0.5 transition-transform"
            >
              Back to Properties
            </button>
          </div>
        </main>
      </div>
    );
  }


  const isRent = property.rent !== undefined && property.rent !== null && property.rent !== '';
  const priceLabel = isRent ? `${property.rent} / month` : property.price;
  const isBuilder = (property.role || '').toLowerCase() === 'builder';
  const facilities = parseFacilities(property.facilities);
  const hasLandmarks = NEAREST_KEYS.some(
    ({ key }) => property[`${key}Address`] || property[`${key}Link`]
  );

  // additionalImages is a single collage URL. additionalImagesCount is the
  // number of original photos baked into it — the backend needs to send this
  // alongside the collage, since the frontend can't infer it from the image
  // alone (the last grid row can contain blank padding tiles).
  const collageUrl = property.additionalImages
    ? `http://localhost:8000${property.additionalImages}`
    : null;
  const collageCount =
    Number(
      property.additionalImageCount ??
        property.additionalImagesCount ??
        property.additional_image_count ??
        property.additional_images_count ??
        0
    ) || 0;
  const { cols: collageCols } = collageGrid(collageCount || 1);
  const thumbCount = Math.min(collageCount, MAX_ADDITIONAL_THUMBS);

  const heroIsTile = activeTile !== null && collageUrl;

  return (
    <div className="w-full min-h-screen font-body bg-stone">
      <main className="w-full min-h-screen px-[4vw] py-12">
        <div className="max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="cursor-pointer text-sm font-semibold text-inksoft/60 hover:text-ink transition-colors mb-6"
          >
            ← Back
          </button>

          {/* Image gallery */}
          <div className="mb-8">
            <div className="h-[420px] rounded-2xl overflow-hidden bg-stone-dark shadow-[0_16px_40px_rgba(20,32,58,0.08)] flex items-center justify-center">
              {heroIsTile ? (
                <div
                  className="h-[420px] w-[420px]"
                  style={collageTileStyle(collageUrl, activeTile, collageCols, 420)}
                />
              ) : property.propertyImage ? (
                <img
                  src={`http://localhost:8000${property.propertyImage}`}
                  alt={property.buildingName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <p className="text-inksoft/30">No image available</p>
              )}
            </div>

            {(property.propertyImage || thumbCount > 0) && (
              <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
                {property.propertyImage && (
                  <button
                    type="button"
                    onClick={() => setActiveTile(null)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      activeTile === null ? 'border-gold' : 'border-transparent'
                    }`}
                  >
                    <img src={`http://localhost:8000${property.propertyImage}`} alt="Main" className="w-full h-full object-cover" />
                  </button>
                )}

                {Array.from({ length: thumbCount }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveTile(i)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      activeTile === i ? 'border-gold' : 'border-transparent'
                    }`}
                    style={collageTileStyle(collageUrl, i, collageCols, 80)}
                    aria-label={`View additional image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-gold">
                    {property.propertyType}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-sage">
                    {isRent ? 'For Rent' : 'For Sale'}
                  </span>
                </div>
                <h1 className="font-display font-semibold text-3xl text-ink mb-2">{property.buildingName}</h1>
                <p className="text-inksoft/60 text-sm">
                  {[property.address, property.city, property.pincode].filter(Boolean).join(', ')}
                </p>
              </div>

              {/* Quick facts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {property.rooms && (
                  <div className="bg-white rounded-xl border border-ink/10 px-4 py-4 text-center">
                    <p className="font-display text-xl font-semibold text-ink">{property.rooms} BHK</p>
                    <p className="text-xs text-inksoft/50 mt-1">Configuration</p>
                  </div>
                )}
                {(property.sqft || property.area) && (
                  <div className="bg-white rounded-xl border border-ink/10 px-4 py-4 text-center">
                    <p className="font-display text-xl font-semibold text-ink">{property.sqft || property.area}</p>
                    <p className="text-xs text-inksoft/50 mt-1">Sq. Ft.</p>
                  </div>
                )}
                {property.parking && (
                  <div className="bg-white rounded-xl border border-ink/10 px-4 py-4 text-center">
                    <p className="font-display text-lg font-semibold text-ink">{property.parking}</p>
                    <p className="text-xs text-inksoft/50 mt-1">Parking</p>
                  </div>
                )}
                {property.propertyType && (
                  <div className="bg-white rounded-xl border border-ink/10 px-4 py-4 text-center">
                    <p className="font-display text-lg font-semibold text-ink">{property.propertyType}</p>
                    <p className="text-xs text-inksoft/50 mt-1">Type</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {property.description && (
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink mb-3">Description</h2>
                  <p className="text-inksoft/70 leading-relaxed whitespace-pre-line">{property.description}</p>
                </div>
              )}

              {/* Facilities & amenities */}
              {facilities.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink mb-3">Facilities &amp; Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {facilities.map((facility, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full bg-white border border-ink/10 text-sm text-inksoft/70"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Nearby landmarks */}
              {hasLandmarks && (
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink mb-3">Nearby Landmarks</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {NEAREST_KEYS.map(({ key, label }) => {
                      const address = property[`${key}Address`];
                      const link = property[`${key}Link`];
                      if (!address && !link) return null;
                      return (
                        <div key={key} className="bg-white rounded-xl border border-ink/10 p-4">
                          <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-1">{label}</p>
                          {address && <p className="text-sm text-inksoft/70 mb-1">{address}</p>}
                          {link && (
                            <a href={link} target="_blank" rel="noreferrer" className="text-sm font-semibold text-gold hover:underline">
                              View on map →
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Additional details */}
              {property.additionalDetails && (
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink mb-3">Additional Details</h2>
                  <p className="text-inksoft/70 leading-relaxed whitespace-pre-line">{property.additionalDetails}</p>
                </div>
              )}
            </div>

            {/* Sidebar: price + contact + builder — sticks together while scrolling */}
            <div className="flex flex-col gap-5 sticky top-6 self-start">
              <div className="bg-white rounded-2xl border border-ink/10 p-6">
                <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-1">
                  {isRent ? 'Monthly Rent' : 'Price'}
                </p>
                <p className="font-display text-3xl font-semibold text-ink mb-6">₹{priceLabel}</p>

                <div className="flex flex-col gap-3 text-sm">
                  {property.name && (
                    <div>
                      <p className="text-inksoft/50 text-xs mb-0.5">Contact Name</p>
                      <p className="text-ink font-medium">{property.name}</p>
                    </div>
                  )}
                  {property.contact && (
                    <div>
                      <p className="text-inksoft/50 text-xs mb-0.5">Contact No.</p>
                      <p className="text-ink font-medium">{property.contact}</p>
                    </div>
                  )}
                  {property.email && (
                    <div>
                      <p className="text-inksoft/50 text-xs mb-0.5">Email</p>
                      <p className="text-ink font-medium truncate">{property.email}</p>
                    </div>
                  )}
                </div>

                {property.mapLink && (
                  <a
                    href={property.mapLink}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center mt-6 border border-ink/15 text-ink font-semibold rounded-full py-3 text-sm hover:bg-stone transition-colors"
                  >
                    View on Map
                  </a>
                )}
              </div> 

              {isBuilder && (property.builderOfficeName || property.officeAddress || property.builderOfficeAddress || property.builderWorkExperience || property.builderExperience) && (
                <div className="bg-ink text-white rounded-2xl p-6">
                  <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-4">Builder Details</p>
                  <div className="flex flex-col gap-3 text-sm">
                    {property.builderOfficeName && (
                      <div>
                        <p className="text-white/50 text-xs mb-0.5">Office Name</p>
                        <p className="font-medium">{property.builderOfficeName}</p>
                      </div>
                    )}
                    {(property.officeAddress || property.builderOfficeAddress) && (
                      <div>
                        <p className="text-white/50 text-xs mb-0.5">Office Address</p>
                        <p className="font-medium">{property.officeAddress || property.builderOfficeAddress}</p>
                      </div>
                    )}
                    {(property.builderWorkExperience || property.builderExperience) && (
                      <div>
                        <p className="text-white/50 text-xs mb-0.5">Work Experience</p>
                        <p className="font-medium">{property.builderWorkExperience || property.builderExperience}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
