"use client"

import { useState, useEffect, useCallback } from "react"
import MainLayout from "@/components/layout/MainLayout"
import PageHeader from "@/components/ui/PageHeader"
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getCurrentUser,
  subscribeToNotifications,
} from "@/lib/api"
import { formatDateTime, cn } from "@/lib/utils"
import {
  Bell,
  Check,
  CheckCheck,
  CheckCircle,
  Info,
  AlertTriangle,
  AlertCircle,
  Clock,
  Settings,
  Trash2,
  Loader2,
} from "lucide-react"
import { motion } from "framer-motion"

type FilterTab = "all" | "unread" | "mentions" | "system"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  related_ticket_id: string | null
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all")
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return
      setUserId(user.id)
      const data = await getNotifications(user.id)
      setNotifications(data)
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (!userId) return

    const channel = subscribeToNotifications(userId, (payload) => {
      const eventType = (payload as { eventType?: string }).eventType

      if (eventType === "INSERT") {
        const newNotification = (payload as { new?: Notification }).new
        if (newNotification) {
          setNotifications((prev) => [newNotification, ...prev])
        }
      } else if (eventType === "UPDATE") {
        const updated = (payload as { new?: Notification }).new
        if (updated) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          )
        }
      } else if (eventType === "DELETE") {
        const deleted = (payload as { old?: { id?: string } }).old
        if (deleted?.id) {
          setNotifications((prev) => prev.filter((n) => n.id !== deleted.id))
        }
      }
    })

    return () => {
      channel.unsubscribe()
    }
  }, [userId])

  const filteredNotifications = notifications.filter((notification) => {
    if (activeFilter === "unread") return !notification.is_read
    if (activeFilter === "mentions")
      return (
        notification.title.toLowerCase().includes("comment") ||
        notification.title.toLowerCase().includes("mention")
      )
    if (activeFilter === "system") return notification.type === "info"
    return true
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const markAsRead = async (id: string) => {
    try {
      await markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch (err) {
      console.error("Failed to mark notification as read:", err)
    }
  }

  const markAllRead = async () => {
    if (!userId) return
    try {
      await markAllNotificationsRead(userId)
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (err) {
      console.error("Failed to mark all as read:", err)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await import("@/lib/api").then((m) => m.deleteNotification(id))
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (err) {
      console.error("Failed to delete notification:", err)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "mentions", label: "Mentions" },
    { id: "system", label: "System" },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Notifications"
          description="Stay updated with the latest activities and alerts"
          actions={
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0 || loading}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                unreadCount > 0
                  ? "bg-[#3B4252] text-white hover:bg-[#2E3440]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              <CheckCheck className="h-4 w-4" />
              Mark All Read
            </button>
          }
        />

        <div className="bg-white rounded-xl border border-[#D8DDE3] overflow-hidden">
          <div className="border-b border-[#D8DDE3] px-6 py-3">
            <div className="flex items-center gap-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeFilter === tab.id
                      ? "bg-[#3B4252] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {tab.label}
                  {tab.id === "unread" && unreadCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#D8DDE3]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Loader2 className="h-8 w-8 mb-4 text-[#3B4252] animate-spin" />
                <p className="text-sm font-medium">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Bell className="h-12 w-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm">You&apos;re all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors",
                    !notification.is_read && "bg-blue-50/50"
                  )}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p
                            className={cn(
                              "text-sm font-medium text-[#3B4252]",
                              !notification.is_read && "font-semibold"
                            )}
                          >
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(new Date(notification.created_at))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-gray-400 hover:text-[#3B4252] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D8DDE3] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-5 w-5 text-[#3B4252]" />
            <h3 className="text-lg font-semibold text-[#3B4252]">
              Notification Preferences
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-[#3B4252]">
                  Email Notifications
                </p>
                <p className="text-xs text-gray-500">
                  Receive notifications via email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B4252]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-[#3B4252]">
                  Push Notifications
                </p>
                <p className="text-xs text-gray-500">
                  Receive push notifications in browser
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B4252]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-[#3B4252]">
                  Mention Notifications
                </p>
                <p className="text-xs text-gray-500">
                  Notify when someone mentions you
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B4252]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-[#3B4252]">
                  System Notifications
                </p>
                <p className="text-xs text-gray-500">
                  Updates about system maintenance and changes
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B4252]"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
