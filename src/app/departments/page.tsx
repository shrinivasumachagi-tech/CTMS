"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import { getDepartments, createDepartment } from "@/lib/api";
import {
  Building2,
  Users,
  Clock,
  Search,
  Plus,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Department {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  is_active: boolean;
  ticketCount?: number;
  avgResolutionTime?: number;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data || []);
    } catch {
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTickets = departments.reduce(
    (sum, dept) => sum + (dept.ticketCount || 0),
    0
  );

  const handleAdd = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      await createDepartment({ name: formName.trim(), description: formDescription.trim() || undefined });
      setShowModal(false);
      setFormName("");
      setFormDescription("");
      await fetchDepartments();
    } catch (err) {
      console.error("Failed to create department:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Departments"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#3B4252] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2D3342] transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Add Department
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-[#D8DDE3] p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#3B4252]/10 rounded-lg">
              <Building2 className="w-5 h-5 text-[#3B4252]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Departments</p>
              <p className="text-xl font-semibold text-[#3B4252]">
                {departments.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-[#D8DDE3] p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#3B4252]/10 rounded-lg">
              <Users className="w-5 h-5 text-[#3B4252]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Tickets</p>
              <p className="text-xl font-semibold text-[#3B4252]">
                {totalTickets}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-[#D8DDE3] p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#3B4252]/10 rounded-lg">
              <Clock className="w-5 h-5 text-[#3B4252]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Resolution Time</p>
              <p className="text-xl font-semibold text-[#3B4252]">
                {loading ? "..." : "—"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D8DDE3] rounded-lg focus:outline-none focus:border-[#3B4252] transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[#3B4252]" />
          <span className="ml-2 text-sm text-[#6B7280]">Loading departments...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepartments.map((dept, index) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg border border-[#D8DDE3] p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#3B4252] rounded-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#3B4252]">{dept.name}</h3>
                    <p className="text-sm text-gray-500">
                      {dept.description || "No description"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Tickets</p>
                  <p className="text-lg font-semibold text-[#3B4252]">
                    {dept.ticketCount || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg Resolution</p>
                  <p className="text-lg font-semibold text-[#3B4252]">
                    {dept.avgResolutionTime || "—"}{dept.avgResolutionTime ? "h" : ""}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Status</span>
                  <span>{dept.is_active ? "Active" : "Inactive"}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: dept.is_active ? "100%" : "30%" }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full rounded-full ${dept.is_active ? "bg-[#3B4252]" : "bg-gray-400"}`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
          {filteredDepartments.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-[#F4F6F8] rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-[#9CA3AF]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1F2937] mb-1">No departments found</h3>
              <p className="text-sm text-[#6B7280] text-center max-w-sm">
                {searchQuery ? "No departments match your search. Try adjusting your search criteria." : "No departments have been created yet. Click 'Add Department' to get started."}
              </p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl border border-[#D8DDE3] p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#1F2937]">Add Department</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-[#F4F6F8] text-[#6B7280]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Marketing, Legal"
                    className="w-full px-3 py-2 border border-[#D8DDE3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4252] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Optional description"
                    rows={3}
                    className="w-full px-3 py-2 border border-[#D8DDE3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4252] focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#D8DDE3] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={saving || !formName.trim()}
                  className="px-4 py-2 bg-[#3B4252] text-white rounded-lg text-sm font-medium hover:bg-[#2E3544] disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? "Saving..." : "Add"}
                  {!saving && <Check size={14} />}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
