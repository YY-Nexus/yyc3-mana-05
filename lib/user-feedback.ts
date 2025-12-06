"use client"

import { apiClient } from "./api-client"
import { useAppStore } from "./store"
import { AppError, reportError } from "./error-handler"

// 用户反馈类型
interface UserFeedback {
  id: string
  userId?: string
  type: "bug" | "feature" | "improvement" | "general"
  category: "ui" | "performance" | "functionality" | "content" | "other"
  title: string
  description: string
  rating?: number // 1-5星评分
  priority: "low" | "medium" | "high" | "critical"
  status: "pending" | "reviewing" | "in-progress" | "resolved" | "closed"
  attachments?: Array<{
    name: string
    url: string
    type: string
    size: number
  }>
  metadata: {
    userAgent: string
    url: string
    timestamp: Date
    sessionId: string
    deviceInfo: {
      screen: string
      viewport: string
      platform: string
      language: string
    }
  }
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

// A/B测试配置
interface ABTestConfig {
  id: string
  name: string
  description: string
  variants: Array<{
    id: string
    name: string
    weight: number
    config: Record<string, any>
  }>
  targetAudience: {
    percentage: number
    criteria: Record<string, any>
  }
  metrics: string[]
  startDate: Date
  endDate: Date
  status: "draft" | "running" | "paused" | "completed"
}

// 用户行为事件
interface UserEvent {
  id: string
  userId?: string
  sessionId: string
  eventType: string
  eventData: Record<string, any>
  timestamp: Date
  page: string
  userAgent: string
}

// 用户满意度调查
interface SatisfactionSurvey {
  id: string
  title: string
  questions: Array<{
    id: string
    type: "rating" | "choice" | "text" | "nps"
    question: string
    options?: string[]
    required: boolean
  }>
  targetPages: string[]
  frequency: "once" | "daily" | "weekly" | "monthly"
  status: "active" | "inactive"
}

class UserFeedbackSystem {
  private sessionId: string
  private eventQueue: UserEvent[] = []
  private abTestAssignments: Map<string, string> = new Map()

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeEventTracking()
    this.loadABTestAssignments()
  }

  // 生成会话ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 初始化事件追踪
  private initializeEventTracking(): void {
    if (typeof window === "undefined") return

    // 页面访问事件
    this.trackEvent("page_view", {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
    })

    // 页面离开事件
    window.addEventListener("beforeunload", () => {
      this.trackEvent("page_leave", {
        url: window.location.href,
        timeOnPage: Date.now() - performance.timing.navigationStart,
      })
      this.flushEventQueue()
    })

    // 点击事件追踪
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement
      if (target.tagName === "BUTTON" || target.tagName === "A" || target.hasAttribute("data-track")) {
        this.trackEvent("click", {
          element: target.tagName,
          text: target.textContent?.trim() || "",
          className: target.className,
          id: target.id,
          href: target.getAttribute("href"),
          coordinates: { x: event.clientX, y: event.clientY },
        })
      }
    })

    // 表单提交事件
    document.addEventListener("submit", (event) => {
      const form = event.target as HTMLFormElement
      this.trackEvent("form_submit", {
        formId: form.id,
        formAction: form.action,
        formMethod: form.method,
      })
    })

    // 错误事件追踪
    window.addEventListener("error", (event) => {
      this.trackEvent("javascript_error", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      })
    })

    // 定期发送事件队列
    setInterval(() => {
      this.flushEventQueue()
    }, 30000) // 每30秒发送一次
  }

  // 追踪用户事件
  trackEvent(eventType: string, eventData: Record<string, any> = {}): void {
    const event: UserEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: useAppStore.getState().user?.id,
      sessionId: this.sessionId,
      eventType,
      eventData: {
        ...eventData,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        screen: `${screen.width}x${screen.height}`,
        timestamp: Date.now(),
      },
      timestamp: new Date(),
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    }

    this.eventQueue.push(event)

    // 如果队列过长，立即发送
    if (this.eventQueue.length >= 10) {
      this.flushEventQueue()
    }
  }

  // 发送事件队列
  private async flushEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return

    const events = [...this.eventQueue]
    this.eventQueue = []

    try {
      await apiClient.post("/analytics/events", { events })
    } catch (error) {
      // 如果发送失败，将事件重新加入队列
      this.eventQueue.unshift(...events)
      reportError(error, "Event Queue Flush")
    }
  }

  // 提交用户反馈
  async submitFeedback(
    feedback: Omit<UserFeedback, "id" | "createdAt" | "updatedAt" | "metadata">,
  ): Promise<UserFeedback> {
    try {
      const deviceInfo = {
        screen: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        platform: navigator.platform,
        language: navigator.language,
      }

      const fullFeedback: UserFeedback = {
        ...feedback,
        id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: useAppStore.getState().user?.id,
        metadata: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date(),
          sessionId: this.sessionId,
          deviceInfo,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const response = await apiClient.post("/feedback", fullFeedback)

      // 追踪反馈提交事件
      this.trackEvent("feedback_submitted", {
        feedbackId: fullFeedback.id,
        type: feedback.type,
        category: feedback.category,
        rating: feedback.rating,
      })

      useAppStore.getState().addNotification({
        type: "success",
        title: "反馈提交成功",
        message: "感谢您的反馈，我们会认真处理您的建议！",
      })

      return response.data
    } catch (error) {
      reportError(error, "Feedback Submission")
      throw new AppError("反馈提交失败，请稍后重试", "FEEDBACK_SUBMISSION_FAILED")
    }
  }

  // 获取用户反馈列表
  async getFeedbackList(filters?: {
    type?: string
    category?: string
    status?: string
    userId?: string
    limit?: number
    offset?: number
  }): Promise<{ feedbacks: UserFeedback[]; total: number }> {
    try {
      const response = await apiClient.get("/feedback", filters)
      return response.data
    } catch (error) {
      reportError(error, "Feedback List Fetch")
      throw new AppError("获取反馈列表失败", "FEEDBACK_LIST_FETCH_FAILED")
    }
  }

  // 更新反馈状态
  async updateFeedbackStatus(feedbackId: string, status: UserFeedback["status"], comment?: string): Promise<void> {
    try {
      await apiClient.patch(`/feedback/${feedbackId}`, { status, comment })

      this.trackEvent("feedback_status_updated", {
        feedbackId,
        newStatus: status,
        comment,
      })
    } catch (error) {
      reportError(error, "Feedback Status Update")
      throw new AppError("更新反馈状态失败", "FEEDBACK_STATUS_UPDATE_FAILED")
    }
  }

  // 加载A/B测试分配
  private loadABTestAssignments(): void {
    const stored = localStorage.getItem("ab_test_assignments")
    if (stored) {
      try {
        const assignments = JSON.parse(stored)
        this.abTestAssignments = new Map(Object.entries(assignments))
      } catch (error) {
        console.warn("Failed to load A/B test assignments:", error)
      }
    }
  }

  // 保存A/B测试分配
  private saveABTestAssignments(): void {
    const assignments = Object.fromEntries(this.abTestAssignments)
    localStorage.setItem("ab_test_assignments", JSON.stringify(assignments))
  }

  // 获取A/B测试变体
  async getABTestVariant(testId: string): Promise<string | null> {
    // 检查是否已有分配
    if (this.abTestAssignments.has(testId)) {
      return this.abTestAssignments.get(testId) || null
    }

    try {
      // 从服务器获取测试配置
      const response = await apiClient.get(`/ab-tests/${testId}`)
      const testConfig: ABTestConfig = response.data

      if (testConfig.status !== "running") {
        return null
      }

      // 检查用户是否符合目标受众
      const userId = useAppStore.getState().user?.id
      const userHash = userId ? this.hashString(userId) : this.hashString(this.sessionId)
      const userPercentile = userHash % 100

      if (userPercentile >= testConfig.targetAudience.percentage) {
        return null
      }

      // 根据权重分配变体
      let cumulativeWeight = 0
      const randomValue = Math.random() * 100

      for (const variant of testConfig.variants) {
        cumulativeWeight += variant.weight
        if (randomValue <= cumulativeWeight) {
          this.abTestAssignments.set(testId, variant.id)
          this.saveABTestAssignments()

          // 追踪A/B测试分配
          this.trackEvent("ab_test_assigned", {
            testId,
            variantId: variant.id,
            variantName: variant.name,
          })

          return variant.id
        }
      }

      return null
    } catch (error) {
      reportError(error, "A/B Test Variant Assignment")
      return null
    }
  }

  // 追踪A/B测试转化
  trackABTestConversion(testId: string, metric: string, value = 1): void {
    const variantId = this.abTestAssignments.get(testId)
    if (!variantId) return

    this.trackEvent("ab_test_conversion", {
      testId,
      variantId,
      metric,
      value,
    })
  }

  // 字符串哈希函数
  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash)
  }

  // 显示满意度调查
  async showSatisfactionSurvey(surveyId: string): Promise<void> {
    try {
      const response = await apiClient.get(`/surveys/${surveyId}`)
      const survey: SatisfactionSurvey = response.data

      if (survey.status !== "active") {
        return
      }

      // 检查是否应该显示调查
      const lastShown = localStorage.getItem(`survey_${surveyId}_last_shown`)
      const now = Date.now()

      if (lastShown) {
        const lastShownTime = Number.parseInt(lastShown)
        const timeDiff = now - lastShownTime

        switch (survey.frequency) {
          case "once":
            return // 已经显示过，不再显示
          case "daily":
            if (timeDiff < 24 * 60 * 60 * 1000) return
            break
          case "weekly":
            if (timeDiff < 7 * 24 * 60 * 60 * 1000) return
            break
          case "monthly":
            if (timeDiff < 30 * 24 * 60 * 60 * 1000) return
            break
        }
      }

      // 显示调查弹窗
      this.displaySurveyModal(survey)
      localStorage.setItem(`survey_${surveyId}_last_shown`, now.toString())

      this.trackEvent("survey_shown", {
        surveyId,
        surveyTitle: survey.title,
      })
    } catch (error) {
      reportError(error, "Satisfaction Survey Display")
    }
  }

  // 显示调查模态框
  private displaySurveyModal(survey: SatisfactionSurvey): void {
    // 创建调查模态框
    const modal = document.createElement("div")
    modal.className = "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">${survey.title}</h3>
          <button class="survey-close text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <form class="survey-form space-y-4">
          ${survey.questions.map((question, index) => this.renderSurveyQuestion(question, index)).join("")}
          <div class="flex gap-3 pt-4">
            <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              提交
            </button>
            <button type="button" class="survey-close px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
              跳过
            </button>
          </div>
        </form>
      </div>
    `

    // 添加事件监听器
    const closeButtons = modal.querySelectorAll(".survey-close")
    closeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        document.body.removeChild(modal)
        this.trackEvent("survey_closed", { surveyId: survey.id })
      })
    })

    const form = modal.querySelector(".survey-form") as HTMLFormElement
    form.addEventListener("submit", async (event) => {
      event.preventDefault()
      await this.submitSurveyResponse(survey.id, form)
      document.body.removeChild(modal)
    })

    document.body.appendChild(modal)
  }

  // 渲染调查问题
  private renderSurveyQuestion(question: any, index: number): string {
    const required = question.required ? "required" : ""

    switch (question.type) {
      case "rating":
        return `
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              ${question.question} ${question.required ? "*" : ""}
            </label>
            <div class="flex gap-2">
              ${Array.from(
                { length: 5 },
                (_, i) => `
                <label class="flex items-center">
                  <input type="radio" name="question_${index}" value="${i + 1}" ${required} class="sr-only">
                  <div class="w-8 h-8 border-2 border-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:border-yellow-400 peer-checked:border-yellow-400 peer-checked:bg-yellow-400">
                    <svg class="w-4 h-4 text-white hidden peer-checked:block" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </div>
                </label>
              `,
              ).join("")}
            </div>
          </div>
        `

      case "choice":
        return `
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              ${question.question} ${question.required ? "*" : ""}
            </label>
            <div class="space-y-2">
              ${
                question.options
                  ?.map(
                    (option: string, optionIndex: number) => `
                <label class="flex items-center">
                  <input type="radio" name="question_${index}" value="${option}" ${required} class="mr-2">
                  <span class="text-sm text-gray-700">${option}</span>
                </label>
              `,
                  )
                  .join("") || ""
              }
            </div>
          </div>
        `

      case "text":
        return `
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              ${question.question} ${question.required ? "*" : ""}
            </label>
            <textarea name="question_${index}" rows="3" ${required} 
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入您的回答..."></textarea>
          </div>
        `

      case "nps":
        return `
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              ${question.question} ${question.required ? "*" : ""}
            </label>
            <div class="flex gap-1">
              ${Array.from(
                { length: 11 },
                (_, i) => `
                <label class="flex-1">
                  <input type="radio" name="question_${index}" value="${i}" ${required} class="sr-only peer">
                  <div class="w-full h-10 border border-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-blue-50 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 text-sm font-medium">
                    ${i}
                  </div>
                </label>
              `,
              ).join("")}
            </div>
            <div class="flex justify-between text-xs text-gray-500">
              <span>完全不推荐</span>
              <span>非常推荐</span>
            </div>
          </div>
        `

      default:
        return ""
    }
  }

  // 提交调查回答
  private async submitSurveyResponse(surveyId: string, form: HTMLFormElement): Promise<void> {
    try {
      const formData = new FormData(form)
      const responses: Record<string, string> = {}

      for (const [key, value] of formData.entries()) {
        responses[key] = value.toString()
      }

      await apiClient.post(`/surveys/${surveyId}/responses`, {
        responses,
        sessionId: this.sessionId,
        userId: useAppStore.getState().user?.id,
        timestamp: new Date(),
      })

      this.trackEvent("survey_submitted", {
        surveyId,
        responseCount: Object.keys(responses).length,
      })

      useAppStore.getState().addNotification({
        type: "success",
        title: "调查提交成功",
        message: "感谢您的参与，您的意见对我们很重要！",
      })
    } catch (error) {
      reportError(error, "Survey Response Submission")
      useAppStore.getState().addNotification({
        type: "error",
        title: "提交失败",
        message: "调查提交失败，请稍后重试",
      })
    }
  }

  // 获取用户行为分析
  async getUserBehaviorAnalytics(timeRange: "day" | "week" | "month" = "week"): Promise<{
    pageViews: number
    uniqueVisitors: number
    averageSessionDuration: number
    bounceRate: number
    topPages: Array<{ page: string; views: number }>
    topEvents: Array<{ event: string; count: number }>
  }> {
    try {
      const response = await apiClient.get("/analytics/behavior", { timeRange })
      return response.data
    } catch (error) {
      reportError(error, "User Behavior Analytics Fetch")
      throw new AppError("获取用户行为分析失败", "ANALYTICS_FETCH_FAILED")
    }
  }

  // 获取性能分析
  async getPerformanceAnalytics(): Promise<{
    averageLoadTime: number
    performanceScore: number
    coreWebVitals: {
      fcp: number
      lcp: number
      fid: number
      cls: number
    }
    deviceBreakdown: Record<string, number>
    browserBreakdown: Record<string, number>
  }> {
    try {
      const response = await apiClient.get("/analytics/performance")
      return response.data
    } catch (error) {
      reportError(error, "Performance Analytics Fetch")
      throw new AppError("获取性能分析失败", "PERFORMANCE_ANALYTICS_FETCH_FAILED")
    }
  }

  // 清理资源
  cleanup(): void {
    this.flushEventQueue()
  }
}

// 导出用户反馈系统实例
export const userFeedbackSystem = new UserFeedbackSystem()

// 导出相关类型
export type { UserFeedback, ABTestConfig, UserEvent, SatisfactionSurvey }
