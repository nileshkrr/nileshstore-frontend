import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../services/api';
import { ProductCard, FullPageSpinner, Pagination, EmptyState } from '../components';

const CATEGORIES = ['men', 'women', 'kids'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rating' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const featured = searchParams.get('featured') || '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (category) params.category = category;
      if (search) params.search = search;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (featured) params.featured = featured;

      const { data } = await getProducts(params);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, page, minPrice, maxPrice, featured]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const clearFilters = () => setSearchParams({});

  const hasFilters = category || search || minPrice || maxPrice || featured;

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title text-2xl md:text-3xl">
            {category ? `${category.charAt(0).toUpperCase() + category.slice(1)}'s Clothing` : search ? `"${search}"` : 'All Products'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{total} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden flex items-center gap-2 border border-gray-300 px-3 py-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
            Filter
          </button>
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`${sidebarOpen ? 'fixed inset-0 z-50 flex' : 'hidden'} md:relative md:flex md:inset-auto md:z-auto md:block w-64 shrink-0`}>
          {sidebarOpen && <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />}
          <div className={`${sidebarOpen ? 'w-72 bg-white h-full overflow-y-auto p-6' : 'w-full'}`}>
            {sidebarOpen && <div className="flex items-center justify-between mb-6"><h3 className="font-semibold">Filters</h3><button onClick={() => setSidebarOpen(false)}>✕</button></div>}

            {/* Category */}
            <div className="mb-6">
              <h4 className="font-semibold text-sm text-gray-900 mb-3 uppercase tracking-wider">Category</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="category" checked={!category} onChange={() => updateParam('category', '')} className="accent-gray-900" />
                  <span className="text-sm text-gray-700">All Categories</span>
                </label>
                {CATEGORIES.map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="category" checked={category === cat} onChange={() => updateParam('category', cat)} className="accent-gray-900" />
                    <span className="text-sm text-gray-700 capitalize">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-semibold text-sm text-gray-900 mb-3 uppercase tracking-wider">Price Range</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateParam('minPrice', e.target.value)}
                  className="input-field text-sm py-2"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateParam('maxPrice', e.target.value)}
                  className="input-field text-sm py-2"
                />
              </div>
            </div>

            {/* Featured */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={featured === 'true'} onChange={(e) => updateParam('featured', e.target.checked ? 'true' : '')} className="accent-gray-900" />
                <span className="text-sm text-gray-700">Featured Only</span>
              </label>
            </div>

            {hasFilters && (
              <button onClick={clearFilters} className="text-sm text-red-600 hover:underline">
                Clear All Filters
              </button>
            )}
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {/* Active filters */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {category && <FilterTag label={`Category: ${category}`} onRemove={() => updateParam('category', '')} />}
              {search && <FilterTag label={`Search: "${search}"`} onRemove={() => updateParam('search', '')} />}
              {minPrice && <FilterTag label={`Min: ₹${minPrice}`} onRemove={() => updateParam('minPrice', '')} />}
              {maxPrice && <FilterTag label={`Max: ₹${maxPrice}`} onRemove={() => updateParam('maxPrice', '')} />}
              {featured && <FilterTag label="Featured" onRemove={() => updateParam('featured', '')} />}
            </div>
          )}

          {loading ? (
            <FullPageSpinner />
          ) : products.length === 0 ? (
            <EmptyState
              icon="👗"
              title="No Products Found"
              message="Try adjusting your filters or search terms"
              action={<button onClick={clearFilters} className="btn-primary">Clear Filters</button>}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(product => <ProductCard key={product._id} product={product} />)}
              </div>
              <Pagination page={page} pages={pages} onPageChange={(p) => updateParam('page', p.toString())} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterTag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1">
      {label}
      <button onClick={onRemove} className="hover:text-red-600">✕</button>
    </span>
  );
}