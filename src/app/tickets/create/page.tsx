"use client";

import { useState, useRef, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import { categories } from "@/lib/data";
import { cn } from "@/lib/utils";
import { getDepartments, createTicket, getCurrentUser, uploadAttachment } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  FileText,
  Building2,
  Send,
  Paperclip,
  X,
  File,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Department {
  id: string;
  name: string;
}

const steps = [
  { id: 1, title: "Complaint Info", icon: FileText },
  { id: 2, title: "Description", icon: Paperclip },
  { id: 3, title: "Department", icon: Building2 },
  { id: 4, title: "Review", icon: Check },
];

const priorityOptions = [
  { value: "Low", color: "bg-emerald-500" },
  { value: "Medium", color: "bg-amber-500" },
  { value: "High", color: "bg-orange-500" },
  { value: "Critical", color: "bg-red-600" },
];

const fadeIn = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: "easeInOut" as const },
};

export default function CreateTicketPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    getDepartments()
      .then((depts) => {
        setDepartments(depts);
        if (user?.department_id) {
          setSelectedDepartmentId(user.department_id);
        }
      })
      .catch((err) => {
        console.error("[CreateTicket] Failed to load departments:", err);
        setSubmitError("Failed to load departments. Please refresh the page.");
      })
      .finally(() => setLoadingDepts(false));
  }, [user]);

  const selectedCategoryData = categories.find((c) => c.name === category);
  const subCategories = selectedCategoryData?.subCategories ?? [];
  const selectedDepartment = departments.find(
    (d) => d.id === selectedDepartmentId
  );

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return title && category && subCategory && priority;
      case 2:
        return description.length > 10;
      case 3:
        return !!selectedDepartmentId;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const user = await getCurrentUser();
      if (!user) {
        setSubmitError("You must be logged in to submit a complaint.");
        setSubmitting(false);
        return;
      }
      const result = await createTicket({
        title,
        description,
        category,
        sub_category: subCategory,
        priority,
        department_id: selectedDepartmentId,
        created_by: user.id,
      });
      setTicketId(result.ticket_number);

      // Upload attached files
      if (files.length > 0 && result.id) {
        for (const file of files) {
          try {
            await uploadAttachment(result.id, file, user.id);
          } catch (fileErr) {
            console.error("Failed to upload attachment:", fileErr);
          }
        }
      }

      setIsSubmitted(true);
      setTimeout(() => router.push("/tickets"), 3000);
    } catch (err) {
      console.error("Failed to create ticket:", err);
      const message = err instanceof Error ? err.message : "Failed to submit complaint. Please try again.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isSubmitted) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mb-6"
          >
            <Check className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold mb-2"
            style={{ color: "#3B4252" }}
          >
            Complaint Submitted Successfully
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 mb-2"
          >
            Your ticket number is
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg font-mono font-bold mb-6"
            style={{ color: "#3B4252" }}
          >
            {ticketId}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-gray-400"
          >
            Redirecting to tickets page...
          </motion.p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/tickets"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "#3B4252" }} />
          </Link>
          <PageHeader title="Create Complaint" />
        </div>

        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isActive
                          ? "text-white"
                          : "bg-gray-100 text-gray-400"
                    )}
                    style={
                      isActive ? { backgroundColor: "#3B4252" } : undefined
                    }
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs mt-2 font-medium transition-colors",
                      isActive ? "font-bold" : "text-gray-400"
                    )}
                    style={isActive ? { color: "#3B4252" } : undefined}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2 rounded transition-colors duration-300 mt-[-18px]",
                      currentStep > step.id ? "bg-emerald-500" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div
          className="rounded-xl border bg-white p-6"
          style={{ borderColor: "#D8DDE3" }}
        >
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="step1" {...fadeIn} className="space-y-6">
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "#3B4252" }}
                  >
                    Complaint Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a brief title for your complaint"
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: "#D8DDE3" }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "#3B4252" }}
                  >
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setSubCategory("");
                    }}
                    className="w-full px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: "#D8DDE3" }}
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {category && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.2 }}
                  >
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "#3B4252" }}
                    >
                      Sub-Category
                    </label>
                    <select
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: "#D8DDE3" }}
                    >
                      <option value="">Select a sub-category</option>
                      {subCategories.map((sc) => (
                        <option key={sc} value={sc}>
                          {sc}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}

                <div>
                  <label
                    className="block text-sm font-semibold mb-3"
                    style={{ color: "#3B4252" }}
                  >
                    Priority Level
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {priorityOptions.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setPriority(p.value)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all",
                          priority === p.value
                            ? "border-current shadow-sm"
                            : "border-gray-100 hover:border-gray-200"
                        )}
                        style={
                          priority === p.value
                            ? {
                                borderColor: "#3B4252",
                                backgroundColor: "#F4F6F8",
                              }
                            : undefined
                        }
                      >
                        <div
                          className={cn("w-3 h-3 rounded-full", p.color)}
                        />
                        <span
                          className="text-sm font-medium"
                          style={{ color: "#3B4252" }}
                        >
                          {p.value}
                        </span>
                        {priority === p.value && (
                          <Check
                            className="w-4 h-4 ml-auto"
                            style={{ color: "#3B4252" }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" {...fadeIn} className="space-y-6">
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "#3B4252" }}
                  >
                    Complaint Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    placeholder="Provide a detailed description of your complaint..."
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all resize-none"
                    style={{ borderColor: "#D8DDE3" }}
                  />
                  <p className="text-xs mt-1 text-gray-400">
                    {description.length} characters
                  </p>
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "#3B4252" }}
                  >
                    Attachments
                  </label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
                      isDragging
                        ? "border-[#3B4252] bg-gray-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <Upload
                      className="w-10 h-10 mx-auto mb-3"
                      style={{ color: "#3B4252" }}
                    />
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#3B4252" }}
                    >
                      Drop files here or click to upload
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PDF, DOC, JPG, PNG up to 10MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg border"
                        style={{ borderColor: "#D8DDE3" }}
                      >
                        <File className="w-5 h-5 text-gray-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium truncate"
                            style={{ color: "#3B4252" }}
                          >
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step3" {...fadeIn}>
                <label
                  className="block text-sm font-semibold mb-4"
                  style={{ color: "#3B4252" }}
                >
                  Select Department
                </label>
                {loadingDepts ? (
                  <p className="text-sm text-gray-500">
                    Loading departments...
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {departments.map((dept) => (
                      <button
                        key={dept.id}
                        onClick={() => setSelectedDepartmentId(dept.id)}
                        className={cn(
                          "p-5 rounded-xl border-2 text-left transition-all",
                          selectedDepartmentId === dept.id
                            ? "shadow-md"
                            : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                        )}
                        style={
                          selectedDepartmentId === dept.id
                            ? {
                                borderColor: "#3B4252",
                                backgroundColor: "#F4F6F8",
                              }
                            : undefined
                        }
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              selectedDepartmentId === dept.id
                                ? "text-white"
                                : "bg-gray-100 text-gray-500"
                            )}
                            style={
                              selectedDepartmentId === dept.id
                                ? { backgroundColor: "#3B4252" }
                                : undefined
                            }
                          >
                            <Building2 className="w-5 h-5" />
                          </div>
                          {selectedDepartmentId === dept.id && (
                            <div className="ml-auto w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </div>
                        <p
                          className="font-semibold text-sm mb-1"
                          style={{ color: "#3B4252" }}
                        >
                          {dept.name}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div key="step4" {...fadeIn} className="space-y-6">
                <div
                  className="text-center pb-4 border-b"
                  style={{ borderColor: "#D8DDE3" }}
                >
                  <p className="text-sm text-gray-400 mb-1">Ticket Number</p>
                  <p
                    className="text-xl font-mono font-bold"
                    style={{ color: "#3B4252" }}
                  >
                    Will be generated on submit
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-500">Title</span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#3B4252" }}
                    >
                      {title}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-500">Category</span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#3B4252" }}
                    >
                      {selectedCategoryData?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-500">Sub-Category</span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#3B4252" }}
                    >
                      {subCategory}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-500">Priority</span>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2.5 h-2.5 rounded-full",
                          priorityOptions.find((p) => p.value === priority)
                            ?.color
                        )}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#3B4252" }}
                      >
                        {priority}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-500">Department</span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#3B4252" }}
                    >
                      {selectedDepartment?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-500">Attachments</span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#3B4252" }}
                    >
                      {files.length} file{files.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div
                  className="pt-4 border-t"
                  style={{ borderColor: "#D8DDE3" }}
                >
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <p
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: "#3B4252" }}
                  >
                    {description}
                  </p>
                </div>

                {files.length > 0 && (
                  <div
                    className="pt-4 border-t"
                    style={{ borderColor: "#D8DDE3" }}
                  >
                    <p className="text-sm text-gray-500 mb-2">
                      Attached Files
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {files.map((file, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100"
                          style={{ color: "#3B4252" }}
                        >
                          <File className="w-3 h-3" />
                          {file.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between mt-6">
          {submitError && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {submitError}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          {currentStep > 1 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors hover:bg-gray-50"
              style={{ borderColor: "#D8DDE3", color: "#3B4252" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all",
                canProceed()
                  ? "hover:opacity-90 shadow-sm"
                  : "opacity-50 cursor-not-allowed"
              )}
              style={{ backgroundColor: "#3B4252" }}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90 shadow-sm transition-all disabled:opacity-50"
              style={{ backgroundColor: "#3B4252" }}
            >
              {submitting ? "Submitting..." : "Submit Complaint"}
              {!submitting && <Send className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
