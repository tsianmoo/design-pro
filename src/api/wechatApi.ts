import http from '@/utils/http'

interface Result<T> {
  code: number
  message: string
  data: T
}

interface WxQrCodeResponse {
  qrCodeUrl: string
  state: string
}

interface WxLoginResponse {
  token: string
  userId: number
  userName: string
  roles: string[]
}

interface WxUserInfo {
  openId: string
  unionId?: string
  nickname?: string
  headimgurl?: string
}

interface WxCheckResponse {
  loggedIn: boolean
  wxUserInfo?: WxUserInfo
}

/**
 * 获取微信登录二维码
 */
export function getWechatQrCode(): Promise<Result<WxQrCodeResponse>> {
  return http.get<Result<WxQrCodeResponse>>({
    url: '/api/wx/auth/qrcode',
    timeout: 30000 // 增加超时时间到30秒
  })
}

/**
 * 检查微信登录状态
 */
export function checkWechatLogin(state: string): Promise<Result<WxCheckResponse>> {
  return http.get<Result<WxCheckResponse>>({
    url: '/api/wx/auth/check',
    params: { state },
    timeout: 30000 // 增加超时时间到30秒
  })
}

/**
 * 微信登录
 */
export function wechatLogin(state: string): Promise<Result<WxLoginResponse>> {
  return http.post<Result<WxLoginResponse>>({
    url: '/api/wx/auth/login',
    data: { 
      state: state
    },
    timeout: 30000 // 增加超时时间到30秒
  })
}

/**
 * 绑定微信账号
 */
export function bindWechatAccount(data: {
  openId: string;
  unionId?: string;
  userName: string;
  password: string;
}): Promise<Result<WxLoginResponse>> {
  return http.post<Result<WxLoginResponse>>({
    url: '/api/wx/auth/bind',
    data,
    timeout: 30000 // 增加超时时间到30秒
  })
}
