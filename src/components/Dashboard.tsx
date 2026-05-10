import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  writeBatch, 
  doc, 
  query, 
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CAR_DATA } from '../constants';
import { 
  Database, 
  Download, 
  Car as CarIcon, 
  TrendingUp, 
  Users, 
  CalendarClock,
  ChevronRight,
  Truck,
  LayoutDashboard,
  Settings,
  FileText,
  CreditCard,
  ArrowUpRight,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import CarManager from './admin/CarManager';
import BookingManager from './admin/BookingManager';

type AdminTab = 'dashboard' | 'cars' | 'bookings' | 'users' | 'cms';

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCars: 0,
    monthlyRevenue: 0,
    activeBookings: 0,
    newCustomers: 0
  });

  useEffect(() => {
    // Real-time stats & recent bookings listener
    const unsubCars = onSnapshot(collection(db, 'cars'), (snap) => {
      setStats(prev => ({ ...prev, totalCars: snap.size }));
    });
    
    // Monthly revenue calculation
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snap) => {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllBookings(docs);
      
      const revenue = docs.reduce((acc, curr: any) => acc + (curr.totalPrice || 0), 0);
      const active = docs.filter((d: any) => d.status === 'menunggu').length;
      
      setStats(prev => ({ ...prev, monthlyRevenue: revenue, activeBookings: active }));
      setRecentBookings(docs.slice(0, 5));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setStats(prev => ({ ...prev, newCustomers: snap.size }));
    });

    return () => {
      unsubCars();
      unsubBookings();
      unsubUsers();
    };
  }, []);

  const downloadCSV = () => {
    if (allBookings.length === 0) {
      setMessage('TIDAK ADA DATA UNTUK DIUNDUH');
      return;
    }

    const headers = ['Nama Pelanggan', 'Unit Mobil', 'Tanggal Mulai', 'Tanggal Selesai', 'Total Harga', 'Status'];
    const csvRows = [
      headers.join(','),
      ...allBookings.map(b => [
        `"${b.userName || '-'}"`,
        `"${b.carId?.replace('car_seed_', 'UNIT ') || '-'}"`,
        `"${b.startDate}"`,
        `"${b.endDate}"`,
        `"${b.totalPrice}"`,
        `"${b.status?.toUpperCase() || 'PENDING'}"`
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Akhasa_Rent_Car_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status });
      setMessage(`STATUS RESERVASI BERHASIL DIUPDATE MENJADI ${status.toUpperCase()}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  const seedData = async () => {
    setLoading(true);
    setMessage('');
    try {
      const batch = writeBatch(db);
      CAR_DATA.forEach((car, index) => {
        const carId = `car_seed_${index}`;
        const carRef = doc(db, 'cars', carId);
        batch.set(carRef, { ...car, id: carId, status: 'tersedia' });
      });
      await batch.commit();
      setMessage('DATA ARMADA BERHASIL DISEMAI!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'cars (batch)');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change, subtext }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 hover:shadow-xl hover:shadow-blue-900/5 transition-all group relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-4 rounded-2xl ${color} transition-transform group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <span className="text-[10px] font-black text-green-500 bg-green-50 px-3 py-1.5 rounded-full flex items-center uppercase tracking-widest">
            {change}
            <ArrowUpRight className="w-3 h-3 ml-1" />
          </span>
        )}
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">{title}</p>
        <h3 className="text-3xl font-black text-[#0A192F] tracking-tighter">
          {typeof value === 'number' && title.includes('PENDAPATAN') ? `Rp ${value.toLocaleString()}` : value}
        </h3>
        {subtext && <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">{subtext}</p>}
      </div>
      <Icon className="absolute -bottom-6 -right-6 w-32 h-32 opacity-[0.03] group-hover:scale-110 transition-transform" />
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8 pb-4">
          <Link to="/" className="flex items-center space-x-2 mb-12">
            <div className="w-8 h-8 bg-[#0A192F] rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">A</span>
            </div>
            <span className="text-lg font-black text-[#0A192F] tracking-tighter">
              AKHASA<span className="text-[#2563EB]">RENT</span>
            </span>
          </Link>
          
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-6 pl-4">MENU NAVIGASI</p>
          <nav className="space-y-2">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
              { id: 'cars', name: 'Manajemen Armada', icon: CarIcon },
              { id: 'bookings', name: 'Reservasi', icon: CalendarClock },
              { id: 'users', name: 'Data Pelanggan', icon: Users },
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`w-full flex items-center px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === item.id 
                  ? 'bg-[#0A192F] text-white shadow-xl shadow-navy-scale' 
                  : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`w-4 h-4 mr-4 ${activeTab === item.id ? 'text-[#2563EB]' : ''}`} />
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-gray-50">
          <button 
            onClick={() => setActiveTab('cms')}
            className={`w-full flex items-center px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === 'cms' ? 'bg-[#F8F9FA] text-[#0A192F]' : 'text-gray-400 hover:text-[#0A192F]'
            }`}
          >
            <Settings className="w-4 h-4 mr-4" />
            PENGATURAN
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar */}
          <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 space-y-6 md:space-y-0">
            <div>
              <h1 className="text-4xl font-black text-[#0A192F] tracking-tighter uppercase">PNEL KENDALI</h1>
              <p className="text-sm text-gray-400 mt-1">Status operasional Akhasa Rent Car hari ini.</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={downloadCSV}
                className="bg-white border border-gray-100 text-[#0A192F] px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center shadow-sm"
              >
                <Download className="w-4 h-4 mr-3" /> UNDUH LAPORAN
              </button>
              {activeTab === 'cms' && (
                <button 
                  onClick={seedData}
                  disabled={loading}
                  className="bg-[#2563EB] text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-100"
                >
                  <Database className="w-4 h-4 mr-3" /> {loading ? 'PROSES...' : 'SEMAI DATA'}
                </button>
              )}
            </div>
          </header>

          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-green-50 border border-green-100 text-green-600 rounded-[2rem] text-xs font-bold uppercase tracking-widest text-center"
            >
              {message}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-12"
              >
                {/* Stat Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <StatCard 
                    title="TOTAL ARMADA" 
                    value={stats.totalCars} 
                    icon={CarIcon} 
                    color="bg-blue-50 text-[#2563EB]"
                    change="+2 Unit"
                    subtext="Update terbaru dari gudang"
                  />
                  <StatCard 
                    title="PENDAPATAN" 
                    value={stats.monthlyRevenue} 
                    icon={CreditCard} 
                    color="bg-green-50 text-green-600"
                    change="12.5%"
                    subtext="Akumulasi bulan berjalan"
                  />
                  <StatCard 
                    title="RESERVASI AKTIF" 
                    value={stats.activeBookings} 
                    icon={CalendarClock} 
                    color="bg-orange-50 text-orange-500"
                    subtext="6 Menunggu konfirmasi"
                  />
                  <StatCard 
                    title="PELANGGAN BARU" 
                    value={stats.newCustomers} 
                    icon={Users} 
                    color="bg-purple-50 text-purple-600"
                    change="+4 Hari ini"
                    subtext="Registrasi sistem otomatis"
                  />
                </div>

                {/* Main Bento Area */}
                <div className="grid lg:grid-cols-3 gap-8 items-stretch">
                  {/* Reservation Queue */}
                  <div className="lg:col-span-2 bg-white rounded-[3rem] shadow-sm border border-gray-50 p-10">
                    <div className="flex items-center justify-between mb-10">
                      <h3 className="text-xl font-bold text-[#0A192F] tracking-tight uppercase">ANTREAN RESERVASI</h3>
                      <button onClick={() => setActiveTab('bookings')} className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest flex items-center hover:translate-x-1 transition-transform">
                        SEMUA RESERVASI <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b border-gray-50">
                            <th className="pb-6 text-[10px] font-black text-gray-300 uppercase tracking-widest">Penyewa</th>
                            <th className="pb-6 text-[10px] font-black text-gray-300 uppercase tracking-widest">Unit</th>
                            <th className="pb-6 text-[10px] font-black text-gray-300 uppercase tracking-widest text-center">Status</th>
                            <th className="pb-6 text-[10px] font-black text-gray-300 uppercase tracking-widest text-right">Tindakan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {recentBookings.length > 0 ? recentBookings.map((booking, i) => (
                            <tr key={booking.id} className="group hover:bg-gray-50/50 transition-colors">
                              <td className="py-6">
                                <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 rounded-full bg-[#F8F9FA] flex items-center justify-center font-bold text-[#0A192F]">
                                    {booking.userName?.[0]?.toUpperCase() || 'U'}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-[#0A192F]">{booking.userName}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{booking.userPhone}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-6 text-sm font-bold text-[#0A192F] truncate max-w-[150px]">
                                {booking.carId?.replace('car_seed_', 'UNIT ')}
                              </td>
                              <td className="py-6 text-center">
                                <span className={`text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
                                  booking.status === 'lunas' ? 'bg-green-50 text-green-600' : 
                                  booking.status === 'dikonfirmasi' ? 'bg-blue-50 text-[#2563EB]' :
                                  'bg-orange-50 text-orange-500'
                                }`}>
                                  {booking.status || 'PENDING'}
                                </span>
                              </td>
                              <td className="py-6 text-right">
                                {booking.status !== 'lunas' && (
                                  <button 
                                    onClick={() => handleUpdateBookingStatus(booking.id, 'lunas')}
                                    className="bg-[#0A192F] text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-gray-100 hover:bg-[#2563EB] hover:border-[#2563EB] transition-all"
                                  >
                                    LUNASKAN
                                  </button>
                                )}
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={4} className="py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                                Belum ada antrean reservasi hari ini.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Quick Actions / Status Aside */}
                  <div className="space-y-8">
                    <div className="bg-[#0A192F] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden h-full min-h-[400px]">
                      <div className="relative z-10 h-full flex flex-col">
                        <h3 className="text-xl font-bold tracking-tight uppercase mb-8">STATISTIK UNIT</h3>
                        <div className="space-y-8 flex-1">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                              <span className="opacity-60">Unit Tersedia</span>
                              <span>70%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '70%' }}
                                className="h-full bg-[#2563EB]"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                              <span className="opacity-60">Unit Disewa</span>
                              <span>25%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '25%' }}
                                className="h-full bg-green-400"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                              <span className="opacity-60">Unit Perbaikan</span>
                              <span>5%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '5%' }}
                                className="h-full bg-red-400"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="pt-8 mt-8 border-t border-white/10">
                          <button 
                            onClick={() => setActiveTab('cars')}
                            className="w-full bg-white text-[#0A192F] py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-100 transition-all flex items-center justify-center"
                          >
                            KELOLA ARMADA <ChevronRight className="w-4 h-4 ml-2" />
                          </button>
                        </div>
                      </div>
                      <CarIcon className="absolute -bottom-10 -right-10 w-64 h-64 opacity-5 rotate-[-15deg]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'cars' && <motion.div key="cars" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><CarManager /></motion.div>}
            {activeTab === 'bookings' && <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><BookingManager /></motion.div>}
            
            {activeTab === 'users' && (
              <motion.div 
                key="users"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white p-20 rounded-[3rem] border border-gray-50 shadow-sm text-center"
              >
                <div className="w-24 h-24 bg-purple-50 text-purple-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                  <Users className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-[#0A192F] uppercase tracking-tighter">DATA PELANGGAN</h3>
                <p className="text-gray-400 max-w-sm mx-auto mt-4 text-sm leading-relaxed">
                  Fitur integrasi CRM untuk manajemen profil WhatsApp dan riwayat sewa pelanggan sedang dalam sinkronisasi.
                </p>
                <button className="mt-10 text-[10px] font-bold text-[#2563EB] uppercase tracking-widest border-b border-[#2563EB] pb-1">
                  LAPORAN PENGGUNA TERDAFTAR
                </button>
              </motion.div>
            )}

            {activeTab === 'cms' && (
              <motion.div 
                key="cms" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="grid lg:grid-cols-2 gap-8"
              >
                <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-50">
                  <h3 className="text-xl font-bold text-[#0A192F] tracking-tight uppercase mb-8">DATABASE UTAMA</h3>
                  <div className="space-y-6">
                    <div className="p-8 bg-[#F8F9FA] rounded-[2rem] border border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#0A192F]">Sinkronisasi Armada</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Gunakan untuk reset data mobil dari konstanta.</p>
                      </div>
                      <button 
                        onClick={seedData} 
                        className="bg-[#0A192F] text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                      >
                        JALANKAN
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#2563EB] p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold tracking-tight uppercase mb-8">PROTOKOL KEAMANAN</h3>
                    <p className="text-sm opacity-80 leading-relaxed mb-10">
                      Sistem menggunakan enkripsi Zero-Trust. Pastikan untuk selalu memantau aktivitas login mencurigakan.
                    </p>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-2xl font-black">2FA</p>
                        <p className="text-[8px] font-black uppercase tracking-widest mt-1">AKTIF</p>
                      </div>
                      <div className="w-px h-10 bg-white/20"></div>
                      <div className="text-center">
                        <p className="text-2xl font-black">SSL</p>
                        <p className="text-[8px] font-black uppercase tracking-widest mt-1">SECURE</p>
                      </div>
                    </div>
                  </div>
                  <Settings className="absolute -bottom-10 -right-10 w-64 h-64 opacity-10 animate-spin-slow" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Add styled Link for the brand in sidebar
import { Link } from 'react-router-dom';
