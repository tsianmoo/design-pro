import { fourDotsSpinnerSvg } from '@/assets/svg/loading'
import { MenuListType } from '@/types/menu'
import { ElLoading } from 'element-plus'
import http from '@/utils/http'
import { useUserStore } from '@/store/modules/user'

// 菜单接口
export const menuService = {
  // 获取菜单列表
  async getMenuList() {
    try {
      console.log('开始获取菜单列表...')
      
      // 显示加载中
      const loading = ElLoading.service({
        lock: true,
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      
      try {
        // 检查是否已登录
        const token = localStorage.getItem('token')
        
        if (!token) {
          console.warn('未找到token，请先登录')
          return {
            code: 401,
            message: '未登录，请先登录',
            data: [],
            success: false,
            closeLoading: () => loading.close()
          }
        }
        
        // 从后端获取菜单树
        const menuList = await this.getMenuTreeFromBackend()
        console.log('从后端获取的菜单列表:', menuList)
        
        return {
          code: 200,
          message: '获取菜单列表成功',
          data: menuList,
          success: true,
          closeLoading: () => loading.close()
        }
      } catch (error) {
        console.error('获取菜单列表失败:', error)
        return {
          code: 500,
          message: '获取菜单列表失败',
          data: [],
          success: false,
          closeLoading: () => loading.close()
        }
      } finally {
        // 关闭加载中
        loading.close()
      }
    } catch (error) {
      console.error('获取菜单列表出错:', error)
      throw error
    }
  },
  
  // 从后端获取菜单树
  async getMenuTreeFromBackend() {
    try {
      console.log('开始从后端获取菜单树...')
      
      // 获取API基础URL
      const apiBaseUrl = import.meta.env.VITE_API_URL
      console.log('API基础URL:', apiBaseUrl)
      
      // 从localStorage获取token
      const token = localStorage.getItem('token')
      console.log('当前token:', token)
      
      if (!token) {
        console.warn('未找到token，请先登录')
        throw new Error('未找到token，请先登录')
      }
      
      // 检查用户登录状态
      const userStore = useUserStore()
      console.log('当前登录状态:', userStore.isLogin)
      console.log('当前用户信息:', userStore.info)
      
      if (!userStore.isLogin) {
        console.warn('用户未登录，但有token，尝试恢复登录状态')
        userStore.setLoginStatus(true)
      }
      
      console.log('准备发送请求获取菜单树...')
      
      // 使用http工具发送请求，确保URL路径正确
      // 注意：http工具已配置了baseURL，所以这里使用相对路径
      const response = await http.get<{
        code: number
        message: string
        data: any[]
        success: boolean
      }>({
        url: '/api/menu/tree',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 增加超时时间
      })
      
      console.log('获取菜单树响应:', response)
      
      if (!response) {
        throw new Error('获取菜单树失败: 服务器未返回响应')
      }
      
      if (response.code !== 200) {
        throw new Error(`获取菜单树失败: ${response.message || '未知错误'}`)
      }
      
      if (!Array.isArray(response.data)) {
        console.warn('获取到的菜单树不是数组格式')
        return []
      }
      
      if (response.data.length === 0) {
        console.warn('获取到的菜单树为空数组')
      } else {
        console.log(`成功获取菜单树，共${response.data.length}项`)
        console.log('菜单树第一项:', response.data[0])
      }
      
      return response.data
    } catch (error) {
      console.error('获取菜单树失败:', error)
      throw error
    }
  },
  
  /*// 使用fetch测试菜单树接口
  async testMenuTreeWithFetch() {
    try {
      console.log('开始使用fetch测试菜单树接口...')
      
      // 从localStorage获取token
      const token = localStorage.getItem('token')
      console.log('当前token:', token)
      
      if (!token) {
        console.warn('未找到token，可能导致请求失败')
        throw new Error('未找到token，请先登录')
      }
      
      // 使用相对路径，通过Vite代理访问后端API
      const apiUrl = '/api/menu/tree'
      console.log('请求URL:', apiUrl)
      
      // 发送请求
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('fetch响应:', data)
      
      return data
    } catch (error) {
      console.error('fetch测试失败:', error)
      throw error
    }
  },
  
  // 获取菜单树
  async getMenuTree() {
    try {
      console.log('开始获取菜单树...')
      
      // 从localStorage获取token
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('未找到token，可能导致请求失败')
        throw new Error('未找到token，请先登录')
      }
      
      const response = await http.get<{
        code: number
        message: string
        data: any[]
        success: boolean
      }>({
        url: '/api/menu/tree', // 添加/api前缀
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('菜单树响应:', response)
      
      if (!response || response.code !== 200) {
        throw new Error(`获取菜单树失败: ${response?.message || '未知错误'}`)
      }
      
      return response.data
    } catch (error) {
      console.error('获取菜单树失败:', error)
      throw error
    }
  },*/
  
  // 添加菜单
  async addMenu(menuData: any) {
    try {
      console.log('开始添加菜单...')
      console.log('菜单数据:', menuData)
      
      // 从localStorage获取token
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('未找到token，可能导致请求失败')
        throw new Error('未找到token，请先登录')
      }
      
      const response = await http.post<{
        code: number
        message: string
        data: any
        success: boolean
      }>({
        url: '/api/menu', // 添加/api前缀
        data: menuData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('添加菜单响应:', response)
      
      if (!response || response.code !== 200) {
        throw new Error(`添加菜单失败: ${response?.message || '未知错误'}`)
      }
      
      return response
    } catch (error) {
      console.error('添加菜单失败:', error)
      throw error
    }
  },
  
  // 更新菜单
  async updateMenu(menuData: any) {
    try {
      console.log('开始更新菜单...')
      console.log('菜单数据:', menuData)
      
      // 从localStorage获取token
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('未找到token，可能导致请求失败')
        throw new Error('未找到token，请先登录')
      }
      
      const response = await http.put<{
        code: number
        message: string
        data: any
        success: boolean
      }>({
        url: '/api/menu', // 添加/api前缀
        data: menuData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('更新菜单响应:', response)
      
      if (!response || response.code !== 200) {
        throw new Error(`更新菜单失败: ${response?.message || '未知错误'}`)
      }
      
      return response
    } catch (error) {
      console.error('更新菜单失败:', error)
      throw error
    }
  },
  
  // 删除菜单
  async deleteMenu(id: number) {
    try {
      console.log('开始删除菜单...')
      console.log('菜单ID:', id)
      
      // 从localStorage获取token
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('未找到token，可能导致请求失败')
        throw new Error('未找到token，请先登录')
      }
      
      const response = await http.del<{
        code: number
        message: string
        data: any
        success: boolean
      }>({
        url: `/api/menu/${id}`, // 添加/api前缀
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('删除菜单响应:', response)
      
      if (!response || response.code !== 200) {
        throw new Error(`删除菜单失败: ${response?.message || '未知错误'}`)
      }
      
      return response
    } catch (error) {
      console.error('删除菜单失败:', error)
      throw error
    }
  },
  
  // 清除菜单缓存
  async clearMenuCache() {
    try {
      console.log('开始清除菜单缓存...')
      
      // 从localStorage获取token
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('未找到token，可能导致请求失败')
        throw new Error('未找到token，请先登录')
      }
      
      // 使用GET方法而不是POST方法，因为后端接口是GET
      const response = await http.get<{
        code: number
        message: string
        data: any
        success: boolean
      }>({
        url: '/api/menu/clear-cache',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 增加超时时间
      })
      
      console.log('清除菜单缓存响应:', response)
      
      if (!response || response.code !== 200) {
        throw new Error(`清除菜单缓存失败: ${response?.message || '未知错误'}`)
      }
      
      return response
    } catch (error) {
      console.error('清除菜单缓存失败:', error)
      throw error
    }
  },
}