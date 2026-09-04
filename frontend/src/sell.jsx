import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';

const PROPERTY_TYPES = ['Flat', 'Villa', 'Bungalow', 'Farm House', 'Shop', 'Other'];
const PARKING_OPTIONS = ['Car and Bike', 'Bike only', 'None'];
const BHK_OPTIONS = ['1', '2', '3', '4', '5'];
const ROLE_OPTIONS = ['Owner', 'Broker', 'Builder'];
const FACILITY_OPTIONS = [
  'Lift',
  'Power Backup',
  'Security',
  'Gym',
  'Swimming Pool',
  'Garden',
  'Clubhouse',
  "Children's Play Area",
];
const NEAREST_KEYS = [
  { key: 'hospital', label: 'Nearest Hospital' },
  { key: 'school', label: 'Nearest School' },
  { key: 'metro', label: 'Nearest Metro Station' },
  { key: 'mall', label: 'Nearest Shopping Mall' },
];

// Property types where parking does not apply
const NO_PARKING_TYPES = ['Villa', 'Farm House', 'Shop'];

const initialForm = {
  name: '',
  contact: '',
  email: '',
  propertyType: '',
  buildingName: '',
  description: '',
  price: '',
  sqft: '',
  bhk: '',
  parking: '',
  address: '',
  city: '',
  areaPincode: '',
  mapLink: '',
  facilities: [],
  hospitalAddress: '',
  hospitalLink: '',
  schoolAddress: '',
  schoolLink: '',
  metroAddress: '',
  metroLink: '',
  mallAddress: '',
  mallLink: '',
  propertyImage: null,
  additionalImages: [],
  additionalDetails: '',
  role: '',
  builderOfficeName: '',
  officeAddress: '',
  builderWorkExperience: '',
};

export default function Sell() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const isShop = form.propertyType === 'Shop';
  const hideParking = NO_PARKING_TYPES.includes(form.propertyType);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const toggleFacility = (facility) => {
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
    setErrors((prev) => ({ ...prev, facilities: '' }));
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
    if (!form.price.trim()) next.price = 'Price is required.';
    if (!form.sqft.trim()) next.sqft = 'Area (sq.ft) is required.';

    if (!isShop && !form.bhk) next.bhk = 'BHK is required.';
    if (!hideParking && !form.parking) next.parking = 'Please select a parking option.';

    if (!form.address.trim()) next.address = 'Address is required.';
    if (!form.city.trim()) next.city = 'City is required.';
    if (!form.areaPincode.trim()) next.areaPincode = 'Area / Pincode is required.';
    if (!form.mapLink.trim()) next.mapLink = 'Map link is required.';

    if (!isShop) {
      if (form.facilities.length === 0) next.facilities = 'Select at least one facility or amenity.';

      NEAREST_KEYS.forEach(({ key, label }) => {
        if (!form[`${key}Address`].trim()) next[`${key}Address`] = `${label} address is required.`;
        if (!form[`${key}Link`].trim()) next[`${key}Link`] = `${label} map link is required.`;
      });
    }

    if (!form.propertyImage) next.propertyImage = 'A property image is required.';

    if (!form.role) next.role = 'Please select a role.';
    if (form.role === 'Builder') {
      if (!form.builderOfficeName.trim()) next.builderOfficeName = 'Office name is required.';
      if (!form.officeAddress.trim()) next.officeAddress = 'Office address is required.';
      if (!form.builderWorkExperience.trim()) next.builderWorkExperience = 'Work experience is required.';
    }

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
      data.append('price', form.price);
      data.append('area', form.sqft);
      data.append('bhk', form.bhk);
      data.append('parking', form.parking);
      data.append('address', form.address);
      data.append('city', form.city);
      data.append('areaPincode', form.areaPincode);
      data.append('mapLink', form.mapLink);
      data.append('facilities', JSON.stringify(form.facilities));

      data.append('hospitalAddress', form.hospitalAddress);
      data.append('hospitalLink', form.hospitalLink);
      data.append('schoolAddress', form.schoolAddress);
      data.append('schoolLink', form.schoolLink);
      data.append('metroAddress', form.metroAddress);
      data.append('metroLink', form.metroLink);
      data.append('mallAddress', form.mallAddress);
      data.append('mallLink', form.mallLink);

      if (form.propertyImage) data.append('propertyImage', form.propertyImage);
      form.additionalImages.forEach((file) => data.append('additionalImages', file));
      data.append('additionalDetails', form.additionalDetails);

      data.append('role', form.role);
      if (form.role === 'Builder') {
        data.append('builderOfficeName', form.builderOfficeName);
        data.append('officeAddress', form.officeAddress);
        data.append('builderWorkExperience', form.builderWorkExperience);
      }

      // await axios.post('http://localhost:8000/propertyzone/sell/', data, {
      //   // headers: { 'Content-Type': 'multipart/form-data' },
      //   withCredentials: true
      // });

      const response = await fetch(
            "http://localhost:8000/propertyzone/sell/",
            {
                method: "POST",

                
                credentials: "include",

                body: data
            }
        );
      const data1 = await response.json();

      console.log("SELL RESPONSE:", data1);
      
      if (!response.ok) {
        alert(data1.message || "Property could not be added");
        return;
      }
      
      alert("Property added successfully");
      setSuccess(true);

    } catch (error) {

        // console.error("SELL ERROR:", error);
        console.error(error.response?.data || error.message);
        setErrors({ submit: 'Something went wrong while submitting your listing. Please try again.' });

    }
    // } catch (error) {
    //   console.error(error.response?.data || error.message);
    //   setErrors({ submit: 'Something went wrong while submitting your listing. Please try again.' });
    // } 
    finally {
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
                Thanks — your property has been submitted for review. Our team will get in touch shortly.
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
                <h1 className="font-display font-semibold text-3xl text-ink mb-2">List Your Property</h1>
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
                    <label className="text-sm font-medium">Price<sup className='text-red-800 text-sm'>*</sup></label>
                    <input name="price" value={form.price} onChange={handleChange} placeholder="e.g. 45,00,000" className={fieldClass('price')} />
                    {errors.price && <p className="text-red-500 text-xs">{errors.price}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Area (sq.ft)<sup className='text-red-800 text-sm'>*</sup></label>
                    <input name="sqft" value={form.sqft} onChange={handleChange} placeholder="e.g. 1250" className={fieldClass('sqft')} />
                    {errors.sqft && <p className="text-red-500 text-xs">{errors.sqft}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {!isShop && (
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

                {!isShop && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Facilities &amp; Amenities<sup className='text-red-800 text-sm'>*</sup></label>
                      <div className="grid grid-cols-2 gap-2">
                        {FACILITY_OPTIONS.map((facility) => (
                          <label key={facility} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={form.facilities.includes(facility)}
                              onChange={() => toggleFacility(facility)}
                              className="w-4 h-4 accent-gold"
                            />
                            {facility}
                          </label>
                        ))}
                      </div>
                      {errors.facilities && <p className="text-red-500 text-xs">{errors.facilities}</p>}
                    </div>

                    <div className="flex flex-col gap-4">
                      <label className="text-sm font-medium">Nearby Landmarks<sup className='text-red-800 text-sm'>*</sup></label>
                      {NEAREST_KEYS.map(({ key, label }) => (
                        <div key={key} className="grid grid-cols-2 gap-3 bg-stone rounded-xl border border-ink/10 p-4">
                          <div className="col-span-2 text-xs font-semibold text-gold uppercase tracking-wide mb-1">
                            {label}
                          </div>
                          <div className="flex flex-col gap-1">
                            <input
                              name={`${key}Address`}
                              value={form[`${key}Address`]}
                              onChange={handleChange}
                              placeholder="Address"
                              className={`px-3 py-2 rounded-lg border bg-white text-sm ${
                                errors[`${key}Address`] ? 'border-red-400' : 'border-ink/10'
                              }`}
                            />
                            {errors[`${key}Address`] && <p className="text-red-500 text-xs">{errors[`${key}Address`]}</p>}
                          </div>
                          <div className="flex flex-col gap-1">
                            <input
                              name={`${key}Link`}
                              value={form[`${key}Link`]}
                              onChange={handleChange}
                              placeholder="Map link"
                              className={`px-3 py-2 rounded-lg border bg-white text-sm ${
                                errors[`${key}Link`] ? 'border-red-400' : 'border-ink/10'
                              }`}
                            />
                            {errors[`${key}Link`] && <p className="text-red-500 text-xs">{errors[`${key}Link`]}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

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
                    placeholder="Anything else buyers or tenants should know"
                    className={`${fieldClass('additionalDetails')} resize-y`}
                  ></textarea>
                </div>

                <div className="border-t border-ink/10 pt-5 flex flex-col gap-2">
                  <label className="text-sm font-medium">Role<sup className='text-red-800 text-sm'>*</sup></label>
                  <select name="role" value={form.role} onChange={handleChange} className={fieldClass('role')}>
                    <option value="">Select role</option>
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}
                </div>

                {form.role === 'Builder' && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Builder Office Name<sup className='text-red-800 text-sm'>*</sup></label>
                      <input
                        name="builderOfficeName"
                        value={form.builderOfficeName}
                        onChange={handleChange}
                        placeholder="Firm / office name"
                        className={fieldClass('builderOfficeName')}
                      />
                      {errors.builderOfficeName && <p className="text-red-500 text-xs">{errors.builderOfficeName}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Office Address<sup className='text-red-800 text-sm'>*</sup></label>
                      <input
                        name="officeAddress"
                        value={form.officeAddress}
                        onChange={handleChange}
                        placeholder="Registered office address"
                        className={fieldClass('officeAddress')}
                      />
                      {errors.officeAddress && <p className="text-red-500 text-xs">{errors.officeAddress}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Builder Work Experience<sup className='text-red-800 text-sm'>*</sup></label>
                      <input
                        name="builderWorkExperience"
                        value={form.builderWorkExperience}
                        onChange={handleChange}
                        placeholder="e.g. 12 years, 30+ projects"
                        className={fieldClass('builderWorkExperience')}
                      />
                      {errors.builderWorkExperience && <p className="text-red-500 text-xs">{errors.builderWorkExperience}</p>}
                    </div>
                  </>
                )}

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
