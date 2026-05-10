import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Car, CarCategory, CarStatus } from '../../types';
import { Plus, Edit2, Trash2, Camera, Car as CarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CarManager() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: '5 Seater' as CarCategory,
    price: 0,
    transmission: 'AT' as 'AT' | 'MT',
    status: 'tersedia' as CarStatus,
    isDriverIncluded: false,
    image: ''
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'cars'), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      const carList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car));
      setCars(carList);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'cars');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (car: Car | null = null) => {
    if (car) {
      setEditingCar(car);
      setFormData({
        name: car.name,
        category: car.category,
        price: car.price,
        transmission: car.transmission,
        status: car.status,
        isDriverIncluded: car.isDriverIncluded || false,
        image: car.image || ''
      });
    } else {
      setEditingCar(null);
      setFormData({
        name: '',
        category: '5 Seater',
        price: 0,
        transmission: 'AT',
        status: 'tersedia',
        isDriverIncluded: false,
        image: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCar) {
        await updateDoc(doc(db, 'cars', editingCar.id), formData);
      } else {
        await addDoc(collection(db, 'cars'), formData);
      }
      setIsModalOpen(false);
      fetchCars();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'cars');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus armada ini?')) {
      try {
        await deleteDoc(doc(db, 'cars', id));
        fetchCars();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `cars/${id}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#0A192F]">Manajemen Armada</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#2563EB] text-white px-4 py-2 rounded-md text-xs font-bold tracking-widest flex items-center hover:bg-[#1D4ED8]"
        >
          <Plus className="w-4 h-4 mr-2" />
          TAMBAH ARMADA
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Armada</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kategori</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Harga / Hari</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">Memuat data...</td></tr>
              ) : cars.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">Belum ada armada.</td></tr>
              ) : cars.map((car) => (
                <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                        <CarIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0A192F]">{car.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{car.transmission}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-600">{car.category}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-[#2563EB]">
                    Rp {car.price.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      car.status === 'tersedia' ? 'bg-green-50 text-green-600' : 
                      car.status === 'disewa' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {car.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => handleOpenModal(car)}
                        className="p-2 text-gray-400 hover:text-[#2563EB] transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(car.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-[#0A192F]">
                  {editingCar ? 'Edit Armada' : 'Tambah Armada Baru'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <Trash2 className="w-5 h-5 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nama Mobil</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-100 focus:border-[#2563EB] outline-none text-sm"
                      placeholder="Contoh: Toyota Innova Zenix"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Kategori</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as CarCategory})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-100 focus:border-[#2563EB] outline-none text-sm"
                    >
                      <option value="5 Seater">5 Seater</option>
                      <option value="7 Seater">7 Seater</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Transmisi</label>
                    <select 
                      value={formData.transmission}
                      onChange={(e) => setFormData({...formData, transmission: e.target.value as 'AT' | 'MT'})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-100 focus:border-[#2563EB] outline-none text-sm"
                    >
                      <option value="AT">Automatic (AT)</option>
                      <option value="MT">Manual (MT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Harga / Hari</label>
                    <input 
                      type="number" 
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-100 focus:border-[#2563EB] outline-none text-sm font-bold text-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as CarStatus})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-100 focus:border-[#2563EB] outline-none text-sm"
                    >
                      <option value="tersedia">Tersedia</option>
                      <option value="disewa">Disewa</option>
                      <option value="perbaikan">Perbaikan</option>
                    </select>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <input 
                      type="checkbox" 
                      id="isDriverIncluded"
                      className="mr-2"
                      checked={formData.isDriverIncluded}
                      onChange={(e) => setFormData({...formData, isDriverIncluded: e.target.checked})}
                    />
                    <label htmlFor="isDriverIncluded" className="text-sm text-gray-600">Termasuk Driver</label>
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-50 flex justify-end space-x-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 text-xs font-bold tracking-widest text-gray-400"
                  >
                    BATAL
                  </button>
                  <button 
                    type="submit"
                    className="bg-[#0A192F] text-white px-8 py-2 rounded-md text-xs font-bold tracking-widest hover:bg-[#2563EB] transition-all"
                  >
                    SIMPAN PERUBAHAN
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
