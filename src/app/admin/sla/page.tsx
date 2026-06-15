"use client";

import { useState, useEffect, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import { AlertTriangle, TrendingUp, Timer, Shield, Bell, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { getTickets } from "@/lib/api";

interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  priority: string;
  status: string;
  sla_breached: boolean;
  sla_deadline: string;
  assigned_to: string;
  created_at: string;
  assignee?: { full_name: string };
}

const slaRules = [
  { id: "1", priority: "Critical", timeLimit: "2 hours", escalation: "1 hour", escalationTrigger: "Auto-escalate to Department Manager", color: "border-red-200 bg-red-50", badge: "bg-red-100 text-red-700" },
  { id: "2", priority: "High", timeLimit: "4 hours", escalation: "2 hours", escalationTrigger: "Notify Department Manager", color: "border-orange-200 bg-orange-50", badge: "bg-orange-100 text-orange-700" },
  { id: "3", priority: "Medium", timeLimit: "8 hours", escalation: "4 hours", escalationTrigger: "Send reminder notification", color: "border-yellow-200 bg-yellow-50", badge: "bg-yellow-100 text-yellow-700" },
  { id: "4", priority: "Low", timeLimit: "24 hours", escalation: "12 hours", escalationTrigger: "Send reminder notification", color: "border-green-200 bg-green-50", badge: "bg-green-100 text-green-700" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const barMaxHeight = 120;

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function SLAPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTickets()
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  const violations = useMemo(() => {
    return tickets
      .filter((t) => t.sla_breached && !["Resolved", "Closed"].includes(t.status))
      .map((t) => {
        const now = new Date();
        const deadline = new Date(t.sla_deadline);
        const hoursOverdue = Math.max(0, Math.round((now.getTime() - deadline.getTime()) / (1000 * 60 * 60)));
        return {
          id: t.id,
          ticket: t.ticket_number,
          title: t.title,
          priority: t.priority,
          assignee: t.assignee?.full_name || "Unassigned",
          breachedAt: deadline.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " + deadline.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          hoursOverdue: `${hoursOverdue}h`,
        };
      });
  }, [tickets]);

  const complianceData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const result: { month: string; compliance: number }[] = [];

    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = d.toISOString();
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();

      const monthTickets = tickets.filter(
        (t) => t.created_at >= monthStart && t.created_at <= monthEnd
      );
      const resolved = monthTickets.filter((t) => t.sla_breached === false || ["Resolved", "Closed"].includes(t.status));
      const compliance = monthTickets.length > 0 ? Math.round((resolved.length / monthTickets.length) * 100) : 100;

      result.push({ month: months[d.getMonth()], compliance });
    }
    return result;
  }, [tickets]);

  const overallCompliance = useMemo(() => {
    if (tickets.length === 0) return 100;
    const compliant = tickets.filter((t) => !t.sla_breached).length;
    return Math.round((compliant / tickets.length) * 100);
  }, [tickets]);

  if (loading) {
    return (
      <MainLayout>
        <PageHeader title="SLA Management" description="Define and monitor service level agreements" />
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#3B4252]" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="SLA Management"
        description="Define and monitor service level agreements"
      />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {slaRules.map((rule) => (
            <motion.div key={rule.id} variants={item} className={cn("rounded-xl border p-5 transition-shadow hover:shadow-md", rule.color)}>
              <div className="flex items-start justify-between mb-4">
                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", rule.badge)}>
                  <Shield size={12} /> {rule.priority}
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-1">
                    <Timer size={12} /> Time Limit
                  </div>
                  <span className="text-lg font-bold text-[#1F2937]">{rule.timeLimit}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-1">
                    <Bell size={12} /> Escalation
                  </div>
                  <span className="text-sm font-medium text-[#1F2937]">After {rule.escalation}</span>
                </div>
                <div className="pt-2 border-t border-white/60">
                  <p className="text-xs text-[#6B7280]">{rule.escalationTrigger}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={item} className="bg-white rounded-xl border border-[#D8DDE3] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#1F2937]">SLA Compliance Trend</h3>
              <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <TrendingUp size={16} /> {overallCompliance}% overall
              </div>
            </div>
            {complianceData.length > 0 ? (
              <div className="flex items-end justify-between gap-3" style={{ height: barMaxHeight + 40 }}>
                {complianceData.map((d) => (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-[#1F2937]">{d.compliance}%</span>
                    <div className="w-full rounded-t-lg transition-all" style={{ height: `${(d.compliance / 100) * barMaxHeight}px`, backgroundColor: d.compliance >= 90 ? "#22C55E" : d.compliance >= 75 ? "#F59E0B" : "#EF4444" }} />
                    <span className="text-xs text-[#6B7280]">{d.month}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-sm text-[#6B7280]">No ticket data available</div>
            )}
            <div className="mt-4 pt-4 border-t border-[#D8DDE3] flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span className="text-[#6B7280]">Compliant (≥90%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-500" />
                <span className="text-[#6B7280]">Warning (75-89%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-[#6B7280]">Breach (&lt;75%)</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="bg-white rounded-xl border border-[#D8DDE3] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-[#1F2937]">Active SLA Violations</h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                <AlertTriangle size={12} /> {violations.length} active
              </span>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {violations.length > 0 ? violations.map((v) => (
                <div key={v.id} className="p-4 rounded-lg border border-red-200 bg-red-50/50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-sm font-mono text-[#6B7280]">{v.ticket}</span>
                      <h4 className="text-sm font-medium text-[#1F2937] mt-0.5">{v.title}</h4>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                      {v.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                    <span>Assigned to: <span className="font-medium text-[#1F2937]">{v.assignee}</span></span>
                    <span>Breached: <span className="font-medium text-red-600">{v.breachedAt}</span></span>
                    <span className="ml-auto font-semibold text-red-600">+{v.hoursOverdue} overdue</span>
                  </div>
                </div>
              )) : (
                <div className="flex items-center justify-center py-10 text-sm text-[#6B7280]">
                  No active SLA violations
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </MainLayout>
  );
}
