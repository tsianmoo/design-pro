<template>
  <div class="login">
    <div class="left-wrap">
      <left-view></left-view>
    </div>
    <div class="right-wrap">
      <div class="top-right-wrap">
        <div class="btn theme-btn" @click="toggleTheme">
          <i class="iconfont-sys">
            {{ isDark ? '&#xe6b5;' : '&#xe725;' }}
          </i>
        </div>
        <el-dropdown @command="changeLanguage">
          <div class="btn language-btn">
            <i class="iconfont-sys">&#xe611;</i>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <div class="lang-btn-item">
                <el-dropdown-item command="zh">
                  <span class="menu-txt">简体中文</span>
                  <i v-if="locale === 'zh'" class="iconfont-sys">&#xe621;</i>
                </el-dropdown-item>
              </div>
              <div class="lang-btn-item">
                <el-dropdown-item command="en">
                  <span class="menu-txt">English</span>
                  <i v-if="locale === 'en'" class="iconfont-sys">&#xe621;</i>
                </el-dropdown-item>
              </div>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="header">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#iconsys-zhaopian-copy"></use>
        </svg>
        <h1>{{ systemName }}</h1>
      </div>
      <div class="login-wrap">
        <div class="form">
          <h3 class="title">{{ $t('login.title') }}</h3>
          <p class="sub-title">{{ $t('login.subTitle') }}</p>
          <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            @keyup.enter="handleSubmit"
            style="margin-top: 25px"
          >
            <el-form-item prop="userName">
              <el-input
                :placeholder="$t('login.placeholder[0]')"
                size="large"
                v-model.trim="formData.userName"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                :placeholder="$t('login.placeholder[1]')"
                size="large"
                v-model.trim="formData.password"
                type="password"
                radius="8px"
                autocomplete="off"
              />
            </el-form-item>
            <div class="drag-verify">
              <div class="drag-verify-content" :class="{ error: !isPassing && isClickPass }">
                <!-- :background="isDark ? '#181818' : '#eee'" -->
                <DragVerify
                  ref="dragVerify"
                  v-model:value="isPassing"
                  :width="width < 500 ? 328 : 438"
                  :text="$t('login.sliderText')"
                  textColor="var(--art-gray-800)"
                  :successText="$t('login.sliderSuccessText')"
                  :progressBarBg="getCssVariable('--el-color-primary')"
                  background="var(--art-gray-200)"
                  handlerBg="var(--art-main-bg-color)"
                  @pass="onPass"
                />
              </div>
              <p class="error-text" :class="{ 'show-error-text': !isPassing && isClickPass }">{{
                $t('login.placeholder[2]')
              }}</p>
            </div>

            <div class="forget-password">
              <el-checkbox v-model="formData.rememberPassword">{{
                $t('login.rememberPwd')
              }}</el-checkbox>
              <router-link class="custom-text" to="/forget-password">{{
                $t('login.forgetPwd')
              }}</router-link>
            </div>

            <div style="margin-top: 30px">
              <el-button
                class="login-btn"
                size="large"
                type="primary"
                @click="handleSubmit"
                :loading="loading"
              >
                {{ $t('login.btnText') }}
              </el-button>
            </div>

            <div class="other-login">
              <div class="divider">
                <span>{{ $t('login.otherLogin') }}</span>
              </div>
              <div class="social-login">
                <el-button class="wechat-btn" size="large" @click="handleWechatLogin">
                  <i class="iconfont-sys">&#xe607;</i>
                  {{ $t('login.wechatLogin') }}
                </el-button>
              </div>
            </div>

            <div class="footer">
              <p>
                {{ $t('login.noAccount') }}
                <router-link class="custom-text" to="/register">{{
                  $t('login.register')
                }}</router-link>
              </p>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import LeftView from '@/components/Pages/Login/LeftView.vue'
  import { SystemInfo } from '@/config/setting'
  import { ElMessage, ElNotification } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import { HOME_PAGE } from '@/router'
  import { ApiStatus } from '@/utils/http/status'
  import axios from 'axios'
  import { getCssVariable } from '@/utils/utils'
  import { LanguageEnum, SystemThemeEnum } from '@/enums/appEnum'
  import { useI18n } from 'vue-i18n'
  const { t } = useI18n()
  import { useSettingStore } from '@/store/modules/setting'
  import type { FormInstance, FormRules } from 'element-plus'
  import { getWechatQrCode, checkWechatLogin, wechatLogin } from '@/api/wechatApi'
  import { ElMessageBox } from 'element-plus'
  import { onBeforeUnmount } from 'vue'
  import http from '@/utils/http'  // 导入配置好的HTTP客户端

  const userStore = useUserStore()
  const router = useRouter()
  const isPassing = ref(false)
  const isClickPass = ref(false)

  const systemName = SystemInfo.name
  const formRef = ref<FormInstance>()
  const formData = reactive({
    userName: SystemInfo.login.userName,
    password: SystemInfo.login.password,
    rememberPassword: true
  })

  const rules = computed<FormRules>(() => ({
    userName: [{ required: true, message: t('login.placeholder[0]'), trigger: 'blur' }],
    password: [{ required: true, message: t('login.placeholder[1]'), trigger: 'blur' }]
  }))

  const loading = ref(false)
  const { width } = useWindowSize()

  const store = useSettingStore()
  const isDark = computed(() => store.isDark)

  const onPass = () => {}

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        if (!isPassing.value) {
          isClickPass.value = true
          return
        }

        loading.value = true
        try {
          console.log('登录参数:', {
            userName: formData.userName,
            password: formData.password
          })
          
          const res = await http.post<any>({
            url: '/api/auth/login',
            data: {
              userName: formData.userName,
              password: formData.password
            }
          })

          console.log('登录响应:', res)
          
          // 兼容不同的响应格式
          const data = res.data || res
          const code = res.code || 200
          const message = res.message || '操作成功'
          
          if (code === ApiStatus.success || (data && !code)) {
            // 如果有data字段，使用data，否则使用整个响应
            const userData = data || res
            
            console.log('登录成功，解析用户数据:', userData)
            
            // 检查不同的响应结构，确保正确获取token
            let token = null
            let userId = null
            let userName = null
            let userAvatar = null
            let roles = []
            
            // 检查各种可能的响应结构
            if (userData.data && userData.data.token) {
              // 结构1: { data: { token, userId, userName, ... } }
              token = userData.data.token
              userId = userData.data.userId
              userName = userData.data.userName
              roles = userData.data.roles || []
            } else if (userData.token) {
              // 结构2: { token, userId, userName, ... }
              token = userData.token
              userId = userData.userId
              userName = userData.userName
              userAvatar = userData.avatar
              roles = userData.roles || []
            } else if (typeof userData === 'string') {
              // 结构3: 直接返回token字符串
              token = userData
              userName = formData.userName
            }
            
            // 确保token被正确设置到localStorage
            if (token) {
              localStorage.setItem('token', token)
              console.log('已设置token:', token)
              
              // 设置用户信息和登录状态
              const userInfo = {
                id: userId || 1,
                name: userName || formData.userName,
                userName: userName || formData.userName,
                userAvatar: userAvatar,
                token: token,
                roles: roles
              }
              
              userStore.setUserInfo(userInfo)
              userStore.setLoginStatus(true)
              userStore.saveUserData() // 保存用户数据到本地存储
              
              showLoginSuccessNotice()
              
              // 登录成功后直接跳转到首页，路由守卫会自动处理菜单注册
              await router.push(HOME_PAGE)
            } else {
              console.error('登录响应中未找到token:', userData)
              ElMessage.error('登录成功但未获取到有效token')
            }
          } else {
            ElMessage.error(message || '登录失败')
          }
        } catch (error: any) {
          console.error('登录错误:', error)
          ElMessage.error(error.message || '登录失败，请稍后重试')
        } finally {
          loading.value = false
        }
      }
    })
  }

  // 登录成功提示
  const showLoginSuccessNotice = () => {
    setTimeout(() => {
      ElNotification({
        title: t('login.success.title'),
        type: 'success',
        showClose: false,
        duration: 2500,
        zIndex: 10000,
        message: `${t('login.success.message')}, ${systemName}!`
      })
    }, 300)
  }

  // 切换语言
  const { locale } = useI18n()

  const changeLanguage = (lang: LanguageEnum) => {
    locale.value = lang
    userStore.setLanguage(lang)
  }

  // 切换主题
  import { useTheme } from '@/composables/useTheme'

  const toggleTheme = () => {
    const { LIGHT, DARK } = SystemThemeEnum
    useTheme().switchTheme(useSettingStore().systemThemeType === LIGHT ? DARK : LIGHT)
  }

  // 微信登录相关类型定义
  interface WxQrCodeData {
    qrCodeUrl: string;
    state: string;
  }
  
  interface WxUserInfo {
    openId: string;
    unionId?: string;
    nickname?: string;
    headimgurl?: string;
  }
  
  interface WxLoginData {
    userId: number;
    userName: string;
    token: string;
    roles: string[];
    userAvatar?: string;
    needBind?: boolean;
    wxUserInfo?: WxUserInfo;
  }

  const checkLoginInterval = ref<ReturnType<typeof setInterval> | null>(null)

  const handleWechatLogin = async () => {
    try {
      loading.value = true
      
      // 开发环境下使用模拟数据
      if (import.meta.env.DEV) {
        // 模拟二维码数据
        const mockQrCodeData = {
          qrCodeUrl: 'https://open.weixin.qq.com/connect/qrconnect?appid=wxb58e57afaad83721&redirect_uri=http%3A%2F%2Flocalhost%3A8164%2Fwx%2Fauth%2Fcallback&response_type=code&scope=snsapi_login&state=mock-state#wechat_redirect',
          state: 'mock-state'
        }
        
        loading.value = false
        
        // 打开微信二维码弹窗
        await ElMessageBox.alert(
          `<div class="qrcode-container">
            <div style="text-align: center; padding: 20px; background-color: #f8f8f8; border-radius: 4px;">
              <p>开发环境模拟微信登录</p>
              <p>点击"确定"模拟扫码成功</p>
            </div>
            <p>${t('login.scanQrCode')}</p>
          </div>`,
          t('login.wechatLogin'),
          {
            dangerouslyUseHTMLString: true,
            showClose: true,
            closeOnClickModal: false,
            closeOnPressEscape: false,
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            customClass: 'wx-login-dialog'
          }
        ).then(() => {
          // 模拟登录成功
          const mockUserData = {
            userId: 1,
            userName: 'admin',
            token: 'mock-token-' + Date.now(),
            roles: ['admin'],
            avatar: ''
          }
          handleWechatLoginSuccess(mockUserData)
        }).catch(() => {
          // 用户取消
          ElMessage.info(t('login.loginCanceled'))
        })
        
        return
      }
      
      // 正常环境下的处理逻辑
      const response = await getWechatQrCode()
      loading.value = false
      
      if (!response || !response.data) {
        ElMessage.error(t('login.qrcodeError'))
        console.error('获取二维码失败:', response)
        return
      }
      
      const qrCodeData: WxQrCodeData = response.data
      
      // 打开微信二维码弹窗
      await ElMessageBox.alert(
        `<div class="qrcode-container">
          <iframe src="${qrCodeData.qrCodeUrl}" width="280px" height="380px" class="wx-iframe" style="border: none; overflow: hidden; scrollbar-width: none;"></iframe>
          <p>${t('login.scanQrCode')}</p>
        </div>`,
        t('login.wechatLogin'),
        {
          dangerouslyUseHTMLString: true,
          showClose: true,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          confirmButtonText: t('common.cancel'),
          customClass: 'wx-login-dialog',
          callback: () => {
            if (checkLoginInterval.value) {
              clearInterval(checkLoginInterval.value)
            }
          }
        }
      )

      // 开始轮询检查登录状态
      checkLoginInterval.value = setInterval(async () => {
        try {
          const checkResponse = await checkWechatLogin(qrCodeData.state)
          if (checkResponse && checkResponse.data && checkResponse.data.loggedIn) {
            if (checkLoginInterval.value) {
              clearInterval(checkLoginInterval.value)
            }
            ElMessageBox.close()
            // 获取登录信息
            try {
              const loginResponse = await wechatLogin(qrCodeData.state)
              if (!loginResponse || !loginResponse.data) {
                ElMessage.error(t('login.loginFailed'))
                console.error('微信登录失败:', loginResponse)
                return
              }
              
              const responseData: WxLoginData = loginResponse.data
              
              // 检查是否需要绑定账号
              if (responseData.needBind && responseData.wxUserInfo) {
                // 显示绑定账号弹窗
                showBindAccountDialog(responseData.wxUserInfo)
              } else {
                // 直接登录
                handleWechatLoginSuccess(responseData)
              }
            } catch (loginError) {
              console.error('微信登录请求失败:', loginError)
              ElMessage.error(t('login.loginFailed'))
            }
          }
        } catch (error) {
          console.error('检查登录状态失败:', error)
        }
      }, 2000) // 每2秒检查一次
    } catch (error) {
      loading.value = false
      console.error('获取二维码失败:', error)
      ElMessage.error(t('login.qrcodeError'))
    }
  }
  
  // 处理微信登录成功
  const handleWechatLoginSuccess = (userData: WxLoginData) => {
    const userInfo = {
      id: userData.userId,
      name: userData.userName,
      userName: userData.userName,
      userAvatar: userData.userAvatar || '',
      roles: userData.roles,
      token: userData.token
    }
    userStore.setUserInfo(userInfo)
    userStore.setLoginStatus(true)
    showLoginSuccessNotice()
    router.push(HOME_PAGE)
  }
  
  // 显示绑定账号弹窗
  const showBindAccountDialog = (wxUserInfo: WxUserInfo) => {
    const bindForm = reactive({
      userName: '',
      password: ''
    })
    
    ElMessageBox.prompt(
      `<div class="bind-account-dialog">
        <h3>${t('login.bindAccount')}</h3>
        <p>${t('login.bindAccountTip')}</p>
        <div class="wx-user-info">
          <img src="${wxUserInfo.headimgurl || ''}" class="wx-avatar" />
          <span>${wxUserInfo.nickname || t('login.wxUser')}</span>
        </div>
        <el-form>
          <el-form-item label="${t('login.username')}">
            <el-input v-model="bindForm.userName" placeholder="${t('login.usernamePlaceholder')}"></el-input>
          </el-form-item>
          <el-form-item label="${t('login.password')}">
            <el-input v-model="bindForm.password" type="password" placeholder="${t('login.passwordPlaceholder')}"></el-input>
          </el-form-item>
        </el-form>
      </div>`,
      t('login.bindAccount'),
      {
        confirmButtonText: t('login.bind'),
        cancelButtonText: t('common.cancel'),
        inputType: 'text',
        inputValue: '',
        inputPlaceholder: '',
        inputValidator: () => true, // 禁用默认验证
        dangerouslyUseHTMLString: true,
        customClass: 'bind-account-dialog'
      }
    )
    .then(({ value }) => {
      // 绑定账号
      bindWechatAccount(wxUserInfo, bindForm.userName, bindForm.password)
    })
    .catch(() => {
      ElMessage.info(t('login.bindCanceled'))
    })
  }
  
  // 绑定微信账号
  const bindWechatAccount = async (wxUserInfo: WxUserInfo, userName: string, password: string) => {
    try {
      loading.value = true
      const response = await http.post<any>({
        url: '/wx/auth/bind',
        data: {
          openId: wxUserInfo.openId,
          unionId: wxUserInfo.unionId,
          userName: userName,
          password: password
        },
        timeout: 30000 // 增加超时时间
      })
      
      if (response && response.code === ApiStatus.success) {
        ElMessage.success(t('login.bindSuccess'))
        handleWechatLoginSuccess(response.data)
      } else {
        ElMessage.error((response && response.message) || t('login.bindFailed'))
      }
    } catch (error: any) {
      console.error('绑定账号失败:', error)
      ElMessage.error(error.message || t('login.bindFailed'))
    } finally {
      loading.value = false
    }
  }

  // 在组件卸载时清除定时器
  onBeforeUnmount(() => {
    if (checkLoginInterval.value) {
      clearInterval(checkLoginInterval.value)
    }
  })
</script>

<style lang="scss" scoped>
  @use './index';

  :global(.wx-login-dialog) {
    width: 340px !important;
    padding: 0;
    border-radius: 8px;
    overflow: hidden;

    .el-message-box__header {
      padding: 15px 20px;
      background: #f8f8f8;
    }

    .el-message-box__content {
      padding: 20px 0 0 0;
      overflow: hidden;
    }

    .el-message-box__btns {
      padding: 10px 20px 20px;
    }
  }
  
  :global(iframe) {
    scrollbar-width: none !important; /* Firefox */
    -ms-overflow-style: none !important; /* IE and Edge */
  }
  
  :global(iframe::-webkit-scrollbar) {
    display: none !important; /* Chrome, Safari, Opera */
    width: 0 !important;
    height: 0 !important;
  }
  
  :global(.bind-account-dialog) {
    width: 400px !important;
    
    .el-message-box__header {
      padding: 15px 20px;
      background: #f8f8f8;
    }
    
    .el-message-box__content {
      padding: 20px;
    }
    
    .el-message-box__input {
      display: none;
    }
    
    h3 {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 18px;
      color: var(--el-text-color-primary);
    }
    
    p {
      margin-bottom: 15px;
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
    
    .wx-user-info {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      padding: 10px;
      background-color: var(--el-fill-color-light);
      border-radius: 4px;
      
      .wx-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 10px;
      }
    }
    
    .el-form-item {
      margin-bottom: 15px;
    }
  }

  .other-login {
    margin-top: 20px;
    text-align: center;

    .divider {
      position: relative;
      margin: 20px 0;

      &::before,
      &::after {
        position: absolute;
        top: 50%;
        width: 45%;
        height: 1px;
        content: '';
        background-color: var(--el-border-color);
      }

      &::before {
        left: 0;
      }

      &::after {
        right: 0;
      }

      span {
        padding: 0 10px;
        color: var(--el-text-color-secondary);
        background-color: var(--art-main-bg-color);
      }
    }

    .social-login {
      display: flex;
      gap: 20px;
      justify-content: center;

      .wechat-btn {
        display: flex;
        gap: 8px;
        align-items: center;
        color: #07c160;
        border-color: #07c160;

        &:hover {
          background-color: rgb(7 193 96 / 10%);
        }

        i {
          font-size: 20px;
        }
      }
    }
  }

  .qrcode-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0;

    iframe {
      text-align: center;
      overflow: hidden;
      border: none;
      margin: 0 auto;
      display: block;
    }
    
    .wx-iframe {
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE and Edge */
    }
    
    .wx-iframe::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
      width: 0;
      height: 0;
    }

    p {
      margin-top: 15px;
      color: var(--el-text-color-secondary);
    }
  }
</style>
