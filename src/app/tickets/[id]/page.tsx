"use client";

import { useState, useEffect, useRef } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import {
  getTicketById,
  getTicketComments,
  addTicketComment,
  updateTicketStatus,
  getTicketHistory,
  getTicketAttachments,
  uploadAttachment,
  getDepartments,
  getCurrentUser,
} from "@/lib/api";
import {
  formatDate,
  formatDateTime,
  getStatusColor,
  getPriorityColor,
  cn,
} from "@/lib/utils";
import {
  ArrowLeft,
  Clock,
  User,
  Paperclip,
  MessageSquare,
  Send,
  AlertTriangle,
  CheckCircle,
  FileText,
  Download,
  Upload,
  Edit,
  UserPlus,
  ArrowUpRight,
  Loader2,
  History,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"activity" | "comments">(
    "comments"
  );
  const [newComment, setNewComment] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [
          ticketData,
          commentsData,
          historyData,
          attachmentsData,
          departmentsData,
          user,
        ] = await Promise.all([
          getTicketById(ticketId),
          getTicketComments(ticketId),
          getTicketHistory(ticketId),
          getTicketAttachments(ticketId),
          getDepartments(),
          getCurrentUser(),
        ]);
        setTicket(ticketData);
        setComments(commentsData);
        setHistory(historyData);
        setAttachments(attachmentsData);
        setDepartments(departmentsData);
        setCurrentUser(user);
      } catch (err: any) {
        setError(err.message || "Failed to load ticket");
      } finally {
        setLoading(false);
      }
    }
    if (ticketId) fetchData();
  }, [ticketId]);

  const departmentName = ticket?.departments?.name || "Unknown";
  const creatorName =
    ticket?.creator?.full_name || ticket?.creator?.email || "Unknown";
  const assigneeName =
    ticket?.assignee?.full_name || ticket?.assignee?.email || "Unassigned";

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUser || submittingComment) return;
    try {
      setSubmittingComment(true);
      await addTicketComment(
        ticketId,
        currentUser.id,
        newComment.trim(),
        isInternalNote
      );
      setNewComment("");
      const updatedComments = await getTicketComments(ticketId);
      setComments(updatedComments);
    } catch (err: any) {
      console.error("Failed to add comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!currentUser || updatingStatus) return;
    try {
      setUpdatingStatus(true);
      await updateTicketStatus(ticketId, newStatus, currentUser.id);
      const updatedTicket = await getTicketById(ticketId);
      setTicket(updatedTicket);
      const updatedHistory = await getTicketHistory(ticketId);
      setHistory(updatedHistory);
    } catch (err: any) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    try {
      setUploading(true);
      await uploadAttachment(ticketId, file, currentUser.id);
      const updatedAttachments = await getTicketAttachments(ticketId);
      setAttachments(updatedAttachments);
    } catch (err: any) {
      console.error("Failed to upload attachment:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen" style={{ backgroundColor: "#F4F6F8" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-center py-24">
              <Loader2
                className="w-8 h-8 animate-spin"
                style={{ color: "#3B4252" }}
              />
              <span
                className="ml-3 text-lg font-medium"
                style={{ color: "#3B4252" }}
              >
                Loading ticket...
              </span>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !ticket) {
    return (
      <MainLayout>
        <div className="min-h-screen" style={{ backgroundColor: "#F4F6F8" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link
              href="/tickets"
              className="inline-flex items-center gap-2 text-sm font-medium mb-4 transition-colors"
              style={{ color: "#3B4252" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tickets
            </Link>
            <div className="text-center py-24">
              <AlertTriangle
                className="w-12 h-12 mx-auto mb-4"
                style={{ color: "#DC2626" }}
              />
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: "#3B4252" }}
              >
                Ticket not found
              </h2>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                {error || "The ticket you're looking for doesn't exist."}
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: "#F4F6F8" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/tickets"
            className="inline-flex items-center gap-2 text-sm font-medium mb-4 transition-colors"
            style={{ color: "#3B4252" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tickets
          </Link>

          <PageHeader
            title={`Ticket ${ticket.ticket_number || ticket.id}`}
            description={ticket.title}
            actions={
              <div className="flex gap-2 items-center">
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors border appearance-none cursor-pointer"
                  style={{
                    borderColor: "#D8DDE3",
                    color: "#3B4252",
                    backgroundColor: "white",
                  }}
                >
                  <option value="Open">Open</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending User Response">
                    Pending User Response
                  </option>
                  <option value="Escalated">Escalated</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
                {updatingStatus && (
                  <Loader2
                    className="w-4 h-4 animate-spin"
                    style={{ color: "#3B4252" }}
                  />
                )}
                <button
                  onClick={() => handleStatusChange("Assigned")}
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50"
                  style={{
                    borderColor: "#D8DDE3",
                    color: "#3B4252",
                  }}
                >
                  <UserPlus className="w-4 h-4" />
                  Assign
                </button>
                <button
                  onClick={() => handleStatusChange("Escalated")}
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50"
                  style={{
                    borderColor: "#D8DDE3",
                    color: "#3B4252",
                  }}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Escalate
                </button>
              </div>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border p-6"
                style={{
                  backgroundColor: "white",
                  borderColor: "#D8DDE3",
                }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2
                      className="text-xl font-semibold"
                      style={{ color: "#3B4252" }}
                    >
                      {ticket.title}
                    </h2>
                    <p
                      className="text-sm mt-1"
                      style={{ color: "#6B7280" }}
                    >
                      {ticket.ticket_number} • Created{" "}
                      {formatDateTime(new Date(ticket.created_at))}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-full",
                        getStatusColor(ticket.status)
                      )}
                    >
                      {ticket.status?.replace(/_/g, " ")}
                    </span>
                    <span
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-full",
                        getPriorityColor(ticket.priority)
                      )}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                </div>

                <div
                  className="prose prose-sm max-w-none mb-6"
                  style={{ color: "#3B4252" }}
                >
                  <p>{ticket.description}</p>
                </div>

                <div
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4"
                  style={{ borderTop: "1px solid #E5E7EB" }}
                >
                  <div>
                    <p
                      className="text-xs font-medium uppercase tracking-wide mb-1"
                      style={{ color: "#6B7280" }}
                    >
                      Category
                    </p>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#3B4252" }}
                    >
                      {ticket.category}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs font-medium uppercase tracking-wide mb-1"
                      style={{ color: "#6B7280" }}
                    >
                      Sub-Category
                    </p>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#3B4252" }}
                    >
                      {ticket.sub_category || "—"}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs font-medium uppercase tracking-wide mb-1"
                      style={{ color: "#6B7280" }}
                    >
                      Department
                    </p>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#3B4252" }}
                    >
                      {departmentName}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs font-medium uppercase tracking-wide mb-1"
                      style={{ color: "#6B7280" }}
                    >
                      Created By
                    </p>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#3B4252" }}
                    >
                      {creatorName}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs font-medium uppercase tracking-wide mb-1"
                      style={{ color: "#6B7280" }}
                    >
                      Assigned To
                    </p>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#3B4252" }}
                    >
                      {assigneeName}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs font-medium uppercase tracking-wide mb-1"
                      style={{ color: "#6B7280" }}
                    >
                      Priority
                    </p>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#3B4252" }}
                    >
                      {ticket.priority}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs font-medium uppercase tracking-wide mb-1"
                      style={{ color: "#6B7280" }}
                    >
                      Created
                    </p>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#3B4252" }}
                    >
                      {formatDate(new Date(ticket.created_at))}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs font-medium uppercase tracking-wide mb-1"
                      style={{ color: "#6B7280" }}
                    >
                      Updated
                    </p>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#3B4252" }}
                    >
                      {formatDate(new Date(ticket.updated_at))}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="rounded-xl border"
                style={{
                  backgroundColor: "white",
                  borderColor: "#D8DDE3",
                }}
              >
                <div
                  className="flex border-b"
                  style={{ borderColor: "#D8DDE3" }}
                >
                  <button
                    onClick={() => setActiveTab("comments")}
                    className={cn(
                      "flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                      activeTab === "comments"
                        ? "border-b-2"
                        : "hover:bg-gray-50"
                    )}
                    style={{
                      color: activeTab === "comments" ? "#3B4252" : "#6B7280",
                      borderColor:
                        activeTab === "comments" ? "#3B4252" : "transparent",
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Comments ({comments.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={cn(
                      "flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                      activeTab === "activity"
                        ? "border-b-2"
                        : "hover:bg-gray-50"
                    )}
                    style={{
                      color: activeTab === "activity" ? "#3B4252" : "#6B7280",
                      borderColor:
                        activeTab === "activity" ? "#3B4252" : "transparent",
                    }}
                  >
                    <History className="w-4 h-4" />
                    Activity ({history.length})
                  </button>
                </div>

                {activeTab === "comments" && (
                  <div
                    className="p-4"
                    style={{ maxHeight: "500px", overflowY: "auto" }}
                  >
                    <div className="space-y-4">
                      {comments.length === 0 ? (
                        <p
                          className="text-sm text-center py-8"
                          style={{ color: "#6B7280" }}
                        >
                          No comments yet. Be the first to comment.
                        </p>
                      ) : (
                        comments.map((comment: any) => {
                          const userName =
                            comment.users?.full_name || "Unknown";
                          const initials = userName
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2);

                          return (
                            <div
                              key={comment.id}
                              className={cn(
                                "flex gap-3",
                                comment.is_internal && "opacity-80"
                              )}
                            >
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                                style={{
                                  backgroundColor: comment.is_internal
                                    ? "#FEF3C7"
                                    : "#E5E7EB",
                                  color: comment.is_internal
                                    ? "#92400E"
                                    : "#3B4252",
                                }}
                              >
                                {initials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className="text-sm font-medium"
                                    style={{ color: "#3B4252" }}
                                  >
                                    {userName}
                                  </span>
                                  {comment.is_internal && (
                                    <span
                                      className="px-2 py-0.5 text-xs font-medium rounded"
                                      style={{
                                        backgroundColor: "#FEF3C7",
                                        color: "#92400E",
                                      }}
                                    >
                                      Internal Note
                                    </span>
                                  )}
                                  <span
                                    className="text-xs"
                                    style={{ color: "#6B7280" }}
                                  >
                                    {formatDateTime(
                                      new Date(comment.created_at)
                                    )}
                                  </span>
                                </div>
                                <div
                                  className="rounded-lg p-3 text-sm"
                                  style={{
                                    backgroundColor: comment.is_internal
                                      ? "#FFFBEB"
                                      : "#F9FAFB",
                                    color: "#3B4252",
                                  }}
                                >
                                  {comment.content}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "activity" && (
                  <div
                    className="p-4"
                    style={{ maxHeight: "500px", overflowY: "auto" }}
                  >
                    <div className="space-y-3">
                      {history.length === 0 ? (
                        <p
                          className="text-sm text-center py-8"
                          style={{ color: "#6B7280" }}
                        >
                          No activity recorded yet.
                        </p>
                      ) : (
                        history.map((entry: any) => {
                          const userName =
                            entry.users?.full_name || "System";
                          return (
                            <div
                              key={entry.id}
                              className="flex gap-3 items-start"
                            >
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                  backgroundColor: "#F4F6F8",
                                  color: "#3B4252",
                                }}
                              >
                                <History className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-sm"
                                  style={{ color: "#3B4252" }}
                                >
                                  <span className="font-medium">
                                    {userName}
                                  </span>{" "}
                                  {entry.notes ||
                                    `Changed status from ${
                                      entry.old_status || "—"
                                    } to ${entry.new_status}`}
                                </p>
                                <p
                                  className="text-xs mt-0.5"
                                  style={{ color: "#6B7280" }}
                                >
                                  {formatDateTime(
                                    new Date(entry.created_at)
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                <div
                  className="p-4 border-t"
                  style={{ borderColor: "#D8DDE3" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={(e) =>
                          setIsInternalNote(e.target.checked)
                        }
                        className="w-4 h-4 rounded"
                        style={{ accentColor: "#3B4252" }}
                      />
                      <span
                        className="text-sm"
                        style={{ color: "#6B7280" }}
                      >
                        Internal note
                      </span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        borderColor: "#D8DDE3",
                        color: "#3B4252",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmitComment();
                        }
                      }}
                    />
                    <button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || submittingComment}
                      className="px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                      style={{
                        backgroundColor: "#3B4252",
                        color: "white",
                      }}
                    >
                      {submittingComment ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="rounded-xl border p-6"
                style={{
                  backgroundColor: "white",
                  borderColor: "#D8DDE3",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: "#3B4252" }}
                  >
                    Attachments
                  </h3>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                    style={{
                      backgroundColor: "#F4F6F8",
                      color: "#3B4252",
                    }}
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                <div className="space-y-3">
                  {attachments.length === 0 ? (
                    <div className="text-center py-8">
                      <Paperclip
                        className="w-10 h-10 mx-auto mb-3"
                        style={{ color: "#D8DDE3" }}
                      />
                      <p
                        className="text-sm font-medium"
                        style={{ color: "#6B7280" }}
                      >
                        No attachments yet
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "#9CA3AF" }}
                      >
                        Upload files to attach them to this ticket
                      </p>
                    </div>
                  ) : (
                    attachments.map((att: any) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-3 p-3 rounded-lg border"
                        style={{
                          backgroundColor: "#F9FAFB",
                          borderColor: "#E5E7EB",
                        }}
                      >
                        <FileText
                          className="w-8 h-8 flex-shrink-0"
                          style={{ color: "#3B4252" }}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium truncate"
                            style={{ color: "#3B4252" }}
                          >
                            {att.file_name}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "#6B7280" }}
                          >
                            {att.file_type} •{" "}
                            {(att.file_size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <a
                          href={att.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                          style={{ color: "#3B4252" }}
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="rounded-xl border p-6"
                style={{
                  backgroundColor: "white",
                  borderColor: "#D8DDE3",
                }}
              >
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: "#3B4252" }}
                >
                  SLA Countdown
                </h3>
                <div className="text-center py-4">
                  <div
                    className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4"
                    style={{
                      backgroundColor: ticket.sla_breached ? "#FEF2F2" : "#F0FDF4",
                      border: `3px solid ${ticket.sla_breached ? "#DC2626" : "#22C55E"}`,
                    }}
                  >
                    <div>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: ticket.sla_breached ? "#DC2626" : "#22C55E" }}
                      >
                        {ticket.sla_deadline
                          ? (() => {
                              const diff = new Date(ticket.sla_deadline).getTime() - Date.now();
                              if (diff <= 0) return "0:00";
                              const hrs = Math.floor(diff / 3600000);
                              const mins = Math.floor((diff % 3600000) / 60000);
                              return `${hrs}:${mins.toString().padStart(2, "0")}`;
                            })()
                          : "—"}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: ticket.sla_breached ? "#DC2626" : "#22C55E" }}
                      >
                        hours
                      </p>
                    </div>
                  </div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "#3B4252" }}
                  >
                    Response SLA
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "#6B7280" }}
                  >
                    {ticket.sla_deadline
                      ? `Due by ${new Date(ticket.sla_deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at ${new Date(ticket.sla_deadline).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
                      : "No SLA deadline set"}
                  </p>
                </div>
                {ticket.sla_deadline && (
                  <div
                    className="mt-4 p-3 rounded-lg"
                    style={{ backgroundColor: ticket.sla_breached ? "#FEF2F2" : "#F0FDF4" }}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className="w-4 h-4"
                        style={{ color: ticket.sla_breached ? "#DC2626" : "#22C55E" }}
                      />
                      <p
                        className="text-sm font-medium"
                        style={{ color: ticket.sla_breached ? "#DC2626" : "#22C55E" }}
                      >
                        {ticket.sla_breached ? "SLA breached" : "SLA on track"}
                      </p>
                    </div>
                    <p
                      className="text-xs mt-1"
                      style={{ color: ticket.sla_breached ? "#991B1B" : "#166534" }}
                    >
                      {ticket.sla_breached
                        ? "This ticket has exceeded its SLA deadline"
                        : "This ticket is within its SLA deadline"}
                    </p>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="rounded-xl border p-6"
                style={{
                  backgroundColor: "white",
                  borderColor: "#D8DDE3",
                }}
              >
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: "#3B4252" }}
                >
                  Ticket Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm"
                      style={{ color: "#6B7280" }}
                    >
                      Status
                    </span>
                    <span
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        getStatusColor(ticket.status)
                      )}
                    >
                      {ticket.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm"
                      style={{ color: "#6B7280" }}
                    >
                      Priority
                    </span>
                    <span
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        getPriorityColor(ticket.priority)
                      )}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                  <div
                    className="pt-4"
                    style={{ borderTop: "1px solid #E5E7EB" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock
                        className="w-4 h-4"
                        style={{ color: "#6B7280" }}
                      />
                      <span
                        className="text-sm"
                        style={{ color: "#6B7280" }}
                      >
                        Timeline
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span style={{ color: "#6B7280" }}>Created</span>
                        <span
                          className="font-medium"
                          style={{ color: "#3B4252" }}
                        >
                          {formatDate(new Date(ticket.created_at))}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: "#6B7280" }}>Updated</span>
                        <span
                          className="font-medium"
                          style={{ color: "#3B4252" }}
                        >
                          {formatDate(new Date(ticket.updated_at))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="rounded-xl border p-6"
                style={{
                  backgroundColor: "white",
                  borderColor: "#D8DDE3",
                }}
              >
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: "#3B4252" }}
                >
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleStatusChange("Closed")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left"
                    style={{
                      backgroundColor: "#F4F6F8",
                      color: "#3B4252",
                    }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Close Ticket
                  </button>
                  <button
                    onClick={() => handleStatusChange("Escalated")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left"
                    style={{
                      backgroundColor: "#F4F6F8",
                      color: "#3B4252",
                    }}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Escalate
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="rounded-xl border p-6"
                style={{
                  backgroundColor: "white",
                  borderColor: "#D8DDE3",
                }}
              >
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: "#3B4252" }}
                >
                  Related Tickets
                </h3>
                <div className="space-y-3">
                  <div className="text-center py-6">
                    <p
                      className="text-sm"
                      style={{ color: "#6B7280" }}
                    >
                      No related tickets
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
