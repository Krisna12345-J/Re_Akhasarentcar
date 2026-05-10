import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  auth,
  db
} from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { User, Mail, Lock, Phone as PhoneIcon, ArrowLeft } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Kata sandi minimal 8 karakter.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.name });

      // Create profile
      const isAdmin = formData.email === 'admin@akhasarentcar.com' || formData.email === 'kdwi0205@gmail.com';
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        isAdmin: isAdmin,
        role: isAdmin ? 'admin' : 'customer',
        createdAt: new Date().toISOString()
      });

      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Alamat email sudah terdaftar.');
      } else {
        setError('Gagal membuat akun. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
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
          <h2 className="text-3xl font-black text-[#0A192F] tracking-tighter mb-2">DAFTAR AKUN</h2>
          <p className="text-sm text-gray-400">Lengkapi data untuk mulai menyewa armada.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold uppercase tracking-wider text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-4 w-4 h-4 text-gray-300" />
            <input 
              type="text" 
              required
              placeholder="Nama Lengkap"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full pl-11 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-50 outline-none text-sm transition-all"
            />
          </div>

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
            <PhoneIcon className="absolute left-4 top-4 w-4 h-4 text-gray-300" />
            <input 
              type="tel" 
              required
              placeholder="Nomor WhatsApp"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full pl-11 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-50 outline-none text-sm transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 w-4 h-4 text-gray-300" />
            <input 
              type="password" 
              required
              placeholder="Kata Sandi (Min. 8 Karakter)"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full pl-11 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-50 outline-none text-sm transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 w-4 h-4 text-gray-300" />
            <input 
              type="password" 
              required
              placeholder="Konfirmasi Kata Sandi"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full pl-11 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-50 outline-none text-sm transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A192F] text-white py-4 rounded-2xl text-[10px] font-bold tracking-widest uppercase hover:bg-[#2563EB] transition-all shadow-xl shadow-navy-scale disabled:opacity-50"
          >
            {loading ? 'MEMPROSES...' : 'DAFTAR SEKARANG'}
          </button>
        </form>

        <p className="text-center mt-8 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Sdah punya akun? <Link to="/login" className="text-[#2563EB] ml-1">Masuk</Link>
        </p>
      </motion.div>
    </div>
  );
}
