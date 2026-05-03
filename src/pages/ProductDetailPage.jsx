import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct, addReview } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { StarRating, FullPageSpinner, OrderStatusBadge } from '../components';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProduct(id)
      .then(({ data }) => {
        setProduct(data.product);
        if (data.product.sizes?.length > 0) setSelectedSize(data.product.sizes[0]);
        if (data.product.colors?.length > 0) setSelectedColor(data.product.colors[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login to add to cart'); return; }
    setAddingToCart(true);
    await addItem(product._id, quantity, selectedSize, selectedColor);
    setAddingToCart(false);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Login to review'); return; }
    setSubmittingReview(true);
    try {
      await addReview(id, { rating: reviewRating, comment: reviewText });
      toast.success('Review submitted!');
      setReviewText('');
      const { data } = await getProduct(id);
      setProduct(data.product);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <FullPageSpinner />;
  if (!product) return <div className="page-container py-20 text-center"><h2>Product not found</h2><Link to="/products" className="btn-primary mt-4 inline-block">Back to Products</Link></div>;

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="page-container py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-gray-900">Home</Link> ›{' '}
        <Link to="/products" className="hover:text-gray-900">Products</Link> ›{' '}
        <Link to={`/products?category=${product.category}`} className="hover:text-gray-900 capitalize">{product.category}</Link> ›{' '}
        <span className="text-gray-900">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div>
          <div className="aspect-square overflow-hidden bg-gray-50 mb-3">
            <img
              src={product.images?.[selectedImg] || 'https://via.placeholder.com/600x600'}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/600x600'; }}
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(idx)}
                  className={`shrink-0 w-16 h-16 overflow-hidden border-2 transition-colors ${idx === selectedImg ? 'border-gray-900' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/64x64'; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 capitalize">{product.category} / {product.subCategory}</p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.title}</h1>

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.rating} size="md" />
            <span className="text-sm text-gray-500">({product.numReviews} reviews)</span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-xl text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                <span className="bg-orange-100 text-orange-700 text-sm font-semibold px-2 py-0.5">{discount}% OFF</span>
              </>
            )}
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-900 mb-2">Size: <span className="font-normal text-gray-600">{selectedSize}</span></p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-sm border transition-colors ${selectedSize === size ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-700 hover:border-gray-900'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-900 mb-2">Color: <span className="font-normal text-gray-600">{selectedColor}</span></p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 text-sm border transition-colors ${selectedColor === color ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-700 hover:border-gray-900'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-900 mb-2">Quantity</p>
            <div className="flex items-center border border-gray-300 w-fit">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-2 text-lg hover:bg-gray-50 transition-colors">−</button>
              <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-4 py-2 text-lg hover:bg-gray-50 transition-colors">+</button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{product.stock} in stock</p>
          </div>

          {/* Add to cart */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
              className={`flex-1 btn-primary py-4 flex items-center justify-center gap-2 ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {addingToCart ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </>
              )}
            </button>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 border-t border-gray-100 pt-12">
        <h2 className="font-display text-2xl font-bold mb-8">Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Review list */}
          <div>
            {product.reviews?.length === 0 ? (
              <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-6">
                {product.reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-700">
                        {review.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{review.name}</p>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write review */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
            {user ? (
              <form onSubmit={handleReview} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Your Rating</label>
                  <StarRating rating={reviewRating} size="lg" interactive onRate={setReviewRating} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Your Review</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                    placeholder="Share your experience with this product..."
                    className="input-field resize-none"
                    required
                  />
                </div>
                <button type="submit" disabled={submittingReview} className="btn-primary w-full flex items-center justify-center gap-2">
                  {submittingReview ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="bg-gray-50 p-6 text-center">
                <p className="text-gray-600 mb-4">Login to write a review</p>
                <Link to="/login" className="btn-primary inline-block">Login</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}