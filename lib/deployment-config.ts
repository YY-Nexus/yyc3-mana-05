"use client"

// 部署环境配置
interface DeploymentEnvironment {
  name: string
  domain: string
  apiUrl: string
  cdnUrl: string
  databaseUrl: string
  redisUrl: string
  features: {
    analytics: boolean
    monitoring: boolean
    errorTracking: boolean
    performanceTracking: boolean
    abTesting: boolean
    userFeedback: boolean
  }
  security: {
    httpsOnly: boolean
    corsOrigins: string[]
    rateLimiting: {
      enabled: boolean
      requests: number
      window: number
    }
    authentication: {
      jwtSecret: string
      sessionTimeout: number
      refreshTokenExpiry: number
    }
  }
  performance: {
    caching: {
      enabled: boolean
      ttl: number
      strategy: "memory" | "redis" | "hybrid"
    }
    compression: {
      enabled: boolean
      level: number
      types: string[]
    }
    cdn: {
      enabled: boolean
      provider: "cloudflare" | "aws" | "vercel"
      regions: string[]
    }
  }
  monitoring: {
    healthCheck: {
      enabled: boolean
      interval: number
      endpoints: string[]
    }
    logging: {
      level: "debug" | "info" | "warn" | "error"
      destinations: Array<"console" | "file" | "remote">
    }
    metrics: {
      enabled: boolean
      provider: "prometheus" | "datadog" | "newrelic"
      interval: number
    }
  }
}

// CI/CD 流水线配置
interface CICDConfig {
  stages: Array<{
    name: string
    steps: Array<{
      name: string
      command: string
      condition?: string
      timeout?: number
    }>
    environment?: Record<string, string>
    artifacts?: string[]
  }>
  triggers: {
    push: {
      branches: string[]
      paths?: string[]
    }
    pullRequest: {
      branches: string[]
    }
    schedule?: {
      cron: string
      branches: string[]
    }
  }
  notifications: {
    slack?: {
      webhook: string
      channels: string[]
    }
    email?: {
      recipients: string[]
      onSuccess: boolean
      onFailure: boolean
    }
  }
}

// 环境配置
const environments: Record<string, DeploymentEnvironment> = {
  development: {
    name: "开发环境",
    domain: "localhost:3000",
    apiUrl: "http://localhost:3001/api",
    cdnUrl: "http://localhost:3000",
    databaseUrl: "postgresql://localhost:5432/yyc3_dev",
    redisUrl: "redis://localhost:6379/0",
    features: {
      analytics: true,
      monitoring: true,
      errorTracking: true,
      performanceTracking: true,
      abTesting: true,
      userFeedback: true,
    },
    security: {
      httpsOnly: false,
      corsOrigins: ["http://localhost:3000", "http://localhost:3001"],
      rateLimiting: {
        enabled: false,
        requests: 1000,
        window: 60000,
      },
      authentication: {
        jwtSecret: "dev-secret-key",
        sessionTimeout: 3600000, // 1小时
        refreshTokenExpiry: 604800000, // 7天
      },
    },
    performance: {
      caching: {
        enabled: true,
        ttl: 300, // 5分钟
        strategy: "memory",
      },
      compression: {
        enabled: true,
        level: 6,
        types: ["text/html", "text/css", "application/javascript", "application/json"],
      },
      cdn: {
        enabled: false,
        provider: "vercel",
        regions: ["auto"],
      },
    },
    monitoring: {
      healthCheck: {
        enabled: true,
        interval: 30000, // 30秒
        endpoints: ["/api/health", "/api/status"],
      },
      logging: {
        level: "debug",
        destinations: ["console"],
      },
      metrics: {
        enabled: true,
        provider: "prometheus",
        interval: 15000, // 15秒
      },
    },
  },

  staging: {
    name: "测试环境",
    domain: "staging.yyc3.ai",
    apiUrl: "https://api-staging.yyc3.ai",
    cdnUrl: "https://cdn-staging.yyc3.ai",
    databaseUrl: process.env.STAGING_DATABASE_URL || "",
    redisUrl: process.env.STAGING_REDIS_URL || "",
    features: {
      analytics: true,
      monitoring: true,
      errorTracking: true,
      performanceTracking: true,
      abTesting: true,
      userFeedback: true,
    },
    security: {
      httpsOnly: true,
      corsOrigins: ["https://staging.yyc3.ai"],
      rateLimiting: {
        enabled: true,
        requests: 500,
        window: 60000,
      },
      authentication: {
        jwtSecret: process.env.STAGING_JWT_SECRET || "",
        sessionTimeout: 3600000,
        refreshTokenExpiry: 604800000,
      },
    },
    performance: {
      caching: {
        enabled: true,
        ttl: 600, // 10分钟
        strategy: "redis",
      },
      compression: {
        enabled: true,
        level: 8,
        types: ["text/html", "text/css", "application/javascript", "application/json", "image/svg+xml"],
      },
      cdn: {
        enabled: true,
        provider: "vercel",
        regions: ["hkg1", "sin1", "nrt1"],
      },
    },
    monitoring: {
      healthCheck: {
        enabled: true,
        interval: 60000, // 1分钟
        endpoints: ["/api/health", "/api/status", "/api/metrics"],
      },
      logging: {
        level: "info",
        destinations: ["console", "remote"],
      },
      metrics: {
        enabled: true,
        provider: "datadog",
        interval: 30000, // 30秒
      },
    },
  },

  production: {
    name: "生产环境",
    domain: "yyc3.ai",
    apiUrl: "https://api.yyc3.ai",
    cdnUrl: "https://cdn.yyc3.ai",
    databaseUrl: process.env.DATABASE_URL || "",
    redisUrl: process.env.REDIS_URL || "",
    features: {
      analytics: true,
      monitoring: true,
      errorTracking: true,
      performanceTracking: true,
      abTesting: true,
      userFeedback: true,
    },
    security: {
      httpsOnly: true,
      corsOrigins: ["https://yyc3.ai", "https://www.yyc3.ai"],
      rateLimiting: {
        enabled: true,
        requests: 200,
        window: 60000,
      },
      authentication: {
        jwtSecret: process.env.JWT_SECRET || "",
        sessionTimeout: 1800000, // 30分钟
        refreshTokenExpiry: 2592000000, // 30天
      },
    },
    performance: {
      caching: {
        enabled: true,
        ttl: 3600, // 1小时
        strategy: "hybrid",
      },
      compression: {
        enabled: true,
        level: 9,
        types: [
          "text/html",
          "text/css",
          "application/javascript",
          "application/json",
          "image/svg+xml",
          "application/xml",
          "text/xml",
        ],
      },
      cdn: {
        enabled: true,
        provider: "cloudflare",
        regions: ["auto"],
      },
    },
    monitoring: {
      healthCheck: {
        enabled: true,
        interval: 30000, // 30秒
        endpoints: ["/api/health", "/api/status", "/api/metrics"],
      },
      logging: {
        level: "warn",
        destinations: ["remote"],
      },
      metrics: {
        enabled: true,
        provider: "newrelic",
        interval: 60000, // 1分钟
      },
    },
  },
}

// CI/CD 配置
const cicdConfig: CICDConfig = {
  stages: [
    {
      name: "install",
      steps: [
        {
          name: "安装依赖",
          command: "npm ci",
          timeout: 300000, // 5分钟
        },
      ],
    },
    {
      name: "lint",
      steps: [
        {
          name: "代码检查",
          command: "npm run lint",
          timeout: 120000, // 2分钟
        },
        {
          name: "类型检查",
          command: "npm run type-check",
          timeout: 180000, // 3分钟
        },
      ],
    },
    {
      name: "test",
      steps: [
        {
          name: "单元测试",
          command: "npm run test:unit",
          timeout: 300000, // 5分钟
        },
        {
          name: "集成测试",
          command: "npm run test:integration",
          timeout: 600000, // 10分钟
        },
        {
          name: "E2E测试",
          command: "npm run test:e2e",
          condition: "branch == 'main' || branch == 'develop'",
          timeout: 900000, // 15分钟
        },
      ],
      artifacts: ["coverage/", "test-results/"],
    },
    {
      name: "build",
      steps: [
        {
          name: "构建应用",
          command: "npm run build",
          timeout: 600000, // 10分钟
        },
        {
          name: "构建Docker镜像",
          command: "docker build -t yyc3-ai:$CI_COMMIT_SHA .",
          condition: "branch == 'main' || branch == 'develop'",
          timeout: 900000, // 15分钟
        },
      ],
      artifacts: [".next/", "dist/"],
    },
    {
      name: "security",
      steps: [
        {
          name: "安全扫描",
          command: "npm audit --audit-level=high",
          timeout: 120000, // 2分钟
        },
        {
          name: "依赖检查",
          command: "npm run security:check",
          timeout: 180000, // 3分钟
        },
      ],
    },
    {
      name: "deploy-staging",
      steps: [
        {
          name: "部署到测试环境",
          command: "npm run deploy:staging",
          condition: "branch == 'develop'",
          timeout: 600000, // 10分钟
        },
        {
          name: "健康检查",
          command: "npm run health-check:staging",
          condition: "branch == 'develop'",
          timeout: 120000, // 2分钟
        },
      ],
      environment: {
        NODE_ENV: "staging",
        VERCEL_TOKEN: "$VERCEL_TOKEN",
        STAGING_DATABASE_URL: "$STAGING_DATABASE_URL",
      },
    },
    {
      name: "deploy-production",
      steps: [
        {
          name: "部署到生产环境",
          command: "npm run deploy:production",
          condition: "branch == 'main'",
          timeout: 900000, // 15分钟
        },
        {
          name: "健康检查",
          command: "npm run health-check:production",
          condition: "branch == 'main'",
          timeout: 180000, // 3分钟
        },
        {
          name: "性能测试",
          command: "npm run performance:test",
          condition: "branch == 'main'",
          timeout: 300000, // 5分钟
        },
      ],
      environment: {
        NODE_ENV: "production",
        VERCEL_TOKEN: "$VERCEL_TOKEN",
        DATABASE_URL: "$DATABASE_URL",
      },
    },
  ],
  triggers: {
    push: {
      branches: ["main", "develop", "feature/*"],
      paths: ["src/**", "public/**", "package.json", "package-lock.json"],
    },
    pullRequest: {
      branches: ["main", "develop"],
    },
    schedule: {
      cron: "0 2 * * *", // 每天凌晨2点
      branches: ["main"],
    },
  },
  notifications: {
    slack: {
      webhook: process.env.SLACK_WEBHOOK_URL || "",
      channels: ["#deployments", "#alerts"],
    },
    email: {
      recipients: ["dev-team@yyc3.ai", "ops-team@yyc3.ai"],
      onSuccess: false,
      onFailure: true,
    },
  },
}

// 获取当前环境配置
export function getCurrentEnvironment(): DeploymentEnvironment {
  const env = process.env.NODE_ENV || "development"
  return environments[env] || environments.development
}

// 获取环境变量
export function getEnvironmentVariable(key: string, defaultValue?: string): string {
  const value = process.env[key]
  if (!value && !defaultValue) {
    throw new Error(`环境变量 ${key} 未设置`)
  }
  return value || defaultValue || ""
}

// 验证环境配置
export function validateEnvironmentConfig(env: DeploymentEnvironment): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // 检查必需的URL
  if (!env.domain) errors.push("域名未配置")
  if (!env.apiUrl) errors.push("API URL未配置")
  if (!env.databaseUrl) errors.push("数据库URL未配置")

  // 检查安全配置
  if (env.security.httpsOnly && !env.domain.startsWith("https://")) {
    errors.push("启用HTTPS但域名不是HTTPS")
  }

  if (!env.security.authentication.jwtSecret) {
    errors.push("JWT密钥未配置")
  }

  // 检查监控配置
  if (env.monitoring.healthCheck.enabled && env.monitoring.healthCheck.endpoints.length === 0) {
    errors.push("启用健康检查但未配置检查端点")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// 生成部署脚本
export function generateDeploymentScript(targetEnv: string): string {
  const env = environments[targetEnv]
  if (!env) {
    throw new Error(`未知的部署环境: ${targetEnv}`)
  }

  return `#!/bin/bash
set -e

echo "🚀 开始部署到 ${env.name}..."

# 环境变量检查
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN 环境变量未设置"
  exit 1
fi

# 构建应用
echo "📦 构建应用..."
npm run build

# 运行测试
echo "🧪 运行测试..."
npm run test

# 部署到Vercel
echo "🌐 部署到 ${env.domain}..."
vercel --prod --token $VERCEL_TOKEN

# 健康检查
echo "🏥 执行健康检查..."
sleep 30
curl -f https://${env.domain}/api/health || exit 1

# 性能检查
if [ "${targetEnv}" = "production" ]; then
  echo "⚡ 执行性能检查..."
  npm run lighthouse -- --url=https://${env.domain}
fi

echo "✅ 部署完成！"
echo "🌍 访问地址: https://${env.domain}"
`
}

// 生成Docker配置
export function generateDockerConfig(targetEnv: string): string {
  const env = environments[targetEnv]
  if (!env) {
    throw new Error(`未知的部署环境: ${targetEnv}`)
  }

  return `# Dockerfile for ${env.name}
FROM node:18-alpine AS base

# 安装依赖
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# 构建应用
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=${targetEnv}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# 运行时镜像
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=${targetEnv}
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
`
}

// 生成GitHub Actions工作流
export function generateGitHubActionsWorkflow(): string {
  return `name: CI/CD Pipeline

on:
  push:
    branches: [main, develop, 'feature/*']
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * *'

jobs:
  ${cicdConfig.stages
    .map(
      (stage) => `
  ${stage.name}:
    runs-on: ubuntu-latest
    ${stage.name === "deploy-production" ? "if: github.ref == 'refs/heads/main'" : ""}
    ${stage.name === "deploy-staging" ? "if: github.ref == 'refs/heads/develop'" : ""}
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      ${stage.steps
        .map(
          (step) => `
      - name: ${step.name}
        run: ${step.command}
        ${step.timeout ? `timeout-minutes: ${Math.ceil(step.timeout / 60000)}` : ""}
        ${step.condition ? `if: ${step.condition.replace(/branch/g, "github.ref_name")}` : ""}`,
        )
        .join("")}
        
      ${
        stage.artifacts
          ? `
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: ${stage.name}-artifacts
          path: |
            ${stage.artifacts.join("\n            ")}`
          : ""
      }`,
    )
    .join("\n")}

  notify:
    runs-on: ubuntu-latest
    needs: [${cicdConfig.stages.map((s) => s.name).join(", ")}]
    if: always()
    
    steps:
      - name: Notify Slack
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          webhook_url: \${{ secrets.SLACK_WEBHOOK_URL }}
          channel: '#alerts'
          text: '🚨 CI/CD Pipeline failed for \${{ github.repository }}'
`
}

// 导出配置
export { environments, cicdConfig }
export type { DeploymentEnvironment, CICDConfig }
