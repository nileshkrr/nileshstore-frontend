import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';

// The page has three visual stages
const STAGE = { FORM: 'form', LOADING: 'loading', SENT: 'sent' };

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('');
  const [stage, setStage]   = useState(STAGE.FORM);
  const [error, setError]   = useState('');
  // In dev the backend echoes the URL so testers don't need a real mailbox
  const [devUrl, setDevUrl] = useState('');

  const handleSubmit = async (e) => {
    console.log("SUBMIT CLICKED");
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setStage(STAGE.LOADING);
    try {
      const { data } = await forgotPassword({ email: email.trim().toLowerCase() });
      if (data.devResetUrl) setDevUrl(data.devResetUrl);
      setStage(STAGE.SENT);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setStage(STAGE.FORM);
    }
  };

  /* ── Sent confirmation ─────────────────────────────────────────────────── */
  if (stage === STAGE.SENT) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-white">
        <div className="w-full max-w-md text-center fade-in-up">

          {/* Animated envelope badge */}
          <div className="relative inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <svg className="w-11 h-11 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold text-gray-900 mb-3">Check your inbox</h1>
          <p className="text-gray-500 leading-relaxed mb-1">We sent a password reset link to</p>
          <p className="font-bold text-gray-900 text-lg mb-6">{email}</p>
          <p className="text-sm text-gray-400 mb-8">
            The link expires in <span className="font-semibold text-gray-600">15 minutes</span>.
            <br />Don't see it? Check your spam or junk folder.
          </p>

          {/* Dev helper – only shown when backend is in development mode */}
          {devUrl && (
            <div className="bg-amber-50 border border-amber-300 rounded p-4 mb-6 text-left">
              <p className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1">
                <span>🛠</span> Dev mode — link not emailed, click below to test:
              </p>
              <Link
                to={devUrl.replace(window.location.origin, '')}
                className="text-xs text-amber-700 break-all underline leading-relaxed"
              >
                {devUrl}
              </Link>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => { setStage(STAGE.FORM); setError(''); setDevUrl(''); }}
              className="btn-secondary w-full"
            >
              Try a different email
            </button>
            <Link to="/login" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Request form ──────────────────────────────────────────────────────── */
  return (
    <div className="min-h-[80vh] flex">

      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden items-end p-12">
        <img
          src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 max-w-sm">
          <Link to="/" className="flex items-center gap-1 mb-8">
            <span className="font-display text-3xl font-bold text-white">Drip</span>
            <span className="font-display text-3xl font-bold text-orange-400">Store</span>
          </Link>
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Forgot your<br />password?
          </h2>
          <p className="text-gray-300 leading-relaxed mb-8">
            No worries — it happens to the best of us. Enter your email and we'll send you a secure link to get back in instantly.
          </p>
          <ul className="space-y-4">
            {[
              { icon: '🔒', label: 'Secure one-time reset link' },
              { icon: '⏱️', label: 'Expires in 15 minutes' },
              { icon: '⚡', label: 'Logged in automatically after reset' },
            ].map(({ icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <span className="text-gray-300 text-sm">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md fade-in-up">

          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-1 mb-8 lg:hidden">
            <span className="font-display text-2xl font-bold text-gray-900">Drip</span>
            <span className="font-display text-2xl font-bold text-orange-500">Store</span>
          </Link>

          {/* Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-6">
            <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>

          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Forgot password?</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Enter the email you signed up with and we'll send you a link to reset your password.
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-6">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                className={`input-field ${error ? 'border-red-400' : ''}`}
                autoComplete="email"
                autoFocus
                disabled={stage === STAGE.LOADING}
              />
            </div>

            <button
              type="submit"
              disabled={stage === STAGE.LOADING}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base"
            >
              {stage === STAGE.LOADING ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending reset link…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-3 text-sm text-gray-500">
            <Link
              to="/login"
              className="flex items-center gap-1.5 font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to login
            </Link>
            <Link to="/register" className="hover:text-gray-900 transition-colors">
              Don't have an account? <span className="font-semibold text-gray-800">Sign up</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}