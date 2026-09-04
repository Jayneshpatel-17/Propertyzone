import React, { useState } from 'react';
import axios from 'axios';

const initialForm = {
  username: '',
  contact: '',
  email: '',
  password: '',
  cpassword: '',
  address: '',
};

export default function Registration() {
  const [role, setRole] = useState('buyer'); // 'buyer' | 'seller'
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const switchRole = (nextRole) => {
    setRole(nextRole);
    setErrors({});
  };

  const validate = () => {
    const next = {};
   
    if (!form.username.trim()) next.username = 'Username is required.';

    if (role === 'seller') {
      if (!form.contact.trim()) next.contact = 'Mobile number is required.';
      else if (!/^\d{10}$/.test(form.contact.trim())) next.contact = 'Enter a valid 10-digit contact number.';
    }
    if (!form.email.trim()) next.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.';

    if (!form.password) next.password = 'Password is required.';
    else if (form.password.length < 6) next.password = 'Password must be at least 6 characters.';

    if (!form.cpassword) next.cpassword = 'Please confirm your password.';
    else if (form.password !== form.cpassword) next.cpassword = 'Passwords do not match.';

    if (role === 'seller') {
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
      let endpoint;

      if (role === 'buyer') {
        payload = {
          username: form.username,
          email: form.email,
          password: form.password,
          cpassword: form.cpassword,
        };
        endpoint = 'http://127.0.0.1:8000/propertyzone/buyer/';
      } else {
        payload = {
          username: form.username,
          contact: form.contact,
          email: form.email,
          password: form.password,
          cpassword: form.cpassword,
          address: form.address,
        };
        endpoint = 'http://127.0.0.1:8000/propertyzone/seller/';
      }

      await axios.post(endpoint, payload);
      setSuccess(true);
      setForm(initialForm);
    } catch (error) {
      console.error(error.response?.data || error.message);
      setErrors({ submit: 'Registration failed. Please try again.' });
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (field) =>
    `w-full px-4 py-3 rounded-xl border bg-white text-ink placeholder:text-inksoft/40 focus:outline-none focus:ring-2 focus:ring-gold transition-shadow ${
      errors[field] ? 'border-red-400' : 'border-ink/10'
    }`;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-stone px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_16px_40px_rgba(20,32,58,0.08)] px-8 py-10">
        <div className="text-center mb-6">
          <a href="/" className="font-display text-2xl font-bold text-ink">
            Property Zone
          </a>
          <h1 className="font-display font-semibold text-3xl mt-4 mb-2 text-ink">Create your account</h1>
          <p className="text-inksoft/60 text-sm">Register to save properties, track enquiries, and get updates.</p><br />
        </div>

        {/* Role toggle */}
        <div className="grid grid-cols-2 gap-2 bg-stone rounded-full p-1 mb-8">
          {['buyer', 'seller'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => switchRole(option)}
              className={`py-2.5 rounded-full text-sm font-semibold capitalize transition-colors ${
                role === option ? 'bg-gold text-ink' : 'text-inksoft/60 hover:text-ink'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="reg-username" className="text-sm font-medium text-ink">
              Username
            </label>
            <input
              id="reg-username"
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

          {role === 'seller' && (
            <>
          <div className="flex flex-col gap-2">
            <label htmlFor="reg-contact" className="text-sm font-medium text-ink">
              Mobile No.
            </label>
            <input
              id="reg-contact"
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
          </>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="reg-email" className="text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="reg-email"
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

          <div className="flex flex-col gap-2">
            <label htmlFor="reg-password" className="text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="reg-password"
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
            <label htmlFor="reg-confirm-password" className="text-sm font-medium text-ink">
              Confirm Password
            </label>
            <input
              id="reg-confirm-password"
              name="cpassword"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={form.cpassword}
              onChange={handleChange}
              className={fieldClass('cpassword')}
            />
            {errors.cpassword && <p className="text-red-500 text-xs">{errors.cpassword}</p>}
          </div>

          {role === 'seller' && (
            <>
          <div className="flex flex-col gap-2">
            <label htmlFor="reg-address" className="text-sm font-medium text-ink">
              Address
            </label>
            <textarea
              id="reg-address"
              name="address"
              rows="3"
              placeholder="House no., street, city, state, PIN"
              value={form.address}
              onChange={handleChange}
              className={`${fieldClass('address')} resize-y`}
            ></textarea>
            {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
          </div>
          </>
          )}


          {errors.submit && <p className="text-red-500 text-sm text-center">{errors.submit}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gold text-ink font-semibold rounded-full py-3.5 mt-2 hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:translate-y-0"
          >
            {submitting ? 'Creating account…' : `Register as ${role === 'buyer' ? 'Buyer' : 'Seller'}`}
          </button>

          {success && (
            <p className="text-center text-sm text-sage font-medium">
              Account created successfully! You can now log in.
            </p>
          )}
        </form>

        <p className="text-center text-sm text-inksoft/60 mt-8">
          Already have an account?{' '}
          <a href="/login" className="text-gold font-semibold hover:underline">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}
