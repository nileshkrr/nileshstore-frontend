import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/api';
import { OrderStatusBadge } from '../components/common';

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <div className="bg-white border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(({ data }) => setStats(data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your store's performance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          subtitle="All time"
          icon="📦"
          color="bg-blue-50"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
          subtitle="From paid orders"
          icon="💰"
          color="bg-green-50"
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          subtitle="Awaiting processing"
          icon="⏳"
          color="bg-yellow-50"
        />
        <StatCard
          title="Delivered"
          value={stats?.deliveredOrders || 0}
          subtitle="Successfully delivered"
          icon="✅"
          color="bg-orange-50"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Sales Chart */}
        {stats?.monthlySales?.length > 0 && (
          <div className="bg-white border border-gray-100 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Monthly Revenue</h2>
            <div className="space-y-2">
              {stats.monthlySales.slice(-6).map((m) => {
                const maxRevenue = Math.max(...stats.monthlySales.map(s => s.total));
                const percent = maxRevenue > 0 ? (m.total / maxRevenue) * 100 : 0;
                const monthName = new Date(m._id.year, m._id.month - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
                return (
                  <div key={`${m._id.year}-${m._id.month}`}>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>{monthName}</span>
                      <span className="font-semibold">₹{m.total.toLocaleString()} ({m.count} orders)</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-gray-900 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <div className="bg-white border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-orange-500 hover:underline font-medium">View All →</Link>
          </div>
          {!stats?.recentOrders?.length ? (
            <p className="text-sm text-gray-400 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {order.user?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-bold text-gray-900">₹{order.totalPrice.toLocaleString()}</p>
                    <OrderStatusBadge status={order.orderStatus} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Add Product', path: '/admin/products', icon: '➕' },
          { label: 'View Orders', path: '/admin/orders', icon: '📋' },
          { label: 'Manage Users', path: '/admin/users', icon: '👥' },
          { label: 'Visit Store', path: '/', icon: '🏪' },
        ].map(action => (
          <Link
            key={action.label}
            to={action.path}
            className="bg-white border border-gray-100 p-4 text-center hover:shadow-md transition-shadow group"
          >
            <p className="text-2xl mb-2">{action.icon}</p>
            <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{action.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}