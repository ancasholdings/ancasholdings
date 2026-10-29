import { useState, useEffect } from "react";
import { 
  Wrench, 
  X, 
  RefreshCw, 
  ExternalLink, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  AlertTriangle,
  Copy,
  Check
} from "lucide-react";

interface WorkOrder {
  ticketId: string;
  submittedAt: string;
  serverReceivedAt?: string;
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
  photoUrls?: string[];
  photos?: Array<{ name: string; size: string; dataUrl: string }>;
}

interface WorkOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkOrdersModal = ({ isOpen, onClose }: WorkOrdersModalProps) => {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<{ hasSmtpConfigured: boolean; smtpUser: string } | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/work-orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.workOrders || []);
      }
      const statusRes = await fetch("/api/system-status");
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setSystemStatus(statusData);
      }
    } catch (err) {
      console.warn("Could not fetch work orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyOrderDetails = (order: WorkOrder) => {
    const text = [
      `WORK ORDER: #${order.ticketId}`,
      `Date: ${order.submittedAt}`,
      `Resident: ${order.tenantName} (${order.tenantPhone}, ${order.tenantEmail})`,
      `Property: Unit ${order.unitNumber}, ${order.propertyAddress}`,
      `Location: ${order.locationInUnit || 'Unit interior'}`,
      `Category: ${order.maintenanceType}`,
      `Priority: ${order.urgencyLevel.toUpperCase()}`,
      `Description: ${order.description}`,
      `Access: ${order.permissionToEnter} | Preferred: ${order.preferredTime}`
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopiedId(order.ticketId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-sm shadow-2xl flex flex-col border border-stone-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-[#00264d] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#d4a017]">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif">Management Work Order Dispatch Log</h2>
              <p className="text-xs text-white/70">
                Server-side audit log of all tenant maintenance requests
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              disabled={isLoading}
              className="p-2 hover:bg-white/10 rounded-sm text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Refresh log"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-sm text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SMTP Status banner */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Delivery Status:</span>
            {systemStatus?.hasSmtpConfigured ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Gmail SMTP Active ({systemStatus.smtpUser})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-800 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Web Relay Active (Set GMAIL_APP_PASS in .env for direct Google SMTP delivery)
              </span>
            )}
          </div>
          <span className="text-slate-500 font-medium">
            {orders.length} total request{orders.length === 1 ? "" : "s"} logged
          </span>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm">No maintenance work orders logged yet.</p>
              <p className="text-xs text-slate-500">Submissions from the Tenant Maintenance Form will appear here immediately.</p>
            </div>
          ) : (
            orders.map((order) => {
              const photoLinks = order.photoUrls || [];
              const hasPhotos = photoLinks.length > 0 || (order.photos && order.photos.length > 0);

              return (
                <div
                  key={order.ticketId}
                  className="bg-white border border-stone-200 rounded-sm p-5 hover:border-slate-300 transition-all shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-serif font-bold text-base text-[#00264d]">
                        #{order.ticketId}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                        order.urgencyLevel === "urgent"
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}>
                        {order.urgencyLevel}
                      </span>
                      <span className="text-xs text-slate-400">
                        {order.submittedAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyOrderDetails(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs border border-stone-200 hover:bg-stone-50 rounded-sm text-slate-700 transition-colors cursor-pointer"
                      >
                        {copiedId === order.ticketId ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`mailto:${order.tenantEmail}?subject=Re: [Ancas Holdings] Work Order Received #${order.ticketId}&body=Hello ${encodeURIComponent(order.tenantName)},\n\nThank you for reaching out to Ancas Holdings Property Management regarding Unit ${encodeURIComponent(order.unitNumber)} at ${encodeURIComponent(order.propertyAddress)}.`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-[#00264d] text-white hover:bg-[#001d3a] rounded-sm transition-colors cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#d4a017]" />
                        <span>Email Resident</span>
                      </a>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">Resident</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{order.tenantName}</p>
                      <div className="flex items-center gap-3 mt-1 text-slate-600">
                        <a href={`tel:${order.tenantPhone}`} className="hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#d4a017]" />
                          {order.tenantPhone}
                        </a>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">Property & Unit</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{order.propertyAddress}</p>
                      <p className="text-slate-600">Unit: <span className="font-bold text-[#00264d]">{order.unitNumber}</span> ({order.locationInUnit || 'Unit interior'})</p>
                    </div>

                    <div>
                      <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">Issue Category</span>
                      <p className="font-semibold text-slate-800 mt-0.5 truncate">{order.maintenanceType}</p>
                      <p className="text-slate-500 mt-0.5">{order.permissionToEnter}</p>
                    </div>
                  </div>

                  <div className="bg-stone-50 p-3 rounded-sm border border-stone-200/70 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    <span className="font-semibold text-slate-800 block mb-1">Issue Description:</span>
                    {order.description}
                  </div>

                  {/* Attached photos */}
                  {hasPhotos && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide block">
                        Attached Photos ({photoLinks.length || order.photos?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {photoLinks.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative w-16 h-16 rounded-sm border border-stone-200 overflow-hidden bg-stone-100 hover:border-[#00264d] transition-all"
                          >
                            <img src={url} alt={`Attachment ${i + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ExternalLink className="w-4 h-4 text-white" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-slate-500">
          <span>Ancas Holdings Management Desk: (773) 516-3148</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-slate-800 rounded-sm font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
