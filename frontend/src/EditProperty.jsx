import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";

const initialForm = {
  name: "",
  contact: "",
  email: "",

  propertyType: "",
  buildingName: "",
  description: "",
  price: "",
  rent: "",
  sqft: "",
  bhk: "",
  parking: "",

  address: "",
  city: "",
  areaPincode: "",
  mapLink: "",

  facilities: "",

  hospitalAddress: "",
  hospitalLink: "",

  schoolAddress: "",
  schoolLink: "",

  metroAddress: "",
  metroLink: "",

  mallAddress: "",
  mallLink: "",

  role: "",

  builderOfficeName: "",
  builderOfficeAddress: "",
  builderExperience: "",

  additionalDetails: "",
};

// Shared input styling — matches the rest of the Property Zone forms
// (sell.jsx / rent.jsx): white field, soft border, gold focus ring.
const INPUT_CLASS =
  "w-full px-4 py-3 rounded-xl border border-ink/10 bg-white text-ink placeholder:text-inksoft/40 focus:outline-none focus:ring-2 focus:ring-gold transition-shadow";

function EditProperty() {

  const { id } = useParams();
  const navigate = useNavigate();

  // Odd id → full listing (facilities, landmarks, role/builder details).
  // Even id → a reduced field set only.
  const isEven = id !== undefined && Number(id) % 2 === 0;

  const [form, setForm] = useState(initialForm);

  const [propertyImage, setPropertyImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);

  const [oldPropertyImage, setOldPropertyImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ==========================================
  // GET EXISTING PROPERTY
  // ==========================================

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {

    try {

      const response = await axios.get(
        `http://localhost:8000/propertyzone/edit/${id}/`,
        {
          withCredentials: true,
        }
      );

      console.log("Existing property:", response.data);

      const property = response.data.data;

      setForm({
        name: property.name || "",
        contact: property.contact || "",
        email: property.email || "",

        propertyType: property.propertyType || "",
        buildingName: property.buildingName || "",
        description: property.description || "",
        price: property.price || "",
        rent: property.rent || "",
        area: property.area || "",
        room: property.room || "",
        parking: property.parking || "",

        address: property.address || "",
        city: property.city || "",
        pincode: property.pincode || "",
        mapLink: property.mapLink || "",

        facilities: property.facilities || "",

        hospitalAddress: property.hospitalAddress || "",
        hospitalLink: property.hospitalLink || "",

        schoolAddress: property.schoolAddress || "",
        schoolLink: property.schoolLink || "",

        metroAddress: property.metroAddress || "",
        metroLink: property.metroLink || "",

        mallAddress: property.mallAddress || "",
        mallLink: property.mallLink || "",

        role: property.role || "",

        builderOfficeName:
          property.builderOfficeName || "",

        officeAddress:
          property.officeAddress || "",

        experience:
          property.experience || "",

        additionalDetails:
          property.additionalDetails || "",
      });

      setOldPropertyImage(property.propertyImage || "");

    } catch (error) {

      console.error(
        error.response?.data || error.message
      );

      setError("Could not load property.");

    } finally {

      setLoading(false);
    }
  };

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // MAIN IMAGE
  // ==========================================

  const handlePropertyImage = (e) => {

    setPropertyImage(
      e.target.files[0] || null
    );
  };

  // ==========================================
  // ADDITIONAL IMAGES
  // ==========================================

  const handleAdditionalImages = (e) => {

    setAdditionalImages(
      Array.from(e.target.files)
    );
  };

  // ==========================================
  // UPDATE
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setSubmitting(true);
    setError("");
    setMessage("");

    try {

      const formData = new FormData();

      // Basic information
      formData.append("name", form.name);
      formData.append("contact", form.contact);
      formData.append("email", form.email);

      // Property
      formData.append(
        "propertyType",
        form.propertyType
      );

      formData.append(
        "buildingName",
        form.buildingName
      );

      formData.append(
        "description",
        form.description
      );

      formData.append(
        "price",
        form.price
      );

      formData.append(
        "rent",
        form.rent
      );

      formData.append(
        "area",
        form.area
      );

      formData.append(
        "room",
        form.room
      );

      formData.append(
        "parking",
        JSON.stringify(form.parking)
      );

      // Location
      formData.append(
        "address",
        form.address
      );

      formData.append(
        "city",
        form.city
      );

      formData.append(
        "pincode",
        form.pincode
      );

      formData.append(
        "mapLink",
        form.mapLink
      );

      // Facilities
      formData.append(
        "facilities",
        JSON.stringify(form.facilities)
      );


      // Hospital

      formData.append(
        "hospitalAddress",
        form.hospitalAddress
      );

      formData.append(
        "hospitalLink",
        form.hospitalLink
      );

      // School

      formData.append(
        "schoolAddress",
        form.schoolAddress
      );

      formData.append(
        "schoolLink",
        form.schoolLink
      );

      // Metro

      formData.append(
        "metroAddress",
        form.metroAddress
      );

      formData.append(
        "metroLink",
        form.metroLink
      );

      // Mall

      formData.append(
        "mallAddress",
        form.mallAddress
      );

      formData.append(
        "mallLink",
        form.mallLink
      );

      // Role
      formData.append(
        "role",
        form.role
      );

      // Builder
      formData.append(
        "builderOfficeName",
        form.builderOfficeName
      );

      formData.append(
        "officeAddress",
        form.officeAddress
      );

      formData.append(
        "experience",
        form.experience
      );

      // Additional details
      formData.append(
        "additionalDetails",
        form.additionalDetails
      );

      // New main image
      if (propertyImage) {

        formData.append(
          "propertyImage",
          propertyImage
        );
      }

      // New additional images
      additionalImages.forEach((image) => {

        formData.append(
          "additionalImages",
          image
        );

      });

      const response = await axios.patch(
        `http://localhost:8000/propertyzone/edit/${id}/`,
        formData,
        {
          withCredentials: true,
        }
      );

      console.log(response.data);

      setMessage(
        "Property updated successfully!"
      );

      // Go back after update
      setTimeout(() => {
        navigate("/dashboard/property");
      }, 1000);

    } catch (error) {

      console.error(
        error.response?.data || error.message
      );

      setError(
        JSON.stringify(
          error.response?.data ||
          "Update failed"
        )
      );

    } finally {

      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen font-body bg-stone">
        <Sidebar />
        <main className="w-4/5 ml-[20%] min-h-screen flex items-center justify-center">
          <p className="text-inksoft/50 text-sm">Loading property…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen font-body bg-stone">

      {/* SIDEBAR (fixed to viewport, 20%) */}

      <Sidebar />

      {/* FORM (offset by sidebar width, 80%) */}

      <main className="w-4/5 ml-[20%] min-h-screen px-[4vw] py-12">

        <div className="max-w-3xl mx-auto">

          <div className="mb-8">
            <span className="uppercase text-xs tracking-widest text-gold font-semibold mb-2 inline-block">
              Listings
            </span>
            <h1 className="font-display font-semibold text-3xl text-ink">
              Edit Property
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl px-8 py-10 shadow-[0_16px_40px_rgba(20,32,58,0.08)] space-y-8"
          >

            {/* BASIC INFORMATION */}

            <section>

              <h2 className="font-display text-xl font-semibold text-ink mb-5">
                Contact Information
              </h2>

              <div className="grid md:grid-cols-3 gap-5">

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Name"
                  className={INPUT_CLASS}
                />

                <input
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  placeholder="Contact"
                  className={INPUT_CLASS}
                />

                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className={INPUT_CLASS}
                />

              </div>

            </section>

            {/* PROPERTY */}

            <section>

              <h2 className="font-display text-xl font-semibold text-ink mb-5">
                Property Information
              </h2>

              <div className="grid md:grid-cols-2 gap-5">

                <select
                  name="propertyType"
                  value={form.propertyType}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                >
                  <option value="">
                    Select Property Type
                  </option>

                  <option value="flat">
                    Flat
                  </option>

                  <option value="villa">
                    Villa
                  </option>

                  <option value="bungalow">
                    Bungalow
                  </option>

                  <option value="farmhouse">
                    Farmhouse
                  </option>

                  <option value="shop">
                    Shop
                  </option>

                  <option value="other">
                    Other
                  </option>

                </select>

                <input
                  name="buildingName"
                  value={form.buildingName}
                  onChange={handleChange}
                  placeholder="Building Name"
                  className={INPUT_CLASS}
                />

                {!isEven && (
                  <input
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Price"
                    type="number"
                    className={INPUT_CLASS}
                  />
                )}

                {isEven && (
                  <input
                    name="rent"
                    value={form.rent}
                    onChange={handleChange}
                    placeholder="Rent"
                    type="number"
                    className={INPUT_CLASS}
                  />
                )}

                <input
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  placeholder="Area (Sq. Ft.)"
                  type="number"
                  className={INPUT_CLASS}
                />

              </div>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                rows="5"
                className={`${INPUT_CLASS} mt-5 resize-y`}
              />

            </section>

            {/* BHK */}

            <section>

              <h2 className="font-display text-xl font-semibold text-ink mb-5">
                Configuration
              </h2>

              <div className="grid md:grid-cols-2 gap-5">

                <select
                  name="rooms"
                  value={form.rooms}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                >
                  <option value="">
                    Select BHK
                  </option>

                  <option value="1">
                    1 BHK
                  </option>

                  <option value="2">
                    2 BHK
                  </option>

                  <option value="3">
                    3 BHK
                  </option>

                  <option value="4">
                    4 BHK
                  </option>

                  <option value="5">
                    5 BHK
                  </option>

                </select>

                <select
                  name="parking"
                  value={form.parking}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                >
                  <option value="">
                    Select Parking
                  </option>

                  <option value="car_bike">
                    Car and Bike
                  </option>

                  <option value="bike">
                    Bike Only
                  </option>

                  <option value="none">
                    None
                  </option>

                </select>

              </div>

            </section>

            {/* LOCATION */}

            <section>

              <h2 className="font-display text-xl font-semibold text-ink mb-5">
                Location
              </h2>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Property Address"
                rows="3"
                className={`${INPUT_CLASS} resize-y`}
              />

              {isEven && (
                <div className="grid md:grid-cols-2 gap-5 mt-5">
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    className={INPUT_CLASS}
                  />

                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="Area / Pincode"
                    className={INPUT_CLASS}
                  />
                </div>
              )}

              <input
                name="mapLink"
                value={form.mapLink}
                onChange={handleChange}
                placeholder="Map Link"
                className={`${INPUT_CLASS} mt-5`}
              />

            </section>

            {/* FACILITIES */}

            {!isEven && (
              <section>

                <h2 className="font-display text-xl font-semibold text-ink mb-5">
                  Facilities
                </h2>

                <textarea
                  name="facilities"
                  value={form.facilities}
                  onChange={handleChange}
                  placeholder="Facilities"
                  rows="3"
                  className={`${INPUT_CLASS} resize-y`}
                />

              </section>
            )}

            {/* LANDMARKS */}

            {!isEven && (
              <section>

                <h2 className="font-display text-xl font-semibold text-ink mb-5">
                  Nearest Landmarks
                </h2>

                <Landmark
                  title="Hospital"
                  prefix="hospital"
                  form={form}
                  handleChange={handleChange}
                />

                <Landmark
                  title="School"
                  prefix="school"
                  form={form}
                  handleChange={handleChange}
                />

                <Landmark
                  title="Metro Station"
                  prefix="metro"
                  form={form}
                  handleChange={handleChange}
                />

                <Landmark
                  title="Shopping Mall"
                  prefix="mall"
                  form={form}
                  handleChange={handleChange}
                />

              </section>
            )}

            {/* EXISTING IMAGE */}

            {oldPropertyImage && (
              <section>

                <h2 className="font-display text-lg font-semibold text-ink mb-3">
                  Current Property Image
                </h2>

                <img
                  src={`http://localhost:8000${oldPropertyImage}`}
                  alt="Current property"
                  className="w-60 h-40 object-cover rounded-xl border border-ink/10"
                />

              </section>
            )}

            {/* NEW IMAGE */}

            <section>

              <label className="block text-sm font-medium text-ink mb-2">
                Change Property Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handlePropertyImage}
                className="w-full text-sm text-inksoft/70 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:bg-gold file:text-ink file:font-semibold file:cursor-pointer rounded-xl border border-ink/10 px-1 py-1"
              />

              <label className="block text-sm font-medium text-ink mt-5 mb-2">
                Add Additional Images
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalImages}
                className="w-full text-sm text-inksoft/70 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:bg-gold file:text-ink file:font-semibold file:cursor-pointer rounded-xl border border-ink/10 px-1 py-1"
              />

            </section>

            {/* ADDITIONAL DETAILS */}

            <section>

              <h2 className="font-display text-xl font-semibold text-ink mb-5">
                Additional Details
              </h2>

              <textarea
                name="additionalDetails"
                value={form.additionalDetails}
                onChange={handleChange}
                placeholder="Additional Details"
                rows="5"
                className={`${INPUT_CLASS} resize-y`}
              />

            </section>

            {/* ROLE */}

            {!isEven && (
              <section>

                <h2 className="font-display text-xl font-semibold text-ink mb-4">
                  Role
                </h2>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                >

                  <option value="">
                    Select Role
                  </option>

                  <option value="owner">
                    Owner
                  </option>

                  <option value="broker">
                    Broker
                  </option>

                  <option value="builder">
                    Builder
                  </option>

                </select>

              </section>
            )}

            {/* BUILDER */}

            {!isEven && form.role === "Builder" && (

              <section>

                <h2 className="font-display text-xl font-semibold text-ink mb-5">
                  Builder Information
                </h2>

                <input
                  name="builderOfficeName"
                  value={form.builderOfficeName}
                  onChange={handleChange}
                  placeholder="Builder Office Name"
                  className={INPUT_CLASS}
                />

                <textarea
                  name="officeAddress"
                  value={form.officeAddress}
                  onChange={handleChange}
                  placeholder="Builder Office Address"
                  rows="3"
                  className={`${INPUT_CLASS} mt-5 resize-y`}
                />

                <input
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  placeholder="Builder Work Experience"
                  className={`${INPUT_CLASS} mt-5`}
                />

              </section>
            )}

            {/* MESSAGES */}

            {message && (
              <div className="px-4 py-3 rounded-xl bg-sage/10 text-sage text-sm font-medium">
                {message}
              </div>
            )}

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 text-red-500 text-sm font-medium">
                {error}
              </div>
            )}

            {/* BUTTON */}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-full bg-gold text-ink font-semibold hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:translate-y-0"
            >
              {submitting
                ? "Updating..."
                : "Update Property"}
            </button>

          </form>

        </div>

      </main>

    </div>
  );
}

function Landmark({
  title,
  prefix,
  form,
  handleChange,
}) {

  return (
    <div className="bg-stone rounded-xl border border-ink/10 p-5 mb-5">

      <h3 className="text-xs font-semibold text-gold uppercase tracking-wide mb-4">
        {title}
      </h3>

      <div className="grid md:grid-cols-2 gap-5">

        <input
          name={`${prefix}Address`}
          value={form[`${prefix}Address`]}
          onChange={handleChange}
          placeholder={`${title} Address`}
          className={`${INPUT_CLASS} bg-white`}
        />

        <input
          name={`${prefix}Link`}
          value={form[`${prefix}Link`]}
          onChange={handleChange}
          placeholder={`${title} Link`}
          className={`${INPUT_CLASS} bg-white`}
        />

      </div>

    </div>
  );
}

export default EditProperty;
