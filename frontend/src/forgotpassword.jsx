import React, { useState } from 'react';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const validate = () => {
    if (!email.trim()) return 'Email is required.';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await axios.post('http://localhost:8000/propertyzone/forgot-password/', {
        email: email.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || 'Could not send reset instructions. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-stone px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_16px_40px_rgba(20,32,58,0.08)] px-8 py-10">
        <div className="text-center mb-8">
          <a href="/" className="font-display text-2xl font-bold text-ink">
            Property Zone
          </a>
          <h1 className="font-display font-semibold text-3xl mt-4 mb-2 text-ink">Forgot Password</h1>
          <p className="text-inksoft/60 text-sm">
            Enter the email linked to your account and we'll send you reset instructions.
          </p>
        </div>

        {submitted ? (
          <div className="text-center">
            <p className="text-sage text-sm font-medium mb-6">
              If an account exists for <span className="font-semibold text-ink">{email}</span>, reset
              instructions have been sent.
            </p>
            <a
              href="/login"
              className="inline-block bg-gold text-ink font-semibold rounded-full px-7 py-3.5 hover:-translate-y-0.5 transition-transform"
            >
              Back to Log In
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="forgot-email" className="text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border bg-white text-ink placeholder:text-inksoft/40 focus:outline-none focus:ring-2 focus:ring-gold transition-shadow ${
                  error ? 'border-red-400' : 'border-ink/10'
                }`}
              />
              {error && <p className="text-red-500 text-xs">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gold text-ink font-semibold rounded-full py-3.5 mt-2 hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:translate-y-0"
            >
              {submitting ? 'Sending…' : 'Send Reset Instructions'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-inksoft/60 mt-8">
          Remembered your password?{' '}
          <a href="/login" className="text-gold font-semibold hover:underline">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}
