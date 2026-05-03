import React, { useEffect, useState, useCallback } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  title: '', description: '', price: '', originalPrice: '',
  category: 'men', subCategory: 'tops', stock: '',
  images: '', sizes: '', colors: '', tags: '',
  featured: false, isActive: true,
};

const CATEGORIES = ['men', 'women', 'kids'];
const SUB_CATEGORIES = ['shirts', 'tops', 'pants', 'bottoms', 'dresses', 'jackets', 'activewear', 'accessories', 'other'];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sort: 'newest' };
      if (search) params.search = search;
      if (filterCat) params.category = filterCat;
      const { data } = await getProducts(params);
      setProducts(data.products);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterCat]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreate = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      title: product.title,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || '',
      category: product.category,
      subCategory: product.subCategory || 'other',
      stock: product.stock,
      images: product.images?.join(', ') || '',
      sizes: product.sizes?.join(', ') || '',
      colors: product.colors?.join(', ') || '',
      tags: product.tags?.join(', ') || '',
      featured: product.featured || false,
      isActive: product.isActive !== false,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.stock) {
      toast.error('Title, Price and Stock are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : 0,
        stock: Number(form.stock),
        images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
        sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
        colors: form.colors ? form.colors.split(',').map(s => s.trim()).filter(Boolean) : [],
        tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      };

      if (editProduct) {
        await updateProduct(editProduct._id, payload);
        toast.success('Product updated!');
      } else {
        await createProduct(payload);
        toast.success('Product created!');
      }

      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.title}"? This action cannot be undone.`)) return;
    try {
      await deleteProduct(product._id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">{total} total products</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <span>+</span> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 p-4 mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field max-w-xs py-2 text-sm"
        />
        <select
          value={filterCat}
          onChange={(e) => { setFilterCat(e.target.value); setPage(1); }}
          className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center text-gray-400">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-gray-400">No products found</td></tr>
              ) : products.map(product => (
                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 bg-gray-100 overflow-hidden shrink-0">
                        <img
                          src={product.images?.[0] || 'https://via.placeholder.com/48x56'}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/48x56'; }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm line-clamp-2">{product.title}</p>
                        {product.featured && <span className="text-xs text-orange-600 font-medium">★ Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 capitalize">{product.category}</span>
                    <p className="text-xs text-gray-400 capitalize">{product.subCategory}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 text-sm">₹{product.price.toLocaleString()}</p>
                    {product.originalPrice > product.price && (
                      <p className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-600' : product.stock < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(product)} className="text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-200 px-2 py-1 hover:bg-blue-50 transition-colors">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(product)} className="text-xs text-red-600 hover:text-red-800 font-medium border border-red-200 px-2 py-1 hover:bg-red-50 transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm border border-gray-200 hover:border-gray-900 disabled:opacity-40 transition-colors">←</button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1 text-sm border border-gray-200 hover:border-gray-900 disabled:opacity-40 transition-colors">→</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-display text-xl font-bold">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 text-xl">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input name="title" value={form.title} onChange={handleChange} className="input-field" placeholder="Product title" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input-field resize-none" placeholder="Product description" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input type="number" name="price" value={form.price} onChange={handleChange} className="input-field" placeholder="1299" required min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
                  <input type="number" name="originalPrice" value={form.originalPrice} onChange={handleChange} className="input-field" placeholder="1999" min="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select name="category" value={form.category} onChange={handleChange} className="input-field">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
                  <select name="subCategory" value={form.subCategory} onChange={handleChange} className="input-field">
                    {SUB_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                <input type="number" name="stock" value={form.stock} onChange={handleChange} className="input-field" placeholder="50" required min="0" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs (comma-separated)</label>
                <textarea name="images" value={form.images} onChange={handleChange} rows={2} className="input-field resize-none text-xs" placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sizes (comma-separated)</label>
                  <input name="sizes" value={form.sizes} onChange={handleChange} className="input-field" placeholder="S, M, L, XL" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Colors (comma-separated)</label>
                  <input name="colors" value={form.colors} onChange={handleChange} className="input-field" placeholder="Black, White, Navy" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input name="tags" value={form.tags} onChange={handleChange} className="input-field" placeholder="shirt, formal, men" />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="accent-gray-900 w-4 h-4" />
                  <span className="text-gray-700">Featured product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="accent-gray-900 w-4 h-4" />
                  <span className="text-gray-700">Active (visible in store)</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                  {editProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary px-6">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}