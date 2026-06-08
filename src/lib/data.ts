export interface User {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "department_manager" | "support_executive" | "user";
  department: string;
  designation: string;
  avatar?: string;
  mobile: string;
  employeeId: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  subCategory: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "Assigned" | "In Progress" | "Pending User Response" | "Escalated" | "Resolved" | "Closed";
  department: string;
  createdBy: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  slaDeadline: Date;
  slaBreached: boolean;
  resolvedAt?: Date;
  closedAt?: Date;
  attachments: Attachment[];
  comments: Comment[];
  timeline: TimelineEntry[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  isInternal: boolean;
  createdAt: Date;
}

export interface TimelineEntry {
  id: string;
  action: string;
  performedBy: string;
  timestamp: Date;
  details?: string;
}

export interface Department {
  id: string;
  name: string;
  manager: string;
  ticketCount: number;
  avgResolutionTime: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  createdAt: Date;
}

export const categories = [
  { name: "Email", subCategories: ["Access Issues", "Configuration", "Migration"] },
  { name: "Hardware", subCategories: ["Desktop", "Laptop", "Printer", "Monitor", "Peripherals"] },
  { name: "Software", subCategories: ["Installation", "Updates", "License Management", "Configuration"] },
  { name: "Network", subCategories: ["VPN Issues", "WiFi Issues", "Internet Connectivity", "Firewall"] },
  { name: "Payroll", subCategories: ["Salary Issues", "Tax Queries", "Reimbursement", "Benefits"] },
  { name: "Onboarding", subCategories: ["New Employee Setup", "Account Creation", "Training"] },
  { name: "Facilities", subCategories: ["HVAC Issues", "Cleaning", "Maintenance", "Parking"] },
  { name: "Security", subCategories: ["Access Card Issues", "Incident Report", "Surveillance"] },
];
