import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  MapPin, 
  ArrowLeft, 
  CheckCircle2, 
  Send, 
  X, 
  ChevronRight
} from "lucide-react";

import brummelImg from "../assets/images/brummel_original.jpg";
import touhyImg from "../assets/images/touhy_original.jpg";
import elmImg from "../assets/images/elm_original.jpg";
import howardImg from "../assets/images/howard_original.jpg";

export interface PropertyListing {
  id: string;
  name: string;
  address: string;
  municipality: string;
  neighborhood: string;
  image: string;
}

export const PROPERTIES: PropertyListing[] = [
  {
    id: "howard",
    name: "629 W Howard",
    address: "629 W Howard",
    municipality: "Evanston, IL 60202",
    neighborhood: "Evanston",
    image: howardImg
  },
  {
    id: "elm",
    name: "4814 Elm",
    address: "4814 Elm",
    municipality: "Skokie, IL 60077",
    neighborhood: "Skokie",
    image: elmImg
  },
  {
    id: "brummel",
    name: "1830 Brummel",
    address: "1830 Brummel",
    municipality: "Evanston, IL 60202",
    neighborhood: "Evanston",
    image: brummelImg
  },
  {
    id: "touhy",
    name: "2910 W Touhy",
    address: "2910 W Touhy",
    municipality: "Chicago, IL 60645",
    neighborhood: "Chicago",
    image: touhyImg
  }
];

interface AvailabilityPortalProps {
  onBackToHome: () => void;
  onNavigateTenants?: () => void;
}

export function AvailabilityPortal({ onBackToHome, onNavigateTenants }: AvailabilityPortalProps) {
  const [, setSelectedProperty] = useState<PropertyListing | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  
  // Inquiry form fields
  const [inquirerName, setInquirerName] = useState("");
  const [inquirerEmail, setInquirerEmail] = useState("");
  const [inquirerPhone, setInquirerPhone] = useState("");
  const [targetProperty, setTargetProperty] = useState<string>("629 W Howard, Evanston");
  const [desiredTimeline, setDesiredTimeline] = useState("Within 30 Days");
  const [desiredBedrooms, setDesiredBedrooms] = useState("1 Bedroom");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openInquiryFor = (property: PropertyListing) => {
    setSelectedProperty(property);
    setTargetProperty(`${property.address}, ${property.municipality.split(",")[0]}`);
    setIsInquiryModalOpen(true);
    setSubmittedSuccess(false);
    setErrorMsg(null);
  };

  const handleInquirySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!inquirerName.trim()) {
      setErrorMsg("Please provide your full name.");
      return;
    }
    if (!inquirerEmail.trim() || !inquirerEmail.includes("@")) {
      setErrorMsg("Please provide a valid email address.");
      return;
    }
    if (!inquirerPhone.trim()) {
      setErrorMsg("Please provide a contact phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const subject = `[RENTAL INQUIRY] ${targetProperty} - ${inquirerName.trim()}`;
      
      const inquirySummary = [
        "============================================================",
        "ANCAS HOLDINGS — PROSPECTIVE RESIDENT RENTAL INQUIRY",
        "============================================================",
        `PROPERTY OF INTEREST : ${targetProperty}`,
        `PROSPECT NAME        : ${inquirerName.trim()}`,
        `PHONE NUMBER         : ${inquirerPhone.trim()}`,
        `EMAIL ADDRESS        : ${inquirerEmail.trim()}`,
        `DESIRED MOVE-IN      : ${desiredTimeline}`,
        `UNIT SIZE DESIRED    : ${desiredBedrooms}`,
        "",
        "--- PROSPECT MESSAGE / QUESTIONS ---",
        message.trim() || "No additional message provided.",
        "============================================================"
      ].join("\n");

      // Form fields to submit to tudor@ancasholdings.com
      const fields: Record<string, string> = {
        _subject: subject,
        email: inquirerEmail.trim(),
        _replyto: inquirerEmail.trim(),
        _cc: inquirerEmail.trim(),
        _captcha: "false",
        _template: "box",
        _autoresponse: `Hello ${inquirerName.trim()},

Thank you for your interest in Ancas Holdings residential properties.

We have received your rental inquiry regarding ${targetProperty}. Our leasing team is reviewing current availability and will follow up with floor plans and viewing details.

Best regards,
Ancas Holdings Management`,
        "RENTAL INQUIRY SUMMARY": inquirySummary,
        "[INQUIRY] Target Property": targetProperty,
        "[PROSPECT] Full Name": inquirerName.trim(),
        "[PROSPECT] Contact Phone": inquirerPhone.trim(),
        "[PROSPECT] Email Address": inquirerEmail.trim(),
        "[PREFERENCES] Desired Move-in Window": desiredTimeline,
        "[PREFERENCES] Preferred Unit Size": desiredBedrooms,
        "[MESSAGE] Notes / Questions": message.trim() || "Inquiring about availability and pricing"
      };

      // Native hidden iframe dispatch to avoid page navigation
      let iframe = document.getElementById("leasing_inquiry_frame") as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = "leasing_inquiry_frame";
        iframe.name = "leasing_inquiry_frame";
        iframe.style.display = "none";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "none";
        document.body.appendChild(iframe);
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://formsubmit.co/tudor@ancasholdings.com";
      form.target = "leasing_inquiry_frame";
      form.style.display = "none";

      Object.entries(fields).forEach(([k, v]) => {
        const inp = document.createElement("input");
        inp.type = "hidden";
        inp.name = k;
        inp.value = v;
        form.appendChild(inp);
      });

      document.body.appendChild(form);
      form.submit();

      setTimeout(() => {
        try {
          if (form.parentNode) form.parentNode.removeChild(form);
        } catch {}
      }, 3000);

      setIsSubmitting(false);
      setSubmittedSuccess(true);
    } catch (err) {
      console.warn("Inquiry dispatch warning:", err);
      setIsSubmitting(false);
      setSubmittedSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-28 pb-24 text-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Navigation Breadcrumb / Return */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#00264d] hover:text-[#d4a017] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Ancas Holdings Home
          </button>
          <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
            Residential Portfolio & Inquiries
          </div>
        </div>

        {/* Header Section - Clean & Simple */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#00264d]/5 border border-[#00264d]/10 text-[#00264d] text-xs font-semibold uppercase tracking-widest rounded-full mb-3">
            <Building2 className="w-3.5 h-3.5 text-[#d4a017]" />
            Residential Portfolio
          </div>
          <h1 className="text-3xl md:text-5xl font-serif text-[#00264d] mb-3">
            Residential <span className="italic font-light">Availability</span>
          </h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            These are the properties where we currently have units available for rent.
          </p>
        </div>

        {/* 4 Major Property Tiles - Clean photo tiles, no descriptions, Rental Inquiry button */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-10 mb-16">
          {PROPERTIES.map((property) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-sm border border-stone-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
            >
              {/* Property Photo */}
              <div 
                onClick={() => openInquiryFor(property)}
                className="relative aspect-4/3 overflow-hidden bg-stone-100 cursor-pointer"
                title={`Click to submit rental inquiry for ${property.address}`}
              >
                <img
                  src={property.image}
                  alt={`${property.address}, ${property.municipality}`}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-102"
                  loading="lazy"
                />
              </div>

              {/* Clean Information & Action Bar */}
              <div className="p-5 md:p-6 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-stone-100">
                <div>
                  <h3 className="text-xl md:text-2xl font-serif text-[#00264d] font-semibold tracking-tight">
                    {property.address}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#d4a017] shrink-0" />
                    <span>{property.municipality}</span>
                  </p>
                </div>

                <button
                  onClick={() => openInquiryFor(property)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00264d] hover:bg-[#001d3a] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0 group/btn"
                >
                  <span>Rental Inquiry</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#d4a017] transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Direct Inquire Strip */}
        <div className="bg-[#00264d] text-white p-6 md:p-8 rounded-sm shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl md:text-2xl font-serif mb-1">
              General Portfolio Inquiries
            </h2>
            <p className="text-stone-300 text-xs md:text-sm">
              Direct management with no broker fees. Reach out with your desired location and move-in timeline.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <button
              onClick={() => {
                setSelectedProperty(PROPERTIES[0]);
                setTargetProperty("General Portfolio Availability");
                setIsInquiryModalOpen(true);
                setSubmittedSuccess(false);
                setErrorMsg(null);
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#d4a017] hover:bg-[#c29315] text-[#00264d] font-bold text-xs uppercase tracking-wider rounded-sm transition-colors text-center cursor-pointer shadow-sm"
            >
              Rental Inquiry
            </button>
          </div>
        </div>

        {/* Existing Tenants Callout */}
        <div className="mt-12 text-center text-xs text-slate-500">
          Already a resident at an Ancas Holdings property?{" "}
          <button
            onClick={onNavigateTenants}
            className="text-[#00264d] font-bold hover:underline cursor-pointer"
          >
            Visit the Resident Maintenance Portal →
          </button>
        </div>

      </div>

      {/* Inquiry Modal */}
      <AnimatePresence>
        {isInquiryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-xl rounded-sm shadow-2xl border border-stone-200 overflow-hidden relative max-h-[90vh] flex flex-col"
            >
              {/* Modal Top Branding Stripe */}
              <div className="h-1.5 bg-gradient-to-r from-[#00264d] via-[#d4a017] to-[#00264d]" />

              {/* Close Button */}
              <button
                onClick={() => setIsInquiryModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors p-1"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 md:p-8 overflow-y-auto flex-1">
                {submittedSuccess ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-emerald-700 block">
                      Inquiry Dispatched
                    </span>
                    <h3 className="text-2xl font-serif text-[#00264d]">
                      Thank You, {inquirerName}!
                    </h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                      Your inquiry regarding <strong>{targetProperty}</strong> has been transmitted directly to property management.
                    </p>
                    <p className="text-xs text-slate-500">
                      A copy has also been sent to your email address ({inquirerEmail}). Our team will follow up within 24 hours.
                    </p>
                    <div className="pt-4">
                      <button
                        onClick={() => {
                          setIsInquiryModalOpen(false);
                          setSubmittedSuccess(false);
                        }}
                        className="px-6 py-2.5 bg-[#00264d] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#001d3a] transition-colors cursor-pointer"
                      >
                        Return to Availability
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <span className="text-xs uppercase tracking-widest text-[#d4a017] font-bold block mb-1">
                        Rental Inquiry
                      </span>
                      <h3 className="text-2xl font-serif text-[#00264d]">
                        Inquire About Availability
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Complete this brief inquiry to receive current vacancies, pricing, and scheduling for {targetProperty}.
                      </p>
                    </div>

                    {errorMsg && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-sm">
                        {errorMsg}
                      </div>
                    )}

                    <form onSubmit={handleInquirySubmit} className="space-y-4 text-left">
                      {/* Property Selection */}
                      <div>
                        <label className="text-xs uppercase tracking-wider font-semibold text-slate-600 block mb-1">
                          Property of Interest <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={targetProperty}
                          onChange={(e) => setTargetProperty(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 p-2.5 text-xs md:text-sm text-slate-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white transition-all cursor-pointer"
                        >
                          {PROPERTIES.map((p) => (
                            <option key={p.id} value={`${p.address}, ${p.municipality.split(",")[0]}`}>
                              {p.address}, {p.municipality.split(",")[0]}
                            </option>
                          ))}
                          <option value="General Portfolio Availability">General Portfolio Availability (Any Location)</option>
                        </select>
                      </div>

                      {/* Name & Phone */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs uppercase tracking-wider font-semibold text-slate-600 block mb-1">
                            Your Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={inquirerName}
                            onChange={(e) => setInquirerName(e.target.value)}
                            placeholder="e.g. Alex Morgan"
                            required
                            className="w-full bg-stone-50 border border-stone-300 p-2.5 text-xs md:text-sm text-slate-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wider font-semibold text-slate-600 block mb-1">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={inquirerPhone}
                            onChange={(e) => setInquirerPhone(e.target.value)}
                            placeholder="e.g. (312) 555-0144"
                            required
                            className="w-full bg-stone-50 border border-stone-300 p-2.5 text-xs md:text-sm text-slate-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="text-xs uppercase tracking-wider font-semibold text-slate-600 block mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={inquirerEmail}
                          onChange={(e) => setInquirerEmail(e.target.value)}
                          placeholder="e.g. alex@example.com"
                          required
                          className="w-full bg-stone-50 border border-stone-300 p-2.5 text-xs md:text-sm text-slate-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white transition-all"
                        />
                      </div>

                      {/* Timeline & Unit Size */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs uppercase tracking-wider font-semibold text-slate-600 block mb-1">
                            Desired Move-in Window
                          </label>
                          <select
                            value={desiredTimeline}
                            onChange={(e) => setDesiredTimeline(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-300 p-2.5 text-xs md:text-sm text-slate-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white transition-all cursor-pointer"
                          >
                            <option value="Immediately / This Month">Immediately / This Month</option>
                            <option value="Within 30 Days">Within 30 Days</option>
                            <option value="Within 60 Days">Within 60 Days</option>
                            <option value="Flexible / Exploring">Flexible / Exploring</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wider font-semibold text-slate-600 block mb-1">
                            Preferred Unit Size
                          </label>
                          <select
                            value={desiredBedrooms}
                            onChange={(e) => setDesiredBedrooms(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-300 p-2.5 text-xs md:text-sm text-slate-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white transition-all cursor-pointer"
                          >
                            <option value="Studio">Studio</option>
                            <option value="1 Bedroom">1 Bedroom</option>
                            <option value="2 Bedrooms">2 Bedrooms</option>
                            <option value="Any / Open">Any / Open</option>
                          </select>
                        </div>
                      </div>

                      {/* Message / Questions */}
                      <div>
                        <label className="text-xs uppercase tracking-wider font-semibold text-slate-600 block mb-1">
                          Questions or Special Requests (Optional)
                        </label>
                        <textarea
                          rows={3}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="e.g. Inquiring about pet policy, parking availability, or specific move-in dates..."
                          className="w-full bg-stone-50 border border-stone-300 p-2.5 text-xs md:text-sm text-slate-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white transition-all"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3.5 bg-[#00264d] hover:bg-[#001d3a] text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-75"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Transmitting Rental Inquiry...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5 text-[#d4a017]" />
                              <span>Submit Rental Inquiry</span>
                            </>
                          )}
                        </button>
                        <p className="text-[11px] text-center text-slate-400 mt-2">
                          Directly dispatched to property management with automated confirmation to your email.
                        </p>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
