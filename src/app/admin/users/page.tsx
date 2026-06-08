"use client";

import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import { getUsers } from "@/lib/api";
import { getInitials, cn } from "@/lib/utils";
import { Search, UserPlus, Filter, Shield, Mail, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  mobile?: string;
  department_id?: string;
  departments?: { name: string };
}

const roleColors: Record<string, string> = {
  super_admin: "bg-red-100 text-red-700 border-red-200",
  department_manager: "bg-blue-100 text-blue-700 border-blue-200",
  support_executive: "bg-green-100 text-green-700 border-green-200",
  user: "bg-gray-100 text-gray-700 border-gray-200",
};

const avatarColors = [
  "bg-[#3B4252]", "bg-blue-600", "bg-green-600", "bg-orange-500",
  "bg-purple-600", "bg-pink-600",
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    getUsers()
      .then((data) => setUsers(data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch = u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <MainLayout>
      <PageHeader
        title="User Management"
        description="Manage system users, roles, and permissions"
        actions={
          <button className="flex items-center gap-2 bg-[#3B4252] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2E3544] transition-colors">
            <UserPlus size={16} /> Add User
          </button>
        }
      />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={item} className="bg-white rounded-xl border border-[#D8DDE3] p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 border border-[#D8DDE3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4252] focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="pl-9 pr-8 py-2 border border-[#D8DDE3] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3B4252] focus:border-transparent appearance-none"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="department_manager">Department Manager</option>
                <option value="support_executive">Support Executive</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-white rounded-xl border border-[#D8DDE3] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-[#3B4252]" />
              <span className="ml-2 text-sm text-[#6B7280]">Loading users...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#D8DDE3] bg-[#F4F6F8]">
                      <th className="text-left px-4 py-3 font-medium text-[#6B7280]">User</th>
                      <th className="text-left px-4 py-3 font-medium text-[#6B7280]">Email</th>
                      <th className="text-left px-4 py-3 font-medium text-[#6B7280]">Role</th>
                      <th className="text-left px-4 py-3 font-medium text-[#6B7280]">Department</th>
                      <th className="text-left px-4 py-3 font-medium text-[#6B7280]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((user, i) => (
                      <tr key={user.id} className="border-b border-[#D8DDE3] last:border-b-0 hover:bg-[#F4F6F8] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0", avatarColors[i % avatarColors.length])}>
                              {getInitials(user.full_name)}
                            </div>
                            <div className="font-medium text-[#1F2937]">{user.full_name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-[#6B7280]">
                            <Mail size={14} /> {user.email}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", roleColors[user.role] || roleColors.user)}>
                            <Shield size={12} /> {user.role?.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#1F2937]">{user.departments?.name || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                            user.is_active ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"
                          )}>
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {paginated.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-[#6B7280]">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-[#D8DDE3]">
                  <span className="text-sm text-[#6B7280]">
                    Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length} users
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 text-sm rounded-lg border border-[#D8DDE3] hover:bg-[#F4F6F8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={cn(
                          "px-3 py-1 text-sm rounded-lg transition-colors",
                          p === page ? "bg-[#3B4252] text-white" : "border border-[#D8DDE3] hover:bg-[#F4F6F8]"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 text-sm rounded-lg border border-[#D8DDE3] hover:bg-[#F4F6F8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
