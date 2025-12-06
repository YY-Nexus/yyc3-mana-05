"use client"

import { reportError } from "./error-handler"

// 性能监控接口
interface PerformanceMetrics {
  pageLoadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
  timeToInteractive: number
}

interface ResourceMetrics {
  totalResources: number
  totalSize: number
  cacheHitRate: number
  slowResources: Array<{
    name: string
    duration: number
    size: number
  }>
}

interface MemoryMetrics {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  usagePercentage: number
}

// 性能优化配置
interface OptimizationConfig {
  enableImageOptimization: boolean
  enableCodeSplitting: boolean
  enableServiceWorker: boolean
  enableResourceHints: boolean
  enableLazyLoading: boolean
  cacheStrategy: "aggressive" | "conservative" | "custom"
  compressionLevel: "low" | "medium" | "high"
}

class PerformanceOptimizer {
  private config: OptimizationConfig
  private metrics: PerformanceMetrics | null = null
  private resourceMetrics: ResourceMetrics | null = null
  private memoryMetrics: MemoryMetrics | null = null
  private observers: Array<PerformanceObserver> = []

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = {
      enableImageOptimization: true,
      enableCodeSplitting: true,
      enableServiceWorker: true,
      enableResourceHints: true,
      enableLazyLoading: true,
      cacheStrategy: "aggressive",
      compressionLevel: "high",
      ...config,
    }

    this.initializePerformanceMonitoring()
    this.applyOptimizations()
  }

  // 初始化性能监控
  private initializePerformanceMonitoring(): void {
    if (typeof window === "undefined") return

    try {
      // 监控核心Web指标
      this.observeWebVitals()

      // 监控资源加载
      this.observeResourceTiming()

      // 监控内存使用
      this.observeMemoryUsage()

      // 监控长任务
      this.observeLongTasks()

      console.log("🚀 性能监控已启动")
    } catch (error) {
      reportError(error, "Performance Monitoring Initialization")
    }
  }

  // 监控核心Web指标
  private observeWebVitals(): void {
    // First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fcpEntry = entries.find((entry) => entry.name === "first-contentful-paint")
      if (fcpEntry) {
        this.updateMetrics({ firstContentfulPaint: fcpEntry.startTime })
      }
    })
    fcpObserver.observe({ entryTypes: ["paint"] })
    this.observers.push(fcpObserver)

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        this.updateMetrics({ largestContentfulPaint: lastEntry.startTime })
      }
    })
    lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] })
    this.observers.push(lcpObserver)

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (entry.processingStart && entry.startTime) {
          const fid = entry.processingStart - entry.startTime
          this.updateMetrics({ firstInputDelay: fid })
        }
      })
    })
    fidObserver.observe({ entryTypes: ["first-input"] })
    this.observers.push(fidObserver)

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      this.updateMetrics({ cumulativeLayoutShift: clsValue })
    })
    clsObserver.observe({ entryTypes: ["layout-shift"] })
    this.observers.push(clsObserver)
  }

  // 监控资源加载时间
  private observeResourceTiming(): void {
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceResourceTiming[]

      let totalSize = 0
      let cacheHits = 0
      const slowResources: Array<{ name: string; duration: number; size: number }> = []

      entries.forEach((entry) => {
        const duration = entry.responseEnd - entry.requestStart
        const size = entry.transferSize || 0

        totalSize += size

        // 检查缓存命中
        if (entry.transferSize === 0 && entry.decodedBodySize > 0) {
          cacheHits++
        }

        // 识别慢资源 (>2秒)
        if (duration > 2000) {
          slowResources.push({
            name: entry.name,
            duration,
            size,
          })
        }
      })

      this.resourceMetrics = {
        totalResources: entries.length,
        totalSize,
        cacheHitRate: entries.length > 0 ? (cacheHits / entries.length) * 100 : 0,
        slowResources,
      }
    })

    resourceObserver.observe({ entryTypes: ["resource"] })
    this.observers.push(resourceObserver)
  }

  // 监控内存使用
  private observeMemoryUsage(): void {
    if ("memory" in performance) {
      const updateMemoryMetrics = () => {
        const memory = (performance as any).memory
        this.memoryMetrics = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
        }
      }

      updateMemoryMetrics()
      setInterval(updateMemoryMetrics, 5000) // 每5秒更新一次
    }
  }

  // 监控长任务
  private observeLongTasks(): void {
    const longTaskObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        console.warn(`长任务检测: ${entry.name} 耗时 ${entry.duration}ms`)

        // 报告长任务
        reportError(new Error(`长任务: ${entry.name} 耗时 ${entry.duration}ms`), "Long Task Detection")
      })
    })

    try {
      longTaskObserver.observe({ entryTypes: ["longtask"] })
      this.observers.push(longTaskObserver)
    } catch (error) {
      // 某些浏览器可能不支持 longtask
      console.warn("浏览器不支持长任务监控")
    }
  }

  // 更新性能指标
  private updateMetrics(newMetrics: Partial<PerformanceMetrics>): void {
    this.metrics = {
      ...this.metrics,
      pageLoadTime: performance.timing ? performance.timing.loadEventEnd - performance.timing.navigationStart : 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      timeToInteractive: 0,
      ...newMetrics,
    }
  }

  // 应用性能优化
  private applyOptimizations(): void {
    if (typeof window === "undefined") return

    try {
      // 图片优化
      if (this.config.enableImageOptimization) {
        this.optimizeImages()
      }

      // 懒加载
      if (this.config.enableLazyLoading) {
        this.enableLazyLoading()
      }

      // 资源预加载提示
      if (this.config.enableResourceHints) {
        this.addResourceHints()
      }

      // Service Worker
      if (this.config.enableServiceWorker) {
        this.registerServiceWorker()
      }

      // 代码分割优化
      if (this.config.enableCodeSplitting) {
        this.optimizeCodeSplitting()
      }

      console.log("✅ 性能优化已应用")
    } catch (error) {
      reportError(error, "Performance Optimization Application")
    }
  }

  // 图片优化
  private optimizeImages(): void {
    const images = document.querySelectorAll("img")

    images.forEach((img) => {
      // 添加loading="lazy"属性
      if (!img.hasAttribute("loading")) {
        img.setAttribute("loading", "lazy")
      }

      // 添加decoding="async"属性
      if (!img.hasAttribute("decoding")) {
        img.setAttribute("decoding", "async")
      }

      // 检查是否需要响应式图片
      if (!img.hasAttribute("srcset") && img.src) {
        const src = img.src
        if (src.includes("/placeholder.svg")) {
          // 为占位符图片添加优化参数
          const url = new URL(src, window.location.origin)
          url.searchParams.set("format", "webp")
          url.searchParams.set("quality", "80")
          img.src = url.toString()
        }
      }
    })
  }

  // 启用懒加载
  private enableLazyLoading(): void {
    if ("IntersectionObserver" in window) {
      const lazyElements = document.querySelectorAll("[data-lazy]")

      const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement
            const src = element.getAttribute("data-lazy")

            if (src) {
              if (element.tagName === "IMG") {
                ;(element as HTMLImageElement).src = src
              } else {
                element.style.backgroundImage = `url(${src})`
              }

              element.removeAttribute("data-lazy")
              lazyObserver.unobserve(element)
            }
          }
        })
      })

      lazyElements.forEach((element) => {
        lazyObserver.observe(element)
      })
    }
  }

  // 添加资源预加载提示
  private addResourceHints(): void {
    const head = document.head

    // DNS预解析
    const dnsHints = ["//fonts.googleapis.com", "//fonts.gstatic.com", "//api.example.com"]

    dnsHints.forEach((domain) => {
      const link = document.createElement("link")
      link.rel = "dns-prefetch"
      link.href = domain
      head.appendChild(link)
    })

    // 预连接关键资源
    const preconnectHints = ["https://fonts.googleapis.com", "https://api.example.com"]

    preconnectHints.forEach((url) => {
      const link = document.createElement("link")
      link.rel = "preconnect"
      link.href = url
      link.crossOrigin = "anonymous"
      head.appendChild(link)
    })

    // 预加载关键资源
    const preloadHints = [
      { href: "/fonts/inter.woff2", as: "font", type: "font/woff2" },
      { href: "/logo.png", as: "image" },
    ]

    preloadHints.forEach((hint) => {
      const link = document.createElement("link")
      link.rel = "preload"
      link.href = hint.href
      link.as = hint.as
      if (hint.type) link.type = hint.type
      if (hint.as === "font") link.crossOrigin = "anonymous"
      head.appendChild(link)
    })
  }

  // 注册Service Worker
  private async registerServiceWorker(): void {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js")
        console.log("Service Worker 注册成功:", registration)
      } catch (error) {
        console.warn("Service Worker 注册失败:", error)
      }
    }
  }

  // 优化代码分割
  private optimizeCodeSplitting(): void {
    // 预加载路由组件
    const routeLinks = document.querySelectorAll('a[href^="/"]')

    routeLinks.forEach((link) => {
      link.addEventListener("mouseenter", () => {
        const href = link.getAttribute("href")
        if (href) {
          // 预加载路由对应的JavaScript块
          this.preloadRoute(href)
        }
      })
    })
  }

  // 预加载路由
  private preloadRoute(route: string): void {
    // 这里应该根据实际的路由配置来预加载对应的代码块
    // Next.js 会自动处理这个过程
    console.log(`预加载路由: ${route}`)
  }

  // 获取性能指标
  getPerformanceMetrics(): {
    core: PerformanceMetrics | null
    resources: ResourceMetrics | null
    memory: MemoryMetrics | null
  } {
    return {
      core: this.metrics,
      resources: this.resourceMetrics,
      memory: this.memoryMetrics,
    }
  }

  // 获取性能评分
  getPerformanceScore(): number {
    if (!this.metrics) return 0

    let score = 100

    // FCP评分 (目标: <1.8s)
    if (this.metrics.firstContentfulPaint > 1800) {
      score -= 20
    } else if (this.metrics.firstContentfulPaint > 1000) {
      score -= 10
    }

    // LCP评分 (目标: <2.5s)
    if (this.metrics.largestContentfulPaint > 2500) {
      score -= 25
    } else if (this.metrics.largestContentfulPaint > 1500) {
      score -= 15
    }

    // FID评分 (目标: <100ms)
    if (this.metrics.firstInputDelay > 100) {
      score -= 20
    } else if (this.metrics.firstInputDelay > 50) {
      score -= 10
    }

    // CLS评分 (目标: <0.1)
    if (this.metrics.cumulativeLayoutShift > 0.25) {
      score -= 25
    } else if (this.metrics.cumulativeLayoutShift > 0.1) {
      score -= 15
    }

    // 内存使用评分
    if (this.memoryMetrics && this.memoryMetrics.usagePercentage > 80) {
      score -= 10
    }

    return Math.max(0, score)
  }

  // 获取优化建议
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = []

    if (!this.metrics) {
      suggestions.push("无法获取性能数据，请检查浏览器兼容性")
      return suggestions
    }

    // FCP优化建议
    if (this.metrics.firstContentfulPaint > 1800) {
      suggestions.push("首次内容绘制时间过长，建议优化关键渲染路径")
    }

    // LCP优化建议
    if (this.metrics.largestContentfulPaint > 2500) {
      suggestions.push("最大内容绘制时间过长，建议优化图片加载和服务器响应时间")
    }

    // FID优化建议
    if (this.metrics.firstInputDelay > 100) {
      suggestions.push("首次输入延迟过长，建议减少JavaScript执行时间")
    }

    // CLS优化建议
    if (this.metrics.cumulativeLayoutShift > 0.1) {
      suggestions.push("累积布局偏移过大，建议为图片和广告预留空间")
    }

    // 资源优化建议
    if (this.resourceMetrics) {
      if (this.resourceMetrics.cacheHitRate < 50) {
        suggestions.push("缓存命中率较低，建议优化缓存策略")
      }

      if (this.resourceMetrics.slowResources.length > 0) {
        suggestions.push(`发现 ${this.resourceMetrics.slowResources.length} 个慢资源，建议优化加载速度`)
      }

      if (this.resourceMetrics.totalSize > 5 * 1024 * 1024) {
        suggestions.push("页面资源总大小过大，建议启用压缩和代码分割")
      }
    }

    // 内存优化建议
    if (this.memoryMetrics && this.memoryMetrics.usagePercentage > 80) {
      suggestions.push("内存使用率过高，建议检查内存泄漏")
    }

    if (suggestions.length === 0) {
      suggestions.push("性能表现良好，无需特别优化")
    }

    return suggestions
  }

  // 生成性能报告
  generatePerformanceReport(): string {
    const metrics = this.getPerformanceMetrics()
    const score = this.getPerformanceScore()
    const suggestions = this.getOptimizationSuggestions()

    let report = "# YYC³ 平台性能报告\n\n"
    report += `生成时间: ${new Date().toLocaleString()}\n`
    report += `性能评分: ${score}/100\n\n`

    if (metrics.core) {
      report += "## 核心Web指标\n\n"
      report += `- 页面加载时间: ${metrics.core.pageLoadTime}ms\n`
      report += `- 首次内容绘制 (FCP): ${metrics.core.firstContentfulPaint}ms\n`
      report += `- 最大内容绘制 (LCP): ${metrics.core.largestContentfulPaint}ms\n`
      report += `- 首次输入延迟 (FID): ${metrics.core.firstInputDelay}ms\n`
      report += `- 累积布局偏移 (CLS): ${metrics.core.cumulativeLayoutShift}\n`
      report += `- 可交互时间 (TTI): ${metrics.core.timeToInteractive}ms\n\n`
    }

    if (metrics.resources) {
      report += "## 资源加载指标\n\n"
      report += `- 总资源数: ${metrics.resources.totalResources}\n`
      report += `- 总大小: ${(metrics.resources.totalSize / 1024 / 1024).toFixed(2)}MB\n`
      report += `- 缓存命中率: ${metrics.resources.cacheHitRate.toFixed(2)}%\n`
      report += `- 慢资源数: ${metrics.resources.slowResources.length}\n\n`
    }

    if (metrics.memory) {
      report += "## 内存使用指标\n\n"
      report += `- 已使用堆内存: ${(metrics.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB\n`
      report += `- 总堆内存: ${(metrics.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB\n`
      report += `- 堆内存限制: ${(metrics.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB\n`
      report += `- 使用率: ${metrics.memory.usagePercentage.toFixed(2)}%\n\n`
    }

    report += "## 优化建议\n\n"
    suggestions.forEach((suggestion, index) => {
      report += `${index + 1}. ${suggestion}\n`
    })

    return report
  }

  // 清理监控器
  cleanup(): void {
    this.observers.forEach((observer) => {
      observer.disconnect()
    })
    this.observers = []
  }
}

// 导出性能优化器实例
export const performanceOptimizer = new PerformanceOptimizer()

// 导出相关类型
export type { PerformanceMetrics, ResourceMetrics, MemoryMetrics, OptimizationConfig }
