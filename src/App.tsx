import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './lib/authContext';
import { LayoutDashboard, Home } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Pricelist from './components/Pricelist';
import TrustSection from './components/TrustSection';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Dashboard from './components/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

const FloatingAdminSwitch = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#0A192F]/90 backdrop-blur-xl shadow-2xl rounded-full p-1.5 border border-white/10 flex items-center space-x-1"
      >
        <Link 
          to="/"
          className={`px-8 py-3 text-[10px] font-black tracking-[0.2em] rounded-full transition-all flex items-center ${
            !isAdminPage 
            ? 'bg-white text-[#0A192F] shadow-lg shadow-white/5' 
            : 'text-gray-400 hover:text-white'
          }`}
        >
          <Home className="w-3.5 h-3.5 mr-2" /> BERANDA
        </Link>
        <Link 
          to="/admin"
          className={`px-8 py-3 text-[10px] font-black tracking-[0.2em] rounded-full transition-all flex items-center ${
            isAdminPage 
            ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/20' 
            : 'text-gray-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 mr-2" /> ADMIN
        </Link>
      </motion.div>
    </div>
  );
};

export default function App() {
  const { profile, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-black text-[#0A192F] tracking-tighter text-xl text-center p-8">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#0A192F] border-t-[#2563EB] rounded-full animate-spin mb-4"></div>
          AKHASA RENT CAR...
        </div>
      </div>
    );
  }

  const LandingPage = () => (
    <>
      <Navbar />
      <Hero />
      
      {/* Profil Editorial */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 className="rounded-3xl overflow-hidden shadow-2xl relative z-10"
              >
                <img 
                  src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=2070" 
                  alt="Akhasa Team" 
                  className="w-full h-[500px] object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[#2563EB]/10 rounded-full blur-3xl z-0"></div>
            </div>
            <div>
              <p className="text-[#2563EB] text-xs font-bold tracking-[0.3em] uppercase mb-4">Profil Layanan</p>
              <h2 className="text-[#0A192F] text-4xl font-bold tracking-tight mb-8">Solusi Mobilitas Terpercaya di Bantar Gebang.</h2>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p>
                  Akhasa Rent Car melayani sewa mobil <span className="font-bold text-[#0A192F]">Lepas Kunci</span> maupun dengan <span className="font-bold text-[#0A192F]">Driver Profesional</span>. Kami memahami bahwa setiap perjalanan memiliki kebutuhan yang berbeda.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-[#F8F9FA] rounded-xl border border-gray-100">
                    <p className="text-[#0A192F] font-bold text-sm mb-1 uppercase tracking-wider">Durasi Fleksibel</p>
                    <p className="text-xs text-gray-500">Harian, Mingguan, Bulanan.</p>
                  </div>
                  <div className="p-4 bg-[#F8F9FA] rounded-xl border border-gray-100">
                    <p className="text-[#0A192F] font-bold text-sm mb-1 uppercase tracking-wider">Antar Jemput</p>
                    <p className="text-xs text-gray-500">Layanan drop unit ke lokasi Anda.</p>
                  </div>
                </div>
                <p className="pt-4 italic text-sm border-l-4 border-[#2563EB] pl-6">
                  "Basis strategis kami di Bantar Gebang, Bekasi memungkinkan kami menjangkau seluruh area Jabodetabek dengan efisien."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Pricelist />
      <TrustSection />
      <Footer />
      <WhatsAppButton />
    </>
  );

  return (
    <Router>
      <div className="font-sans antialiased bg-white text-[#0A192F]">
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin routes with Zero-Trust protection */}
            <Route path="/admin" element={
              isAdmin ? <Dashboard /> : <Navigate to="/" replace />
            } />
            <Route path="/admin/*" element={
              isAdmin ? <Dashboard /> : <Navigate to="/" replace />
            } />
          </Routes>
        </main>
        <FloatingAdminSwitch />
      </div>
    </Router>
  );
}
