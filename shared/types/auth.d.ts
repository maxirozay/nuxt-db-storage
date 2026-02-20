declare module "#auth-utils" {
  interface User {
    id: string
    email: string
    password?: string | null
    name: string
  }

  interface UserSession {
    otp?: string
    otpEmail?: string
    otpExpiresAt?: number
  }
}
export {}