import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ─── Product Card ───────────────────────────────────────────────────────────
export function ProductCard({ product }) {
  const { addItem } = useCart();
  const { user } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to add to cart'); return; }
    await addItem(product._id, 1);
  };

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/products/${product._id}`} className="group block card overflow-hidden fade-in-up">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/400x533?text=No+Image'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x533?text=No+Image'; }}
        />
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1">
            -{discount}%
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-900 text-sm font-medium px-4 py-2">Out of Stock</span>
          </div>
        )}
        {product.stock > 0 && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-0 left-0 right-0 bg-gray-900 text-white text-sm font-medium py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hover:bg-gray-800"
          >
            Add to Cart
          </button>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{product.category}</p>
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-snug mb-2">{product.title}</h3>
        <div className="flex items-center gap-1 mb-2">
          <StarRating rating={product.rating} size="sm" />
          <span className="text-xs text-gray-400">({product.numReviews})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Star Rating ────────────────────────────────────────────────────────────
export function StarRating({ rating, size = 'md', interactive = false, onRate }) {
  const sizes = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizes[size]} ${star <= Math.round(rating) ? 'star-filled' : 'star-empty'} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          onClick={() => interactive && onRate && onRate(star)}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin`} />
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

// ─── Pagination ──────────────────────────────────────────────────────────────
export function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center border border-gray-200 text-gray-700 hover:border-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ‹
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 flex items-center justify-center border text-sm font-medium transition-colors ${p === page ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-700 hover:border-gray-900'}`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="w-9 h-9 flex items-center justify-center border border-gray-200 text-gray-700 hover:border-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ›
      </button>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, message, action }) {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{message}</p>
      {action}
    </div>
  );
}

// ─── Order Status Badge ───────────────────────────────────────────────────────
export function OrderStatusBadge({ status }) {
  const styles = {
    processing: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`badge ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Payment Status Badge ────────────────────────────────────────────────────
export function PaymentStatusBadge({ status }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`badge ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}