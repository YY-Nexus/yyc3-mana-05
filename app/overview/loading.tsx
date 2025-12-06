import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function OverviewLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* 页面标题骨架 */}
        <div className="text-center space-y-4">
          <Skeleton className="h-8 sm:h-12 w-64 sm:w-96 mx-auto bg-white/10" />
          <Skeleton className="h-4 sm:h-6 w-48 sm:w-72 mx-auto bg-white/10" />
        </div>

        {/* 平台概述卡片骨架 */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10" />
                <div className="space-y-2">
                  <Skeleton className="h-6 sm:h-8 w-48 sm:w-64 bg-white/10" />
                  <Skeleton className="h-4 sm:h-6 w-40 sm:w-56 bg-white/10" />
                </div>
              </div>

              {/* 指标网格骨架 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="bg-white/10 border-white/20">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <Skeleton className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-2 bg-white/10" />
                      <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 mx-auto mb-1 bg-white/10" />
                      <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 mx-auto bg-white/10" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 核心功能模块骨架 */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 bg-white/10" />
              <Skeleton className="h-6 sm:h-8 w-32 sm:w-48 bg-white/10" />
              <Skeleton className="h-5 w-24 bg-white/10" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="bg-white/5 border-white/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 sm:h-5 w-20 sm:w-24 bg-white/10" />
                          <Skeleton className="h-3 w-12 sm:w-16 bg-white/10" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="w-8 h-8 bg-white/10" />
                        <Skeleton className="w-8 h-8 bg-white/10" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <Skeleton className="h-4 w-full bg-white/10" />

                    {/* 功能列表骨架 */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16 bg-white/10" />
                      <div className="grid grid-cols-2 gap-1">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <Skeleton key={j} className="h-3 w-full bg-white/10" />
                        ))}
                      </div>
                    </div>

                    {/* 统计骨架 */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-2 text-center">
                          <Skeleton className="h-4 sm:h-5 w-8 mx-auto mb-1 bg-white/10" />
                          <Skeleton className="h-3 w-12 mx-auto bg-white/10" />
                        </CardContent>
                      </Card>
                      <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-2 text-center">
                          <Skeleton className="h-4 sm:h-5 w-8 mx-auto mb-1 bg-white/10" />
                          <Skeleton className="h-3 w-12 mx-auto bg-white/10" />
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 标签页骨架 */}
        <div className="space-y-6">
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-20 sm:w-24 bg-white/10" />
            ))}
          </div>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-white/10" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-5 h-5 bg-white/10" />
                      <Skeleton className="h-4 w-24 bg-white/10" />
                    </div>
                    <Skeleton className="h-4 w-16 bg-white/10" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 快速操作骨架 */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 bg-white/10" />
              <Skeleton className="h-5 w-20 bg-white/10" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-white/5 border-white/20">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <Skeleton className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl mx-auto mb-3 bg-white/10" />
                    <Skeleton className="h-4 w-16 mx-auto mb-2 bg-white/10" />
                    <Skeleton className="h-3 w-20 mx-auto bg-white/10" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 底部卡片骨架 */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center space-y-4">
              <Skeleton className="h-6 sm:h-8 w-48 sm:w-64 mx-auto bg-white/10" />
              <Skeleton className="h-4 w-64 sm:w-80 mx-auto bg-white/10" />
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <Skeleton className="h-10 w-24 bg-white/10" />
                <Skeleton className="h-10 w-24 bg-white/10" />
                <Skeleton className="h-10 w-24 bg-white/10" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
