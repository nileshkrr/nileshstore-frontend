import axios from 'axios';

// ✅ Base URL (Render backend)
const API = axios.create({
  baseURL: 'https://nileshstore.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle auth errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ================= AUTH =================
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const changePassword = (data) => API.put('/auth/change-password', data);
export const toggleWishlist = (productId) => API.post(`/auth/wishlist/${productId}`);

// ================= PRODUCTS =================
export const getProducts = (params) => API.get('/products', { params });
export const getProduct = (id) => API.get(`/products/${id}`);
export const getFeaturedProducts = () => API.get('/products/featured');
export const createProduct = (data) => API.post('/products', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const addReview = (id, data) => API.post(`/products/${id}/reviews`, data);

// ================= CART =================
export const getCart = () => API.get('/cart');
export const addToCart = (data) => API.post('/cart', data);
export const updateCartItem = (itemId, data) => API.put(`/cart/${itemId}`, data);
export const removeFromCart = (itemId) => API.delete(`/cart/${itemId}`);
export const clearCart = () => API.delete('/cart');

// ================= ORDERS =================
export const createOrder = (data) => API.post('/orders', data);
export const getUserOrders = () => API.get('/orders');
export const getOrder = (id) => API.get(`/orders/${id}`);
export const cancelOrder = (id) => API.put(`/orders/${id}/cancel`);

// ================= ADMIN =================
// Orders
export const getAllOrders = (params) => API.get('/orders/admin/all', { params });
export const updateOrderStatus = (id, data) => API.put(`/orders/${id}/status`, data);
export const getDashboardStats = () => API.get('/orders/admin/stats');

// Users
export const getAllUsers = () => API.get('/admin/users');
export const toggleUserStatus = (id) => API.put(`/admin/users/${id}/toggle`);

// ================= PAYMENT =================
export const createRazorpayOrder = (data) => API.post('/payment/create-order', data);
export const verifyPayment = (data) => API.post('/payment/verify', data);

export const resetPassword = (token, password) =>
  API.put(`/auth/reset-password/${token}`, { password });

export default API;