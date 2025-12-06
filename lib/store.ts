"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

// 用户接口定义
interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "user" | "admin" | "premium"
  createdAt: string
  lastLoginAt: string
}

// 应用设置接口
interface AppSettings {
  theme: "light" | "dark" | "system"
  language: "zh-CN" | "en-US"
  notifications: {
    email: boolean
    push: boolean
    desktop: boolean
  }
  privacy: {
    analytics: boolean
    crashReports: boolean
  }
  performance: {
    autoSave: boolean
    preloadImages: boolean
    reducedMotion: boolean
  }
}

// 通知接口
interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  timestamp: string
  read: boolean
}

// 主应用状态接口
interface AppState {
  // 用户状态
  user: User | null
  isAuthenticated: boolean

  // 应用设置
  settings: AppSettings

  // 全局加载状态
  isLoading: boolean
  loadingMessage: string

  // 错误状态
  error: string | null
  errors: Array<{ id: string; message: string; timestamp: string }>

  // 通知状态
  notifications: Notification[]
  unreadCount: number
  lastNotificationId: string | null // 用于跟踪最新通知

  // Actions
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  setSettings: (settings: Partial<AppSettings>) => void
  updateSettings: (path: string, value: any) => void
  setLoading: (loading: boolean, message?: string) => void
  setError: (error: string | null) => void
  addError: (error: string) => void
  clearError: () => void
  clearErrors: () => void
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  clearNotifications: () => void
  logout: () => void
}

// 创建主应用状态管理
export const useAppStore = create<AppState>()(
  persist(
    immer((set, get) => ({
      // 初始状态
      user: null,
      isAuthenticated: false,
      settings: {
        theme: "dark",
        language: "zh-CN",
        notifications: {
          email: true,
          push: true,
          desktop: true,
        },
        privacy: {
          analytics: true,
          crashReports: true,
        },
        performance: {
          autoSave: true,
          preloadImages: true,
          reducedMotion: false,
        },
      },
      isLoading: false,
      loadingMessage: "",
      error: null,
      errors: [],
      notifications: [],
      unreadCount: 0,
      lastNotificationId: null,

      // Actions
      setUser: (user) =>
        set((state) => {
          state.user = user
          state.isAuthenticated = !!user
        }),

      updateUser: (updates) =>
        set((state) => {
          if (state.user) {
            Object.assign(state.user, updates)
          }
        }),

      setSettings: (newSettings) =>
        set((state) => {
          Object.assign(state.settings, newSettings)
        }),

      updateSettings: (path, value) =>
        set((state) => {
          const keys = path.split(".")
          let current: any = state.settings
          for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]]
          }
          current[keys[keys.length - 1]] = value
        }),

      setLoading: (isLoading, message = "") =>
        set((state) => {
          state.isLoading = isLoading
          state.loadingMessage = message
        }),

      setError: (error) =>
        set((state) => {
          state.error = error
        }),

      addError: (error) =>
        set((state) => {
          state.errors.push({
            id: Date.now().toString(),
            message: error,
            timestamp: new Date().toISOString(),
          })
        }),

      clearError: () =>
        set((state) => {
          state.error = null
        }),

      clearErrors: () =>
        set((state) => {
          state.errors = []
        }),

      addNotification: (notification) =>
        set((state) => {
          const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            read: false,
          }

          state.notifications.unshift(newNotification)
          state.lastNotificationId = newNotification.id

          // 重新计算未读数量
          state.unreadCount = state.notifications.filter((n) => !n.read).length

          // 限制通知数量，保持最新50条
          if (state.notifications.length > 50) {
            state.notifications = state.notifications.slice(0, 50)
            // 重新计算未读数量
            state.unreadCount = state.notifications.filter((n) => !n.read).length
          }
        }),

      markNotificationRead: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          if (notification && !notification.read) {
            notification.read = true
            // 重新计算未读数量
            state.unreadCount = state.notifications.filter((n) => !n.read).length
          }
        }),

      markAllNotificationsRead: () =>
        set((state) => {
          state.notifications.forEach((notification) => {
            notification.read = true
          })
          state.unreadCount = 0
        }),

      clearNotifications: () =>
        set((state) => {
          state.notifications = []
          state.unreadCount = 0
          state.lastNotificationId = null
        }),

      logout: () =>
        set((state) => {
          state.user = null
          state.isAuthenticated = false
          state.error = null
          state.errors = []
          state.notifications = []
          state.unreadCount = 0
          state.lastNotificationId = null
        }),
    })),
    {
      name: "yyc-app-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        settings: state.settings,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

// 稳定的选择器函数 - 直接返回基础值，避免计算
export const useUser = () => useAppStore((state) => state.user)
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated)
export const useSettings = () => useAppStore((state) => state.settings)
export const useIsLoading = () => useAppStore((state) => state.isLoading)
export const useLoadingMessage = () => useAppStore((state) => state.loadingMessage)
export const useError = () => useAppStore((state) => state.error)

// 通知相关选择器 - 使用预计算的值
export const useUnreadNotificationsCount = () => useAppStore((state) => state.unreadCount)
export const useLastNotificationId = () => useAppStore((state) => state.lastNotificationId)
export const useNotificationsLength = () => useAppStore((state) => state.notifications.length)

// 获取所有通知（稳定引用）
export const useAllNotifications = () => useAppStore((state) => state.notifications)
