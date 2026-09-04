import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.password) next.password = 'Password is required.';
    else if (form.password.length < 6) next.password = 'Password must be at least 6 characters.';

    if (!form.confirmPassword) next.confirmPassword = 'Please confirm your new password.';
    else if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match.';

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
    setErrors({});
    try {
      await axios.post('http://localhost:8000/propertyzone/reset-password/', {
        token,
        password: form.password,
      });
      setSuccess(true);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setErrors({
        submit: err.response?.data?.message || 'Could not reset your password. The link may have expired.',
      });
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
        <div className="text-center mb-8">
          <a href="/" className="font-display text-2xl font-bold text-ink">
            Property Zone
          </a>
          <h1 className="font-display font-semibold text-3xl mt-4 mb-2 text-ink">Reset Password</h1>
          <p className="text-inksoft/60 text-sm">Choose a new password for your account.</p>
        </div>

        {success ? (
          <div className="text-center">
            <p className="text-sage text-sm font-medium mb-6">
              Your password has been reset successfully.
            </p>
            <a
              href="/login"
              className="inline-block bg-gold text-ink font-semibold rounded-full px-7 py-3.5 hover:-translate-y-0.5 transition-transform"
            >
              Log In
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="reset-password" className="text-sm font-medium text-ink">
                New Password
              </label>
              <input
                id="reset-password"
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
              <label htmlFor="reset-confirm-password" className="text-sm font-medium text-ink">
                Confirm New Password
              </label>
              <input
                id="reset-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter new password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={fieldClass('confirmPassword')}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
            </div>

            {errors.submit && <p className="text-red-500 text-sm text-center">{errors.submit}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gold text-ink font-semibold rounded-full py-3.5 mt-2 hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:translate-y-0"
            >
              {submitting ? 'Resetting…' : 'Reset Password'}
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
