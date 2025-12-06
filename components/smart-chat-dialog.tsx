"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Mic,
  Send,
  Upload,
  MicOff,
  Loader2,
  Lightbulb,
  Search,
  X,
  Volume2,
  AlertCircle,
  Settings,
  Play,
  RotateCcw,
} from "lucide-react"
import { LogoIcon } from "@/components/ui/logo"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { SpeechRecognition, SpeechSynthesis, SpeechSynthesisVoice } from "web-speech-api"

interface SmartChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  isTyping?: boolean
}

interface VoiceSettings {
  rate: number
  pitch: number
  volume: number
  voice: string
}

interface CustomVoice {
  id: string
  name: string
  audioBlob: Blob
  duration: number
}

export function SmartChatDialog({ open, onOpenChange }: SmartChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [searchValue, setSearchValue] = useState("")
  // 添加语音相关状态
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null)
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [speechError, setSpeechError] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [typingText, setTypingText] = useState("")
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [aiStatus, setAiStatus] = useState<"idle" | "thinking" | "responding">("idle")
  const [sendingAnimation, setSendingAnimation] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // 语音设置相关状态
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    rate: 1.0, // 常规语速
    pitch: 1.0,
    volume: 0.8,
    voice: "default",
  })

  // 自定义语音录制状态
  const [isRecordingCustomVoice, setIsRecordingCustomVoice] = useState(false)
  const [customVoices, setCustomVoices] = useState<CustomVoice[]>([])
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [isPlayingPreview, setIsPlayingPreview] = useState(false)
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 语速预设选项
  const speedPresets = [
    { label: "慢速", value: 0.7 },
    { label: "常规", value: 1.0 },
    { label: "快速", value: 1.3 },
    { label: "极快", value: 1.6 },
  ]

  // 搜索功能
  useEffect(() => {
    if (!searchValue.trim()) {
      setFilteredMessages(messages)
    } else {
      const filtered = messages.filter((message) => message.content.toLowerCase().includes(searchValue.toLowerCase()))
      setFilteredMessages(filtered)
    }
  }, [messages, searchValue])

  // 打字机效果
  const typeWriter = (text: string, callback?: () => void) => {
    let index = 0
    setTypingText("")
    setAiStatus("responding")

    const timer = setInterval(() => {
      if (index < text.length) {
        setTypingText(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(timer)
        setAiStatus("idle")
        // 打字完成后自动播放语音
        setTimeout(() => speakText(text), 500)
        callback?.()
      }
    }, 50)

    return timer
  }

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [filteredMessages, typingText])

  // 初始化欢迎消息
  useEffect(() => {
    if (open && messages.length === 0) {
      const welcomeText = `"云枢"二字蕴含深意，智慧二字如红灯笼，当"言"成为破局算法，"语"便成了未来接口——我们拆解传统数据，用0与1重构内容维度。此刻对机，便是文明升级的总枢纽。

欢迎使用YYC³ AI助手，我可以帮您完成各种创作任务。请告诉我您想要做什么？`

      setAiStatus("responding")
      const timer = typeWriter(welcomeText, () => {
        setMessages([
          {
            id: "welcome",
            type: "assistant",
            content: welcomeText,
            timestamp: new Date(),
          },
        ])
        setTypingText("")
      })

      return () => clearInterval(timer)
    }
  }, [open, messages.length])

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    // 发送动效
    setSendingAnimation(true)
    setTimeout(() => setSendingAnimation(false), 800)

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue("")
    setIsProcessing(true)
    setAiStatus("thinking")

    // 模拟AI响应
    setTimeout(() => {
      const responseText = generateAIResponse(currentInput)

      const timer = typeWriter(responseText, () => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: responseText,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiResponse])
        setTypingText("")
        setIsProcessing(false)
      })

      return () => clearInterval(timer)
    }, 1000)
  }

  // 生成AI响应
  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("图") || lowerInput.includes("画") || lowerInput.includes("设计")) {
      return "我可以帮您生成各种风格的图片！请描述您想要的图片内容，比如风格、主题、色彩等，我会为您创作出精美的作品。您也可以直接前往相关模块进行详细设置。"
    } else if (lowerInput.includes("翻译") || lowerInput.includes("语言")) {
      return "言语翻译是我的专长！我支持多种语言之间的智能翻译，不仅能准确传达意思，还能保持语言的文化内涵和表达习惯。请告诉我您需要翻译什么内容。"
    } else if (lowerInput.includes("医疗") || lowerInput.includes("健康")) {
      return "云枢医疗系统可以为您提供智能健康咨询和医疗信息服务。我可以帮您分析健康数据、提供医疗建议、解答健康疑问。请注意，我的建议仅供参考，具体诊疗请咨询专业医生。"
    } else if (lowerInput.includes("社区") || lowerInput.includes("交流")) {
      return "万象社区是一个充满创意和智慧的交流平台！在这里，您可以与其他用户分享创作、交流想法、获得灵感。我可以帮您连接到相关的社区功能和讨论话题。"
    } else if (lowerInput.includes("云呼") || lowerInput.includes("通讯")) {
      return "智慧云呼系统提供智能通讯服务，包括语音通话、视频会议、智能客服等功能。我可以帮您建立高效的沟通渠道，提升交流体验。"
    } else if (lowerInput.includes("云枢") || lowerInput.includes("概念")) {
      return `"云枢"是YYC³平台的核心理念，代表着万象归元的智能中枢。在这里，所有的数据、算法、创意都汇聚成一个统一的智能体系。

云枢不仅是技术架构的核心，更是思维模式的革新——它将分散的智能服务整合为一个有机整体，让每一次交互都成为智慧升级的契机。

通过云枢，我们实现了从传统工具到智能伙伴的跨越，让AI不再是冰冷的程序，而是理解您需求、激发您创意的智慧助手。`
    } else {
      return "感谢您的提问！我是YYC³云枢智能助手，可以帮您完成各种任务：智慧云呼通讯服务、云枢医疗健康咨询、言语翻译多语言服务、万象社区创意交流等。请具体告诉我您想要做什么，我会为您提供最合适的解决方案。"
    }
  }

  // 检查网络状态
  const checkNetworkStatus = (): boolean => {
    return navigator.onLine
  }

  // 获取错误消息
  const getErrorMessage = (error: string): string => {
    switch (error) {
      case "network":
        return "网络连接问题，请检查网络后重试"
      case "not-allowed":
        return "麦克风权限被拒绝，请在浏览器设置中允许麦克风访问"
      case "no-speech":
        return "未检测到语音，请重新尝试"
      case "audio-capture":
        return "麦克风无法访问，请检查设备连接"
      case "service-not-allowed":
        return "语音服务不可用"
      case "language-not-supported":
        return "不支持当前语言"
      default:
        return "语音识别出现问题，请重试"
    }
  }

  // 初始化语音功能
  useEffect(() => {
    // 检查浏览器支持
    const checkSpeechSupport = () => {
      const recognition = "webkitSpeechRecognition" in window || "SpeechRecognition" in window
      const synthesis = "speechSynthesis" in window
      setSpeechSupported(recognition && synthesis)

      if (recognition) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognitionInstance = new SpeechRecognition()

        // 优化配置
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = true
        recognitionInstance.lang = "zh-CN"
        recognitionInstance.maxAlternatives = 1

        recognitionInstance.onstart = () => {
          setIsListening(true)
          setSpeechError("")
          console.log("语音识别开始")
        }

        recognitionInstance.onresult = (event) => {
          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          if (finalTranscript) {
            setInputValue(finalTranscript)
            setRetryCount(0) // 重置重试计数
          }
        }

        recognitionInstance.onerror = (event) => {
          console.error("语音识别错误:", event.error, event.message)
          setIsListening(false)

          const errorMsg = getErrorMessage(event.error)
          setSpeechError(errorMsg)

          // 网络错误时的重试逻辑
          if (event.error === "network" && retryCount < 2) {
            setTimeout(() => {
              if (checkNetworkStatus()) {
                setRetryCount((prev) => prev + 1)
                setSpeechError("网络重连中，正在重试...")
                // 不自动重试，让用户手动重试
              }
            }, 2000)
          }
        }

        recognitionInstance.onend = () => {
          setIsListening(false)
          console.log("语音识别结束")
        }

        recognitionInstance.onnomatch = () => {
          setSpeechError("未识别到有效语音，请重新尝试")
          setIsListening(false)
        }

        setSpeechRecognition(recognitionInstance)
      }

      if (synthesis) {
        setSpeechSynthesis(window.speechSynthesis)

        // 获取可用语音
        const loadVoices = () => {
          const availableVoices = window.speechSynthesis.getVoices()
          setVoices(availableVoices)

          // 优先选择中文语音
          const chineseVoice = availableVoices.find(
            (voice) => voice.lang.includes("zh") || voice.lang.includes("CN") || voice.name.includes("Chinese"),
          )
          setSelectedVoice(chineseVoice || availableVoices[0])

          // 更新语音设置
          if (chineseVoice || availableVoices[0]) {
            setVoiceSettings((prev) => ({
              ...prev,
              voice: (chineseVoice || availableVoices[0]).name,
            }))
          }
        }

        // 延迟加载语音列表
        setTimeout(loadVoices, 100)
        window.speechSynthesis.onvoiceschanged = loadVoices
      }
    }

    if (open) {
      checkSpeechSupport()
      if ("speechSynthesis" in window) {
        checkSpeechSynthesisAvailability()
      }
    }
  }, [open, retryCount])

  // 检查语音合成可用性
  const checkSpeechSynthesisAvailability = (): boolean => {
    if (!("speechSynthesis" in window)) {
      setSpeechError("您的浏览器不支持语音合成功能")
      return false
    }

    // 检查语音列表是否可用
    const voices = window.speechSynthesis.getVoices()
    if (voices.length === 0) {
      // 延迟检查，有些浏览器需要时间加载语音
      setTimeout(() => {
        const delayedVoices = window.speechSynthesis.getVoices()
        if (delayedVoices.length === 0) {
          setSpeechError("语音合成服务暂时不可用，请稍后重试")
        } else {
          setSpeechError("")
          setVoices(delayedVoices)
          // 选择中文语音
          const chineseVoice = delayedVoices.find(
            (voice) => voice.lang.includes("zh") || voice.lang.includes("CN") || voice.name.includes("Chinese"),
          )
          setSelectedVoice(chineseVoice || delayedVoices[0])
        }
      }, 1000)
      return false
    }

    return true
  }

  // 语音识别功能
  const toggleVoiceRecognition = () => {
    if (!speechSupported || !speechRecognition) {
      setSpeechError("您的浏览器不支持语音识别功能，请使用Chrome、Edge或Safari浏览器")
      return
    }

    if (!checkNetworkStatus()) {
      setSpeechError("网络连接不可用，语音识别需要网络支持")
      return
    }

    if (isListening) {
      speechRecognition.stop()
      setIsListening(false)
      setSpeechError("")
    } else {
      try {
        // 清除之前的错误
        setSpeechError("")
        speechRecognition.start()
      } catch (error) {
        console.error("启动语音识别失败:", error)
        setSpeechError("语音识别启动失败，请检查麦克风权限")
      }
    }
  }

  // 语音合成功能
  const speakText = (text: string) => {
    if (!speechSupported || !speechSynthesis) {
      console.warn("语音合成不可用")
      setSpeechError("语音合成功能不可用，请检查浏览器支持")
      return
    }

    if (!selectedVoice) {
      console.warn("未选择语音")
      setSpeechError("语音未就绪，请稍后重试")
      return
    }

    // 停止当前播放
    speechSynthesis.cancel()

    try {
      // 处理长文本，分段播放
      const maxLength = 200
      const textSegments = text.length > maxLength ? text.match(new RegExp(`.{1,${maxLength}}`, "g")) || [text] : [text]

      let currentSegment = 0

      const speakSegment = () => {
        if (currentSegment >= textSegments.length) {
          setIsSpeaking(false)
          return
        }

        const utterance = new SpeechSynthesisUtterance(textSegments[currentSegment])
        utterance.voice = selectedVoice
        utterance.rate = voiceSettings.rate
        utterance.pitch = voiceSettings.pitch
        utterance.volume = voiceSettings.volume

        utterance.onstart = () => {
          setIsSpeaking(true)
          setSpeechError("") // 清除错误信息
        }

        utterance.onend = () => {
          currentSegment++
          if (currentSegment < textSegments.length) {
            setTimeout(speakSegment, 100) // 短暂停顿后继续下一段
          } else {
            setIsSpeaking(false)
          }
        }

        utterance.onerror = (event) => {
          console.error("语音合成错误:", event.error)
          setIsSpeaking(false)
          setSpeechError("语音播放出现问题，请重试")
        }

        speechSynthesis.speak(utterance)
      }

      speakSegment()
    } catch (error) {
      console.error("语音合成启动失败:", error)
      setSpeechError("语音合成启动失败，请重试")
      setIsSpeaking(false)
    }
  }

  // 停止语音播放
  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  // 开始录制自定义语音
  const startCustomVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)

      setMediaRecorder(recorder)
      setAudioChunks([])
      setRecordingDuration(0)
      setIsRecordingCustomVoice(true)

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data])
        }
      }

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        setIsRecordingCustomVoice(false)
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current)
        }
      }

      recorder.start()

      // 开始计时
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("录制失败:", error)
      setSpeechError("无法访问麦克风，请检查权限设置")
    }
  }

  // 停止录制自定义语音
  const stopCustomVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop()
    }
  }

  // 保存自定义语音
  const saveCustomVoice = (name: string) => {
    if (audioChunks.length > 0) {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" })
      const customVoice: CustomVoice = {
        id: Date.now().toString(),
        name: name || `自定义语音 ${customVoices.length + 1}`,
        audioBlob,
        duration: recordingDuration,
      }

      setCustomVoices((prev) => [...prev, customVoice])
      setAudioChunks([])
      setRecordingDuration(0)
    }
  }

  // 播放自定义语音预览
  const playCustomVoicePreview = (voice: CustomVoice) => {
    if (previewAudio) {
      previewAudio.pause()
      setPreviewAudio(null)
      setIsPlayingPreview(false)
    }

    const audio = new Audio(URL.createObjectURL(voice.audioBlob))
    setPreviewAudio(audio)
    setIsPlayingPreview(true)

    audio.onended = () => {
      setIsPlayingPreview(false)
      setPreviewAudio(null)
    }

    audio.play()
  }

  // 删除自定义语音
  const deleteCustomVoice = (voiceId: string) => {
    setCustomVoices((prev) => prev.filter((voice) => voice.id !== voiceId))
  }

  // 文件上传
  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  // 清空搜索
  const clearSearch = () => {
    setSearchValue("")
  }

  // 清除语音错误
  const clearSpeechError = () => {
    setSpeechError("")
  }

  // 格式化录制时间
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl h-[85vh] bg-white/95 backdrop-blur-xl border border-white/20 p-0 overflow-hidden rounded-3xl flex flex-col"
        aria-describedby="smart-chat-description"
      >
        <DialogTitle className="sr-only">YYC³ 云枢智能助手</DialogTitle>
        <DialogDescription id="smart-chat-description" className="sr-only">
          智能对话助手，支持语音识别、语音合成、文件上传等功能。使用麦克风按钮进行语音输入，使用发送按钮发送消息。
        </DialogDescription>

        {/* 固定头部区域 - 标题栏 */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/95 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <LogoIcon size="sm" />
            </div>
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">YYC³ 云枢智能助手</h2>
                <p className="text-gray-600 text-sm">深栈智能，万象归元</p>
              </div>
              {/* 智能状态呼吸灯 */}
              <div
                className={`status-indicator ${
                  aiStatus === "thinking" || aiStatus === "responding" ? "status-thinking" : "status-idle"
                }`}
              />
              {/* 语音控制按钮 */}
              {isSpeaking && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stopSpeaking}
                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full p-2 ml-2"
                  title="停止语音播放"
                >
                  <MicOff className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* 搜索栏和设置按钮 */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索聊天记录..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-500 rounded-full text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {searchValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 rounded-full"
                >
                  ×
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2"
              title="语音设置"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* 语音设置面板 */}
        {showVoiceSettings && (
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gray-50/95 backdrop-blur-xl">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">语音设置</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 语音选择 */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">语音选择</Label>
                  <Select
                    value={voiceSettings.voice}
                    onValueChange={(value) => {
                      const voice = voices.find((v) => v.name === value)
                      if (voice) {
                        setSelectedVoice(voice)
                        setVoiceSettings((prev) => ({ ...prev, voice: value }))
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="选择语音" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices
                        .filter((voice) => voice.lang.includes("zh") || voice.lang.includes("CN"))
                        .map((voice) => (
                          <SelectItem key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 语速控制 */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">语速控制</Label>
                  <div className="flex gap-2 mb-2">
                    {speedPresets.map((preset) => (
                      <Button
                        key={preset.label}
                        variant={voiceSettings.rate === preset.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setVoiceSettings((prev) => ({ ...prev, rate: preset.value }))}
                        className="text-xs"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>慢</span>
                      <span>当前: {voiceSettings.rate.toFixed(1)}x</span>
                      <span>快</span>
                    </div>
                    <Slider
                      value={[voiceSettings.rate]}
                      onValueChange={([value]) => setVoiceSettings((prev) => ({ ...prev, rate: value }))}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* 音调控制 */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">音调控制</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>低</span>
                      <span>当前: {voiceSettings.pitch.toFixed(1)}</span>
                      <span>高</span>
                    </div>
                    <Slider
                      value={[voiceSettings.pitch]}
                      onValueChange={([value]) => setVoiceSettings((prev) => ({ ...prev, pitch: value }))}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* 音量控制 */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">音量控制</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>小</span>
                      <span>当前: {Math.round(voiceSettings.volume * 100)}%</span>
                      <span>大</span>
                    </div>
                    <Slider
                      value={[voiceSettings.volume]}
                      onValueChange={([value]) => setVoiceSettings((prev) => ({ ...prev, volume: value }))}
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* 自定义语音录制 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">自定义语音</Label>

                {/* 录制控制 */}
                <div className="flex items-center gap-3">
                  {!isRecordingCustomVoice ? (
                    <Button
                      onClick={startCustomVoiceRecording}
                      className="bg-red-500 hover:bg-red-600 text-white"
                      size="sm"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      开始录制
                    </Button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={stopCustomVoiceRecording}
                        className="bg-red-500 hover:bg-red-600 text-white recording-pulse"
                        size="sm"
                      >
                        <MicOff className="w-4 h-4 mr-2" />
                        停止录制
                      </Button>
                      <span className="text-sm text-red-600 font-mono">{formatRecordingTime(recordingDuration)}</span>
                    </div>
                  )}

                  {audioChunks.length > 0 && !isRecordingCustomVoice && (
                    <Button onClick={() => saveCustomVoice("")} variant="outline" size="sm">
                      保存录音
                    </Button>
                  )}
                </div>

                {/* 自定义语音列表 */}
                {customVoices.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">已保存的语音</Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {customVoices.map((voice) => (
                        <div key={voice.id} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{voice.name}</span>
                            <span className="text-xs text-gray-500">{formatRecordingTime(voice.duration)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              onClick={() => playCustomVoicePreview(voice)}
                              variant="ghost"
                              size="sm"
                              className="p-1 h-6 w-6"
                              disabled={isPlayingPreview}
                            >
                              <Play className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => deleteCustomVoice(voice.id)}
                              variant="ghost"
                              size="sm"
                              className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 测试语音 */}
              <div className="flex gap-2">
                <Button
                  onClick={() => speakText("这是语音测试，您可以听到当前的语音设置效果。")}
                  variant="outline"
                  size="sm"
                  disabled={isSpeaking}
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  测试语音
                </Button>
                <Button
                  onClick={() =>
                    setVoiceSettings({ rate: 1.0, pitch: 1.0, volume: 0.8, voice: selectedVoice?.name || "default" })
                  }
                  variant="outline"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  重置设置
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 固定功能按钮区域 */}
        <div className="flex-shrink-0 flex items-center justify-center gap-4 px-6 py-3 border-b border-gray-100 bg-white/95 backdrop-blur-xl">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100 rounded-full px-4 py-2">
            <Lightbulb className="w-4 h-4 mr-2" />
            灵感查看
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100 rounded-full px-4 py-2">
            <Search className="w-4 h-4 mr-2" />
            智问搜索
          </Button>
        </div>

        {/* 可滚动的消息区域 */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* 搜索结果提示 */}
          {searchValue && (
            <div className="flex-shrink-0 px-6 py-2 bg-blue-50 border-b border-blue-100">
              <p className="text-sm text-blue-600">
                {filteredMessages.length > 0
                  ? `找到 ${filteredMessages.length} 条包含"${searchValue}"的消息`
                  : `未找到包含"${searchValue}"的消息`}
              </p>
            </div>
          )}

          {/* 语音错误提示 */}
          {speechError && (
            <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{speechError}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSpeechError}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* 数据传输提示 */}
          {sendingAnimation && (
            <div className="flex-shrink-0 px-6 py-2 bg-purple-50 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <div className="progress-bar rounded-full"></div>
                <span className="text-sm text-purple-600">数据传输中...</span>
              </div>
            </div>
          )}

          {/* 语音状态提示 */}
          {isListening && (
            <div className="flex-shrink-0 px-6 py-2 bg-green-50 border-b border-green-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600">正在录音中，请说话...</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleVoiceRecognition}
                  className="text-green-600 hover:text-green-800 p-1 h-6 text-xs ml-2"
                >
                  停止录音
                </Button>
              </div>
            </div>
          )}

          {isSpeaking && (
            <div className="flex-shrink-0 px-6 py-2 bg-blue-50 border-b border-blue-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-600">正在播放语音...</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stopSpeaking}
                  className="text-blue-600 hover:text-blue-800 p-1 h-6 text-xs ml-2"
                >
                  停止播放
                </Button>
              </div>
            </div>
          )}

          {/* 消息列表 - 独立滚动区域 */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* 打字机效果显示区域 */}
                {typingText && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-4 rounded-2xl bg-gray-100 text-gray-800 border border-gray-200 relative">
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {typingText}
                        <span className="inline-block w-2 h-5 bg-gray-400 ml-1 animate-pulse"></span>
                      </p>
                      {/* 进度光条 */}
                      {aiStatus === "responding" && (
                        <div className="absolute right-2 top-2 w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className="progress-bar rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {filteredMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.type === "user"
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                          : "bg-gray-100 text-gray-800 border border-gray-200"
                      } ${
                        searchValue && message.content.toLowerCase().includes(searchValue.toLowerCase())
                          ? "ring-2 ring-yellow-300 bg-yellow-50"
                          : ""
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {searchValue && message.content.toLowerCase().includes(searchValue.toLowerCase()) ? (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: message.content.replace(
                                new RegExp(`(${searchValue})`, "gi"),
                                '<mark class="bg-yellow-200 px-1 rounded">$1</mark>',
                              ),
                            }}
                          />
                        ) : (
                          message.content
                        )}
                      </p>
                      {message.type === "assistant" && (
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString()}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => speakText(message.content)}
                            className="text-gray-400 hover:text-blue-500 p-1 h-6 w-6"
                            title="播放语音"
                            disabled={isSpeaking}
                          >
                            <Volume2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      {message.type === "user" && (
                        <p className={`text-xs mt-2 ${message.type === "user" ? "text-white/70" : "text-gray-500"}`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* AI处理中指示器 */}
                {isProcessing && !typingText && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 border border-gray-200 p-4 rounded-2xl relative">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                        <span className="text-sm typing-placeholder">▌▌▌ 正在构建创意矩阵...</span>
                      </div>
                      {/* 进度光条 */}
                      <div className="absolute right-2 top-2 w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="progress-bar rounded-full"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* 固定底部输入区域 */}
        <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-white/95 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="输入您想要的任何内容..."
                className={`bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-500 rounded-full py-3 px-4 pr-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                  isFocused ? "input-focused" : ""
                } ${sendingAnimation ? "sending-animation" : ""}`}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isProcessing}
              />
              <Button
                size="sm"
                variant="ghost"
                className={`absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 rounded-full transition-all duration-300 ${
                  isListening ? "text-red-500 bg-red-50 animate-pulse" : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={toggleVoiceRecognition}
                disabled={isProcessing}
                title={isListening ? "点击停止录音" : "点击开始语音输入"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleFileUpload}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-10 h-10 p-0 transition-all duration-300"
              disabled={isProcessing}
            >
              <Upload className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing}
              className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full w-10 h-10 p-0 transition-all duration-300 ${
                isFocused && inputValue.trim() ? "send-button-active" : ""
              }`}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              setInputValue(`已上传文件：${file.name}，请告诉我需要如何处理？`)
            }
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
