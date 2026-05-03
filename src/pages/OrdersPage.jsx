import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserOrders } from '../services/api';
import { FullPageSpinner, EmptyState, OrderStatusBadge, PaymentStatusBadge } from '../components/common';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <FullPageSpinner />;

  return (
    <div className="page-container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title text-2xl md:text-3xl">My Orders</h1>
        <Link to="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          Continue Shopping →
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No Orders Yet"
          message="You haven't placed any orders. Start shopping!"
          action={<Link to="/products" className="btn-primary inline-block">Shop Now</Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border border-gray-100 hover:shadow-md transition-shadow">
              {/* Order header */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <div>
                    <span className="uppercase tracking-wide">Order ID</span>
                    <p className="font-mono font-semibold text-gray-900 mt-0.5">#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <span className="uppercase tracking-wide">Placed On</span>
                    <p className="font-semibold text-gray-900 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <span className="uppercase tracking-wide">Total</span>
                    <p className="font-semibold text-gray-900 mt-0.5">₹{order.totalPrice.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={order.orderStatus} />
                  <PaymentStatusBadge status={order.paymentStatus} />
                  <Link
                    to={`/orders/${order._id}`}
                    className="text-sm font-medium text-gray-900 border border-gray-300 px-3 py-1.5 hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>

              {/* Order items */}
              <div className="p-4">
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {order.items.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="shrink-0 flex gap-3 items-center">
                      <div className="w-16 h-20 bg-gray-100 overflow-hidden shrink-0">
                        <img
                          src={item.image || 'https://via.placeholder.com/64x80'}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/64x80'; }}
                        />
                      </div>
                      <div className="max-w-[140px]">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">₹{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="shrink-0 w-16 h-20 bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-500">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                {/* Shipping address */}
                {order.shippingAddress && (
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">Shipping to: </span>
                    {order.shippingAddress.name}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}