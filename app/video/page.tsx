"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Video,
  Play,
  Pause,
  Upload,
  Loader2,
  Download,
  Volume2,
  VolumeX,
  Lightbulb,
  Sparkles,
  Scissors,
  Wand2,
  Mic,
  Clock,
  Settings,
  FileVideo,
  Zap,
  Camera,
  Film,
  Edit3,
  RotateCcw,
  Share2,
  Save,
  Trash2,
  Eye,
  EyeOff,
  SkipBack,
  SkipForward,
  Maximize,
  Minimize,
} from "lucide-react"
import { PageLayout } from "@/components/page-layout"

interface VideoParticle {
  id: number
  x: number
  y: number
  dx: number
  dy: number
  color: string
  size: number
  type: "spark" | "glow" | "trail" | "burst"
}

interface TimelineMarker {
  id: string
  time: number
  type: "cut" | "effect" | "audio" | "transition"
  label: string
  color: string
}

interface VideoProject {
  id: string
  name: string
  mode: string
  model: string
  prompt: string
  duration: number
  resolution: string
  fps: string
  status: "draft" | "processing" | "completed" | "failed"
  createdAt: string
  thumbnail?: string
}

interface VideoEffect {
  id: string
  name: string
  type: "filter" | "transition" | "overlay" | "audio"
  intensity: number
  enabled: boolean
}

export default function VideoPage() {
  // 基础状态
  const [videoMode, setVideoMode] = useState("generate")
  const [videoModel, setVideoModel] = useState("runway-gen3")
  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [duration, setDuration] = useState([10])
  const [resolution, setResolution] = useState("1280x720")
  const [fps, setFps] = useState("24")
  const [guidanceScale, setGuidanceScale] = useState([7.5])
  const [steps, setSteps] = useState([20])

  // 高级参数
  const [seed, setSeed] = useState("")
  const [aspectRatio, setAspectRatio] = useState("16:9")
  const [playbackSpeed, setPlaybackSpeed] = useState([1])
  const [showAdvanced, setShowAdvanced] = useState(false)

  // 视频播放状态
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState([80])
  const [currentTime, setCurrentTime] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 处理状态
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState("")
  const [processingPhase, setProcessingPhase] = useState("")

  // 文件上传状态
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // 时间轴和标记
  const [timelineMarkers, setTimelineMarkers] = useState<TimelineMarker[]>([])
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null)

  // 特效系统
  const [videoEffects, setVideoEffects] = useState<VideoEffect[]>([
    { id: "blur", name: "模糊滤镜", type: "filter", intensity: 50, enabled: false },
    { id: "sharpen", name: "锐化", type: "filter", intensity: 30, enabled: false },
    { id: "fade", name: "淡入淡出", type: "transition", intensity: 70, enabled: false },
    { id: "zoom", name: "缩放效果", type: "transition", intensity: 60, enabled: false },
    { id: "text", name: "文字叠加", type: "overlay", intensity: 80, enabled: false },
    { id: "logo", name: "水印", type: "overlay", intensity: 40, enabled: false },
    { id: "noise", name: "降噪", type: "audio", intensity: 60, enabled: false },
    { id: "enhance", name: "音频增强", type: "audio", intensity: 50, enabled: false },
  ])

  // 配音系统
  const [voiceText, setVoiceText] = useState("")
  const [voiceModel, setVoiceModel] = useState("zh-female-1")
  const [voiceSpeed, setVoiceSpeed] = useState([1])
  const [voicePitch, setVoicePitch] = useState([0])
  const [voiceVolume, setVoiceVolume] = useState([100])

  // 项目管理
  const [projects, setProjects] = useState<VideoProject[]>([])
  const [currentProject, setCurrentProject] = useState<VideoProject | null>(null)

  // 动效状态
  const [videoParticles, setVideoParticles] = useState<VideoParticle[]>([])
  const [frameSparkle, setFrameSparkle] = useState(false)
  const [renderGlow, setRenderGlow] = useState(false)
  const [timelineRipple, setTimelineRipple] = useState(false)
  const [effectBurst, setEffectBurst] = useState(false)

  // 反馈状态
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [showInspiration, setShowInspiration] = useState(false)

  // Refs
  const buttonRef = useRef<HTMLButtonElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)

  // 创意灵感库
  const videoInspiration = {
    cinematic: [
      "电影级慢镜头，雨滴在玻璃窗上滑落，背景虚化的城市霓虹灯，暖色调，35mm胶片质感",
      "航拍视角，无人机穿越云层，金色日落时分，山脉连绵起伏，史诗级构图",
      "复古胶片风格，老式咖啡厅内，阳光透过百叶窗洒在桌面，颗粒感明显",
      "科幻未来感，霓虹灯管反射在湿润地面，赛博朋克风格，蓝紫色调主导",
    ],
    nature: [
      "4K超清，樱花花瓣飘落，微风轻拂，粉色花海背景，春日暖阳",
      "海浪拍打礁石，慢动作捕捉水花四溅瞬间，蔚蓝海水，白色泡沫",
      "森林深处，阳光透过树叶缝隙形成光束，绿意盎然，鸟鸣声环绕",
      "雪山之巅，云海翻滚，延时摄影展现日出全过程，壮丽景观",
    ],
    abstract: [
      "抽象几何图形变换，色彩渐变流动，现代艺术风格，节奏感强烈",
      "液体金属质感，表面波纹涟漪，反射光线变化，科技感十足",
      "粒子系统动画，光点聚散离合，形成各种图案，梦幻效果",
      "分形艺术动画，数学美学展现，无限循环变化，视觉冲击力强",
    ],
    lifestyle: [
      "美食制作过程，食材特写，烹饪技巧展示，色香味俱全",
      "健身训练场景，肌肉线条展现，汗水飞溅，力量美感",
      "时尚穿搭展示，模特走秀，服装细节特写，潮流元素",
      "旅行vlog风格，第一人称视角，异国风情，生活记录",
    ],
  }

  // 显示反馈消息
  const showFeedbackMessage = useCallback((message: string) => {
    setFeedbackMessage(message)
    setShowFeedback(true)
    setTimeout(() => setShowFeedback(false), 5000)
  }, [])

  // 创建视频粒子效果
  const createVideoParticles = useCallback(
    (x: number, y: number, count = 12, type: VideoParticle["type"] = "spark") => {
      const colors = {
        spark: ["#F59E0B", "#EF4444", "#EC4899"],
        glow: ["#8B5CF6", "#3B82F6", "#06B6D4"],
        trail: ["#10B981", "#06B6D4", "#8B5CF6"],
        burst: ["#EC4899", "#F59E0B", "#EF4444"],
      }

      const newParticles: VideoParticle[] = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x,
        y,
        dx: (Math.random() - 0.5) * 200,
        dy: (Math.random() - 0.5) * 200,
        color: colors[type][Math.floor(Math.random() * colors[type].length)],
        size: Math.random() * 8 + 4,
        type,
      }))

      setVideoParticles((prev) => [...prev, ...newParticles])

      setTimeout(() => {
        setVideoParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)))
      }, 3000)
    },
    [],
  )

  // 处理模式切换
  const handleModeChange = useCallback(
    (newMode: string) => {
      if (newMode === videoMode) return

      setVideoMode(newMode)
      setFrameSparkle(true)
      setTimelineRipple(true)

      setTimeout(() => {
        setFrameSparkle(false)
        setTimelineRipple(false)
      }, 2000)

      const modeMessages = {
        generate: "视频生成模式激活 → Runway Gen-3 引擎就绪，支持文本转视频、图像转视频 🎬",
        edit: "智能剪辑模式启动 → 时间轴编辑器加载，支持精确剪切、特效添加 ✂️",
        effects: "特效制作模式就绪 → 8种专业特效引擎激活，支持实时预览 ✨",
        voice: "智能配音模式激活 → 5个语音模型就绪，支持多语言合成 🎤",
      }

      showFeedbackMessage(modeMessages[newMode as keyof typeof modeMessages] || "模式切换完成")
    },
    [videoMode, showFeedbackMessage],
  )

  // 处理模型切换
  const handleModelChange = useCallback(
    (newModel: string) => {
      setVideoModel(newModel)
      setRenderGlow(true)

      setTimeout(() => setRenderGlow(false), 2500)

      const modelMessages = {
        "runway-gen3": "Runway Gen-3 引擎加载 → 支持4K分辨率、60fps、10秒时长 🚀",
        "pika-labs": "Pika Labs 模型就绪 → 专业动画生成，支持风格迁移 🎨",
        "stable-video": "Stable Video 引擎激活 → 开源模型，支持自定义训练 🔧",
        cogvideo: "CogVideo 模型连接 → 清华大学开源，支持中文理解 🇨🇳",
        animatediff: "AnimateDiff 引擎就绪 → 专业动画制作，支持角色一致性 🎭",
      }

      showFeedbackMessage(modelMessages[newModel as keyof typeof modelMessages] || "模型加载完成")
    },
    [showFeedbackMessage],
  )

  // 处理文件上传
  const handleFileUpload = useCallback(
    (file: File) => {
      if (!file.type.startsWith("video/")) {
        showFeedbackMessage("请上传有效的视频文件（MP4、MOV、AVI格式）")
        return
      }

      if (file.size > 100 * 1024 * 1024) {
        showFeedbackMessage("视频文件大小不能超过100MB")
        return
      }

      setUploadedFile(file)
      showFeedbackMessage(`视频文件「${file.name}」上传成功，文件大小：${(file.size / 1024 / 1024).toFixed(1)}MB`)

      // 创建时间轴标记
      const newMarkers: TimelineMarker[] = [
        { id: "start", time: 0, type: "cut", label: "开始", color: "#10B981" },
        { id: "middle", time: 50, type: "effect", label: "特效点", color: "#8B5CF6" },
        { id: "end", time: 100, type: "cut", label: "结束", color: "#EF4444" },
      ]
      setTimelineMarkers(newMarkers)
    },
    [showFeedbackMessage],
  )

  // 处理拖拽上传
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileUpload(files[0])
      }
    },
    [handleFileUpload],
  )

  // 处理特效切换
  const handleEffectToggle = useCallback(
    (effectId: string) => {
      setVideoEffects((prev) =>
        prev.map((effect) => (effect.id === effectId ? { ...effect, enabled: !effect.enabled } : effect)),
      )

      setEffectBurst(true)
      setTimeout(() => setEffectBurst(false), 1500)

      const effect = videoEffects.find((e) => e.id === effectId)
      if (effect) {
        showFeedbackMessage(
          `特效「${effect.name}」${effect.enabled ? "已禁用" : "已启用"} → 强度：${effect.intensity}%`,
        )
      }
    },
    [videoEffects, showFeedbackMessage],
  )

  // 处理特效强度调节
  const handleEffectIntensity = useCallback((effectId: string, intensity: number) => {
    setVideoEffects((prev) => prev.map((effect) => (effect.id === effectId ? { ...effect, intensity } : effect)))
  }, [])

  // 添加时间轴标记
  const addTimelineMarker = useCallback(
    (time: number, type: TimelineMarker["type"]) => {
      const newMarker: TimelineMarker = {
        id: Date.now().toString(),
        time,
        type,
        label: `${type === "cut" ? "剪切" : type === "effect" ? "特效" : type === "audio" ? "音频" : "转场"}点`,
        color: type === "cut" ? "#EF4444" : type === "effect" ? "#8B5CF6" : type === "audio" ? "#10B981" : "#F59E0B",
      }

      setTimelineMarkers((prev) => [...prev, newMarker].sort((a, b) => a.time - b.time))
      showFeedbackMessage(`已在 ${time.toFixed(1)}% 处添加${newMarker.label}`)
    },
    [showFeedbackMessage],
  )

  // 处理视频生成
  const processVideo = useCallback(async () => {
    if (videoMode === "generate" && !prompt.trim()) {
      setShowInspiration(true)
      showFeedbackMessage("创意描述待填充 → 尝试输入详细的视频描述，或使用「创意灵感库」获取专业提示词 💡")
      return
    }

    if (videoMode === "edit" && !uploadedFile) {
      showFeedbackMessage("请先上传视频文件进行编辑处理 📁")
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setRenderGlow(true)

    // 创建粒子效果
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      createVideoParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 16, "burst")
    }

    showFeedbackMessage(`${videoModel.toUpperCase()} 引擎启动 → 解析视频描述，准备渲染 ${resolution} @ ${fps}fps...`)

    // 模拟处理进度
    const phases = [
      {
        progress: 20,
        message: "场景理解与构图分析 → AI正在解析视频描述中的关键元素...",
        phase: "场景分析",
      },
      {
        progress: 40,
        message: "关键帧生成 → 创建视频骨架，确定镜头运动轨迹...",
        phase: "关键帧生成",
      },
      {
        progress: 60,
        message: "中间帧插值 → 使用光流算法生成平滑过渡帧...",
        phase: "帧插值",
      },
      {
        progress: 80,
        message: "后期处理 → 色彩校正、降噪、锐化处理...",
        phase: "后期处理",
      },
      {
        progress: 100,
        message: "视频编码完成 → H.264编码，比特率优化，准备输出...",
        phase: "编码输出",
      },
    ]

    for (const phase of phases) {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      setProgress(phase.progress)
      setProcessingPhase(phase.phase)
      showFeedbackMessage(phase.message)
    }

    setRenderGlow(false)
    generateResult()
    setIsProcessing(false)
  }, [videoMode, prompt, uploadedFile, videoModel, resolution, fps, createVideoParticles, showFeedbackMessage])

  // 生成结果
  const generateResult = useCallback(() => {
    const currentTime = new Date().toLocaleString("zh-CN")

    const resultText = `# 🎬 YYC³ Video - 视频处理完成

## 📋 项目信息

• **处理模式**：${videoMode === "generate" ? "视频生成" : videoMode === "edit" ? "智能剪辑" : videoMode === "effects" ? "特效制作" : "智能配音"}
• **AI模型**：${videoModel.toUpperCase()}
• **分辨率**：${resolution}
• **帧率**：${fps} FPS
• **时长**：${duration[0]} 秒
• **宽高比**：${aspectRatio}
• **处理时间**：${currentTime}

## 🎯 创作描述

${prompt || voiceText || "智能视频处理"}

${negativePrompt ? `**负向提示**：${negativePrompt}` : ""}

## 🎬 处理结果

✅ 视频处理完成！

**技术参数**：
• 编码格式：H.264 (AVC)
• 比特率：${Math.floor(Math.random() * 5000 + 8000)} kbps
• 色彩空间：Rec.709
• 音频编码：AAC 48kHz
• 文件大小：${(Math.random() * 50 + 20).toFixed(1)} MB

**处理详情**：
• 引导强度：${guidanceScale[0]}
• 生成步数：${steps[0]}
• 随机种子：${seed || Math.floor(Math.random() * 1000000)}
• 播放速度：${playbackSpeed[0]}x

## 🎨 视觉效果分析

**镜头运动**：
• 推拉镜头：${Math.floor(Math.random() * 3 + 2)} 个
• 摇移镜头：${Math.floor(Math.random() * 4 + 3)} 个
• 特写镜头：${Math.floor(Math.random() * 5 + 4)} 个

**色彩分析**：
• 主色调：${["暖色调", "冷色调", "中性色调"][Math.floor(Math.random() * 3)]}
• 饱和度：${Math.floor(Math.random() * 30 + 70)}%
• 对比度：${Math.floor(Math.random() * 20 + 80)}%
• 亮度分布：${["高调", "中调", "低调"][Math.floor(Math.random() * 3)]}

## ✨ 应用特效

${
  videoEffects
    .filter((effect) => effect.enabled)
    .map((effect) => `• **${effect.name}**：强度 ${effect.intensity}%，类型 ${effect.type}`)
    .join("\n") || "• 未应用特效"
}

## 🎤 音频处理

${
  videoMode === "voice"
    ? `**配音合成**：
• 语音模型：${voiceModel}
• 语速：${voiceSpeed[0]}x
• 音调：${voicePitch[0] > 0 ? "+" : ""}${voicePitch[0]}
• 音量：${voiceVolume[0]}%
• 文本长度：${voiceText.length} 字符
• 预估时长：${Math.ceil(voiceText.length / 3)} 秒`
    : `**音频分析**：
• 音频轨道：${Math.floor(Math.random() * 2 + 1)} 轨
• 采样率：48kHz
• 位深度：24bit
• 动态范围：${Math.floor(Math.random() * 20 + 60)}dB`
}

## 📊 时间轴标记

${timelineMarkers.map((marker) => `• **${marker.time.toFixed(1)}%**：${marker.label} (${marker.type})`).join("\n") || "• 无时间轴标记"}

## 🚀 输出建议

• 支持导出格式：MP4、MOV、AVI、WebM
• 建议用途：${videoMode === "generate" ? "社交媒体、广告创意" : videoMode === "edit" ? "专业剪辑、后期制作" : videoMode === "effects" ? "特效展示、创意视频" : "配音视频、教学内容"}
• 优化建议：可进一步调整色彩校正和音频混音
• 分享平台：支持直接上传至各大视频平台

## 💡 创作洞察

• 成功捕获了描述中的视觉元素和情感表达
• AI模型在场景理解和镜头运动方面表现优秀
• 建议结合音频编辑功能进一步提升作品质量
• 可使用特效制作模式添加更多视觉效果`

    setResult(resultText)
  }, [
    videoMode,
    videoModel,
    resolution,
    fps,
    duration,
    aspectRatio,
    prompt,
    voiceText,
    negativePrompt,
    guidanceScale,
    steps,
    seed,
    playbackSpeed,
    videoEffects,
    voiceModel,
    voiceSpeed,
    voicePitch,
    voiceVolume,
    timelineMarkers,
  ])

  // 保存项目
  const saveProject = useCallback(() => {
    const newProject: VideoProject = {
      id: Date.now().toString(),
      name: `视频项目_${new Date().toLocaleDateString()}`,
      mode: videoMode,
      model: videoModel,
      prompt: prompt || voiceText,
      duration: duration[0],
      resolution,
      fps,
      status: "draft",
      createdAt: new Date().toISOString(),
    }

    setProjects((prev) => [newProject, ...prev])
    setCurrentProject(newProject)
    showFeedbackMessage(`项目「${newProject.name}」已保存`)
  }, [videoMode, videoModel, prompt, voiceText, duration, resolution, fps, showFeedbackMessage])

  // 处理播放/暂停
  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying)
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }, [isPlaying])

  // 处理音量控制
  const handleVolumeToggle = useCallback(() => {
    setIsMuted(!isMuted)
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
  }, [isMuted])

  // 使用创意灵感
  const useInspiration = useCallback(
    (inspiration: string) => {
      setPrompt(inspiration)
      setShowInspiration(false)
      showFeedbackMessage("创意灵感注入完成！AI 正在解析视频描述，准备开启专业级视频创作 🎬✨")
    },
    [showFeedbackMessage],
  )

  // 清理粒子效果
  useEffect(() => {
    const cleanup = setInterval(() => {
      setVideoParticles((prev) => prev.filter((p) => Date.now() - p.id < 3000))
    }, 1000)

    return () => clearInterval(cleanup)
  }, [])

  // 模拟播放进度
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 0.1
          if (newTime >= duration[0]) {
            setIsPlaying(false)
            return 0
          }
          return newTime
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying, duration])

  return (
    <PageLayout title="🎬 语枢视频" description="AI视频生成与智能编辑工具">
      <div className="relative">
        {/* 全局样式 */}
        <style jsx>{`
          @keyframes frameSparkle {
            0% {
              box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.8);
              transform: scale(1);
            }
            50% {
              box-shadow: 0 0 30px 10px rgba(245, 158, 11, 0.4);
              transform: scale(1.02);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
              transform: scale(1);
            }
          }

          @keyframes renderGlow {
            0% {
              background: linear-gradient(45deg, #8B5CF6, #3B82F6);
              transform: rotateY(0deg);
            }
            50% {
              background: linear-gradient(45deg, #3B82F6, #06B6D4);
              transform: rotateY(180deg);
            }
            100% {
              background: linear-gradient(45deg, #06B6D4, #8B5CF6);
              transform: rotateY(360deg);
            }
          }

          @keyframes timelineRipple {
            0% {
              transform: scaleX(0);
              opacity: 1;
            }
            100% {
              transform: scaleX(1);
              opacity: 0.3;
            }
          }

          @keyframes effectBurst {
            0% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.8);
            }
            50% {
              transform: scale(1.1);
              box-shadow: 0 0 20px 5px rgba(139, 92, 246, 0.6);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(139, 92, 246, 0);
            }
          }

          @keyframes videoParticleFloat {
            0% {
              opacity: 1;
              transform: translate(0, 0) scale(1) rotate(0deg);
            }
            100% {
              opacity: 0;
              transform: translate(var(--particle-dx), var(--particle-dy)) scale(0.2) rotate(360deg);
            }
          }

          @keyframes inspirationPulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
          }

          @keyframes feedbackSlide {
            0% {
              opacity: 0;
              transform: translateY(-20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .frame-sparkle {
            animation: frameSparkle 2s ease-in-out;
          }

          .render-glow {
            animation: renderGlow 3s ease-in-out;
          }

          .timeline-ripple::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
            animation: timelineRipple 2s ease-out;
            pointer-events: none;
          }

          .effect-burst {
            animation: effectBurst 1.5s ease-out;
          }

          .video-particle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            animation: videoParticleFloat 3s ease-out forwards;
            z-index: 10;
          }

          .inspiration-card {
            animation: inspirationPulse 3s ease-in-out infinite;
          }

          .feedback-message {
            animation: feedbackSlide 0.3s ease-out forwards;
          }

          .drag-over {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
            border-color: rgba(59, 130, 246, 0.5);
          }

          .timeline-marker {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 2px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .timeline-marker:hover {
            width: 4px;
            z-index: 10;
          }

          .timeline-marker::after {
            content: attr(data-label);
            position: absolute;
            top: -25px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            white-space: nowrap;
            opacity: 0;
            transition: opacity 0.2s ease;
          }

          .timeline-marker:hover::after {
            opacity: 1;
          }

          .video-preview {
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6));
            border: 2px solid rgba(255, 255, 255, 0.1);
          }

          .effect-panel {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));
            border: 1px solid rgba(139, 92, 246, 0.3);
          }
        `}</style>

        {/* 视频粒子效果 */}
        {videoParticles.map((particle) => (
          <div
            key={particle.id}
            className="video-particle"
            style={
              {
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                "--particle-dx": `${particle.dx}px`,
                "--particle-dy": `${particle.dy}px`,
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              } as React.CSSProperties
            }
          />
        ))}

        {/* 反馈消息 */}
        {showFeedback && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 feedback-message">
            <div className="bg-blue-600/90 backdrop-blur-md text-white px-6 py-3 rounded-full border border-blue-400/30">
              <p className="text-sm font-medium">{feedbackMessage}</p>
            </div>
          </div>
        )}

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Video className="w-5 h-5 mr-2" />
              语枢视频 - AI视频创作引擎
            </CardTitle>
            <CardDescription className="text-white/80">
              视频生成、智能剪辑、特效制作、智能配音等专业视频处理
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 模式和模型选择 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-white">处理模式</Label>
                <div className="relative">
                  <Select value={videoMode} onValueChange={handleModeChange}>
                    <SelectTrigger
                      className={`bg-white/10 border-white/20 text-white ${frameSparkle ? "frame-sparkle" : ""}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20 text-white">
                      <SelectItem value="generate">视频生成</SelectItem>
                      <SelectItem value="edit">智能剪辑</SelectItem>
                      <SelectItem value="effects">特效制作</SelectItem>
                      <SelectItem value="voice">智能配音</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-white">AI模型引擎</Label>
                <Select value={videoModel} onValueChange={handleModelChange}>
                  <SelectTrigger
                    className={`bg-white/10 border-white/20 text-white ${renderGlow ? "render-glow" : ""}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20 text-white">
                    <SelectItem value="runway-gen3">Runway Gen-3</SelectItem>
                    <SelectItem value="pika-labs">Pika Labs</SelectItem>
                    <SelectItem value="stable-video">Stable Video</SelectItem>
                    <SelectItem value="cogvideo">CogVideo</SelectItem>
                    <SelectItem value="animatediff">AnimateDiff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">分辨率</Label>
                <Select value={resolution} onValueChange={setResolution}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20 text-white">
                    <SelectItem value="1920x1080">1080p (1920x1080)</SelectItem>
                    <SelectItem value="1280x720">720p (1280x720)</SelectItem>
                    <SelectItem value="3840x2160">4K (3840x2160)</SelectItem>
                    <SelectItem value="2560x1440">2K (2560x1440)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">帧率</Label>
                <Select value={fps} onValueChange={setFps}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20 text-white">
                    <SelectItem value="24">24 FPS</SelectItem>
                    <SelectItem value="30">30 FPS</SelectItem>
                    <SelectItem value="60">60 FPS</SelectItem>
                    <SelectItem value="120">120 FPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 参数调节 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-white flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    视频时长: {duration[0]} 秒
                  </Label>
                  <Slider value={duration} onValueChange={setDuration} max={60} min={3} step={1} className="mt-2" />
                </div>

                <div>
                  <Label className="text-white flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    引导强度: {guidanceScale[0]}
                  </Label>
                  <Slider
                    value={guidanceScale}
                    onValueChange={setGuidanceScale}
                    max={20}
                    min={1}
                    step={0.5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-white flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    生成步数: {steps[0]}
                  </Label>
                  <Slider value={steps} onValueChange={setSteps} max={50} min={10} step={5} className="mt-2" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-white">宽高比</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20 text-white">
                      <SelectItem value="16:9">16:9 (横屏)</SelectItem>
                      <SelectItem value="9:16">9:16 (竖屏)</SelectItem>
                      <SelectItem value="1:1">1:1 (方形)</SelectItem>
                      <SelectItem value="4:3">4:3 (传统)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white flex items-center gap-2">播放速度: {playbackSpeed[0]}x</Label>
                  <Slider
                    value={playbackSpeed}
                    onValueChange={setPlaybackSpeed}
                    max={3}
                    min={0.25}
                    step={0.25}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-white">高级参数</Label>
                  <Switch checked={showAdvanced} onCheckedChange={setShowAdvanced} />
                </div>

                {showAdvanced && (
                  <div>
                    <Label className="text-white">随机种子</Label>
                    <input
                      type="text"
                      placeholder="留空自动生成"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-white/60"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 主要内容区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 输入区域 */}
              <div className="lg:col-span-2 space-y-4">
                {videoMode === "generate" && (
                  <>
                    <div>
                      <Label className="text-white flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        视频描述
                        {!prompt.trim() && (
                          <Badge
                            variant="outline"
                            className="text-xs border-yellow-400/30 text-yellow-300 animate-pulse"
                          >
                            创意描述待填充
                          </Badge>
                        )}
                      </Label>
                      <Textarea
                        placeholder="详细描述您想要生成的视频内容，如：电影级慢镜头，雨滴在玻璃窗上滑落，背景虚化的城市霓虹灯..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label className="text-white flex items-center gap-2">
                        <EyeOff className="w-4 h-4" />
                        负向提示（可选）
                      </Label>
                      <Textarea
                        placeholder="描述您不希望在视频中出现的元素，如：模糊、低质量、变形..."
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        rows={2}
                      />
                    </div>
                  </>
                )}

                {videoMode === "edit" && (
                  <div>
                    <Label className="text-white flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      上传视频文件
                    </Label>
                    <div
                      className={`border-2 border-dashed border-white/20 rounded-lg p-8 text-center transition-all duration-300 cursor-pointer hover:border-blue-400/50 ${
                        isDragOver ? "drag-over" : ""
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => uploadRef.current?.click()}
                    >
                      <input
                        ref={uploadRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        className="hidden"
                      />
                      {uploadedFile ? (
                        <div className="space-y-2">
                          <FileVideo className="w-12 h-12 text-green-400 mx-auto" />
                          <p className="text-white font-medium">{uploadedFile.name}</p>
                          <p className="text-white/60 text-sm">{(uploadedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Upload className="w-12 h-12 text-white/40 mx-auto" />
                          <p className="text-white/60">点击或拖拽上传视频文件</p>
                          <p className="text-white/40 text-sm">支持 MP4, MOV, AVI 格式，最大 100MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {videoMode === "voice" && (
                  <>
                    <div>
                      <Label className="text-white flex items-center gap-2">
                        <Mic className="w-4 h-4" />
                        配音文本
                      </Label>
                      <Textarea
                        placeholder="输入需要合成语音的文本内容..."
                        value={voiceText}
                        onChange={(e) => setVoiceText(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        rows={4}
                      />
                      <div className="flex justify-between text-xs text-white/60 mt-1">
                        <span>{voiceText.length} 字符</span>
                        <span>预估时长: {Math.ceil(voiceText.length / 3)} 秒</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">语音模型</Label>
                        <Select value={voiceModel} onValueChange={setVoiceModel}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-white/20 text-white">
                            <SelectItem value="zh-female-1">中文女声-温柔</SelectItem>
                            <SelectItem value="zh-male-1">中文男声-磁性</SelectItem>
                            <SelectItem value="en-female-1">英文女声-甜美</SelectItem>
                            <SelectItem value="en-male-1">英文男声-深沉</SelectItem>
                            <SelectItem value="zh-child-1">中文童声-活泼</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">语速: {voiceSpeed[0]}x</Label>
                        <Slider
                          value={voiceSpeed}
                          onValueChange={setVoiceSpeed}
                          max={2}
                          min={0.5}
                          step={0.1}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">
                          音调: {voicePitch[0] > 0 ? "+" : ""}
                          {voicePitch[0]}
                        </Label>
                        <Slider
                          value={voicePitch}
                          onValueChange={setVoicePitch}
                          max={12}
                          min={-12}
                          step={1}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-white">音量: {voiceVolume[0]}%</Label>
                        <Slider
                          value={voiceVolume}
                          onValueChange={setVoiceVolume}
                          max={150}
                          min={10}
                          step={5}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 创意灵感库 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <Label className="text-white">创意灵感库</Label>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {Object.entries(videoInspiration).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="text-white/80 text-sm font-medium capitalize">
                        {category === "cinematic"
                          ? "电影级"
                          : category === "nature"
                            ? "自然风光"
                            : category === "abstract"
                              ? "抽象艺术"
                              : "生活方式"}
                      </h4>
                      {items.map((item, index) => (
                        <div
                          key={index}
                          className="inspiration-card p-3 bg-white/5 border border-white/20 rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-300"
                          onClick={() => useInspiration(item)}
                          style={{ animationDelay: `${index * 0.2}s` }}
                        >
                          <p className="text-white/80 text-sm leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-white/20 text-white bg-transparent hover:bg-white/10"
                  onClick={() => setShowInspiration(!showInspiration)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {showInspiration ? "收起灵感" : "更多灵感"}
                </Button>
              </div>
            </div>

            {/* 特效制作面板 */}
            {videoMode === "effects" && (
              <div className="effect-panel rounded-lg p-4">
                <Label className="text-white text-lg font-semibold mb-4 block flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  专业特效工具箱
                </Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videoEffects.map((effect) => (
                    <div
                      key={effect.id}
                      className={`p-4 bg-white/5 border border-white/20 rounded-lg transition-all duration-300 ${
                        effect.enabled ? "border-purple-400/50 bg-purple-500/10" : ""
                      } ${effectBurst && effect.enabled ? "effect-burst" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Switch checked={effect.enabled} onCheckedChange={() => handleEffectToggle(effect.id)} />
                          <Label className="text-white font-medium">{effect.name}</Label>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            effect.type === "filter"
                              ? "border-blue-400/30 text-blue-300"
                              : effect.type === "transition"
                                ? "border-green-400/30 text-green-300"
                                : effect.type === "overlay"
                                  ? "border-purple-400/30 text-purple-300"
                                  : "border-orange-400/30 text-orange-300"
                          }`}
                        >
                          {effect.type}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-white/60">
                          <span>强度</span>
                          <span>{effect.intensity}%</span>
                        </div>
                        <Slider
                          value={[effect.intensity]}
                          onValueChange={(value) => handleEffectIntensity(effect.id, value[0])}
                          max={100}
                          min={0}
                          step={5}
                          disabled={!effect.enabled}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 时间轴编辑器 */}
            {(videoMode === "edit" || uploadedFile) && (
              <div className="space-y-4">
                <Label className="text-white text-lg font-semibold flex items-center gap-2">
                  <Film className="w-5 h-5" />
                  智能时间轴编辑器
                </Label>

                <div
                  ref={timelineRef}
                  className={`relative h-16 bg-black/20 rounded-lg border border-white/20 overflow-hidden ${
                    timelineRipple ? "timeline-ripple" : ""
                  }`}
                >
                  {/* 时间轴背景 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20" />

                  {/* 时间轴标记 */}
                  {timelineMarkers.map((marker) => (
                    <div
                      key={marker.id}
                      className="timeline-marker"
                      data-label={marker.label}
                      style={{
                        left: `${marker.time}%`,
                        backgroundColor: marker.color,
                      }}
                      onClick={() => setSelectedMarker(marker.id)}
                    />
                  ))}

                  {/* 播放头 */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white/90 z-20 transition-all duration-100"
                    style={{ left: `${(currentTime / duration[0]) * 100}%` }}
                  >
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full" />
                  </div>

                  {/* 时间刻度 */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-white/60 px-2">
                    {Array.from({ length: 11 }, (_, i) => (
                      <span key={i}>{Math.floor((duration[0] * i) / 10)}s</span>
                    ))}
                  </div>
                </div>

                {/* 时间轴控制按钮 */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white bg-transparent"
                    onClick={() => addTimelineMarker(25, "cut")}
                  >
                    <Scissors className="w-4 h-4 mr-1" />
                    添加剪切点
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white bg-transparent"
                    onClick={() => addTimelineMarker(50, "effect")}
                  >
                    <Wand2 className="w-4 h-4 mr-1" />
                    添加特效点
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white bg-transparent"
                    onClick={() => addTimelineMarker(75, "transition")}
                  >
                    <Film className="w-4 h-4 mr-1" />
                    添加转场
                  </Button>
                </div>
              </div>
            )}

            {/* 视频预览区域 */}
            {(result || uploadedFile) && (
              <div className="space-y-4">
                <Label className="text-white text-lg font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  视频预览
                </Label>

                <div className="video-preview rounded-lg p-4">
                  <div className="relative aspect-video bg-black/40 rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      poster="/placeholder.svg?height=360&width=640"
                    >
                      <source src="#" type="video/mp4" />
                    </video>

                    {/* 视频控制覆盖层 */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex items-center gap-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/50 text-white bg-black/50"
                          onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                        >
                          <SkipBack className="w-4 h-4" />
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-white/50 text-white bg-black/50"
                          onClick={handlePlayPause}
                        >
                          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/50 text-white bg-black/50"
                          onClick={() => setCurrentTime(Math.min(duration[0], currentTime + 10))}
                        >
                          <SkipForward className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* 视频信息覆盖层 */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <div className="bg-black/60 backdrop-blur-sm rounded px-3 py-1">
                        <span className="text-white text-sm font-mono">
                          {Math.floor(currentTime / 60)
                            .toString()
                            .padStart(2, "0")}
                          :
                          {Math.floor(currentTime % 60)
                            .toString()
                            .padStart(2, "0")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/50 text-white bg-black/50"
                          onClick={handleVolumeToggle}
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/50 text-white bg-black/50"
                          onClick={() => setIsFullscreen(!isFullscreen)}
                        >
                          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 音量控制 */}
                  <div className="flex items-center gap-4 mt-4">
                    <Volume2 className="w-4 h-4 text-white/60" />
                    <Slider value={volume} onValueChange={setVolume} max={100} min={0} step={5} className="flex-1" />
                    <span className="text-white/60 text-sm w-12">{volume[0]}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* 项目管理 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white text-lg font-semibold flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  项目管理
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white bg-transparent"
                    onClick={saveProject}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    保存项目
                  </Button>
                  <Button size="sm" variant="outline" className="border-white/20 text-white bg-transparent">
                    <Share2 className="w-4 h-4 mr-1" />
                    分享
                  </Button>
                </div>
              </div>

              {projects.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-48 overflow-y-auto">
                  {projects.slice(0, 6).map((project) => (
                    <div
                      key={project.id}
                      className="p-3 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer"
                      onClick={() => setCurrentProject(project)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium text-sm truncate">{project.name}</h4>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            project.status === "completed"
                              ? "border-green-400/30 text-green-300"
                              : project.status === "processing"
                                ? "border-yellow-400/30 text-yellow-300"
                                : project.status === "failed"
                                  ? "border-red-400/30 text-red-300"
                                  : "border-gray-400/30 text-gray-300"
                          }`}
                        >
                          {project.status === "completed"
                            ? "已完成"
                            : project.status === "processing"
                              ? "处理中"
                              : project.status === "failed"
                                ? "失败"
                                : "草稿"}
                        </Badge>
                      </div>
                      <div className="text-white/60 text-xs space-y-1">
                        <p>
                          模式:{" "}
                          {project.mode === "generate"
                            ? "视频生成"
                            : project.mode === "edit"
                              ? "智能剪辑"
                              : project.mode === "effects"
                                ? "特效制作"
                                : "智能配音"}
                        </p>
                        <p>模型: {project.model}</p>
                        <p>时长: {project.duration}秒</p>
                        <p>创建: {new Date(project.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/20 text-white bg-transparent flex-1 text-xs"
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          编辑
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-400/30 text-red-300 bg-transparent">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 生成按钮和进度 */}
            <div className="space-y-4">
              <Button
                ref={buttonRef}
                onClick={processVideo}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 text-lg"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>视频引擎运行中...</span>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {processingPhase}
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    启动AI视频引擎
                  </div>
                )}
              </Button>

              {/* 视频处理进度条 */}
              {isProcessing && (
                <div className="relative h-8 bg-white/10 rounded-lg overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      视频处理: {progress}% | {resolution} @ {fps}fps | 模型: {videoModel.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}

              {/* 重试按钮 */}
              {result && !isProcessing && (
                <Button
                  onClick={processVideo}
                  variant="outline"
                  className="w-full border-white/20 text-white bg-transparent hover:bg-white/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  重新生成视频
                </Button>
              )}
            </div>

            {/* 结果显示 */}
            {result && (
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-white flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    处理结果
                    <Badge className="bg-green-500/20 text-green-400 text-xs">视频生成完成</Badge>
                  </Label>
                  <Button size="sm" variant="outline" className="border-white/20 text-white bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    下载视频
                  </Button>
                </div>

                <div className="bg-black/20 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-white text-sm whitespace-pre-wrap font-mono">{result}</pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
