import { AppError, reportError } from "./error-handler"
import { useAppStore } from "./store"

// API响应接口
interface ApiResponse<T = any> {
  data: T
  success: boolean
  message: string
  code: string
  timestamp: string
}

// API配置接口
interface ApiConfig {
  baseURL: string
  timeout: number
  headers: Record<string, string>
  retries: number
  retryDelay: number
}

// 请求拦截器类型
type RequestInterceptor = (config: RequestInit) => RequestInit | Promise<RequestInit>
type ResponseInterceptor = (response: Response) => Response | Promise<Response>

class ApiClient {
  private config: ApiConfig
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
      retries: 3,
      retryDelay: 1000,
      ...config,
    }

    // 添加默认请求拦截器
    this.addRequestInterceptor((config) => {
      const { user } = useAppStore.getState()
      if (user) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${user.id}`, // 这里应该是真实的token
        }
      }
      return config
    })
  }

  // 添加请求拦截器
  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor)
  }

  // 添加响应拦截器
  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor)
  }

  // 应用请求拦截器
  private async applyRequestInterceptors(config: RequestInit): Promise<RequestInit> {
    let finalConfig = config
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig)
    }
    return finalConfig
  }

  // 应用响应拦截器
  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let finalResponse = response
    for (const interceptor of this.responseInterceptors) {
      finalResponse = await interceptor(finalResponse)
    }
    return finalResponse
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // 核心请求方法
  private async request<T>(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<ApiResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`

    try {
      // 设置超时
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      // 准备请求配置
      let requestConfig: RequestInit = {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.config.headers,
          ...options.headers,
        },
      }

      // 应用请求拦截器
      requestConfig = await this.applyRequestInterceptors(requestConfig)

      // 发送请求
      let response = await fetch(url, requestConfig)
      clearTimeout(timeoutId)

      // 应用响应拦截器
      response = await this.applyResponseInterceptors(response)

      // 处理HTTP错误
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new AppError(
          errorData.message || `HTTP Error: ${response.status}`,
          errorData.code || "HTTP_ERROR",
          response.status,
          errorData,
        )
      }

      // 解析响应
      const data = await response.json()

      // 验证响应格式
      if (typeof data.success !== "boolean") {
        throw new AppError("Invalid API response format", "INVALID_RESPONSE")
      }

      return data
    } catch (error) {
      // 处理中止错误（超时）
      if (error instanceof Error && error.name === "AbortError") {
        throw new AppError("Request timeout", "TIMEOUT_ERROR")
      }

      // 重试逻辑
      if (retryCount < this.config.retries && this.shouldRetry(error)) {
        await this.delay(this.config.retryDelay * (retryCount + 1))
        return this.request<T>(endpoint, options, retryCount + 1)
      }

      // 报告错误
      reportError(error, `API Request: ${endpoint}`)

      // 重新抛出错误
      if (error instanceof AppError) {
        throw error
      }

      throw new AppError("Network request failed", "NETWORK_ERROR")
    }
  }

  // 判断是否应该重试
  private shouldRetry(error: unknown): boolean {
    if (error instanceof AppError) {
      // 不重试客户端错误（4xx）
      if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
        return false
      }
    }
    return true
  }

  // HTTP方法
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint
    return this.request<T>(url, { method: "GET" })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  // 文件上传
  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append("file", file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    return this.request<T>(endpoint, {
      method: "POST",
      body: formData,
      headers: {}, // 让浏览器自动设置Content-Type
    })
  }
}

// 创建默认API客户端实例
export const apiClient = new ApiClient()

// 各模块的API服务
export const imageApi = {
  generate: (params: {
    prompt: string
    negativePrompt?: string
    model: string
    size: string
    steps: number
    guidance: number
  }) => apiClient.post("/image/generate", params),

  processImage: (params: {
    mode: string
    file?: File
    prompt?: string
    model: string
  }) => apiClient.post("/image/process", params),

  upscale: (file: File, scale: number) => apiClient.upload("/image/upscale", file, { scale }),

  removeBackground: (file: File) => apiClient.upload("/image/remove-bg", file),
}

export const videoApi = {
  generate: (params: {
    prompt: string
    model: string
    duration: number
    resolution: string
    fps: string
  }) => apiClient.post("/video/generate", params),

  edit: (
    file: File,
    params: {
      operations: string[]
      model: string
    },
  ) => apiClient.upload("/video/edit", file, params),

  addEffects: (file: File, effects: string[]) => apiClient.upload("/video/effects", file, { effects }),

  generateVoice: (params: {
    text: string
    voice: string
    language: string
  }) => apiClient.post("/video/voice", params),
}

export const musicApi = {
  compose: (params: {
    prompt: string
    genre: string
    duration: number
    tempo: number
    key: string
    model: string
  }) => apiClient.post("/music/compose", params),

  edit: (file: File, operations: string[]) => apiClient.upload("/music/edit", file, { operations }),

  synthesizeVoice: (params: {
    text: string
    voice: string
    model: string
  }) => apiClient.post("/music/voice", params),

  searchLibrary: (query: string, filters?: Record<string, any>) =>
    apiClient.get("/music/library", { query, ...filters }),
}

export const codeApi = {
  generate: (params: {
    prompt: string
    language: string
    model: string
  }) => apiClient.post("/code/generate", params),

  review: (params: {
    code: string
    language: string
    model: string
  }) => apiClient.post("/code/review", params),

  fix: (params: {
    code: string
    language: string
    model: string
  }) => apiClient.post("/code/fix", params),

  complete: (params: {
    code: string
    language: string
    model: string
  }) => apiClient.post("/code/complete", params),
}

export const engineApi = {
  listModels: () => apiClient.get("/engine/models"),

  testConnection: (params: {
    model: string
    apiKey?: string
    endpoint?: string
  }) => apiClient.post("/engine/test", params),

  getModelInfo: (modelId: string) => apiClient.get(`/engine/models/${modelId}`),

  updateSettings: (settings: Record<string, any>) => apiClient.put("/engine/settings", settings),
}

// 用户相关API
export const userApi = {
  login: (credentials: { email: string; password: string }) => apiClient.post("/auth/login", credentials),

  register: (userData: { name: string; email: string; password: string }) => apiClient.post("/auth/register", userData),

  logout: () => apiClient.post("/auth/logout"),

  getProfile: () => apiClient.get("/user/profile"),

  updateProfile: (updates: Partial<{ name: string; email: string; avatar: string }>) =>
    apiClient.put("/user/profile", updates),

  changePassword: (data: { currentPassword: string; newPassword: string }) => apiClient.put("/user/password", data),

  getUsage: () => apiClient.get("/user/usage"),

  getHistory: (params?: { module?: string; limit?: number; offset?: number }) => apiClient.get("/user/history", params),
}

// 系统API
export const systemApi = {
  getStatus: () => apiClient.get("/system/status"),

  getStats: () => apiClient.get("/system/stats"),

  reportIssue: (issue: {
    type: string
    description: string
    module?: string
    severity: "low" | "medium" | "high"
  }) => apiClient.post("/system/issues", issue),
}
