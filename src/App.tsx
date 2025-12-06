import { useState, useEffect } from 'react';
import { LogIn, Sparkles, LayoutDashboard, LogOut, ShieldCheck, Shield, Store } from 'lucide-react';

// Components
import { HeroSection } from './components/HeroSection';
import { BrandShowcase } from './components/BrandShowcase';
import { Testimonials } from './components/Testimonials';
import { DropshipCTA } from './components/DropshipCTA';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProductDetail } from './ProductDetail';
import { DropshipperDashboard } from './dropship/DropshipperDashboard';
import { AdminDashboard } from './admin/AdminDashboard';
import { AccessGate } from './components/AccessGate';
import { StorefrontPage } from './commerce/StorefrontPage';

// Engines & Logic
import { useBioMatrix, SkinVector } from './useBioMatrix';
import { BioRadar } from './BioRadar';
import { getProductById } from './ProductTelemetry';
import { PermissionMask, type SecureSession } from './engines/AccessControlSystem';

// --- NAVBAR ---
const Navbar = ({ scrolled, session, onAuthAction, setView, currentView }: any) => {
  const hasViewDashboard = session && (session.roleMask & PermissionMask.VIEW_DASHBOARD);
  const hasAdminOverride = session && (session.roleMask & PermissionMask.ADMIN_OVERRIDE);

  const navigateTo = (sectionId: string) => {
    if (currentView !== 'LANDING') {
      setView('LANDING');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('LANDING')}>
          <div className="bg-[#FF6B9D] p-1.5 rounded-lg text-white"><Sparkles size={20} fill="currentColor" /></div>
          <span className="font-bold text-xl text-slate-800">GlowHub<span className="text-[#FF6B9D]">.id</span></span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
          <button onClick={() => navigateTo('home')} className="hover:text-[#FF6B9D]">Home</button>
          <button onClick={() => navigateTo('brands')} className="hover:text-[#FF6B9D]">Brands</button>
          <button onClick={() => navigateTo('quiz')} className="hover:text-[#FF6B9D]">Quiz</button>
          <button onClick={() => navigateTo('dropship')} className="hover:text-[#FF6B9D]">Dropship</button>
          <button onClick={() => setView('SHOP')} className="flex items-center gap-1 text-purple-500 font-bold">
            <Store size={14} /> Shop
          </button>
          {hasViewDashboard && (
            <button onClick={() => setView('DASHBOARD')} className="flex items-center gap-1 text-pink-500 font-bold">
              <LayoutDashboard size={14} /> Dashboard
            </button>
          )}
          {hasAdminOverride && (
            <button onClick={() => setView('ADMIN')} className="flex items-center gap-1 text-red-500 font-bold">
              <Shield size={14} /> Admin
            </button>
          )}
        </div>

        {session ? (
          <button
            onClick={onAuthAction}
            className="px-4 py-2 rounded-full text-xs font-bold border border-slate-200 text-slate-600 hover:border-red-500 hover:text-red-500 flex items-center gap-2 transition-all"
          >
            <ShieldCheck size={14} className="text-emerald-500" /> {session.userAlias} <LogOut size={14} />
          </button>
        ) : (
          <button
            onClick={onAuthAction}
            className="px-4 py-2 rounded-full text-xs font-bold border border-slate-200 text-slate-600 hover:border-[#FF6B9D] flex items-center gap-2 transition-all"
          >
            <LogIn size={14} /> Login / Register
          </button>
        )}
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-slate-900 text-white py-12 text-center text-sm text-slate-500">
    &copy; 2025 GlowHub Indonesia. All rights reserved.
  </footer>
);

// --- MAIN APP ---

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [view, setView] = useState<'LANDING' | 'PRODUCT' | 'DASHBOARD' | 'ADMIN' | 'SHOP'>('LANDING');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // New Access Control State
  const [session, setSession] = useState<SecureSession | null>(null);
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [gateMode, setGateMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

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

  const handleAuthAction = () => {
    if (session) {
      // Logout Logic
      setSession(null);
      setView('LANDING');
    } else {
      // Open Gate
      setGateMode('LOGIN');
      setIsGateOpen(true);
    }
  };

  const handleSessionEstablished = (newSession: SecureSession) => {
    setSession(newSession);
    // Auto-redirect if has Dashboard permission
    if (newSession.roleMask & PermissionMask.VIEW_DASHBOARD) {
      setView('DASHBOARD');
    }
  };

  const isDropshipper = session ? (session.roleMask & PermissionMask.VIEW_DASHBOARD) !== 0 : false;

  return (
    <div className="min-h-screen bg-white text-[#1F2937] font-sans">

      {/* High-Yield Access Gate */}
      <AccessGate
        isOpen={isGateOpen}
        onClose={() => setIsGateOpen(false)}
        onAuthenticated={handleSessionEstablished}
        initialMode={gateMode}
      />

      <Navbar
        scrolled={scrolled}
        session={session}
        onAuthAction={handleAuthAction}
        setView={setView}
        currentView={view}
      />

      {view === 'LANDING' ? (
        <main>
          <HeroSection
            userMode={isDropshipper ? 'DROPSHIPPER' : 'GUEST'}
            onCtaClick={() => setView('SHOP')}
          />

          <BrandShowcase />

          {/* ENHANCED BIO-SCANNER */}
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
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
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

          <DropshipCTA onRegister={() => {
            setGateMode('REGISTER');
            setIsGateOpen(true);
          }} />
        </main>
      ) : view === 'PRODUCT' ? (
        <ProductDetail
          product={getProductById(selectedProductId!)}
          isDropshipper={isDropshipper}
          onBack={() => setView('LANDING')}
          onSelectProduct={handleProductSelect}
        />
      ) : view === 'DASHBOARD' ? (
        <DropshipperDashboard onBack={() => setView('LANDING')} />
      ) : view === 'ADMIN' ? (
        <AdminDashboard onBack={() => setView('LANDING')} />
      ) : (
        <StorefrontPage onBack={() => setView('LANDING')} onProductSelect={handleProductSelect} />
      )}
      <Footer />
    </div>
  );
}
