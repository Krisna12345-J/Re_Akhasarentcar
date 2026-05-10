import { useState } from 'react';
import { CAR_DATA } from "../constants";
import { Car } from "../types";
import BookingForm from './BookingForm';
import { useAuth } from '../lib/authContext';
import LoginModal from './LoginModal';

export default function Pricelist() {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const { user } = useAuth();

  const categories = [
    { name: "5 Seater / 2 Baris", filter: "5 Seater" },
    { name: "7 Seater / 3 Baris", filter: "7 Seater" },
  ];

  const handleBooking = (carPartial: Partial<Car>) => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    // Convert partial to complete for the form (mocking ID)
    const car: Car = {
      id: carPartial.name || 'temp',
      name: carPartial.name || 'Unknown',
      category: carPartial.category || '5 Seater',
      price: carPartial.price || 0,
      transmission: carPartial.transmission || 'AT',
      status: 'tersedia',
      isDriverIncluded: carPartial.isDriverIncluded
    };
    setSelectedCar(car);
  };

  return (
    <section id="pricelist" className="py-24 bg-[#F8F9FA]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-[#0A192F] text-3xl md:text-4xl font-bold tracking-tight mb-4">DAFTAR HARGA SEWA LEPAS KUNCI</h2>
          <div className="w-20 h-1 bg-[#2563EB] mx-auto"></div>
        </div>

        {categories.map((cat, idx) => (
          <div key={idx} className="mb-16 last:mb-0">
            <h3 className="text-[#0A192F] text-xl font-bold mb-6 flex items-center">
              <span className="w-8 h-[1px] bg-gray-300 mr-4"></span>
              Kategori: {cat.name}
            </h3>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0A192F] text-white">
                      <th className="px-6 py-4 text-sm font-semibold tracking-wider uppercase">Nama Armada</th>
                      <th className="px-6 py-4 text-sm font-semibold tracking-wider uppercase">Transmisi</th>
                      <th className="px-6 py-4 text-sm font-semibold tracking-wider uppercase">Harga / Hari</th>
                      <th className="px-6 py-4 text-sm font-semibold tracking-wider uppercase text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {CAR_DATA.filter(car => car.category === cat.filter).map((car, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-5">
                          <span className="text-[#0A192F] font-medium">{car.name}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm text-gray-500 font-mono">{car.transmission}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[#2563EB] font-bold">
                            Rp. {car.price?.toLocaleString('id-ID')}
                            {car.isDriverIncluded ? " + Supir" : ""}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button 
                            onClick={() => handleBooking(car)}
                            className="inline-block bg-[#0A192F] hover:bg-[#2563EB] text-white px-4 py-2 rounded-md text-[10px] font-bold tracking-widest transition-all"
                          >
                            PESAN SEKARANG
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
        
        {selectedCar && (
          <BookingForm 
            car={selectedCar} 
            isOpen={!!selectedCar} 
            onClose={() => setSelectedCar(null)} 
          />
        )}
        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

        {/* Syarat & Ketentuan */}
        <div className="mt-20 bg-white p-8 md:p-12 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="text-[#0A192F] text-xl font-bold mb-8">SYARAT & KETENTUAN SEWA</h4>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-[#2563EB]">
                <div className="w-1.5 h-6 bg-[#2563EB] rounded-full"></div>
                <p className="font-bold text-xs tracking-widest uppercase">Weekday</p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Senin - Kamis: Hitungan 24 jam atau 12 jam sesuai jam pengambilan armada.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-[#2563EB]">
                <div className="w-1.5 h-6 bg-[#2563EB] rounded-full"></div>
                <p className="font-bold text-xs tracking-widest uppercase">Weekend</p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Jumat - Minggu: Pengambilan di jam 23:00 dan pengembalian unit di jam 23:59 sebelum pergantian tanggal.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-[#2563EB]">
                <div className="w-1.5 h-6 bg-[#2563EB] rounded-full"></div>
                <p className="font-bold text-xs tracking-widest uppercase">Jaminan</p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                KTP, KK, Sepeda Motor + STNK / Deposit sebagai jaminan keamanan unit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
