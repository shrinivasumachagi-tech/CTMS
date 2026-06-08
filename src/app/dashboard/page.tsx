"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import KPICard from "@/components/ui/KPICard";
import PageHeader from "@/components/ui/PageHeader";
import { getTickets, getDepartments } from "@/lib/api";
import { getStatusColor, getPriorityColor } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  TicketCheck,
  FolderOpen,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Timer,
  ArrowRight,
  Bell,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const tooltipStyle = { backgroundColor: "#fff", border: "1px solid #D8DDE3", borderRadius: "8px", fontSize: 13 };

function ChartTooltip({ active, payload, label, suffix }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string; suffix?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle} className="px-3 py-2 shadow-sm">
      {label && <p className="font-semibold text-[#1F2937] mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[#6B7280]">{entry.name}:</span>
          <span className="font-medium text-[#1F2937]">{entry.value}{suffix || ""}</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div style={tooltipStyle} className="px-3 py-2 shadow-sm">
      <div className="flex items-center gap-2 text-sm">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.payload.color }} />
        <span className="text-[#6B7280]">{entry.name}:</span>
        <span className="font-medium text-[#1F2937]">{entry.value} tickets</span>
      </div>
    </div>
  );
}

function SLAPieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div style={tooltipStyle} className="px-3 py-2 shadow-sm">
      <div className="flex items-center gap-2 text-sm">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.payload.color }} />
        <span className="text-[#6B7280]">{entry.name}:</span>
        <span className="font-medium text-[#1F2937]">{entry.value}%</span>
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

const STATUS_COLORS: Record<string, string> = {
  Open: "#3B82F6",
  "In Progress": "#F59E0B",
  Resolved: "#22C55E",
  Escalated: "#EF4444",
  Closed: "#6B7280",
  Assigned: "#8B5CF6",
  "Pending User Response": "#06B6D4",
};

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "#EF4444",
  High: "#F97316",
  Medium: "#F59E0B",
  Low: "#22C55E",
};

const PRIORITY_LABELS: Record<string, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  Critical: "Critical",
  High: "High",
  Medium: "Medium",
  Low: "Low",
};

function LoadingSkeleton() {
  return (
    <MainLayout>
      <PageHeader title="Dashboard" description="Overview of your support operations and key metrics" />
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#D8DDE3] p-6 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-200" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#D8DDE3] p-6 h-80 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-40 mb-6" />
            <div className="h-48 bg-gray-100 rounded" />
          </div>
          <div className="bg-white rounded-xl border border-[#D8DDE3] p-6 h-80 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-32 mb-6" />
            <div className="h-48 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#D8DDE3] p-6 h-80 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-48 mb-6" />
            <div className="h-56 bg-gray-100 rounded" />
          </div>
          <div className="bg-white rounded-xl border border-[#D8DDE3] p-6 h-80 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-44 mb-6" />
            <div className="h-56 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
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
        setTickets(ticketsData);
        setDepartments(departmentsData);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;

  const userName = user?.full_name || "User";
  const departmentName = departments.find((d: any) => d.id === user?.department_id)?.name || "";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === "Open").length;
  const inProgressCount = tickets.filter((t) => t.status === "In Progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "Resolved").length;
  const escalatedCount = tickets.filter((t) => t.status === "Escalated").length;
  const closedCount = tickets.filter((t) => t.status === "Closed").length;

  const slaBreachedCount = tickets.filter((t) => t.sla_breached).length;
  const slaCompliantCount = totalCount - slaBreachedCount;
  const slaCompliance = totalCount > 0 ? Math.round((slaCompliantCount / totalCount) * 100) : 100;

  const avgResolutionTime = (() => {
    const resolved = tickets.filter((t) => t.resolved_at);
    if (resolved.length === 0) return "N/A";
    const totalMs = resolved.reduce((sum, t) => {
      return sum + (new Date(t.resolved_at).getTime() - new Date(t.created_at).getTime());
    }, 0);
    const avgHours = Math.round(totalMs / resolved.length / 3600000);
    return avgHours < 1 ? "<1h" : `${avgHours}h`;
  })();

  const kpis = [
    { title: "Total Tickets", value: totalCount, icon: TicketCheck, color: "bg-[#3B4252]", trend: "All time", trendUp: true },
    { title: "Open", value: openCount, icon: FolderOpen, color: "bg-[#3B82F6]", trend: `${openCount} awaiting response`, trendUp: true },
    { title: "In Progress", value: inProgressCount, icon: Loader2, color: "bg-[#F59E0B]", trend: "Being worked on", trendUp: true },
    { title: "Resolved", value: resolvedCount, icon: CheckCircle2, color: "bg-[#22C55E]", trend: `${resolvedCount} completed`, trendUp: true },
    { title: "Escalated", value: escalatedCount, icon: AlertTriangle, color: "bg-[#EF4444]", trend: escalatedCount > 0 ? "Needs attention" : "None", trendUp: escalatedCount === 0 },
    { title: "SLA Compliance", value: `${slaCompliance}%`, icon: Clock, color: "bg-[#8B5CF6]", trend: slaCompliance >= 90 ? "On track" : "Below target", trendUp: slaCompliance >= 90 },
    { title: "Avg Resolution Time", value: avgResolutionTime, icon: Timer, color: "bg-[#06B6D4]", trend: `Across ${tickets.filter((t) => t.resolved_at).length} resolved tickets`, trendUp: true },
    { title: "Closed", value: closedCount, icon: CheckCircle2, color: "bg-[#6B7280]", trend: `${closedCount} resolved`, trendUp: true },
  ];

  const statusCounts: Record<string, number> = {};
  tickets.forEach((t) => {
    const s = t.status;
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });
  const statusDistribution = Object.entries(statusCounts).map(([key, count]) => ({
    name: key,
    value: count,
    color: STATUS_COLORS[key] || "#6B7280",
  }));

  const priorityCounts: Record<string, number> = {};
  tickets.forEach((t) => {
    const p = t.priority;
    priorityCounts[p] = (priorityCounts[p] || 0) + 1;
  });
  const priorityDistribution = Object.entries(priorityCounts).map(([key, count]) => ({
    name: PRIORITY_LABELS[key] || key,
    value: count,
    color: PRIORITY_COLORS[key] || "#6B7280",
  }));

  const departmentTicketCounts: Record<string, number> = {};
  tickets.forEach((t) => {
    if (t.department_id) {
      departmentTicketCounts[t.department_id] = (departmentTicketCounts[t.department_id] || 0) + 1;
    }
  });
  const departmentPerformance = departments.map((d) => ({
    name: d.name,
    tickets: departmentTicketCounts[d.id] || 0,
  }));

  const recentActivities = [...tickets]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)
    .map((ticket) => ({
      id: ticket.id,
      ticketNumber: ticket.ticket_number,
      title: ticket.title,
      status: ticket.status,
      priority: PRIORITY_LABELS[ticket.priority] || ticket.priority,
      updatedAt: ticket.updated_at,
      assignedTo: ticket.assignee?.full_name || null,
      department: ticket.departments?.name || "Unassigned",
    }));

  const slaData = [
    { name: "Compliant", value: slaCompliance, color: "#22C55E" },
    { name: "Breached", value: 100 - slaCompliance, color: "#EF4444" },
  ];

  return (
    <MainLayout>
      <motion.div variants={item} className="mb-0">
        <div className="bg-white rounded-xl border border-[#D8DDE3] p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1F2937]">Welcome back, {userName.split(" ")[0]} 👋</h1>
              <p className="text-[#6B7280] mt-1">
                {departmentName ? `${departmentName} Department` : "Your support dashboard"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <Calendar size={16} />
              <span>{today}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <PageHeader title="Dashboard" description="Overview of your support operations and key metrics" />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <motion.div key={kpi.title} variants={item}>
              <KPICard title={kpi.title} value={kpi.value} icon={kpi.icon} trend={kpi.trend} trendUp={kpi.trendUp} color={kpi.color} />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={item} className="lg:col-span-2 bg-white rounded-xl border border-[#D8DDE3] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#1F2937]">Ticket Status Distribution</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" /> Open</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> In Progress</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" /> Resolved</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Escalated</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#D8DDE3" }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#D8DDE3" }} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {statusDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div variants={item} className="bg-white rounded-xl border border-[#D8DDE3] p-6">
            <h3 className="text-lg font-semibold text-[#1F2937] mb-6">Status Overview</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {statusDistribution.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-[#6B7280]">{s.name}</span>
                  <span className="ml-auto font-medium text-[#1F2937]">{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={item} className="bg-white rounded-xl border border-[#D8DDE3] p-6">
            <h3 className="text-lg font-semibold text-[#1F2937] mb-6">Department Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentPerformance} layout="vertical" barCategoryGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#D8DDE3" }} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#D8DDE3" }} tickLine={false} width={100} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="tickets" fill="#3B4252" radius={[0, 4, 4, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div variants={item} className="bg-white rounded-xl border border-[#D8DDE3] p-6">
            <h3 className="text-lg font-semibold text-[#1F2937] mb-6">Priority Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityDistribution} barCategoryGap={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#D8DDE3" }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#D8DDE3" }} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {priorityDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={item} className="lg:col-span-2 bg-white rounded-xl border border-[#D8DDE3] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-[#1F2937]">Recent Activities</h3>
              <button className="text-sm text-[#3B4252] font-medium hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <p className="text-sm text-[#6B7280] text-center py-8">No recent activities</p>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-[#F4F6F8] transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[#F4F6F8] flex items-center justify-center shrink-0 mt-0.5">
                      <Bell size={16} className="text-[#3B4252]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[#1F2937] truncate">{activity.title}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(activity.priority)}`}>
                          {activity.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#6B7280]">
                        <span>{activity.ticketNumber}</span>
                        <span>|</span>
                        <span>{activity.department}</span>
                        {activity.assignedTo && (
                          <>
                            <span>|</span>
                            <span>{activity.assignedTo}</span>
                          </>
                        )}
                        <span className="ml-auto">{formatTimeAgo(activity.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div variants={item} className="bg-white rounded-xl border border-[#D8DDE3] p-6">
            <h3 className="text-lg font-semibold text-[#1F2937] mb-6">SLA Compliance</h3>
            <div className="flex justify-center mb-6">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={slaData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                    {slaData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<SLAPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mb-6">
              <span className="text-4xl font-bold text-[#22C55E]">{slaCompliance}%</span>
              <p className="text-sm text-[#6B7280] mt-1">Overall SLA Compliance</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#F4F6F8] rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                  <span className="text-sm text-[#1F2937]">Compliant</span>
                </div>
                <span className="text-sm font-semibold text-[#22C55E]">{slaCompliantCount} tickets</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F4F6F8] rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                  <span className="text-sm text-[#1F2937]">Breached</span>
                </div>
                <span className="text-sm font-semibold text-[#EF4444]">{slaBreachedCount} tickets</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#D8DDE3]">
              <h4 className="text-sm font-semibold text-[#1F2937] mb-3">By Department</h4>
              <div className="space-y-2">
                {departments.slice(0, 5).map((dept) => {
                  const deptTickets = tickets.filter((t) => t.department_id === dept.id);
                  const deptTotal = deptTickets.length;
                  const deptBreached = deptTickets.filter((t) => t.sla_breached).length;
                  const deptCompliance = deptTotal > 0 ? Math.round(((deptTotal - deptBreached) / deptTotal) * 100) : 100;
                  return (
                    <div key={dept.id} className="flex items-center justify-between text-sm">
                      <span className="text-[#6B7280]">{dept.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${deptCompliance}%`,
                              backgroundColor: deptCompliance >= 90 ? "#22C55E" : deptCompliance >= 75 ? "#F59E0B" : "#EF4444",
                            }}
                          />
                        </div>
                        <span className="font-medium text-[#1F2937] w-9 text-right">{deptCompliance}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </MainLayout>
  );
}
