"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload } from "lucide-react"
import { useCompletion } from "ai/react"

const CodexClientPage = () => {
  const [file, setFile] = useState<File | null>(null)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Hi! How can I help you today?" },
  ])
  const { complete, completion, stop, isLoading } = useCompletion({
    api: "/api/codex",
    initialInput: messages[messages.length - 1]?.content || "",
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setFile(e.target.files[0])
  }

  const handleSendMessage = async (message: string) => {
    if (!message) return

    setMessages((prev) => [...prev, { role: "user", content: message }])

    const response = await complete(message)

    setMessages((prev) => [...prev, { role: "assistant", content: response }])
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center">
          <CardTitle className="text-2xl font-bold">文档上传</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Input type="file" id="upload" className="hidden" onChange={handleFileUpload} />
            <Button asChild>
              <label htmlFor="upload" className="flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                {file ? file.name : "上传文档"}
              </label>
            </Button>
            {file && <span className="text-gray-500">已选择: {file.name}</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center">
          <CardTitle className="text-2xl font-bold">AI 对话</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-md ${
                  message.role === "user" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {message.content}
              </div>
            ))}
            <div className="flex space-x-2">
              <Input
                placeholder="输入你的问题..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage(e.currentTarget.value)
                    e.currentTarget.value = ""
                  }
                }}
              />
              <Button
                onClick={() => {
                  const inputElement = document.querySelector("input") as HTMLInputElement
                  if (inputElement) {
                    handleSendMessage(inputElement.value)
                    inputElement.value = ""
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? "思考中..." : "发送"}
              </Button>
              {isLoading && (
                <Button variant="destructive" onClick={stop}>
                  停止
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CodexClientPage
