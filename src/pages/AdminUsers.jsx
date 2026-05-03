import React, { useEffect, useState } from 'react';
import { getAllUsers, toggleUserStatus } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState('');

  useEffect(() => {
    getAllUsers()
      .then(({ data }) => setUsers(data.users))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (userId, currentStatus, name) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${name}?`)) return;
    setToggling(userId);
    try {
      const { data } = await toggleUserStatus(userId);
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: data.user.isActive } : u));
      toast.success(`User ${action}d successfully`);
    } catch (err) {
      toast.error('Failed to update user status');
    } finally {
      setToggling('');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = users.filter(u => u.isActive).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500">{users.length} total customers · {activeCount} active</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Users', value: users.length, icon: '👥', color: 'bg-blue-50' },
          { label: 'Active', value: activeCount, icon: '✅', color: 'bg-green-50' },
          { label: 'Inactive', value: users.length - activeCount, icon: '🚫', color: 'bg-red-50' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.color} border border-gray-100 p-4 flex items-center gap-3`}>
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-100 p-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-sm py-2 text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['User', 'Email', 'Phone', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-gray-400">
                  {search ? 'No users match your search' : 'No users found'}
                </td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user._id} className={`hover:bg-gray-50 transition-colors ${!user.isActive ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                        {user.addresses?.length > 0 && (
                          <p className="text-xs text-gray-400">{user.addresses.length} address{user.addresses.length > 1 ? 'es' : ''}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600">{user.phone || '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(user._id, user.isActive, user.name)}
                      disabled={toggling === user._id}
                      className={`text-xs font-medium border px-2 py-1 transition-colors disabled:opacity-50 ${user.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                    >
                      {toggling === user._id ? '...' : user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}