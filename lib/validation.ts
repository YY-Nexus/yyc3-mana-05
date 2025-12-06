import { z } from "zod"

// 基础验证规则
export const baseValidation = {
  email: z.string().email("请输入有效的邮箱地址"),
  password: z
    .string()
    .min(8, "密码至少需要8个字符")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "密码必须包含大小写字母和数字"),
  name: z.string().min(2, "姓名至少需要2个字符").max(50, "姓名不能超过50个字符"),
  phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入有效的手机号码"),
  url: z.string().url("请输入有效的URL地址"),
  required: z.string().min(1, "此字段为必填项"),
}

// 用户相关验证
export const userValidation = {
  login: z.object({
    email: baseValidation.email,
    password: z.string().min(1, "请输入密码"),
  }),

  register: z
    .object({
      name: baseValidation.name,
      email: baseValidation.email,
      password: baseValidation.password,
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "两次输入的密码不一致",
      path: ["confirmPassword"],
    }),

  updateProfile: z.object({
    name: baseValidation.name.optional(),
    email: baseValidation.email.optional(),
    phone: baseValidation.phone.optional(),
    avatar: baseValidation.url.optional(),
  }),

  changePassword: z
    .object({
      currentPassword: z.string().min(1, "请输入当前密码"),
      newPassword: baseValidation.password,
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "两次输入的新密码不一致",
      path: ["confirmPassword"],
    }),
}

// 图像模块验证
export const imageValidation = {
  generate: z.object({
    prompt: z.string().min(5, "描述至少需要5个字符").max(1000, "描述不能超过1000个字符"),
    negativePrompt: z.string().max(500, "负向提示不能超过500个字符").optional(),
    model: z.string().min(1, "请选择AI模型"),
    size: z.string().min(1, "请选择图像尺寸"),
    steps: z.number().min(10, "生成步数至少为10").max(100, "生成步数不能超过100"),
    guidance: z.number().min(1, "引导强度至少为1").max(20, "引导强度不能超过20"),
  }),

  process: z.object({
    mode: z.enum(["img2img", "upscale", "remove-bg", "enhance", "extend"]),
    prompt: z.string().max(1000, "描述不能超过1000个字符").optional(),
    model: z.string().min(1, "请选择AI模型"),
  }),
}

// 视频模块验证
export const videoValidation = {
  generate: z.object({
    prompt: z.string().min(10, "视频描述至少需要10个字符").max(2000, "视频描述不能超过2000个字符"),
    model: z.string().min(1, "请选择AI模型"),
    duration: z.number().min(3, "视频时长至少3秒").max(60, "视频时长不能超过60秒"),
    resolution: z.string().min(1, "请选择分辨率"),
    fps: z.string().min(1, "请选择帧率"),
  }),

  voice: z.object({
    text: z.string().min(1, "配音文本不能为空").max(5000, "配音文本不能超过5000个字符"),
    voice: z.string().min(1, "请选择语音模型"),
    language: z.string().min(1, "请选择语言"),
  }),
}

// 音乐模块验证
export const musicValidation = {
  compose: z.object({
    prompt: z.string().min(5, "音乐描述至少需要5个字符").max(1000, "音乐描述不能超过1000个字符"),
    genre: z.string().min(1, "请选择音乐风格"),
    duration: z.number().min(10, "音乐时长至少10秒").max(300, "音乐时长不能超过300秒"),
    tempo: z.number().min(60, "节拍速度至少60 BPM").max(200, "节拍速度不能超过200 BPM"),
    key: z.string().min(1, "请选择调性"),
    model: z.string().min(1, "请选择AI模型"),
  }),

  voice: z.object({
    text: z.string().min(1, "合成文本不能为空").max(3000, "合成文本不能超过3000个字符"),
    voice: z.string().min(1, "请选择音色"),
    model: z.string().min(1, "请选择AI模型"),
  }),
}

// 代码模块验证
export const codeValidation = {
  generate: z.object({
    prompt: z.string().min(10, "代码需求描述至少需要10个字符").max(2000, "代码需求描述不能超过2000个字符"),
    language: z.string().min(1, "请选择编程语言"),
    model: z.string().min(1, "请选择AI模型"),
  }),

  process: z.object({
    code: z.string().min(10, "代码内容至少需要10个字符").max(50000, "代码内容不能超过50000个字符"),
    language: z.string().min(1, "请选择编程语言"),
    model: z.string().min(1, "请选择AI模型"),
  }),
}

// 文件验证
export const fileValidation = {
  image: z.object({
    file: z
      .instanceof(File)
      .refine((file) => file.size <= 10 * 1024 * 1024, "图片文件大小不能超过10MB")
      .refine(
        (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
        "只支持 JPG、PNG、WebP 格式的图片",
      ),
  }),

  video: z.object({
    file: z
      .instanceof(File)
      .refine((file) => file.size <= 100 * 1024 * 1024, "视频文件大小不能超过100MB")
      .refine((file) => ["video/mp4", "video/mov", "video/avi"].includes(file.type), "只支持 MP4、MOV、AVI 格式的视频"),
  }),

  audio: z.object({
    file: z
      .instanceof(File)
      .refine((file) => file.size <= 50 * 1024 * 1024, "音频文件大小不能超过50MB")
      .refine(
        (file) => ["audio/mp3", "audio/wav", "audio/flac"].includes(file.type),
        "只支持 MP3、WAV、FLAC 格式的音频",
      ),
  }),
}

// 验证工具函数
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): {
  success: boolean
  data?: T
  errors?: Record<string, string>
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join(".")
        errors[path] = err.message
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: "验证失败" } }
  }
}

// React Hook for validation
export function useValidation<T>(schema: z.ZodSchema<T>) {
  const validate = (data: unknown) => validateData(schema, data)

  const validateField = (fieldName: string, value: unknown) => {
    try {
      const fieldSchema = (schema as any).shape[fieldName]
      if (fieldSchema) {
        fieldSchema.parse(value)
        return { success: true }
      }
      return { success: true }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.errors[0]?.message }
      }
      return { success: false, error: "验证失败" }
    }
  }

  return { validate, validateField }
}
