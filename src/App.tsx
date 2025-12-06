import React, { useState, useEffect } from 'react';
import {
  Sparkles, ShoppingBag, ArrowRight, Star, Heart,
  ShieldCheck, Truck, Percent, Zap, CheckCircle2, Menu, X, Instagram
} from 'lucide-react';
import { useBioMatrix } from './useBioMatrix'; // Assumes previous hook exists

// --- 1. CONFIGURATION VECTORS (High Density Data) ---

const THEME = {
  colors: {
    primary: '#FF6B9D', // CTA Pink
    soft: '#F8BFBF',    // Soft Pink
    mint: '#E0F2F1',
    peach: '#FFF0E6',
    text: '#1F2937'
  },
  fonts: 'font-sans' // Poppins assumed loaded in index.html
};

const ADVANTAGE_VECTORS = [
  {
    id: 'A1',
    icon: <Heart className="text-rose-500" size={32} />,
    title: "100% Brand Lokal",
    desc: "Bangga buatan Indonesia. Produk asli karya anak bangsa berkualitas internasional."
  },
  {
    id: 'A2',
    icon: <ShieldCheck className="text-emerald-500" size={32} />,
    title: "Kurasi Ketat",
    desc: "Lolos BPOM, Halal, dan rating review 4.8+ sebelum masuk katalog kami."
  },
  {
    id: 'A3',
    icon: <Percent className="text-orange-500" size={32} />,
    title: "Harga Lebih Hemat",
    desc: "10–25% lebih murah dari marketplace lain karena jalur dropship langsung."
  },
  {
    id: 'A4',
    icon: <Zap className="text-purple-500" size={32} />,
    title: "Smart Skin Quiz",
    desc: "Algoritma 30 detik untuk rekomendasi paket sesuai dermatologi kulitmu."
  },
  {
    id: 'A5',
    icon: <Truck className="text-blue-500" size={32} />,
    title: "Gratis Ongkir & Bonus",
    desc: "Free ongkir min. 100rb + selalu ada bonus sample di setiap paket."
  },
  {
    id: 'A6',
    icon: <ShoppingBag className="text-pink-600" size={32} />,
    title: "Cicilan 0%",
    desc: "Belanja skincare impian sekarang, bayar nanti via Kredivo & SPayLater."
  }
];

const TESTIMONIAL_DATA = [
  {
    id: "T1", name: "Sabrina", age: 24, rating: 5,
    text: "Dari kusam jadi glowing dalam 2 minggu! Rekomendasi quiz-nya beneran cocok banget.",
    img: "https://i.pravatar.cc/150?img=5"
  },
  {
    id: "T2", name: "Dinda", age: 21, rating: 5,
    text: "Suka banget packaging aman dan bonus sample banyak! Pengiriman juga cepet.",
    img: "https://i.pravatar.cc/150?img=9"
  },
  {
    id: "T3", name: "Rina", age: 29, rating: 5,
    text: "Akhirnya nemu toko yang kurasinya oke. Gak perlu pusing cek BPOM satu-satu.",
    img: "https://i.pravatar.cc/150?img=1"
  }
];

// --- 2. HIGH-YIELD COMPONENTS ---

const Navbar = ({ scrolled }: { scrolled: boolean }) => (
  <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
    }`}>
    <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="bg-[#FF6B9D] p-1.5 rounded-lg text-white">
          <Sparkles size={20} fill="currentColor" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-800">
          GlowHub<span className="text-[#FF6B9D]">.id</span>
        </span>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
        <a href="#home" className="hover:text-[#FF6B9D] transition-colors">Home</a>
        <a href="#brands" className="hover:text-[#FF6B9D] transition-colors">Brand Lokal</a>
        <a href="#quiz" className="hover:text-[#FF6B9D] transition-colors">Skin Quiz</a>
        <a href="#testi" className="hover:text-[#FF6B9D] transition-colors">Testimoni</a>
        <a href="#dropship" className="hover:text-[#FF6B9D] transition-colors">Daftar Dropship</a>
      </div>

      <button className="bg-[#FF6B9D] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-pink-200 hover:bg-pink-600 transition-all hover:scale-105">
        Belanja Sekarang
      </button>
    </div>
  </nav>
);

const HeroSection = () => (
  <section id="home" className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-[#FFF0E6]">
    {/* Background Overlay Logic */}
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-r from-[#F8BFBF]/80 via-white/50 to-transparent z-10" />
      <img
        src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=2070&auto=format&fit=crop"
        alt="Wanita Indonesia Glowing"
        className="w-full h-full object-cover object-top"
      />
    </div>

    <div className="max-w-7xl mx-auto px-6 relative z-20 w-full">
      <div className="md:w-1/2 space-y-6 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur border border-pink-200 text-pink-600 text-xs font-bold tracking-wide">
          <Star size={12} fill="currentColor" />
          #1 PLATFORM SKINCARE LOKAL
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1]">
          Cerah Alami, <br />
          <span className="text-[#FF6B9D]">100% Lokal Terpercaya</span>
        </h1>

        <p className="text-lg text-slate-700 max-w-lg leading-relaxed">
          Kami pilihkan skincare lokal terbaik, kamu tinggal pakai & glow up! Tanpa drama bahan berbahaya, khusus untuk kulit cantikmu.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button className="bg-[#FF6B9D] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-pink-600 transition-all shadow-xl shadow-pink-300/50 hover:-translate-y-1">
            Belanja Sekarang
          </button>
          <button className="px-8 py-4 rounded-full font-bold text-[#FF6B9D] bg-white border-2 border-[#FF6B9D] hover:bg-pink-50 transition-all flex items-center justify-center gap-2">
            <Zap size={18} /> Ikuti Skin Quiz 30 Detik
          </button>
        </div>
      </div>
    </div>
  </section>
);

const BrandTicker = () => (
  <section id="brands" className="py-12 bg-white border-b border-slate-100">
    <div className="max-w-7xl mx-auto px-6 text-center mb-8">
      <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest">Hanya Brand Lokal Terbaik</h3>
    </div>
    <div className="overflow-hidden relative">
      <div className="flex gap-12 items-center justify-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500 flex-wrap px-6">
        {/* Simulated Logos using Text for Demo Purity */}
        {['SCARLETT', 'SOMETHINC', 'AVOSKIN', 'AZARINE', 'WARDAH', 'WHITELAB', 'DEAR ME BEAUTY'].map((brand) => (
          <span key={brand} className="text-xl md:text-2xl font-black text-slate-300 hover:text-[#FF6B9D] cursor-pointer transition-colors">
            {brand}
          </span>
        ))}
      </div>
    </div>
  </section>
);

const AdvantagesGrid = () => (
  <section className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <span className="text-[#FF6B9D] font-bold tracking-wider uppercase text-sm">Kenapa GlowHub?</span>
        <h2 className="text-3xl md:text-4xl font-bold mt-2 text-slate-900">6 Alasan Kamu Wajib Belanja Di Sini</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ADVANTAGE_VECTORS.map((item) => (
          <div key={item.id} className="group p-8 rounded-3xl bg-[#FFF0E6]/30 border border-transparent hover:border-pink-200 hover:bg-white hover:shadow-xl hover:shadow-pink-100/50 transition-all duration-300">
            <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
            <p className="text-slate-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const TestimonialStream = () => (
  <section id="testi" className="py-24 bg-[#E0F2F1]/30">
    <div className="max-w-7xl mx-auto px-6">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-900">
        Ribuan Customer Sudah <span className="text-[#FF6B9D]">Glow Up</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TESTIMONIAL_DATA.map((t) => (
          <div key={t.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative">
            <div className="flex gap-1 mb-4 text-yellow-400">
              {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <p className="text-slate-600 italic mb-6">"{t.text}"</p>
            <div className="flex items-center gap-4">
              <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md" />
              <div>
                <div className="font-bold text-slate-900">{t.name}, {t.age} th</div>
                <div className="text-xs text-slate-400">Verified Buyer</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const QuizCallout = () => (
  <section id="quiz" className="py-20 px-6">
    <div className="max-w-5xl mx-auto bg-[#E0F2F1] rounded-[3rem] p-10 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
      {/* Background Blob */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>

      <div className="relative z-10 md:w-1/2">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Bingung Pilih Skincare?
        </h2>
        <p className="text-slate-600 text-lg mb-8">
          Kulit setiap orang itu unik. Ikuti Quiz 30 detik kami untuk mendapatkan rekomendasi paket yang dikurasi khusus untuk masalah kulitmu.
        </p>
        <button className="bg-[#FF6B9D] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-pink-600 transition-all shadow-xl shadow-pink-500/20">
          Mulai Quiz Sekarang
        </button>
      </div>

      <div className="relative z-10 md:w-1/2 flex justify-center">
        <div className="w-64 h-80 bg-white rounded-3xl shadow-2xl rotate-3 flex items-center justify-center border-4 border-white">
          {/* Placeholder for Illustration */}
          <span className="text-slate-300 font-bold">[Ilustrasi Quiz UI]</span>
        </div>
      </div>
    </div>
  </section>
);

const DropshipGateway = () => (
  <section id="dropship" className="py-24 bg-gradient-to-br from-[#FF6B9D] to-orange-400 text-white relative overflow-hidden">
    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
      <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Mau Penghasilan Tambahan?</h2>
      <p className="text-xl mb-10 text-white/90">
        Jadi Dropshipper GlowHub! Keuntungan 20–40%, tanpa stok barang, dan materi promosi kami sediakan.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
        {[
          { title: "Profit 20-40%", desc: "Margin keuntungan tinggi tiap produk." },
          { title: "Tanpa Stok", desc: "Kami yang packing & kirim ke customer." },
          { title: "Materi Gratis", desc: "Foto & video promosi siap posting." },
        ].map((b, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
            <CheckCircle2 className="mb-4 text-white" />
            <h4 className="font-bold text-lg">{b.title}</h4>
            <p className="text-sm text-white/80">{b.desc}</p>
          </div>
        ))}
      </div>

      <button className="bg-white text-[#FF6B9D] px-10 py-4 rounded-full font-bold text-xl hover:bg-slate-50 transition-all shadow-2xl transform hover:-translate-y-1">
        Daftar Jadi Reseller Sekarang
      </button>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-slate-900 text-white pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-12">
      <div className="col-span-1 md:col-span-1">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={24} className="text-[#FF6B9D]" />
          <span className="font-bold text-2xl">GlowHub</span>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          100% Lokal Terpercaya. Platform skincare kurasi terbaik untuk wanita Indonesia.
        </p>
      </div>

      <div>
        <h4 className="font-bold text-lg mb-4">Info</h4>
        <ul className="space-y-2 text-gray-400 text-sm">
          <li><a href="#" className="hover:text-[#FF6B9D]">Tentang Kami</a></li>
          <li><a href="#" className="hover:text-[#FF6B9D]">Kebijakan Privasi</a></li>
          <li><a href="#" className="hover:text-[#FF6B9D]">Syarat & Ketentuan</a></li>
        </ul>
      </div>

      <div>
        <h4 className="font-bold text-lg mb-4">Bantuan</h4>
        <a href="#" className="flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold mb-4">
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-5 h-5" alt="WA" />
          Chat WhatsApp
        </a>
      </div>

      <div>
        <h4 className="font-bold text-lg mb-4">Sosial Media</h4>
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FF6B9D] transition-colors cursor-pointer">
            <Instagram size={20} />
          </div>
          {/* Add TikTok/etc here */}
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-6 text-center pt-8 border-t border-gray-800 text-sm text-gray-500">
      &copy; 2025 GlowHub Indonesia – 100% Lokal Terpercaya
    </div>
  </footer>
);

// --- 3. MAIN ASSEMBLY ---

export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`min-h-screen bg-white text-[#1F2937] ${THEME.fonts}`}>
      <Navbar scrolled={scrolled} />
      <main>
        <HeroSection />
        <BrandTicker />
        <AdvantagesGrid />
        <TestimonialStream />
        <QuizCallout />
        <DropshipGateway />
      </main>
      <Footer />
    </div>
  );
}
