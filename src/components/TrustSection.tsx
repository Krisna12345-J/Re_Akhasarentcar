import { Star } from 'lucide-react';
import { motion } from 'motion/react';

export default function TrustSection() {
  const reviews = [
    {
      name: "MAZZQU IQI",
      stars: 5,
      comment: "Pelayanan rental oke banget, harga juga murah😊, pengiriman juga cepett, oke\" dahh, semoga di tambah unit lagii🤣 Ada steamnnya jugaa, mobil motor enak di cuciin, balik\" dah bersih🤪🤪🙏😁 thankss mas ee✌️ ...",
      date: "setahun lalu"
    },
    {
      name: "irfan Nurhakim",
      stars: 5,
      comment: "Puas bngt pelayanan nya ramah mobil nya wangi harga fleksible motor dicuciin sampai bersih tidak dikenakan biaya cas pulangin mobill mantepp pokokknyaa 😍😍 ...",
      date: "setahun lalu"
    },
    {
      name: "Destya Sari13",
      stars: 5,
      comment: "Pelayanannya ramah dan oke banget, harga nya juga worth it, pengiriman juga cepett, oke\" dahh, Ada steamnnya jugaa bikin mobil jadi kinclong, thankss mas",
      date: "setahun lalu"
    },
    {
      name: "Hafiz Sutomo",
      stars: 5,
      comment: "Bintang 10 ga ada ini?, mobil bersih, wangi, motor customer dicuciin.. Tnks ya mas 🙌 ...",
      date: "11 bulan lalu"
    },
    {
      name: "Najwa farhana Kamila",
      stars: 5,
      comment: "Hospitalitynya okei banget, ramah' semuaa, dan harga sangat amat terjangkau, bakal jadi langganan si ini 🚙 ...",
      date: "11 bulan lalu"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Reviews Column */}
          <div>
            <div className="mb-12">
              <p className="text-[#2563EB] text-xs font-bold tracking-[0.3em] uppercase mb-2">Suara Pelanggan</p>
              <h2 className="text-[#0A192F] text-3xl font-bold tracking-tight mb-6">
                REVIEW JUJUR PELANGGAN <br />AKHASA RENT CAR (GMAPS)
              </h2>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-sm font-bold text-[#0A192F]">5.0 / 5.0 Rating</span>
              </div>
            </div>

            <div className="space-y-6">
              {reviews.map((rev, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#F8F9FA] p-6 rounded-xl border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-[#0A192F]">{rev.name}</p>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">{rev.date}</p>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed italic">"{rev.comment}"</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-8">
              <a 
                href="https://maps.app.goo.gl/F7yTbtzapTfmFP4v6" 
                target="_blank" 
                className="text-[#2563EB] text-xs font-bold tracking-widest uppercase hover:underline"
              >
                Lihat Semua Ulasan di Google Maps →
              </a>
            </div>
          </div>

          {/* Maps Column */}
          <div className="h-full">
             <div className="mb-12">
              <p className="text-[#2563EB] text-xs font-bold tracking-[0.3em] uppercase mb-2">Lokasi Kami</p>
              <h2 className="text-[#0A192F] text-3xl font-bold tracking-tight mb-6">BANTAR GEBANG, BEKASI</h2>
              <p className="text-sm text-gray-500 max-w-md">
                Kunjungi kantor pusat kami di Bekasi untuk konsultasi armada atau serah terima unit secara langsung.
              </p>
            </div>
            
            <div className="rounded-2xl overflow-hidden shadow-2xl h-[450px] border-4 border-white">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.719665391295!2d106.97587657503802!3d-6.308596693681144!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e699316b395332d%3A0x713ddfd5abee94c7!2sAKHASARENTCAR%20-%20RENTAL%20MOBIL%20BEKASI!5e0!3m2!1sen!2sid!4v1715316869000!5m2!1sen!2sid" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
