"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Heart, Activity, Apple, Dumbbell, Moon, Stethoscope, Construction, TrendingUp } from "lucide-react"
import { PageLayout } from "@/components/page-layout"

export default function SmartHealthPage() {
  const [weight, setWeight] = useState([70])
  const [height, setHeight] = useState([170])
  const [age, setAge] = useState([25])

  const healthData = [
    { label: "心率", value: "--", unit: "bpm", status: "正常", icon: Heart, color: "text-red-400" },
    { label: "血压", value: "--/--", unit: "mmHg", status: "正常", icon: Activity, color: "text-blue-400" },
    { label: "血氧", value: "--%", unit: "", status: "正常", icon: Activity, color: "text-green-400" },
    { label: "体温", value: "--", unit: "°C", status: "正常", icon: Stethoscope, color: "text-orange-400" },
  ]

  const activities = [
    { name: "步数", value: "--", target: "10000", unit: "步", progress: 0 },
    { name: "卡路里", value: "--", target: "2000", unit: "kcal", progress: 0 },
    { name: "运动时长", value: "--", target: "60", unit: "分钟", progress: 0 },
    { name: "睡眠时长", value: "--", target: "8", unit: "小时", progress: 0 },
  ]

  return (
    <PageLayout title="❤️ 智享健康" description="AI健康监测与个性化健康管理">
      {/* 开发中提示 */}
      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Construction className="w-8 h-8 text-yellow-400" />
          <div>
            <h3 className="text-yellow-400 font-semibold text-lg">模块正在开发中</h3>
            <p className="text-white/80">智享健康管理系统正在紧张开发中，敬请期待！</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
          <div>
            <strong className="text-yellow-400">健康监测：</strong>
            <ul className="mt-2 space-y-1">
              <li>• 实时生理指标监测</li>
              <li>• AI健康风险评估</li>
              <li>• 个性化健康建议</li>
              <li>• 智能设备数据同步</li>
            </ul>
          </div>
          <div>
            <strong className="text-yellow-400">健康管理：</strong>
            <ul className="mt-2 space-y-1">
              <li>• 运动计划制定</li>
              <li>• 营养膳食建议</li>
              <li>• 睡眠质量分析</li>
              <li>• 健康报告生成</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 健康监测和数据 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 生理指标 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                生理指标监测
              </CardTitle>
              <CardDescription className="text-white/80">实时监测关键健康指标</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthData.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <div key={item.label} className="bg-white/5 border border-white/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <IconComponent className={`w-5 h-5 ${item.color}`} />
                          <span className="text-white font-medium">{item.label}</span>
                        </div>
                        <Badge variant="outline" className="border-green-400/30 text-green-400 text-xs">
                          {item.status}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {item.value} <span className="text-sm text-white/60">{item.unit}</span>
                        </div>
                        <div className="text-white/40 text-sm">数据获取中...</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* 运动数据 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Dumbbell className="w-5 h-5 mr-2" />
                运动与活动
              </CardTitle>
              <CardDescription className="text-white/80">今日运动数据统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activities.map((activity) => (
                  <div key={activity.name} className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">{activity.name}</span>
                      <span className="text-white/60 text-sm">
                        目标: {activity.target}
                        {activity.unit}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">
                      {activity.value} <span className="text-sm text-white/60">{activity.unit}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${activity.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 基础信息设置 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">个人信息设置</CardTitle>
              <CardDescription className="text-white/80">设置基础信息以获得个性化建议</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">体重: {weight[0]} kg</Label>
                  <Slider
                    value={weight}
                    onValueChange={setWeight}
                    max={150}
                    min={30}
                    step={1}
                    className="mt-2"
                    disabled
                  />
                </div>
                <div>
                  <Label className="text-white">身高: {height[0]} cm</Label>
                  <Slider
                    value={height}
                    onValueChange={setHeight}
                    max={220}
                    min={120}
                    step={1}
                    className="mt-2"
                    disabled
                  />
                </div>
                <div>
                  <Label className="text-white">年龄: {age[0]} 岁</Label>
                  <Slider value={age} onValueChange={setAge} max={100} min={10} step={1} className="mt-2" disabled />
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-white font-medium mb-2">BMI指数</div>
                <div className="text-2xl font-bold text-white">{((weight[0] / (height[0] / 100)) ** 2).toFixed(1)}</div>
                <div className="text-white/60 text-sm">正常范围</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 健康建议和计划 */}
        <div className="space-y-6">
          {/* AI健康建议 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Stethoscope className="w-5 h-5 mr-2" />
                AI健康建议
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-white font-medium">心血管健康</span>
                </div>
                <p className="text-white/70 text-sm">建议每周进行3-4次有氧运动，每次30分钟以上。</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Apple className="w-4 h-4 text-green-400" />
                  <span className="text-white font-medium">营养建议</span>
                </div>
                <p className="text-white/70 text-sm">增加蔬菜和水果摄入，减少高糖高脂食物。</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-medium">睡眠质量</span>
                </div>
                <p className="text-white/70 text-sm">保持规律作息，建议每晚7-8小时优质睡眠。</p>
              </div>
            </CardContent>
          </Card>

          {/* 健康趋势 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                健康趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-lg font-bold text-green-400 mb-1">健康评分</div>
                  <div className="text-3xl font-bold text-white">--</div>
                  <div className="text-white/60 text-sm">满分100分</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">本周改善</span>
                    <span className="text-green-400">+-- 分</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">本月改善</span>
                    <span className="text-green-400">+-- 分</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 快捷操作 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">快捷操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" disabled>
                <Heart className="w-4 h-4 mr-2" />
                开始健康检测
              </Button>
              <Button variant="outline" className="w-full border-white/20 text-white bg-transparent" disabled>
                <Dumbbell className="w-4 h-4 mr-2" />
                制定运动计划
              </Button>
              <Button variant="outline" className="w-full border-white/20 text-white bg-transparent" disabled>
                <Apple className="w-4 h-4 mr-2" />
                营养分析
              </Button>
              <Button variant="outline" className="w-full border-white/20 text-white bg-transparent" disabled>
                生成健康报告
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
