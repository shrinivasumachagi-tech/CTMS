"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { getDepartments } from "@/lib/api";
import {
  LayoutDashboard,
  Ticket,
  FolderOpen,
  BarChart3,
  LineChart,
  BookOpen,
  Bell,
  ClipboardList,
  Settings,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
}

interface Department {
  id: string;
  name: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
  {
    label: "Tickets",
    href: "/tickets",
    icon: <Ticket size={20} />,
    children: [
      { label: "My Tickets", href: "/tickets" },
      { label: "Open Tickets", href: "/tickets?status=open" },
      { label: "In Progress", href: "/tickets?status=in-progress" },
      { label: "Escalated", href: "/tickets?status=escalated" },
      { label: "Resolved", href: "/tickets?status=resolved" },
      { label: "Closed", href: "/tickets?status=closed" },
      { label: "Create Complaint", href: "/tickets/create" },
    ],
  },
  { label: "Departments", href: "/departments", icon: <FolderOpen size={20} /> },
  { label: "Reports", href: "/reports", icon: <BarChart3 size={20} /> },
  { label: "Analytics", href: "/analytics", icon: <LineChart size={20} /> },
  { label: "Knowledge Base", href: "/knowledge-base", icon: <BookOpen size={20} /> },
  { label: "Notifications", href: "/notifications", icon: <Bell size={20} /> },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: <ClipboardList size={20} /> },
  {
    label: "Administration",
    href: "/admin",
    icon: <Settings size={20} />,
    children: [
      { label: "User Management", href: "/admin/users" },
      { label: "Departments", href: "/admin/departments" },
      { label: "Roles & Permissions", href: "/admin/roles" },
      { label: "SLA Management", href: "/admin/sla" },
      { label: "Audit Logs", href: "/admin/audit-logs" },
      { label: "Settings", href: "/admin/settings" },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(["/tickets", "/admin"]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (!user) return;
    getDepartments()
      .then((data) => setDepartments(data || []))
      .catch(() => setDepartments([]));
  }, [user]);

  const departmentName = departments.find((d) => d.id === user?.department_id)?.name || "No Department";

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-[#3B4252] text-white transition-all duration-300 flex flex-col",
          isOpen ? "w-[260px]" : "w-0 lg:w-[260px]",
          !isOpen && "overflow-hidden lg:overflow-visible"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src="/logo.png"
                alt="CTMS Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-semibold text-lg">CTMS</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((item) => (
            <div key={item.href} className="mb-1">
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      pathname.startsWith(item.href)
                        ? "bg-white/15 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {item.icon}
                    <span className="flex-1 text-left">{item.label}</span>
                    {expandedItems.includes(item.href) ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                  {expandedItems.includes(item.href) && (
                    <div className="ml-4 mt-1 space-y-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block px-3 py-2 rounded-lg text-sm transition-colors",
                            pathname === child.href || pathname + "?status=" === child.href
                              ? "bg-white/15 text-white"
                              : "text-white/60 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#5E6777] flex items-center justify-center text-sm font-medium">
              {user?.full_name ? user.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.full_name || "User"}</p>
              <p className="text-xs text-white/50 truncate">{departmentName}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
