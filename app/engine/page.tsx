"use client"
import { motion } from "framer-motion"
import { Play, ImageIcon, MessageSquare, Code } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { EngineClientPage } from "./EngineClientPage"

// 本地模型数据
const localModels = [
  { name: "deepseek-r1:latest", size: "5.2GB", context: "128K", status: "ready" },
  { name: "deepseek-r1:1.5b", size: "1.1GB", context: "128K", status: "ready" },
  { name: "deepseek-r1:7b", size: "4.7GB", context: "128K", status: "ready" },
  { name: "deepseek-r1:8b", size: "5.2GB", context: "128K", status: "ready" },
  { name: "deepseek-r1:14b", size: "9.0GB", context: "128K", status: "ready" },
  { name: "deepseek-r1:32b", size: "20GB", context: "128K", status: "downloading" },
  { name: "deepseek-r1:70b", size: "43GB", context: "128K", status: "offline" },
  { name: "hermes3:latest", size: "4.7GB", context: "128K", status: "ready" },
  { name: "hermes3:3b", size: "2.0GB", context: "128K", status: "ready" },
  { name: "hermes3:8blatest", size: "4.7GB", context: "128K", status: "ready" },
  { name: "hermes3:70b", size: "40GB", context: "128K", status: "offline" },
  { name: "qwen3:latest", size: "5.2GB", context: "40K", status: "ready" },
  { name: "qwen3:0.6b", size: "523MB", context: "40K", status: "ready" },
  { name: "qwen3:1.7b", size: "1.4GB", context: "40K", status: "ready" },
  { name: "qwen3:4b", size: "2.6GB", context: "40K", status: "ready" },
  { name: "qwen3:8blatest", size: "5.2GB", context: "40K", status: "ready" },
  { name: "qwen3:14b", size: "9.3GB", context: "40K", status: "ready" },
  { name: "gemma3:latest", size: "3.3GB", context: "128K", status: "ready" },
  { name: "gemma3:1b", size: "815MB", context: "32K", status: "ready" },
  { name: "gemma3:4blatest", size: "3.3GB", context: "128K", status: "ready" },
  { name: "gemma3:12b", size: "8.1GB", context: "128K", status: "ready" },
  { name: "gemma3:27b", size: "17GB", context: "128K", status: "offline" },
]

// 云端模型数据
const cloudModels = [
  "GLM-4.1V-Thinking",
  "GLM-4-Flash-250414",
  "GLM-4V-Flash",
  "GLM-Z1-Flash",
  "CogView-3-Flash",
  "CogVideoX-Flash",
]

// 授权证书数据
const certificates = [
  { name: "CogAgent", code: "20250423992623136", validity: "永久" },
  { name: "CodeGeeX4-ALL-9B", code: "20250208680265122", validity: "永久" },
  { name: "CogVideoX-5B", code: "20241214106378588", validity: "永久" },
  { name: "ChatGLM3-6B", code: "20241128305315273", validity: "永久" },
]

// 模型能力数据
const modelCapabilities = [
  {
    name: "对话生成",
    model: "GLM-4.1V-Thinking",
    description: "多轮对话、逻辑推理、知识问答",
    icon: <MessageSquare className="w-5 h-5 text-blue-400" />,
    color: "blue",
  },
  {
    name: "代码生成",
    model: "CodeGeeX4-ALL-9B",
    description: "多语言支持、智能补全、代码解释",
    icon: <Code className="w-5 h-5 text-green-400" />,
    color: "green",
  },
  {
    name: "视频生成",
    model: "CogVideoX-5B",
    description: "文本转视频、视频编辑、场景生成",
    icon: <Play className="w-5 h-5 text-purple-400" />,
    color: "purple",
  },
  {
    name: "图像生成",
    model: "CogView-3-Flash",
    description: "文本转图像、风格迁移、图像编辑",
    icon: <ImageIcon className="w-5 h-5 text-pink-400" />,
    color: "pink",
  },
]

// 波纹效果组件
const RippleEffect = ({ position, color = "blue" }) => {
  const colorMap = {
    blue: "rgba(59, 130, 246, 0.3)",
    green: "rgba(16, 185, 129, 0.3)",
    purple: "rgba(139, 92, 246, 0.3)",
    orange: "rgba(249, 115, 22, 0.3)",
  }

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 1 }}
      animate={{ scale: 4, opacity: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        position: "absolute",
        top: position.y - 15,
        left: position.x - 15,
        width: 30,
        height: 30,
        borderRadius: "50%",
        backgroundColor: colorMap[color] || colorMap.blue,
        zIndex: 10,
        pointerEvents: "none",
      }}
    />
  )
}

export default function EnginePage() {
  return (
    <PageLayout title="智能引擎" description="YYC³驱动的万象云枢智能API调用中心">
      <EngineClientPage />
    </PageLayout>
  )
}
