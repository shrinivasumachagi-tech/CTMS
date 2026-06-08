"use client";

import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import { Shield, Edit, Check, X, Plus, Lock } from "lucide-react";
import { motion } from "framer-motion";

const roles = [
  { id: "1", name: "Super Admin", description: "Full system access with all administrative privileges", permissionCount: 24, color: "border-red-200 bg-red-50", iconColor: "text-red-600 bg-red-100" },
  { id: "2", name: "Department Manager", description: "Manages department operations and team members", permissionCount: 18, color: "border-blue-200 bg-blue-50", iconColor: "text-blue-600 bg-blue-100" },
  { id: "3", name: "Support Executive", description: "Handles ticket resolution and customer support", permissionCount: 12, color: "border-green-200 bg-green-50", iconColor: "text-green-600 bg-green-100" },
  { id: "4", name: "User", description: "Basic access to create and view own tickets", permissionCount: 6, color: "border-gray-200 bg-gray-50", iconColor: "text-gray-600 bg-gray-100" },
];

const permissions = [
  { name: "Create Tickets", module: "Tickets", super_admin: true, department_manager: true, support_executive: true, user: true },
  { name: "View All Tickets", module: "Tickets", super_admin: true, department_manager: true, support_executive: true, user: false },
  { name: "Edit Any Ticket", module: "Tickets", super_admin: true, department_manager: true, support_executive: true, user: false },
  { name: "Delete Tickets", module: "Tickets", super_admin: true, department_manager: false, support_executive: false, user: false },
  { name: "Assign Tickets", module: "Tickets", super_admin: true, department_manager: true, support_executive: false, user: false },
  { name: "Manage Users", module: "Users", super_admin: true, department_manager: false, support_executive: false, user: false },
  { name: "View Users", module: "Users", super_admin: true, department_manager: true, support_executive: true, user: false },
  { name: "Manage Roles", module: "Roles", super_admin: true, department_manager: false, support_executive: false, user: false },
  { name: "View Audit Logs", module: "Audit", super_admin: true, department_manager: true, support_executive: false, user: false },
  { name: "Export Data", module: "Reports", super_admin: true, department_manager: true, support_executive: false, user: false },
  { name: "View Reports", module: "Reports", super_admin: true, department_manager: true, support_executive: true, user: false },
  { name: "Manage SLA Rules", module: "SLA", super_admin: true, department_manager: false, support_executive: false, user: false },
  { name: "System Settings", module: "Settings", super_admin: true, department_manager: false, support_executive: false, user: false },
  { name: "View Dashboard", module: "Dashboard", super_admin: true, department_manager: true, support_executive: true, user: true },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function RolesPage() {
  return (
    <MainLayout>
      <PageHeader
        title="Roles & Permissions"
        description="Manage roles and their associated permissions"
        actions={
          <button className="flex items-center gap-2 bg-[#3B4252] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2E3544] transition-colors">
            <Plus size={16} /> Create Role
          </button>
        }
      />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((role) => (
            <motion.div key={role.id} variants={item} className={cn("rounded-xl border p-5 transition-shadow hover:shadow-md", role.color)}>
              <div className="flex items-start justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", role.iconColor)}>
                  <Shield size={20} />
                </div>
                <button className="p-1.5 rounded-lg hover:bg-white/60 text-[#6B7280] hover:text-[#3B4252] transition-colors">
                  <Edit size={15} />
                </button>
              </div>
              <h3 className="font-semibold text-[#1F2937] mb-1">{role.name}</h3>
              <p className="text-sm text-[#6B7280] mb-3">{role.description}</p>
              <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <Lock size={12} /> {role.permissionCount} permissions
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={item} className="bg-white rounded-xl border border-[#D8DDE3] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#D8DDE3]">
            <h3 className="text-lg font-semibold text-[#1F2937]">Permissions Matrix</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D8DDE3] bg-[#F4F6F8]">
                  <th className="text-left px-4 py-3 font-medium text-[#6B7280]">Permission</th>
                  <th className="text-left px-4 py-3 font-medium text-[#6B7280]">Module</th>
                  <th className="text-center px-4 py-3 font-medium text-[#6B7280]">Super Admin</th>
                  <th className="text-center px-4 py-3 font-medium text-[#6B7280]">Dept Manager</th>
                  <th className="text-center px-4 py-3 font-medium text-[#6B7280]">Support Exec</th>
                  <th className="text-center px-4 py-3 font-medium text-[#6B7280]">User</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm, i) => (
                  <tr key={i} className="border-b border-[#D8DDE3] last:border-b-0 hover:bg-[#F4F6F8] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1F2937]">{perm.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F4F6F8] text-[#6B7280] border border-[#D8DDE3]">
                        {perm.module}
                      </span>
                    </td>
                    {(["super_admin", "department_manager", "support_executive", "user"] as const).map((role) => (
                      <td key={role} className="px-4 py-3 text-center">
                        {perm[role] ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
                            <Check size={14} />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400">
                            <X size={14} />
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
