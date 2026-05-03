import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart({ items: [], totalItems: 0, totalPrice: 0 }); return; }
    try {
      setLoading(true);
      const { data } = await getCart();
      setCart(data.cart);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (productId, quantity = 1, size = '', color = '') => {
    try {
      const { data } = await addToCart({ productId, quantity, size, color });
      setCart(data.cart);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      const { data } = await updateCartItem(itemId, { quantity });
      setCart(data.cart);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const { data } = await removeFromCart(itemId);
      setCart(data.cart);
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const emptyCart = async () => {
    try {
      await clearCart();
      setCart({ items: [], totalItems: 0, totalPrice: 0 });
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  };

  const refreshCart = fetchCart;

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, emptyCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};