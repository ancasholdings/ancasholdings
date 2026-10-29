import { motion } from "motion/react";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight,
  Menu,
  X,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { useState, useEffect, FormEvent } from "react";
import { TenantsPortal } from "./components/TenantsPortal";
import { AvailabilityPortal } from "./components/AvailabilityPortal";

// --- Components ---

const Logo = ({ className = "", onClick }: { className?: string; onClick?: () => void }) => {
  const brandBlue = "#00264d";
  const brandGold = "#d4a017";
  
  return (
    <div 
      onClick={onClick} 
      className={`flex items-center gap-4 group cursor-pointer ${className}`}
    >
      <div className="relative h-12 md:h-16 flex items-center justify-center transition-all duration-500 transform group-hover:scale-105">
        <svg viewBox="0 0 140 100" className="h-full w-auto drop-shadow-sm">
          {/* Buildings Group */}
          <g className="transition-all duration-500">
            {/* Left Building */}
            <path 
              d="M35,45 L35,80 L50,80 L50,40 Z" 
              fill={brandBlue} 
              className="transition-all duration-500"
            />
            <rect x="40" y="55" width="4" height="6" fill="white" opacity="0.6" />
            
            {/* Middle Building - Side (Perspective) */}
            <path 
              d="M70,25 L70,80 L85,80 L85,35 Z" 
              fill={brandBlue} 
              className="transition-all duration-500"
              opacity="0.9"
            />
            
            {/* Middle Building - Front (Gold) */}
            <path 
              d="M50,35 L50,80 L70,80 L70,25 Z" 
              fill={brandGold} 
              className="transition-all duration-500"
            />
            <rect x="57" y="45" width="6" height="8" fill="white" opacity="0.6" />
            
            {/* Right Building */}
            <path 
              d="M85,45 L85,80 L100,80 L100,40 Z" 
              fill={brandBlue} 
              className="transition-all duration-500"
            />
            <rect x="91" y="55" width="4" height="6" fill="white" opacity="0.6" />
          </g>

          {/* Wavy Line */}
          <path 
            d="M20,85 Q70,75 120,85" 
            fill="none" 
            stroke={brandBlue} 
            strokeWidth="4" 
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
      </div>
      
      <div className="flex flex-col transition-all duration-500">
        <span className={`text-xl md:text-2xl font-sans font-black tracking-tight leading-none transition-all duration-500 text-[#00264d]`}>
          ANCAS
        </span>
        <span className={`text-lg md:text-xl font-sans font-black tracking-tight leading-none transition-all duration-500 text-[#00264d]`}>
          HOLDINGS
        </span>
        <span className={`text-[7px] md:text-[8px] font-sans font-bold tracking-[0.2em] uppercase mt-1 transition-all duration-500 text-[#00264d]/60`}>
          Investments & Asset Management
        </span>
      </div>
    </div>
  );
};

interface NavbarProps {
  activeView: "home" | "availability" | "tenants";
  onNavigateHome: (hashTarget?: string) => void;
  onNavigateAvailability: () => void;
  onNavigateTenants: () => void;
}

const Navbar = ({ activeView, onNavigateHome, onNavigateAvailability, onNavigateTenants }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState(() => (typeof window !== "undefined" ? window.location.hash : "#home"));
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleHash = () => {
      setCurrentHash(window.location.hash || "#home");
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const navItems = [
    {
      id: "home",
      label: "Home",
      isActive: activeView === "home" && (currentHash === "" || currentHash === "#home"),
      onClick: () => {
        setCurrentHash("#home");
        onNavigateHome("#home");
      }
    },
    {
      id: "about",
      label: "About",
      isActive: activeView === "home" && currentHash === "#about",
      onClick: () => {
        setCurrentHash("#about");
        onNavigateHome("#about");
      }
    },
    {
      id: "availability",
      label: "Availability",
      isActive: activeView === "availability",
      onClick: () => {
        setCurrentHash("#availability");
        onNavigateAvailability();
      }
    },
    {
      id: "tenants",
      label: "Tenants",
      isActive: activeView === "tenants",
      onClick: () => {
        setCurrentHash("#tenants");
        onNavigateTenants();
      }
    },
    {
      id: "contact",
      label: "Contact / Submit Lead",
      isActive: activeView === "home" && currentHash === "#contact",
      onClick: () => {
        setCurrentHash("#contact");
        onNavigateHome("#contact");
      }
    }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-md py-3" : "bg-stone-50/90 backdrop-blur-sm py-4 md:py-5"}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Logo onClick={() => onNavigateHome("#home")} />

        {/* Desktop Nav - Executive Segmented Button Dock with Animated Gliding Highlight */}
        <div 
          onMouseLeave={() => setHoveredId(null)}
          className="hidden md:flex items-center bg-stone-100/90 border border-stone-200/90 p-1 rounded-sm shadow-2xs backdrop-blur-sm"
        >
          {navItems.map((item) => {
            const isHovered = hoveredId === item.id;
            const isActive = item.isActive;

            return (
              <button
                key={item.id}
                onMouseEnter={() => setHoveredId(item.id)}
                onClick={item.onClick}
                className={`relative px-3.5 lg:px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-xs transition-colors duration-200 cursor-pointer select-none active:scale-95 flex items-center justify-center ${
                  isActive 
                    ? "text-white" 
                    : isHovered 
                      ? "text-[#00264d]" 
                      : "text-slate-600"
                }`}
              >
                {/* Active background tile */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavBackground"
                    className="absolute inset-0 bg-[#00264d] rounded-xs shadow-xs"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Smooth gliding hover background tile (when not active) */}
                {!isActive && isHovered && (
                  <motion.div
                    layoutId="hoverNavBackground"
                    className="absolute inset-0 bg-white rounded-xs shadow-xs border border-stone-200/60"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}

                {/* Button label */}
                <span className="relative z-10 flex items-center gap-1.5">
                  {item.label}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4a017]" />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden cursor-pointer p-2 rounded-sm text-[#00264d] hover:bg-stone-200/50 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? (
            <X className="text-primary w-6 h-6" />
          ) : (
            <Menu className="text-primary w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 w-full bg-white shadow-xl py-5 px-6 flex flex-col gap-2 md:hidden border-t border-stone-100"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setIsMobileMenuOpen(false);
                item.onClick();
              }}
              className={`w-full text-left px-4 py-3 text-xs font-semibold tracking-wider uppercase rounded-sm transition-all duration-200 cursor-pointer border flex items-center justify-between active:scale-[0.98] ${
                item.isActive
                  ? "bg-[#00264d] text-white border-[#00264d] border-l-4 border-l-[#d4a017] shadow-xs"
                  : "bg-stone-50 hover:bg-white text-slate-700 hover:text-[#00264d] border-stone-200"
              }`}
            >
              <span>{item.label}</span>
              {item.isActive && (
                <span className="w-2 h-2 rounded-full bg-[#d4a017]" />
              )}
            </button>
          ))}
        </motion.div>
      )}
    </nav>
  );
};

const Hero = ({ 
  onNavigateTenants, 
  onNavigateAvailability 
}: { 
  onNavigateTenants?: () => void;
  onNavigateAvailability?: () => void;
}) => {
  return (
    <section id="home" className="relative min-h-screen flex items-center bg-stone-50 scroll-mt-32 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-32 md:pt-40 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-accent font-medium tracking-[0.3em] uppercase text-sm mb-4 block">
            Strategic Real Estate Investment
          </span>
          <h1 className="text-5xl md:text-7xl text-primary leading-tight mb-8">
            Building Value Through <span className="italic font-light">Visionary</span> Management
          </h1>
          <p className="text-primary/80 text-lg md:text-xl mb-6 font-light leading-relaxed">
            Ancas Holdings is a premier real estate investment and asset management group dedicated to acquiring and optimizing mid-market multi-family properties across Chicago's North and Northwest neighborhoods and suburban communities.
          </p>
          <p className="text-primary/70 text-base md:text-lg mb-10 font-light leading-relaxed">
            We specialize in identifying high-potential assets where strategic management and thoughtful capital improvements can drive long-term value for our investors. Beyond the bottom line, our mission is rooted in the belief that quality housing is a cornerstone of a thriving neighborhood; by revitalizing these properties, we aim to elevate living standards for our residents and contribute to the overall strength and vibrancy of the communities we serve.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {onNavigateAvailability && (
              <button 
                onClick={onNavigateAvailability} 
                className="bg-primary text-white px-8 py-4 text-sm font-medium uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center cursor-pointer shadow-sm"
              >
                View Availability
              </button>
            )}
            <a 
              href="#about" 
              className="border border-primary text-primary px-8 py-4 text-sm font-medium uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center"
            >
              Our Strategy
            </a>
          </div>
          {onNavigateTenants && (
            <div>
              <button
                onClick={onNavigateTenants}
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#00264d] hover:text-[#d4a017] transition-colors cursor-pointer group"
              >
                <span>Current Resident? Submit a Maintenance Request</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="hidden lg:block relative h-[600px]"
        >
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200" 
              alt="Premier Multi-family Development"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-stone-50/20 to-transparent" />
          </div>
          {/* Decorative elements to "embed" it better */}
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="py-24 bg-stone-50 scroll-mt-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-accent font-medium tracking-[0.2em] uppercase text-xs mb-4 block">
              The Founder
            </span>
            <h2 className="text-4xl md:text-5xl text-primary mb-8">
              Tudor <span className="italic">Ancas</span>
            </h2>
            <div className="space-y-6 text-slate-600 leading-relaxed">
              <p className="text-lg font-medium text-slate-800">
                Tudor founded Ancas Holdings with a clear mission to innovate within the real estate sector and redefine the standards of urban living.
              </p>
              <p>
                As CEO, he leverages a deep understanding of market dynamics and a commitment to operational excellence to lead the firm’s strategic investments in the North and Northwest Chicago areas.
              </p>
              <p>
                Tudor is dedicated to spearheading investment strategies that prioritize high-quality housing and superior property management, ensuring every asset reflects a culture of service excellence. By cultivating strong stakeholder relationships, he focuses on driving sustainable growth that creates a lasting, positive impact on the communities where Ancas Holdings operates.
              </p>
              <div className="pt-8">
                <a 
                  href="https://www.linkedin.com/in/ancast/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:text-accent transition-colors group"
                >
                  Connect on LinkedIn <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative group"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-sm shadow-2xl">
              <img 
                src="https://lh3.googleusercontent.com/d/1obGM3aXMGIiEWBPxgsKdjeGx9chO_qzu" 
                alt="Tudor Ancas"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 bg-white p-8 shadow-xl hidden md:block max-w-xs border-l-4 border-accent">
              <h3 className="text-xl mb-1 font-serif">Visionary Leadership</h3>
              <p className="text-sm text-slate-500 italic">"Innovating the real estate space through dedication and excellence."</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [propertyType, setPropertyType] = useState("Multi-Family");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitLead = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !propertyAddress.trim()) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          email,
          propertyAddress,
          propertyType,
          details
        })
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <section id="contact" className="py-24 bg-stone-100/50 text-primary scroll-mt-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <span className="text-accent font-medium tracking-[0.2em] uppercase text-xs mb-4 block">
              Property Acquisition
            </span>
            <h2 className="text-4xl md:text-5xl mb-8">We are always looking to <span className="italic">buy</span> property</h2>
            <p className="text-primary/60 mb-12 leading-relaxed max-w-md">
              Our main focus are the north and northwest Chicago and adjacent suburbs markets. If you have a lead, submit it here and we'll follow up within <span className="font-bold underline">2 hours. YES! We mean it...</span>
            </p>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-primary/5 flex items-center justify-center rounded-full shrink-0">
                  <Phone className="text-accent w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg mb-1">Phone</h4>
                  <p className="text-primary/50 text-sm">+1 (773) 516-3148</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 bg-primary/5 flex items-center justify-center rounded-full shrink-0">
                  <Mail className="text-accent w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg mb-1">Email</h4>
                  <p className="text-primary/50 text-sm">tudor@ancasholdings.com</p>
                </div>
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-stone-50 p-10 rounded-sm shadow-sm border border-stone-200/50"
          >
            {submitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif text-[#00264d]">Lead Received & Dispatched</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Thank you! Your lead details for <span className="font-semibold">{propertyAddress}</span> have been delivered to our acquisitions team. We will review the asset and follow up within 2 hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFullName("");
                    setEmail("");
                    setPropertyAddress("");
                    setDetails("");
                  }}
                  className="mt-4 px-6 py-2.5 bg-[#00264d] text-white text-xs uppercase tracking-widest font-semibold hover:bg-slate-800 transition-colors"
                >
                  Submit Another Lead
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmitLead}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-stone-400 font-medium">Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white border border-stone-200 p-3 text-primary focus:outline-none focus:border-accent transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-stone-400 font-medium">Email Address *</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-stone-200 p-3 text-primary focus:outline-none focus:border-accent transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-stone-400 font-medium">Property Address *</label>
                  <input 
                    type="text" 
                    required
                    value={propertyAddress}
                    onChange={(e) => setPropertyAddress(e.target.value)}
                    className="w-full bg-white border border-stone-200 p-3 text-primary focus:outline-none focus:border-accent transition-colors"
                    placeholder="123 N Chicago Ave, Chicago, IL"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-stone-400 font-medium">Property Type</label>
                  <select 
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full bg-white border border-stone-200 p-3 text-primary focus:outline-none focus:border-accent transition-colors appearance-none"
                  >
                    <option>Multi-Family</option>
                    <option>Single Family</option>
                    <option>Commercial</option>
                    <option>Mixed-Use</option>
                    <option>Land</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-stone-400 font-medium">Lead Details</label>
                  <textarea 
                    rows={4}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full bg-white border border-stone-200 p-3 text-primary focus:outline-none focus:border-accent transition-colors"
                    placeholder="Tell us about the property (condition, occupancy, etc.)"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-4 text-sm font-medium uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Transmitting Lead to Acquisitions Desk...</span>
                    </>
                  ) : (
                    <span>Submit Lead</span>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

interface FooterProps {
  onNavigateHome: (hashTarget?: string) => void;
  onNavigateAvailability: () => void;
  onNavigateTenants: () => void;
}

const Footer = ({ onNavigateHome, onNavigateAvailability, onNavigateTenants }: FooterProps) => {
  return (
    <footer className="bg-stone-50 text-primary py-16 border-t border-stone-200/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2">
            <Logo onClick={() => onNavigateHome("#home")} className="mb-8" />
            <p className="text-primary/40 text-sm max-w-sm leading-relaxed">
              A premier real estate investment and asset management group dedicated to acquiring and optimizing mid-market multi-family properties across Chicago.
            </p>
          </div>
          <div>
            <h4 className="text-sm uppercase tracking-widest mb-6 font-medium">Navigation</h4>
            <ul className="space-y-4 text-primary/60 text-sm">
              <li>
                <button 
                  onClick={() => onNavigateHome("#home")} 
                  className="hover:text-accent transition-colors cursor-pointer text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateHome("#about")} 
                  className="hover:text-accent transition-colors cursor-pointer text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={onNavigateAvailability} 
                  className="hover:text-accent font-semibold text-[#00264d] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span>Availability</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold uppercase rounded">Properties</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={onNavigateTenants} 
                  className="hover:text-accent font-semibold text-[#00264d] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span>Tenants Portal</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-[#d4a017]/20 text-[#00264d] font-bold uppercase rounded">Maintenance</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateHome("#contact")} 
                  className="hover:text-accent transition-colors cursor-pointer text-left"
                >
                  Contact / Property Leads
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm uppercase tracking-widest mb-6 font-medium">Legal</h4>
            <ul className="space-y-4 text-primary/40 text-sm">
              <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Fair Housing Notice</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-4 text-primary/40 text-xs uppercase tracking-widest">
          <p>© 2026 Ancas Holdings. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="https://www.linkedin.com/in/ancast/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  const [activeView, setActiveView] = useState<"home" | "availability" | "tenants">(() => {
    if (typeof window !== "undefined") {
      if (window.location.hash === "#tenants") return "tenants";
      if (window.location.hash === "#availability") return "availability";
    }
    return "home";
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#tenants") {
        setActiveView("tenants");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (window.location.hash === "#availability") {
        setActiveView("availability");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setActiveView("home");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigateToHome = (hashTarget = "#home") => {
    setActiveView("home");
    window.location.hash = hashTarget;
    if (hashTarget === "#home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setTimeout(() => {
        const el = document.querySelector(hashTarget);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  };

  const navigateToAvailability = () => {
    setActiveView("availability");
    window.location.hash = "#availability";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToTenants = () => {
    setActiveView("tenants");
    window.location.hash = "#tenants";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar 
        activeView={activeView}
        onNavigateHome={navigateToHome}
        onNavigateAvailability={navigateToAvailability}
        onNavigateTenants={navigateToTenants}
      />
      <main>
        {activeView === "tenants" ? (
          <TenantsPortal onBackToHome={() => navigateToHome("#home")} />
        ) : activeView === "availability" ? (
          <AvailabilityPortal 
            onBackToHome={() => navigateToHome("#home")} 
            onNavigateTenants={navigateToTenants}
          />
        ) : (
          <>
            <Hero 
              onNavigateTenants={navigateToTenants} 
              onNavigateAvailability={navigateToAvailability}
            />
            <About />
            <Contact />
          </>
        )}
      </main>
      <Footer 
        onNavigateHome={navigateToHome}
        onNavigateAvailability={navigateToAvailability}
        onNavigateTenants={navigateToTenants}
      />
    </div>
  );
}
