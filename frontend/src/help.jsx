import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';

const CATEGORY_OPTIONS = [
  'Account',
  'Property Listing',
  'Booking',
  'Technical Issue',
  'Other',
];

const initialForm = {
  category: '',
  subject: '',
  message: '',
};

export default function Help() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/propertyzone/help/', {
        withCredentials: true,
      });
      const data = response.data.data || response.data;
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      // No requests yet, or endpoint not set up — fail quietly, the form
      // still works for submitting a new request.
      console.error(err.response?.data || err.message);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.category) next.category = 'Please select a category.';
    if (!form.subject.trim()) next.subject = 'Subject is required.';
    if (!form.message.trim()) next.message = 'Please describe your issue.';
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
      const response = await axios.post(
        'http://localhost:8000/propertyzone/help/',
        {
          category: form.category,
          subject: form.subject.trim(),
          message: form.message.trim(),
        },
        { withCredentials: true }
      );

      const newRequest = response.data.data || response.data || {
        category: form.category,
        subject: form.subject.trim(),
        message: form.message.trim(),
        status: 'Pending',
      };

      setRequests((prev) => [newRequest, ...prev]);
      setForm(initialForm);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setErrors({ submit: 'Could not send your request. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (field) =>
    `w-full px-4 py-3 rounded-xl border bg-white text-ink placeholder:text-inksoft/40 focus:outline-none focus:ring-2 focus:ring-gold transition-shadow ${
      errors[field] ? 'border-red-400' : 'border-ink/10'
    }`;

  const statusClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'resolved') return 'bg-sage/10 text-sage';
    if (s === 'in progress') return 'bg-gold/10 text-gold';
    return 'bg-stone-dark text-inksoft/60';
  };

  return (
    <div className="w-full min-h-screen font-body bg-stone">
      <Sidebar />

      <main className="w-4/5 ml-[20%] min-h-screen px-[4vw] py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <span className="uppercase text-xs tracking-widest text-gold font-semibold mb-2 inline-block">
              Support
            </span>
            <h1 className="font-display font-semibold text-3xl text-ink mb-2">Help &amp; Support</h1>
            <p className="text-inksoft/60 text-sm">
              Have a question or ran into an issue? Send a message to our admin team below.
            </p>
          </div>

          {/* Request form */}
          <div className="bg-white rounded-2xl shadow-[0_16px_40px_rgba(20,32,58,0.08)] px-8 py-10 mb-10">
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink">Category</label>
                <select name="category" value={form.category} onChange={handleChange} className={fieldClass('category')}>
                  <option value="">Select a category</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs">{errors.category}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink">Subject</label>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="A short summary of your issue"
                  className={fieldClass('subject')}
                />
                {errors.subject && <p className="text-red-500 text-xs">{errors.subject}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink">Message</label>
                <textarea
                  name="message"
                  rows="5"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Describe your issue in detail — the more context, the faster we can help."
                  className={`${fieldClass('message')} resize-y`}
                ></textarea>
                {errors.message && <p className="text-red-500 text-xs">{errors.message}</p>}
              </div>

              {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}
              {submitted && <p className="text-sage text-sm font-medium">Your request has been sent to admin.</p>}

              <button
                type="submit"
                disabled={submitting}
                className="cursor-pointer w-fit bg-gold text-ink font-semibold rounded-full px-7 py-3.5 hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:translate-y-0"
              >
                {submitting ? 'Sending…' : 'Send Request'}
              </button>
            </form>
          </div>

          {/* Previous requests */}
          <div>
            <h2 className="font-display text-xl font-semibold text-ink mb-4">Your Requests</h2>

            {requestsLoading ? (
              <p className="text-inksoft/50 text-sm">Loading…</p>
            ) : requests.length === 0 ? (
              <p className="text-inksoft/50 text-sm">You haven't sent any requests yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {requests.map((r, i) => (
                  <div key={r.id || i} className="bg-white rounded-xl border border-ink/10 px-5 py-4">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <p className="font-semibold text-ink text-sm">{r.subject}</p>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusClass(r.status)}`}>
                        {r.status || 'Pending'}
                      </span>
                    </div>
                    {r.category && <p className="text-xs text-gold font-semibold uppercase tracking-wide mb-1">{r.category}</p>}
                    <p className="text-sm text-inksoft/60 leading-relaxed">{r.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
