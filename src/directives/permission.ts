import { router } from '@/router'
import { App, Directive } from 'vue'

const authDirective: Directive = {
  mounted(el: HTMLElement, binding: any) {
    // 开发环境下默认允许所有操作
    if (import.meta.env.DEV) {
      console.log('开发环境下，默认允许所有操作权限')
      return
    }
    
    const authList = (router.currentRoute.value.meta.authList as Array<{ auth_mark: string }>) || []

    const hasPermission = authList.some((item) => item.auth_mark === binding.value)

    if (!hasPermission) {
      el.parentNode?.removeChild(el)
    }
  }
}

export function setupPermissionDirective(app: App) {
  app.directive('auth', authDirective)
}
