"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Play,
  Save,
  FolderOpen,
  FileText,
  Settings,
  Terminal,
  GitBranch,
  Users,
  Code,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  Search,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  MessageSquare,
  Share2,
  Eye,
} from "lucide-react"
import { useAppStore } from "@/lib/store"

interface FileNode {
  name: string
  type: "file" | "folder"
  path: string
  children?: FileNode[]
  size?: number
  modified?: Date
  content?: string
}

interface GitCommit {
  id: string
  message: string
  author: string
  date: Date
  branch: string
}

interface TeamMember {
  id: string
  name: string
  avatar: string
  role: string
  status: "online" | "offline" | "away"
  lastSeen?: Date
}

interface ExecutionResult {
  id: string
  timestamp: Date
  command: string
  output: string
  status: "success" | "error" | "running"
  duration?: number
}

export function DeepStackClientPage() {
  const { addNotification } = useAppStore()

  // 文件系统状态
  const [fileTree, setFileTree] = useState<FileNode[]>([
    {
      name: "src",
      type: "folder",
      path: "/src",
      children: [
        { name: "components", type: "folder", path: "/src/components", children: [] },
        { name: "pages", type: "folder", path: "/src/pages", children: [] },
        { name: "utils", type: "folder", path: "/src/utils", children: [] },
        { name: "app.tsx", type: "file", path: "/src/app.tsx", size: 2048, modified: new Date() },
        { name: "index.ts", type: "file", path: "/src/index.ts", size: 512, modified: new Date() },
      ],
    },
    {
      name: "public",
      type: "folder",
      path: "/public",
      children: [
        { name: "assets", type: "folder", path: "/public/assets", children: [] },
        { name: "index.html", type: "file", path: "/public/index.html", size: 1024, modified: new Date() },
      ],
    },
    { name: "package.json", type: "file", path: "/package.json", size: 1536, modified: new Date() },
    { name: "README.md", type: "file", path: "/README.md", size: 2048, modified: new Date() },
  ])

  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/src", "/public"]))
  const [fileContent, setFileContent] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Git状态
  const [gitCommits, setGitCommits] = useState<GitCommit[]>([
    {
      id: "abc123",
      message: "初始化项目结构",
      author: "开发者",
      date: new Date(Date.now() - 86400000),
      branch: "main",
    },
    {
      id: "def456",
      message: "添加组件库",
      author: "开发者",
      date: new Date(Date.now() - 43200000),
      branch: "main",
    },
    {
      id: "ghi789",
      message: "修复样式问题",
      author: "开发者",
      date: new Date(Date.now() - 3600000),
      branch: "feature/ui-fixes",
    },
  ])

  const [currentBranch, setCurrentBranch] = useState("main")
  const [gitStatus, setGitStatus] = useState({
    modified: 3,
    staged: 1,
    untracked: 2,
  })

  // 团队协作状态
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "张三",
      avatar: "/placeholder.svg?height=32&width=32",
      role: "前端开发",
      status: "online",
    },
    {
      id: "2",
      name: "李四",
      avatar: "/placeholder.svg?height=32&width=32",
      role: "后端开发",
      status: "away",
      lastSeen: new Date(Date.now() - 1800000),
    },
    {
      id: "3",
      name: "王五",
      avatar: "/placeholder.svg?height=32&width=32",
      role: "UI设计师",
      status: "offline",
      lastSeen: new Date(Date.now() - 7200000),
    },
  ])

  // 代码执行状态
  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([
    {
      id: "1",
      timestamp: new Date(Date.now() - 300000),
      command: "npm run build",
      output: "✓ 构建成功\n生成文件: dist/\n大小: 2.3MB",
      status: "success",
      duration: 15000,
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 600000),
      command: "npm test",
      output: "✓ 所有测试通过\n测试用例: 24个\n覆盖率: 85%",
      status: "success",
      duration: 8000,
    },
  ])

  const [isExecuting, setIsExecuting] = useState(false)
  const [currentCommand, setCurrentCommand] = useState("")

  // 切换文件夹展开状态
  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFolders(newExpanded)
  }

  // 选择文件
  const selectFile = (file: FileNode) => {
    if (file.type === "file") {
      setSelectedFile(file)
      // 模拟加载文件内容
      setFileContent(`// ${file.name}\n// 文件路径: ${file.path}\n\n// 这里是文件内容...`)
    }
  }

  // 保存文件
  const saveFile = () => {
    if (selectedFile) {
      addNotification({
        type: "success",
        title: "文件已保存",
        message: `${selectedFile.name} 保存成功`,
      })
    }
  }

  // 执行代码
  const executeCommand = async (command: string) => {
    if (!command.trim()) return

    setIsExecuting(true)
    const newResult: ExecutionResult = {
      id: Date.now().toString(),
      timestamp: new Date(),
      command,
      output: "",
      status: "running",
    }

    setExecutionResults((prev) => [newResult, ...prev])

    // 模拟执行过程
    setTimeout(() => {
      const updatedResult: ExecutionResult = {
        ...newResult,
        output: `执行命令: ${command}\n✓ 执行完成\n输出结果...`,
        status: Math.random() > 0.2 ? "success" : "error",
        duration: Math.floor(Math.random() * 10000) + 1000,
      }

      setExecutionResults((prev) => prev.map((r) => (r.id === newResult.id ? updatedResult : r)))
      setIsExecuting(false)
      setCurrentCommand("")

      addNotification({
        type: updatedResult.status === "success" ? "success" : "error",
        title: "命令执行完成",
        message: `${command} ${updatedResult.status === "success" ? "执行成功" : "执行失败"}`,
      })
    }, 2000)
  }

  // 渲染文件树
  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.path} className="select-none">
        <div
          className={`flex items-center gap-2 px-2 py-1 hover:bg-white/5 cursor-pointer rounded ${
            selectedFile?.path === node.path ? "bg-blue-500/20" : ""
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (node.type === "folder") {
              toggleFolder(node.path)
            } else {
              selectFile(node)
            }
          }}
        >
          {node.type === "folder" ? (
            expandedFolders.has(node.path) ? (
              <ChevronDown className="w-4 h-4 text-white/60" />
            ) : (
              <ChevronRight className="w-4 h-4 text-white/60" />
            )
          ) : (
            <FileText className="w-4 h-4 text-white/60" />
          )}
          <span className="text-white text-sm">{node.name}</span>
          {node.type === "file" && node.size && (
            <span className="text-white/40 text-xs ml-auto">{(node.size / 1024).toFixed(1)}KB</span>
          )}
        </div>
        {node.type === "folder" && expandedFolders.has(node.path) && node.children && (
          <div>{renderFileTree(node.children, level + 1)}</div>
        )}
      </div>
    ))
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* 左侧面板 - 文件系统 */}
      <div className="w-80 bg-black/20 backdrop-blur-md border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              项目文件
            </h2>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="text-white/60 hover:text-white p-1">
                <Plus className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-white/60 hover:text-white p-1">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="搜索文件..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
        </div>
        <ScrollArea className="flex-1 p-2">{renderFileTree(fileTree)}</ScrollArea>
      </div>

      {/* 中央面板 - 代码编辑器 */}
      <div className="flex-1 flex flex-col">
        {/* 编辑器标签栏 */}
        <div className="bg-black/20 backdrop-blur-md border-b border-white/10 px-4 py-2">
          <div className="flex items-center gap-2">
            {selectedFile ? (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded">
                <FileText className="w-4 h-4 text-white/60" />
                <span className="text-white text-sm">{selectedFile.name}</span>
                <Button size="sm" variant="ghost" className="text-white/60 hover:text-white p-1">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <span className="text-white/60 text-sm">选择一个文件开始编辑</span>
            )}
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="ghost" onClick={saveFile} className="text-white/60 hover:text-white">
                <Save className="w-4 h-4 mr-1" />
                保存
              </Button>
              <Button size="sm" variant="ghost" className="text-white/60 hover:text-white">
                <Play className="w-4 h-4 mr-1" />
                运行
              </Button>
            </div>
          </div>
        </div>

        {/* 代码编辑区域 */}
        <div className="flex-1 p-4">
          {selectedFile ? (
            <Textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              className="w-full h-full bg-black/40 border-white/20 text-white font-mono text-sm resize-none"
              placeholder="开始编写代码..."
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Code className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-lg mb-2">选择文件开始编码</p>
                <p className="text-white/40 text-sm">从左侧文件树中选择一个文件来开始编辑</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 右侧面板 - 多功能标签页 */}
      <div className="w-96 bg-black/20 backdrop-blur-md border-l border-white/10">
        <Tabs defaultValue="git" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 m-2">
            <TabsTrigger value="git" className="text-white data-[state=active]:bg-white/20">
              <GitBranch className="w-4 h-4 mr-1" />
              Git
            </TabsTrigger>
            <TabsTrigger value="team" className="text-white data-[state=active]:bg-white/20">
              <Users className="w-4 h-4 mr-1" />
              团队
            </TabsTrigger>
            <TabsTrigger value="terminal" className="text-white data-[state=active]:bg-white/20">
              <Terminal className="w-4 h-4 mr-1" />
              终端
            </TabsTrigger>
          </TabsList>

          {/* Git 标签页 */}
          <TabsContent value="git" className="flex-1 p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">当前分支</h3>
                <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                  {currentBranch}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/10 rounded p-2">
                  <div className="text-orange-400 font-semibold">{gitStatus.modified}</div>
                  <div className="text-white/60 text-xs">已修改</div>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <div className="text-green-400 font-semibold">{gitStatus.staged}</div>
                  <div className="text-white/60 text-xs">已暂存</div>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <div className="text-blue-400 font-semibold">{gitStatus.untracked}</div>
                  <div className="text-white/60 text-xs">未跟踪</div>
                </div>
              </div>
            </div>

            <Separator className="bg-white/20" />

            <div>
              <h3 className="text-white font-medium mb-3">提交历史</h3>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {gitCommits.map((commit) => (
                    <div key={commit.id} className="bg-white/10 rounded p-3">
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-white text-sm font-medium">{commit.message}</span>
                        <Badge variant="outline" className="text-xs">
                          {commit.branch}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-white/60 text-xs">
                        <User className="w-3 h-3" />
                        <span>{commit.author}</span>
                        <Clock className="w-3 h-3 ml-2" />
                        <span>{commit.date.toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                <Upload className="w-4 h-4 mr-1" />
                推送
              </Button>
              <Button size="sm" variant="outline" className="flex-1 border-white/20 text-white bg-transparent">
                <Download className="w-4 h-4 mr-1" />
                拉取
              </Button>
            </div>
          </TabsContent>

          {/* 团队协作标签页 */}
          <TabsContent value="team" className="flex-1 p-4 space-y-4">
            <div>
              <h3 className="text-white font-medium mb-3">团队成员</h3>
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-2 bg-white/10 rounded">
                    <div className="relative">
                      <img
                        src={member.avatar || "/placeholder.svg"}
                        alt={member.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
                          member.status === "online"
                            ? "bg-green-500"
                            : member.status === "away"
                              ? "bg-yellow-500"
                              : "bg-gray-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{member.name}</div>
                      <div className="text-white/60 text-xs">{member.role}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="text-white/60 hover:text-white p-1">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-white/60 hover:text-white p-1">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-white/20" />

            <div>
              <h3 className="text-white font-medium mb-3">实时协作</h3>
              <div className="space-y-2">
                <div className="bg-white/10 rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm">张三正在查看 app.tsx</span>
                  </div>
                  <div className="text-white/60 text-xs">2分钟前</div>
                </div>
                <div className="bg-white/10 rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-4 h-4 text-green-400" />
                    <span className="text-white text-sm">李四修改了 utils/helper.ts</span>
                  </div>
                  <div className="text-white/60 text-xs">5分钟前</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 终端标签页 */}
          <TabsContent value="terminal" className="flex-1 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium">代码执行</h3>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="text-white/60 hover:text-white p-1">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white/60 hover:text-white p-1">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <Input
                placeholder="输入命令..."
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isExecuting) {
                    executeCommand(currentCommand)
                  }
                }}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                disabled={isExecuting}
              />
              <Button
                onClick={() => executeCommand(currentCommand)}
                disabled={isExecuting || !currentCommand.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isExecuting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {executionResults.map((result) => (
                  <div key={result.id} className="bg-black/40 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {result.status === "success" ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : result.status === "error" ? (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        ) : (
                          <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                        )}
                        <span className="text-white text-sm font-mono">{result.command}</span>
                      </div>
                      <span className="text-white/60 text-xs">{result.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <pre className="text-white/80 text-xs font-mono whitespace-pre-wrap">{result.output}</pre>
                    {result.duration && (
                      <div className="text-white/40 text-xs mt-2">执行时间: {(result.duration / 1000).toFixed(2)}s</div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default DeepStackClientPage
