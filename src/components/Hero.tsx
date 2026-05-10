import { motion } from 'motion/react';

export default function Hero() {
  return (
    <section id="hero" className="relative h-[80vh] flex items-center overflow-hidden bg-black">
      {/* Background with zoom effect */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2070" 
          alt="Luxury Car Background" 
          className="w-full h-full object-cover opacity-60 ml-[-5%]" 
          referrerPolicy="no-referrer"
        />
      </motion.div>

      {/* Overlay Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 text-sm font-semibold tracking-[0.3em] uppercase mb-4"
          >
            Premium Car Rental
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tighter mb-6 uppercase"
          >
            BEBAS EXPLORASI <br />TANPA BATAS.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/90 text-base md:text-lg font-medium leading-relaxed mb-10 max-w-lg"
          >
            Layanan rental mobil Bekasi Bantar Gebang — sewa mobil lepas kunci untuk perjalanan bisnis, wisata, event, dan kebutuhan harian di seluruh wilayah Jabodetabek.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <a 
              href="#pricelist" 
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-3 rounded-md text-xs font-bold tracking-widest transition-all"
            >
              LIHAT ARMADA
            </a>
            <a 
              href="https://wa.me/c/6288211542209" 
              target="_blank"
              className="bg-transparent border border-white/30 hover:border-white text-white px-8 py-3 rounded-md text-xs font-bold tracking-widest transition-all"
            >
              HUBUNGI KAMI
            </a>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
}
