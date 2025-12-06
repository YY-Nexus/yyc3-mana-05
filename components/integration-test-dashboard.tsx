"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Play,
  Square,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  BarChart3,
  Activity,
  Zap,
  Users,
  TrendingUp,
  Loader2,
} from "lucide-react"
import { integrationTestRunner, type TestSuite } from "@/lib/integration-test"
import { performanceOptimizer } from "@/lib/performance-optimizer"
import { userFeedbackSystem } from "@/lib/user-feedback"

export function IntegrationTestDashboard() {
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestSuite[]>([])
  const [currentTest, setCurrentTest] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null)
  const [userAnalytics, setUserAnalytics] = useState<any>(null)

  // 运行集成测试
  const runIntegrationTests = async () => {
    setIsRunning(true)
    setProgress(0)
    setCurrentTest("初始化测试环境...")

    try {
      // 模拟测试进度更新
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 10, 95))
      }, 500)

      const results = await integrationTestRunner.runAllTests()

      clearInterval(progressInterval)
      setProgress(100)
      setTestResults(results)
      setCurrentTest("测试完成")

      // 获取性能指标
      const metrics = performanceOptimizer.getPerformanceMetrics()
      setPerformanceMetrics(metrics)

      // 获取用户分析数据
      const analytics = await userFeedbackSystem.getUserBehaviorAnalytics()
      setUserAnalytics(analytics)
    } catch (error) {
      console.error("集成测试失败:", error)
    } finally {
      setIsRunning(false)
    }
  }

  // 停止测试
  const stopTests = () => {
    setIsRunning(false)
    setCurrentTest("测试已停止")
  }

  // 下载测试报告
  const downloadReport = () => {
    const report = integrationTestRunner.getTestReport()
    const blob = new Blob([report], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `YYC3-集成测试报告-${new Date().toISOString().split("T")[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 计算总体统计
  const getTotalStats = () => {
    let totalTests = 0
    let totalPassed = 0
    let totalFailed = 0
    let totalSkipped = 0
    let totalDuration = 0

    testResults.forEach((suite) => {
      totalTests += suite.tests.length
      totalPassed += suite.passedCount
      totalFailed += suite.failedCount
      totalSkipped += suite.skippedCount
      totalDuration += suite.totalDuration
    })

    return {
      totalTests,
      totalPassed,
      totalFailed,
      totalSkipped,
      totalDuration,
      successRate: totalTests > 0 ? (totalPassed / totalTests) * 100 : 0,
    }
  }

  const stats = getTotalStats()

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            YYC³ 平台集成测试控制台
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={runIntegrationTests}
              disabled={isRunning}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  运行中...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  开始测试
                </>
              )}
            </Button>

            {isRunning && (
              <Button onClick={stopTests} variant="destructive">
                <Square className="w-4 h-4 mr-2" />
                停止测试
              </Button>
            )}

            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-white/20 text-white bg-transparent hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重置
            </Button>

            {testResults.length > 0 && (
              <Button
                onClick={downloadReport}
                variant="outline"
                className="border-white/20 text-white bg-transparent hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                下载报告
              </Button>
            )}
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-white/80">
                <span>{currentTest}</span>
                <span>{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 测试结果概览 */}
      {testResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">总测试数</p>
                  <p className="text-white text-2xl font-bold">{stats.totalTests}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">成功率</p>
                  <p className="text-white text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">失败数</p>
                  <p className="text-white text-2xl font-bold">{stats.totalFailed}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">总耗时</p>
                  <p className="text-white text-2xl font-bold">{(stats.totalDuration / 1000).toFixed(1)}s</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 详细测试结果 */}
      {testResults.length > 0 && (
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-md">
            <TabsTrigger value="results" className="text-white data-[state=active]:bg-white/20">
              测试结果
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-white data-[state=active]:bg-white/20">
              性能指标
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white/20">
              用户分析
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="text-white data-[state=active]:bg-white/20">
              优化建议
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            {testResults.map((suite, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      {suite.failedCount === 0 ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      {suite.suiteName}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-green-500/30 text-green-400">
                        {suite.passedCount} 通过
                      </Badge>
                      {suite.failedCount > 0 && (
                        <Badge variant="outline" className="border-red-500/30 text-red-400">
                          {suite.failedCount} 失败
                        </Badge>
                      )}
                      {suite.skippedCount > 0 && (
                        <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                          {suite.skippedCount} 跳过
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {suite.tests.map((test, testIndex) => (
                        <div key={testIndex} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            {test.status === "passed" ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : test.status === "failed" ? (
                              <XCircle className="w-4 h-4 text-red-400" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            )}
                            <div>
                              <div className="text-white font-medium text-sm">{test.testName}</div>
                              {test.error && <div className="text-red-400 text-xs mt-1">{test.error}</div>}
                            </div>
                          </div>
                          <div className="text-white/60 text-xs">{test.duration}ms</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {performanceMetrics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      核心Web指标
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {performanceMetrics.core && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">首次内容绘制 (FCP)</span>
                          <span className="text-white font-mono">{performanceMetrics.core.firstContentfulPaint}ms</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">最大内容绘制 (LCP)</span>
                          <span className="text-white font-mono">
                            {performanceMetrics.core.largestContentfulPaint}ms
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">首次输入延迟 (FID)</span>
                          <span className="text-white font-mono">{performanceMetrics.core.firstInputDelay}ms</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">累积布局偏移 (CLS)</span>
                          <span className="text-white font-mono">{performanceMetrics.core.cumulativeLayoutShift}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      资源加载指标
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {performanceMetrics.resources && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">总资源数</span>
                          <span className="text-white font-mono">{performanceMetrics.resources.totalResources}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">总大小</span>
                          <span className="text-white font-mono">
                            {(performanceMetrics.resources.totalSize / 1024 / 1024).toFixed(2)}MB
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">缓存命中率</span>
                          <span className="text-white font-mono">
                            {performanceMetrics.resources.cacheHitRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">慢资源数</span>
                          <span className="text-white font-mono">
                            {performanceMetrics.resources.slowResources.length}
                          </span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {userAnalytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      用户行为指标
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">页面浏览量</span>
                      <span className="text-white font-mono">{userAnalytics.pageViews}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">独立访客</span>
                      <span className="text-white font-mono">{userAnalytics.uniqueVisitors}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">平均会话时长</span>
                      <span className="text-white font-mono">{userAnalytics.averageSessionDuration}s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">跳出率</span>
                      <span className="text-white font-mono">{userAnalytics.bounceRate}%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      热门页面
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {userAnalytics.topPages?.map((page: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded">
                            <span className="text-white/80 text-sm">{page.page}</span>
                            <span className="text-white font-mono text-sm">{page.views}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  优化建议
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceOptimizer.getOptimizationSuggestions().map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div className="text-white/80 text-sm leading-relaxed">{suggestion}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
