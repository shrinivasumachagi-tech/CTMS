"use client";

import { useState, useMemo, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import { getTickets, getDepartments } from "@/lib/api";
import { formatDate, getStatusColor, getPriorityColor, cn } from "@/lib/utils";
import {
  Search,
  Filter,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const ITEMS_PER_PAGE = 5;

const STATUSES = ["All", "Open", "Assigned", "In Progress", "Pending User Response", "Escalated", "Resolved", "Closed"];
const PRIORITIES = ["All", "Low", "Medium", "High", "Critical"];

export default function TicketsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [tickets, setTickets] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ticketsData, departmentsData] = await Promise.all([
          getTickets(),
          getDepartments(),
        ]);
        setTickets(ticketsData || []);
        setDepartments(departmentsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getDepartmentName = (departmentId: string | null) => {
    if (!departmentId) return "—";
    const dept = departments.find((d) => d.id === departmentId);
    return dept?.name || "—";
  };

  const mappedTickets = useMemo(() => {
    return tickets.map((ticket: any) => ({
      id: ticket.id,
      ticketNumber: ticket.ticket_number,
      title: ticket.title,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status
        ? ticket.status.charAt(0).toUpperCase() +
          ticket.status.slice(1).replace(/_/g, " ")
        : "",
      department: getDepartmentName(ticket.department_id),
      departmentId: ticket.department_id,
      assignedTo: ticket.assignee?.full_name || null,
      createdAt: ticket.created_at,
    }));
  }, [tickets, departments]);

  const DEPARTMENTS = useMemo(() => {
    const deptNames = departments.map((d) => d.name);
    return ["All", ...deptNames];
  }, [departments]);

  const filteredTickets = useMemo(() => {
    return mappedTickets.filter((ticket) => {
      const matchesSearch =
        search === "" ||
        ticket.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
        ticket.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || ticket.priority === priorityFilter;
      const matchesDepartment = departmentFilter === "All" || ticket.department === departmentFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
    });
  }, [search, statusFilter, priorityFilter, departmentFilter, mappedTickets]);

  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PageHeader
          title="Tickets"
          actions={
            <Link
              href="/tickets/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B4252] text-white rounded-lg hover:bg-[#2E3440] transition-colors font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              Create Complaint
            </Link>
          }
        />

        <div className="bg-white border border-[#D8DDE3] rounded-xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-[#D8DDE3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4252] focus:border-transparent bg-[#F4F6F8]"
              />
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[#6B7280]" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-[#D8DDE3] rounded-lg text-sm bg-[#F4F6F8] focus:outline-none focus:ring-2 focus:ring-[#3B4252] focus:border-transparent"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "All Statuses" : s}
                  </option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-[#D8DDE3] rounded-lg text-sm bg-[#F4F6F8] focus:outline-none focus:ring-2 focus:ring-[#3B4252] focus:border-transparent"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p === "All" ? "All Priorities" : p}
                  </option>
                ))}
              </select>

              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-[#D8DDE3] rounded-lg text-sm bg-[#F4F6F8] focus:outline-none focus:ring-2 focus:ring-[#3B4252] focus:border-transparent"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d === "All" ? "All Departments" : d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white border border-[#D8DDE3] rounded-xl">
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 bg-[#F4F6F8] rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Filter className="h-8 w-8 text-[#9CA3AF]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1F2937] mb-1">Loading tickets...</h3>
              <p className="text-sm text-[#6B7280] text-center max-w-sm">
                Please wait while we fetch the latest tickets.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#D8DDE3] rounded-xl overflow-hidden">
            {paginatedTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 bg-[#F4F6F8] rounded-full flex items-center justify-center mb-4">
                  <Filter className="h-8 w-8 text-[#9CA3AF]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1F2937] mb-1">No tickets found</h3>
                <p className="text-sm text-[#6B7280] text-center max-w-sm">
                  No tickets match your current filters. Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#D8DDE3] bg-[#F4F6F8]">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Ticket #
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Title
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Category
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Department
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Assigned To
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Created
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8DDE3]">
                      {paginatedTickets.map((ticket, index) => (
                        <motion.tr
                          key={ticket.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className="hover:bg-[#F4F6F8] transition-colors"
                        >
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-[#3B4252]">
                              {ticket.ticketNumber}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-[#1F2937] line-clamp-1 max-w-[200px] block">
                              {ticket.title}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-[#6B7280]">{ticket.category}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                getPriorityColor(ticket.priority)
                              )}
                            >
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                getStatusColor(ticket.status)
                              )}
                            >
                              {ticket.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-[#6B7280]">{ticket.department}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-[#6B7280]">
                              {ticket.assignedTo || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-[#6B7280]">
                              {formatDate(ticket.createdAt)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/tickets/${ticket.id}`}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-[#E5E7EB] transition-colors text-[#3B4252]"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-[#D8DDE3] bg-[#F4F6F8]">
                  <span className="text-sm text-[#6B7280]">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredTickets.length)} of{" "}
                    {filteredTickets.length} tickets
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-[#D8DDE3] bg-white hover:bg-[#F4F6F8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[#3B4252]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "inline-flex items-center justify-center h-8 w-8 rounded-lg text-sm font-medium transition-colors",
                          page === currentPage
                            ? "bg-[#3B4252] text-white"
                            : "border border-[#D8DDE3] bg-white hover:bg-[#F4F6F8] text-[#3B4252]"
                        )}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-[#D8DDE3] bg-white hover:bg-[#F4F6F8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[#3B4252]"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
}
