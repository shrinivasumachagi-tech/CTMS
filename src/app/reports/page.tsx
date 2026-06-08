"use client";

import { useState, useEffect, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import {
  BarChart3,
  Download,
  FileText,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
  Filter,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { getTickets, getDepartments } from "@/lib/api";
import {
  exportTicketsPDF,
  exportTicketsCSV,
  exportTicketsExcel,
} from "@/lib/export";

interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  category: string | null;
  priority: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
  department_id: string | null;
  sla_breached: boolean;
  departments: { name: string } | null;
  creator: { full_name: string } | null;
  assignee: { full_name: string } | null;
}

interface Department {
  id: string;
  name: string;
}

const reportTypes = [
  {
    id: "complaint-volume",
    title: "Complaint Volume",
    description: "Track complaint trends over time",
    icon: BarChart3,
    color: "bg-blue-500",
  },
  {
    id: "department-performance",
    title: "Department Performance",
    description: "Compare department metrics",
    icon: TrendingUp,
    color: "bg-green-500",
  },
  {
    id: "resolution-time",
    title: "Resolution Time",
    description: "Analyze average resolution times",
    icon: Clock,
    color: "bg-purple-500",
  },
  {
    id: "employee-performance",
    title: "Employee Performance",
    description: "Individual employee metrics",
    icon: Users,
    color: "bg-orange-500",
  },
  {
    id: "escalation",
    title: "Escalation Report",
    description: "View escalation patterns",
    icon: AlertTriangle,
    color: "bg-red-500",
  },
  {
    id: "sla-compliance",
    title: "SLA Compliance",
    description: "Monitor SLA adherence rates",
    icon: CheckCircle,
    color: "bg-teal-500",
  },
  {
    id: "customer-satisfaction",
    title: "Customer Satisfaction",
    description: "CSAT and feedback analysis",
    icon: Star,
    color: "bg-yellow-500",
  },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportGenerated, setReportGenerated] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [ticketsData, departmentsData] = await Promise.all([
          getTickets(),
          getDepartments(),
        ]);
        setTickets(ticketsData as Ticket[]);
        setDepartments(departmentsData as Department[]);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredTickets = useMemo(() => {
    let result = tickets;
    if (startDate) {
      result = result.filter((t) => t.created_at >= startDate);
    }
    if (endDate) {
      const end = endDate + "T23:59:59.999Z";
      result = result.filter((t) => t.created_at <= end);
    }
    return result;
  }, [tickets, startDate, endDate]);

  function handleGenerateReport() {
    setReportGenerated(true);
  }

  function handleExportPDF() {
    const reportName = selectedReport
      ? `CTMS-${selectedReport}-${new Date().toISOString().split("T")[0]}`
      : `CTMS-report-${new Date().toISOString().split("T")[0]}`;
    exportTicketsPDF(filteredTickets, reportName);
  }

  function handleExportExcel() {
    const reportName = selectedReport
      ? `CTMS-${selectedReport}-${new Date().toISOString().split("T")[0]}`
      : `CTMS-report-${new Date().toISOString().split("T")[0]}`;
    exportTicketsExcel(filteredTickets, reportName);
  }

  function handleExportCSV() {
    const reportName = selectedReport
      ? `CTMS-${selectedReport}-${new Date().toISOString().split("T")[0]}`
      : `CTMS-report-${new Date().toISOString().split("T")[0]}`;
    exportTicketsCSV(filteredTickets, reportName);
  }

  const reportData = useMemo(() => {
    if (!reportGenerated || !selectedReport) return null;

    switch (selectedReport) {
      case "complaint-volume": {
        const grouped: Record<string, number> = {};
        filteredTickets.forEach((t) => {
          const month = t.created_at.substring(0, 7);
          grouped[month] = (grouped[month] || 0) + 1;
        });
        const sorted = Object.entries(grouped).sort(([a], [b]) =>
          a.localeCompare(b)
        );
        return {
          headers: ["Month", "Ticket Count"],
          rows: sorted.map(([month, count]) => [
            month,
            String(count),
          ]),
          summary: `Total tickets: ${filteredTickets.length}`,
        };
      }

      case "department-performance": {
        const deptMap: Record<
          string,
          { name: string; count: number; resolved: number; totalResolutionMs: number }
        > = {};
        filteredTickets.forEach((t) => {
          const deptId = t.department_id || "unassigned";
          const deptName = t.departments?.name || "Unassigned";
          if (!deptMap[deptId]) {
            deptMap[deptId] = {
              name: deptName,
              count: 0,
              resolved: 0,
              totalResolutionMs: 0,
            };
          }
          deptMap[deptId].count++;
          if (t.resolved_at) {
            deptMap[deptId].resolved++;
            deptMap[deptId].totalResolutionMs +=
              new Date(t.resolved_at).getTime() - new Date(t.created_at).getTime();
          }
        });
        return {
          headers: ["Department", "Total Tickets", "Resolved", "Avg Resolution Time"],
          rows: Object.values(deptMap).map((d) => [
            d.name,
            String(d.count),
            String(d.resolved),
            d.resolved > 0
              ? `${Math.round(d.totalResolutionMs / d.resolved / 3600000)}h`
              : "N/A",
          ]),
          summary: `Departments: ${Object.keys(deptMap).length}`,
        };
      }

      case "resolution-time": {
        const priorityBuckets: Record<
          string,
          { count: number; totalMs: number }
        > = {};
        filteredTickets.forEach((t) => {
          if (t.resolved_at) {
            const p = t.priority || "unknown";
            if (!priorityBuckets[p]) priorityBuckets[p] = { count: 0, totalMs: 0 };
            priorityBuckets[p].count++;
            priorityBuckets[p].totalMs +=
              new Date(t.resolved_at).getTime() - new Date(t.created_at).getTime();
          }
        });
        return {
          headers: ["Priority", "Resolved Count", "Avg Resolution Time"],
          rows: Object.entries(priorityBuckets).map(([p, d]) => [
            p,
            String(d.count),
            `${Math.round(d.totalMs / d.count / 3600000)}h`,
          ]),
          summary: `Priorities tracked: ${Object.keys(priorityBuckets).length}`,
        };
      }

      case "employee-performance": {
        const empMap: Record<string, { name: string; assigned: number; resolved: number }> = {};
        filteredTickets.forEach((t) => {
          const name = t.assignee?.full_name || "Unassigned";
          if (!empMap[name]) empMap[name] = { name, assigned: 0, resolved: 0 };
          empMap[name].assigned++;
          if (t.status === "Resolved" || t.status === "Closed") empMap[name].resolved++;
        });
        const sorted = Object.values(empMap).sort((a, b) => b.assigned - a.assigned);
        return {
          headers: ["Employee", "Assigned Tickets", "Resolved"],
          rows: sorted.map((e) => [e.name, String(e.assigned), String(e.resolved)]),
          summary: `Employees: ${sorted.length}`,
        };
      }

      case "escalation": {
        const escalated = filteredTickets.filter(
          (t) => t.status === "Escalated"
        );
        return {
          headers: ["Ticket #", "Title", "Department", "Priority", "Created At"],
          rows: escalated.map((t) => [
            t.ticket_number,
            t.title,
            t.departments?.name || "N/A",
            t.priority,
            new Date(t.created_at).toLocaleDateString(),
          ]),
          summary: `Escalated: ${escalated.length} of ${filteredTickets.length} total`,
        };
      }

      case "sla-compliance": {
        const total = filteredTickets.length;
        const breached = filteredTickets.filter((t) => t.sla_breached).length;
        const complianceRate =
          total > 0 ? (((total - breached) / total) * 100).toFixed(1) : "100";
        return {
          headers: ["Metric", "Value"],
          rows: [
            ["Total Tickets", String(total)],
            ["SLA Breached", String(breached)],
            ["Within SLA", String(total - breached)],
            ["Compliance Rate", `${complianceRate}%`],
          ],
          summary: `Overall compliance: ${complianceRate}%`,
        };
      }

      case "customer-satisfaction": {
        return {
          headers: ["Metric", "Value"],
          rows: [
            ["Average Rating", "N/A (No feedback data)"],
            ["Total Responses", "0"],
            ["CSAT Score", "N/A"],
          ],
          summary: "Customer satisfaction data is not yet available",
        };
      }

      default:
        return null;
    }
  }, [selectedReport, filteredTickets, reportGenerated]);

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader title="Reports & Analytics" />
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            disabled={loading || filteredTickets.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D8DDE3] rounded-lg text-[#3B4252] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={handleExportExcel}
            disabled={loading || filteredTickets.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D8DDE3] rounded-lg text-[#3B4252] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={handleExportCSV}
            disabled={loading || filteredTickets.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D8DDE3] rounded-lg text-[#3B4252] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#3B4252] mb-1">
              From Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D8DDE3] rounded-lg focus:outline-none focus:border-[#3B4252] transition-colors"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#3B4252] mb-1">
              To Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D8DDE3] rounded-lg focus:outline-none focus:border-[#3B4252] transition-colors"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={!selectedReport || loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#3B4252] text-white rounded-lg hover:bg-[#2D3444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Filter className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#3B4252] animate-spin mr-3" />
          <span className="text-[#3B4252] font-medium">Loading data...</span>
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {reportTypes.map((report, index) => {
              const Icon = report.icon;
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedReport(report.id)}
                  className={`bg-white rounded-lg border p-5 cursor-pointer transition-all hover:shadow-md ${
                    selectedReport === report.id
                      ? "border-[#3B4252] ring-2 ring-[#3B4252]/20"
                      : "border-[#D8DDE3]"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 ${report.color} rounded-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-[#3B4252]">
                      {report.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500">{report.description}</p>
                </motion.div>
              );
            })}
          </div>

          {selectedReport && reportGenerated && reportData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-[#D8DDE3] p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#3B4252]">
                    {reportTypes.find((r) => r.id === selectedReport)?.title}{" "}
                    Report
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {reportData.summary}
                  </p>
                </div>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-[#3B4252] text-white rounded-lg hover:bg-[#2D3444] transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Export Report
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#D8DDE3]">
                      {reportData.headers.map((h) => (
                        <th
                          key={h}
                          className="text-left py-3 px-4 font-semibold text-[#3B4252] bg-[#F4F6F8]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={reportData.headers.length}
                          className="text-center py-8 text-gray-500"
                        >
                          No data available for the selected filters
                        </td>
                      </tr>
                    ) : (
                      reportData.rows.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-[#D8DDE3] hover:bg-[#F4F6F8] transition-colors"
                        >
                          {row.map((cell, j) => (
                            <td key={j} className="py-3 px-4 text-[#3B4252]">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {selectedReport && !reportGenerated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-[#D8DDE3] p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#3B4252]">
                  {reportTypes.find((r) => r.id === selectedReport)?.title}{" "}
                  Preview
                </h2>
              </div>
              <div className="h-64 bg-[#F4F6F8] rounded-lg flex items-center justify-center border border-[#D8DDE3]">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-[#3B4252]/30 mx-auto mb-2" />
                  <p className="text-gray-500">
                    Select a date range and click Generate Report to view data
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </MainLayout>
  );
}
