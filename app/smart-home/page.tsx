"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Home, Lightbulb, Thermometer, Shield, Wifi, Settings, Smartphone, Mic, Construction } from "lucide-react"
import { PageLayout } from "@/components/page-layout"

export default function SmartHomePage() {
  const [temperature, setTemperature] = useState([22])
  const [brightness, setBrightness] = useState([75])

  const devices = [
    { id: "living-light", name: "客厅灯光", type: "照明", status: "在线", enabled: true, icon: Lightbulb },
    { id: "bedroom-ac", name: "卧室空调", type: "温控", status: "在线", enabled: false, icon: Thermometer },
    { id: "door-lock", name: "智能门锁", type: "安防", status: "在线", enabled: true, icon: Shield },
    { id: "kitchen-cam", name: "厨房摄像头", type: "监控", status: "离线", enabled: false, icon: Shield },
    { id: "router", name: "智能路由器", type: "网络", status: "在线", enabled: true, icon: Wifi },
    { id: "speaker", name: "智能音箱", type: "娱乐", status: "在线", enabled: true, icon: Smartphone },
  ]

  const scenes = [
    { id: "morning", name: "晨起模式", description: "自动开启窗帘、播放音乐、调节温度", active: false },
    { id: "work", name: "工作模式", description: "调节灯光亮度、降低音量、专注环境", active: true },
    { id: "relax", name: "休闲模式", description: "柔和灯光、舒适温度、轻音乐", active: false },
    { id: "sleep", name: "睡眠模式", description: "关闭所有灯光、调低温度、静音模式", active: false },
    { id: "away", name: "离家模式", description: "开启安防、关闭电器、节能模式", active: false },
  ]

  return (
    <PageLayout title="🏠 智能家居" description="AI驱动的智能家居控制与管理系统">
      {/* 开发中提示 */}
      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Construction className="w-8 h-8 text-yellow-400" />
          <div>
            <h3 className="text-yellow-400 font-semibold text-lg">模块正在开发中</h3>
            <p className="text-white/80">智能家居控制系统正在紧张开发中，敬请期待！</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
          <div>
            <strong className="text-yellow-400">计划功能：</strong>
            <ul className="mt-2 space-y-1">
              <li>• 智能设备统一控制</li>
              <li>• 场景模式自动化</li>
              <li>• 语音控制集成</li>
              <li>• 能耗监测分析</li>
            </ul>
          </div>
          <div>
            <strong className="text-yellow-400">预计完成：</strong>
            <ul className="mt-2 space-y-1">
              <li>• 设备管理：2024年Q2</li>
              <li>• 场景联动：2024年Q3</li>
              <li>• AI优化：2024年Q4</li>
              <li>• 语音助手：2025年Q1</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 设备控制面板 */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Home className="w-5 h-5 mr-2" />
                设备控制中心
              </CardTitle>
              <CardDescription className="text-white/80">管理和控制所有智能家居设备</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {devices.map((device) => {
                  const IconComponent = device.icon
                  return (
                    <div
                      key={device.id}
                      className="bg-white/5 border border-white/20 rounded-lg p-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{device.name}</h4>
                            <p className="text-white/60 text-sm">{device.type}</p>
                          </div>
                        </div>
                        <Switch checked={device.enabled} disabled />
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            device.status === "在线"
                              ? "border-green-400/30 text-green-400"
                              : "border-red-400/30 text-red-400"
                          }`}
                        >
                          {device.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/20 text-white bg-transparent"
                          disabled
                        >
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* 环境控制 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Thermometer className="w-5 h-5 mr-2" />
                环境控制
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-white">温度控制: {temperature[0]}°C</Label>
                  <Slider
                    value={temperature}
                    onValueChange={setTemperature}
                    max={30}
                    min={16}
                    step={1}
                    className="mt-2"
                    disabled
                  />
                </div>
                <div>
                  <Label className="text-white">亮度控制: {brightness[0]}%</Label>
                  <Slider
                    value={brightness}
                    onValueChange={setBrightness}
                    max={100}
                    min={0}
                    step={5}
                    className="mt-2"
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 场景模式和语音控制 */}
        <div className="space-y-6">
          {/* 场景模式 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">场景模式</CardTitle>
              <CardDescription className="text-white/80">一键切换生活场景</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {scenes.map((scene) => (
                <div
                  key={scene.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    scene.active ? "bg-blue-500/20 border-blue-500/30" : "bg-white/5 border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{scene.name}</h4>
                    {scene.active && <Badge className="bg-blue-500 text-white text-xs">激活</Badge>}
                  </div>
                  <p className="text-white/60 text-sm">{scene.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 语音控制 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Mic className="w-5 h-5 mr-2" />
                语音助手
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <Mic className="w-12 h-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/60">语音控制功能开发中</p>
                <p className="text-white/40 text-sm mt-2">即将支持自然语言控制</p>
              </div>
              <Button className="w-full" disabled>
                开始语音控制
              </Button>
            </CardContent>
          </Card>

          {/* 能耗统计 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">能耗统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/80">今日用电</span>
                  <span className="text-white">-- kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">本月用电</span>
                  <span className="text-white">-- kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">预计费用</span>
                  <span className="text-white">¥ --</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
