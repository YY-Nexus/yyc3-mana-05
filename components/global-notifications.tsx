"use client"

import { useEffect, useRef } from "react"
import { useLastNotificationId, useAllNotifications, useAppStore } from "@/lib/store"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

export function GlobalNotifications() {
  const lastNotificationId = useLastNotificationId()
  const notifications = useAllNotifications()
  const markNotificationRead = useAppStore((state) => state.markNotificationRead)
  const processedIds = useRef(new Set<string>())

  useEffect(() => {
    // 只处理最新的未读通知
    if (!lastNotificationId) return

    // 避免重复处理
    if (processedIds.current.has(lastNotificationId)) return

    // 找到最新的通知
    const latestNotification = notifications.find((n) => n.id === lastNotificationId && !n.read)

    if (!latestNotification) return

    // 标记为已处理
    processedIds.current.add(lastNotificationId)

    // 显示toast
    const IconComponent = {
      success: CheckCircle,
      error: AlertCircle,
      warning: AlertTriangle,
      info: Info,
    }[latestNotification.type]

    toast({
      title: latestNotification.title,
      description: latestNotification.message,
      variant: latestNotification.type === "error" ? "destructive" : "default",
      duration: latestNotification.type === "error" ? 8000 : 5000,
    })

    // 标记为已读
    markNotificationRead(latestNotification.id)

    // 清理旧的处理记录，保持在合理范围内
    if (processedIds.current.size > 100) {
      const idsArray = Array.from(processedIds.current)
      processedIds.current = new Set(idsArray.slice(-50))
    }
  }, [lastNotificationId, notifications, markNotificationRead])

  return null
}
