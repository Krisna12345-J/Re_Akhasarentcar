import { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Car, Booking } from '../types';
import { Calendar, Phone, CreditCard, ChevronRight, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function BookingForm({ car, isOpen, onClose }: { car: Car, isOpen: boolean, onClose: () => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [phone, setPhone] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      setTotalPrice(diffDays * car.price);
    }
  }, [startDate, endDate, car.price]);

  const checkAvailability = async (carId: string, start: string, end: string) => {
    const bookingsRef = collection(db, 'bookings');
    // Simplified logic: fine any confirmed booking that overlaps
    // In real scenario, more complex query needed, but for now we look for any
    const q = query(
      bookingsRef, 
      where('carId', '==', carId),
      where('status', 'in', ['dikonfirmasi', 'menunggu'])
    );
    
    const querySnapshot = await getDocs(q);
    const newStart = new Date(start).getTime();
    const newEnd = new Date(end).getTime();

    const isOverlap = querySnapshot.docs.some(doc => {
      const b = doc.data();
      const bStart = new Date(b.startDate).getTime();
      const bEnd = new Date(b.endDate).getTime();
      
      // Check if new range overlaps with existing range
      return (newStart < bEnd && newEnd > bStart);
    });

    return !isOverlap;
  };

  const handleNext = async () => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    if (step === 1) {
      if (!startDate || !endDate || !phone) {
        setError('Harap isi semua data dengan benar.');
        return;
      }

      const today = new Date().setHours(0,0,0,0);
      if (new Date(startDate).getTime() < today) {
        setError('Tanggal mulai tidak boleh di masa lalu.');
        return;
      }

      if (new Date(endDate).getTime() <= new Date(startDate).getTime()) {
        setError('Tanggal selesai harus setelah tanggal mulai.');
        return;
      }
      
      setLoading(true);
      setError('');
      try {
        const available = await checkAvailability(car.id, startDate, endDate);
        if (available) {
          setStep(2);
        } else {
          setError('Maaf, armada sudah dipesan pada tanggal tersebut. Silakan pilih tanggal lain.');
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'bookings (check)');
        setError('Gagal mengecek ketersediaan armada.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    setError('');
    try {
      const bookingData: Partial<Booking> = {
        carId: car.id,
        carName: car.name,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Customer Akhasa',
        userPhone: phone,
        startDate,
        endDate,
        totalPrice,
        status: 'menunggu',
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'bookings'), bookingData);
      
      // WA Integration
      const waText = encodeURIComponent(`PROTOKOL RESERVASI AKHASA RENT CAR\n\nNama: ${auth.currentUser.displayName || 'Customer'}\nWhatsApp: ${phone}\nUnit: ${car.name}\nKategori: ${car.category}\nDurasi: ${startDate} s/d ${endDate}\nTotal Estimasi: Rp ${totalPrice.toLocaleString('id-ID')}\n\nMohon validasi ketersediaan armada dan instruksi pembayaran lanjutan. Terima kasih.`);
      window.open(`https://wa.me/6288211542209?text=${waText}`, '_blank');
      
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'bookings');
      setError('Gagal memproses reservasi. Silakan hubungi admin via WhatsApp.');
    } finally {
      setLoading(false);
    }
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
            className="absolute inset-0 bg-[#0A192F]/40 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden"
          >
            {/* Elegant Header */}
            <div className={`p-10 ${step === 1 ? 'bg-white' : 'bg-[#0A192F]'} transition-colors duration-700`}>
              <div className="flex justify-between items-center mb-8">
                <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.3em] ${step === 1 ? 'bg-blue-50 text-[#2563EB]' : 'bg-white/10 text-blue-200'}`}>
                  TAHAPAN {step} DARI 2
                </div>
                <button onClick={onClose} className={step === 1 ? 'text-gray-300 hover:text-red-500' : 'text-white/30 hover:text-white'}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <h3 className={`text-3xl font-black tracking-tighter uppercase ${step === 1 ? 'text-[#0A192F]' : 'text-white'}`}>
                {step === 1 ? 'FORM RESERVASI' : 'KONFIRMASI AKHIR'}
              </h3>
              <p className={`text-xs mt-2 font-bold uppercase tracking-widest ${step === 1 ? 'text-gray-400' : 'text-white/50'}`}>
                {step === 1 ? car.name : 'VALIDASI RINCIAN SEWA'}
              </p>
            </div>

            <div className="p-10 pt-4">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm"
                >
                  <AlertCircle className="w-4 h-4 mr-3" /> {error}
                </motion.div>
              )}

              {step === 1 ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Mulai Sewa</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-4 w-4 h-4 text-gray-300" />
                        <input 
                          type="date" 
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#F8F9FA] border-none focus:ring-4 focus:ring-blue-50 outline-none text-xs font-bold transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Selesai Sewa</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-4 w-4 h-4 text-gray-300" />
                        <input 
                          type="date" 
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#F8F9FA] border-none focus:ring-4 focus:ring-blue-50 outline-none text-xs font-bold transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">WhatsApp Aktif</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-4 w-4 h-4 text-gray-300" />
                      <input 
                        type="tel" 
                        required
                        placeholder="0812XXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#F8F9FA] border-none focus:ring-4 focus:ring-blue-50 outline-none text-xs font-bold transition-all"
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleNext}
                    disabled={loading}
                    className="w-full bg-[#0A192F] text-white py-5 rounded-2xl text-[10px] font-black tracking-[0.2em] hover:bg-[#2563EB] transition-all flex items-center justify-center shadow-2xl shadow-navy-100 disabled:opacity-50"
                  >
                    {loading ? 'MENGECEK KETERSEDIAAN...' : 'VALIDASI & LANJUTKAN'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="bg-[#F8F9FA] p-8 rounded-[2.5rem] border border-gray-50 flex items-center">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-sm flex items-center justify-center mr-6">
                       <CreditCard className="w-8 h-8 text-[#2563EB]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Estimasi</p>
                      <p className="text-3xl font-black text-[#0A192F] tracking-tighter">Rp {totalPrice.toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">
                      Silakan klik tombol di bawah untuk mengirim data reservasi ke WhatsApp resmi Akhasa Rent Car guna tahap validasi dokumen (KTP/SIM/KK) dan pembayaran.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="px-4 py-3 bg-green-50 rounded-xl text-[8px] font-black text-green-600 uppercase tracking-widest text-center">Respon Cepat 24 Jam</div>
                        <div className="px-4 py-3 bg-blue-50 rounded-xl text-[8px] font-black text-blue-600 uppercase tracking-widest text-center">Bantar Gebang Official</div>
                    </div>
                  </div>

                  <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-[#25D366] text-white py-5 rounded-2xl text-[10px] font-black tracking-[0.2em] hover:bg-[#1DA851] transition-all flex items-center justify-center shadow-2xl shadow-green-100 uppercase"
                  >
                    KIRIM RESERVASI KE WHATSAPP
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
