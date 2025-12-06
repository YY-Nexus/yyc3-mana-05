"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useAppStore } from "@/lib/store"
import { userApi } from "@/lib/api-client"
import { AppError, reportError } from "@/lib/error-handler"

interface AuthContextType {
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const { user, setUser, addNotification } = useAppStore()

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 检查本地存储的认证信息
        const savedUser = localStorage.getItem("user")
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          setUser(userData)

          // 验证token是否仍然有效
          try {
            await userApi.getProfile()
          } catch (error) {
            // Token无效，清除用户信息
            localStorage.removeItem("user")
            setUser(null)
          }
        }
      } catch (error) {
        reportError(error, "Auth initialization")
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [setUser])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await userApi.login({ email, password })

      if (response.success && response.data) {
        const userData = response.data
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))

        addNotification({
          type: "success",
          title: "登录成功",
          message: `欢迎回来，${userData.name}！`,
        })
      } else {
        throw new AppError(response.message || "登录失败", "LOGIN_FAILED")
      }
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError("登录失败", "LOGIN_FAILED")
      addNotification({
        type: "error",
        title: "登录失败",
        message: appError.message,
      })
      throw appError
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await userApi.register({ name, email, password })

      if (response.success && response.data) {
        const userData = response.data
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))

        addNotification({
          type: "success",
          title: "注册成功",
          message: `欢迎加入，${userData.name}！`,
        })
      } else {
        throw new AppError(response.message || "注册失败", "REGISTER_FAILED")
      }
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError("注册失败", "REGISTER_FAILED")
      addNotification({
        type: "error",
        title: "注册失败",
        message: appError.message,
      })
      throw appError
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await userApi.logout()
    } catch (error) {
      // 即使logout API失败，也要清除本地状态
      reportError(error, "Logout API failed")
    } finally {
      setUser(null)
      localStorage.removeItem("user")
      setIsLoading(false)

      addNotification({
        type: "info",
        title: "已退出登录",
        message: "感谢使用，期待您的再次访问！",
      })
    }
  }

  const refreshAuth = async () => {
    try {
      const response = await userApi.getProfile()
      if (response.success && response.data) {
        const userData = response.data
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
      }
    } catch (error) {
      reportError(error, "Auth refresh failed")
      // 如果刷新失败，清除认证状态
      setUser(null)
      localStorage.removeItem("user")
    }
  }

  const value: AuthContextType = {
    isLoading,
    login,
    register,
    logout,
    refreshAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// 认证守卫组件
interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, fallback, requireAuth = true }: AuthGuardProps) {
  const { user } = useAppStore()
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">正在验证身份...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="text-center">
            <h2 className="text-white text-xl mb-4">需要登录</h2>
            <p className="text-white/70 mb-6">请登录后继续使用</p>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}

export default AuthProvider
