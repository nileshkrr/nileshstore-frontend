import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services/api';
import toast from 'react-hot-toast';

const TABS = ['Profile', 'Security', 'Addresses'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [pwErrors, setPwErrors] = useState({});

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await updateProfile({ name: profile.name, phone: profile.phone });
      updateUser(data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!passwords.currentPassword) errs.currentPassword = 'Required';
    if (passwords.newPassword.length < 6) errs.newPassword = 'Minimum 6 characters';
    if (passwords.newPassword !== passwords.confirmPassword) errs.confirmPassword = "Passwords don't match";
    if (Object.keys(errs).length > 0) { setPwErrors(errs); return; }

    setLoading(true);
    try {
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container py-8">
      <h1 className="section-title text-2xl md:text-3xl mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Avatar card */}
          <div className="bg-white border border-gray-100 p-6 text-center mb-4">
            <div className="w-20 h-20 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
            <span className={`inline-block mt-2 text-xs px-2 py-0.5 font-medium ${user?.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
              {user?.role === 'admin' ? 'Admin' : 'Member'}
            </span>
          </div>

          {/* Tab navigation */}
          <nav className="bg-white border border-gray-100 overflow-hidden">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`w-full text-left px-4 py-3 text-sm font-medium border-l-2 transition-colors ${activeTab === i ? 'border-gray-900 bg-gray-50 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">

          {/* Profile Tab */}
          {activeTab === 0 && (
            <div className="bg-white border border-gray-100 p-6">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-5">Personal Information</h2>
              <form onSubmit={handleProfileSave} className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="input-field"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="input-field bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="input-field"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                    {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                    Save Changes
                  </button>
                </div>
              </form>

              {/* Account stats */}
              <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4">
                {[
                  { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—' },
                  { label: 'Account Status', value: 'Active' },
                  { label: 'Account Type', value: user?.role === 'admin' ? 'Administrator' : 'Customer' },
                ].map(stat => (
                  <div key={stat.label} className="bg-gray-50 p-4 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
                    <p className="font-semibold text-gray-900 mt-1 text-sm">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 1 && (
            <div className="bg-white border border-gray-100 p-6">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-2">Change Password</h2>
              <p className="text-sm text-gray-500 mb-5">Update your password to keep your account secure.</p>

              <form onSubmit={handlePasswordChange} className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                  <input
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) => { setPasswords({ ...passwords, currentPassword: e.target.value }); setPwErrors({ ...pwErrors, currentPassword: '' }); }}
                    className={`input-field ${pwErrors.currentPassword ? 'border-red-400' : ''}`}
                    placeholder="Enter current password"
                  />
                  {pwErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.currentPassword}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => { setPasswords({ ...passwords, newPassword: e.target.value }); setPwErrors({ ...pwErrors, newPassword: '' }); }}
                    className={`input-field ${pwErrors.newPassword ? 'border-red-400' : ''}`}
                    placeholder="Min. 6 characters"
                  />
                  {pwErrors.newPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.newPassword}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => { setPasswords({ ...passwords, confirmPassword: e.target.value }); setPwErrors({ ...pwErrors, confirmPassword: '' }); }}
                    className={`input-field ${pwErrors.confirmPassword ? 'border-red-400' : ''}`}
                    placeholder="Re-enter new password"
                  />
                  {pwErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.confirmPassword}</p>}
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700 rounded">
                  Password must be at least 6 characters. Choose a strong, unique password for best security.
                </div>

                <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                  Update Password
                </button>
              </form>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 2 && (
            <div className="bg-white border border-gray-100 p-6">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-5">Saved Addresses</h2>

              {user?.addresses?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses.map((addr, idx) => (
                    <div key={idx} className={`border p-4 ${addr.isDefault ? 'border-gray-900' : 'border-gray-200'}`}>
                      {addr.isDefault && (
                        <span className="inline-block bg-gray-900 text-white text-xs px-2 py-0.5 mb-2">Default</span>
                      )}
                      {addr.label && <p className="font-semibold text-gray-900 text-sm">{addr.label}</p>}
                      <p className="text-sm text-gray-600 mt-1">{addr.street}</p>
                      <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50">
                  <p className="text-4xl mb-3">📍</p>
                  <p className="font-semibold text-gray-900 mb-1">No saved addresses</p>
                  <p className="text-sm text-gray-500">Addresses you use during checkout will appear here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}