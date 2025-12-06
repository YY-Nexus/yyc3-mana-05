"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/ui/logo"
import { SmartChatDialog } from "@/components/smart-chat-dialog"
import { Home, ImageIcon, Video, Music, Code, Cpu, Settings, HelpCircle, Menu, X, Sparkles } from "lucide-react"

interface PageLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

// 完整的功能导航项
const navigationItems = [
  {
    name: "首页",
    href: "/",
    icon: Home,
    description: "平台概览",
  },
  {
    name: "言创图文",
    href: "/image",
    icon: ImageIcon,
    description: "AI图像生成与处理",
    badge: "热门",
  },
  {
    name: "语枢视频",
    href: "/video",
    icon: Video,
    description: "AI视频创作与编辑",
    badge: "新功能",
  },
  {
    name: "YYC³ Music",
    href: "/music",
    icon: Music,
    description: "AI音乐创作与合成",
    badge: "专业版",
  },
  {
    name: "深栈代码",
    href: "/deep-stack",
    icon: Code,
    description: "智能编程环境",
    badge: "核心",
  },
  {
    name: "智能引擎",
    href: "/engine",
    icon: Cpu,
    description: "API调用中心",
    badge: "核心",
  },
]

export function PageLayout({ children, title, description }: PageLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [smartChatOpen, setSmartChatOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 背景装饰 */}
      <div className="fixed inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center opacity-10" />
      <div className="fixed inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10" />

      {/* 移动端菜单按钮 */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* 侧边栏 */}
      <AnimatePresence>
        {(sidebarOpen || (typeof window !== "undefined" && window.innerWidth >= 1024)) && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed left-0 top-0 z-40 h-full w-80 bg-white/10 backdrop-blur-xl border-r border-white/20"
          >
            <div className="flex flex-col h-full">
              {/* Logo区域 */}
              <div className="p-6 border-b border-white/20">
                <Link href="/" className="flex items-center space-x-3">
                  <Logo className="w-10 h-10" />
                  <div>
                    <h1 className="text-xl font-bold text-white">YYC³</h1>
                    <p className="text-sm text-white/70">言语云AI平台</p>
                  </div>
                </Link>
              </div>

              <ScrollArea className="flex-1 px-4 py-6">
                <div className="space-y-8">
                  {/* 创作工具 */}
                  <div>
                    <h2 className="text-sm font-semibold text-white/80 mb-4 px-2">创作工具</h2>
                    <nav className="space-y-2">
                      {navigationItems.slice(1, 4).map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)

                        return (
                          <Link key={item.name} href={item.href}>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                                active
                                  ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-white"
                                  : "text-white/70 hover:text-white hover:bg-white/10"
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{item.name}</span>
                                  {item.badge && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0"
                                    >
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-white/50 mt-0.5">{item.description}</p>
                              </div>
                            </motion.div>
                          </Link>
                        )
                      })}
                    </nav>
                  </div>

                  {/* 开发工具 */}
                  <div>
                    <h2 className="text-sm font-semibold text-white/80 mb-4 px-2">开发工具</h2>
                    <nav className="space-y-2">
                      {navigationItems.slice(4, 6).map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)

                        return (
                          <Link key={item.name} href={item.href}>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                                active
                                  ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-white"
                                  : "text-white/70 hover:text-white hover:bg-white/10"
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{item.name}</span>
                                  {item.badge && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0"
                                    >
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-white/50 mt-0.5">{item.description}</p>
                              </div>
                            </motion.div>
                          </Link>
                        )
                      })}
                    </nav>
                  </div>

                  {/* 快速导航 */}
                  <div>
                    <h2 className="text-sm font-semibold text-white/80 mb-4 px-2">快速导航</h2>
                    <nav className="space-y-2">
                      {navigationItems.slice(0, 1).map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)

                        return (
                          <Link key={item.name} href={item.href}>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                                active
                                  ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-white"
                                  : "text-white/70 hover:text-white hover:bg-white/10"
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{item.name}</span>
                                  {item.badge && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0"
                                    >
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-white/50 mt-0.5">{item.description}</p>
                              </div>
                            </motion.div>
                          </Link>
                        )
                      })}
                    </nav>
                  </div>
                </div>
              </ScrollArea>

              {/* 底部操作区 */}
              <div className="p-4 border-t border-white/20 space-y-3">
                <Button
                  onClick={() => setSmartChatOpen(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  智能助手
                </Button>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    设置
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <HelpCircle className="w-4 h-4 mr-1" />
                    帮助
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* 主内容区域 */}
      <div className="lg:ml-80 min-h-screen">
        <div className="p-6">
          {/* 页面头部 */}
          <div className="mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
              {description && <p className="text-white/70 text-lg">{description}</p>}
            </motion.div>
          </div>

          {/* 页面内容 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative z-10"
          >
            {children}
          </motion.div>
        </div>
      </div>

      {/* 智能助手对话框 */}
      <SmartChatDialog open={smartChatOpen} onOpenChange={setSmartChatOpen} />
    </div>
  )
}
