import { useState, useEffect } from 'react';
import { Booking, BookingStatus } from '../../types';
import { Check, X, Eye, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function BookingManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Fetch bookings error", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: BookingStatus) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchBookings();
        setSelectedBooking(null);
      }
    } catch (error) {
      console.error("Update status error", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#0A192F]">Manajemen Reservasi</h2>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pelanggan</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Armada</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tanggal</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Harga</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">Memuat data...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">Belum ada reservasi.</td></tr>
              ) : bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-[#0A192F]">{booking.userName}</p>
                      <a href={`tel:${booking.userPhone}`} className="text-[10px] text-gray-400 flex items-center hover:text-[#2563EB]">
                        <Phone className="w-2 h-2 mr-1" /> {booking.userPhone}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-gray-600">{booking.carId?.replace('car_seed_', 'UNIT ')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[10px] font-mono text-gray-400">
                      {new Date(booking.startDate).toLocaleDateString('id-ID')} - <br />
                      {new Date(booking.endDate).toLocaleDateString('id-ID')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-[#0A192F]">
                    Rp {booking.totalPrice.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      booking.status === 'lunas' ? 'bg-green-50 text-green-600' : 
                      booking.status === 'dikonfirmasi' ? 'bg-blue-50 text-[#2563EB]' : 
                      booking.status === 'selesai' ? 'bg-blue-50 text-blue-600' : 
                      booking.status === 'menunggu' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                       <button 
                        onClick={() => setSelectedBooking(booking)}
                        className="p-2 text-gray-400 hover:text-[#2563EB] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {booking.status === 'menunggu' && (
                        <>
                          <button 
                            onClick={() => updateStatus(booking.id, 'dikonfirmasi')}
                            className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => updateStatus(booking.id, 'dibatalkan')}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#0A192F] text-white">
                <h3 className="font-bold">Detail Reservasi #{selectedBooking.id?.slice(0, 8)}</h3>
                <button onClick={() => setSelectedBooking(null)} className="text-white/50 hover:text-white">
                   <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Informasi Unit</p>
                  <p className="font-bold text-[#0A192F] text-lg">{selectedBooking.carName || selectedBooking.carId?.replace('car_seed_', 'UNIT ')}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dari Tanggal</p>
                    <p className="text-sm font-medium">{new Date(selectedBooking.startDate).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hingga Tanggal</p>
                    <p className="text-sm font-medium">{new Date(selectedBooking.endDate).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>

                <div className="p-4 bg-[#F8F9FA] rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Pembayaran</p>
                    <p className="text-lg font-black text-[#2563EB]">Rp {selectedBooking.totalPrice.toLocaleString('id-ID')}</p>
                  </div>
                </div>

                <div className="pt-6 flex justify-between space-x-3">
                  <button 
                    onClick={() => updateStatus(selectedBooking.id, 'dibatalkan')}
                    className="flex-1 border border-gray-100 text-gray-400 py-3 rounded-xl text-xs font-bold tracking-widest hover:border-red-500 hover:text-red-500 transition-all"
                  >
                    TOLAK / BATALKAN
                  </button>
                  <button 
                    onClick={() => updateStatus(selectedBooking.id, 'dikonfirmasi')}
                    className="flex-1 bg-[#2563EB] text-white py-3 rounded-xl text-xs font-bold tracking-widest hover:bg-[#0A192F] transition-all"
                  >
                    KONFIRMASI LUNAS
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
