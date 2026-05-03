import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFeaturedProducts } from '../services/api';
import { ProductCard, FullPageSpinner } from '../components';

const CATEGORIES = [
  { name: "Men's", slug: 'men', image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600', desc: 'Shirts, Pants, Jackets & More' },
  { name: "Women's", slug: 'women', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600', desc: 'Dresses, Tops, Leggings & More' },
  { name: "Kids'", slug: 'kids', image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=600', desc: 'Tees, Overalls, Raincoats & More' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getFeaturedProducts()
      .then(({ data }) => setFeatured(data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/products?search=${encodeURIComponent(searchQ.trim())}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600"
            alt="Hero"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative page-container py-24 md:py-36">
          <div className="max-w-2xl">
            <p className="text-orange-400 text-sm font-semibold tracking-widest uppercase mb-4">New Season 2024</p>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
              Style That<br />
              <span className="text-orange-400">Speaks</span> For You
            </h1>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Discover premium fashion for men, women, and kids. Quality you can feel, prices you'll love.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-md">
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search for clothing..."
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 text-sm backdrop-blur-sm"
              />
              <button type="submit" className="bg-orange-500 hover:bg-orange-600 px-6 py-3 font-medium transition-colors text-sm">
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn-primary bg-orange-500 hover:bg-orange-600">
                Shop Now
              </Link>
              <Link to="/products?featured=true" className="btn-secondary border-white text-white hover:bg-white hover:text-gray-900">
                Featured Items
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="page-container py-16">
        <div className="text-center mb-10">
          <h2 className="section-title mb-3">Shop by Category</h2>
          <p className="text-gray-500">Find the perfect style for every member of your family</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} to={`/products?category=${cat.slug}`} className="group relative overflow-hidden aspect-[4/5] block">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h3 className="font-display text-3xl font-bold text-white mb-1">{cat.name}</h3>
                <p className="text-gray-300 text-sm">{cat.desc}</p>
                <span className="inline-block mt-3 text-sm font-medium text-orange-400 group-hover:text-orange-300 transition-colors">
                  Shop Now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-gray-50 border-y border-gray-100 py-8">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🚚', title: 'Free Shipping', desc: 'On orders above ₹999' },
              { icon: '↩️', title: 'Easy Returns', desc: '30-day return policy' },
              { icon: '🔒', title: 'Secure Payment', desc: 'SSL encrypted checkout' },
              { icon: '⭐', title: 'Quality Assured', desc: '100% authentic products' },
            ].map(f => (
              <div key={f.title} className="py-4">
                <div className="text-3xl mb-2">{f.icon}</div>
                <h4 className="font-semibold text-gray-900 text-sm">{f.title}</h4>
                <p className="text-gray-500 text-xs mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="page-container py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="section-title mb-2">Featured Products</h2>
            <p className="text-gray-500">Hand-picked bestsellers just for you</p>
          </div>
          <Link to="/products" className="text-sm font-medium text-gray-900 hover:text-orange-500 transition-colors hidden md:block">
            View All →
          </Link>
        </div>

        {loading ? (
          <FullPageSpinner />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/products" className="btn-secondary">
            Explore All Products
          </Link>
        </div>
      </section>

      {/* Banner */}
      <section className="bg-orange-500 text-white py-16">
        <div className="page-container text-center">
          <h2 className="font-display text-4xl font-bold mb-4">Get 20% Off Your First Order</h2>
          <p className="text-orange-100 mb-8 text-lg">Sign up now and use code DRIP20 at checkout</p>
          <Link to="/register" className="inline-block bg-white text-orange-500 font-bold px-8 py-3 hover:bg-orange-50 transition-colors">
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
}