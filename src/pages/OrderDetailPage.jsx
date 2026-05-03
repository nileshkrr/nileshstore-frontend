import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder, cancelOrder } from '../services/api';
import { FullPageSpinner, OrderStatusBadge, PaymentStatusBadge, StarRating } from '../components/common';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['processing', 'confirmed', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    getOrder(id)
      .then(({ data }) => setOrder(data.order))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await cancelOrder(id);
      setOrder(data.order);
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <FullPageSpinner />;
  if (!order) return (
    <div className="page-container py-20 text-center">
      <p className="text-gray-500">Order not found.</p>
      <Link to="/orders" className="btn-primary inline-block mt-4">My Orders</Link>
    </div>
  );

  const currentStep = order.orderStatus === 'cancelled' ? -1 : STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/orders" className="text-sm text-gray-500 hover:text-gray-900">← My Orders</Link>
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.orderStatus} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {/* Order tracking */}
      {order.orderStatus !== 'cancelled' && (
        <div className="bg-white border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-5">Order Tracking</h2>
          <div className="flex items-center">
            {STATUS_STEPS.map((status, idx) => (
              <React.Fragment key={status}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${idx <= currentStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {idx < currentStep ? '✓' : idx + 1}
                  </div>
                  <p className={`text-xs mt-2 font-medium capitalize text-center ${idx <= currentStep ? 'text-green-600' : 'text-gray-400'}`}>{status}</p>
                </div>
                {idx < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 transition-colors ${idx < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          {order.trackingNumber && (
            <p className="mt-4 text-sm text-gray-600">
              Tracking Number: <span className="font-mono font-semibold text-gray-900">{order.trackingNumber}</span>
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Items Ordered ({order.items.length})</h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-20 h-24 bg-gray-100 overflow-hidden shrink-0">
                    <img
                      src={item.image || 'https://via.placeholder.com/80x96'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/80x96'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 line-clamp-2">{item.title}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                      <Link to={`/products/${item.product}`} className="text-xs text-orange-500 hover:underline">
                        Buy Again
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Delivery Address</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-semibold text-gray-900">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Payment Information</h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Method</span>
                <span className="font-medium text-gray-900 capitalize">{order.paymentMethod === 'razorpay' ? 'Online (Razorpay)' : 'Cash on Delivery'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Status</span>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
              {order.paymentResult?.razorpay_payment_id && (
                <div className="flex justify-between text-gray-600">
                  <span>Transaction ID</span>
                  <span className="font-mono text-xs text-gray-900">{order.paymentResult.razorpay_payment_id}</span>
                </div>
              )}
              {order.paidAt && (
                <div className="flex justify-between text-gray-600">
                  <span>Paid On</span>
                  <span className="text-gray-900">{new Date(order.paidAt).toLocaleDateString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Price Summary */}
          <div className="bg-white border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Price Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Items Total</span>
                <span>₹{order.itemsPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={order.shippingPrice === 0 ? 'text-green-600' : ''}>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST</span>
                <span>₹{order.taxPrice.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-base">
                <span>Grand Total</span>
                <span>₹{order.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white border border-gray-100 p-6 space-y-3">
            <h2 className="font-semibold text-gray-900 mb-2">Actions</h2>
            <Link to="/products" className="btn-secondary w-full text-center block text-sm py-2.5">
              Continue Shopping
            </Link>
            {!['cancelled', 'shipped', 'delivered'].includes(order.orderStatus) && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full border border-red-300 text-red-600 py-2.5 text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                {cancelling ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : null}
                Cancel Order
              </button>
            )}
            {order.orderStatus === 'delivered' && (
              <Link to={`/products/${order.items[0]?.product}`} className="btn-primary w-full text-center block text-sm py-2.5">
                Leave a Review
              </Link>
            )}
          </div>

          {/* Need Help */}
          <div className="bg-orange-50 border border-orange-100 p-4 text-sm">
            <p className="font-semibold text-orange-900 mb-1">Need Help?</p>
            <p className="text-orange-700 text-xs">Contact our support team for any issues with your order.</p>
            <a href="mailto:support@dripstore.com" className="text-orange-600 font-medium text-xs mt-2 block hover:underline">
              support@dripstore.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}