import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';

const PROPERTY_TYPES = ['Flat', 'Villa', 'Bungalow', 'Farm House', 'Shop', 'Other'];
const PARKING_OPTIONS = ['Car and Bike', 'Bike only', 'None'];
const BHK_OPTIONS = ['1', '2', '3', '4', '5'];

// Property types where parking does not apply
const NO_PARKING_TYPES = ['Villa', 'Farm House', 'Shop'];
// Property types where BHK does not apply
const NO_BHK_TYPES = ['Shop'];

const initialForm = {
  name: '',
  contact: '',
  email: '',
  propertyType: '',
  buildingName: '',
  description: '',
  rent: '',
  sqft: '',
  bhk: '',
  parking: '',
  address: '',
  city: '',
  areaPincode: '',
  mapLink: '',
  propertyImage: null,
  additionalImages: [],
  additionalDetails: '',
};

export default function Rent() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const hideBhk = NO_BHK_TYPES.includes(form.propertyType);
  const hideParking = NO_PARKING_TYPES.includes(form.propertyType);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePropertyImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, propertyImage: file }));
    setErrors((prev) => ({ ...prev, propertyImage: '' }));
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setForm((prev) => ({ ...prev, additionalImages: [...prev.additionalImages, ...files] }));
    e.target.value = '';
  };

  const removeAdditionalImage = (index) => {
    setForm((prev) => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const next = {};

    if (!form.name.trim()) next.name = 'Name is required.';
    if (!form.contact.trim()) next.contact = 'Contact number is required.';
    else if (!/^\d{10}$/.test(form.contact.trim())) next.contact = 'Enter a valid 10-digit number.';
    if (!form.email.trim()) next.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.';

    if (!form.propertyType) next.propertyType = 'Please select a property type.';

    if (!form.buildingName.trim()) next.buildingName = 'Building name is required.';
    if (!form.description.trim()) next.description = 'Description is required.';
    if (!form.rent.trim()) next.rent = 'Rent is required.';
    if (!form.sqft.trim()) next.sqft = 'Area (sq.ft) is required.';

    if (!hideBhk && !form.bhk) next.bhk = 'BHK is required.';
    if (!hideParking && !form.parking) next.parking = 'Please select a parking option.';

    if (!form.address.trim()) next.address = 'Address is required.';
    if (!form.city.trim()) next.city = 'City is required.';
    if (!form.areaPincode.trim()) next.areaPincode = 'Area / Pincode is required.';
    if (!form.mapLink.trim()) next.mapLink = 'Map link is required.';

    if (!form.propertyImage) next.propertyImage = 'A property image is required.';

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
      const data = new FormData();

      data.append('name', form.name);
      data.append('contact', form.contact);
      data.append('email', form.email);
      data.append('propertyType', form.propertyType);
      data.append('buildingName', form.buildingName);
      data.append('description', form.description);
      data.append('rent', form.rent);
      data.append('area', form.sqft);
      data.append('bhk', form.bhk);
      data.append('parking', form.parking);
      data.append('address', form.address);
      data.append('city', form.city);
      data.append('areaPincode', form.areaPincode);
      data.append('mapLink', form.mapLink);

      if (form.propertyImage) data.append('propertyImage', form.propertyImage);
      form.additionalImages.forEach((file) => data.append('additionalImages', file));
      data.append('additionalDetails', form.additionalDetails);

      await axios.post('http://localhost:8000/propertyzone/rent/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      setSuccess(true);
    } catch (error) {
      console.error(error.response?.data || error.message);
      setErrors({ submit: 'Something went wrong while submitting your listing. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (field) =>
    `w-full px-4 py-3 rounded-xl border bg-white text-ink placeholder:text-inksoft/40 focus:outline-none focus:ring-2 focus:ring-gold transition-shadow ${
      errors[field] ? 'border-red-400' : 'border-ink/10'
    }`;

  return (
    <div className="w-full min-h-screen font-body bg-stone">
      {/* Left: shared sidebar navbar (20%) */}
      <Sidebar />

      {/* Right: listing form (offset by sidebar width, scrolls independently) */}
      <main className="w-4/5 ml-[20%] min-h-screen px-[4vw] py-12">
        <div className="max-w-3xl mx-auto">
          {success ? (
            <div className="bg-white rounded-2xl shadow-[0_16px_40px_rgba(20,32,58,0.08)] px-8 py-14 text-center">
              <h1 className="font-display font-semibold text-3xl text-ink mb-3">Listing Submitted</h1>
              <p className="text-inksoft/60 text-sm mb-8">
                Thanks — your rental has been submitted for review. Our team will get in touch shortly.
              </p>
              <a
                href="/home"
                className="inline-block bg-gold text-ink font-semibold rounded-full px-7 py-3.5 hover:-translate-y-0.5 transition-transform"
              >
                Back to Home
              </a>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-[0_16px_40px_rgba(20,32,58,0.08)] px-8 py-10">
              <div className="mb-8">
                <span className="uppercase text-xs tracking-widest text-gold font-semibold mb-2 inline-block">
                  Listings
                </span>
                <h1 className="font-display font-semibold text-3xl text-ink mb-2">List Your Property for Rent</h1>
                <p className="text-inksoft/60 text-sm">Fill in the details below — it only takes a few minutes.</p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Name<sup className='text-red-800 text-sm'>*</sup></label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className={fieldClass('name')} />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Contact No.<sup className='text-red-800 text-sm'>*</sup></label>
                    <input name="contact" value={form.contact} onChange={handleChange} placeholder="10-digit number" className={fieldClass('contact')} />
                    {errors.contact && <p className="text-red-500 text-xs">{errors.contact}</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Email<sup className='text-red-800 text-sm'>*</sup></label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={fieldClass('email')} />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Property Type<sup className='text-red-800 text-sm'>*</sup></label>
                  <select name="propertyType" value={form.propertyType} onChange={handleChange} className={fieldClass('propertyType')}>
                    <option value="">Select property type</option>
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.propertyType && <p className="text-red-500 text-xs">{errors.propertyType}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Building Name<sup className='text-red-800 text-sm'>*</sup></label>
                  <input name="buildingName" value={form.buildingName} onChange={handleChange} placeholder="e.g. Willowbrook Residency" className={fieldClass('buildingName')} />
                  {errors.buildingName && <p className="text-red-500 text-xs">{errors.buildingName}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Description<sup className='text-red-800 text-sm'>*</sup></label>
                  <textarea name="description" rows="3" value={form.description} onChange={handleChange} placeholder="Describe the property" className={`${fieldClass('description')} resize-y`}></textarea>
                  {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Rent<sup className='text-red-800 text-sm'>*</sup></label>
                    <input name="rent" value={form.rent} onChange={handleChange} placeholder="e.g. 25,000 / month" className={fieldClass('rent')} />
                    {errors.rent && <p className="text-red-500 text-xs">{errors.rent}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Area (sq.ft)<sup className='text-red-800 text-sm'>*</sup></label>
                    <input name="sqft" value={form.sqft} onChange={handleChange} placeholder="e.g. 1250" className={fieldClass('sqft')} />
                    {errors.sqft && <p className="text-red-500 text-xs">{errors.sqft}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {!hideBhk && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">BHK<sup className='text-red-800 text-sm'>*</sup></label>
                      <select name="bhk" value={form.bhk} onChange={handleChange} className={fieldClass('bhk')}>
                        <option value="">Select BHK</option>
                        {BHK_OPTIONS.map((b) => (
                          <option key={b} value={b}>{b} BHK</option>
                        ))}
                      </select>
                      {errors.bhk && <p className="text-red-500 text-xs">{errors.bhk}</p>}
                    </div>
                  )}

                  {!hideParking && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Parking<sup className='text-red-800 text-sm'>*</sup></label>
                      <select name="parking" value={form.parking} onChange={handleChange} className={fieldClass('parking')}>
                        <option value="">Select parking</option>
                        {PARKING_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      {errors.parking && <p className="text-red-500 text-xs">{errors.parking}</p>}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Address<sup className='text-red-800 text-sm'>*</sup></label>
                  <input name="address" value={form.address} onChange={handleChange} placeholder="Full address" className={fieldClass('address')} />
                  {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">City<sup className='text-red-800 text-sm'>*</sup></label>
                    <input name="city" value={form.city} onChange={handleChange} placeholder="e.g. Ahmedabad" className={fieldClass('city')} />
                    {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Area / Pincode<sup className='text-red-800 text-sm'>*</sup></label>
                    <input name="areaPincode" value={form.areaPincode} onChange={handleChange} placeholder="e.g. Satellite, 380015" className={fieldClass('areaPincode')} />
                    {errors.areaPincode && <p className="text-red-500 text-xs">{errors.areaPincode}</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Map Link<sup className='text-red-800 text-sm'>*</sup></label>
                  <input name="mapLink" value={form.mapLink} onChange={handleChange} placeholder="Google Maps link" className={fieldClass('mapLink')} />
                  {errors.mapLink && <p className="text-red-500 text-xs">{errors.mapLink}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Property Image<sup className='text-red-800 text-sm'>*</sup></label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePropertyImageChange}
                    className={`w-full text-sm text-inksoft/70 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:bg-gold file:text-ink file:font-semibold file:cursor-pointer rounded-xl border px-1 py-1 ${
                      errors.propertyImage ? 'border-red-400' : 'border-ink/10'
                    }`}
                  />
                  {form.propertyImage && (
                    <div className="flex items-center gap-3 mt-1">
                      <img
                        src={URL.createObjectURL(form.propertyImage)}
                        alt="Property preview"
                        className="w-16 h-16 object-cover rounded-lg border border-ink/10"
                      />
                      <span className="text-xs text-inksoft/60 truncate">{form.propertyImage.name}</span>
                    </div>
                  )}
                  {errors.propertyImage && <p className="text-red-500 text-xs">{errors.propertyImage}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    Additional Images <span className="text-inksoft/40 font-normal">(optional)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesChange}
                    className="w-full text-sm text-inksoft/70 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:bg-gold file:text-ink file:font-semibold file:cursor-pointer rounded-xl border border-ink/10 px-1 py-1"
                  />
                  {form.additionalImages.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-1">
                      {form.additionalImages.map((file, i) => (
                        <div key={i} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Additional ${i + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border border-ink/10"
                          />
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(i)}
                            aria-label="Remove image"
                            className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-ink text-white text-xs hover:bg-red-500 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    Additional Details <span className="text-inksoft/40 font-normal">(optional)</span>
                  </label>
                  <textarea
                    name="additionalDetails"
                    rows="3"
                    value={form.additionalDetails}
                    onChange={handleChange}
                    placeholder="Anything else tenants should know"
                    className={`${fieldClass('additionalDetails')} resize-y`}
                  ></textarea>
                </div>

                {errors.submit && <p className="text-red-500 text-sm text-center">{errors.submit}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gold text-ink font-semibold rounded-full py-3.5 mt-2 hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:translate-y-0"
                >
                  {submitting ? 'Submitting…' : 'Submit Listing'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
