import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/api';

const STAGE = { FORM: 'form', LOADING: 'loading', SUCCESS: 'success' };

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [stage, setStage] = useState(STAGE.FORM);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setStage(STAGE.LOADING);

    try {
      await resetPassword(token, password);
      setStage(STAGE.SUCCESS);

      // auto redirect after 2s
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Try again.');
      setStage(STAGE.FORM);
    }
  };

  /* ── SUCCESS SCREEN ───────────────────────────────────────── */
  if (stage === STAGE.SUCCESS) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-white">
        <div className="w-full max-w-md text-center fade-in-up">

          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold mb-3">Password Reset Successful</h1>
          <p className="text-gray-500 mb-6">
            You can now login with your new password.
          </p>

          <Link to="/login" className="btn-primary w-full block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  /* ── FORM ─────────────────────────────────────────────────── */
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-white">
      <div className="w-full max-w-md fade-in-up">

        <Link to="/" className="flex items-center gap-1 mb-8">
          <span className="font-display text-2xl font-bold text-gray-900">Drip</span>
          <span className="font-display text-2xl font-bold text-orange-500">Store</span>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
        <p className="text-gray-500 mb-6">
          Enter your new password below.
        </p>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            disabled={stage === STAGE.LOADING}
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="input-field"
            disabled={stage === STAGE.LOADING}
          />

          <button
            type="submit"
            disabled={stage === STAGE.LOADING}
            className="btn-primary w-full py-3 flex justify-center items-center gap-2"
          >
            {stage === STAGE.LOADING ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>

        </form>

        <div className="mt-6 text-sm text-center">
          <Link to="/login" className="text-gray-500 hover:text-gray-900">
            Back to login
          </Link>
        </div>

      </div>
    </div>
  );
}