import type { Metadata } from "next"
import CodexClientPage from "./codex-client-page"

export const metadata: Metadata = {
  title: "CodeX 智能代码助理 | YYC³ AI平台",
  description: "基于智谱AI的智能代码生成、分析和问答助手，支持多种编程语言和文档内容抽取",
}

export default function CodexPage() {
  return <CodexClientPage />
}
