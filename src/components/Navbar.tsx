import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/authContext';
import { Menu, X, User, ChevronDown, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, profile, isAdmin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: 'LAYANAN KAMI', href: '#pricelist' },
    { name: 'ARTIKEL', href: '#' },
    { name: 'PRICELIST', href: '#pricelist' },
    { 
      name: 'INFORMASI', 
      href: '#',
      dropdown: [
        { name: 'Galeri Armada', href: '#' },
        { name: 'Tentang Kami', href: '#' },
        { name: 'Kontak Kami', href: '#' }
      ]
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0A192F] rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">A</span>
            </div>
            <span className="text-lg font-black text-[#0A192F] tracking-tighter">
              AKHASA<span className="text-[#2563EB]">RENT</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <div key={item.name} className="relative group">
                <a 
                  href={item.href}
                  className="text-[10px] font-bold text-gray-500 hover:text-[#0A192F] tracking-widest uppercase py-2 flex items-center"
                >
                  {item.name}
                  {item.dropdown && <ChevronDown className="w-3 h-3 ml-1 group-hover:rotate-180 transition-transform" />}
                </a>
                
                {item.dropdown && (
                  <div className="absolute top-full left-0 mt-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                    <div className="bg-white shadow-2xl rounded-2xl border border-gray-100 p-2 min-w-[200px]">
                      {item.dropdown.map((sub) => (
                        <a 
                          key={sub.name}
                          href={sub.href}
                          className="block px-4 py-3 text-[10px] font-bold text-gray-400 hover:text-[#0A192F] hover:bg-[#F8F9FA] rounded-xl transition-all uppercase tracking-widest"
                        >
                          {sub.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 bg-[#F8F9FA] border border-gray-100 py-2 pl-2 pr-4 rounded-full hover:bg-gray-100 transition-all"
                >
                  <div className="w-8 h-8 bg-[#0A192F] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <span className="text-[10px] font-bold text-[#0A192F] uppercase tracking-widest">
                    {profile?.name || 'USER'}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-64 bg-white shadow-2xl rounded-3xl border border-gray-100 overflow-hidden"
                    >
                      <div className="p-6 bg-[#F8F9FA] border-b border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Akun Terdaftar</p>
                        <p className="text-xs font-bold text-[#0A192F] truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                        {isAdmin && (
                          <Link 
                            to="/admin" 
                            className="flex items-center px-4 py-3 text-[10px] font-bold text-gray-500 hover:text-[#2563EB] hover:bg-blue-50 rounded-xl transition-all uppercase tracking-widest"
                          >
                            <LayoutDashboard className="w-4 h-4 mr-3" /> Panel Kendali
                          </Link>
                        )}
                        <button className="w-full flex items-center px-4 py-3 text-[10px] font-bold text-gray-500 hover:text-[#0A192F] hover:bg-gray-50 rounded-xl transition-all uppercase tracking-widest">
                          <Settings className="w-4 h-4 mr-3" /> Pengaturan
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-3 text-[10px] font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all uppercase tracking-widest"
                        >
                          <LogOut className="w-4 h-4 mr-3" /> Keluar Sistem
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-[10px] font-bold text-gray-500 hover:text-[#0A192F] tracking-widest uppercase">
                  Masuk
                </Link>
                <Link 
                  to="/register" 
                  className="bg-[#0A192F] text-white px-6 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase hover:bg-[#2563EB] transition-all shadow-lg shadow-navy-100"
                >
                  Daftar Sekarang
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 text-[#0A192F]"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-8 space-y-4">
              {menuItems.map((item) => (
                <div key={item.name} className="space-y-2">
                  <a 
                    href={item.href}
                    className="block py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </a>
                  {item.dropdown && (
                    <div className="pl-4 space-y-2 border-l border-gray-100">
                      {item.dropdown.map((sub) => (
                        <a 
                          key={sub.name}
                          href={sub.href}
                          className="block py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest"
                          onClick={() => setIsOpen(false)}
                        >
                          {sub.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                {user ? (
                  <>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">HALO, {profile?.name}</p>
                    <button 
                      onClick={handleLogout}
                      className="block w-full py-4 bg-red-50 text-red-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest"
                    >
                      KELUAR
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="block w-full py-4 text-center border border-gray-100 rounded-2xl text-[10px] font-bold text-gray-500 uppercase tracking-widest"
                      onClick={() => setIsOpen(false)}
                    >
                      Masuk
                    </Link>
                    <Link 
                      to="/register" 
                      className="block w-full py-4 text-center bg-[#0A192F] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest"
                      onClick={() => setIsOpen(false)}
                    >
                      Daftar
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
