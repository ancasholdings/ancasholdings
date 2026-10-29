export type TicketStatus = 
  | "submitted" 
  | "under_review" 
  | "contractor_assigned" 
  | "scheduled" 
  | "in_progress" 
  | "resolved";

export type TicketPriority = "normal" | "urgent" | "emergency";

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  propertyAddress: string;
  unitNumber: string;
  issueCategory: string;
  priority: TicketPriority;
  description: string;
  entryPermission: "yes_knock_first" | "yes_anytime" | "appointment_only";
  hasPet: boolean;
  petDetails?: string;
  photoDataUrl?: string;
  photoFileName?: string;
  status: TicketStatus;
  submittedAt: string;
  updatedAt: string;
  assignedContractor?: string;
  scheduledVisitWindow?: string;
  managerNotes?: string;
}

export interface RentLedgerItem {
  id: string;
  date: string;
  description: string;
  type: "charge" | "payment" | "credit";
  amount: number;
  balanceAfter: number;
  status: "paid" | "pending" | "overdue";
  receiptNumber?: string;
}

export interface LeaseAgreement {
  leaseId: string;
  propertyAddress: string;
  unitNumber: string;
  monthlyRent: number;
  securityDeposit: number;
  startDate: string;
  endDate: string;
  leaseTermMonths: number;
  parkingSpace?: string;
  storageLocker?: string;
  petAddendum: boolean;
  occupants: string[];
  rentDueDay: number;
  gracePeriodDays: number;
  lateFee: number;
}

export interface BuildingNotice {
  id: string;
  title: string;
  date: string;
  category: "maintenance" | "policy" | "seasonal" | "community";
  content: string;
  isImportant?: boolean;
}

export interface ResidentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId: "brummel" | "touhy" | "elm" | "howard";
  propertyAddress: string;
  unitNumber: string;
  moveInDate: string;
  lease: LeaseAgreement;
  currentBalance: number;
  autopayEnabled: boolean;
  preferredPaymentMethod: "ach" | "debit" | "check";
  paymentAccountLast4: string;
}

export interface PropertyUnitSummary {
  unitId: string;
  propertyAddress: string;
  propertyId: "brummel" | "touhy" | "elm" | "howard";
  unitNumber: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  monthlyRent: number;
  leaseEnd: string;
  balanceDue: number;
  status: "occupied" | "notice_given" | "vacant";
}

export type PortalUserRole = "resident" | "manager";

export interface PortalAuthSession {
  isAuthenticated: boolean;
  role: PortalUserRole;
  userEmail: string;
  userName: string;
  residentId?: string;
  loginTimestamp: number;
}

export interface PortalUserCredential {
  email: string;
  passwordHash: string;
  role: PortalUserRole;
  name: string;
  residentId?: string;
  unitDisplay?: string;
}
