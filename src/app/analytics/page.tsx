"use client"

import { useState, useEffect, useMemo } from "react"
import MainLayout from "@/components/layout/MainLayout"
import PageHeader from "@/components/ui/PageHeader"
import { getDepartments, getTickets } from "@/lib/api"
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
  LineChart,
  Line,
  Legend,
} from "recharts"
import {
  TrendingUp,
  Clock,
  Star,
  AlertTriangle,
  Calendar,
  Filter,
  Download,
  Loader2,
} from "lucide-react"
import { motion } from "framer-motion"

const COLORS = ["#3B4252", "#5E81AC", "#88C0D0", "#A3BE8C", "#EBCB8B", "#BF616A", "#D08770", "#B48EAD"]

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("6months")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [departments, setDepartments] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getDepartments().catch(() => []),
      getTickets().catch(() => []),
    ]).then(([depts, tix]) => {
      setDepartments(depts)
      setTickets(tix)
      setLoading(false)
    })
  }, [])

  const filteredTickets = useMemo(() => {
    let result = tickets

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date()
      let cutoff: Date | null = null
      switch (dateRange) {
        case "7days":
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "30days":
          cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case "6months":
          cutoff = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
          break
        case "1year":
          cutoff = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
          break
      }
      if (cutoff) {
        result = result.filter((t) => t.created_at && new Date(t.created_at) >= cutoff!)
      }
    }

    if (departmentFilter !== "all") {
      result = result.filter((t) => t.department_id === departmentFilter)
    }
    if (categoryFilter !== "all") {
      result = result.filter((t) => t.category?.toLowerCase() === categoryFilter)
    }
    return result
  }, [tickets, departmentFilter, categoryFilter, dateRange])

  const kpis = useMemo(() => {
    const total = filteredTickets.length
    const resolved = filteredTickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length
    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : "0"
    const breached = filteredTickets.filter((t) => t.sla_breached).length
    const open = filteredTickets.filter((t) => ["Open", "Assigned", "In Progress"].includes(t.status)).length
    return [
      { label: "Total Complaints", value: String(total), icon: AlertTriangle, color: "#BF616A" },
      { label: "Resolution Rate", value: `${resolutionRate}%`, icon: TrendingUp, color: "#A3BE8C" },
      { label: "SLA Breached", value: String(breached), icon: Clock, color: "#5E81AC" },
      { label: "Open Tickets", value: String(open), icon: Star, color: "#EBCB8B" },
    ]
  }, [filteredTickets])

  const departmentData = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredTickets.forEach((t) => {
      const deptId = t.department_id
      if (deptId) {
        counts[deptId] = (counts[deptId] || 0) + 1
      }
    })
    return departments
      .map((d) => ({ name: d.name, complaints: counts[d.id] || 0 }))
      .filter((d) => d.complaints > 0)
      .sort((a, b) => b.complaints - a.complaints)
  }, [filteredTickets, departments])

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredTickets.forEach((t) => {
      const cat = t.category || "Uncategorized"
      counts[cat] = (counts[cat] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }))
      .sort((a, b) => b.value - a.value)
  }, [filteredTickets])

  const priorityData = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredTickets.forEach((t) => {
      const p = t.priority || "Medium"
      counts[p] = (counts[p] || 0) + 1
    })
    const fillMap: Record<string, string> = { Critical: "#BF616A", High: "#D08770", Medium: "#EBCB8B", Low: "#A3BE8C" }
    return Object.entries(counts).map(([name, count]) => ({ name, count, fill: fillMap[name] || "#5E81AC" }))
  }, [filteredTickets])

  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const now = new Date()
    let bucketCount = 6
    switch (dateRange) {
      case "7days": bucketCount = 1; break
      case "30days": bucketCount = 1; break
      case "6months": bucketCount = 6; break
      case "1year": bucketCount = 12; break
    }
    const buckets: { month: string; created: number; resolved: number }[] = []
    for (let i = bucketCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      buckets.push({ month: months[d.getMonth()], created: 0, resolved: 0 })
    }
    filteredTickets.forEach((t) => {
      const created = t.created_at ? new Date(t.created_at) : null
      if (created) {
        const monthName = months[created.getMonth()]
        const bucket = buckets.find((b) => b.month === monthName)
        if (bucket) bucket.created++
      }
      if (t.status === "Resolved" || t.status === "Closed") {
        const resolved = t.resolved_at ? new Date(t.resolved_at) : null
        if (resolved) {
          const monthName = months[resolved.getMonth()]
          const bucket = buckets.find((b) => b.month === monthName)
          if (bucket) bucket.resolved++
        }
      }
    })
    return buckets
  }, [filteredTickets, dateRange])

  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>()
    tickets.forEach((t) => { if (t.category) cats.add(t.category.toLowerCase()) })
    return Array.from(cats).sort()
  }, [tickets])

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: "#F4F6F8" }}>
        <PageHeader title="Analytics" />

        <div className="p-6">
          <div
            className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-lg"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8DDE3" }}
          >
            <div className="flex items-center gap-2">
              <Calendar size={18} style={{ color: "#3B4252" }} />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 rounded-md text-sm"
                style={{ border: "1px solid #D8DDE3", color: "#3B4252" }}
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last 1 Year</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Filter size={18} style={{ color: "#3B4252" }} />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 rounded-md text-sm"
                style={{ border: "1px solid #D8DDE3", color: "#3B4252" }}
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-md text-sm"
                style={{ border: "1px solid #D8DDE3", color: "#3B4252" }}
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>

            <button
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white"
              style={{ backgroundColor: "#3B4252" }}
            >
              <Download size={16} />
              Export Report
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-[#3B4252]" />
              <span className="ml-2 text-sm text-[#6B7280]">Loading analytics...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {kpis.map((kpi, index) => {
                  const Icon = kpi.icon
                  return (
                    <motion.div
                      key={kpi.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-5 rounded-lg"
                      style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8DDE3" }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${kpi.color}20` }}>
                          <Icon size={20} style={{ color: kpi.color }} />
                        </div>
                      </div>
                      <div className="text-2xl font-bold" style={{ color: "#3B4252" }}>{kpi.value}</div>
                      <div className="text-sm" style={{ color: "#6B7280" }}>{kpi.label}</div>
                    </motion.div>
                  )
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-5 rounded-lg"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8DDE3" }}
                >
                  <h3 className="text-lg font-semibold mb-4" style={{ color: "#3B4252" }}>Monthly Trends</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #D8DDE3", borderRadius: "8px" }} />
                      <Legend />
                      <Line type="monotone" dataKey="created" stroke="#BF616A" strokeWidth={2} name="Created" />
                      <Line type="monotone" dataKey="resolved" stroke="#A3BE8C" strokeWidth={2} name="Resolved" />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-5 rounded-lg"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8DDE3" }}
                >
                  <h3 className="text-lg font-semibold mb-4" style={{ color: "#3B4252" }}>Department Comparison</h3>
                  {departmentData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={departmentData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis type="number" tick={{ fill: "#6B7280", fontSize: 12 }} />
                        <YAxis type="category" dataKey="name" tick={{ fill: "#6B7280", fontSize: 12 }} width={120} />
                        <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #D8DDE3", borderRadius: "8px" }} />
                        <Bar dataKey="complaints" fill="#5E81AC" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-sm text-gray-400">No department data</div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-5 rounded-lg"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8DDE3" }}
                >
                  <h3 className="text-lg font-semibold mb-4" style={{ color: "#3B4252" }}>Category Distribution</h3>
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #D8DDE3", borderRadius: "8px" }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-sm text-gray-400">No category data</div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="p-5 rounded-lg"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8DDE3" }}
                >
                  <h3 className="text-lg font-semibold mb-4" style={{ color: "#3B4252" }}>Priority Breakdown</h3>
                  {priorityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={priorityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 12 }} />
                        <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #D8DDE3", borderRadius: "8px" }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {priorityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-sm text-gray-400">No priority data</div>
                  )}
                </motion.div>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
