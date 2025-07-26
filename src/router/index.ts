import type { App } from 'vue'
import {
  createRouter,
  createWebHashHistory,
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordRaw
} from 'vue-router'
import { useWorktabStore } from '@/store/modules/worktab'
import Home from '@views/index/index.vue'
import { SystemInfo } from '@/config/setting'
import { useUserStore } from '@/store/modules/user'
import { menuService } from '@/api/menuApi'
import { getIframeRoutes, routerMatch } from '@/utils/menu'
import { useMenuStore } from '@/store/modules/menu'
import { useSettingStore } from '@/store/modules/setting'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { isIframe } from '@/utils/utils'

// 创建路由守卫参数类型别名
type GuardParams = {
  to: RouteLocationNormalized
  next: NavigationGuardNext
}

// 顶部进度条配置
NProgress.configure({
  easing: 'ease', // 动画方式
  speed: 600, // 递增进度条的速度
  showSpinner: false, // 是否显示加载ico
  trickleSpeed: 200, // 自动递增间隔
  parent: 'body' //指定进度条的父容器
})

// 路由项扩展
export type AppRouteRecordRaw = RouteRecordRaw & {
  hidden?: boolean
}

// 首页
export const HOME_PAGE = '/dashboard/console'

// 不需要权限的路由
const routes = [
  {
    path: '/',
    redirect: HOME_PAGE
  },
  {
    path: '/dashboard',
    component: Home,
    meta: {
      title: '监控中心',
      title_en: 'Dashboard'
    },
    children: [
      {
        path: '/dashboard/console',
        name: 'Console',
        component: () => import(`@views/dashboard/Console/index.vue`),
        meta: {
          title: '工作台',
          title_en: 'Workbench',
          keepAlive: false
        }
      },
      {
        path: '/dashboard/analysis',
        name: 'Analysis',
        component: () => import(`@views/dashboard/analysis/index.vue`),
        meta: {
          title: '分析页',
          title_en: 'Analysis',
          keepAlive: false
        }
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@views/login/index.vue'),
    meta: {
      title: '登录',
      isHideTab: true,
      setTheme: true,
      noLogin: true
    }
  },
  {
    path: '/register',
    component: () => import('@views/register/index.vue'),
    meta: {
      title: '注册',
      isHideTab: true,
      noLogin: true,
      setTheme: true
    }
  },
  {
    path: '/forget-password',
    component: () => import('@views/forget-password/index.vue'),
    meta: {
      title: '忘记密码',
      isHideTab: true,
      noLogin: true,
      setTheme: true
    }
  },
  {
    path: '/exception',
    component: Home,
    meta: {
      title: '异常页面',
      title_en: 'Exception'
    },
    children: [
      {
        path: '/exception/403',
        component: () => import('@/views/exception/403.vue'),
        meta: {
          title: '403',
          title_en: '403'
        }
      },
      {
        path: '/exception/404',
        component: () => import('@views/exception/404.vue'),
        meta: {
          title: '404',
          title_en: '404'
        }
      },
      {
        path: '/exception/500',
        component: () => import('@views/exception/500.vue'),
        meta: {
          title: '500',
          title_en: '500'
        }
      }
    ]
  },
  {
    path: '/outside',
    component: Home,
    meta: {
      title: '内嵌页面',
      title_en: 'Outside'
    },
    children: [
      {
        path: '/outside/iframe/:path',
        component: () => import('@/views/outside/Iframe.vue'),
        meta: {
          title: 'iframe',
          title_en: 'iframe'
        }
      }
    ]
  },
  {
    path: '/template/pricing',
    component: () => import('@views/template/pricing.vue'),
    meta: {
      title: '定价',
      isHideTab: true
    }
  }
] as AppRouteRecordRaw[]

export const router = createRouter({
  history: createWebHashHistory(), // history 模式
  routes: routes, // 路由表
  scrollBehavior: () => ({ left: 0, top: 0 }) // 页面滚动行为
})

// 需要权限的路由
export const roleRoutes: AppRouteRecordRaw[] = [
  {
    path: '/user',
    name: 'User',
    component: Home,
    meta: {
      title: '用户管理'
    },
    children: [
      {
        path: '/user/user',
        name: 'Users',
        component: () => import('@views/user/User.vue'),
        meta: {
          title: '个人中心'
        }
      },
      {
        path: '/user/account',
        name: 'Account',
        component: () => import('@views/user/Account.vue'),
        meta: {
          title: '账号管理'
        }
      },
      {
        path: '/user/department',
        name: 'Department',
        component: () => import('@views/user/Department.vue'),
        meta: {
          title: '部门管理'
        }
      },
      {
        path: '/user/role',
        name: 'Role',
        component: () => import('@views/user/Role.vue'),
        meta: {
          title: '角色权限'
        }
      }
    ]
  },
  {
    path: '/menu',
    name: 'Menu',
    component: Home,
    meta: {
      title: '菜单管理',
      title_en: 'Menu Management'
    },
    children: [
      {
        path: '/menu/menu',
        name: 'Menus',
        component: () => import('@views/menu/Menu.vue'),
        meta: {
          title: '菜单管理',
          title_en: 'Menu Management'
        }
      },
      {
        path: '/menu/permission',
        name: 'Permission',
        component: () => import('@views/menu/Permission.vue'),
        meta: {
          title: '权限控制',
          title_en: 'Permission Control'
        }
      },
      {
        path: '/menu/nested',
        name: 'Nested',
        meta: {
          title: '嵌套菜单',
          title_en: 'Nested Menu'
        },
        children: [
          {
            path: '/menu/nested/menu1',
            name: 'NestedMenu1',
            component: () => import('@views/menu/nested/Menu1.vue'),
            meta: {
              title: '菜单1',
              title_en: 'Menu 1'
            }
          },
          {
            path: '/menu/nested/menu2',
            name: 'NestedMenu2',
            meta: {
              title: '菜单2',
              title_en: 'Menu 2'
            },
            children: [
              {
                path: '/menu/nested/menu2/menu2-1',
                name: 'NestedMenu2-1',
                component: () => import('@views/menu/nested/menu2/Menu2-1.vue'),
                meta: {
                  title: '菜单2-1',
                  title_en: 'Menu 2-1'
                }
              }
            ]
          },
          {
            path: '/menu/nested/menu3',
            name: 'NestedMenu3',
            meta: {
              title: '菜单3',
              title_en: 'Menu 3'
            },
            children: [
              {
                path: '/menu/nested/menu3/menu3-1',
                name: 'NestedMenu3-1',
                component: () => import('@views/menu/nested/menu3/Menu3-1.vue'),
                meta: {
                  title: '菜单3-1',
                  title_en: 'Menu 3-1'
                }
              },
              {
                path: '/menu/nested/menu3/menu3-2',
                name: 'NestedMenu3-2',
                meta: {
                  title: '菜单3-2',
                  title_en: 'Menu 3-2'
                },
                children: [
                  {
                    path: '/menu/nested/menu3/menu3-2/menu3-2-1',
                    name: 'NestedMenu3-2-1',
                    component: () => import('@views/menu/nested/menu3/menu3-2/Menu3-2-1.vue'),
                    meta: {
                      title: '菜单3-2-1',
                      title_en: 'Menu 3-2-1'
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/result',
    name: 'Result',
    component: Home,
    meta: {
      title: '结果页面'
    },
    children: [
      {
        path: '/result/success',
        name: 'Success',
        component: () => import('@views/result/Success.vue'),
        meta: {
          title: '成功页'
        }
      },
      {
        path: '/result/fail',
        name: 'Fail',
        component: () => import('@views/result/Fail.vue'),
        meta: {
          title: '失败页'
        }
      }
    ]
  },
  {
    path: '/article',
    component: Home,
    name: 'Article',
    meta: {
      title: '文章管理'
    },
    children: [
      {
        path: '/article/article-publish',
        component: () => import('@views/article/ArticlePublish.vue'),
        meta: {
          title: '文章发布'
        }
      },
      {
        path: '/article/article-list',
        component: () => import('@views/article/ArticleList.vue'),
        meta: {
          title: '文章列表'
        }
      },
      {
        path: '/article/detail',
        component: () => import('@views/article/ArticleDetail.vue'),
        meta: {
          title: '文章详情',
          isHideTab: true
        }
      },
      {
        path: '/article/comment',
        component: () => import('@views/article/Comment.vue'),
        meta: {
          title: '留言'
        }
      }
    ]
  },
  {
    path: '/widgets',
    component: Home,
    name: 'Widgets',
    meta: {
      title: '组件库'
    },
    children: [
      {
        path: '/widgets/icon-list',
        component: () => import('@views/widgets/IconList.vue'),
        meta: {
          title: '图标库'
        }
      },
      {
        path: '/widgets/icon-selector',
        component: () => import('@views/widgets/IconSelector.vue'),
        meta: {
          title: '图标选择器'
        }
      },
      {
        path: '/widgets/image-crop',
        component: () => import('@views/widgets/ImageCrop.vue'),
        meta: {
          title: '图像裁剪'
        }
      },
      {
        path: '/widgets/excel',
        component: () => import('@views/widgets/Excel.vue'),
        meta: {
          title: 'Excel'
        }
      },
      {
        path: '/widgets/video',
        component: () => import('@views/widgets/Video.vue'),
        meta: {
          title: '视频播放器'
        }
      },
      {
        path: '/widgets/count-to',
        component: () => import('@views/widgets/CountTo.vue'),
        meta: {
          title: '数字滚动'
        }
      },
      {
        path: '/widgets/wang-editor',
        component: () => import('@views/widgets/WangEditor.vue'),
        meta: {
          title: '富文本编辑器'
        }
      },
      {
        path: '/widgets/context-menu',
        component: () => import('@views/widgets/ContextMenu.vue'),
        meta: {
          title: '右键菜单'
        }
      },
      {
        path: '/widgets/watermark',
        component: () => import('@views/widgets/Watermark.vue'),
        meta: {
          title: '水印'
        }
      },
      {
        path: '/widgets/qrcode',
        component: () => import('@views/widgets/Qrcode.vue'),
        meta: {
          title: '二维码'
        }
      },
      {
        path: '/widgets/drag',
        component: () => import('@views/widgets/Drag.vue'),
        meta: {
          title: '拖拽'
        }
      },
      {
        path: '/widgets/text-scroll',
        component: () => import('@views/widgets/TextScroll.vue'),
        meta: {
          title: '文字滚动'
        }
      },
      {
        path: '/widgets/fireworks',
        component: () => import('@views/widgets/Fireworks.vue'),
        meta: {
          title: '礼花'
        }
      }
    ]
  },
  {
    path: '/template',
    component: Home,
    name: 'Template',
    meta: {
      title: '模板'
    },
    children: [
      {
        path: '/template/chat',
        component: () => import('@views/template/chat.vue'),
        meta: {
          title: '聊天'
        }
      },
      {
        path: '/template/cards',
        component: () => import('@views/template/cards.vue'),
        meta: {
          title: '卡片'
        }
      },
      {
        path: '/template/banners',
        component: () => import('@views/template/banners.vue'),
        meta: {
          title: '横幅'
        }
      },
      {
        path: '/template/charts',
        component: () => import('@views/template/charts.vue'),
        meta: {
          title: '图表'
        }
      },
      {
        path: '/template/calendar',
        component: () => import('@views/template/calendar.vue'),
        meta: {
          title: '日历'
        }
      }
    ]
  },
  {
    path: '/system',
    component: Home,
    name: 'System',
    meta: {
      title: '系统设置'
    },
    children: [
      {
        path: '/system/setting',
        component: () => import('@views/system/Setting.vue'),
        meta: {
          title: '系统设置'
        }
      },
      {
        path: '/system/api',
        name: 'Api',
        component: () => import('@views/system/Api.vue'),
        meta: {
          title: 'API管理'
        }
      },
      {
        path: '/system/log',
        component: () => import('@views/system/Log.vue'),
        meta: {
          title: '系统日志'
        }
      }
    ]
  },
  {
    path: '/safeguard',
    component: Home,
    name: 'Safeguard',
    meta: {
      title: '运维管理'
    },
    children: [
      {
        path: '/safeguard/server',
        component: () => import('@views/safeguard/Server.vue'),
        meta: {
          title: '服务器管理'
        }
      }
    ]
  },
  {
    path: '/plan',
    component: Home,
    name: 'Plan',
    meta: {
      title: '版本计划'
    },
    children: [
      {
        path: '/plan/log',
        component: () => import('@views/plan/log.vue'),
        meta: {
          title: '更新日志'
        }
      }
    ]
  }
]

// 是否注册路由
const isRouteRegistered = ref(false)

// 路由跳转前
router.beforeEach(async (to, from, next) => {
  // 显示顶部进度条
  if (useSettingStore().showNprogress) {
    NProgress.start()
  }

  // 设置登录注册页面主题
  setSystemTheme(to)

  // 检查是否登录或者不需要登录
  if (checkLogin({ to, next })) {
    return
  }

  // 获取菜单数据，动态注册路由
  if (await handleRegisterRoutes({ to, next })) {
    return
  }

  // 检查路由是否存在
  if (checkRouteExist({ to, next })) {
    return
  }

  // 设置标签页
  setWorktab(to)

  // 设置页面标题
  setPageTitle(to)
  
  // 允许导航继续
  next()
})

// 路由跳转完成
router.afterEach(() => {
  // 隐藏顶部进度条
  if (useSettingStore().showNprogress) {
    NProgress.done()
  }
})

// 设置标签页
function setWorktab(to: RouteLocationNormalized) {
  const worktabStore = useWorktabStore()
  const settingStore = useSettingStore()
  const { meta, path, params, query } = to
  const { title, title_en, isHideTab } = meta

  if (!isHideTab) {
    if (isIframe(path)) {
      const iframeRoute = getIframeRoutes().find((route: any) => route.path === to.path)

      if (iframeRoute?.meta) {
        const { title, title_en } = iframeRoute.meta
        worktabStore.router({
          title,
          title_en,
          path,
          params,
          query
        })
      }
    } else {
      if (settingStore.showWorkTab || path === HOME_PAGE) {
        worktabStore.router({
          title: title as string,
          title_en: title_en as string,
          path,
          params,
          query
        })
      }
    }
  }
}

import { useTheme } from '@/composables/useTheme'

// 设置登录注册页面主题
function setSystemTheme(to: RouteLocationNormalized) {
  if (to.meta.setTheme) {
    useTheme().switchTheme(useSettingStore().systemThemeType)
  }
}

// 检查路由是否登录或不需要登录
function checkLogin({ to, next }: GuardParams) {
  const userStore = useUserStore()
  const { meta, path } = to
  const { noLogin } = meta
  const token = localStorage.getItem('token')

  // 检查登录状态和token
  if (!userStore.isLogin || !token) {
    // 如果未登录但有token，尝试恢复登录状态
    if (!userStore.isLogin && token) {
      console.log('发现token但未登录，尝试恢复登录状态')
      userStore.setLoginStatus(true)
      // 不在这里跳转，让路由继续处理
      return false
    }
    
    // 如果是登录页或不需要登录的页面，允许访问
    if (path === '/login' || noLogin) {
      return false
    }
    
    // 其他情况，重定向到登录页
    console.log('用户未登录，重定向到登录页面')
    userStore.logOut() // 这会清除token和登录状态
    next('/login')
    return true // 返回true表示已经处理了路由
  }
  
  // 已登录状态下访问登录页，重定向到首页
  if (path === '/login') {
    next(HOME_PAGE)
    return true
  }
  
  return false // 返回false表示未处理路由
}

// 检查路由是否存在
function checkRouteExist({ to, next }: GuardParams) {
  if (to.matched.length === 0) {
    next('/exception/404')
    return true
  }
  return false
}

// 设置页面标题
function setPageTitle(to: RouteLocationNormalized) {
  const { meta } = to

  if (meta.title) {
    if (meta.title === 'iframe') {
      const title2 = to.path.split('/').pop()
      const decodeTitle = decodeURIComponent(title2 || '')
      document.title = `${decodeTitle} - ${SystemInfo.name}`
    } else {
      document.title = `${meta.title} - ${SystemInfo.name}`
    }
  }
}

// 处理路由注册
async function handleRegisterRoutes({ to, next }: GuardParams) {
  // 如果是登录页或不需要登录的页面，不需要注册路由
  if (to.path === '/login' || to.meta.noLogin) {
    return false
  }
  
  // 如果用户未登录，则不注册路由，由checkLogin处理重定向
  if (!useUserStore().isLogin) {
    return false
  }
  
  // 只有登录状态下且路由未注册时才注册路由
  if (!isRouteRegistered.value) {
    try {
      await registerRoutes()
      // 只有在路由注册成功后才重定向
      if (isRouteRegistered.value) {
        next({ ...to, replace: true })
        return true
      }
    } catch (error) {
      console.error('注册路由失败:', error)
      isRouteRegistered.value = false
      
      // 如果是因为未登录导致的错误，重定向到登录页
      if (error instanceof Error && error.message.includes('未找到token')) {
        useUserStore().logOut() // 清除可能无效的登录状态
        next('/login')
      } else {
        // 其他错误导致的路由注册失败，显示500错误页
        next('/exception/500')
      }
      return true
    }
  }
  
  return false
}

// 获取菜单，注册路由
async function registerRoutes(): Promise<void> {
  try {
    // 获取菜单列表
    let menuList;
    
    // 检查是否已登录
    const isLoggedIn = useUserStore().isLogin;
    const token = localStorage.getItem('token');
    
    if (!isLoggedIn || !token) {
      console.log('用户未登录，请先登录');
      // 未登录状态，返回空菜单
      menuList = [];
      return;
    }
    
    try {
      // 已登录状态，尝试从后端获取菜单
      console.log('尝试从后端获取菜单树...');
      menuList = await menuService.getMenuTreeFromBackend();
      console.log('从后端获取的菜单树:', menuList);
    } catch (error) {
      console.error('从后端获取菜单失败:', error);
      // 其他错误，返回空菜单
      menuList = [];
    }

    // 判断菜单列表是否为空
    if (!Array.isArray(menuList) || menuList.length === 0) {
      console.error('菜单列表为空，请登录后重试');
      menuList = [];
    }
    
    console.log('最终使用的菜单数据:', menuList);
    
    // 菜单列表存储到 pinia
    useMenuStore().setMenuList(menuList as []);
    
    // 注册路由
    routerMatch(menuList, roleRoutes);
    
    // 标记路由已注册
    isRouteRegistered.value = true;
    
  } catch (error) {
    console.error('注册路由出错:', error);
    isRouteRegistered.value = false;
    throw error;
  }
}

export function initRouter(app: App<Element>) {
  app.use(router)
}
