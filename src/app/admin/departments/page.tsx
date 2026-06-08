"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/lib/api";
import { createAuditLog } from "@/lib/api";

interface Department {
  id: string;
  name: string;
  description: string | null;
  manager_id: string | null;
  is_active: boolean;
  created_at: string;
}

export default function DepartmentsAdminPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchDepartments = async () => {
    try {
      const data = await getAllDepartments();
      setDepartments(data);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditingDept(null);
    setFormName("");
    setFormDescription("");
    setShowModal(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setFormName(dept.name);
    setFormDescription(dept.description || "");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      if (editingDept) {
        await updateDepartment(editingDept.id, {
          name: formName.trim(),
          description: formDescription.trim() || undefined,
        });
        await createAuditLog(null, "Updated", "Departments", `Updated department: ${formName}`);
      } else {
        await createDepartment({
          name: formName.trim(),
          description: formDescription.trim() || undefined,
        });
        await createAuditLog(null, "Created", "Departments", `Created department: ${formName}`);
      }
      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      console.error("Failed to save department:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async (dept: Department) => {
    try {
      await updateDepartment(dept.id, { is_active: !dept.is_active });
      await createAuditLog(
        null,
        dept.is_active ? "Disabled" : "Enabled",
        "Departments",
        `${dept.is_active ? "Disabled" : "Enabled"} department: ${dept.name}`
      );
      fetchDepartments();
    } catch (err) {
      console.error("Failed to toggle department:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDepartment(id);
      await createAuditLog(null, "Deleted", "Departments", "Deleted department");
      setShowDeleteConfirm(null);
      fetchDepartments();
    } catch (err) {
      console.error("Failed to delete department:", err);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Department Management"
        description="Add, edit, disable, or delete departments"
        actions={
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#3B4252] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2E3544] transition-colors"
          >
            <Plus size={16} /> Add Department
          </button>
        }
      />

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
          />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#D8DDE3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4252] focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#6B7280]">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((dept, index) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl border p-5 transition-shadow hover:shadow-md ${
                  dept.is_active
                    ? "border-[#D8DDE3]"
                    : "border-red-200 bg-red-50/30"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        dept.is_active
                          ? "bg-[#3B4252]"
                          : "bg-gray-400"
                      }`}
                    >
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1F2937]">
                        {dept.name}
                      </h3>
                      {!dept.is_active && (
                        <span className="text-xs text-red-600 font-medium">
                          Disabled
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {dept.description && (
                  <p className="text-sm text-[#6B7280] mb-4 line-clamp-2">
                    {dept.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-[#D8DDE3]">
                  <button
                    onClick={() => handleDisable(dept)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                      dept.is_active
                        ? "text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                        : "text-green-700 bg-green-50 hover:bg-green-100"
                    }`}
                  >
                    {dept.is_active ? "Disable" : "Enable"}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(dept)}
                      className="p-1.5 rounded-lg hover:bg-[#F4F6F8] text-[#6B7280] hover:text-[#3B4252] transition-colors"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(dept.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {showDeleteConfirm === dept.id && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={14} className="text-red-600" />
                      <span className="text-sm font-medium text-red-700">
                        Delete this department?
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(dept.id)}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-3 py-1.5 bg-white border border-[#D8DDE3] text-[#6B7280] text-xs font-medium rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="text-center py-12 text-[#6B7280]">
          No departments found.
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
                <h3 className="text-lg font-semibold text-[#1F2937]">
                  {editingDept ? "Edit Department" : "Add Department"}
                </h3>
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
                    placeholder="e.g., IT, HR, Finance"
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
                  onClick={handleSave}
                  disabled={saving || !formName.trim()}
                  className="px-4 py-2 bg-[#3B4252] text-white rounded-lg text-sm font-medium hover:bg-[#2E3544] disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? "Saving..." : "Save"}
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
