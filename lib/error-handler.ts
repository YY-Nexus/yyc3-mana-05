"use client"

// 错误类型定义
export class AppError extends Error {
  public readonly code: string
  public readonly statusCode?: number
  public readonly context?: any

  constructor(message: string, code = "UNKNOWN_ERROR", statusCode?: number, context?: any) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.statusCode = statusCode
    this.context = context

    // 确保堆栈跟踪正确
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

// 错误报告函数
export function reportError(error: unknown, context?: string): void {
  const errorInfo = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    url: typeof window !== "undefined" ? window.location.href : undefined,
  }

  // 开发环境下直接输出到控制台
  if (process.env.NODE_ENV === "development") {
    console.error("Error Report:", errorInfo)
  }

  // 生产环境下可以发送到错误监控服务
  if (process.env.NODE_ENV === "production") {
    // 这里可以集成 Sentry、LogRocket 等错误监控服务
    // sendToErrorService(errorInfo)
  }
}

// 异步错误处理包装器
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  context?: string,
): (...args: Parameters<T>) => Promise<ReturnType<T> | null> {
  return async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      reportError(error, context)
      return null
    }
  }
}

// 重试机制
export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
  let lastError: Error

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (i === maxRetries) {
        throw lastError
      }

      // 指数退避延迟
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }

  throw lastError!
}

// 网络错误处理
export function handleNetworkError(error: unknown): AppError {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return new AppError("网络连接失败，请检查网络设置", "NETWORK_ERROR", 0)
  }

  if (error instanceof Error && error.name === "AbortError") {
    return new AppError("请求已取消", "REQUEST_CANCELLED", 0)
  }

  return new AppError("网络请求失败", "NETWORK_ERROR", 0, error)
}

// 表单验证错误处理
export function handleValidationError(errors: Record<string, string[]>): AppError {
  const firstError = Object.values(errors)[0]?.[0]
  return new AppError(firstError || "表单验证失败", "VALIDATION_ERROR", 400, errors)
}

// 权限错误处理
export function handleAuthError(statusCode: number): AppError {
  switch (statusCode) {
    case 401:
      return new AppError("未授权访问，请重新登录", "UNAUTHORIZED", 401)
    case 403:
      return new AppError("权限不足，无法访问此资源", "FORBIDDEN", 403)
    default:
      return new AppError("认证失败", "AUTH_ERROR", statusCode)
  }
}

// 业务逻辑错误处理
export function handleBusinessError(code: string, message: string): AppError {
  const errorMessages: Record<string, string> = {
    INSUFFICIENT_CREDITS: "积分不足，请充值后再试",
    RATE_LIMIT_EXCEEDED: "请求过于频繁，请稍后再试",
    RESOURCE_NOT_FOUND: "请求的资源不存在",
    DUPLICATE_RESOURCE: "资源已存在，无法重复创建",
    INVALID_OPERATION: "无效的操作请求",
  }

  return new AppError(errorMessages[code] || message, code, 400)
}

// 全局错误处理器
export function setupGlobalErrorHandlers(): void {
  if (typeof window === "undefined") return

  // 处理未捕获的 Promise 拒绝
  window.addEventListener("unhandledrejection", (event) => {
    reportError(event.reason, "Unhandled Promise Rejection")
    event.preventDefault()
  })

  // 处理未捕获的错误
  window.addEventListener("error", (event) => {
    reportError(event.error || event.message, "Unhandled Error")
  })
}

// 错误恢复策略
export class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager
  private recoveryStrategies: Map<string, () => Promise<void>> = new Map()

  static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager()
    }
    return ErrorRecoveryManager.instance
  }

  registerRecoveryStrategy(errorCode: string, strategy: () => Promise<void>): void {
    this.recoveryStrategies.set(errorCode, strategy)
  }

  async attemptRecovery(error: AppError): Promise<boolean> {
    const strategy = this.recoveryStrategies.get(error.code)
    if (!strategy) return false

    try {
      await strategy()
      return true
    } catch (recoveryError) {
      reportError(recoveryError, `Recovery failed for ${error.code}`)
      return false
    }
  }
}

// 错误边界状态管理
export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: any
}

// 错误分类
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export function categorizeError(error: unknown): ErrorSeverity {
  if (error instanceof AppError) {
    switch (error.code) {
      case "NETWORK_ERROR":
      case "TIMEOUT_ERROR":
        return ErrorSeverity.MEDIUM
      case "UNAUTHORIZED":
      case "FORBIDDEN":
        return ErrorSeverity.HIGH
      case "VALIDATION_ERROR":
        return ErrorSeverity.LOW
      default:
        return ErrorSeverity.MEDIUM
    }
  }

  return ErrorSeverity.HIGH
}

// 错误统计
export class ErrorAnalytics {
  private static errorCounts: Map<string, number> = new Map()
  private static errorHistory: Array<{ error: AppError; timestamp: Date }> = []

  static recordError(error: AppError): void {
    const count = this.errorCounts.get(error.code) || 0
    this.errorCounts.set(error.code, count + 1)

    this.errorHistory.push({ error, timestamp: new Date() })

    // 保持历史记录在合理范围内
    if (this.errorHistory.length > 1000) {
      this.errorHistory = this.errorHistory.slice(-500)
    }
  }

  static getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts)
  }

  static getRecentErrors(minutes = 60): Array<{ error: AppError; timestamp: Date }> {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    return this.errorHistory.filter((entry) => entry.timestamp > cutoff)
  }
}
