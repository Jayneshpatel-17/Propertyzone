import React, { useState, useEffect } from 'react';
import axios from 'axios';

const initialForm = {
  username: '',
  contact: '',
  email: '',
  password: '',
  cpassword: '',
  address: '',
};

export default function EditProfile() {
  const role = localStorage.getItem('role'); // 'buyer' | 'seller'
  const isSeller = role === 'seller';

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/propertyzone/editprofile/', {
        withCredentials: true,
      });
      const data = response.data.data || response.data;

      setForm({
        username: data.username || '',
        contact: data.contact || '',
        email: data.email || '',
        password: '',
        cpassword: '',
        address: data.address || '',
      });
    } catch (error) {
      console.error(error.response?.data || error.message);
      setErrors({ fetch: 'Could not load your profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};

    if (!form.username.trim()) next.username = 'Username is required.';

    if (isSeller) {
      if (!form.contact.trim()) next.contact = 'Mobile number is required.';
      else if (!/^\d{10}$/.test(form.contact.trim())) next.contact = 'Enter a valid 10-digit contact number.';
    }

    if (!form.email.trim()) next.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.';

    // Password change is optional — only validated if the user starts typing one.
    if (form.password || form.cpassword) {
      if (form.password.length < 6) next.password = 'Password must be at least 6 characters.';
      if (!form.cpassword) next.cpassword = 'Please confirm your new password.';
      else if (form.password !== form.cpassword) next.cpassword = 'Passwords do not match.';
    }

    if (isSeller) {
      if (!form.address.trim()) next.address = 'Address is required.';
    }

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccess(false);
      return;
    }

    setSubmitting(true);
    try {
      let payload;

      if (role === 'buyer') {
        payload = {
          username: form.username,
          email: form.email,
        };
      } else {
        payload = {
          username: form.username,
          contact: form.contact,
          email: form.email,
          address: form.address,
        };
      }

      if (form.password) {
        payload.password = form.password;
        payload.cpassword = form.cpassword;
      }

      await axios.patch('http://localhost:8000/propertyzone/editprofile/', payload, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json"
        },
        // body: JSON.stringify({
        //   name: "form.name",
        //   email: "form.email",
        //   mobile: "form.contact"
        // })
      });

      localStorage.setItem('username', form.username);

      setForm((prev) => ({ ...prev, password: '', cpassword: '' }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error.response?.data || error.message);
      setErrors({ submit: 'Could not update your profile. Please try again.' });
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (field) =>
    `w-full px-4 py-3 rounded-xl border bg-white text-ink placeholder:text-inksoft/40 focus:outline-none focus:ring-2 focus:ring-gold transition-shadow ${
      errors[field] ? 'border-red-400' : 'border-ink/10'
    }`;

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-stone px-4 py-12">
        <p className="text-inksoft/50 text-sm">Loading your profile…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-stone px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_16px_40px_rgba(20,32,58,0.08)] px-8 py-10">
        <div className="text-center mb-6">
          <a href="/" className="font-display text-2xl font-bold text-ink">
            Property Zone
          </a>
          <h1 className="font-display font-semibold text-3xl mt-4 mb-2 text-ink">Edit Profile</h1>
          <p className="text-inksoft/60 text-sm">Update your account details below.</p>
        </div>

        {/* Role badge (read-only — role isn't changed here) */}
        <div className="flex justify-center mb-8">
          <span className="px-4 py-1.5 rounded-full bg-stone text-inksoft/60 text-xs font-semibold uppercase tracking-wide">
            {isSeller ? 'Seller' : 'Buyer'} Account
          </span>
        </div>

        {errors.fetch ? (
          <div className="text-center">
            <p className="text-red-500 text-sm mb-6">{errors.fetch}</p>
            <button
              type="button"
              onClick={fetchProfile}
              className="bg-gold text-ink font-semibold rounded-full px-7 py-3 hover:-translate-y-0.5 transition-transform"
            >
              Try Again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="edit-username" className="text-sm font-medium text-ink">
                Username
              </label>
              <input
                id="edit-username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Choose a username"
                value={form.username}
                onChange={handleChange}
                className={fieldClass('username')}
              />
              {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}
            </div>

            {isSeller && (
              <div className="flex flex-col gap-2">
                <label htmlFor="edit-contact" className="text-sm font-medium text-ink">
                  Mobile No.
                </label>
                <input
                  id="edit-contact"
                  name="contact"
                  type="tel"
                  autoComplete="tel"
                  placeholder="10-digit contact number"
                  value={form.contact}
                  onChange={handleChange}
                  className={fieldClass('contact')}
                />
                {errors.contact && <p className="text-red-500 text-xs">{errors.contact}</p>}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="edit-email" className="text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="edit-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className={fieldClass('email')}
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
            </div>

            {isSeller && (
              <div className="flex flex-col gap-2">
                <label htmlFor="edit-address" className="text-sm font-medium text-ink">
                  Address
                </label>
                <textarea
                  id="edit-address"
                  name="address"
                  rows="3"
                  placeholder="House no., street, city, state, PIN"
                  value={form.address}
                  onChange={handleChange}
                  className={`${fieldClass('address')} resize-y`}
                ></textarea>
                {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
              </div>
            )}

            <div className="border-t border-ink/10 pt-5">
              <span className="text-xs uppercase tracking-widest text-gold font-semibold">
                Change Password
              </span>
              <p className="text-xs text-inksoft/50 mt-1">Leave blank to keep your current password.</p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="edit-password" className="text-sm font-medium text-ink">
                New Password
              </label>
              <input
                id="edit-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                className={fieldClass('password')}
              />
              {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="edit-cpassword" className="text-sm font-medium text-ink">
                Confirm New Password
              </label>
              <input
                id="edit-cpassword"
                name="cpassword"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter new password"
                value={form.cpassword}
                onChange={handleChange}
                className={fieldClass('cpassword')}
              />
              {errors.cpassword && <p className="text-red-500 text-xs">{errors.cpassword}</p>}
            </div>

            {errors.submit && <p className="text-red-500 text-sm text-center">{errors.submit}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer w-full bg-gold text-ink font-semibold rounded-full py-3.5 mt-2 hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:translate-y-0"
            >
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>

            {success && (
              <p className="text-center text-sm text-sage font-medium">
                Profile updated successfully!
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
