import { useState } from 'react';
import { signInWithGoogle, auth } from '../lib/firebase';
import { LogIn, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/authContext';

export default function LoginModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-10 text-center"
          >
            {user ? (
               <>
                <div className="w-20 h-20 rounded-full bg-[#2563EB]/10 flex items-center justify-center mx-auto mb-6">
                  <User className="w-10 h-10 text-[#2563EB]" />
                </div>
                <h3 className="text-xl font-bold text-[#0A192F] mb-2">Halo, {user.displayName}!</h3>
                <p className="text-sm text-gray-400 mb-8">{user.email}</p>
                {profile?.isAdmin && (
                  <div className="mb-4 p-3 bg-blue-50 text-[#2563EB] text-[10px] font-bold uppercase tracking-widest rounded-lg">
                    AKSES ADMINISTRATOR AKTIF
                  </div>
                )}
                <button 
                  onClick={handleLogout}
                  className="w-full bg-red-50 text-red-600 py-3 rounded-xl text-xs font-bold tracking-widest hover:bg-red-100 transition-all"
                >
                  KELUAR AKUN
                </button>
               </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-[#F8F9FA] flex items-center justify-center mx-auto mb-6">
                  <LogIn className="w-10 h-10 text-[#0A192F]" />
                </div>
                <h3 className="text-xl font-bold text-[#0A192F] mb-2">Masuk ke Akhasa</h3>
                <p className="text-sm text-gray-400 mb-10">Gunakan akun Google Anda untuk akses cepat dan aman.</p>
                <button 
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-[#0A192F] text-white py-4 rounded-xl text-xs font-bold tracking-widest hover:bg-[#2563EB] transition-all flex items-center justify-center"
                >
                  {loading ? 'MEMPROSES...' : (
                    <>
                      <img src="https://www.google.com/favicon.ico" className="w-4 h-4 mr-3" alt="Google" />
                      MASUK DENGAN GOOGLE
                    </>
                  )}
                </button>
                <p className="mt-8 text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                  Secure Zero-Trust Authentication
                </p>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
