import { useState, useEffect } from 'react';
import { LogIn, Sparkles } from 'lucide-react';

// Components
import { HeroSection } from './components/HeroSection';
import { BrandShowcase } from './components/BrandShowcase';
import { Testimonials } from './components/Testimonials';
import { DropshipCTA } from './components/DropshipCTA';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProductDetail } from './ProductDetail';

// Engines & Logic
import { useBioMatrix, SkinVector } from './useBioMatrix';
import { BioRadar } from './BioRadar';
import { getProductById } from './ProductTelemetry';

const Navbar = ({ scrolled, onLogin, userMode, setView }: any) => (
  <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
    <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('LANDING')}>
        <div className="bg-[#FF6B9D] p-1.5 rounded-lg text-white"><Sparkles size={20} fill="currentColor" /></div>
        <span className="font-bold text-xl text-slate-800">GlowHub<span className="text-[#FF6B9D]">.id</span></span>
      </div>
      <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
        <a href="#home" className="hover:text-[#FF6B9D]">Home</a>
        <a href="#brands" className="hover:text-[#FF6B9D]">Brands</a>
        <a href="#quiz" className="hover:text-[#FF6B9D]">Quiz</a>
        <a href="#dropship" className="hover:text-[#FF6B9D]">Dropship</a>
      </div>
      <button onClick={onLogin} className={`px-4 py-2 rounded-full text-xs font-bold border flex items-center gap-2 ${userMode === 'DROPSHIPPER' ? 'bg-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600'}`}>
        <LogIn size={14} /> {userMode === 'DROPSHIPPER' ? 'Dropshipper Mode' : 'Login'}
      </button>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="bg-slate-900 text-white py-12 text-center text-sm text-slate-500">
    &copy; 2025 GlowHub Indonesia. All rights reserved.
  </footer>
);

// --- MAIN APP ---

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [view, setView] = useState<'LANDING' | 'PRODUCT'>('LANDING');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [userMode, setUserMode] = useState<'GUEST' | 'DROPSHIPPER'>('GUEST');

  const engine = useBioMatrix();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    setView('PRODUCT');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-white text-[#1F2937] font-sans">
      <Navbar
        scrolled={scrolled}
        onLogin={() => setUserMode(prev => prev === 'GUEST' ? 'DROPSHIPPER' : 'GUEST')}
        userMode={userMode}
        setView={setView}
      />

      {view === 'LANDING' ? (
        <main>
          <HeroSection
            userMode={userMode}
            onCtaClick={() => document.getElementById('quiz')?.scrollIntoView({ behavior: 'smooth' })}
          />

          <BrandShowcase />

          {/* ENHANCED BIO-SCANNER (QUIZ LAYER) */}
          <section id="quiz" className="py-24 px-6">
            <div className="max-w-6xl mx-auto bg-[#E0F2F1] rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
              <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                <div>
                  <h2 className="text-4xl font-bold text-slate-900 mb-4">Dermal Calibration</h2>
                  <p className="text-slate-600 mb-8">Identify your skin vectors to unlock high-efficacy matches.</p>
                  <div className="bg-white/60 p-6 rounded-3xl shadow-inner backdrop-blur-sm">
                    <ErrorBoundary>
                      <BioRadar mask={engine.activeMask} />
                    </ErrorBoundary>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(SkinVector).map(([key, flag]) => {
                    const isActive = (engine.activeMask & flag) === flag;
                    return (
                      <button
                        key={key}
                        onClick={() => engine.toggleBioMarker(flag)}
                        className={`px-4 py-3 text-sm font-bold rounded-xl border-2 transition-all ${isActive ? 'bg-[#FF6B9D] border-[#FF6B9D] text-white' : 'bg-white border-white text-slate-500 hover:border-pink-200'}`}
                      >
                        {key}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* RESULTS GRID */}
              {engine.activeMask !== 0 && (
                <div className="mt-12 pt-12 border-t border-slate-200/50">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-xl">Calibrated Protocols</h3>
                    <span className="bg-white px-3 py-1 rounded-full text-xs font-mono border border-slate-200">{engine.recommendations.length} Matches</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {engine.recommendations.map((p: any) => (
                      <div key={p.id} onClick={() => handleProductSelect(p.id)} className="bg-white p-4 rounded-2xl cursor-pointer hover:shadow-xl transition-all group">
                        <div className="aspect-square bg-slate-100 rounded-xl mb-4 overflow-hidden">
                          <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="text-xs font-bold text-slate-400 mb-1">{p.brand}</div>
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[#FF6B9D] font-bold mt-2">Rp {p.price.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <Testimonials />

          <DropshipCTA onRegister={() => alert("Redirect to Registration Logic")} />
        </main>
      ) : (
        <ProductDetail
          product={getProductById(selectedProductId!)}
          isDropshipper={userMode === 'DROPSHIPPER'}
          onBack={() => setView('LANDING')}
          onSelectProduct={handleProductSelect}
        />
      )}
      <Footer />
    </div>
  );
}
