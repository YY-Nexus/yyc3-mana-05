"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ImageIcon,
  Wand2,
  Upload,
  Loader2,
  Lightbulb,
  History,
  Settings,
  Layers,
  Eye,
  Save,
  Share2,
  Trash2,
  RefreshCw,
  Scissors,
  Maximize,
  Brush,
} from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { useAppStore } from "@/lib/store"
import { validateData, fileValidation } from "@/lib/validation"

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  model: string
  parameters: Record<string, any>
  timestamp: string
  status: "generating" | "completed" | "failed"
  progress?: number
}

interface ImageEditOperation {
  type: "crop" | "resize" | "rotate" | "filter" | "adjust"
  params: Record<string, any>
  timestamp: string
}

interface ModelConfig {
  id: string
  name: string
  description: string
  category: "general" | "artistic" | "realistic" | "anime"
  maxResolution: string
  features: string[]
  isAvailable: boolean
}

const availableModels: ModelConfig[] = [
  {
    id: "stable-diffusion-xl",
    name: "Stable Diffusion XL",
    description: "高质量通用图像生成模型，适合各种风格",
    category: "general",
    maxResolution: "1024x1024",
    features: ["文生图", "图生图", "高分辨率"],
    isAvailable: true,
  },
  {
    id: "midjourney-v6",
    name: "Midjourney V6",
    description: "艺术风格图像生成，创意表现力强",
    category: "artistic",
    maxResolution: "2048x2048",
    features: ["艺术风格", "创意构图", "高质量"],
    isAvailable: true,
  },
  {
    id: "dall-e-3",
    name: "DALL-E 3",
    description: "OpenAI最新图像生成模型，理解能力强",
    category: "general",
    maxResolution: "1792x1024",
    features: ["精准理解", "文字渲染", "创意生成"],
    isAvailable: true,
  },
  {
    id: "cogview-3",
    name: "CogView-3",
    description: "清华大学开发的中文优化图像生成模型",
    category: "general",
    maxResolution: "1024x1024",
    features: ["中文优化", "文化理解", "本土化"],
    isAvailable: true,
  },
  {
    id: "flux-pro",
    name: "Flux Pro",
    description: "专业级图像生成，细节丰富",
    category: "realistic",
    maxResolution: "2048x2048",
    features: ["超高清", "真实感", "专业级"],
    isAvailable: false,
  },
]

const inspirationPrompts = [
  {
    category: "科幻未来",
    prompts: [
      "赛博朋克风的猫咪宇航员漫步火星，霓虹灯反射在头盔上",
      "未来城市的空中花园，悬浮的建筑群在云层中闪闪发光",
      "机器人在雨夜中修理霓虹招牌，蒸汽朋克风格",
      "太空站内的水培农场，宇航员在照料发光的植物",
    ],
  },
  {
    category: "奇幻魔法",
    prompts: [
      "古典油画风格的机器人在花园中弹奏钢琴，阳光透过树叶",
      "水彩画风的龙在云海中翱翔，彩虹色的鳞片闪闪发光",
      "魔法师的图书馆，书籍自己在空中翻页，魔法粒子飞舞",
      "森林中的精灵村庄，树屋之间有发光的藤蔓桥梁",
    ],
  },
  {
    category: "自然风光",
    prompts: [
      "樱花飘落的日式庭院，锦鲤在池塘中游弋",
      "北极光下的雪山，星空璀璨如钻石",
      "热带雨林中的瀑布，彩虹在水雾中若隐若现",
      "沙漠中的绿洲，骆驼商队在夕阳下前行",
    ],
  },
  {
    category: "艺术风格",
    prompts: [
      "梵高风格的星空下的咖啡馆，笔触粗犷色彩浓烈",
      "莫奈印象派风格的睡莲池塘，光影变幻",
      "毕加索立体主义风格的音乐家，几何形状重组",
      "日本浮世绘风格的现代都市，传统与现代融合",
    ],
  },
]

export default function ImagePage() {
  // 基础状态
  const [activeTab, setActiveTab] = useState("generate")
  const [imageMode, setImageMode] = useState("text2img")
  const [selectedModel, setSelectedModel] = useState("stable-diffusion-xl")
  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [imageSize, setImageSize] = useState("1024x1024")
  const [steps, setSteps] = useState([30])
  const [guidance, setGuidance] = useState([7.5])
  const [seed, setSeed] = useState("")
  const [batchCount, setBatchCount] = useState(1)

  // 文件处理
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [currentPhase, setCurrentPhase] = useState("")
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)

  // 编辑状态
  const [editOperations, setEditOperations] = useState<ImageEditOperation[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editTool, setEditTool] = useState<string | null>(null)

  // UI状态
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showInspiration, setShowInspiration] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("科幻未来")

  // Store
  const { addNotification, setLoading } = useAppStore()

  // 文件上传处理
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      // 验证文件
      const validation = validateData(fileValidation.image, { file })
      if (!validation.success) {
        addNotification({
          type: "error",
          title: "文件验证失败",
          message: Object.values(validation.errors || {})[0] || "文件格式不支持",
        })
        return
      }

      setUploadedFile(file)

      // 创建预览
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      addNotification({
        type: "success",
        title: "文件上传成功",
        message: `已上传 ${file.name}，可以开始处理`,
      })
    },
    [addNotification],
  )

  // 拖拽上传
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const files = e.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (file.type.startsWith("image/")) {
          handleFileUpload({ target: { files: [file] } } as any)
        }
      }
    },
    [handleFileUpload],
  )

  // 图像生成
  const generateImage = useCallback(async () => {
    // 验证输入
    if (imageMode === "text2img" && !prompt.trim()) {
      addNotification({
        type: "warning",
        title: "请输入创作描述",
        message: "文生图模式需要输入创作描述",
      })
      return
    }

    if ((imageMode === "img2img" || imageMode === "upscale" || imageMode === "remove-bg") && !uploadedFile) {
      addNotification({
        type: "warning",
        title: "请上传图像",
        message: "当前模式需要上传参考图像",
      })
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)
    setCurrentPhase("准备中")

    try {
      // 模拟生成过程
      const phases = [
        { progress: 20, phase: "模型加载", duration: 1000 },
        { progress: 40, phase: "语义解析", duration: 1500 },
        { progress: 60, phase: "图像生成", duration: 2000 },
        { progress: 80, phase: "质量优化", duration: 1000 },
        { progress: 100, phase: "完成", duration: 500 },
      ]

      for (const { progress, phase, duration } of phases) {
        setCurrentPhase(phase)
        setGenerationProgress(progress)
        await new Promise((resolve) => setTimeout(resolve, duration))
      }

      // 创建生成结果
      const newImages: GeneratedImage[] = Array.from({ length: batchCount }, (_, index) => ({
        id: `img_${Date.now()}_${index}`,
        url: `/placeholder.svg?height=512&width=512&text=Generated+Image+${index + 1}`,
        prompt: prompt || "图像处理",
        model: selectedModel,
        parameters: {
          size: imageSize,
          steps: steps[0],
          guidance: guidance[0],
          seed: seed || Math.floor(Math.random() * 1000000),
          mode: imageMode,
        },
        timestamp: new Date().toISOString(),
        status: "completed",
      }))

      setGeneratedImages((prev) => [...newImages, ...prev])
      setSelectedImage(newImages[0])

      addNotification({
        type: "success",
        title: "图像生成完成",
        message: `成功生成 ${batchCount} 张图像`,
      })
    } catch (error) {
      addNotification({
        type: "error",
        title: "生成失败",
        message: "图像生成过程中出现错误，请重试",
      })
    } finally {
      setIsGenerating(false)
      setCurrentPhase("")
    }
  }, [imageMode, prompt, uploadedFile, selectedModel, imageSize, steps, guidance, seed, batchCount, addNotification])

  // 图像编辑操作
  const applyEditOperation = useCallback(
    (operation: ImageEditOperation) => {
      if (!selectedImage) return

      setEditOperations((prev) => [...prev, operation])

      addNotification({
        type: "info",
        title: "编辑操作已应用",
        message: `已应用${operation.type}操作`,
      })
    },
    [selectedImage, addNotification],
  )

  // 保存图像
  const saveImage = useCallback(
    (image: GeneratedImage) => {
      // 模拟保存
      addNotification({
        type: "success",
        title: "图像已保存",
        message: "图像已保存到本地相册",
      })
    },
    [addNotification],
  )

  // 分享图像
  const shareImage = useCallback(
    (image: GeneratedImage) => {
      if (navigator.share) {
        navigator.share({
          title: "AI生成图像",
          text: image.prompt,
          url: image.url,
        })
      } else {
        navigator.clipboard.writeText(image.url)
        addNotification({
          type: "success",
          title: "链接已复制",
          message: "图像链接已复制到剪贴板",
        })
      }
    },
    [addNotification],
  )

  // 删除图像
  const deleteImage = useCallback(
    (imageId: string) => {
      setGeneratedImages((prev) => prev.filter((img) => img.id !== imageId))
      if (selectedImage?.id === imageId) {
        setSelectedImage(null)
      }
      addNotification({
        type: "info",
        title: "图像已删除",
        message: "图像已从历史记录中删除",
      })
    },
    [selectedImage, addNotification],
  )

  // 使用灵感提示
  const useInspiration = useCallback(
    (inspirationPrompt: string) => {
      setPrompt(inspirationPrompt)
      setShowInspiration(false)
      addNotification({
        type: "success",
        title: "灵感已应用",
        message: "创意提示已填入，可以开始生成",
      })
    },
    [addNotification],
  )

  // 随机种子
  const randomizeSeed = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 1000000).toString()
    setSeed(newSeed)
    addNotification({
      type: "info",
      title: "种子已随机化",
      message: `新种子: ${newSeed}`,
    })
  }, [addNotification])

  useEffect(() => {
    // 确保所有 hooks 都在顶层调用
  }, [])

  return (
    <PageLayout title="🎨 研创图文" description="AI驱动的图像创作与处理工具集">
      <div className="space-y-6">
        {/* 主要功能标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-md">
            <TabsTrigger value="generate" className="data-[state=active]:bg-white/20">
              <Wand2 className="w-4 h-4 mr-2" />
              图像生成
            </TabsTrigger>
            <TabsTrigger value="edit" className="data-[state=active]:bg-white/20">
              <Brush className="w-4 h-4 mr-2" />
              图像编辑
            </TabsTrigger>
            <TabsTrigger value="batch" className="data-[state=active]:bg-white/20">
              <Layers className="w-4 h-4 mr-2" />
              批量处理
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-white/20">
              <History className="w-4 h-4 mr-2" />
              历史记录
            </TabsTrigger>
          </TabsList>

          {/* 图像生成标签页 */}
          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧控制面板 */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      生成参数配置
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 模式选择 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { id: "text2img", name: "文生图", icon: Wand2, desc: "文字生成图像" },
                        { id: "img2img", name: "图生图", icon: ImageIcon, desc: "图像变换" },
                        { id: "upscale", name: "高清化", icon: Maximize, desc: "提升分辨率" },
                        { id: "remove-bg", name: "抠图", icon: Scissors, desc: "背景移除" },
                      ].map((mode) => {
                        const IconComponent = mode.icon
                        return (
                          <div
                            key={mode.id}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                              imageMode === mode.id
                                ? "bg-purple-500/20 border-purple-400/50"
                                : "bg-white/10 border-white/20 hover:bg-white/15"
                            }`}
                            onClick={() => setImageMode(mode.id)}
                          >
                            <div className="text-center space-y-2">
                              <IconComponent className="w-8 h-8 text-white mx-auto" />
                              <div>
                                <p className="text-white font-medium">{mode.name}</p>
                                <p className="text-sm text-muted-foreground">{mode.desc}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* 模型选择 */}
                    <div className="space-y-3">
                      <Label className="text-white">AI模型选择</Label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20">
                          {availableModels.map((model) => (
                            <SelectItem key={model.id} value={model.id} disabled={!model.isAvailable}>
                              <div className="flex items-center justify-between w-full">
                                <div>
                                  <p className="font-medium">{model.name}</p>
                                  <p className="text-sm text-muted-foreground">{model.description}</p>
                                </div>
                                {!model.isAvailable && (
                                  <Badge variant="secondary" className="ml-2">
                                    即将推出
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 创作描述 */}
                    {(imageMode === "text2img" || imageMode === "img2img") && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-white">创作描述</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowInspiration(true)}
                            className="border-white/20 text-white bg-transparent hover:bg-white/10"
                          >
                            <Lightbulb className="w-4 h-4 mr-1" />
                            灵感
                          </Button>
                        </div>
                        <Textarea
                          placeholder="描述您想要生成的图像..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                          rows={4}
                        />
                      </div>
                    )}

                    {/* 负向提示 */}
                    {(imageMode === "text2img" || imageMode === "img2img") && (
                      <div className="space-y-3">
                        <Label className="text-white">负向提示（可选）</Label>
                        <Input
                          placeholder="不希望出现的元素..."
                          value={negativePrompt}
                          onChange={(e) => setNegativePrompt(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        />
                      </div>
                    )}

                    {/* 文件上传 */}
                    {(imageMode === "img2img" || imageMode === "upscale" || imageMode === "remove-bg") && (
                      <div className="space-y-3">
                        <Label className="text-white">上传图像</Label>
                        <div
                          className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-purple-400/50 transition-colors cursor-pointer"
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {uploadPreview ? (
                            <div className="space-y-4">
                              <img
                                src={uploadPreview || "/placeholder.svg"}
                                alt="Upload preview"
                                className="max-h-32 mx-auto rounded-lg"
                              />
                              <p className="text-white/80">{uploadedFile?.name}</p>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />
                              <p className="text-white/60">点击或拖拽上传图像文件</p>
                              <p className="text-white/40 text-sm mt-2">支持 JPG, PNG, WebP 格式</p>
                            </>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    )}

                    {/* 参数调节 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-white">图像尺寸</Label>
                          <Select value={imageSize} onValueChange={setImageSize}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-white/20 text-white">
                              <SelectItem value="512x512">512×512</SelectItem>
                              <SelectItem value="768x768">768×768</SelectItem>
                              <SelectItem value="1024x1024">1024×1024</SelectItem>
                              <SelectItem value="1024x768">1024×768</SelectItem>
                              <SelectItem value="768x1024">768×1024</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-white">生成步数: {steps[0]}</Label>
                          <Slider value={steps} onValueChange={setSteps} max={100} min={10} step={5} className="mt-2" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-white">引导强度: {guidance[0]}</Label>
                          <Slider
                            value={guidance}
                            onValueChange={setGuidance}
                            max={20}
                            min={1}
                            step={0.5}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <Label className="text-white">随机种子</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={randomizeSeed}
                              className="border-white/20 text-white bg-transparent hover:bg-white/10"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                          <Input
                            placeholder="留空随机生成"
                            value={seed}
                            onChange={(e) => setSeed(e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 批量生成 */}
                    <div>
                      <Label className="text-white">批量生成数量: {batchCount}</Label>
                      <Slider
                        value={[batchCount]}
                        onValueChange={(value) => setBatchCount(value[0])}
                        max={4}
                        min={1}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    {/* 生成按钮 */}
                    <Button
                      onClick={generateImage}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-4 text-lg"
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{currentPhase}</span>
                          <Badge variant="secondary" className="bg-white/20 text-white">
                            {generationProgress}%
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Wand2 className="w-5 h-5" />
                          开始生成图像
                        </div>
                      )}
                    </Button>

                    {/* 进度条 */}
                    {isGenerating && <Progress value={generationProgress} className="w-full" />}
                  </CardContent>
                </Card>
              </div>

              {/* 右侧预览面板 */}
              <div className="space-y-6">
                {/* 当前选中图像 */}
                {selectedImage && (
                  <Card className="bg-white/10 backdrop-blur-md border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center justify-between">
                        <span className="flex items-center">
                          <Eye className="w-5 h-5 mr-2" />
                          预览
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => saveImage(selectedImage)}
                            className="border-white/20 text-white bg-transparent hover:bg-white/10"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => shareImage(selectedImage)}
                            className="border-white/20 text-white bg-transparent hover:bg-white/10"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <img
                          src={selectedImage.url || "/placeholder.svg"}
                          alt="Generated"
                          className="w-full rounded-lg"
                        />
                        <div className="space-y-2">
                          <p className="text-white/80 text-sm">{selectedImage.prompt}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="border-white/20 text-white/80">
                              {selectedImage.model}
                            </Badge>
                            <Badge variant="outline" className="border-white/20 text-white/80">
                              {selectedImage.parameters.size}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 生成历史 */}
                {generatedImages.length > 0 && (
                  <Card className="bg-white/10 backdrop-blur-md border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <History className="w-5 h-5 mr-2" />
                        最近生成
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64">
                        <div className="grid grid-cols-2 gap-2">
                          {generatedImages.slice(0, 8).map((image) => (
                            <div
                              key={image.id}
                              className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                selectedImage?.id === image.id
                                  ? "border-purple-400"
                                  : "border-transparent hover:border-white/30"
                              }`}
                              onClick={() => setSelectedImage(image)}
                            >
                              <img
                                src={image.url || "/placeholder.svg"}
                                alt="Generated"
                                className="w-full aspect-square object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteImage(image.id)
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 其他标签页内容 */}
          <TabsContent value="edit">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">图像编辑工具</CardTitle>
                <CardDescription className="text-white/80">对生成的图像进行进一步编辑和优化</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Brush className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">图像编辑功能开发中...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="batch">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">批量处理</CardTitle>
                <CardDescription className="text-white/80">批量生成和处理多张图像</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Layers className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">批量处理功能开发中...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">历史记录</CardTitle>
                <CardDescription className="text-white/80">查看和管理所有生成的图像</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {generatedImages.map((image) => (
                      <div key={image.id} className="space-y-2">
                        <div className="relative group">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt="Generated"
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedImage(image)}
                              className="border-white/20 text-white bg-transparent hover:bg-white/10"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => deleteImage(image.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-white/80 text-sm truncate">{image.prompt}</p>
                          <p className="text-white/60 text-xs">{new Date(image.timestamp).toLocaleString("zh-CN")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">暂无生成历史</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 灵感对话框 */}
        <Dialog open={showInspiration} onOpenChange={setShowInspiration}>
          <DialogContent className="bg-slate-800 border-white/20 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                创意灵感库
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                {inspirationPrompts.map((category) => (
                  <Button
                    key={category.category}
                    variant={selectedCategory === category.category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.category)}
                    className={
                      selectedCategory === category.category
                        ? ""
                        : "border-white/20 text-white bg-transparent hover:bg-white/10"
                    }
                  >
                    {category.category}
                  </Button>
                ))}
              </div>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {inspirationPrompts
                    .find((cat) => cat.category === selectedCategory)
                    ?.prompts.map((prompt, index) => (
                      <div
                        key={index}
                        className="p-3 bg-white/5 border border-white/20 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => useInspiration(prompt)}
                      >
                        <p className="text-white/80 text-sm">{prompt}</p>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  )
}
