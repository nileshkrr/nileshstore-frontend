import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, createRazorpayOrder, verifyPayment } from '../services/api';
import toast from 'react-hot-toast';

const STEPS = ['Address', 'Review', 'Payment'];

export default function CheckoutPage() {
  const { cart, emptyCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [errors, setErrors] = useState({});

  const shippingPrice = cart.totalPrice > 999 ? 0 : 99;
  const taxPrice = Math.round(cart.totalPrice * 0.18);
  const grandTotal = cart.totalPrice + shippingPrice + taxPrice;

  const validateAddress = () => {
    const errs = {};
    if (!address.name.trim()) errs.name = 'Name is required';
    if (!address.phone.trim() || !/^\d{10}$/.test(address.phone)) errs.phone = 'Valid 10-digit phone required';
    if (!address.street.trim()) errs.street = 'Street address is required';
    if (!address.city.trim()) errs.city = 'City is required';
    if (!address.state.trim()) errs.state = 'State is required';
    if (!address.pincode.trim() || !/^\d{6}$/.test(address.pincode)) errs.pincode = 'Valid 6-digit pincode required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleNextStep = () => {
    if (step === 0 && !validateAddress()) return;
    setStep(step + 1);
  };

  const handleRazorpayPayment = async (order) => {
    const { data: rzpData } = await createRazorpayOrder({ orderId: order._id });

    return new Promise((resolve, reject) => {
      const options = {
        key: rzpData.key,
        amount: rzpData.razorpayOrder.amount,
        currency: 'INR',
        name: 'DripStore',
        description: 'Fashion Purchase',
        order_id: rzpData.razorpayOrder.id,
        prefill: {
          name: rzpData.user.name,
          email: rzpData.user.email,
          contact: rzpData.user.phone || address.phone,
        },
        theme: { color: '#111827' },
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled')),
        },
      };

      if (!window.Razorpay) {
        reject(new Error('Razorpay SDK not loaded. Please refresh the page.'));
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        reject(new Error(response.error.description));
      });
      rzp.open();
    });
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const { data } = await createOrder({
        shippingAddress: address,
        paymentMethod,
      });

      const order = data.order;

      if (paymentMethod === 'razorpay') {
        await handleRazorpayPayment(order);
        toast.success('🎉 Payment successful! Order placed.');
      } else {
        toast.success('✅ Order placed successfully!');
      }

      await emptyCart();
      navigate(`/orders/${order._id}`, { replace: true });
    } catch (err) {
      if (err.message === 'Payment cancelled') {
        toast.error('Payment was cancelled');
      } else {
        toast.error(err.response?.data?.message || err.message || 'Order failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="page-container py-20 text-center">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="font-display text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/products" className="btn-primary inline-block">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="page-container py-8">
      <h1 className="section-title text-2xl md:text-3xl mb-8">Checkout</h1>

      {/* Stepper */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 transition-colors ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">

          {/* Step 0: Address */}
          {step === 0 && (
            <div className="bg-white border border-gray-100 p-6">
              <h2 className="font-display text-xl font-bold mb-5">Delivery Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input name="name" value={address.name} onChange={handleAddressChange} className={`input-field ${errors.name ? 'border-red-400' : ''}`} placeholder="John Doe" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input name="phone" value={address.phone} onChange={handleAddressChange} className={`input-field ${errors.phone ? 'border-red-400' : ''}`} placeholder="10-digit mobile" maxLength={10} />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input name="street" value={address.street} onChange={handleAddressChange} className={`input-field ${errors.street ? 'border-red-400' : ''}`} placeholder="House no., Street, Area" />
                  {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input name="city" value={address.city} onChange={handleAddressChange} className={`input-field ${errors.city ? 'border-red-400' : ''}`} placeholder="Mumbai" />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input name="state" value={address.state} onChange={handleAddressChange} className={`input-field ${errors.state ? 'border-red-400' : ''}`} placeholder="Maharashtra" />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                  <input name="pincode" value={address.pincode} onChange={handleAddressChange} className={`input-field ${errors.pincode ? 'border-red-400' : ''}`} placeholder="400001" maxLength={6} />
                  {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Review */}
          {step === 1 && (
            <div className="bg-white border border-gray-100 p-6">
              <h2 className="font-display text-xl font-bold mb-5">Review Your Order</h2>

              {/* Delivery address summary */}
              <div className="bg-gray-50 p-4 mb-5 text-sm">
                <p className="font-semibold text-gray-900 mb-1">Delivering to:</p>
                <p className="text-gray-600">{address.name} · {address.phone}</p>
                <p className="text-gray-600">{address.street}, {address.city}, {address.state} - {address.pincode}</p>
                <button onClick={() => setStep(0)} className="text-orange-500 text-xs mt-2 hover:underline">Change</button>
              </div>

              {/* Items */}
              <div className="space-y-4">
                {cart.items.map(item => (
                  <div key={item._id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                    <img
                      src={item.product.images?.[0] || 'https://via.placeholder.com/64x80'}
                      alt={item.product.title}
                      className="w-16 h-20 object-cover bg-gray-50 shrink-0"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/64x80'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 line-clamp-2">{item.product.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.size && `Size: ${item.size}`}{item.size && item.color && ' · '}{item.color && `Color: ${item.color}`}
                      </p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-900 text-sm shrink-0">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-white border border-gray-100 p-6">
              <h2 className="font-display text-xl font-bold mb-5">Payment Method</h2>

              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-colors ${paymentMethod === 'razorpay' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-gray-900" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Pay Online (Razorpay)</p>
                    <p className="text-xs text-gray-500 mt-0.5">UPI, Cards, Net Banking, Wallets</p>
                  </div>
                  <div className="flex gap-1">
                    {['UPI', 'CARD', 'NET'].map(m => (
                      <span key={m} className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-medium">{m}</span>
                    ))}
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-gray-900" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Cash on Delivery</p>
                    <p className="text-xs text-gray-500 mt-0.5">Pay when your order arrives</p>
                  </div>
                  <span className="text-2xl">💵</span>
                </label>
              </div>

              {paymentMethod === 'razorpay' && (
                <div className="mt-4 bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700 flex items-start gap-2">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Your payment is secured by Razorpay with 256-bit SSL encryption.
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="btn-secondary flex-1 sm:flex-none sm:w-32">
                ← Back
              </button>
            )}
            {step < 2 ? (
              <button onClick={handleNextStep} className="btn-primary flex-1 sm:flex-none sm:w-40">
                Continue →
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="btn-primary flex-1 py-4 flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                ) : (
                  <>🔒 Place Order · ₹{grandTotal.toLocaleString()}</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <div className="bg-gray-50 border border-gray-100 p-5 sticky top-24">
            <h3 className="font-display text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm mb-4">
              {cart.items.map(item => (
                <div key={item._id} className="flex justify-between">
                  <span className="text-gray-600 line-clamp-1 max-w-[160px]">{item.product.title} × {item.quantity}</span>
                  <span className="font-medium text-gray-900 shrink-0">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{cart.totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shippingPrice === 0 ? 'text-green-600' : ''}>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (18%)</span>
                <span>₹{taxPrice.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}