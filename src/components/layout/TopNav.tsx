"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  MessageSquare,
  Settings,
  ChevronDown,
  Menu,
  LogOut,
  User,
  Check,
  Clock,
  AlertTriangle,
  Info,
} from "lucide-react";
import { getNotifications, signOut, getDepartments } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatDateTime, getInitials } from "@/lib/utils";

interface TopNavProps {
  onMenuClick: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface Department {
  id: string;
  name: string;
}

const avatarColors = [
  "bg-[#3B4252]", "bg-blue-600", "bg-green-600", "bg-orange-500",
];

export default function TopNav({ onMenuClick }: TopNavProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (!user) return;
    getNotifications(user.id)
      .then((data) => setNotifications(data || []))
      .catch(() => setNotifications([]));
    getDepartments()
      .then((data) => setDepartments(data || []))
      .catch(() => setDepartments([]));
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return <Check size={16} className="text-green-500" />;
      case "warning": return <AlertTriangle size={16} className="text-yellow-500" />;
      case "error": return <AlertTriangle size={16} className="text-red-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  const userName = user?.full_name || "User";
  const departmentName = departments.find((d) => d.id === user?.department_id)?.name || "";
  const userInitials = getInitials(userName);
  const colorIndex = user?.id ? user.id.charCodeAt(0) % avatarColors.length : 0;

  return (
    <header className="h-16 bg-white border-b border-[#D8DDE3] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden text-[#6B7280] hover:text-[#1F2937]">
          <Menu size={24} />
        </button>
        <div className="relative hidden sm:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search tickets, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-[#F4F6F8] border border-[#D8DDE3] rounded-lg text-sm w-64 lg:w-80 focus:outline-none focus:ring-2 focus:ring-[#3B4252]/20 focus:border-[#3B4252] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-[#F4F6F8] transition-colors"
          >
            <Bell size={18} className="text-[#6B7280]" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center px-1">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-[#D8DDE3] z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#D8DDE3]">
                  <h3 className="font-semibold text-[#1F2937]">Notifications</h3>
                  <Link href="/notifications" className="text-sm text-[#3B4252] hover:underline" onClick={() => setShowNotifications(false)}>
                    View All
                  </Link>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-[#6B7280]">No notifications</div>
                  ) : (
                    notifications.slice(0, 5).map((notif) => (
                      <div key={notif.id} className={`px-4 py-3 border-b border-[#F4F6F8] hover:bg-[#F4F6F8] transition-colors ${!notif.is_read ? "bg-blue-50/50" : ""}`}>
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{getNotificationIcon(notif.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#1F2937]">{notif.title}</p>
                            <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-xs text-[#6B7280] mt-1 flex items-center gap-1">
                              <Clock size={12} />
                              {formatDateTime(notif.created_at)}
                            </p>
                          </div>
                          {!notif.is_read && <div className="w-2 h-2 bg-[#3B4252] rounded-full mt-2" />}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <button className="p-2 text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F4F6F8] rounded-lg transition-colors hidden sm:flex">
          <MessageSquare size={20} />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#F4F6F8] rounded-lg transition-colors"
          >
            <div className={`w-8 h-8 rounded-full ${avatarColors[colorIndex]} flex items-center justify-center text-white text-sm font-medium`}>
              {loading ? "..." : userInitials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-[#1F2937]">{loading ? "Loading..." : userName}</p>
              <p className="text-xs text-[#6B7280]">{departmentName || "No Department"}</p>
            </div>
            <ChevronDown size={16} className="text-[#6B7280] hidden sm:block" />
          </button>

          {showProfile && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
              <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-[#D8DDE3] z-50 overflow-hidden">
                <Link href="/admin/settings" className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1F2937] hover:bg-[#F4F6F8] transition-colors" onClick={() => setShowProfile(false)}>
                  <User size={16} /> Profile
                </Link>
                <Link href="/admin/settings" className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1F2937] hover:bg-[#F4F6F8] transition-colors" onClick={() => setShowProfile(false)}>
                  <Settings size={16} /> Settings
                </Link>
                <div className="border-t border-[#D8DDE3]" />
                <button
                  onClick={async () => {
                    await signOut();
                    setShowProfile(false);
                    router.push("/auth/login");
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#EF4444] hover:bg-[#F4F6F8] transition-colors w-full text-left"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
