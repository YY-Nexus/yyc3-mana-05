"use client"

import type React from "react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, ChevronLeft, ChevronRight, Code, Cpu } from "lucide-react"
import Link from "next/link"
import { useUser, useIsAuthenticated } from "@/lib/store"
import { useAuth } from "@/components/auth/auth-provider"
import { LoginDialog } from "@/components/auth/login-dialog"
import { NotificationPanel } from "@/components/notification-panel"
import { LogoIcon } from "@/components/ui/logo"
import { SmartChatDialog } from "@/components/smart-chat-dialog"

export default function HomePage() {
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showChatDialog, setShowChatDialog] = useState(false)
  const [showMainInterface, setShowMainInterface] = useState(false)
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(true)
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])
  const user = useUser()
  const isAuthenticated = useIsAuthenticated()
  const { logout } = useAuth()

  // 核心功能模块 - 只保留深栈代码和智能引擎
  const coreModules = [
    {
      id: "deep-code",
      title: "深栈代码",
      subtitle: "YYC³驱动的智能编程与开发部署平台",
      icon: Code,
      href: "/deep-stack",
      color: "from-green-500 to-emerald-500",
      position: "left",
    },
    {
      id: "smart-engine",
      title: "智能引擎",
      subtitle: "YYC³驱动的万象云枢智能API调用中心",
      icon: Cpu,
      href: "/engine",
      color: "from-orange-500 to-red-500",
      position: "right",
    },
  ]

  // 创建粒子爆炸效果
  const createParticleBurst = (x: number, y: number) => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
    }))
    setParticles(newParticles)

    // 3秒后清除粒子
    setTimeout(() => {
      setParticles([])
    }, 3000)
  }

  // 激活主界面
  const handleActivateInterface = (e: React.MouseEvent) => {
    if (isTransitioning) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsTransitioning(true)
    createParticleBurst(x, y)

    // 延迟显示主界面，配合动画
    setTimeout(() => {
      setShowMainInterface(true)
      setIsTransitioning(false)
    }, 1500)
  }

  // 点击屏幕激活聊天
  const handleScreenClick = (e: React.MouseEvent) => {
    if (!showMainInterface) {
      handleActivateInterface(e)
      return
    }

    const target = e.target as HTMLElement
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("[role='button']") ||
      target.closest(".no-chat-trigger")
    ) {
      return
    }
    setShowChatDialog(true)
  }

  // 如果还没有激活主界面，显示启动页
  if (!showMainInterface) {
    return (
      <div
        className={`min-h-screen cursor-pointer flex items-center justify-center px-[200px] relative overflow-hidden ${
          isTransitioning ? "transitioning" : ""
        }`}
        onClick={handleScreenClick}
        style={{
          backgroundImage: `
            linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%),
            linear-gradient(45deg, transparent 30%, rgba(199, 125, 255, 0.1) 50%, transparent 70%)
          `,
          backgroundSize: "100% 100%, 200% 100%",
          backgroundPosition: "0% 0%, 100% 0%",
          animation: "flowingSpectrum 8s ease-in-out infinite",
        }}
      >
        {/* 动态光谱流背景 */}
        <style jsx>{`
          @keyframes flowingSpectrum {
            0% {
              background-position: 0% 0%, 100% 0%;
            }
            50% {
              background-position: 0% 0%, -100% 0%;
            }
            100% {
              background-position: 0% 0%, 100% 0%;
            }
          }

          @keyframes logoParticle {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            50% {
              opacity: 1;
              transform: scale(1.1);
            }
            100% {
              opacity: 0;
              transform: scale(0.8);
            }
          }

          @keyframes sloganGlow {
            0% {
              text-shadow: 0 2px 5px rgba(255, 255, 255, 0.2);
              color: #ffffff;
            }
            50% {
              text-shadow: 0 4px 8px rgba(224, 231, 255, 0.4);
              color: #e0e7ff;
            }
            100% {
              text-shadow: 0 2px 5px rgba(255, 255, 255, 0.2);
              color: #ffffff;
            }
          }

          @keyframes breathingButton {
            0% {
              opacity: 0.95;
              box-shadow: 0 0 0px rgba(255, 255, 255, 0.3);
            }
            50% {
              opacity: 1;
              box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
            }
            100% {
              opacity: 0.95;
              box-shadow: 0 0 0px rgba(255, 255, 255, 0.3);
            }
          }

          @keyframes particleExplosion {
            0% {
              opacity: 1;
              transform: translate(0, 0) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(var(--dx), var(--dy)) scale(0.3);
            }
          }

          @keyframes logoTransition {
            0% {
              transform: rotateY(0deg) scale(1);
            }
            50% {
              transform: rotateY(90deg) scale(1.1);
            }
            100% {
              transform: rotateY(180deg) scale(0.9);
            }
          }

          .slogan {
            animation: sloganGlow 4s ease-in-out infinite;
            transition: transform 0.3s ease;
          }

          .slogan:hover {
            transform: translateY(-2px);
            animation-play-state: paused;
            text-shadow: 0 4px 8px rgba(255, 255, 255, 0.4) !important;
          }

          .breathing-button {
            animation: breathingButton 3s ease-in-out infinite;
          }

          .transitioning .logo-container {
            animation: logoTransition 1.5s ease-in-out forwards;
          }

          .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: radial-gradient(circle, #c77dff 0%, #646cff 100%);
            border-radius: 50%;
            pointer-events: none;
            animation: particleExplosion 3s ease-out forwards;
          }
        `}</style>

        {/* 粒子效果 */}
        {particles.map((particle, index) => (
          <div
            key={particle.id}
            className="particle"
            style={
              {
                left: particle.x,
                top: particle.y,
                "--dx": `${(Math.random() - 0.5) * 200}px`,
                "--dy": `${(Math.random() - 0.5) * 200}px`,
                animationDelay: `${index * 0.1}s`,
              } as React.CSSProperties
            }
          />
        ))}

        <div className="text-center space-y-8 w-full">
          {/* Logo */}
          <div className="flex items-center justify-center mb-12">
            <div className="relative logo-container">
              <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 relative overflow-hidden">
                <LogoIcon size="xl" className="scale-150 relative z-10" />
                {/* Logo 粒子效果 */}
                <div
                  className="absolute inset-0 opacity-0"
                  style={{
                    background: `radial-gradient(circle, rgba(199, 125, 255, 0.3) 0%, transparent 70%)`,
                    animation: "logoParticle 2s ease-in-out infinite",
                    animationDelay: "1s",
                  }}
                />
              </div>
            </div>
          </div>

          {/* 标题 */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white tracking-wide slogan">万象归元于云枢｜深栈智启新纪元</h1>
            <p className="text-lg sm:text-xl lg:text-xl text-white/90 font-bold tracking-wider slogan whitespace-nowrap sm:whitespace-normal max-w-6xl mx-auto">
              All Phenomena Converge to the Cloud Pivot | DeepStack Intelligence Ushers in a New Era.
            </p>
          </div>

          {/* 激活提示 */}
          <div className="mt-16">
            <div className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 breathing-button">
              <span className="text-white text-lg font-medium">Tap YanYu Cloud³</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 主界面 - 显示两个核心功能模块
  return (
    <div
      className="min-h-screen cursor-pointer relative overflow-hidden"
      onClick={handleScreenClick}
      style={{
        backgroundImage: `
          linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%),
          linear-gradient(45deg, transparent 30%, rgba(199, 125, 255, 0.1) 50%, transparent 70%)
        `,
        backgroundSize: "100% 100%, 200% 100%",
        backgroundPosition: "0% 0%, 100% 0%",
        animation: "flowingSpectrum 8s ease-in-out infinite",
      }}
    >
      <style jsx>{`
        @keyframes flowingSpectrum {
          0% {
            background-position: 0% 0%, 100% 0%;
          }
          50% {
            background-position: 0% 0%, -100% 0%;
          }
          100% {
            background-position: 0% 0%, 100% 0%;
          }
        }

        @keyframes sidebarHover {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(5px);
          }
        }

        .sidebar-item:hover {
          animation: sidebarHover 0.3s ease-in-out;
        }
      `}</style>

      {/* 顶部导航栏 */}
      <nav className="border-b border-white/10 bg-white/5 backdrop-blur-md no-chat-trigger">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30">
                <LogoIcon size="sm" />
              </div>
              <span className="text-2xl font-bold text-white">YanYu Cloud³</span>
            </div>

            <div className="flex items-center gap-4">
              {/* 平台概览按钮 */}
              <Link href="/overview">
                <Button
                  variant="outline"
                  className="border-white/20 text-white bg-transparent hover:bg-white/10 px-4 py-2 rounded-full"
                >
                  平台概览
                </Button>
              </Link>

              {/* 通知面板 */}
              {isAuthenticated && <NotificationPanel />}

              {/* 用户菜单或登录按钮 */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-slate-800 border-white/20" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-white">{user.name}</p>
                        <p className="text-xs leading-none text-white/70">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/20" />
                    <DropdownMenuItem className="text-white hover:bg-white/10">
                      <User className="mr-2 h-4 w-4" />
                      <span>个人资料</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-white/10">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>设置</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/20" />
                    <DropdownMenuItem className="text-white hover:bg-white/10" onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>退出登录</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => setShowLoginDialog(true)}
                  className="bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 px-6 py-2 rounded-full"
                >
                  注册 / 登录
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-80px)] relative">
        {/* 左侧深栈代码模块 */}
        <div
          className={`transition-all duration-300 ease-in-out no-chat-trigger ${
            leftSidebarCollapsed ? "w-16" : "w-80"
          } group`}
          onMouseEnter={() => setLeftSidebarCollapsed(false)}
          onMouseLeave={() => setLeftSidebarCollapsed(true)}
        >
          <div className="h-full p-4 relative">
            {/* 折叠/展开按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-2 z-10 bg-transparent border-0 text-white/20 hover:text-white hover:bg-white/10 active:text-white active:bg-white/20 rounded-full p-2 transition-all duration-300 animate-pulse hover:animate-none active:animate-none"
              onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
            >
              {leftSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>

            <div className="space-y-3 mt-12 max-h-[calc(100vh-200px)] overflow-y-auto">
              {coreModules
                .filter((module) => module.position === "left")
                .map((module) => {
                  const IconComponent = module.icon
                  return (
                    <Link key={module.id} href={module.href}>
                      <div className="sidebar-item group/item bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 bg-gradient-to-r ${module.color} rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300 flex-shrink-0`}
                          >
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div
                            className={`flex-1 transition-all duration-300 ${
                              leftSidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                            }`}
                          >
                            <h3 className="text-white font-semibold text-lg whitespace-nowrap">{module.title}</h3>
                            <p className="text-white/70 text-sm leading-tight whitespace-nowrap">{module.subtitle}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
            </div>
          </div>
        </div>

        {/* 中央空白区域 - 点击激活聊天 */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-8">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 mx-auto">
              <LogoIcon size="lg" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white">点击任意位置开始对话</h2>
              <p className="text-white/80 text-lg">与YYC³云枢智能助手开启创意之旅</p>
            </div>
            <div className="flex justify-center space-x-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-3 mx-auto">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <p className="text-white/80 font-medium">深栈代码</p>
                <p className="text-white/60 text-sm">智能编程环境</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-3 mx-auto">
                  <Cpu className="w-8 h-8 text-white" />
                </div>
                <p className="text-white/80 font-medium">智能引擎</p>
                <p className="text-white/60 text-sm">API调用中心</p>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧智能引擎模块 */}
        <div
          className={`transition-all duration-300 ease-in-out no-chat-trigger ${
            rightSidebarCollapsed ? "w-16" : "w-80"
          } group`}
          onMouseEnter={() => setRightSidebarCollapsed(false)}
          onMouseLeave={() => setRightSidebarCollapsed(true)}
        >
          <div className="h-full p-4 relative">
            {/* 折叠/展开按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 left-2 z-10 bg-transparent border-0 text-white/20 hover:text-white hover:bg-white/10 active:text-white active:bg-white/20 rounded-full p-2 transition-all duration-300 animate-pulse hover:animate-none active:animate-none"
              onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
            >
              {rightSidebarCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>

            <div className="space-y-3 mt-12 max-h-[calc(100vh-200px)] overflow-y-auto">
              {coreModules
                .filter((module) => module.position === "right")
                .map((module) => {
                  const IconComponent = module.icon
                  return (
                    <Link key={module.id} href={module.href}>
                      <div className="sidebar-item group/item bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 bg-gradient-to-r ${module.color} rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300 flex-shrink-0`}
                          >
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div
                            className={`flex-1 transition-all duration-300 ${
                              rightSidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                            }`}
                          >
                            <h3 className="text-white font-semibold text-lg whitespace-nowrap">{module.title}</h3>
                            <p className="text-white/70 text-sm leading-tight whitespace-nowrap">{module.subtitle}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
            </div>
          </div>
        </div>
      </div>

      {/* 底部标语 */}
      <div className="fixed bottom-0 left-0 right-0 p-6 text-center no-chat-trigger">
        <p className="text-white/80 text-lg font-light tracking-wider">
          <span className="font-bold">
            All Phenomena Converge to the Cloud Pivot | DeepStack Intelligence Ushers in a New Era.
          </span>
        </p>
      </div>

      {/* 对话框 */}
      <SmartChatDialog open={showChatDialog} onOpenChange={setShowChatDialog} />

      {/* 登录对话框 */}
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </div>
  )
}
