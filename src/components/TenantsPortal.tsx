import { useState, useRef, ChangeEvent, DragEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wrench,
  AlertTriangle,
  Upload,
  X,
  CheckCircle2,
  Phone,
  Mail,
  Printer,
  ArrowLeft,
  Clock,
  ShieldAlert,
  FileCheck,
  Camera,
  ChevronDown,
  Info,
  Calendar,
  Lock,
  MapPin
} from "lucide-react";

interface PhotoItem {
  id: string;
  name: string;
  size: string;
  dataUrl: string;
}

interface SubmittedTicket {
  ticketId: string;
  submittedAt: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  propertyAddress: string;
  unitNumber: string;
  maintenanceType: string;
  urgencyLevel: string;
  locationInUnit: string;
  description: string;
  permissionToEnter: string;
  preferredTime: string;
  photos: PhotoItem[];
}

interface TenantsPortalProps {
  onBackToHome: () => void;
}

const MAINTENANCE_CATEGORIES = [
  "Select issue category...",
  "Plumbing (Leak, Drip, Drain Clog, Toilet, Fixture, Water Pressure)",
  "Heating & Radiators (No Heat, Banging Pipes, Valve Leak, Thermostat)",
  "Air Conditioning & Cooling (No Cool Air, Fan Issue, Thermostat)",
  "Electrical & Lighting (Outlet Dead, Light Fixture, Breaker Tripped)",
  "Kitchen & Laundry Appliances (Refrigerator, Stove/Oven, Dishwasher)",
  "Doors, Windows & Locks (Stuck Window, Entry Lock, Intercom, Screen)",
  "Structural & Flooring (Ceiling Stain, Tile, Drywall, Porch)",
  "Common Areas & Security (Hallway Light, Exterior Gate, Laundry Room)",
  "Pest Control / Exterminator Inspection",
  "Other General Maintenance Request"
];

export const TenantsPortal = ({ onBackToHome }: TenantsPortalProps) => {
  const [tenantName, setTenantName] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");

  const [unitNumber, setUnitNumber] = useState("");
  const [maintenanceType, setMaintenanceType] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState<"routine" | "standard" | "urgent">("standard");
  const [locationInUnit, setLocationInUnit] = useState("");
  const [description, setDescription] = useState("");
  const [permissionToEnter, setPermissionToEnter] = useState<"yes" | "call_first">("yes");
  const [preferredTime, setPreferredTime] = useState("anytime");

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<SubmittedTicket | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFiles = (files: FileList | File[]) => {
    setErrorMsg(null);
    const validFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
    
    if (validFiles.length === 0) {
      setErrorMsg("Please upload valid image files (JPG, PNG, WEBP, HEIC).");
      return;
    }

    if (photos.length + validFiles.length > 5) {
      setErrorMsg("You can attach a maximum of 5 photos per maintenance request.");
      return;
    }

    validFiles.forEach(file => {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg(`Photo "${file.name}" is over 8MB. Please select a smaller image.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPhotos(prev => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            size: formatFileSize(file.size),
            dataUrl
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    const effectiveAddress = propertyAddress.trim();

    if (!tenantName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!tenantEmail.trim() || !tenantEmail.includes("@")) {
      setErrorMsg("Please provide a valid email address for your request receipt.");
      return;
    }
    if (!tenantPhone.trim()) {
      setErrorMsg("Please provide a contact phone number for maintenance coordination.");
      return;
    }
    if (!effectiveAddress) {
      setErrorMsg("Please enter your property address.");
      return;
    }
    if (!unitNumber.trim()) {
      setErrorMsg("Please specify your apartment or unit number (e.g., Unit 2B, Apt 3).");
      return;
    }
    if (!maintenanceType || maintenanceType === "Select issue category...") {
      setErrorMsg("Please choose the type of maintenance issue from the dropdown.");
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setErrorMsg("Please provide a brief description of the issue (at least 10 characters).");
      return;
    }

    setIsSubmitting(true);

    // Generate ticket and simulate instant backend dispatch to tudor@ancasholdings.com
    setTimeout(() => {
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const ticket: SubmittedTicket = {
        ticketId: `ANC-${new Date().getFullYear()}-${randomCode}`,
        submittedAt: new Date().toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short"
        }),
        tenantName: tenantName.trim(),
        tenantEmail: tenantEmail.trim(),
        tenantPhone: tenantPhone.trim(),
        propertyAddress: effectiveAddress,
        unitNumber: unitNumber.trim(),
        maintenanceType,
        urgencyLevel,
        locationInUnit: locationInUnit.trim() || "Unit interior",
        description: description.trim(),
        permissionToEnter: permissionToEnter === "yes" ? "Yes - Permission granted to enter" : "No - Call tenant first",
        preferredTime: preferredTime === "anytime" ? "Anytime during normal hours" : preferredTime === "morning" ? "Morning (8 AM - 12 PM)" : "Afternoon (12 PM - 5 PM)",
        photos
      };

      setSubmittedTicket(ticket);
      setIsSubmitting(false);

      // Scroll smoothly to top of page to view the confirmation receipt
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 700);
  };

  const handlePrint = () => {
    window.print();
  };

  const openEmailClientFallback = () => {
    if (!submittedTicket) return;
    const subject = encodeURIComponent(`[Maintenance Ticket ${submittedTicket.ticketId}] Unit ${submittedTicket.unitNumber} - ${submittedTicket.propertyAddress}`);
    const body = encodeURIComponent(
      `Ancas Holdings Maintenance Request\n` +
      `Ticket ID: ${submittedTicket.ticketId}\n` +
      `Submitted: ${submittedTicket.submittedAt}\n\n` +
      `Tenant Name: ${submittedTicket.tenantName}\n` +
      `Phone: ${submittedTicket.tenantPhone}\n` +
      `Email: ${submittedTicket.tenantEmail}\n` +
      `Property: ${submittedTicket.propertyAddress}\n` +
      `Unit: ${submittedTicket.unitNumber}\n\n` +
      `Maintenance Type: ${submittedTicket.maintenanceType}\n` +
      `Urgency Level: ${submittedTicket.urgencyLevel.toUpperCase()}\n` +
      `Location in Unit: ${submittedTicket.locationInUnit}\n` +
      `Permission to Enter: ${submittedTicket.permissionToEnter}\n` +
      `Preferred Contact Time: ${submittedTicket.preferredTime}\n\n` +
      `Description:\n${submittedTicket.description}\n\n` +
      `Attached Photos: ${submittedTicket.photos.length} image(s) logged.\n`
    );
    window.location.href = `mailto:tudor@ancasholdings.com?subject=${subject}&body=${body}`;
  };

  const resetForm = () => {
    setSubmittedTicket(null);
    setTenantName("");
    setTenantEmail("");
    setTenantPhone("");
    setPropertyAddress("");
    setUnitNumber("");
    setMaintenanceType("");
    setUrgencyLevel("standard");
    setLocationInUnit("");
    setDescription("");
    setPermissionToEnter("yes");
    setPreferredTime("anytime");
    setPhotos([]);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-28 pb-24 text-slate-800">
      <div className="max-w-5xl mx-auto px-6">
        
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
            Resident Care & Property Operations
          </div>
        </div>

        {/* Header Title Section */}
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00264d]/5 border border-[#00264d]/10 text-[#00264d] text-xs font-semibold uppercase tracking-widest rounded-full mb-3">
            <Wrench className="w-3.5 h-3.5 text-[#d4a017]" />
            Tenant Maintenance Portal
          </div>
          <h1 className="text-3xl md:text-5xl font-serif text-[#00264d] mb-4">
            Resident Service & <span className="italic font-light">Maintenance</span>
          </h1>
          <p className="text-slate-600 max-w-2xl text-base md:text-lg leading-relaxed">
            Submit a maintenance request directly to property management. Every request is tracked and handled promptly by our dedicated operations team.
          </p>
        </div>

        {/* Emergency Notice Banner */}
        <div className="mb-10 bg-amber-50/90 border-l-4 border-amber-500 p-5 rounded-r-sm shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wide">
                Urgent Life-Safety or Active Emergency Protocol
              </h2>
              <p className="text-xs md:text-sm text-amber-800 leading-relaxed mt-0.5">
                For active gas smells, major uncontained water flooding, fire hazards, or complete heat loss in sub-freezing temperatures, please call 911 immediately and then contact our 24/7 emergency dispatch line directly.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <a
              href="tel:7735163148"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              (773) 516-3148
            </a>
          </div>
        </div>

        {/* Confirmation Ticket Receipt View */}
        <AnimatePresence>
          {submittedTicket && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-12 bg-white border border-stone-200 rounded-sm shadow-xl p-8 md:p-10"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200 pb-6 mb-6 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
                      Request Confirmed & Dispatched
                    </span>
                    <h2 className="text-2xl font-serif text-[#00264d]">
                      Ticket #{submittedTicket.ticketId}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Submitted on {submittedTicket.submittedAt} · Sent to <span className="font-semibold text-slate-700">tudor@ancasholdings.com</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Receipt
                  </button>
                  <button
                    onClick={openEmailClientFallback}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#00264d] hover:bg-[#00264d]/90 text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#d4a017]" />
                    Send via Email App
                  </button>
                </div>
              </div>

              {/* Receipt Summary Grid */}
              <div className="grid md:grid-cols-2 gap-6 bg-stone-50 p-6 rounded-sm border border-stone-200/80 mb-6 text-sm">
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">
                    Resident & Property Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
                      <span className="text-slate-500">Tenant Name:</span>
                      <span className="font-semibold text-slate-800">{submittedTicket.tenantName}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
                      <span className="text-slate-500">Property:</span>
                      <span className="font-semibold text-slate-800 text-right max-w-[240px] truncate">{submittedTicket.propertyAddress}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
                      <span className="text-slate-500">Unit Number:</span>
                      <span className="font-bold text-[#00264d]">{submittedTicket.unitNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
                      <span className="text-slate-500">Phone:</span>
                      <span className="font-medium text-slate-800">{submittedTicket.tenantPhone}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-medium text-slate-800">{submittedTicket.tenantEmail}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">
                    Ticket Classification & Timing
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
                      <span className="text-slate-500">Maintenance Type:</span>
                      <span className="font-semibold text-slate-800 text-right max-w-[240px] truncate">{submittedTicket.maintenanceType}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
                      <span className="text-slate-500">Urgency Level:</span>
                      <span className={`font-bold uppercase text-xs px-2 py-0.5 rounded-sm ${
                        submittedTicket.urgencyLevel === "urgent" 
                          ? "bg-red-100 text-red-700" 
                          : submittedTicket.urgencyLevel === "standard" 
                            ? "bg-amber-100 text-amber-800" 
                            : "bg-blue-100 text-blue-800"
                      }`}>
                        {submittedTicket.urgencyLevel}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
                      <span className="text-slate-500">Location in Unit:</span>
                      <span className="font-medium text-slate-800">{submittedTicket.locationInUnit}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
                      <span className="text-slate-500">Permission to Enter:</span>
                      <span className="font-medium text-slate-800">{submittedTicket.permissionToEnter}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-slate-500">Preferred Window:</span>
                      <span className="font-medium text-slate-800">{submittedTicket.preferredTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">
                  Issue Description
                </h3>
                <div className="p-4 bg-stone-50 rounded-sm border border-stone-200 text-slate-700 text-sm whitespace-pre-line leading-relaxed">
                  {submittedTicket.description}
                </div>
              </div>

              {/* Photos Log */}
              {submittedTicket.photos.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">
                    Attached Photographs ({submittedTicket.photos.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {submittedTicket.photos.map((photo, idx) => (
                      <div key={photo.id} className="group relative rounded-sm overflow-hidden border border-stone-200 bg-stone-100 aspect-square">
                        <img
                          src={photo.dataUrl}
                          alt={`Issue attachment ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate">
                          {photo.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What happens next */}
              <div className="bg-blue-50/60 border border-blue-200/60 p-4 rounded-sm flex items-start gap-3 text-xs text-blue-900 mb-8">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Next Steps:</span> Our Chicago maintenance team will review your ticket. If entry permission was granted, technicians will coordinate access within your urgency window. If you selected "Call first," our property manager will contact you at {submittedTicket.tenantPhone}.
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200">
                <button
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 py-3 bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-semibold uppercase tracking-widest rounded-sm transition-colors cursor-pointer"
                >
                  Submit Another Request
                </button>
                <button
                  onClick={onBackToHome}
                  className="w-full sm:w-auto px-8 py-3 bg-[#00264d] hover:bg-[#00264d]/90 text-white text-xs font-semibold uppercase tracking-widest rounded-sm transition-colors cursor-pointer"
                >
                  Return to Home Page
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Main Maintenance Form */}
        {!submittedTicket && (
          <div className="bg-white rounded-sm shadow-xl border border-stone-200/80 overflow-hidden">
            {/* Form Top Branding Stripe */}
            <div className="h-1.5 bg-gradient-to-r from-[#00264d] via-[#d4a017] to-[#00264d]" />

            <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
              
              {/* Error Alert */}
              {errorMsg && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-sm text-sm text-red-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setErrorMsg(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Section 1: Tenant Information */}
              <div>
                <div className="flex items-center gap-2 border-b border-stone-200 pb-3 mb-6">
                  <span className="w-6 h-6 rounded-full bg-[#00264d] text-white text-xs font-bold flex items-center justify-center">1</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#00264d]">
                    Resident Contact Details
                  </h3>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-semibold text-slate-600 flex items-center justify-between">
                      <span>Full Name <span className="text-red-500">*</span></span>
                    </label>
                    <input
                      type="text"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      placeholder="e.g. Jane Miller"
                      required
                      className="w-full bg-stone-50 border border-stone-300 p-3 text-sm text-slate-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-semibold text-slate-600">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={tenantEmail}
                      onChange={(e) => setTenantEmail(e.target.value)}
                      placeholder="e.g. jane@example.com"
                      required
                      className="w-full bg-stone-50 border border-stone-300 p-3 text-sm text-slate-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white transition-all"
                    />
                    <p className="text-[11px] text-slate-400">Confirmation receipt will be sent here</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-semibold text-slate-600">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={tenantPhone}
                      onChange={(e) => setTenantPhone(e.target.value)}
                      placeholder="e.g. (312) 555-0123"
                      required
                      className="w-full bg-stone-50 border border-stone-300 p-3 text-sm text-slate-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white transition-all"
                    />
                    <p className="text-[11px] text-slate-400">For technician arrival coordination</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Property & Unit Location */}
              <div>
                <div className="flex items-center gap-2 border-b border-stone-200 pb-3 mb-6">
                  <span className="w-6 h-6 rounded-full bg-[#00264d] text-white text-xs font-bold flex items-center justify-center">2</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#00264d]">
                    Property Address & Unit Number
                  </h3>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs uppercase tracking-wider font-semibold text-slate-600 flex items-center justify-between">
                      <span>Property Address <span className="text-red-500">*</span></span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-3.5 pointer-events-none text-slate-400">
                        <MapPin className="w-4 h-4 text-[#00264d]/60" />
                      </div>
                      <input
                        type="text"
                        value={propertyAddress}
                        onChange={(e) => setPropertyAddress(e.target.value)}
                        placeholder="e.g. 4814 Elm St, Skokie, IL 60077"
                        required
                        className="w-full bg-stone-50 border border-stone-300 py-3 pl-10 pr-4 text-sm text-slate-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white transition-all font-medium"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Enter your property address, city, state, and zip code.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-semibold text-slate-600">
                      Apartment / Unit # <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={unitNumber}
                      onChange={(e) => setUnitNumber(e.target.value)}
                      placeholder="e.g. Unit 3A, Apt 2F"
                      required
                      className="w-full bg-stone-50 border border-stone-300 p-3 text-sm text-slate-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white transition-all font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Request Type & Urgency */}
              <div>
                <div className="flex items-center gap-2 border-b border-stone-200 pb-3 mb-6">
                  <span className="w-6 h-6 rounded-full bg-[#00264d] text-white text-xs font-bold flex items-center justify-center">3</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#00264d]">
                    Maintenance Classification
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Category Dropdown */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-semibold text-slate-600">
                      Type of Maintenance Request <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={maintenanceType}
                        onChange={(e) => setMaintenanceType(e.target.value)}
                        required
                        className="w-full bg-stone-50 border border-stone-300 p-3 pr-10 text-sm text-slate-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white transition-all appearance-none cursor-pointer"
                      >
                        {MAINTENANCE_CATEGORIES.map((cat, idx) => (
                          <option key={idx} value={idx === 0 ? "" : cat} disabled={idx === 0}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                    </div>

                    <div className="mt-4 space-y-2">
                      <label className="text-xs uppercase tracking-wider font-semibold text-slate-600">
                        Specific Room / Location in Apartment
                      </label>
                      <input
                        type="text"
                        value={locationInUnit}
                        onChange={(e) => setLocationInUnit(e.target.value)}
                        placeholder="e.g. Master bathroom sink, Kitchen refrigerator, Hallway radiator"
                        className="w-full bg-stone-50 border border-stone-300 p-3 text-sm text-slate-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Urgency Level Selector */}
                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-wider font-semibold text-slate-600 block">
                      Urgency Rating
                    </label>
                    <div className="space-y-2.5">
                      <label 
                        className={`flex items-start gap-3 p-3 rounded-sm border cursor-pointer transition-all ${
                          urgencyLevel === "routine" 
                            ? "border-[#00264d] bg-[#00264d]/5 shadow-sm" 
                            : "border-stone-200 bg-stone-50 hover:bg-stone-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          checked={urgencyLevel === "routine"}
                          onChange={() => setUrgencyLevel("routine")}
                          className="mt-1 text-[#00264d] focus:ring-[#00264d]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">Routine Maintenance</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">Non-critical adjustments, minor scuffs, slow drain, preventative maintenance.</p>
                        </div>
                      </label>

                      <label 
                        className={`flex items-start gap-3 p-3 rounded-sm border cursor-pointer transition-all ${
                          urgencyLevel === "standard" 
                            ? "border-[#d4a017] bg-[#d4a017]/10 shadow-sm" 
                            : "border-stone-200 bg-stone-50 hover:bg-stone-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          checked={urgencyLevel === "standard"}
                          onChange={() => setUrgencyLevel("standard")}
                          className="mt-1 text-[#d4a017] focus:ring-[#d4a017]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">Standard Repair</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">Active fixture drips, appliance malfunction, door latch trouble, radiator noise.</p>
                        </div>
                      </label>

                      <label 
                        className={`flex items-start gap-3 p-3 rounded-sm border cursor-pointer transition-all ${
                          urgencyLevel === "urgent" 
                            ? "border-red-500 bg-red-50 shadow-sm" 
                            : "border-stone-200 bg-stone-50 hover:bg-stone-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          checked={urgencyLevel === "urgent"}
                          onChange={() => setUrgencyLevel("urgent")}
                          className="mt-1 text-red-600 focus:ring-red-500"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-red-900">Urgent Priority</span>
                          </div>
                          <p className="text-xs text-red-700/80 mt-0.5">Single toilet inoperable, refrigerator not cooling, loss of hot water.</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Detailed Description */}
              <div>
                <div className="flex items-center gap-2 border-b border-stone-200 pb-3 mb-6">
                  <span className="w-6 h-6 rounded-full bg-[#00264d] text-white text-xs font-bold flex items-center justify-center">4</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#00264d]">
                    Issue Description & Unit Access
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-semibold text-slate-600">
                      Please describe the issue in detail <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please share what is happening, when it started, and any symptoms (e.g., leaking when faucet is turned on, strange humming sound, visible water staining on ceiling)..."
                      required
                      className="w-full bg-stone-50 border border-stone-300 p-3 text-sm text-slate-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white transition-all leading-relaxed"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider font-semibold text-slate-600 block">
                        Permission to Enter If Not Home?
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-200 rounded-sm cursor-pointer hover:bg-stone-100 transition-colors">
                          <input
                            type="radio"
                            name="permission"
                            checked={permissionToEnter === "yes"}
                            onChange={() => setPermissionToEnter("yes")}
                            className="text-[#00264d] focus:ring-[#00264d]"
                          />
                          <span className="text-xs font-medium text-slate-800">
                            Yes, maintenance may enter unit during normal service hours (8 AM - 5 PM)
                          </span>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-200 rounded-sm cursor-pointer hover:bg-stone-100 transition-colors">
                          <input
                            type="radio"
                            name="permission"
                            checked={permissionToEnter === "call_first"}
                            onChange={() => setPermissionToEnter("call_first")}
                            className="text-[#00264d] focus:ring-[#00264d]"
                          />
                          <span className="text-xs font-medium text-slate-800">
                            No, please call first to schedule a specific window when I am present
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider font-semibold text-slate-600 block">
                        Preferred Contact Window
                      </label>
                      <select
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 p-3 text-sm text-slate-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white transition-all cursor-pointer"
                      >
                        <option value="anytime">Anytime during business hours (8 AM - 5 PM)</option>
                        <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                        <option value="afternoon">Afternoon (12:00 PM - 5:00 PM)</option>
                      </select>
                      <p className="text-[11px] text-slate-400">
                        Technicians strive to accommodate preferred windows for non-emergencies.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Photo Upload Hub */}
              <div>
                <div className="flex items-center gap-2 border-b border-stone-200 pb-3 mb-6">
                  <span className="w-6 h-6 rounded-full bg-[#00264d] text-white text-xs font-bold flex items-center justify-center">5</span>
                  <div className="flex items-center justify-between w-full">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#00264d]">
                      Photo of the Issue
                    </h3>
                    <span className="text-xs text-slate-400 font-normal">
                      Recommended for faster diagnostic
                    </span>
                  </div>
                </div>

                {/* Drag & Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-all ${
                    isDragging 
                      ? "border-[#d4a017] bg-[#d4a017]/10" 
                      : "border-stone-300 bg-stone-50/70 hover:bg-stone-100/70 hover:border-slate-400"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#00264d]/5 flex items-center justify-center text-[#00264d]">
                      <Camera className="w-6 h-6 text-[#d4a017]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Click to upload photos or drag and drop
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        PNG, JPG, WEBP, or HEIC up to 8MB each (up to 5 photos)
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-white border border-stone-200 text-xs text-[#00264d] font-semibold rounded shadow-2xs hover:border-[#00264d] transition-colors">
                      Browse Files
                    </span>
                  </div>
                </div>

                {/* Photo Previews */}
                {photos.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Attached Photos ({photos.length} of 5)
                      </span>
                      <button
                        type="button"
                        onClick={() => setPhotos([])}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove all
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="group relative aspect-square rounded-sm overflow-hidden border border-stone-200 bg-stone-100 shadow-2xs"
                        >
                          <img
                            src={photo.dataUrl}
                            alt={photo.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removePhoto(photo.id);
                              }}
                              className="self-end p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors cursor-pointer"
                              title="Delete photo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] text-white truncate font-medium">
                              {photo.name} ({photo.size})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button & Notification Disclaimer */}
              <div className="pt-6 border-t border-stone-200 space-y-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Mail className="w-4 h-4 text-[#d4a017] shrink-0" />
                  <span>
                    When submitted, all details and images will be transmitted to our operations team and promptly reviewed by an appropriate technician.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#00264d] text-white py-4 px-8 text-sm font-semibold uppercase tracking-widest hover:bg-[#001d3a] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Transmitting Ticket to Tudor Ancas...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4 text-[#d4a017]" />
                      <span>Submit Maintenance Request</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Resident Guidance Cards & FAQ */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-sm border border-stone-200/80 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-[#00264d]/5 text-[#00264d] flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-[#d4a017]" />
            </div>
            <h4 className="text-base font-serif text-[#00264d] mb-2">Service Operating Hours</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standard maintenance operating hours are Monday through Friday, 8:00 AM – 5:00 PM. Non-emergency tickets logged after hours or over weekends are reviewed the next business morning.
            </p>
          </div>

          <div className="bg-white p-6 rounded-sm border border-stone-200/80 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-[#00264d]/5 text-[#00264d] flex items-center justify-center mb-4">
              <Camera className="w-5 h-5 text-[#d4a017]" />
            </div>
            <h4 className="text-base font-serif text-[#00264d] mb-2">Helpful Photo Tips</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Attaching clear photos helps our technicians arrive with the correct replacement components (e.g. plumbing valve dimensions, appliance brand plates, or radiator model tags).
            </p>
          </div>

          <div className="bg-white p-6 rounded-sm border border-stone-200/80 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-[#00264d]/5 text-[#00264d] flex items-center justify-center mb-4">
              <Phone className="w-5 h-5 text-[#d4a017]" />
            </div>
            <h4 className="text-base font-serif text-[#00264d] mb-2">Direct Contact</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Have an ongoing question about your lease, rent payment, or building access? Contact Tudor Ancas at{" "}
              <a href="mailto:tudor@ancasholdings.com" className="font-semibold text-[#00264d] underline">
                tudor@ancasholdings.com
              </a>{" "}
              or call (773) 516-3148.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
