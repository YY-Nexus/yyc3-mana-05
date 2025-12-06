"use client"

import type React from "react"
import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"
import { AppError, reportError, ErrorAnalytics } from "@/lib/error-handler"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId?: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(),
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误
    reportError(error, "React Error Boundary")

    // 记录到错误分析
    if (error instanceof AppError) {
      ErrorAnalytics.recordError(error)
    }

    // 调用自定义错误处理器
    this.props.onError?.(error, errorInfo)

    this.setState({ errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleReportBug = () => {
    const { error, errorInfo } = this.state
    const bugReport = {
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    // 这里可以集成bug报告系统
    console.log("Bug Report:", bugReport)

    // 复制到剪贴板
    navigator.clipboard.writeText(JSON.stringify(bugReport, null, 2))
    alert("错误信息已复制到剪贴板")
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md w-full">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <CardTitle className="text-white text-xl">出现了一些问题</CardTitle>
                <CardDescription className="text-white/70">
                  应用程序遇到了意外错误，我们已经记录了这个问题
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-sm font-mono break-all">{this.state.error.message}</p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Button onClick={this.handleRetry} className="w-full bg-blue-600 hover:bg-blue-700">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    重试
                  </Button>

                  <Button
                    onClick={() => (window.location.href = "/")}
                    variant="outline"
                    className="w-full border-white/20 text-white bg-transparent hover:bg-white/10"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    返回首页
                  </Button>

                  {process.env.NODE_ENV === "development" && (
                    <Button
                      onClick={this.handleReportBug}
                      variant="outline"
                      className="w-full border-white/20 text-white bg-transparent hover:bg-white/10"
                    >
                      <Bug className="w-4 h-4 mr-2" />
                      复制错误信息
                    </Button>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-white/50 text-xs">错误ID: {this.state.errorId}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )
    }

    return this.props.children
  }
}

// 函数式错误边界组件（用于特定场景）
interface FunctionErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error) => void
}

export function FunctionErrorBoundary({ children, fallback, onError }: FunctionErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={fallback}
      onError={(error, errorInfo) => {
        onError?.(error)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// 高阶组件：为组件添加错误边界
export function withErrorBoundary<P extends object>(Component: React.ComponentType<P>, fallback?: ReactNode) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

export default ErrorBoundary
