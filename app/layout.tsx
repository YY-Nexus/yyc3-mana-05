import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { GlobalNotifications } from "@/components/global-notifications"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "YYC³ AI平台 - 智能创作工具集",
  description: "集成图像生成、视频创作、音乐制作、代码开发和智能引擎的全方位AI创作平台",
  keywords: ["AI", "人工智能", "图像生成", "视频创作", "音乐制作", "代码开发", "智能引擎"],
  authors: [{ name: "YYC³ Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#1e293b",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    title: "YYC³ AI平台",
    description: "智能创作工具集，释放无限创意可能",
    type: "website",
    locale: "zh_CN",
    siteName: "YYC³ AI平台",
  },
  twitter: {
    card: "summary_large_image",
    title: "YYC³ AI平台",
    description: "智能创作工具集，释放无限创意可能",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <AuthProvider>
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                {children}
                <GlobalNotifications />
              </div>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
