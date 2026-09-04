import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (!form.password) next.password = 'Password is required.';
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
      const response = await fetch(
        "http://localhost:8000/propertyzone/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            email: form.email,
            password: form.password
          })
        }
      );

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (data.status) {
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("userId", data.user.id);

        if(data.user.role == "seller"){
          navigate("/dashboard");
        }
        if(data.user.role == "buyer"){
          navigate("/home");
        }
      } else {
        setErrors({ submit: data.message || 'Invalid email or password.' });
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setErrors({ submit: 'Something went wrong. Please try again.' });
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
          <h1 className="font-display font-semibold text-3xl mt-4 mb-2 text-ink">Welcome back</h1>
          <p className="text-inksoft/60 text-sm">Log in to manage your saved properties and enquiries.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="login-email" className="text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border bg-white text-ink placeholder:text-inksoft/40 focus:outline-none focus:ring-2 focus:ring-gold transition-shadow ${
                errors.email ? 'border-red-400' : 'border-ink/10'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-medium text-ink">
                Password
              </label>
              <a href="/forgot-password" className="text-xs font-semibold text-gold hover:underline">
                Forgot password?
              </a>
            </div>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border bg-white text-ink placeholder:text-inksoft/40 focus:outline-none focus:ring-2 focus:ring-gold transition-shadow ${
                errors.password ? 'border-red-400' : 'border-ink/10'
              }`}
            />
            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
          </div>

          {errors.submit && <p className="text-red-500 text-sm text-center">{errors.submit}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gold text-ink font-semibold rounded-full py-3.5 mt-2 hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:translate-y-0"
          >
            {submitting ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-sm text-inksoft/60 mt-8">
          Don't have an account?{' '}
          <a href="/register" className="text-gold font-semibold hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
