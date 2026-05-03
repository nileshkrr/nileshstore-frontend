import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrders, updateOrderStatus } from '../services/api';
import { OrderStatusBadge, PaymentStatusBadge } from '../components/common';
import toast from 'react-hot-toast';

const ORDER_STATUSES = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filterStatus) params.status = filterStatus;
      const { data } = await getAllOrders(params);
      setOrders(data.orders);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const payload = { orderStatus: newStatus };
      if (trackingInput && newStatus === 'shipped') payload.trackingNumber = trackingInput;
      await updateOrderStatus(orderId, payload);
      toast.success(`Order marked as ${newStatus}`);
      setTrackingInput('');
      setExpandedOrder(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating('');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">{total} total orders</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {['', ...ORDER_STATUSES].map(status => (
          <button
            key={status}
            onClick={() => { setFilterStatus(status); setPage(1); }}
            className={`px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors border ${filterStatus === status ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-900'}`}
          >
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All Orders'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Order', 'Customer', 'Items', 'Total', 'Status', 'Payment', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-gray-400">No orders found</td></tr>
              ) : orders.map(order => (
                <React.Fragment key={order._id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-mono text-sm font-semibold text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{order.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900">₹{order.totalPrice.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                          className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-2 py-1 hover:bg-blue-50 transition-colors"
                        >
                          {expandedOrder === order._id ? 'Hide' : 'Manage'}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded row */}
                  {expandedOrder === order._id && (
                    <tr>
                      <td colSpan={8} className="px-4 py-4 bg-blue-50 border-b border-blue-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Items list */}
                          <div>
                            <p className="font-semibold text-sm text-gray-900 mb-2">Order Items</p>
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <img
                                    src={item.image || 'https://via.placeholder.com/40x48'}
                                    alt=""
                                    className="w-10 h-12 object-cover bg-gray-200 shrink-0"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/40x48'; }}
                                  />
                                  <div className="min-w-0">
                                    <p className="font-medium text-gray-900 line-clamp-1">{item.title}</p>
                                    <p className="text-xs text-gray-500">Qty: {item.quantity} · ₹{item.price.toLocaleString()}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {/* Shipping address */}
                            <div className="mt-3 text-xs text-gray-600">
                              <p className="font-semibold text-gray-700 mb-1">Ship to:</p>
                              <p>{order.shippingAddress?.name} · {order.shippingAddress?.phone}</p>
                              <p>{order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                            </div>
                          </div>

                          {/* Status update */}
                          <div>
                            <p className="font-semibold text-sm text-gray-900 mb-3">Update Status</p>
                            {order.orderStatus === 'cancelled' ? (
                              <p className="text-sm text-red-600 font-medium">This order has been cancelled</p>
                            ) : (
                              <div className="space-y-2">
                                {/* Tracking number for shipping */}
                                {order.orderStatus !== 'delivered' && (
                                  <input
                                    type="text"
                                    placeholder="Tracking number (optional)"
                                    value={trackingInput}
                                    onChange={(e) => setTrackingInput(e.target.value)}
                                    className="input-field text-sm py-2"
                                  />
                                )}
                                {order.trackingNumber && (
                                  <p className="text-xs text-gray-600">Current tracking: <span className="font-mono font-semibold">{order.trackingNumber}</span></p>
                                )}
                                <div className="flex flex-wrap gap-2">
                                  {ORDER_STATUSES.filter(s => s !== order.orderStatus && s !== 'cancelled').map(status => (
                                    <button
                                      key={status}
                                      onClick={() => handleStatusUpdate(order._id, status)}
                                      disabled={!!updating}
                                      className={`px-3 py-1.5 text-xs font-medium border transition-colors capitalize disabled:opacity-50 ${
                                        status === 'delivered' ? 'border-green-400 text-green-700 hover:bg-green-50' :
                                        status === 'shipped' ? 'border-purple-400 text-purple-700 hover:bg-purple-50' :
                                        status === 'confirmed' ? 'border-blue-400 text-blue-700 hover:bg-blue-50' :
                                        'border-gray-300 text-gray-700 hover:bg-gray-50'
                                      }`}
                                    >
                                      {updating === order._id ? '...' : `Mark ${status}`}
                                    </button>
                                  ))}
                                  {!['delivered', 'cancelled'].includes(order.orderStatus) && (
                                    <button
                                      onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                                      disabled={!!updating}
                                      className="px-3 py-1.5 text-xs font-medium border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                      Cancel Order
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm border border-gray-200 hover:border-gray-900 disabled:opacity-40">←</button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1 text-sm border border-gray-200 hover:border-gray-900 disabled:opacity-40">→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}