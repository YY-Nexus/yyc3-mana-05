"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Music, Mic, Library, Settings, Save, Share2, Trash2, Sliders, Eye, Maximize2, Minimize2 } from "lucide-react"
import { PageLayout } from "@/components/page-layout"

interface AudioParticle {
  id: number
  x: number
  y: number
  dx: number
  dy: number
  color: string
  size: number
  frequency: number
  amplitude: number
}

interface WaveformPoint {
  x: number
  y: number
  frequency: number
  amplitude: number
  phase: number
}

interface AudioMetrics {
  entropy: number
  lufs: number
  phaseOffset: number
  dynamicRange: number
  positivity: number
  complexity: number
  rms: number
  peak: number
  stereoWidth: number
  thd: number
}

interface MusicProject {
  id: string
  name: string
  mode: string
  model: string
  prompt: string
  genre: string
  duration: number
  tempo: number
  key: string
  createdAt: string
  status: "draft" | "processing" | "completed" | "failed"
  audioUrl?: string
  waveformData?: number[]
}

interface AudioEffect {
  id: string
  name: string
  type: "filter" | "dynamics" | "modulation" | "spatial" | "distortion"
  enabled: boolean
  parameters: Record<string, number>
}

interface VoiceModel {
  id: string
  name: string
  language: string
  gender: "male" | "female" | "neutral"
  style: string
  preview?: string
}

export default function MusicPage() {
  // 基础状态
  const [musicMode, setMusicMode] = useState("compose")
  const [musicModel, setMusicModel] = useState("musicgen-large")
  const [prompt, setPrompt] = useState("")
  const [genre, setGenre] = useState("pop")
  const [duration, setDuration] = useState([30])
  const [tempo, setTempo] = useState([120])
  const [key, setKey] = useState("C")
  const [negativePrompt, setNegativePrompt] = useState("")

  // 高级参数
  const [guidanceScale, setGuidanceScale] = useState([7.5])
  const [steps, setSteps] = useState([50])
  const [seed, setSeed] = useState("")
  const [useRandomSeed, setUseRandomSeed] = useState(true)
  const [topK, setTopK] = useState([250])
  const [topP, setTopP] = useState([0.0])

  // 音频状态
  const [isPlaying, setIsPlaying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState("")
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState([80])
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState([1.0])
  const [loopEnabled, setLoopEnabled] = useState(false)
  const [shuffleEnabled, setShuffleEnabled] = useState(false)

  // 音频指标
  const [audioMetrics, setAudioMetrics] = useState<AudioMetrics>({
    entropy: 0.72,
    lufs: -14,
    phaseOffset: -3,
    dynamicRange: 62,
    positivity: 83,
    complexity: 0,
    rms: -18,
    peak: -6,
    stereoWidth: 85,
    thd: 0.03,
  })

  // 项目管理
  const [projects, setProjects] = useState<MusicProject[]>([])
  const [currentProject, setCurrentProject] = useState<MusicProject | null>(null)
  const [projectName, setProjectName] = useState("")
  const [showProjectManager, setShowProjectManager] = useState(false)

  // 音频效果
  const [audioEffects, setAudioEffects] = useState<AudioEffect[]>([
    {
      id: "eq",
      name: "均衡器",
      type: "filter",
      enabled: false,
      parameters: { lowGain: 0, midGain: 0, highGain: 0, lowFreq: 100, highFreq: 8000 },
    },
    {
      id: "compressor",
      name: "压缩器",
      type: "dynamics",
      enabled: false,
      parameters: { threshold: -12, ratio: 4, attack: 3, release: 100, makeupGain: 0 },
    },
    {
      id: "reverb",
      name: "混响",
      type: "spatial",
      enabled: false,
      parameters: { roomSize: 0.5, damping: 0.5, wetLevel: 0.3, dryLevel: 0.7, width: 1.0 },
    },
    {
      id: "delay",
      name: "延迟",
      type: "modulation",
      enabled: false,
      parameters: { delayTime: 250, feedback: 0.3, wetLevel: 0.25, dryLevel: 0.75, sync: 0 },
    },
    {
      id: "chorus",
      name: "合唱",
      type: "modulation",
      enabled: false,
      parameters: { rate: 1.5, depth: 0.2, feedback: 0.0, wetLevel: 0.5, dryLevel: 0.5 },
    },
    {
      id: "distortion",
      name: "失真",
      type: "distortion",
      enabled: false,
      parameters: { drive: 0.5, tone: 0.5, level: 0.5, type: 0 },
    },
  ])

  // 语音合成
  const [voiceText, setVoiceText] = useState("")
  const [selectedVoice, setSelectedVoice] = useState("zh-female-1")
  const [voiceSpeed, setVoiceSpeed] = useState([1.0])
  const [voicePitch, setVoicePitch] = useState([0])
  const [voiceVolume, setVoiceVolume] = useState([100])

  // 语音模型
  const voiceModels: VoiceModel[] = [
    { id: "zh-female-1", name: "小雅", language: "zh-CN", gender: "female", style: "温柔甜美" },
    { id: "zh-male-1", name: "小明", language: "zh-CN", gender: "male", style: "磁性低沉" },
    { id: "en-female-1", name: "Emma", language: "en-US", gender: "female", style: "Professional" },
    { id: "en-male-1", name: "David", language: "en-US", gender: "male", style: "Narrative" },
    { id: "zh-child-1", name: "小童", language: "zh-CN", gender: "neutral", style: "童声可爱" },
  ]

  // 动效状态
  const [audioParticles, setAudioParticles] = useState<AudioParticle[]>([])
  const [waveformPoints, setWaveformPoints] = useState<WaveformPoint[]>([])
  const [soundWaveRipple, setSoundWaveRipple] = useState(false)
  const [chipInsertion, setChipInsertion] = useState(false)
  const [rhythmParticles, setRhythmParticles] = useState(false)
  const [audioWaveExplosion, setAudioWaveExplosion] = useState(false)
  const [waveformMountains, setWaveformMountains] = useState(false)
  const [harmonyParticleRain, setHarmonyParticleRain] = useState(false)
  const [crystalFreeze, setCrystalFreeze] = useState(false)
  const [repairProbe, setRepairProbe] = useState(false)

  // 界面状态
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [showInspiration, setShowInspiration] = useState(false)
  const [generationPhase, setGenerationPhase] = useState("")
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [showAudioEffects, setShowAudioEffects] = useState(false)
  const [showSpectrumAnalyzer, setShowSpectrumAnalyzer] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 文件上传
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  // Refs
  const buttonRef = useRef<HTMLButtonElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const waveformRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // 乐理灵感库
  const musicTheorySeeds = {
    classical: [
      "巴洛克风格赋格曲，主题在G小调，对位法三声部织体，管风琴音色",
      "浪漫主义钢琴奏鸣曲，快板-慢板-谐谑曲-回旋曲四乐章结构",
      "印象派和声语言，全音阶进行，平行五度，德彪西风格",
      "新古典主义弦乐四重奏，十二音技法与传统调性融合",
    ],
    popular: [
      "流行摇滚歌曲，4/4拍，Am-F-C-G和弦进行，电吉他主奏",
      "R&B慢歌，切分节奏，七和弦丰富和声，假声演唱技巧",
      "电子舞曲，128 BPM，侧链压缩，合成器琶音，低音下潜",
      "民谣吉他弹唱，DADGAD调弦，指弹技巧，自然泛音装饰",
    ],
    experimental: [
      "环境音乐，无调性织体，长音延续，空间混响处理",
      "极简主义重复音型，渐进式音高变化，史蒂夫·赖希风格",
      "噪音音乐，白噪声滤波，频谱操控，工业音色设计",
      "微分音音乐，四分之一音程，非西方音阶系统探索",
    ],
    world: [
      "中国古典音乐，五声音阶，古筝琵琶二胡合奏，宫商角徵羽",
      "印度拉格音乐，西塔琴主奏，塔布拉鼓伴奏，即兴演奏",
      "非洲部落音乐，复合节拍，打击乐群奏，呼应式演唱",
      "拉丁音乐，萨尔萨节奏，铜管乐组，康加鼓律动",
    ],
  }

  // 显示反馈消息
  const showFeedbackMessage = useCallback((message: string) => {
    setFeedbackMessage(message)
    setShowFeedback(true)
    setTimeout(() => setShowFeedback(false), 5000)
  }, [])

  // 创建音频粒子效果
  const createAudioParticles = useCallback((x: number, y: number, count = 16, type = "default") => {
    const particleTypes = {
      default: { colors: ["#8B5CF6", "#EC4899", "#06B6D4"], frequencies: [440, 880, 1320] },
      soundwave: { colors: ["#3B82F6", "#8B5CF6", "#EC4899"], frequencies: [220, 440, 880] },
      rhythm: { colors: ["#F59E0B", "#EF4444", "#EC4899"], frequencies: [60, 120, 240] },
      harmony: { colors: ["#10B981", "#06B6D4", "#8B5CF6"], frequencies: [261, 329, 392] },
      frequency: { colors: ["#EC4899", "#8B5CF6", "#3B82F6"], frequencies: [1000, 2000, 4000] },
    }

    const config = particleTypes[type as keyof typeof particleTypes] || particleTypes.default

    const newParticles: AudioParticle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      dx: (Math.random() - 0.5) * 150,
      dy: (Math.random() - 0.5) * 150,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      size: Math.random() * 6 + 3,
      frequency: config.frequencies[Math.floor(Math.random() * config.frequencies.length)],
      amplitude: Math.random() * 0.8 + 0.2,
    }))

    setAudioParticles((prev) => [...prev, ...newParticles])

    setTimeout(() => {
      setAudioParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)))
    }, 4000)
  }, [])

  // 生成波形数据
  const generateWaveform = useCallback((duration: number, tempo: number) => {
    const points: WaveformPoint[] = []
    const sampleCount = duration * 44.1 // 44.1kHz 采样率简化
    const beatInterval = 60 / tempo

    for (let i = 0; i < sampleCount; i++) {
      const time = i / 44.1
      const beatPhase = (time % beatInterval) / beatInterval

      // 模拟复合波形：基频 + 谐波
      const fundamental = Math.sin(2 * Math.PI * 440 * time) * 0.5
      const harmonic2 = Math.sin(2 * Math.PI * 880 * time) * 0.3
      const harmonic3 = Math.sin(2 * Math.PI * 1320 * time) * 0.2

      // 节拍强调
      const beatEmphasis = Math.exp(-beatPhase * 3) * 0.4

      const amplitude = (fundamental + harmonic2 + harmonic3 + beatEmphasis) * 0.5

      points.push({
        x: (i / sampleCount) * 100,
        y: amplitude * 50 + 50,
        frequency: 440 + Math.sin(time * 2) * 100,
        amplitude: Math.abs(amplitude),
        phase: (time * 2 * Math.PI) % (2 * Math.PI),
      })
    }

    setWaveformPoints(points)
  }, [])

  // 处理模式切换
  const handleModeChange = useCallback(
    (newMode: string) => {
      if (newMode === musicMode) return

      setMusicMode(newMode)
      setSoundWaveRipple(true)
      setChipInsertion(true)

      setTimeout(() => {
        setSoundWaveRipple(false)
        setChipInsertion(false)
      }, 2500)

      const modeMessages = {
        compose: "已锁定 AI 作曲模式 → 依托神经声码器与乐理大模型，从和弦进程到乐器咬合全链路生成 🎼",
        edit: "已锁定音频编辑模式 → 多轨混音引擎就绪，支持实时 EQ、压缩器与空间效果器链路 🎛️",
        voice: "已锁定声音合成模式 → 语音神经网络激活，支持音色迁移与韵律情感建模 🎤",
        library: "已锁定音效库模式 → 海量采样数据库连接，支持智能标签检索与音色匹配 📚",
      }

      showFeedbackMessage(modeMessages[newMode as keyof typeof modeMessages] || "模式切换完成")
    },
    [musicMode, showFeedbackMessage],
  )

  // 处理模型切换
  const handleModelChange = useCallback(
    (newModel: string) => {
      setMusicModel(newModel)
      setChipInsertion(true)

      setTimeout(() => setChipInsertion(false), 2000)

      const modelMessages = {
        "musicgen-large": "MusicGen Large 算力集群就绪 ✔️ 支持 128 轨并行编曲、情感频谱解析与空间混响渲染 🚀",
        audiocraft: "AudioCraft 引擎加载完成 → 专业音频生成算法激活，支持高保真度音色合成 🎨",
        jukebox: "Jukebox 模型就绪 → 深度音乐理解网络启动，支持风格迁移与创意变奏 🎵",
        "mubert-ai": "Mubert AI 引擎连接 → 实时音乐生成管道激活，支持无限时长创作 ⚡",
        "stable-audio": "Stable Audio 模型加载 → 高质量音频生成，支持长时间音乐创作 🎶",
      }

      showFeedbackMessage(modelMessages[newModel as keyof typeof modelMessages] || "模型加载完成")
    },
    [showFeedbackMessage],
  )

  // 处理文件上传
  const handleFileUpload = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0]
      const maxSize = 50 * 1024 * 1024 // 50MB
      const allowedTypes = ["audio/mp3", "audio/wav", "audio/flac", "audio/ogg", "audio/m4a"]

      if (file.size > maxSize) {
        showFeedbackMessage("文件大小超过50MB限制，请选择较小的音频文件")
        return
      }

      if (!allowedTypes.includes(file.type)) {
        showFeedbackMessage("不支持的文件格式，请上传MP3、WAV、FLAC、OGG或M4A格式的音频文件")
        return
      }

      setUploadedFile(file)
      setUploadProgress(0)

      // 模拟上传进度
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            showFeedbackMessage(`音频文件「${file.name}」上传完成，文件大小：${(file.size / 1024 / 1024).toFixed(2)}MB`)
            return 100
          }
          return prev + 10
        })
      }, 200)
    },
    [showFeedbackMessage],
  )

  // 处理拖拽
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      handleFileUpload(e.dataTransfer.files)
    },
    [handleFileUpload],
  )

  // 处理音频效果切换
  const toggleAudioEffect = useCallback((effectId: string) => {
    setAudioEffects((prev) =>
      prev.map((effect) => (effect.id === effectId ? { ...effect, enabled: !effect.enabled } : effect)),
    )
  }, [])

  // 处理效果参数调节
  const updateEffectParameter = useCallback((effectId: string, paramName: string, value: number) => {
    setAudioEffects((prev) =>
      prev.map((effect) =>
        effect.id === effectId ? { ...effect, parameters: { ...effect.parameters, [paramName]: value } } : effect,
      ),
    )
  }, [])

  // 保存项目
  const saveProject = useCallback(() => {
    if (!projectName.trim()) {
      showFeedbackMessage("请输入项目名称")
      return
    }

    const project: MusicProject = {
      id: Date.now().toString(),
      name: projectName,
      mode: musicMode,
      model: musicModel,
      prompt,
      genre,
      duration: duration[0],
      tempo: tempo[0],
      key,
      createdAt: new Date().toISOString(),
      status: "draft",
    }

    setProjects((prev) => [...prev, project])
    setCurrentProject(project)
    setProjectName("")
    showFeedbackMessage(`项目「${project.name}」保存成功`)
  }, [projectName, musicMode, musicModel, prompt, genre, duration, tempo, key, showFeedbackMessage])

  // 加载项目
  const loadProject = useCallback(
    (project: MusicProject) => {
      setMusicMode(project.mode)
      setMusicModel(project.model)
      setPrompt(project.prompt)
      setGenre(project.genre)
      setDuration([project.duration])
      setTempo([project.tempo])
      setKey(project.key)
      setCurrentProject(project)
      showFeedbackMessage(`项目「${project.name}」加载完成`)
    },
    [showFeedbackMessage],
  )

  // 删除项目
  const deleteProject = useCallback(
    (projectId: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
      if (currentProject?.id === projectId) {
        setCurrentProject(null)
      }
      showFeedbackMessage("项目删除成功")
    },
    [currentProject, showFeedbackMessage],
  )

  // 处理音乐生成
  const processMusic = useCallback(async () => {
    if (musicMode === "compose" && !prompt.trim()) {
      setShowInspiration(true)
      showFeedbackMessage(
        "创意频谱待填充 → 尝试输入「新古典主义钢琴曲，左手法兰西序曲节奏型，右手指法密度 12 音/秒」，或唤起「乐理灵感库」获取 AI 作曲公式 💡",
      )
      return
    }

    if (musicMode === "voice" && !voiceText.trim()) {
      showFeedbackMessage("请输入需要合成的文本内容")
      return
    }

    if (musicMode === "edit" && !uploadedFile) {
      showFeedbackMessage("请先上传音频文件")
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setAudioWaveExplosion(true)
    setWaveformMountains(true)

    // 音浪爆发效果
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const containerRect = containerRef.current?.getBoundingClientRect()
      if (containerRect) {
        createAudioParticles(
          rect.left + rect.width / 2 - containerRect.left,
          rect.top + rect.height / 2 - containerRect.top,
          20,
          "frequency",
        )
      }
    }

    const modeMessages = {
      compose: `MusicGen 引擎点火 → 解析情感频谱（当前积极度 ${audioMetrics.positivity}%）→ 合成 8 乐器轨... 🎵`,
      edit: `音频编辑引擎启动 → 加载「${uploadedFile?.name}」→ 应用 ${audioEffects.filter((e) => e.enabled).length} 个音频效果... 🎛️`,
      voice: `语音合成引擎激活 → 文本长度 ${voiceText.length} 字符 → 使用「${voiceModels.find((v) => v.id === selectedVoice)?.name}」音色... 🎤`,
      library: "音效库搜索引擎启动 → 扫描 10万+ 音频样本 → 智能匹配最佳音效... 📚",
    }

    showFeedbackMessage(modeMessages[musicMode as keyof typeof modeMessages] || "处理开始")

    // 模拟生成进度
    const phases = [
      {
        progress: 25,
        message: "空间混响层构建（厅堂模式 RIR 加载）→ 动态范围压缩启动（DRC 阈值 -6dB）...",
        phase: "混响构建",
        metrics: { lufs: -18, dynamicRange: 45, rms: -20, peak: -8 },
      },
      {
        progress: 50,
        message: "和声进行分析完成 → 调性中心锁定 C 大调，属七和弦解决率 94.2%...",
        phase: "和声分析",
        metrics: { lufs: -16, dynamicRange: 55, rms: -19, peak: -7 },
      },
      {
        progress: 75,
        message: "乐器分离度优化 → 频谱遮蔽检测完成，各轨道频率分布已均衡化...",
        phase: "频谱优化",
        metrics: { lufs: -15, dynamicRange: 60, rms: -18, peak: -6 },
      },
      {
        progress: 100,
        message: "母带级响度匹配完成（LUFS -14）→ 声波指纹已生成，支持版权溯源 🌟",
        phase: "母带处理",
        metrics: { lufs: -14, dynamicRange: 62, rms: -18, peak: -6 },
      },
    ]

    for (const phase of phases) {
      await new Promise((resolve) => setTimeout(resolve, 2500))
      setProgress(phase.progress)
      setGenerationPhase(phase.phase)
      setAudioMetrics((prev) => ({ ...prev, ...phase.metrics }))
      showFeedbackMessage(phase.message)
    }

    // 生成完成效果
    setAudioWaveExplosion(false)
    setWaveformMountains(false)
    setHarmonyParticleRain(true)

    setTimeout(() => setHarmonyParticleRain(false), 4000)

    generateResult()
    setIsProcessing(false)

    // 更新项目状态
    if (currentProject) {
      setProjects((prev) => prev.map((p) => (p.id === currentProject.id ? { ...p, status: "completed" as const } : p)))
    }
  }, [
    musicMode,
    prompt,
    voiceText,
    uploadedFile,
    audioEffects,
    audioMetrics.positivity,
    selectedVoice,
    voiceModels,
    createAudioParticles,
    showFeedbackMessage,
    currentProject,
  ])

  // 生成结果
  const generateResult = useCallback(() => {
    const currentTime = new Date().toLocaleString("zh-CN")

    const modeResults = {
      compose: `# 🎵 YYC³ Music - AI作曲完成

## 📋 创作信息

• **使用模型**：${musicModel}
• **音乐风格**：${genre.toUpperCase()}
• **音乐时长**：${duration[0]} 秒
• **节拍速度**：${tempo[0]} BPM
• **调性**：${key} 大调
• **采样率**：44.1kHz/24bit
• **创作时间**：${currentTime}

## 🎯 创作描述

${prompt || "智能音乐生成"}

## 🎼 作曲结果

✅ AI作曲生成完成！

**音频技术参数**：
• 响度标准：LUFS ${audioMetrics.lufs}
• 动态范围：${audioMetrics.dynamicRange}dB
• 相位偏移：${audioMetrics.phaseOffset}ms
• 旋律熵值：${audioMetrics.entropy.toFixed(3)}
• 情感积极度：${audioMetrics.positivity}%
• RMS电平：${audioMetrics.rms}dB
• 峰值电平：${audioMetrics.peak}dB
• 立体声宽度：${audioMetrics.stereoWidth}%
• 总谐波失真：${audioMetrics.thd.toFixed(3)}%

**音乐结构分析**：
• 前奏：${Math.floor(duration[0] * 0.15)} 秒（氛围铺垫）
• 主歌：${Math.floor(duration[0] * 0.35)} 秒（主题呈现）
• 副歌：${Math.floor(duration[0] * 0.35)} 秒（情感高潮）
• 尾奏：${Math.floor(duration[0] * 0.15)} 秒（渐弱收束）

**乐器编配详情**：
• 主旋律：钢琴、合成器（频段 200Hz-4kHz）
• 和声层：弦乐组、合唱（频段 100Hz-8kHz）
• 节奏组：鼓组、贝斯（频段 20Hz-200Hz）
• 装饰音：${Math.floor(Math.random() * 3 + 2)} 种特色乐器`,

      edit: `# 🎛️ YYC³ Music - 音频编辑完成

## 📋 编辑信息

• **原始文件**：${uploadedFile?.name}
• **文件大小**：${uploadedFile ? (uploadedFile.size / 1024 / 1024).toFixed(2) : 0}MB
• **应用效果**：${audioEffects.filter((e) => e.enabled).length} 个
• **处理时间**：${currentTime}

## 🎚️ 应用的音频效果

${audioEffects
  .filter((e) => e.enabled)
  .map(
    (effect) =>
      `• **${effect.name}**：${Object.entries(effect.parameters)
        .map(([key, value]) => `${key}=${value}`)
        .join(", ")}`,
  )
  .join("\n")}

## 📊 音频分析结果

**技术指标**：
• 响度标准：LUFS ${audioMetrics.lufs}
• 动态范围：${audioMetrics.dynamicRange}dB
• RMS电平：${audioMetrics.rms}dB
• 峰值电平：${audioMetrics.peak}dB
• 立体声宽度：${audioMetrics.stereoWidth}%
• 总谐波失真：${audioMetrics.thd.toFixed(3)}%`,

      voice: `# 🎤 YYC³ Music - 语音合成完成

## 📋 合成信息

• **文本长度**：${voiceText.length} 字符
• **语音模型**：${voiceModels.find((v) => v.id === selectedVoice)?.name}
• **语言**：${voiceModels.find((v) => v.id === selectedVoice)?.language}
• **语速**：${voiceSpeed[0]}x
• **音调**：${voicePitch[0] > 0 ? "+" : ""}${voicePitch[0]}
• **音量**：${voiceVolume[0]}%
• **合成时间**：${currentTime}

## 📝 合成文本

${voiceText}

## 🎵 语音特征分析

**声学参数**：
• 基频范围：${voiceModels.find((v) => v.id === selectedVoice)?.gender === "female" ? "200-400Hz" : "100-200Hz"}
• 共振峰分布：F1=${Math.floor(Math.random() * 200 + 500)}Hz, F2=${Math.floor(Math.random() * 500 + 1500)}Hz
• 语音清晰度：${Math.floor(Math.random() * 10 + 90)}%
• 自然度评分：${Math.floor(Math.random() * 5 + 95)}/100`,

      library: `# 📚 YYC³ Music - 音效库搜索完成

## 🔍 搜索结果

• **匹配音效**：${Math.floor(Math.random() * 50 + 20)} 个
• **音效类型**：环境音、乐器采样、人声素材、节奏循环
• **音质等级**：24bit/96kHz 无损品质
• **搜索时间**：${currentTime}

## 🎵 推荐音效

• **环境音效**：雨声、海浪、森林、城市噪音
• **乐器采样**：钢琴、吉他、小提琴、萨克斯
• **节奏循环**：鼓点、贝斯线、打击乐组合
• **人声素材**：和声、呼吸音、口技、合唱

## 📊 音效库统计

• 总音效数量：100,000+
• 更新频率：每日新增 50+ 音效
• 音质标准：专业录音棚级别
• 版权状态：100% 免版税使用`,
    }

    setResult(modeResults[musicMode as keyof typeof modeResults] || "处理完成")
  }, [
    musicModel,
    genre,
    duration,
    tempo,
    key,
    audioMetrics,
    prompt,
    uploadedFile,
    audioEffects,
    voiceText,
    selectedVoice,
    voiceModels,
    voiceSpeed,
    voicePitch,
    voiceVolume,
    musicMode,
  ])

  // 处理播放/暂停
  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying)

    if (!isPlaying) {
      showFeedbackMessage(
        `音频流解码中 → 可视化声波映射「情感曲线」（${(currentTime / duration[0]).toFixed(1)}s 处钢琴泛音层能量峰值 ${audioMetrics.dynamicRange}%） 🎵`,
      )

      // 播放时的粒子跳动效果
      const interval = setInterval(() => {
        if (waveformRef.current) {
          const rect = waveformRef.current.getBoundingClientRect()
          createAudioParticles(rect.left + Math.random() * rect.width, rect.top + rect.height / 2, 4, "rhythm")
        }
      }, 500)

      setTimeout(() => clearInterval(interval), 5000)
    } else {
      setCrystalFreeze(true)
      setTimeout(() => setCrystalFreeze(false), 2000)

      showFeedbackMessage(
        `音乐进程冻结于 ${Math.floor(currentTime / 60)
          .toString()
          .padStart(2, "0")}:${Math.floor(currentTime % 60)
          .toString()
          .padStart(2, "0")} → 当前贝斯轨相位偏移 ${audioMetrics.phaseOffset}ms（可通过音频编辑模块修正） ⏸️`,
      )
    }
  }, [isPlaying, currentTime, duration, audioMetrics, createAudioParticles, showFeedbackMessage])

  // 处理重试
  const handleRetry = useCallback(async () => {
    setRepairProbe(true)
    showFeedbackMessage(
      "算力节点重连中 → 已切换至量子加速通道（当前算力冗余 47%），重试解锁 Hi-Res 级采样率（96kHz/24bit） 🛠️",
    )

    await new Promise((resolve) => setTimeout(resolve, 4000))
    setRepairProbe(false)
    processMusic()
  }, [processMusic, showFeedbackMessage])

  // 使用乐理灵感
  const useInspiration = useCallback(
    (seed: string) => {
      setPrompt(seed)
      setShowInspiration(false)
      showFeedbackMessage("乐理灵感库注入完成！AI 正在解析音乐理论参数，准备开启专业级作曲之旅 🎼✨")
    },
    [showFeedbackMessage],
  )

  // 随机生成种子
  const generateRandomSeed = useCallback(() => {
    const randomSeed = Math.floor(Math.random() * 1000000).toString()
    setSeed(randomSeed)
    showFeedbackMessage(`随机种子生成：${randomSeed}`)
  }, [showFeedbackMessage])

  // 初始化波形
  useEffect(() => {
    generateWaveform(duration[0], tempo[0])
  }, [duration, tempo, generateWaveform])

  // 清理粒子效果
  useEffect(() => {
    const cleanup = setInterval(() => {
      setAudioParticles((prev) => prev.filter((p) => Date.now() - p.id < 4000))
    }, 1000)

    return () => clearInterval(cleanup)
  }, [])

  // 模拟播放进度
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 0.1 * playbackSpeed[0]
          if (newTime >= duration[0]) {
            if (loopEnabled) {
              return 0
            } else {
              setIsPlaying(false)
              return 0
            }
          }
          return newTime
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying, duration, playbackSpeed, loopEnabled])

  // 生成频谱柱状图
  const frequencyBars = Array.from({ length: 32 }, (_, i) => (
    <div
      key={i}
      className="frequency-bar w-1 bg-gradient-to-t from-purple-500 to-cyan-400 opacity-60"
      style={{
        height: `${Math.random() * 80 + 20}%`,
        animationDelay: `${i * 0.1}s`,
      }}
    />
  ))

  return (
    <PageLayout title="🎵 YYC³ Music" description="AI音乐创作与音频处理工具">
      <div ref={containerRef} className="relative">
        {/* 全局样式 */}
        <style jsx>{`
          @keyframes soundWaveRipple {
            0% {
              transform: scale(0);
              opacity: 1;
              background: radial-gradient(circle, #8B5CF6 0%, #3B82F6 50%, transparent 70%);
            }
            100% {
              transform: scale(6);
              opacity: 0;
              background: radial-gradient(circle, transparent 0%, transparent 50%, transparent 70%);
            }
          }

          @keyframes chipInsertion {
            0% {
              transform: rotateY(0deg) scale(1);
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
            }
            25% {
              transform: rotateY(45deg) scale(0.9);
              box-shadow: 0 0 20px 5px rgba(59, 130, 246, 0.8);
            }
            50% {
              transform: rotateY(90deg) scale(0.8);
              box-shadow: 0 0 30px 10px rgba(139, 92, 246, 0.9);
            }
            75% {
              transform: rotateY(45deg) scale(0.9);
              box-shadow: 0 0 20px 5px rgba(59, 130, 246, 0.8);
            }
            100% {
              transform: rotateY(0deg) scale(1);
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
            }
          }

          @keyframes rhythmParticleExplosion {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.5);
              opacity: 0.8;
            }
            100% {
              transform: scale(2);
              opacity: 0;
            }
          }

          @keyframes audioWaveExplosion {
            0% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.8);
            }
            50% {
              transform: scale(1.15);
              box-shadow: 0 0 40px 15px rgba(245, 158, 11, 0.6);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
            }
          }

          @keyframes waveformMountains {
            0% {
              transform: scaleY(0);
              opacity: 0;
            }
            50% {
              transform: scaleY(1.2);
              opacity: 0.8;
            }
            100% {
              transform: scaleY(1);
              opacity: 1;
            }
          }

          @keyframes harmonyParticleRain {
            0% {
              opacity: 0;
              transform: translateY(-20px) rotate(0deg);
            }
            50% {
              opacity: 1;
              transform: translateY(0px) rotate(180deg);
            }
            100% {
              opacity: 0;
              transform: translateY(20px) rotate(360deg);
            }
          }

          @keyframes crystalFreeze {
            0% {
              filter: blur(0px) brightness(1);
              transform: scale(1);
            }
            50% {
              filter: blur(2px) brightness(1.5);
              transform: scale(1.05);
            }
            100% {
              filter: blur(0px) brightness(1);
              transform: scale(1);
            }
          }

          @keyframes repairProbe {
            0% {
              background: linear-gradient(90deg, #EF4444, #F59E0B);
              transform: scaleX(0);
            }
            50% {
              background: linear-gradient(90deg, #F59E0B, #10B981);
              transform: scaleX(0.5);
            }
            100% {
              background: linear-gradient(90deg, #10B981, #06B6D4);
              transform: scaleX(1);
            }
          }

          @keyframes audioParticleFloat {
            0% {
              opacity: 1;
              transform: translate(0, 0) scale(1) rotate(0deg);
            }
            100% {
              opacity: 0;
              transform: translate(var(--particle-dx), var(--particle-dy)) scale(0.3) rotate(360deg);
            }
          }

          @keyframes waveformPulse {
            0% {
              stroke-width: 2;
              opacity: 0.8;
            }
            50% {
              stroke-width: 4;
              opacity: 1;
            }
            100% {
              stroke-width: 2;
              opacity: 0.8;
            }
          }

          @keyframes frequencySpectrum {
            0% {
              height: 20%;
              background: linear-gradient(to top, #8B5CF6, #3B82F6);
            }
            25% {
              height: 60%;
              background: linear-gradient(to top, #3B82F6, #06B6D4);
            }
            50% {
              height: 90%;
              background: linear-gradient(to top, #06B6D4, #10B981);
            }
            75% {
              height: 40%;
              background: linear-gradient(to top, #10B981, #F59E0B);
            }
            100% {
              height: 20%;
              background: linear-gradient(to top, #F59E0B, #8B5CF6);
            }
          }

          @keyframes inspirationFloat {
            0% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(3deg); }
            100% { transform: translateY(0) rotate(0deg); }
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

          @keyframes dragActive {
            0% { border-color: rgba(139, 92, 246, 0.3); }
            50% { border-color: rgba(139, 92, 246, 0.8); }
            100% { border-color: rgba(139, 92, 246, 0.3); }
          }

          .sound-wave-ripple {
            animation: soundWaveRipple 2s ease-out;
          }

          .chip-insertion {
            animation: chipInsertion 2s ease-in-out;
          }

          .rhythm-particles::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, #F59E0B, #EF4444);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: rhythmParticleExplosion 0.5s ease-out infinite;
          }

          .audio-wave-explosion {
            animation: audioWaveExplosion 2s infinite;
          }

          .waveform-mountains {
            animation: waveformMountains 1s ease-out;
          }

          .harmony-particle-rain::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.3), transparent 50%);
            animation: harmonyParticleRain 4s ease-in-out;
            pointer-events: none;
          }

          .crystal-freeze {
            animation: crystalFreeze 2s ease-in-out;
          }

          .repair-probe::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            animation: repairProbe 4s ease-in-out;
            border-radius: inherit;
          }

          .audio-particle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            animation: audioParticleFloat 4s ease-out forwards;
            z-index: 10;
          }

          .waveform-line {
            animation: waveformPulse 2s ease-in-out infinite;
          }

          .frequency-bar {
            animation: frequencySpectrum 3s ease-in-out infinite;
          }

          .inspiration-card {
            animation: inspirationFloat 4s ease-in-out infinite;
          }

          .feedback-message {
            animation: feedbackSlide 0.3s ease-out forwards;
          }

          .drag-active {
            animation: dragActive 1s ease-in-out infinite;
          }

          .upload-progress {
            background: linear-gradient(90deg, #8B5CF6, #06B6D4);
            transition: width 0.3s ease;
          }
        `}</style>

        {/* 音频粒子效果 */}
        {audioParticles.map((particle) => (
          <div
            key={particle.id}
            className="audio-particle"
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
            <div className="bg-purple-600/90 backdrop-blur-md text-white px-6 py-3 rounded-full border border-purple-400/30">
              <p className="text-sm font-medium">{feedbackMessage}</p>
            </div>
          </div>
        )}

        {/* 主界面 */}
        <div className="space-y-6">
          {/* 顶部工具栏 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Music className="w-6 h-6 text-white" />
                  <div>
                    <h1 className="text-xl font-bold text-white">YYC³ Music</h1>
                    <p className="text-white/70 text-sm">AI音乐创作与音频处理引擎</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProjectManager(!showProjectManager)}
                    className="border-white/20 text-white bg-transparent"
                  >
                    <Library className="w-4 h-4 mr-2" />
                    项目管理
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    className="border-white/20 text-white bg-transparent"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    高级设置
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="border-white/20 text-white bg-transparent"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 项目管理面板 */}
          {showProjectManager && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Library className="w-5 h-5 mr-2" />
                  项目管理
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="输入项目名称"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                  <Button onClick={saveProject} className="bg-purple-600 hover:bg-purple-700">
                    <Save className="w-4 h-4 mr-2" />
                    保存项目
                  </Button>
                </div>

                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{project.name}</span>
                            <Badge
                              variant={
                                project.status === "completed"
                                  ? "default"
                                  : project.status === "processing"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="text-xs"
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
                          <p className="text-white/60 text-sm">
                            {project.mode} • {project.genre} • {project.duration}s • {project.tempo}BPM
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => loadProject(project)}
                            className="text-white/70 hover:text-white"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-white/70 hover:text-white">
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteProject(project.id)}
                            className="text-red-400 hover:text-red-300"
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

          {/* 主要控制面板 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="space-y-6 p-6">
              {/* 模式和模型选择 */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label className="text-white">处理模式</Label>
                  <div className="relative">
                    {soundWaveRipple && (
                      <div className="absolute inset-0 sound-wave-ripple border-2 border-purple-400/50 rounded-lg pointer-events-none" />
                    )}
                    <Select value={musicMode} onValueChange={handleModeChange}>
                      <SelectTrigger
                        className={`bg-white/10 border-white/20 text-white ${chipInsertion ? "chip-insertion" : ""}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20 text-white">
                        <SelectItem value="compose">
                          <div className="flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            AI作曲
                          </div>
                        </SelectItem>
                        <SelectItem value="edit">
                          <div className="flex items-center gap-2">
                            <Sliders className="w-4 h-4" />
                            音频编辑
                          </div>
                        </SelectItem>
                        <SelectItem value="voice">
                          <div className="flex items-center gap-2">
                            <Mic className="w-4 h-4" />
                            声音合成
                          </div>
                        </SelectItem>
                        <SelectItem value="library">
                          <div className="flex items-center gap-2">
                            <Library className="w-4 h-4" />
                            音效库
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-white">AI模型引擎</Label>
                  <Select value={musicModel} onValueChange={handleModelChange}>
                    <SelectTrigger
                      className={`bg-white/10 border-white/20 text-white ${chipInsertion ? "chip-insertion" : ""}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20 text-white">
                      <SelectItem value="musicgen-large">MusicGen Large</SelectItem>
                      <SelectItem value="audiocraft">AudioCraft</SelectItem>
                      <SelectItem value="jukebox">Jukebox</SelectItem>
                      <SelectItem value="mubert-ai">Mubert AI</SelectItem>
                      <SelectItem value="stable-audio">Stable Audio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">音乐风格</Label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20 text-white">
                      <SelectItem value="pop">流行</SelectItem>
                      <SelectItem value="rock">摇滚</SelectItem>
                      <SelectItem value="jazz">爵士</SelectItem>
                      <SelectItem value="classical">古典</SelectItem>
                      <SelectItem value="electronic">电子</SelectItem>
                      <SelectItem value="folk">民谣</SelectItem>
                      <SelectItem value="hiphop">嘻哈</SelectItem>
                      <SelectItem value="ambient">环境音乐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">调性</Label>
                  <Select value={key} onValueChange={setKey}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20 text-white">
                      <SelectItem value="C">C大调</SelectItem>
                      <SelectItem value="G">G大调</SelectItem>
                      <SelectItem value="D">D大调</SelectItem>
                      <SelectItem value="A">A大调</SelectItem>
                      <SelectItem value="E">E大调</SelectItem>
                      <SelectItem value="F">F大调</SelectItem>
                      <SelectItem value="Bb">Bb大调</SelectItem>
                      <SelectItem value="Eb">Eb大调</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">时长 ({duration[0]}s)</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-white/60 text-sm">10s</span>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      value={duration[0]}
                      onChange={(e) => setDuration([Number.parseInt(e.target.value)])}
                      className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-white/60 text-sm">300s</span>
                  </div>
                </div>
              </div>

              {/* 根据模式显示不同的内容区域 */}
              {musicMode === "compose" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <Label className="text-white flex items-center gap-2">
                          <Music className="w-4 h-4" />
                          音乐创作描述
                          {!prompt.trim() && (
                            <Badge
                              variant="outline"
                              className="text-xs border-yellow-400/30 text-yellow-300 animate-pulse"
                            >
                              创意频谱待填充
                            </Badge>
                          )}
                        </Label>
                        <textarea
                          placeholder="描述您想要创作的音乐，如：新古典主义钢琴曲，左手法兰西序曲节奏型，右手指法密度 12 音/秒..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="w-full mt-2 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 resize-none"
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label className="text-white">负向提示（可选）</Label>
                        <textarea
                          placeholder="描述不希望出现的音乐元素，如：避免过于嘈杂的鼓点、不要使用电子合成器..."
                          value={negativePrompt}
                          onChange={(e) => setNegativePrompt(e.target.value)}
                          className="w-full mt-2 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 resize-none"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white">节拍速度 ({tempo[0]} BPM)</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-white/60 text-sm">60</span>
                            <input
                              type="range"
                              min="60"
                              max="200"
                              value={tempo[0]}
                              onChange={(e) => setTempo([Number.parseInt(e.target.value)])}
                              className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-white/60 text-sm">200</span>
                          </div>
                        </div>

                        <div>
                          <Label className="text-white">引导强度 ({guidanceScale[0]})</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-white/60 text-sm">1</span>
                            <input
                              type="range"
                              min="1"
                              max="20"
                              step="0.5"
                              value={guidanceScale[0]}
                              onChange={(e) => setGuidanceScale([Number.parseFloat(e.target.value)])}
                              className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-white/60 text-sm">20</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 乐理灵感库 */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Music className="w-4 h-4 text-yellow-400" />
                        <Label className="text-white">乐理灵感库</Label>
                      </div>

                      <div className="space-y-3">
                        {Object.entries(musicTheorySeeds).map(([category, seeds]) => (
                          <div key={category} className="space-y-2">
                            <h4 className="text-white/80 text-sm font-medium capitalize">
                              {category === "classical"
                                ? "古典音乐"
                                : category === "popular"
                                  ? "流行音乐"
                                  : category === "experimental"
                                    ? "实验音乐"
                                    : "世界音乐"}
                            </h4>
                            {seeds.slice(0, 2).map((seed, index) => (
                              <div
                                key={index}
                                className="inspiration-card p-3 bg-white/5 border border-white/20 rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-300"
                                onClick={() => useInspiration(seed)}
                                style={{ animationDelay: `${index * 0.3}s` }}
                              >
                                <p className="text-white/80 text-sm leading-relaxed">{seed}</p>
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
                        <Music className="w-4 h-4 mr-2" />
                        {showInspiration ? "收起灵感" : "更多灵感"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {musicMode === "edit" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-white">上传音频文件</Label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                          dragActive
                            ? "border-purple-400/80 bg-purple-400/10 drag-active"
                            : "border-white/20 hover:border-purple-400/50"
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleFileUpload(e.target.files)}
                          className="hidden"
                        />
                        {uploadedFile ? (
                          <div className="space-y-2">
                            <Music className="w-10 h-10 text-green-400 mx-auto" />
                            <p className="text-white font-medium">{uploadedFile.name}</p>
                            <p className="text-white/60 text-sm">{(uploadedFile.size / 1024 / 1024).toFixed(2)}MB</p>
                            {uploadProgress < 100 && (
                              <div className="w-full bg-white/20 rounded-full h-2">
                                <div
                                  className="upload-progress h-2 rounded-full"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Music className="w-10 h-10 text-white/40 mx-auto" />
                            <p className="text-white/60">点击或拖拽上传音频文件</p>
                            <p className="text-white/40 text-sm">支持 MP3, WAV, FLAC, OGG, M4A 格式</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-white flex items-center gap-2">
                        <Sliders className="w-4 h-4" />
                        音频效果器
                      </Label>
                      <ScrollArea className="h-64 mt-2">
                        <div className="space-y-2">
                          {audioEffects.map((effect) => (
                            <div key={effect.id} className="p-3 bg-white/5 border border-white/20 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white font-medium">{effect.name}</span>
                                <button
                                  onClick={() => toggleAudioEffect(effect.id)}
                                  className={`w-10 h-6 rounded-full transition-colors ${
                                    effect.enabled ? "bg-purple-600" : "bg-white/20"
                                  }`}
                                >
                                  <div
                                    className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                      effect.enabled ? "translate-x-5" : "translate-x-1"
                                    }`}
                                  />
                                </button>
                              </div>
                              {effect.enabled && (
                                <div className="space-y-2">
                                  {Object.entries(effect.parameters).map(([param, value]) => (
                                    <div key={param} className="flex items-center gap-2">
                                      <span className="text-white/70 text-xs w-16">{param}</span>
                                      <input
                                        type="range"
                                        min={param.includes("Freq") ? 20 : param.includes("Time") ? 0 : -20}
                                        max={param.includes("Freq") ? 20000 : param.includes("Time") ? 2000 : 20}
                                        step={param.includes("Freq") ? 10 : 0.1}
                                        value={value}
                                        onChange={(e) =>
                                          updateEffectParameter(effect.id, param, Number.parseFloat(e.target.value))
                                        }
                                        className="flex-1 h-1 bg-white/20 rounded appearance-none cursor-pointer"
                                      />
                                      <span className="text-white/60 text-xs w-12">{value}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              )}

              {musicMode === "voice" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white flex items-center gap-2">
                          <Mic className="w-4 h-4" />
                          合成文本
                        </Label>
                        <textarea
                          placeholder="输入需要合成语音的文本内容..."
                          value={voiceText}
                          onChange={(e) => setVoiceText(e.target.value)}
                          className="w-full mt-2 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 resize-none"
                          rows={6}
                        />
                        <div className="flex justify-between text-white/60 text-sm mt-1">
                          <span>字符数: {voiceText.length}</span>
                          <span>预估时长: {Math.ceil(voiceText.length / 5)}秒</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-white">语速 ({voiceSpeed[0]}x)</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-white/60 text-sm">0.5</span>
                            <input
                              type="range"
                              min="0.5"
                              max="2.0"
                              step="0.1"
                              value={voiceSpeed[0]}
                              onChange={(e) => setVoiceSpeed([Number.parseFloat(e.target.value)])}
                              className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-white/60 text-sm">2.0</span>
                          </div>
                        </div>

                        <div>
                          <Label className="text-white">音调 ({voicePitch[0]})</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-white/60 text-sm">-12</span>
                            <input
                              type="range"
                              min="-12"
                              max="12"
                              value={voicePitch[0]}
                              onChange={(e) => setVoicePitch([Number.parseInt(e.target.value)])}
                              className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-white/60 text-sm">+12</span>
                          </div>
                        </div>

                        <div>
                          <Label className="text-white">音量 ({voiceVolume[0]}%)</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-white/60 text-sm">0</span>
                            <input
                              type="range"
                              min="0"
                              max="150"
                              value={voiceVolume[0]}
                              onChange={(e) => setVoiceVolume([Number.parseInt(e.target.value)])}
                              className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-white/60 text-sm">150</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">语音模型选择</Label>
                      <div className="space-y-2 mt-2">
                        {voiceModels.map((voice) => (
                          <div
                            key={voice.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              selectedVoice === voice.id
                                ? "border-purple-400 bg-purple-400/10"
                                : "border-white/20 bg-white/5 hover:bg-white/10"
                            }`}
                            onClick={() => setSelectedVoice(voice.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-medium">{voice.name}</span>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      voice.gender === "female"
                                        ? "border-pink-400/30 text-pink-300"
                                        : voice.gender === "male"
                                          ? "border-blue-400/30 text-blue-300"
                                          : "border-green-400/30 text-green-300"
                                    }`}
                                  >
                                    {voice.gender === "female" ? "女声" : voice.gender === "male" ? "男声" : "童声"}
                                  </Badge>
                                </div>
                                <p className="text-white/60 text-sm">{voice.style}</p>
                                <p className="text-white/40 text-xs">{voice.language}</p>
                              </div>
                              <Button size="sm" variant="ghost" className="text-white/70 hover:text-white">
                                <Music className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {musicMode === "library" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <Label className="text-white">搜索音效</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="输入关键词搜索音效，如：雨声、钢琴、鼓点..."
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        />
                        <Button className="bg-purple-600 hover:bg-purple-700">搜索</Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {["环境音", "乐器", "人声", "节奏", "特效", "自然", "城市", "电子"].map((category) => (
                          <Button
                            key={category}
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white bg-transparent hover:bg-white/10"
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">音效分类</Label>
                      <ScrollArea className="h-48 mt-2">
                        <div className="space-y-2">
                          {[
                            { name: "雨声", duration: "2:30", size: "3.2MB" },
                            { name: "海浪", duration: "1:45", size: "2.8MB" },
                            { name: "森林", duration: "3:15", size: "4.1MB" },
                            { name: "钢琴C调", duration: "0:05", size: "0.8MB" },
                            { name: "吉他和弦", duration: "0:03", size: "0.5MB" },
                            { name: "鼓点循环", duration: "0:08", size: "1.2MB" },
                          ].map((sound, index) => (
                            <div
                              key={index}
                              className="p-3 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 cursor-pointer"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-white font-medium">{sound.name}</span>
                                  <div className="flex items-center gap-2 text-white/60 text-sm">
                                    <span>{sound.duration}</span>
                                    <span>•</span>
                                    <span>{sound.size}</span>
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost" className="text-white/70 hover:text-white">
                                  <Music className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              )}

              {/* 高级设置面板 */}
              {showAdvancedSettings && (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">高级设置</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-white">生成步数 ({steps[0]})</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-white/60 text-sm">10</span>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={steps[0]}
                            onChange={(e) => setSteps([Number.parseInt(e.target.value)])}
                            className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-white/60 text-sm">100</span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-white">Top-K ({topK[0]})</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-white/60 text-sm">0</span>
                          <input
                            type="range"
                            min="0"
                            max="500"
                            value={topK[0]}
                            onChange={(e) => setTopK([Number.parseInt(e.target.value)])}
                            className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-white/60 text-sm">500</span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-white">Top-P ({topP[0]})</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-white/60 text-sm">0.0</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={topP[0]}
                            onChange={(e) => setTopP([Number.parseFloat(e.target.value)])}
                            className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-white/60 text-sm">1.0</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="randomSeed"
                          checked={useRandomSeed}
                          onChange={(e) => setUseRandomSeed(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="randomSeed" className="text-white">
                          使用随机种子
                        </Label>
                      </div>

                      {!useRandomSeed && (
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="输入种子值"
                            value={seed}
                            onChange={(e) => setSeed(e.target.value)}
                            className="w-32 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={generateRandomSeed}
                            className="border-white/20 text-white bg-transparent"
                          >
                            随机
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 3D声波山脉可视化 */}
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-white flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    3D声波山脉可视化
                    {isProcessing && <Badge className="bg-purple-500/20 text-purple-400 text-xs">实时FFT频谱</Badge>}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handlePlayPause}
                      size="sm"
                      variant="outline"
                      className={`border-white/20 text-white bg-transparent ${crystalFreeze ? "crystal-freeze" : ""}`}
                      disabled={!result}
                    >
                      {isPlaying ? "⏸️" : "▶️"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsMuted(!isMuted)}
                      className="border-white/20 text-white bg-transparent"
                    >
                      {isMuted ? "🔇" : "🔊"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowSpectrumAnalyzer(!showSpectrumAnalyzer)}
                      className="border-white/20 text-white bg-transparent"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div
                  ref={waveformRef}
                  className={`relative h-32 bg-black/20 rounded-lg overflow-hidden ${
                    waveformMountains ? "waveform-mountains" : ""
                  } ${harmonyParticleRain ? "harmony-particle-rain" : ""}`}
                >
                  {/* 波形可视化 */}
                  {showSpectrumAnalyzer && (
                    <svg className="absolute inset-0 w-full h-full">
                      <defs>
                        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="50%" stopColor="#06B6D4" />
                          <stop offset="100%" stopColor="#10B981" />
                        </linearGradient>
                      </defs>
                      <path
                        d={`M 0 64 ${waveformPoints.map((point, index) => `L ${point.x * 4} ${point.y}`).join(" ")}`}
                        stroke="url(#waveGradient)"
                        strokeWidth="2"
                        fill="none"
                        className="waveform-line"
                      />
                    </svg>
                  )}

                  {/* 频谱柱状图 */}
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around h-full">
                    {frequencyBars}
                  </div>

                  {/* 播放进度指示器 */}
                  {isPlaying && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white/80 transition-all duration-100"
                      style={{ left: `${(currentTime / duration[0]) * 100}%` }}
                    />
                  )}

                  {/* 时间显示 */}
                  <div className="absolute top-2 right-2 text-white/60 text-xs font-mono">
                    {Math.floor(currentTime / 60)
                      .toString()
                      .padStart(2, "0")}
                    :
                    {Math.floor(currentTime % 60)
                      .toString()
                      .padStart(2, "0")}{" "}
                    /
                    {Math.floor(duration[0] / 60)
                      .toString()
                      .padStart(2, "0")}
                    :
                    {Math.floor(duration[0] % 60)
                      .toString()
                      .padStart(2, "0")}
                  </div>

                  {/* 音频指标显示 */}
                  <div className="absolute bottom-2 left-2 flex gap-4 text-xs text-white/60">
                    <span>LUFS: {audioMetrics.lufs}</span>
                    <span>RMS: {audioMetrics.rms}dB</span>
                    <span>Peak: {audioMetrics.peak}dB</span>
                    <span>THD: {audioMetrics.thd.toFixed(3)}%</span>
                  </div>
                </div>

                {/* 播放控制 */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-sm">音量</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={isMuted ? 0 : volume[0]}
                        onChange={(e) => {
                          setVolume([Number.parseInt(e.target.value)])
                          setIsMuted(false)
                        }}
                        className="w-20 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-white/60 text-sm w-8">{isMuted ? 0 : volume[0]}%</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-sm">速度</span>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={playbackSpeed[0]}
                        onChange={(e) => setPlaybackSpeed([Number.parseFloat(e.target.value)])}
                        className="w-20 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-white/60 text-sm w-8">{playbackSpeed[0]}x</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setLoopEnabled(!loopEnabled)}
                      className={`border-white/20 text-white bg-transparent ${loopEnabled ? "bg-purple-600/20" : ""}`}
                    >
                      🔁
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShuffleEnabled(!shuffleEnabled)}
                      className={`border-white/20 text-white bg-transparent ${shuffleEnabled ? "bg-purple-600/20" : ""}`}
                    >
                      🔀
                    </Button>
                  </div>
                </div>
              </div>

              {/* 生成按钮和进度 */}
              <div className="space-y-4">
                <Button
                  ref={buttonRef}
                  onClick={processMusic}
                  disabled={isProcessing}
                  className={`w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white py-4 text-lg ${
                    audioWaveExplosion ? "audio-wave-explosion" : ""
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>
                        {musicMode === "compose"
                          ? "MusicGen 引擎运行中..."
                          : musicMode === "edit"
                            ? "音频编辑处理中..."
                            : musicMode === "voice"
                              ? "语音合成中..."
                              : "音效搜索中..."}
                      </span>
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {generationPhase}
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Music className="w-5 h-5" />
                      启动AI音乐引擎
                    </div>
                  )}
                </Button>

                {/* 音频处理进度条 */}
                {isProcessing && (
                  <div className="relative h-8 bg-white/10 rounded-lg overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        音频处理: {progress}% | LUFS: {audioMetrics.lufs} | 动态范围: {audioMetrics.dynamicRange}dB
                      </span>
                    </div>
                  </div>
                )}

                {/* 重试按钮 */}
                {result && !isProcessing && (
                  <Button
                    onClick={handleRetry}
                    disabled={repairProbe}
                    variant="outline"
                    className={`w-full border-white/20 text-white bg-transparent hover:bg-white/10 relative overflow-hidden ${
                      repairProbe ? "repair-probe" : ""
                    }`}
                  >
                    {repairProbe ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        量子加速通道重连中...
                      </>
                    ) : (
                      <>
                        <Settings className="w-4 h-4 mr-2" />
                        重启音乐引擎
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* 结果显示 */}
              {result && (
                <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-white flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      创作结果
                      <Badge className="bg-green-500/20 text-green-400 text-xs">音频工程分析完成</Badge>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="border-white/20 text-white bg-transparent">
                        <Share2 className="w-4 h-4 mr-2" />
                        分享
                      </Button>
                      <Button size="sm" variant="outline" className="border-white/20 text-white bg-transparent">
                        <Save className="w-4 h-4 mr-2" />
                        下载音频
                      </Button>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-white text-sm whitespace-pre-wrap font-mono">{result}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 隐藏的音频元素 */}
        <audio ref={audioRef} className="hidden" />
      </div>
    </PageLayout>
  )
}
