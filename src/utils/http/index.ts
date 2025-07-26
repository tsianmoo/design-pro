import axios, { InternalAxiosRequestConfig, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import EmojiText from '../emojo'

const axiosInstance = axios.create({
  timeout: 30000, // 请求超时时间增加到30秒
  baseURL: import.meta.env.VITE_API_URL, // 使用相对路径，通过Vite代理访问后端API
  withCredentials: true, // 异步请求携带cookie
  transformRequest: [(data) => JSON.stringify(data)], // 请求数据转换为 JSON 字符串
  validateStatus: (status) => status >= 200 && status < 300, // 只接受 2xx 的状态码
  headers: {
    get: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    post: { 'Content-Type': 'application/json;charset=utf-8' }
  },
  transformResponse: [
    (data) => {
      // 响应数据转换
      try {
        return typeof data === 'string' && data.startsWith('{') ? JSON.parse(data) : data
      } catch {
        return data // 解析失败时返回原数据
      }
    }
  ]
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')

    // 如果 token 存在，则设置请求头
    if (token) {
      console.log('添加token到请求头:', token)
      request.headers.set({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    }

    return request // 返回修改后的配置
  },
  (error) => {
    ElMessage.error(`服务器异常！ ${EmojiText[500]}`) // 显示错误消息
    return Promise.reject(error) // 返回拒绝的 Promise
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 检查响应状态码
    if (response.status === 401 || response.data?.code === 401) {
      console.warn('接收到401未授权响应，清除登录状态')
      // 清除token
      localStorage.removeItem('token')
      // 清除登录状态
      const userStore = useUserStore()
      userStore.logOut()
      // 不需要在这里跳转，logOut方法会处理跳转
    }
    return response
  },
  (error) => {
    if (axios.isCancel(error)) {
      console.log('repeated request: ' + error.message)
    } else {
      // 处理401未授权错误
      if (error.response && (error.response.status === 401 || error.response.data?.code === 401)) {
        console.warn('接收到401未授权响应，清除登录状态')
        // 清除token
        localStorage.removeItem('token')
        // 清除登录状态
        const userStore = useUserStore()
        userStore.logOut()
        // 显示错误消息
        ElMessage.error('登录已过期，请重新登录')
      } else {
        // 其他错误
        const errorMessage = error.response?.data.message
        ElMessage.error(
          errorMessage
            ? `${errorMessage} ${EmojiText[500]}`
            : `请求超时或服务器异常！${EmojiText[500]}`
        )
      }
    }
    return Promise.reject(error)
  }
)

// 请求
async function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  try {
    console.log('请求配置:', {
      url: config.url,
      method: config.method,
      baseURL: axiosInstance.defaults.baseURL,
      fullURL: `${axiosInstance.defaults.baseURL}${config.url}`,
      params: config.params,
      data: config.data,
      timeout: config.timeout || axiosInstance.defaults.timeout
    })
    
    // 确保POST和PUT请求的参数正确放在data中
    if ((config.method === 'post' || config.method === 'put') && config.params) {
      config.data = config.data || {}
      Object.assign(config.data, config.params)
      delete config.params
    }
    
    // 如果配置中有timeout，使用它覆盖默认值
    if (config.timeout) {
      axiosInstance.defaults.timeout = config.timeout
    }
    
    const response = await axiosInstance.request<any, AxiosResponse<any>>(config)
    console.log('响应状态:', response.status)
    console.log('响应头:', response.headers)
    console.log('响应数据:', response.data)
    
    // 直接返回响应数据，不进行状态码检查
    // 由调用方根据实际情况处理响应
    return response.data
  } catch (error: any) {
    console.error('请求错误详情:', {
      message: error.message,
      code: error.code,
      config: error.config,
      response: error.response
    })
    
    // 网络错误特殊处理
    if (error.code === 'ERR_NETWORK') {
      ElMessage.error(`网络连接失败，请检查您的网络连接或服务器是否可用 ${EmojiText[500]}`)
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error(`请求超时，请稍后重试 ${EmojiText[500]}`)
    } else {
      const message = error.response?.data?.message || error.message || '未知错误'
      ElMessage.error(message)
    }
    
    return Promise.reject(error)
  }
}

// API 方法集合
const api = {
  get<T>(config: AxiosRequestConfig): Promise<T> {
    return request({ ...config, method: 'GET' }) // GET 请求
  },
  post<T>(config: AxiosRequestConfig): Promise<T> {
    return request({ ...config, method: 'POST' }) // POST 请求
  },
  put<T>(config: AxiosRequestConfig): Promise<T> {
    return request({ ...config, method: 'PUT' }) // PUT 请求
  },
  del<T>(config: AxiosRequestConfig): Promise<T> {
    return request({ ...config, method: 'DELETE' }) // DELETE 请求
  }
}

export default api
