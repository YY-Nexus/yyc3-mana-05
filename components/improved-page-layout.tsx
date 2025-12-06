"use client"

import type { ReactNode } from "react"
import { useAppStore } from "@/lib/store"
import { designTokens } from "@/lib/design-tokens"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

interface ImprovedPageLayoutProps {
  title: string
  description: string
  children: ReactNode
  showBackButton?: boolean
  showSettings?: boolean
  actions?: ReactNode
}

export function ImprovedPageLayout({
  title,
  description,
  children,
  showBackButton = true,
  showSettings = true,
  actions,
}: ImprovedPageLayoutProps) {
  const router = useRouter()
  const { settings } = useAppStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 导航栏 */}
      <nav className="border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="text-white hover:bg-white/10"
                  aria-label="返回上一页"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div>
                <h1 className={`${designTokens.typography.h2} text-white`}>{title}</h1>
                <p className={`${designTokens.typography.caption} mt-1`}>{description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {actions}
              {showSettings && (
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" aria-label="设置">
                  <Settings className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* 页脚 */}
      <footer className="border-t border-white/10 bg-white/5 backdrop-blur-md mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-white/60 text-sm">
            <p>© 2024 YYC³ AI Platform. 保留所有权利。</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
