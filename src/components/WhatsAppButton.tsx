import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function WhatsAppButton() {
  return (
    <motion.a 
      href="https://wa.me/c/6288211542209" 
      target="_blank"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:shadow-[0_0_20px_rgba(37,211,102,0.6)] transition-all"
    >
      <MessageCircle className="w-8 h-8" />
      <span className="absolute -top-2 -left-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">1</span>
    </motion.a>
  );
}
