import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { motion } from 'motion/react';
import { CreditCard, ShieldCheck, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CheckoutForm = ({ clientSecret, bookingId, totalPrice }: { clientSecret: string, bookingId: string, totalPrice: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement as any,
      },
    });

    if (stripeError) {
      setError(stripeError.message || "Terjadi kesalahan saat memproses pembayaran.");
      setProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      // In a real app, you'd verify this on the server
      await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          paymentIntentId: paymentIntent.id
        })
      });
      
      setSucceeded(true);
      setProcessing(false);
      setTimeout(() => navigate('/'), 3000);
    }
  };

  if (succeeded) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-[#0A192F] tracking-tight uppercase mb-4">Pembayaran Berhasil!</h2>
        <p className="text-gray-400 text-sm font-medium">Reservasi Anda telah dikonfirmasi. Anda akan dialihkan ke beranda...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Informasi Kartu</label>
        <div className="p-4 bg-gray-50 rounded-2xl border border-transparent focus-within:border-blue-500 transition-all">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#0A192F',
                  '::placeholder': { color: '#A0AEC0' },
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center">
          <AlertCircle className="w-4 h-4 mr-3" /> {error}
        </div>
      )}

      <button
        disabled={processing || !stripe}
        className="w-full bg-[#0A192F] text-white py-5 rounded-2xl text-[10px] font-black tracking-[0.2em] hover:bg-[#2563EB] transition-all flex items-center justify-center shadow-2xl shadow-navy-100 disabled:opacity-50"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> MEMPROSES...
          </>
        ) : (
          `BAYAR SEKARANG - RP ${totalPrice.toLocaleString('id-ID')}`
        )}
      </button>

      <div className="flex items-center justify-center space-x-2 text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">
        <ShieldCheck className="w-3 h-3" />
        <span>Pembayaran Aman & Terenkripsi</span>
      </div>
    </form>
  );
};

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [waNumber, setWaNumber] = useState("6288211542209");

  useEffect(() => {
    const initPayment = async () => {
      try {
        setLoading(true);
        
        // Fetch config
        const configRes = await fetch('/api/config');
        if (configRes.ok) {
          const config = await configRes.json();
          if (config.WA_NUMBER) setWaNumber(config.WA_NUMBER);
        }

        // Fetch booking details
        const bRes = await fetch('/api/bookings');
        const bookings = await bRes.json();
        const found = bookings.find((b: any) => b.id === bookingId);
        
        if (!found) {
          setError("Reservasi tidak ditemukan.");
          return;
        }
        setBooking(found);

        const res = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId })
        });
        
        const data = await res.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.error || "Gagal menginisialisasi pembayaran.");
        }
      } catch (err) {
        setError("Koneksi ke server gagal.");
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) initPayment();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-[#2563EB] animate-spin mb-4" />
          <p className="text-[10px] font-black text-[#0A192F] uppercase tracking-widest">Menyiapkan Gerbang Pembayaran...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-[#0A192F] uppercase mb-4">Ups! Ada Masalah</h2>
          <p className="text-gray-400 text-sm mb-8">{error || "Data tidak valid."}</p>
          <button onClick={() => navigate('/')} className="w-full bg-[#0A192F] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">
            KEMBALI KE BERANDA
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-12 hover:text-[#2563EB] transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </button>

        <div className="grid md:grid-cols-5 gap-8 items-start">
          <div className="md:col-span-3">
             <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 rounded-[3rem] shadow-2xl overflow-hidden relative"
            >
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-10 h-10 bg-blue-50 text-[#2563EB] rounded-2xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h1 className="text-2xl font-black text-[#0A192F] tracking-tighter uppercase">Pembayaran</h1>
                </div>

                {clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm 
                      clientSecret={clientSecret} 
                      bookingId={booking.id} 
                      totalPrice={booking.totalPrice} 
                    />
                  </Elements>
                ) : (
                  <div className="text-center py-12 p-8 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <AlertCircle className="w-10 h-10 text-orange-400 mx-auto mb-4" />
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest shadow-none leading-relaxed">
                      Server Pembayaran Belum dikonfigurasi.<br/>
                      Siapkan <span className="text-[#2563EB]">STRIPE_SECRET_KEY</span> di Pengaturan.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.2 }}
               className="bg-[#0A192F] p-8 rounded-[2.5rem] text-white shadow-xl"
            >
              <h3 className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-6">Ringkasan Sewa</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Unit Armada</p>
                  <p className="text-sm font-bold">{booking.carId?.replace('car_seed_', 'UNIT ')}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Durasi Sewa</p>
                  <p className="text-[10px] font-mono">{booking.startDate} - {booking.endDate}</p>
                </div>
                <div className="pt-4 border-t border-white/10 mt-4">
                   <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Total Tagihan</p>
                   <p className="text-2xl font-black tracking-tighter">Rp {booking.totalPrice.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </motion.div>

            <div className="p-6 border border-gray-100 rounded-[2rem] bg-white">
              <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-3">Metode Lain</p>
              <button 
                onClick={() => window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo Admin, saya ingin konfirmasi pembayaran untuk reservasi: ${booking.id}`)}`, '_blank')}
                className="w-full flex items-center justify-between p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-all text-green-600"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-5 h-5" alt="WA" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Konfirmasi WA</span>
                </div>
                <ArrowLeft className="w-3 h-3 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
