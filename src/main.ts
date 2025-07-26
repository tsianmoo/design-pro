import App from './App.vue'
import 'default-passive-events'
import { createApp } from 'vue'
import { initStore } from './store'                 // Store
import { initRouter } from './router'               // Router
import { registerGlobComp } from './components'     // 注册全局组件
import '@styles/reset.scss'                         // 重置HTML样式
import '@styles/app.scss'                           // 全局样式
import '@styles/pages.scss'                         // 公共页面样式
import '@styles/el-ui.scss'                         // 优化element样式
import '@styles/mobile.scss'                        // 移动端样式优化
import '@styles/change.scss'                        // 主题切换过渡优化
import '@icons/system/iconfont.js'                  // 系统彩色图标
import '@icons/system/iconfont.css'                 // 系统图标
import '@styles/el-light.scss'                      // Element 自定义主题（亮色）
import '@styles/el-dark.scss'                       // Element 自定义主题（暗色）
import '@styles/dark.scss'                          // 系统主题
import '@utils/console.ts'                          // 控制台输出内容
import './mock/mock'                                // 数据 mock
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { setupGlobDirectives } from './directives'
import language from './language'
import FireworksComponent from './components/Ceremony/Fireworks.vue'
import { SystemSetting } from './config/setting'    // 导入系统设置

// 设置默认圆角CSS变量
document.documentElement.style.setProperty('--custom-radius', `${SystemSetting.defaultCustomRadius}rem`)
console.log('初始化设置默认圆角:', SystemSetting.defaultCustomRadius)

// 确保CSS变量在所有样式加载后生效
window.addEventListener('DOMContentLoaded', () => {
  // 重新应用圆角设置
  document.documentElement.style.setProperty('--custom-radius', `${SystemSetting.defaultCustomRadius}rem`)
  console.log('DOM加载完成后重新应用圆角设置:', SystemSetting.defaultCustomRadius)
  
  // 强制触发样式重新计算
  document.body.style.display = 'none'
  document.body.offsetHeight // 触发重排
  document.body.style.display = ''
})

const app = createApp(App)
initStore(app)
initRouter(app)
registerGlobComp(app)
setupGlobDirectives(app)

app.use(language)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 手动注册Fireworks组件，避免自动导入冲突
app.component('FireworksComponent', FireworksComponent)

app.mount('#app')
