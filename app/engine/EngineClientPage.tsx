"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import {
  Cpu,
  Zap,
  Settings,
  Search,
  RefreshCw,
  AlertCircle,
  Activity,
  BarChart3,
  Code,
  ImageIcon,
  Video,
  Music,
  MessageSquare,
  FileText,
  Monitor,
  Play,
  Download,
  Database,
  HardDrive,
  Wifi,
  Clock,
  QrCode,
  Trash2,
  StopCircle,
  PlayCircle,
  Save,
  X,
  Scan,
  Loader2,
} from "lucide-react"
import { useAppStore } from "@/lib/store"

interface AIModel {
  id: string
  name: string
  provider: string
  type: "text" | "image" | "video" | "audio" | "code"
  status: "active" | "inactive" | "loading" | "error"
  version: string
  description: string
  capabilities: string[]
  pricing: {
    input: number
    output: number
    unit: string
  }
  performance: {
    speed: number
    accuracy: number
    reliability: number
  }
  parameters: {
    temperature: number
    maxTokens: number
    topP: number
    frequencyPenalty: number
    presencePenalty: number
  }
  isLocal: boolean
  size?: string
  path?: string
  port?: number
}

interface APICall {
  id: string
  timestamp: Date
  model: string
  endpoint: string
  method: string
  status: "success" | "error" | "pending"
  responseTime: number
  inputTokens: number
  outputTokens: number
  cost: number
}

interface SystemMetrics {
  cpu: number
  memory: number
  storage: number
  network: number
  requests: number
  errors: number
}

interface LocalModel {
  id: string
  name: string
  path: string
  size: string
  status: "available" | "downloading" | "error"
  progress?: number
}

export function EngineClientPage() {
  const { addNotification } = useAppStore()

  // AI模型状态
  const [aiModels, setAiModels] = useState<AIModel[]>([
    {
      id: "gpt-4",
      name: "GPT-4",
      provider: "OpenAI",
      type: "text",
      status: "active",
      version: "4.0",
      description: "最先进的大语言模型，支持复杂推理和创作",
      capabilities: ["文本生成", "代码编写", "翻译", "问答", "创意写作"],
      pricing: { input: 0.03, output: 0.06, unit: "1K tokens" },
      performance: { speed: 85, accuracy: 95, reliability: 98 },
      parameters: {
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1.0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
      },
      isLocal: false,
    },
    {
      id: "claude-3",
      name: "Claude 3",
      provider: "Anthropic",
      type: "text",
      status: "active",
      version: "3.0",
      description: "安全可靠的AI助手，擅长分析和推理",
      capabilities: ["文本分析", "逻辑推理", "代码审查", "内容总结"],
      pricing: { input: 0.025, output: 0.05, unit: "1K tokens" },
      performance: { speed: 80, accuracy: 92, reliability: 96 },
      parameters: {
        temperature: 0.5,
        maxTokens: 8192,
        topP: 0.9,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1,
      },
      isLocal: false,
    },
    {
      id: "llama-3-8b",
      name: "Llama 3 8B",
      provider: "Meta",
      type: "text",
      status: "inactive",
      version: "3.0",
      description: "开源大语言模型，支持本地部署",
      capabilities: ["文本生成", "对话", "翻译", "代码生成"],
      pricing: { input: 0, output: 0, unit: "免费" },
      performance: { speed: 70, accuracy: 85, reliability: 90 },
      parameters: {
        temperature: 0.8,
        maxTokens: 2048,
        topP: 0.95,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
      },
      isLocal: true,
      size: "4.7GB",
      path: "/models/llama-3-8b",
      port: 8080,
    },
  ])

  // API调用历史
  const [apiCalls, setApiCalls] = useState<APICall[]>([])

  // 系统指标
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    storage: 0,
    network: 0,
    requests: 0,
    errors: 0,
  })

  // 本地模型列表
  const [localModels, setLocalModels] = useState<LocalModel[]>([
    {
      id: "llama-3-8b",
      name: "Llama 3 8B",
      path: "/models/llama-3-8b",
      size: "4.7GB",
      status: "available",
    },
    {
      id: "qwen-7b",
      name: "Qwen 7B",
      path: "/models/qwen-7b",
      size: "3.9GB",
      status: "available",
    },
  ])

  // 当前选中的模型
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(aiModels[0])
  const [testInput, setTestInput] = useState("")
  const [testOutput, setTestOutput] = useState("")
  const [isTestingAPI, setIsTestingAPI] = useState(false)
  const [editingModel, setEditingModel] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)

  // 搜索和过滤
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // 获取真实系统指标
  useEffect(() => {
    const fetchSystemMetrics = async () => {
      try {
        // 模拟获取真实系统指标
        const metrics = {
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          storage: Math.random() * 100,
          network: Math.random() * 100,
          requests: apiCalls.length,
          errors: apiCalls.filter((call) => call.status === "error").length,
        }
        setSystemMetrics(metrics)
      } catch (error) {
        console.error("Failed to fetch system metrics:", error)
      }
    }

    fetchSystemMetrics()
    const interval = setInterval(fetchSystemMetrics, 5000)
    return () => clearInterval(interval)
  }, [apiCalls])

  // 自动发现本地模型
  const scanLocalModels = async () => {
    setIsScanning(true)
    try {
      // 模拟扫描本地模型
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const discoveredModels: LocalModel[] = [
        {
          id: "chatglm-6b",
          name: "ChatGLM 6B",
          path: "/models/chatglm-6b",
          size: "6.2GB",
          status: "available",
        },
        {
          id: "baichuan-7b",
          name: "Baichuan 7B",
          path: "/models/baichuan-7b",
          size: "7.1GB",
          status: "available",
        },
      ]

      setLocalModels((prev) => [...prev, ...discoveredModels])
      addNotification({
        type: "success",
        title: "模型扫描完成",
        message: `发现 ${discoveredModels.length} 个新模型`,
      })
    } catch (error) {
      addNotification({
        type: "error",
        title: "扫描失败",
        message: "无法扫描本地模型",
      })
    } finally {
      setIsScanning(false)
    }
  }

  // 扫码发现模型
  const scanQRCode = async () => {
    setShowQRScanner(true)
    try {
      // 模拟扫码过程
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const qrModel: LocalModel = {
        id: "custom-model",
        name: "Custom Model",
        path: "/models/custom-model",
        size: "5.3GB",
        status: "available",
      }

      setLocalModels((prev) => [...prev, qrModel])
      addNotification({
        type: "success",
        title: "扫码成功",
        message: "已添加自定义模型",
      })
    } catch (error) {
      addNotification({
        type: "error",
        title: "扫码失败",
        message: "无法识别二维码",
      })
    } finally {
      setShowQRScanner(false)
    }
  }

  // 启动模型
  const startModel = async (modelId: string) => {
    setAiModels((prev) => prev.map((model) => (model.id === modelId ? { ...model, status: "loading" } : model)))

    try {
      // 模拟启动过程
      await new Promise((resolve) => setTimeout(resolve, 3000))

      setAiModels((prev) => prev.map((model) => (model.id === modelId ? { ...model, status: "active" } : model)))

      addNotification({
        type: "success",
        title: "模型启动成功",
        message: `${modelId} 已成功启动`,
      })
    } catch (error) {
      setAiModels((prev) => prev.map((model) => (model.id === modelId ? { ...model, status: "error" } : model)))

      addNotification({
        type: "error",
        title: "启动失败",
        message: `无法启动模型 ${modelId}`,
      })
    }
  }

  // 停止模型
  const stopModel = async (modelId: string) => {
    setAiModels((prev) => prev.map((model) => (model.id === modelId ? { ...model, status: "loading" } : model)))

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setAiModels((prev) => prev.map((model) => (model.id === modelId ? { ...model, status: "inactive" } : model)))

      addNotification({
        type: "success",
        title: "模型已停止",
        message: `${modelId} 已成功停止`,
      })
    } catch (error) {
      addNotification({
        type: "error",
        title: "停止失败",
        message: `无法停止模型 ${modelId}`,
      })
    }
  }

  // 删除模型
  const deleteModel = async (modelId: string) => {
    if (!confirm("确定要删除这个模型吗？")) return

    try {
      setAiModels((prev) => prev.filter((model) => model.id !== modelId))
      setLocalModels((prev) => prev.filter((model) => model.id !== modelId))

      addNotification({
        type: "success",
        title: "模型已删除",
        message: `${modelId} 已成功删除`,
      })
    } catch (error) {
      addNotification({
        type: "error",
        title: "删除失败",
        message: `无法删除模型 ${modelId}`,
      })
    }
  }

  // 更新模型参数
  const updateModelParameters = (modelId: string, parameters: Partial<AIModel["parameters"]>) => {
    setAiModels((prev) =>
      prev.map((model) =>
        model.id === modelId ? { ...model, parameters: { ...model.parameters, ...parameters } } : model,
      ),
    )
  }

  // 测试API
  const testAPI = async () => {
    if (!selectedModel || !testInput.trim()) return

    setIsTestingAPI(true)
    setTestOutput("正在处理请求...")

    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockResponse = `模型: ${selectedModel.name}\n输入: ${testInput}\n\n模拟响应:\n这是来自${selectedModel.name}的测试响应。实际使用时，这里会显示模型的真实输出结果。\n\n响应时间: ${Math.floor(Math.random() * 2000 + 500)}ms\n状态: 成功`

      setTestOutput(mockResponse)

      // 添加到调用历史
      const newCall: APICall = {
        id: Date.now().toString(),
        timestamp: new Date(),
        model: selectedModel.name,
        endpoint: "/v1/test",
        method: "POST",
        status: "success",
        responseTime: Math.floor(Math.random() * 2000 + 500),
        inputTokens: Math.floor(testInput.length / 4),
        outputTokens: Math.floor(mockResponse.length / 4),
        cost: Math.random() * 0.1,
      }

      setApiCalls((prev) => [newCall, ...prev.slice(0, 9)])

      addNotification({
        type: "success",
        title: "API测试成功",
        message: `${selectedModel.name} 响应正常`,
      })
    } catch (error) {
      setTestOutput("API调用失败，请检查模型状态和网络连接。")
      addNotification({
        type: "error",
        title: "API测试失败",
        message: "请检查模型状态",
      })
    } finally {
      setIsTestingAPI(false)
    }
  }

  // 过滤模型
  const filteredModels = aiModels.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.provider.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || model.type === filterType
    const matchesStatus = filterStatus === "all" || model.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* 顶部状态栏 */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-6 h-6 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">智能引擎控制中心</h1>
            </div>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300">
              {aiModels.filter((m) => m.status === "active").length} 个模型在线
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Activity className="w-4 h-4" />
              <span>请求: {systemMetrics.requests}</span>
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>错误: {systemMetrics.errors}</span>
            </div>
            <Button size="sm" variant="outline" className="border-white/20 text-white bg-transparent">
              <Settings className="w-4 h-4 mr-1" />
              设置
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* 左侧面板 - 模型管理 */}
        <div className="w-96 bg-black/20 backdrop-blur-md border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">AI模型库</h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white/60 hover:text-white"
                  onClick={scanLocalModels}
                  disabled={isScanning}
                >
                  {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="ghost" className="text-white/60 hover:text-white" onClick={scanQRCode}>
                  <QrCode className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white/60 hover:text-white">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 搜索和过滤 */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  placeholder="搜索模型..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border border-white/20 rounded px-3 py-1 text-white placeholder:text-white/40"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm"
                >
                  <option value="all">所有类型</option>
                  <option value="text">文本</option>
                  <option value="image">图像</option>
                  <option value="video">视频</option>
                  <option value="audio">音频</option>
                  <option value="code">代码</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm"
                >
                  <option value="all">所有状态</option>
                  <option value="active">在线</option>
                  <option value="inactive">离线</option>
                  <option value="loading">加载中</option>
                </select>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {filteredModels.map((model) => (
                <Card
                  key={model.id}
                  className={`bg-white/10 border-white/20 cursor-pointer transition-all hover:bg-white/20 ${
                    selectedModel?.id === model.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedModel(model)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {model.type === "text" && <MessageSquare className="w-5 h-5 text-blue-400" />}
                        {model.type === "image" && <ImageIcon className="w-5 h-5 text-green-400" />}
                        {model.type === "video" && <Video className="w-5 h-5 text-purple-400" />}
                        {model.type === "audio" && <Music className="w-5 h-5 text-orange-400" />}
                        {model.type === "code" && <Code className="w-5 h-5 text-yellow-400" />}
                        <div>
                          <CardTitle className="text-white text-sm">{model.name}</CardTitle>
                          <CardDescription className="text-white/60 text-xs">
                            {model.provider} v{model.version}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={model.status === "active" ? "default" : "secondary"}
                          className={
                            model.status === "active"
                              ? "bg-green-500/20 text-green-300"
                              : model.status === "loading"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : model.status === "error"
                                  ? "bg-red-500/20 text-red-300"
                                  : "bg-gray-500/20 text-gray-300"
                          }
                        >
                          {model.status === "active"
                            ? "在线"
                            : model.status === "loading"
                              ? "加载中"
                              : model.status === "error"
                                ? "错误"
                                : "离线"}
                        </Badge>
                        {model.isLocal && (
                          <Badge variant="outline" className="border-blue-500/30 text-blue-300 text-xs">
                            本地
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-white/70 text-xs mb-2">{model.description}</p>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-white/60">
                        {model.isLocal ? "免费" : `$${model.pricing.input}/${model.pricing.unit}`}
                      </span>
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            model.status === "active"
                              ? "bg-green-400"
                              : model.status === "loading"
                                ? "bg-yellow-400"
                                : model.status === "error"
                                  ? "bg-red-400"
                                  : "bg-gray-400"
                          }`}
                        />
                        <span className="text-white/60 text-xs">{model.performance.reliability}%</span>
                      </div>
                    </div>

                    {/* 模型控制按钮 */}
                    <div className="flex gap-1 mt-2">
                      {model.status === "inactive" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500/30 text-green-300 hover:bg-green-500/20 flex-1 text-xs bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            startModel(model.id)
                          }}
                        >
                          <PlayCircle className="w-3 h-3 mr-1" />
                          启动
                        </Button>
                      )}
                      {model.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/30 text-red-300 hover:bg-red-500/20 flex-1 text-xs bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            stopModel(model.id)
                          }}
                        >
                          <StopCircle className="w-3 h-3 mr-1" />
                          停止
                        </Button>
                      )}
                      {model.isLocal && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/30 text-red-300 hover:bg-red-500/20 text-xs bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteModel(model.id)
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* 中央面板 - 主要内容 */}
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="overview" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-5 bg-white/10 m-4 mb-0">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">
                <BarChart3 className="w-4 h-4 mr-1" />
                概览
              </TabsTrigger>
              <TabsTrigger value="test" className="text-white data-[state=active]:bg-white/20">
                <Zap className="w-4 h-4 mr-1" />
                测试
              </TabsTrigger>
              <TabsTrigger value="parameters" className="text-white data-[state=active]:bg-white/20">
                <Settings className="w-4 h-4 mr-1" />
                参数
              </TabsTrigger>
              <TabsTrigger value="monitor" className="text-white data-[state=active]:bg-white/20">
                <Monitor className="w-4 h-4 mr-1" />
                监控
              </TabsTrigger>
              <TabsTrigger value="logs" className="text-white data-[state=active]:bg-white/20">
                <FileText className="w-4 h-4 mr-1" />
                日志
              </TabsTrigger>
            </TabsList>

            {/* 概览标签页 */}
            <TabsContent value="overview" className="flex-1 p-4 space-y-4">
              {selectedModel ? (
                <div className="space-y-6">
                  {/* 模型详情卡片 */}
                  <Card className="bg-white/10 border-white/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {selectedModel.type === "text" && <MessageSquare className="w-8 h-8 text-blue-400" />}
                          {selectedModel.type === "image" && <ImageIcon className="w-8 h-8 text-green-400" />}
                          {selectedModel.type === "video" && <Video className="w-8 h-8 text-purple-400" />}
                          {selectedModel.type === "audio" && <Music className="w-8 h-8 text-orange-400" />}
                          {selectedModel.type === "code" && <Code className="w-8 h-8 text-yellow-400" />}
                          <div>
                            <CardTitle className="text-white text-xl">{selectedModel.name}</CardTitle>
                            <CardDescription className="text-white/70">
                              {selectedModel.provider} • 版本 {selectedModel.version}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={selectedModel.status === "active" ? "default" : "secondary"}
                            className={
                              selectedModel.status === "active"
                                ? "bg-green-500/20 text-green-300"
                                : selectedModel.status === "loading"
                                  ? "bg-yellow-500/20 text-yellow-300"
                                  : selectedModel.status === "error"
                                    ? "bg-red-500/20 text-red-300"
                                    : "bg-gray-500/20 text-gray-300"
                            }
                          >
                            {selectedModel.status === "active"
                              ? "在线"
                              : selectedModel.status === "loading"
                                ? "加载中"
                                : selectedModel.status === "error"
                                  ? "错误"
                                  : "离线"}
                          </Badge>
                          {selectedModel.isLocal && (
                            <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                              本地模型
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-white/80">{selectedModel.description}</p>

                      {/* 能力标签 */}
                      <div>
                        <h4 className="text-white font-medium mb-2">核心能力</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedModel.capabilities.map((capability, index) => (
                            <Badge key={index} variant="outline" className="border-white/20 text-white/80">
                              {capability}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* 性能指标 */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white/70 text-sm">速度</span>
                            <span className="text-white text-xs">{selectedModel.performance.speed}%</span>
                          </div>
                          <Progress value={selectedModel.performance.speed} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white/70 text-sm">准确率</span>
                            <span className="text-white text-xs">{selectedModel.performance.accuracy}%</span>
                          </div>
                          <Progress value={selectedModel.performance.accuracy} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white/70 text-sm">可靠性</span>
                            <span className="text-white text-xs">{selectedModel.performance.reliability}%</span>
                          </div>
                          <Progress value={selectedModel.performance.reliability} className="h-2" />
                        </div>
                      </div>

                      {/* 定价信息 */}
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">定价信息</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-white/70">输入成本:</span>
                            <span className="text-white ml-2 text-xs">
                              {selectedModel.isLocal
                                ? "免费"
                                : `$${selectedModel.pricing.input}/${selectedModel.pricing.unit}`}
                            </span>
                          </div>
                          <div>
                            <span className="text-white/70">输出成本:</span>
                            <span className="text-white ml-2 text-xs">
                              {selectedModel.isLocal
                                ? "免费"
                                : `$${selectedModel.pricing.output}/${selectedModel.pricing.unit}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 本地模型信息 */}
                      {selectedModel.isLocal && (
                        <div className="bg-white/5 rounded-lg p-4">
                          <h4 className="text-white font-medium mb-2">本地部署信息</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-white/70">模型大小:</span>
                              <span className="text-white ml-2 text-xs">{selectedModel.size}</span>
                            </div>
                            <div>
                              <span className="text-white/70">存储路径:</span>
                              <span className="text-white ml-2 text-xs">{selectedModel.path}</span>
                            </div>
                            {selectedModel.port && (
                              <div>
                                <span className="text-white/70">服务端口:</span>
                                <span className="text-white ml-2 text-xs">{selectedModel.port}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Cpu className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 text-lg mb-2">选择一个AI模型</p>
                    <p className="text-white/40 text-sm">从左侧列表中选择一个模型来查看详情</p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* 测试标签页 */}
            <TabsContent value="test" className="flex-1 p-4">
              {selectedModel ? (
                <div className="h-full flex flex-col space-y-4">
                  <Card className="bg-white/10 border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        API测试 - {selectedModel.name}
                      </CardTitle>
                      <CardDescription className="text-white/70">测试模型的响应和性能</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-96">
                        <div className="space-y-2">
                          <label className="text-white text-sm font-medium">输入内容</label>
                          <Textarea
                            placeholder={`输入要发送给${selectedModel.name}的内容...`}
                            value={testInput}
                            onChange={(e) => setTestInput(e.target.value)}
                            className="h-full bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-white text-sm font-medium">输出结果</label>
                          <Textarea
                            placeholder="模型响应将显示在这里..."
                            value={testOutput}
                            readOnly
                            className="h-full bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <Clock className="w-4 h-4" />
                          <span>预计响应时间: 1-3秒</span>
                        </div>
                        <Button
                          onClick={testAPI}
                          disabled={isTestingAPI || !testInput.trim() || selectedModel.status !== "active"}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                        >
                          {isTestingAPI ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              测试中...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              发送测试
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Zap className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 text-lg mb-2">选择模型进行测试</p>
                    <p className="text-white/40 text-sm">从左侧选择一个在线模型来测试API</p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* 参数调优标签页 */}
            <TabsContent value="parameters" className="flex-1 p-4">
              {selectedModel ? (
                <div className="space-y-6">
                  <Card className="bg-white/10 border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        模型参数调优 - {selectedModel.name}
                      </CardTitle>
                      <CardDescription className="text-white/70">调整模型参数以获得最佳性能和输出质量</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Temperature */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-white font-medium">Temperature (创造性)</label>
                          <span className="text-white/70 text-xs">{selectedModel.parameters.temperature}</span>
                        </div>
                        <Slider
                          value={[selectedModel.parameters.temperature]}
                          onValueChange={(value) => updateModelParameters(selectedModel.id, { temperature: value[0] })}
                          max={2}
                          min={0}
                          step={0.1}
                          className="w-full"
                        />
                        <p className="text-white/60 text-xs">较低值使输出更确定性，较高值使输出更随机和创造性</p>
                      </div>

                      {/* Max Tokens */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-white font-medium">Max Tokens (最大长度)</label>
                          <span className="text-white/70 text-xs">{selectedModel.parameters.maxTokens}</span>
                        </div>
                        <Slider
                          value={[selectedModel.parameters.maxTokens]}
                          onValueChange={(value) => updateModelParameters(selectedModel.id, { maxTokens: value[0] })}
                          max={8192}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <p className="text-white/60 text-xs">控制生成文本的最大长度</p>
                      </div>

                      {/* Top P */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-white font-medium">Top P (核采样)</label>
                          <span className="text-white/70 text-xs">{selectedModel.parameters.topP}</span>
                        </div>
                        <Slider
                          value={[selectedModel.parameters.topP]}
                          onValueChange={(value) => updateModelParameters(selectedModel.id, { topP: value[0] })}
                          max={1}
                          min={0}
                          step={0.01}
                          className="w-full"
                        />
                        <p className="text-white/60 text-xs">控制词汇选择的多样性，较低值更保守</p>
                      </div>

                      {/* Frequency Penalty */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-white font-medium">Frequency Penalty (频率惩罚)</label>
                          <span className="text-white/70 text-xs">{selectedModel.parameters.frequencyPenalty}</span>
                        </div>
                        <Slider
                          value={[selectedModel.parameters.frequencyPenalty]}
                          onValueChange={(value) =>
                            updateModelParameters(selectedModel.id, { frequencyPenalty: value[0] })
                          }
                          max={2}
                          min={-2}
                          step={0.1}
                          className="w-full"
                        />
                        <p className="text-white/60 text-xs">减少重复内容的出现频率</p>
                      </div>

                      {/* Presence Penalty */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-white font-medium">Presence Penalty (存在惩罚)</label>
                          <span className="text-white/70 text-xs">{selectedModel.parameters.presencePenalty}</span>
                        </div>
                        <Slider
                          value={[selectedModel.parameters.presencePenalty]}
                          onValueChange={(value) =>
                            updateModelParameters(selectedModel.id, { presencePenalty: value[0] })
                          }
                          max={2}
                          min={-2}
                          step={0.1}
                          className="w-full"
                        />
                        <p className="text-white/60 text-xs">鼓励模型讨论新话题</p>
                      </div>

                      {/* 预设配置 */}
                      <div className="space-y-3">
                        <h4 className="text-white font-medium">预设配置</h4>
                        <div className="grid grid-cols-3 gap-3">
                          <Button
                            variant="outline"
                            className="border-white/20 text-white bg-transparent hover:bg-white/10"
                            onClick={() =>
                              updateModelParameters(selectedModel.id, {
                                temperature: 0.3,
                                topP: 0.9,
                                frequencyPenalty: 0.0,
                                presencePenalty: 0.0,
                              })
                            }
                          >
                            保守模式
                          </Button>
                          <Button
                            variant="outline"
                            className="border-white/20 text-white bg-transparent hover:bg-white/10"
                            onClick={() =>
                              updateModelParameters(selectedModel.id, {
                                temperature: 0.7,
                                topP: 1.0,
                                frequencyPenalty: 0.0,
                                presencePenalty: 0.0,
                              })
                            }
                          >
                            平衡模式
                          </Button>
                          <Button
                            variant="outline"
                            className="border-white/20 text-white bg-transparent hover:bg-white/10"
                            onClick={() =>
                              updateModelParameters(selectedModel.id, {
                                temperature: 1.2,
                                topP: 1.0,
                                frequencyPenalty: 0.5,
                                presencePenalty: 0.5,
                              })
                            }
                          >
                            创意模式
                          </Button>
                        </div>
                      </div>

                      {/* 保存按钮 */}
                      <div className="flex justify-end">
                        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                          <Save className="w-4 h-4 mr-2" />
                          保存配置
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Settings className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 text-lg mb-2">选择模型进行参数调优</p>
                    <p className="text-white/40 text-sm">从左侧选择一个模型来调整参数</p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* 监控标签页 */}
            <TabsContent value="monitor" className="flex-1 p-4 space-y-4">
              {/* 系统指标卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">CPU使用率</p>
                        <p className="text-white text-lg font-bold">{systemMetrics.cpu.toFixed(1)}%</p>
                      </div>
                      <Cpu className="w-8 h-8 text-blue-400" />
                    </div>
                    <Progress value={systemMetrics.cpu} className="mt-2" />
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">内存使用率</p>
                        <p className="text-white text-lg font-bold">{systemMetrics.memory.toFixed(1)}%</p>
                      </div>
                      <Database className="w-8 h-8 text-green-400" />
                    </div>
                    <Progress value={systemMetrics.memory} className="mt-2" />
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">存储使用率</p>
                        <p className="text-white text-lg font-bold">{systemMetrics.storage.toFixed(1)}%</p>
                      </div>
                      <HardDrive className="w-8 h-8 text-purple-400" />
                    </div>
                    <Progress value={systemMetrics.storage} className="mt-2" />
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">网络状态</p>
                        <p className="text-white text-lg font-bold">{systemMetrics.network.toFixed(1)}%</p>
                      </div>
                      <Wifi className="w-8 h-8 text-orange-400" />
                    </div>
                    <Progress value={systemMetrics.network} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              {/* 实时统计 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      实时统计
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">总请求数</span>
                      <span className="text-white font-mono text-sm">{systemMetrics.requests}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">错误数量</span>
                      <span className="text-red-400 font-mono text-sm">{systemMetrics.errors}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">成功率</span>
                      <span className="text-green-400 font-mono text-sm">
                        {systemMetrics.requests > 0
                          ? (((systemMetrics.requests - systemMetrics.errors) / systemMetrics.requests) * 100).toFixed(
                              1,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">活跃模型</span>
                      <span className="text-blue-400 font-mono text-sm">
                        {aiModels.filter((m) => m.status === "active").length}/{aiModels.length}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      模型状态
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {aiModels.map((model) => (
                      <div key={model.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {model.type === "text" && <MessageSquare className="w-4 h-4 text-blue-400" />}
                          {model.type === "image" && <ImageIcon className="w-4 h-4 text-green-400" />}
                          {model.type === "video" && <Video className="w-4 h-4 text-purple-400" />}
                          {model.type === "audio" && <Music className="w-4 h-4 text-orange-400" />}
                          {model.type === "code" && <Code className="w-4 h-4 text-yellow-400" />}
                          <span className="text-white text-sm">{model.name}</span>
                        </div>
                        <Badge
                          variant={model.status === "active" ? "default" : "secondary"}
                          className={
                            model.status === "active"
                              ? "bg-green-500/20 text-green-300"
                              : model.status === "loading"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : model.status === "error"
                                  ? "bg-red-500/20 text-red-300"
                                  : "bg-gray-500/20 text-gray-300"
                          }
                        >
                          {model.status === "active"
                            ? "在线"
                            : model.status === "loading"
                              ? "加载中"
                              : model.status === "error"
                                ? "错误"
                                : "离线"}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 日志标签页 */}
            <TabsContent value="logs" className="flex-1 p-4">
              <Card className="bg-white/10 border-white/20 h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      API调用日志
                    </CardTitle>
                    <Button size="sm" variant="outline" className="border-white/20 text-white bg-transparent">
                      <Download className="w-4 h-4 mr-1" />
                      导出日志
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="h-full">
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {apiCalls.length > 0 ? (
                        apiCalls.map((call) => (
                          <div
                            key={call.id}
                            className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10"
                          >
                            <div className="flex items-center gap-3">
                              <Badge
                                variant={
                                  call.status === "success"
                                    ? "default"
                                    : call.status === "error"
                                      ? "destructive"
                                      : "secondary"
                                }
                                className={
                                  call.status === "success"
                                    ? "bg-green-500/20 text-green-300"
                                    : call.status === "error"
                                      ? "bg-red-500/20 text-red-300"
                                      : "bg-yellow-500/20 text-yellow-300"
                                }
                              >
                                {call.method}
                              </Badge>
                              <div>
                                <div className="text-white text-sm font-medium">{call.model}</div>
                                <div className="text-white/60 text-xs">{call.endpoint}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white text-xs">
                                {call.status === "success" ? `${call.responseTime}ms` : "失败"}
                              </div>
                              <div className="text-white/60 text-xs">{call.timestamp.toLocaleTimeString()}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
                          <p className="text-white/60">暂无API调用记录</p>
                          <p className="text-white/40 text-sm">开始测试API后，调用记录将显示在这里</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* QR扫描器模态框 */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-white/10 border-white/20 w-96">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  扫描二维码
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white/60 hover:text-white"
                  onClick={() => setShowQRScanner(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square bg-white/5 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">正在扫描二维码...</p>
                  <p className="text-white/40 text-sm">请将二维码对准摄像头</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full border-white/20 text-white bg-transparent"
                onClick={() => setShowQRScanner(false)}
              >
                取消扫描
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default EngineClientPage
