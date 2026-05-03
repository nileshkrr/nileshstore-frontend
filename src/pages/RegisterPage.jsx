import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.email) return 'Email is required';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirm) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['', 'Weak', 'Medium', 'Strong'];

  return (
    <div className="min-h-[80vh] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden items-end p-12">
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900"
          alt="Fashion"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-1 mb-8">
            <span className="font-display text-3xl font-bold text-white">Drip</span>
            <span className="font-display text-3xl font-bold text-orange-400">Store</span>
          </Link>
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Join the<br />DripStore Family
          </h2>
          <p className="text-gray-300 leading-relaxed max-w-sm mb-6">
            Create your account and unlock exclusive deals, track your orders, and enjoy a personalized shopping experience.
          </p>
          <div className="space-y-3">
            {['✓ Exclusive member discounts', '✓ Track your orders in real-time', '✓ Save your wishlist', '✓ Faster checkout'].map(benefit => (
              <p key={benefit} className="text-gray-300 text-sm">{benefit}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-1 mb-8 lg:hidden">
            <span className="font-display text-2xl font-bold text-gray-900">Drip</span>
            <span className="font-display text-2xl font-bold text-orange-500">Store</span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-500">It's free and only takes a minute</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-6 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="input-field"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="input-field pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Password strength */}
              {form.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs ${strength === 1 ? 'text-red-500' : strength === 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {strengthLabels[strength]} password
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className={`input-field ${form.confirm && form.confirm !== form.password ? 'border-red-400' : form.confirm && form.confirm === form.password ? 'border-green-400' : ''}`}
                autoComplete="new-password"
              />
              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Create Account'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-gray-600 underline">Terms of Service</a> and{' '}
              <a href="#" className="text-gray-600 underline">Privacy Policy</a>.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-gray-900 hover:text-orange-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}