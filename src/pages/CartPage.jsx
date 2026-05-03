import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { EmptyState } from "../components";
export default function CartPage() {
  const { cart, updateItem, removeItem, loading } = useCart();
  const navigate = useNavigate();

  const shippingPrice = 0;
  const taxPrice = Math.round(cart.totalPrice * 0.18);
  const grandTotal = cart.totalPrice + shippingPrice + taxPrice;

  if (loading) return <div className="page-container py-20 flex justify-center"><div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="page-container py-8">
      <h1 className="section-title text-2xl md:text-3xl mb-8">
        Shopping Cart {cart.totalItems > 0 && <span className="text-gray-400 font-normal text-lg">({cart.totalItems} items)</span>}
      </h1>

      {cart.items.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Your Cart is Empty"
          message="Add some items to get started"
          action={<Link to="/products" className="btn-primary inline-block">Continue Shopping</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item._id} className="flex gap-4 p-4 border border-gray-100 bg-white">
                <Link to={`/products/${item.product._id}`} className="shrink-0 w-24 h-32 overflow-hidden bg-gray-50">
                  <img
                    src={item.product.images?.[0] || 'https://via.placeholder.com/96x128'}
                    alt={item.product.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/96x128'; }}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product._id}`} className="font-medium text-gray-900 hover:text-orange-500 transition-colors text-sm line-clamp-2">
                    {item.product.title}
                  </Link>
                  <div className="flex flex-wrap gap-3 mt-1 mb-3">
                    {item.size && <span className="text-xs text-gray-500">Size: {item.size}</span>}
                    {item.color && <span className="text-xs text-gray-500">Color: {item.color}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-200">
                      <button onClick={() => updateItem(item._id, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-50 text-lg transition-colors">−</button>
                      <span className="px-3 py-1 text-sm font-medium min-w-[2.5rem] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item._id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="px-3 py-1 hover:bg-gray-50 text-lg transition-colors disabled:opacity-40"
                      >+</button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">₹{item.product.price.toLocaleString()} each</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => removeItem(item._id)} className="shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors self-start">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-gray-50 border border-gray-100 p-6 sticky top-24">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.totalItems} items)</span>
                  <span className="font-medium text-gray-900">₹{cart.totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={`font-medium ${shippingPrice === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                  </span>
                </div>
                {shippingPrice > 0 && (
                  <p className="text-xs text-gray-400">Add ₹{(999 - cart.totalPrice).toLocaleString()} more for free shipping</p>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span className="font-medium text-gray-900">₹{taxPrice.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-gray-900">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
              <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-6 py-4 text-center flex items-center justify-center gap-2">
                Proceed to Checkout
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
              <Link to="/products" className="block text-center text-sm text-gray-500 hover:text-gray-900 transition-colors mt-4">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}