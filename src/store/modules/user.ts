import { defineStore } from 'pinia'
import { LanguageEnum } from '@/enums/appEnum'
import { router } from '@/router'
import { UserInfo } from '@/types/store'
import { useSettingStore } from './setting'
import { useWorktabStore } from './worktab'
import { getSysStorage } from '@/utils/storage'
import { MenuListType } from '@/types/menu'

interface UserState {
  language: LanguageEnum // 语言
  isLogin: boolean // 是否登录
  isLock: boolean // 是否锁屏
  lockPassword: string // 锁屏密码
  info: Partial<UserInfo> // 用户信息
  searchHistory: MenuListType[] // 搜索历史
}

export const useUserStore = defineStore({
  id: 'userStore',
  state: (): UserState => ({
    language: LanguageEnum.ZH,
    isLogin: false,
    isLock: false,
    lockPassword: '',
    info: {},
    searchHistory: []
  }),
  getters: {
    getUserInfo(): Partial<UserInfo> {
      return this.info
    },
    getSettingState() {
      return useSettingStore().$state
    },
    getWorktabState() {
      return useWorktabStore().$state
    }
  },
  actions: {
    initState() {
      let sys = getSysStorage()

      if (sys) {
        sys = JSON.parse(sys)
        const { info, isLogin, language, searchHistory, isLock, lockPassword } = sys.user

        this.info = info || {}
        this.isLogin = isLogin || false
        this.isLock = isLock || false
        this.lockPassword = lockPassword || ''
        this.language = language || LanguageEnum.ZH
        this.searchHistory = searchHistory || []
      }
    },
    saveUserData() {
      // 保存用户数据到本地存储
      try {
        const version = import.meta.env.VITE_VERSION || '1.0.0'
        const storageKey = `sys-v${version}`
        
        // 获取现有数据
        let sysData = {}
        const existingData = localStorage.getItem(storageKey)
        if (existingData) {
          try {
            sysData = JSON.parse(existingData)
          } catch (e) {
            console.error('解析现有存储数据失败:', e)
            sysData = {}
          }
        }
        
        // 获取其他store的状态
        const worktabStore = useWorktabStore()
        const settingStore = useSettingStore()
        
        // 更新用户数据，确保结构与验证模式匹配
        sysData = {
          ...sysData,
          user: {
            info: this.info || {},
            isLogin: this.isLogin,
            isLock: this.isLock,
            lockPassword: this.lockPassword,
            language: this.language,
            searchHistory: this.searchHistory,
            worktab: worktabStore.$state,
            setting: settingStore.$state
          }
        }
        
        // 保存到localStorage
        localStorage.setItem(storageKey, JSON.stringify(sysData))
        localStorage.setItem('version', version)
        console.log('用户数据已保存到本地存储:', storageKey)
      } catch (error) {
        console.error('保存用户数据失败:', error)
      }
    },
    setUserInfo(info: UserInfo) {
      this.info = info
    },
    setLoginStatus(isLogin: boolean) {
      this.isLogin = isLogin
    },
    setLanguage(lang: LanguageEnum) {
      this.language = lang
    },
    setSearchHistory(list: Array<MenuListType>) {
      this.searchHistory = list
    },
    setLockStatus(isLock: boolean) {
      this.isLock = isLock
    },
    setLockPassword(password: string) {
      this.lockPassword = password
    },
    logOut() {
      setTimeout(() => {
        // document.getElementsByTagName('html')[0].removeAttribute('class') // 移除暗黑主题
        this.info = {}
        this.isLogin = false
        this.isLock = false
        this.lockPassword = ''
        useWorktabStore().opened = []
        this.saveUserData()
        sessionStorage.removeItem('iframeRoutes')
        router.push('/login')
      }, 300)
    }
  }
})

function initVersion(version: string) {
  const vs = localStorage.getItem('version')
  if (!vs) {
    localStorage.setItem('version', version)
  }
}

// 数据持久化存储
function saveStoreStorage<T>(newData: T) {
  const version = import.meta.env.VITE_VERSION
  initVersion(version)
  const vs = localStorage.getItem('version') || version
  const storedData = JSON.parse(localStorage.getItem(`sys-v${vs}`) || '{}')

  // 合并新数据与现有数据
  const mergedData = { ...storedData, ...newData }
  localStorage.setItem(`sys-v${vs}`, JSON.stringify(mergedData))
}
