"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Award, Shield, QrCode, Download, Upload, Search, Construction, CheckCircle } from "lucide-react"
import { PageLayout } from "@/components/page-layout"

export default function SmartCertPage() {
  const [certName, setCertName] = useState("")
  const [recipient, setRecipient] = useState("")
  const [description, setDescription] = useState("")

  const certificates = [
    {
      id: "cert-001",
      name: "AI工程师认证",
      recipient: "张三",
      issuer: "YYC³ 教育",
      date: "2024-01-15",
      status: "已验证",
      hash: "0x1a2b3c4d...",
    },
    {
      id: "cert-002",
      name: "区块链开发证书",
      recipient: "李四",
      issuer: "技术学院",
      date: "2024-01-10",
      status: "已验证",
      hash: "0x5e6f7g8h...",
    },
    {
      id: "cert-003",
      name: "项目管理认证",
      recipient: "王五",
      issuer: "管理协会",
      date: "2024-01-08",
      status: "待验证",
      hash: "0x9i0j1k2l...",
    },
  ]

  return (
    <PageLayout title="🏆 智慧证书" description="区块链技术的数字证书管理平台">
      {/* 开发中提示 */}
      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Construction className="w-8 h-8 text-yellow-400" />
          <div>
            <h3 className="text-yellow-400 font-semibold text-lg">模块正在开发中</h3>
            <p className="text-white/80">智慧证书管理系统正在紧张开发中，敬请期待！</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
          <div>
            <strong className="text-yellow-400">核心技术：</strong>
            <ul className="mt-2 space-y-1">
              <li>• 区块链防伪技术</li>
              <li>• 数字签名验证</li>
              <li>• 分布式存储</li>
              <li>• 智能合约管理</li>
            </ul>
          </div>
          <div>
            <strong className="text-yellow-400">应用场景：</strong>
            <ul className="mt-2 space-y-1">
              <li>• 学历学位证书</li>
              <li>• 职业技能认证</li>
              <li>• 培训结业证书</li>
              <li>• 荣誉奖项证明</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 证书生成和管理 */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Award className="w-5 h-5 mr-2" />
                证书生成器
              </CardTitle>
              <CardDescription className="text-white/80">创建新的数字证书并上链存储</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">证书名称</Label>
                  <Input
                    placeholder="输入证书名称..."
                    value={certName}
                    onChange={(e) => setCertName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    disabled
                  />
                </div>
                <div>
                  <Label className="text-white">获得者</Label>
                  <Input
                    placeholder="输入获得者姓名..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    disabled
                  />
                </div>
              </div>
              <div>
                <Label className="text-white">证书描述</Label>
                <Textarea
                  placeholder="输入证书详细描述..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  rows={3}
                  disabled
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-600" disabled>
                  <Award className="w-4 h-4 mr-2" />
                  生成证书
                </Button>
                <Button variant="outline" className="border-white/20 text-white bg-transparent" disabled>
                  <Upload className="w-4 h-4 mr-2" />
                  批量导入
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 证书列表 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">证书管理</CardTitle>
              <CardDescription className="text-white/80">查看和管理所有数字证书</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white font-medium">{cert.name}</h4>
                        <p className="text-white/60 text-sm">获得者: {cert.recipient}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          cert.status === "已验证"
                            ? "border-green-400/30 text-green-400"
                            : "border-yellow-400/30 text-yellow-400"
                        }`}
                      >
                        {cert.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white/70 mb-3">
                      <div>颁发机构: {cert.issuer}</div>
                      <div>颁发日期: {cert.date}</div>
                      <div className="md:col-span-2">区块链哈希: {cert.hash}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white bg-transparent"
                        disabled
                      >
                        <QrCode className="w-3 h-3 mr-1" />
                        二维码
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white bg-transparent"
                        disabled
                      >
                        <Download className="w-3 h-3 mr-1" />
                        下载
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white bg-transparent"
                        disabled
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        验证
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 验证和统计 */}
        <div className="space-y-6">
          {/* 证书验证 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                证书验证
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">证书ID或哈希</Label>
                <Input
                  placeholder="输入证书ID或区块链哈希..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  disabled
                />
              </div>
              <Button className="w-full" disabled>
                <Search className="w-4 h-4 mr-2" />
                验证证书
              </Button>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <CheckCircle className="w-12 h-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/60">验证功能开发中</p>
                <p className="text-white/40 text-sm mt-2">即将支持实时验证</p>
              </div>
            </CardContent>
          </Card>

          {/* 统计信息 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">统计信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400 mb-1">--</div>
                  <div className="text-white/60 text-sm">总证书数量</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">--</div>
                  <div className="text-white/60 text-sm">已验证证书</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">--</div>
                  <div className="text-white/60 text-sm">本月新增</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 区块链状态 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">区块链状态</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/80">网络状态</span>
                <Badge className="bg-green-500 text-white text-xs">正常</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">当前区块</span>
                <span className="text-white">--</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Gas费用</span>
                <span className="text-white">-- Gwei</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
