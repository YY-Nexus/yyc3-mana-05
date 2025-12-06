"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, CheckCircle, AlertCircle, Info, AlertTriangle, Trash2, Check } from "lucide-react"
import { useAllNotifications, useUnreadNotificationsCount, useAppStore } from "@/lib/store"

export function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const notifications = useAllNotifications()
  const unreadCount = useUnreadNotificationsCount()
  const { markNotificationRead, markAllNotificationsRead, clearNotifications } = useAppStore()

  const getIcon = (type: string) => {
    const icons = {
      success: CheckCircle,
      error: AlertCircle,
      warning: AlertTriangle,
      info: Info,
    }
    return icons[type as keyof typeof icons] || Info
  }

  const getIconColor = (type: string) => {
    const colors = {
      success: "text-green-400",
      error: "text-red-400",
      warning: "text-yellow-400",
      info: "text-blue-400",
    }
    return colors[type as keyof typeof colors] || "text-blue-400"
  }

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now.getTime() - date.getTime()

      if (diff < 60000) return "刚刚"
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
      return `${Math.floor(diff / 86400000)}天前`
    } catch {
      return "未知时间"
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-slate-900 border-white/20">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center justify-between">
            <span>通知中心</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-red-500/20 text-red-400">
                {unreadCount} 条未读
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription className="text-white/70">查看所有系统通知和消息</SheetDescription>
        </SheetHeader>

        {/* 操作按钮 */}
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            className="border-white/20 text-white bg-transparent hover:bg-white/10"
            onClick={markAllNotificationsRead}
            disabled={unreadCount === 0}
          >
            <Check className="w-4 h-4 mr-2" />
            全部已读
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-white/20 text-white bg-transparent hover:bg-white/10"
            onClick={clearNotifications}
            disabled={notifications.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            清空通知
          </Button>
        </div>

        {/* 通知列表 */}
        <ScrollArea className="h-[calc(100vh-200px)] mt-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">暂无通知</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const IconComponent = getIcon(notification.type)
                const iconColor = getIconColor(notification.type)

                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      notification.read ? "bg-white/5 border-white/10" : "bg-white/10 border-white/20 hover:bg-white/15"
                    }`}
                    onClick={() => !notification.read && markNotificationRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent className={`w-5 h-5 mt-0.5 ${iconColor}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-medium ${notification.read ? "text-white/70" : "text-white"}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                        </div>
                        <p className={`text-sm ${notification.read ? "text-white/50" : "text-white/70"}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-white/40 mt-2">{formatTime(notification.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
