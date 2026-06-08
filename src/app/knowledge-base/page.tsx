"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import PageHeader from "@/components/ui/PageHeader"
import {
  BookOpen,
  Search,
  Clock,
  Tag,
  ChevronDown,
  ChevronRight,
  FileText,
  Lightbulb,
  Shield,
  GraduationCap,
  Wrench,
  HelpCircle,
  Plus,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const categories = [
  { id: "all", label: "All", icon: BookOpen },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
  { id: "troubleshooting", label: "Troubleshooting", icon: Wrench },
  { id: "procedures", label: "Procedures", icon: FileText },
  { id: "policies", label: "Policies", icon: Shield },
  { id: "training", label: "Training", icon: GraduationCap },
]

const articles = [
  {
    id: 1,
    title: "How to Handle Escalated Complaints",
    excerpt:
      "Step-by-step guide for managing complaints that require immediate attention and senior involvement.",
    category: "procedures",
    readTime: "5 min",
    updated: "2 days ago",
  },
  {
    id: 2,
    title: "Refund Policy Guidelines",
    excerpt:
      "Complete overview of our refund eligibility criteria, processing times, and exception handling.",
    category: "policies",
    readTime: "8 min",
    updated: "1 week ago",
  },
  {
    id: 3,
    title: "Common Shipping Issues and Solutions",
    excerpt:
      "Troubleshooting guide for delayed packages, damaged items, and tracking discrepancies.",
    category: "troubleshooting",
    readTime: "6 min",
    updated: "3 days ago",
  },
  {
    id: 4,
    title: "Customer Communication Best Practices",
    excerpt:
      "Tips and templates for effective customer interactions across email, phone, and chat channels.",
    category: "training",
    readTime: "10 min",
    updated: "5 days ago",
  },
  {
    id: 5,
    title: "Understanding SLA Requirements",
    excerpt:
      "Detailed breakdown of service level agreements and response time commitments for each tier.",
    category: "policies",
    readTime: "7 min",
    updated: "1 day ago",
  },
  {
    id: 6,
    title: "Billing Dispute Resolution Process",
    excerpt:
      "How to investigate and resolve billing disputes, including escalation paths and documentation.",
    category: "procedures",
    readTime: "9 min",
    updated: "4 days ago",
  },
]

const popularArticles = [
  { id: 1, title: "Getting Started with CTMS", views: 245 },
  { id: 2, title: "Complaint Classification Guide", views: 189 },
  { id: 3, title: "SLA Response Templates", views: 156 },
  { id: 4, title: "Escalation Matrix", views: 134 },
  { id: 5, title: "Monthly Report Generation", views: 98 },
]

const faqItems = [
  {
    id: 1,
    question: "How do I create a new complaint ticket?",
    answer:
      "Navigate to the Complaints section and click 'New Complaint'. Fill in the required fields including customer details, complaint category, and description. Assign priority and department, then save to create the ticket.",
  },
  {
    id: 2,
    question: "What is the SLA for responding to customer complaints?",
    answer:
      "Our standard SLA requires initial response within 4 hours for critical issues, 8 hours for high priority, 24 hours for medium, and 48 hours for low priority complaints. These timelines apply during business hours.",
  },
  {
    id: 3,
    question: "How can I escalate a complaint?",
    answer:
      "Use the 'Escalate' button on the complaint detail page. Select the appropriate escalation level and provide a reason for escalation. The system will notify the next tier of support automatically.",
  },
  {
    id: 4,
    question: "Can I export complaint data for reporting?",
    answer:
      "Yes, navigate to the Analytics page and click 'Export Report'. You can select date ranges, departments, and categories to generate CSV or PDF reports for analysis and compliance purposes.",
  },
  {
    id: 5,
    question: "How do I update a complaint status?",
    answer:
      "Open the complaint from the complaints list and use the status dropdown to update. Available statuses include Open, In Progress, Pending, Resolved, and Closed. Add notes when changing status.",
  },
]

export default function KnowledgeBasePage() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      activeCategory === "all" || article.category === activeCategory
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c) => c.id === category)
    return cat ? cat.icon : FileText
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      faqs: "#5E81AC",
      troubleshooting: "#BF616A",
      procedures: "#A3BE8C",
      policies: "#EBCB8B",
      training: "#88C0D0",
    }
    return colors[category] || "#3B4252"
  }

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: "#F4F6F8" }}>
        <PageHeader
          title="Knowledge Base"
          actions={
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white"
              style={{ backgroundColor: "#3B4252" }}
            >
              <Plus size={16} />
              Create Article
            </button>
          }
        />

        <div className="p-6">
          <div
            className="mb-6 p-4 rounded-lg"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D8DDE3",
            }}
          >
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#6B7280" }}
              />
              <input
                type="text"
                placeholder="Search articles, FAQs, and guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-md text-sm"
                style={{
                  border: "1px solid #D8DDE3",
                  color: "#3B4252",
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{
                    backgroundColor:
                      activeCategory === cat.id ? "#3B4252" : "#FFFFFF",
                    color: activeCategory === cat.id ? "#FFFFFF" : "#3B4252",
                    border: `1px solid ${activeCategory === cat.id ? "#3B4252" : "#D8DDE3"}`,
                  }}
                >
                  <Icon size={16} />
                  {cat.label}
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.map((article, index) => {
                  const CategoryIcon = getCategoryIcon(article.category)
                  const categoryColor = getCategoryColor(article.category)
                  return (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-5 rounded-lg cursor-pointer transition-shadow hover:shadow-md"
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #D8DDE3",
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${categoryColor}20` }}
                        >
                          <CategoryIcon
                            size={18}
                            style={{ color: categoryColor }}
                          />
                        </div>
                        <span
                          className="px-2 py-1 rounded text-xs font-medium capitalize"
                          style={{
                            backgroundColor: `${categoryColor}20`,
                            color: categoryColor,
                          }}
                        >
                          {article.category}
                        </span>
                      </div>
                      <h3
                        className="text-base font-semibold mb-2"
                        style={{ color: "#3B4252" }}
                      >
                        {article.title}
                      </h3>
                      <p
                        className="text-sm mb-4 line-clamp-2"
                        style={{ color: "#6B7280" }}
                      >
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <div
                          className="flex items-center gap-1"
                          style={{ color: "#6B7280" }}
                        >
                          <Clock size={12} />
                          {article.readTime} read
                        </div>
                        <div
                          className="flex items-center gap-1"
                          style={{ color: "#6B7280" }}
                        >
                          <Tag size={12} />
                          Updated {article.updated}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {filteredArticles.length === 0 && (
                <div
                  className="text-center py-12 rounded-lg"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #D8DDE3",
                  }}
                >
                  <BookOpen
                    size={48}
                    className="mx-auto mb-4"
                    style={{ color: "#D8DDE3" }}
                  />
                  <p style={{ color: "#6B7280" }}>
                    No articles found matching your criteria.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div
                className="p-5 rounded-lg"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D8DDE3",
                }}
              >
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: "#3B4252" }}
                >
                  Popular Articles
                </h3>
                <div className="space-y-3">
                  {popularArticles.map((article, index) => (
                    <div
                      key={article.id}
                      className="flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors hover:bg-gray-50"
                    >
                      <span
                        className="text-sm font-bold"
                        style={{ color: "#D8DDE3" }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1">
                        <div
                          className="text-sm font-medium"
                          style={{ color: "#3B4252" }}
                        >
                          {article.title}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: "#6B7280" }}
                        >
                          {article.views} views
                        </div>
                      </div>
                      <ChevronRight
                        size={14}
                        style={{ color: "#D8DDE3" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="p-5 rounded-lg"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D8DDE3",
                }}
              >
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: "#3B4252" }}
                >
                  Frequently Asked Questions
                </h3>
                <div className="space-y-2">
                  {faqItems.map((faq) => (
                    <div
                      key={faq.id}
                      className="rounded-md overflow-hidden"
                      style={{ border: "1px solid #D8DDE3" }}
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between p-4 text-left"
                        style={{ backgroundColor: "#F4F6F8" }}
                      >
                        <span
                          className="text-sm font-medium pr-2"
                          style={{ color: "#3B4252" }}
                        >
                          {faq.question}
                        </span>
                        <ChevronDown
                          size={16}
                          style={{
                            color: "#6B7280",
                            transform:
                              expandedFaq === faq.id
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                            transition: "transform 0.2s",
                            flexShrink: 0,
                          }}
                        />
                      </button>
                      <AnimatePresence>
                        {expandedFaq === faq.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div
                              className="p-4 text-sm"
                              style={{
                                color: "#6B7280",
                                borderTop: "1px solid #D8DDE3",
                              }}
                            >
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="p-5 rounded-lg"
                style={{
                  backgroundColor: "#3B4252",
                }}
              >
                <Lightbulb
                  size={24}
                  className="mb-3"
                  style={{ color: "#EBCB8B" }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "#FFFFFF" }}
                >
                  Need Help?
                </h3>
                <p className="text-sm mb-4" style={{ color: "#D8DDE3" }}>
                  Can&apos;t find what you&apos;re looking for? Reach out to our support
                  team for personalized assistance.
                </p>
                <button
                  className="w-full px-4 py-2 rounded-md text-sm font-medium"
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#3B4252",
                  }}
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}