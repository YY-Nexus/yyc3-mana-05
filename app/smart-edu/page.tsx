"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Brain, Target, Clock, Award, Construction, TrendingUp, Users } from "lucide-react"
import { PageLayout } from "@/components/page-layout"

export default function SmartEduPage() {
  const [subject, setSubject] = useState("math")
  const [level, setLevel] = useState("middle")

  const courses = [
    {
      id: "math-basic",
      name: "数学基础",
      subject: "数学",
      level: "初级",
      progress: 0,
      lessons: 0,
      duration: "-- 小时",
      status: "未开始",
    },
    {
      id: "physics-intro",
      name: "物理入门",
      subject: "物理",
      level: "初级",
      progress: 0,
      lessons: 0,
      duration: "-- 小时",
      status: "未开始",
    },
    {
      id: "english-grammar",
      name: "英语语法",
      subject: "英语",
      level: "中级",
      progress: 0,
      lessons: 0,
      duration: "-- 小时",
      status: "未开始",
    },
  ]

  const achievements = [
    { name: "学习新手", description: "完成第一个课程", earned: false },
    { name: "坚持不懈", description: "连续学习7天", earned: false },
    { name: "知识探索者", description: "完成10个课程", earned: false },
    { name: "学霸", description: "获得90%以上成绩", earned: false },
  ]

  const studyStats = [
    { label: "学习天数", value: "--", unit: "天" },
    { label: "完成课程", value: "--", unit: "门" },
    { label: "学习时长", value: "--", unit: "小时" },
    { label: "平均成绩", value: "--%", unit: "" },
  ]

  return (
    <PageLayout title="🎓 启智教育" description="智能化教育辅助与个性化学习平台">
      {/* 开发中提示 */}
      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Construction className="w-8 h-8 text-yellow-400" />
          <div>
            <h3 className="text-yellow-400 font-semibold text-lg">模块正在开发中</h3>
            <p className="text-white/80">启智教育学习平台正在紧张开发中，敬请期待！</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
          <div>
            <strong className="text-yellow-400">智能学习：</strong>
            <ul className="mt-2 space-y-1">
              <li>• AI个性化学习路径</li>
              <li>• 智能题库与练习</li>
              <li>• 学习进度智能分析</li>
              <li>• 知识点掌握评估</li>
            </ul>
          </div>
          <div>
            <strong className="text-yellow-400">教学辅助：</strong>
            <ul className="mt-2 space-y-1">
              <li>• 在线一对一辅导</li>
              <li>• 学习计划制定</li>
              <li>• 错题本智能整理</li>
              <li>• 学习报告生成</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 学习中心和课程 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 课程选择 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                个性化学习
              </CardTitle>
              <CardDescription className="text-white/80">选择学科和难度，开始智能化学习</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">学科选择</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20 text-white">
                      <SelectItem value="math">数学</SelectItem>
                      <SelectItem value="physics">物理</SelectItem>
                      <SelectItem value="chemistry">化学</SelectItem>
                      <SelectItem value="english">英语</SelectItem>
                      <SelectItem value="chinese">语文</SelectItem>
                      <SelectItem value="history">历史</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">难度等级</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20 text-white">
                      <SelectItem value="elementary">小学</SelectItem>
                      <SelectItem value="middle">初中</SelectItem>
                      <SelectItem value="high">高中</SelectItem>
                      <SelectItem value="college">大学</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600" disabled>
                  <Brain className="w-4 h-4 mr-2" />
                  开始学习
                </Button>
                <Button variant="outline" className="border-white/20 text-white bg-transparent" disabled>
                  <Target className="w-4 h-4 mr-2" />
                  智能题库
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 课程列表 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">我的课程</CardTitle>
              <CardDescription className="text-white/80">查看学习进度和课程安排</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white font-medium">{course.name}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="border-white/20 text-white text-xs">
                            {course.subject}
                          </Badge>
                          <Badge variant="outline" className="border-white/20 text-white text-xs">
                            {course.level}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-yellow-400/30 text-yellow-400 text-xs">
                        {course.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-white/70">
                        <span>进度: {course.progress}%</span>
                        <span>
                          课时: {course.lessons} | 时长: {course.duration}
                        </span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white bg-transparent"
                        disabled
                      >
                        继续学习
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white bg-transparent"
                        disabled
                      >
                        查看详情
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 学习分析 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                学习分析
              </CardTitle>
              <CardDescription className="text-white/80">AI分析学习情况，提供个性化建议</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">知识掌握度</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">基础概念</span>
                      <span className="text-white">--%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">应用能力</span>
                      <span className="text-white">--%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">综合分析</span>
                      <span className="text-white">--%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">学习建议</h4>
                  <div className="text-sm text-white/70 space-y-1">
                    <p>• 建议加强基础概念练习</p>
                    <p>• 增加应用题训练</p>
                    <p>• 定期复习已学内容</p>
                    <p>• 保持学习节奏稳定</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 学习统计和成就 */}
        <div className="space-y-6">
          {/* 学习统计 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                学习统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studyStats.map((stat) => (
                  <div key={stat.label} className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-white mb-1">
                      {stat.value} <span className="text-sm text-white/60">{stat.unit}</span>
                    </div>
                    <div className="text-white/60 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 成就系统 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Award className="w-5 h-5 mr-2" />
                学习成就
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.name}
                  className={`p-3 rounded-lg border ${
                    achievement.earned ? "bg-yellow-500/20 border-yellow-500/30" : "bg-white/5 border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Award className={`w-4 h-4 ${achievement.earned ? "text-yellow-400" : "text-white/40"}`} />
                    <span className={`font-medium ${achievement.earned ? "text-yellow-400" : "text-white/60"}`}>
                      {achievement.name}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm">{achievement.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 在线辅导 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                在线辅导
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <Users className="w-12 h-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/60">在线辅导功能开发中</p>
                <p className="text-white/40 text-sm mt-2">即将支持一对一辅导</p>
              </div>
              <Button className="w-full" disabled>
                预约辅导
              </Button>
            </CardContent>
          </Card>

          {/* 快捷操作 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">快捷操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full border-white/20 text-white bg-transparent" disabled>
                <BookOpen className="w-4 h-4 mr-2" />
                错题本
              </Button>
              <Button variant="outline" className="w-full border-white/20 text-white bg-transparent" disabled>
                <Target className="w-4 h-4 mr-2" />
                学习计划
              </Button>
              <Button variant="outline" className="w-full border-white/20 text-white bg-transparent" disabled>
                生成学习报告
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
