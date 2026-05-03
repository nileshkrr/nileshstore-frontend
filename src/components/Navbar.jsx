import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold text-gray-900">Drip</span>
            <span className="font-display text-2xl font-bold text-orange-500">Store</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/products" className={({isActive}) => `text-sm font-medium tracking-wide transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
              All Products
            </NavLink>
            <NavLink to="/products?category=men" className="text-sm font-medium tracking-wide text-gray-500 hover:text-gray-900 transition-colors">
              Men
            </NavLink>
            <NavLink to="/products?category=women" className="text-sm font-medium tracking-wide text-gray-500 hover:text-gray-900 transition-colors">
              Women
            </NavLink>
            <NavLink to="/products?category=kids" className="text-sm font-medium tracking-wide text-gray-500 hover:text-gray-900 transition-colors">
              Kids
            </NavLink>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cart.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.totalItems > 9 ? '9+' : cart.totalItems}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block">{user.name.split(' ')[0]}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-lg py-1 z-50">
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-orange-600 font-medium hover:bg-gray-50">
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
            {['All Products:/products', 'Men:/products?category=men', 'Women:/products?category=women', 'Kids:/products?category=kids'].map(item => {
              const [label, path] = item.split(':');
              return (
                <Link key={label} to={path} onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-gray-900 py-1">
                  {label}
                </Link>
              );
            })}
            {!user && (
              <div className="flex gap-3 pt-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-sm py-2 px-4">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {(userMenuOpen || menuOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setUserMenuOpen(false); setMenuOpen(false); }} />
      )}
    </nav>
  );
}