import { Phone, MapPin, Instagram, Globe, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0A192F] text-white py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-bold tracking-tighter mb-6">AKHASARENTCAR</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Sewa mobil lepas kunci dan dengan driver profesional di Bekasi dan sekitarnya. Terpercaya sejak tahun 2020.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/akhasarentcar_bekasi/" target="_blank" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#2563EB] transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://wa.me/c/6288211542209" target="_blank" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#2563EB] transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="https://maps.app.goo.gl/F7yTbtzapTfmFP4v6" target="_blank" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#2563EB] transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase mb-8 text-white/50">Layanan Kami</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Sewa Lepas Kunci</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sewa Dengan Driver</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sewa Mingguan / Bulanan</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Antar-Jemput Armada</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase mb-8 text-white/50">Kontak Kami</h4>
            <ul className="space-y-6 text-sm text-gray-400">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-[#2563EB] shrink-0" />
                <span>Komplek Bantar Gebang, Bekasi, Jawa Barat.</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-[#2563EB] shrink-0" />
                <span>+62 882-1154-2209</span>
              </li>
              <li>
                <a href="https://www.tiktok.com/@akhasarentcar_bekasi" target="_blank" className="hover:text-white transition-colors flex items-center">
                   <span className="mr-3 font-bold text-lg">d</span>
                   TikTok: Akhasa Rent Car Bekasi
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase mb-8 text-white/50">Dapatkan Penawaran</h4>
            <p className="text-sm text-gray-400 mb-6">Jangan lewatkan promo menarik setiap weekend dan hari besar.</p>
            <a 
              href="https://wa.me/c/6288211542209" 
              className="inline-block bg-[#2563EB] text-white px-6 py-3 rounded-md text-xs font-bold tracking-widest w-full text-center hover:bg-white hover:text-[#0A192F] transition-all"
            >
              CHAT SEKARANG
            </a>
          </div>

        </div>

        <div className="border-t border-white/5 mt-20 pt-8 flex flex-col md:row justify-between items-center text-[10px] uppercase tracking-widest text-gray-500 font-bold">
          <p>© 2026 AKHASA RENT CAR. ALL RIGHTS RESERVED.</p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
