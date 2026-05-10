import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  signInWithEmailAndPassword,
  signInWithGoogle,
  auth
} from '../../lib/firebase';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowLeft, LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/');
    } catch (err: any) {
      setError('Email atau kata sandi salah.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[2rem] shadow-2xl w-full max-w-md"
      >
        <Link to="/" className="inline-flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-10 hover:text-[#2563EB] transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Beranda
        </Link>
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-[#0A192F] tracking-tighter mb-2">MASUK AKUN</h2>
          <p className="text-sm text-gray-400">Silakan masuk untuk akses penuh layanan kami.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold uppercase tracking-wider text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-4 w-4 h-4 text-gray-300" />
            <input 
              type="email" 
              required
              placeholder="Alamat Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full pl-11 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-50 outline-none text-sm transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 w-4 h-4 text-gray-300" />
            <input 
              type="password" 
              required
              placeholder="Kata Sandi"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full pl-11 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-50 outline-none text-sm transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A192F] text-white py-4 rounded-2xl text-[10px] font-bold tracking-widest uppercase hover:bg-[#2563EB] transition-all shadow-xl shadow-navy-100 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? 'MEMPROSES...' : (
              <>
                <LogIn className="w-4 h-4 mr-2" /> MASUK
              </>
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
            <span className="bg-white px-4 text-gray-300">Atau masuk dengan</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-gray-100 text-gray-600 py-4 rounded-2xl text-[10px] font-bold tracking-widest uppercase hover:bg-gray-50 transition-all flex items-center justify-center"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4 mr-3" alt="Google" />
          Google Account
        </button>

        <p className="text-center mt-8 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Belum punya akun? <Link to="/register" className="text-[#2563EB] ml-1">Daftar</Link>
        </p>
      </motion.div>
    </div>
  );
}
