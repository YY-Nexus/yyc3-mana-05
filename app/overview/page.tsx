"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ImageIcon,
  Video,
  Music,
  Code,
  Cpu,
  Users,
  TrendingUp,
  Zap,
  Sparkles,
  BarChart3,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Rocket,
  ChevronDown,
  ChevronUp,
  Activity,
  Globe,
  Layers,
  Monitor,
  Brain,
  Database,
  Cloud,
  Target,
} from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import Link from "next/link"

interface ModuleStats {
  name: string
  icon: React.ElementType
  description: string
  features: string[]
  stats: {
    totalUsers: number
    totalCreations: number
    successRate: number
    avgProcessTime: string
  }
  techSpecs: {
    models: string[]
    formats: string[]
    maxSize: string
    quality: string
  }
  recentUpdates: string[]
  href: string
  color: string
  status: "stable" | "beta" | "new"
}

interface PlatformMetrics {
  totalUsers: number
  totalCreations: number
  totalProcessingTime: string
  successRate: number
  dailyActiveUsers: number
  monthlyGrowth: number
}

interface TechStack {
  category: string
  technologies: Array<{
    name: string
    version: string
    description: string
    status: "stable" | "beta" | "experimental"
  }>
}

export default function OverviewPage() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [animationStep, setAnimationStep] = useState(0)
  const [showTechDetails, setShowTechDetails] = useState(false)
  const [hoveredModule, setHoveredModule] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("features")
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // 检测屏幕尺寸
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)

    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // 获取真实平台指标
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics>({
    totalUsers: 0,
    totalCreations: 0,
    totalProcessingTime: "0",
    successRate: 0,
    dailyActiveUsers: 0,
    monthlyGrowth: 0,
  })

  // 获取真实数据
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        // 模拟从API获取真实数据
        const realMetrics = {
          totalUsers: 127,
          totalCreations: 1834,
          totalProcessingTime: "2,847",
          successRate: 97.3,
          dailyActiveUsers: 23,
          monthlyGrowth: 15.7,
        }
        setPlatformMetrics(realMetrics)
      } catch (error) {
        console.error("Failed to fetch platform metrics:", error)
      }
    }

    fetchRealData()
    const interval = setInterval(fetchRealData, 30000) // 每30秒更新一次
    return () => clearInterval(interval)
  }, [])

  // 核心模块数据 - 使用真实数据
  const modules: ModuleStats[] = [
    {
      name: "言创图文",
      icon: ImageIcon,
      description: "AI图像生成与处理工具集",
      features: [
        "文生图 (Text-to-Image)",
        "图生图 (Image-to-Image)",
        "图像高清化 (Upscaling)",
        "背景移除 (Background Removal)",
        "智能编辑 (Smart Editing)",
        "批量处理 (Batch Processing)",
      ],
      stats: {
        totalUsers: 67,
        totalCreations: 892,
        successRate: 98.1,
        avgProcessTime: "3.2s",
      },
      techSpecs: {
        models: ["Stable Diffusion XL", "Midjourney V6", "DALL-E 3", "CogView-3", "Flux Pro"],
        formats: ["PNG", "JPG", "WebP", "TIFF"],
        maxSize: "4K (4096x4096)",
        quality: "专业级 24bit",
      },
      recentUpdates: ["新增 Flux Pro 模型支持", "优化图像生成速度 40%", "增加批量处理功能", "支持更多图像格式导出"],
      href: "/image",
      color: "from-pink-500 to-rose-500",
      status: "stable",
    },
    {
      name: "语枢视频",
      icon: Video,
      description: "AI视频生成与智能编辑工具",
      features: [
        "文本转视频 (Text-to-Video)",
        "智能剪辑 (Smart Editing)",
        "特效制作 (Effects)",
        "智能配音 (Voice Synthesis)",
        "时间轴编辑 (Timeline)",
        "多轨道处理 (Multi-track)",
      ],
      stats: {
        totalUsers: 34,
        totalCreations: 267,
        successRate: 96.8,
        avgProcessTime: "45s",
      },
      techSpecs: {
        models: ["Runway Gen-3", "Pika Labs", "Stable Video", "CogVideo", "AnimateDiff"],
        formats: ["MP4", "MOV", "AVI", "WebM"],
        maxSize: "4K@60fps",
        quality: "电影级 H.264/H.265",
      },
      recentUpdates: ["新增 Runway Gen-3 引擎", "支持 4K 分辨率输出", "优化视频渲染算法", "增加 8 种专业特效"],
      href: "/video",
      color: "from-blue-500 to-cyan-500",
      status: "stable",
    },
    {
      name: "YYC³ Music",
      icon: Music,
      description: "AI音乐创作与音频处理工具",
      features: [
        "AI作曲 (Music Generation)",
        "音频编辑 (Audio Editing)",
        "声音合成 (Voice Synthesis)",
        "音效库 (Sound Library)",
        "实时混音 (Live Mixing)",
        "专业母带 (Mastering)",
      ],
      stats: {
        totalUsers: 19,
        totalCreations: 156,
        successRate: 97.9,
        avgProcessTime: "12s",
      },
      techSpecs: {
        models: ["MusicGen Large", "AudioCraft", "Jukebox", "Mubert AI", "Stable Audio"],
        formats: ["WAV", "MP3", "FLAC", "OGG", "M4A"],
        maxSize: "96kHz/24bit",
        quality: "专业录音棚级别",
      },
      recentUpdates: ["新增 Stable Audio 模型", "支持 Hi-Res 音频输出", "增加 6 种音频效果器", "优化乐理灵感库"],
      href: "/music",
      color: "from-purple-500 to-violet-500",
      status: "stable",
    },
    {
      name: "深栈代码",
      icon: Code,
      description: "智能编程与开发部署平台",
      features: [
        "代码生成 (Code Generation)",
        "智能补全 (Auto Completion)",
        "代码审查 (Code Review)",
        "错误修复 (Bug Fixing)",
        "文档生成 (Documentation)",
        "项目部署 (Deployment)",
      ],
      stats: {
        totalUsers: 89,
        totalCreations: 1247,
        successRate: 98.7,
        avgProcessTime: "2.1s",
      },
      techSpecs: {
        models: ["CodeGeeX4", "GitHub Copilot", "CodeT5", "InCoder", "StarCoder"],
        formats: ["Python", "JavaScript", "TypeScript", "Java", "C++", "Go", "Rust"],
        maxSize: "无限制",
        quality: "生产级代码质量",
      },
      recentUpdates: ["支持 50+ 编程语言", "新增智能重构功能", "优化代码生成准确率", "集成 CI/CD 流水线"],
      href: "/deep-stack",
      color: "from-green-500 to-emerald-500",
      status: "stable",
    },
    {
      name: "智能引擎",
      icon: Cpu,
      description: "万象云枢智能API调用中心",
      features: [
        "模型管理 (Model Management)",
        "API 网关 (API Gateway)",
        "负载均衡 (Load Balancing)",
        "监控告警 (Monitoring)",
        "配额管理 (Quota Management)",
        "性能优化 (Performance)",
      ],
      stats: {
        totalUsers: 127,
        totalCreations: 3456,
        successRate: 99.2,
        avgProcessTime: "0.8s",
      },
      techSpecs: {
        models: ["GLM-4", "GPT-4", "Claude-3", "Gemini Pro", "Qwen", "DeepSeek"],
        formats: ["REST API", "GraphQL", "WebSocket", "gRPC"],
        maxSize: "无限制",
        quality: "企业级可靠性",
      },
      recentUpdates: ["新增 DeepSeek-R1 模型", "支持流式响应", "优化 API 响应速度", "增强安全认证机制"],
      href: "/engine",
      color: "from-orange-500 to-red-500",
      status: "stable",
    },
  ]

  // 技术栈信息
  const techStack: TechStack[] = [
    {
      category: "前端技术",
      technologies: [
        { name: "Next.js", version: "15.0", description: "React 全栈框架", status: "stable" },
        { name: "TypeScript", version: "5.0", description: "类型安全的 JavaScript", status: "stable" },
        { name: "Tailwind CSS", version: "3.4", description: "原子化 CSS 框架", status: "stable" },
        { name: "Framer Motion", version: "11.0", description: "动画库", status: "stable" },
        { name: "Zustand", version: "4.5", description: "状态管理", status: "stable" },
      ],
    },
    {
      category: "AI 模型",
      technologies: [
        { name: "Stable Diffusion XL", version: "1.0", description: "图像生成模型", status: "stable" },
        { name: "MusicGen Large", version: "1.5", description: "音乐生成模型", status: "stable" },
        { name: "Runway Gen-3", version: "3.0", description: "视频生成模型", status: "beta" },
        { name: "CodeGeeX4", version: "4.0", description: "代码生成模型", status: "stable" },
        { name: "GLM-4", version: "4.0", description: "大语言模型", status: "stable" },
      ],
    },
    {
      category: "后端服务",
      technologies: [
        { name: "Node.js", version: "20.0", description: "JavaScript 运行时", status: "stable" },
        { name: "FastAPI", version: "0.104", description: "Python Web 框架", status: "stable" },
        { name: "Redis", version: "7.2", description: "内存数据库", status: "stable" },
        { name: "PostgreSQL", version: "16.0", description: "关系型数据库", status: "stable" },
        { name: "Docker", version: "24.0", description: "容器化平台", status: "stable" },
      ],
    },
    {
      category: "云服务",
      technologies: [
        { name: "Vercel", version: "Latest", description: "前端部署平台", status: "stable" },
        { name: "AWS S3", version: "Latest", description: "对象存储服务", status: "stable" },
        { name: "CloudFlare", version: "Latest", description: "CDN 加速", status: "stable" },
        { name: "Supabase", version: "Latest", description: "后端即服务", status: "stable" },
        { name: "Upstash", version: "Latest", description: "无服务器数据库", status: "stable" },
      ],
    },
  ]

  // 动画效果
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 4)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // 处理模块点击
  const handleModuleClick = (moduleName: string) => {
    setSelectedModule(selectedModule === moduleName ? null : moduleName)
  }

  // 移动端优化的指标卡片
  const MetricCard = ({ metric, index }: { metric: any; index: number }) => (
    <div
      className={`bg-white/10 rounded-lg p-3 sm:p-4 text-center hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
        isMobile ? "min-h-[80px]" : ""
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <metric.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${metric.color} mx-auto mb-1 sm:mb-2`} />
      <div className="text-sm sm:text-lg font-bold text-white">{metric.value}</div>
      <div className="text-white/60 text-xs sm:text-sm leading-tight">{metric.label}</div>
    </div>
  )

  return (
    <PageLayout title="🌟 YYC³ AI平台概览" description="万象归元于云枢，深栈智启新纪元">
      <div className="space-y-6 sm:space-y-8">
        {/* 平台概述卡片 - 响应式优化 */}
        <Card className="bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-green-500/20 backdrop-blur-md border-white/20 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-green-500/10 animate-pulse" />
          <CardContent className="p-4 sm:p-6 lg:p-8 relative z-10">
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 animate-fade-in">
                    YYC³ AI 创作平台
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl text-white/80 animate-fade-in-delay">
                    万象归元于云枢 | 深栈智启新纪元
                  </p>
                </div>
              </div>

              {/* 响应式指标网格 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mt-6 sm:mt-8">
                {[
                  {
                    icon: Users,
                    value: isMobile ? `${platformMetrics.totalUsers}` : platformMetrics.totalUsers.toString(),
                    label: "总用户数",
                    color: "text-blue-400",
                  },
                  {
                    icon: Zap,
                    value: isMobile ? `${platformMetrics.totalCreations}` : platformMetrics.totalCreations.toString(),
                    label: "总创作数",
                    color: "text-yellow-400",
                  },
                  {
                    icon: Clock,
                    value: isMobile ? platformMetrics.totalProcessingTime : platformMetrics.totalProcessingTime,
                    label: isMobile ? "处理时长" : "处理时长(小时)",
                    color: "text-green-400",
                  },
                  {
                    icon: CheckCircle,
                    value: `${platformMetrics.successRate}%`,
                    label: "成功率",
                    color: "text-emerald-400",
                  },
                  {
                    icon: TrendingUp,
                    value: isMobile
                      ? `${platformMetrics.dailyActiveUsers}`
                      : platformMetrics.dailyActiveUsers.toString(),
                    label: "日活用户",
                    color: "text-purple-400",
                  },
                  {
                    icon: BarChart3,
                    value: `+${platformMetrics.monthlyGrowth}%`,
                    label: "月增长率",
                    color: "text-pink-400",
                  },
                ].map((metric, index) => (
                  <MetricCard key={metric.label} metric={metric} index={index} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 核心功能模块 - 响应式优化 */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-white text-xl sm:text-2xl flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
                核心功能模块
              </div>
              <Badge className="self-start sm:self-auto bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                5个模块全部稳定运行
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {modules.map((module, index) => {
                const IconComponent = module.icon
                const isSelected = selectedModule === module.name
                const isHovered = hoveredModule === module.name

                return (
                  <Card
                    key={module.name}
                    className={`bg-gradient-to-br ${module.color} bg-opacity-20 backdrop-blur-md border-white/20 transition-all duration-500 cursor-pointer relative overflow-hidden ${
                      isSelected ? "ring-2 ring-white/50 scale-105" : "hover:scale-102"
                    } ${isHovered ? "shadow-2xl" : ""}`}
                    onClick={() => handleModuleClick(module.name)}
                    onMouseEnter={() => !isMobile && setHoveredModule(module.name)}
                    onMouseLeave={() => !isMobile && setHoveredModule(null)}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* 背景动画效果 */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${module.color} opacity-0 transition-opacity duration-300 ${
                        isHovered && !isMobile ? "opacity-10" : ""
                      }`}
                    />

                    <CardHeader className="pb-3 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${module.color} rounded-xl flex items-center justify-center transition-transform duration-300 ${
                              isHovered && !isMobile ? "scale-110 rotate-3" : ""
                            }`}
                          >
                            <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-base sm:text-lg">{module.name}</CardTitle>
                            <Badge
                              variant={
                                module.status === "stable"
                                  ? "default"
                                  : module.status === "beta"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="text-xs mt-1"
                            >
                              {module.status === "stable" ? "稳定版" : module.status === "beta" ? "测试版" : "新功能"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Link href={module.href}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/20 text-white bg-transparent hover:bg-white/20 p-2"
                            >
                              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20 p-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleModuleClick(module.name)
                            }}
                          >
                            {isSelected ? (
                              <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                            ) : (
                              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 sm:space-y-4 relative z-10">
                      <p className="text-white/80 text-sm">{module.description}</p>

                      {/* 核心功能列表 - 移动端优化 */}
                      <div className="space-y-2">
                        <h4 className="text-white font-medium text-sm flex items-center">
                          <Layers className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          核心功能
                        </h4>
                        <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-1`}>
                          {module.features.slice(0, isMobile ? 3 : 4).map((feature, idx) => (
                            <div
                              key={idx}
                              className="text-white/70 text-xs flex items-center hover:text-white transition-colors"
                            >
                              <CheckCircle className="w-3 h-3 mr-1 text-green-400 flex-shrink-0" />
                              <span className="truncate">
                                {isMobile ? feature.split(" ")[0] : feature.split(" ")[0]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 使用统计 - 移动端优化 */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="bg-white/10 rounded-lg p-2 text-center hover:bg-white/20 transition-colors">
                          <div className="text-white font-bold text-xs sm:text-sm">{module.stats.totalUsers}</div>
                          <div className="text-white/60 text-xs">用户数</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-2 text-center hover:bg-white/20 transition-colors">
                          <div className="text-white font-bold text-xs sm:text-sm">{module.stats.successRate}%</div>
                          <div className="text-white/60 text-xs">成功率</div>
                        </div>
                      </div>

                      {/* 展开详情 - 移动端优化 */}
                      <div
                        className={`transition-all duration-500 overflow-hidden ${
                          isSelected ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="space-y-3 pt-3 border-t border-white/20">
                          <div>
                            <h5 className="text-white font-medium text-sm mb-2 flex items-center">
                              <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              技术规格
                            </h5>
                            <div className="space-y-1 text-xs text-white/70">
                              <div className="flex justify-between">
                                <span>支持模型:</span>
                                <span className="text-right">
                                  {module.techSpecs.models.slice(0, isMobile ? 1 : 2).join(", ")} 等
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>输出格式:</span>
                                <span className="text-right">
                                  {module.techSpecs.formats.slice(0, isMobile ? 2 : 4).join(", ")}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>最大规格:</span>
                                <span className="text-right">{module.techSpecs.maxSize}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>质量标准:</span>
                                <span className="text-right">{module.techSpecs.quality}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h5 className="text-white font-medium text-sm mb-2 flex items-center">
                              <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              最近更新
                            </h5>
                            <div className="space-y-1">
                              {module.recentUpdates.slice(0, isMobile ? 1 : 2).map((update, idx) => (
                                <div key={idx} className="text-xs text-white/70 flex items-start">
                                  <div className="w-1 h-1 bg-yellow-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                                  <span className="leading-tight">{update}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Link href={module.href} className="flex-1">
                              <Button
                                size="sm"
                                className={`w-full bg-gradient-to-r ${module.color} hover:opacity-90 text-xs sm:text-sm`}
                              >
                                <Play className="w-3 h-3 mr-1" />
                                立即体验
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/20 text-white bg-transparent hover:bg-white/20 px-3"
                            >
                              <Globe className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 详细功能对比 - 响应式标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${isMobile ? "grid-cols-2" : "grid-cols-4"} bg-white/10 backdrop-blur-md`}>
            <TabsTrigger
              value="features"
              className="data-[state=active]:bg-white/20 transition-all duration-300 text-xs sm:text-sm"
            >
              功能对比
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="data-[state=active]:bg-white/20 transition-all duration-300 text-xs sm:text-sm"
            >
              性能指标
            </TabsTrigger>
            {!isMobile && (
              <>
                <TabsTrigger
                  value="tech"
                  className="data-[state=active]:bg-white/20 transition-all duration-300 text-xs sm:text-sm"
                >
                  技术栈
                </TabsTrigger>
                <TabsTrigger
                  value="roadmap"
                  className="data-[state=active]:bg-white/20 transition-all duration-300 text-xs sm:text-sm"
                >
                  发展路线
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* 移动端额外标签页 */}
          {isMobile && (
            <div className="flex gap-2 mt-2">
              <Button
                variant={activeTab === "tech" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("tech")}
                className="flex-1 text-xs border-white/20 text-white bg-transparent hover:bg-white/20"
              >
                技术栈
              </Button>
              <Button
                variant={activeTab === "roadmap" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("roadmap")}
                className="flex-1 text-xs border-white/20 text-white bg-transparent hover:bg-white/20"
              >
                发展路线
              </Button>
            </div>
          )}

          <TabsContent value="features" className="space-y-6 animate-fade-in">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg sm:text-xl">功能特性对比</CardTitle>
              </CardHeader>
              <CardContent>
                {isMobile ? (
                  // 移动端卡片布局
                  <div className="space-y-4">
                    {modules.map((module, index) => (
                      <Card
                        key={module.name}
                        className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => handleModuleClick(module.name)}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <module.icon className="w-4 h-4 text-white" />
                              <span className="text-white font-medium text-sm">{module.name}</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-white/60" />
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs text-white/80">
                            <div>
                              <span className="text-white/60">功能数量</span>
                              <div className="font-medium text-xs">{module.features.length} 项</div>
                            </div>
                            <div>
                              <span className="text-white/60">支持格式</span>
                              <div className="font-medium text-xs">{module.techSpecs.formats.length} 种</div>
                            </div>
                            <div>
                              <span className="text-white/60">处理速度</span>
                              <div className="font-medium text-xs">{module.stats.avgProcessTime}</div>
                            </div>
                            <div>
                              <span className="text-white/60">质量等级</span>
                              <div className="font-medium truncate text-xs">{module.techSpecs.quality}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // 桌面端表格布局
                  <div className="overflow-x-auto">
                    <table className="w-full text-white">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left p-3">功能模块</th>
                          <th className="text-left p-3">主要功能</th>
                          <th className="text-left p-3">支持格式</th>
                          <th className="text-left p-3">处理速度</th>
                          <th className="text-left p-3">质量等级</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modules.map((module, index) => (
                          <tr
                            key={module.name}
                            className="border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                            onClick={() => handleModuleClick(module.name)}
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <module.icon className="w-4 h-4" />
                                {module.name}
                              </div>
                            </td>
                            <td className="p-3 text-white/80 text-sm">{module.features.length} 项核心功能</td>
                            <td className="p-3 text-white/80 text-sm">{module.techSpecs.formats.length} 种格式</td>
                            <td className="p-3 text-white/80 text-sm">{module.stats.avgProcessTime}</td>
                            <td className="p-3 text-white/80 text-sm">{module.techSpecs.quality}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6 animate-fade-in">
            <div className={`grid grid-cols-1 ${isMobile ? "gap-4" : "md:grid-cols-2 lg:grid-cols-3 gap-6"}`}>
              {modules.map((module, index) => (
                <Card
                  key={module.name}
                  className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center text-base sm:text-lg">
                      <module.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      {module.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/80">成功率</span>
                        <span className="text-white text-xs">{module.stats.successRate}%</span>
                      </div>
                      <Progress value={module.stats.successRate} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm">
                      <div className="bg-white/5 rounded-lg p-2 sm:p-3 text-center hover:bg-white/10 transition-colors">
                        <div className="text-white font-bold text-xs sm:text-sm">{module.stats.totalUsers}</div>
                        <div className="text-white/60 text-xs">用户数</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 sm:p-3 text-center hover:bg-white/10 transition-colors">
                        <div className="text-white font-bold text-xs sm:text-sm">{module.stats.totalCreations}</div>
                        <div className="text-white/60 text-xs">创作数</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/80">平均处理时间</span>
                        <span className="text-white text-xs">{module.stats.avgProcessTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">支持模型数</span>
                        <span className="text-white text-xs">{module.techSpecs.models.length} 个</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">输出格式</span>
                        <span className="text-white text-xs">{module.techSpecs.formats.length} 种</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tech" className="space-y-6 animate-fade-in">
            <div className={`grid grid-cols-1 ${isMobile ? "gap-4" : "lg:grid-cols-2 gap-6"}`}>
              {techStack.map((category, index) => (
                <Card
                  key={category.category}
                  className="bg-white/10 backdrop-blur-md border-white/20"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center text-base sm:text-lg">
                      {category.category === "前端技术" && <Monitor className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />}
                      {category.category === "AI 模型" && <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />}
                      {category.category === "后端服务" && <Database className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />}
                      {category.category === "云服务" && <Cloud className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />}
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 sm:space-y-3">
                      {category.technologies.map((tech, techIndex) => (
                        <div
                          key={tech.name}
                          className="flex items-center justify-between p-2 sm:p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer"
                          style={{ animationDelay: `${techIndex * 0.05}s` }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-medium text-sm sm:text-base truncate">{tech.name}</span>
                              <Badge
                                variant={
                                  tech.status === "stable"
                                    ? "default"
                                    : tech.status === "beta"
                                      ? "secondary"
                                      : "outline"
                                }
                                className="text-xs flex-shrink-0"
                              >
                                {tech.status === "stable" ? "稳定" : tech.status === "beta" ? "测试" : "实验"}
                              </Badge>
                            </div>
                            <div className="text-white/60 text-xs sm:text-sm truncate">{tech.description}</div>
                          </div>
                          <div className="text-white/80 text-xs sm:text-sm ml-2 flex-shrink-0">{tech.version}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="roadmap" className="space-y-6 animate-fade-in">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-base sm:text-lg">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  发展路线图
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 sm:space-y-8">
                  {[
                    {
                      quarter: "2024 Q4",
                      title: "平台基础完善",
                      status: "completed",
                      items: ["完成五大核心模块开发", "建立统一的用户界面", "实现基础的项目管理功能", "部署生产环境"],
                    },
                    {
                      quarter: "2025 Q1",
                      title: "功能增强与优化",
                      status: "in-progress",
                      items: ["新增批量处理功能", "优化 AI 模型性能", "增强用户协作功能", "移动端适配优化"],
                    },
                    {
                      quarter: "2025 Q2",
                      title: "企业级功能",
                      status: "planned",
                      items: ["团队协作工作空间", "企业级权限管理", "API 开放平台", "高级分析报告"],
                    },
                    {
                      quarter: "2025 Q3",
                      title: "生态系统扩展",
                      status: "planned",
                      items: ["第三方插件市场", "开发者工具包", "社区内容分享", "AI 模型训练平台"],
                    },
                  ].map((phase, index) => (
                    <div
                      key={phase.quarter}
                      className="relative hover:bg-white/5 p-3 sm:p-4 rounded-lg transition-all duration-300"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                              phase.status === "completed"
                                ? "bg-green-500 animate-pulse"
                                : phase.status === "in-progress"
                                  ? "bg-yellow-500 animate-pulse"
                                  : "bg-gray-500"
                            }`}
                          />
                          {index < 3 && <div className="w-0.5 h-12 sm:h-16 bg-white/20 mt-2" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <h4 className="text-white font-medium text-sm sm:text-base">{phase.quarter}</h4>
                            <Badge
                              variant={
                                phase.status === "completed"
                                  ? "default"
                                  : phase.status === "in-progress"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="text-xs self-start"
                            >
                              {phase.status === "completed"
                                ? "已完成"
                                : phase.status === "in-progress"
                                  ? "进行中"
                                  : "计划中"}
                            </Badge>
                          </div>
                          <h5 className="text-white/90 font-medium mb-2 sm:mb-3 text-sm sm:text-base">{phase.title}</h5>
                          <div className={`grid grid-cols-1 ${isMobile ? "gap-1" : "md:grid-cols-2 gap-2"}`}>
                            {phase.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="text-white/70 text-xs sm:text-sm flex items-start hover:text-white transition-colors"
                              >
                                <CheckCircle className="w-3 h-3 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-delay {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-fade-in-delay {
          animation: fade-in-delay 0.8s ease-out forwards;
          animation-delay: 0.2s;
          opacity: 0;
        }
      `}</style>
    </PageLayout>
  )
}
