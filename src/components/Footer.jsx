import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-1 mb-4">
              <span className="font-display text-2xl font-bold text-white">Drip</span>
              <span className="font-display text-2xl font-bold text-orange-400">Store</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Premium fashion for every style. Quality clothing for men, women, and kids.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm tracking-wider uppercase">Shop</h4>
            <ul className="space-y-2">
              {[['All Products', '/products'], ["Men's", '/products?category=men'], ["Women's", '/products?category=women'], ["Kids'", '/products?category=kids']].map(([label, href]) => (
                <li key={label}><Link to={href} className="text-sm text-gray-400 hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm tracking-wider uppercase">Support</h4>
            <ul className="space-y-2">
              {['Contact Us', 'Size Guide', 'Returns', 'Shipping Info', 'FAQ'].map(item => (
                <li key={item}><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm tracking-wider uppercase">Account</h4>
            <ul className="space-y-2">
              {[['My Profile', '/profile'], ['My Orders', '/orders'], ['Wishlist', '/wishlist'], ['Cart', '/cart']].map(([label, href]) => (
                <li key={label}><Link to={href} className="text-sm text-gray-400 hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© 2024 DripStore. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Secured by</span>
            <span className="text-xs font-semibold text-gray-400">Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}