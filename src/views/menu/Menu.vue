<template>
  <div class="page-content">
<!--    <h1>菜单管理</h1>-->
<!--    <el-button type="primary" @click="testGetMenuTree">测试获取菜单树</el-button>-->
<!--    <el-button type="success" @click="testLogin">测试登录</el-button>-->
    <el-row :gutter="20" style="margin-left: 15px">
      <el-button type="primary" @click="showModel('menu', null, true)">添加菜单</el-button>
    </el-row>

    <art-table :data="tableData">
      <template #default>
        <el-table-column prop="meta.title" label="菜单名称" />
        <el-table-column prop="path" label="路由" />

        <el-table-column prop="meta.authList" label="可操作权限">
          <template #default="scope">
            <el-popover
              placement="top-start"
              title="操作"
              :width="200"
              trigger="click"
              v-for="(item, index) in scope.row.meta.authList"
              :key="index"
            >
              <div style="margin: 0; text-align: right">
                <el-button size="small" type="primary" @click="showModel('button', item)"
                  >编辑</el-button
                >
                <el-button size="small" type="danger" @click="deleteAuth()">删除</el-button>
              </div>
              <template #reference>
                <el-button class="small-btn">{{ item.title }}</el-button>
              </template>
            </el-popover>
          </template>
        </el-table-column>

        <el-table-column label="编辑时间" prop="date"> 2024-3-12 12:00:00 </el-table-column>

        <el-table-column fixed="right" label="操作" width="180">
          <template #default="scope">
            <button-table type="add" @click="showModel('menu', { meta: { id: scope.row.id || scope.row.meta?.id } }, false)" />
            <button-table type="edit" @click="showDialog('edit', scope.row)" />
            <button-table type="delete" @click="deleteMenu(scope.row)" />
          </template>
        </el-table-column>
      </template>
    </art-table>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="700px" align-center>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="85px">
        <el-form-item label="菜单类型">
          <el-radio-group v-model="labelPosition" :disabled="disableMenuType">
            <el-radio-button value="menu" label="menu">菜单</el-radio-button>
            <el-radio-button value="button" label="button">权限</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <template v-if="labelPosition === 'menu'">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="菜单名称" prop="name">
                <el-input v-model="form.name" placeholder="菜单名称"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="路由地址" prop="path">
                <el-input v-model="form.path" placeholder="路由地址"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="权限标识" prop="label">
                <el-input v-model="form.label" placeholder="权限标识"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="图标" prop="icon">
                <icon-selector :iconType="iconType" :defaultIcon="form.icon" width="229px" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="菜单排序" prop="sort" style="width: 100%">
                <el-input-number
                  v-model="form.sort"
                  style="width: 100%"
                  @change="handleChange"
                  :min="1"
                  controls-position="right"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="外部链接" prop="link">
                <el-input
                  v-model="form.link"
                  placeholder="外部链接/内嵌地址(https://www.baidu.com)"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="5">
              <el-form-item label="是否启用" prop="isEnable">
                <el-switch v-model="form.isEnable"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="页面缓存" prop="keepAlive">
                <el-switch v-model="form.keepAlive"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="是否显示" prop="isHidden">
                <el-switch v-model="form.isHidden"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="是否内嵌" prop="isMenu">
                <el-switch v-model="form.isIframe"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <template v-if="labelPosition === 'button'">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="权限名称" prop="authName">
                <el-input v-model="form.authName" placeholder="权限名称"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="权限标识" prop="authLabel">
                <el-input v-model="form.authLabel" placeholder="权限标识"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="权限排序" prop="authSort" style="width: 100%">
                <el-input-number
                  v-model="form.authSort"
                  style="width: 100%"
                  @change="handleChange"
                  :min="1"
                  controls-position="right"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm()"> 确 定 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { useMenuStore } from '@/store/modules/menu'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { IconTypeEnum } from '@/enums/appEnum'
  import { menuService } from '@/api/menuApi'
  import http from '@/utils/http'
  import { ref, computed, reactive, nextTick } from 'vue'
  import type { MenuListType } from '@/types/menu'
  import { routerMatch } from '@/utils/menu'
  import { roleRoutes } from '@/router'

  const menuList = computed(() => useMenuStore().getMenuList)

  const dialogVisible = ref(false)
  const form = reactive({
    // 菜单
    id: null as number | null,
    name: '',
    path: '',
    label: '',
    icon: '',
    isEnable: true,
    sort: 1,
    isMenu: true,
    keepAlive: true,
    isHidden: true,
    link: '',
    isIframe: false,
    parentId: 0,
    component: '',
    // 权限 (修改这部分)
    authName: '',
    authLabel: '',
    authIcon: '',
    authSort: 1
  })
  const iconType = ref(IconTypeEnum.UNICODE)

  const labelPosition = ref('menu')
  const rules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入菜单名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
    label: [{ required: true, message: '输入权限标识', trigger: 'blur' }],
    // 修改这部分
    authName: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
    authLabel: [{ required: true, message: '请输入权限权限标识', trigger: 'blur' }]
  })

  const tableData = ref<MenuListType[]>(menuList.value)

  const isEdit = ref(false)
  const formRef = ref<FormInstance>()
  const dialogTitle = computed(() => {
    const type = labelPosition.value === 'menu' ? '菜单' : '权限'
    return isEdit.value ? `编辑${type}` : `新建${type}`
  })

  const showDialog = (type: string, row: any) => {
    showModel('menu', row, true)
  }

  const handleChange = () => {}

  const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          // 构建菜单数据
          const menuData = labelPosition.value === 'menu'
            ? {
                id: form.id, // 编辑时需要
                name: form.name,
                path: form.path,
                component: form.component || '',
                perms: form.label,
                icon: form.icon,
                sortOrder: form.sort,
                type: form.isMenu ? 'M' : 'C', // M目录 C菜单 F按钮
                visible: form.isHidden ? '1' : '0', // 0显示 1隐藏
                status: form.isEnable ? '0' : '1', // 0正常 1停用
                parentId: form.parentId
              }
            : {
                id: form.id, // 编辑时需要
                name: form.authName,
                perms: form.authLabel,
                icon: form.authIcon,
                sortOrder: form.authSort,
                type: 'F', // 按钮类型
                parentId: form.parentId
              }
          
          console.log('提交菜单数据:', menuData)
          
          let response
          if (isEdit.value) {
            // 调用更新菜单API
            response = await menuService.updateMenu(menuData)
          } else {
            // 调用添加菜单API
            response = await menuService.addMenu(menuData)
          }
          
          console.log('API响应:', response)
          
          if (response && response.code === 200 && response.data) {
            ElMessage.success(`${isEdit.value ? '编辑' : '新增'}成功`)
            dialogVisible.value = false
            
            // 清除菜单缓存
            try {
              await menuService.clearMenuCache()
              console.log('菜单缓存已清除')
            } catch (cacheError) {
              console.error('清除菜单缓存失败:', cacheError)
              // 即使缓存清除失败，也继续获取菜单树
            }
            
            // 重新获取菜单列表
            await testGetMenuTree()
          } else {
            ElMessage.error(`${isEdit.value ? '编辑' : '新增'}失败: ${response?.message || '未知错误'}`)
          }
        } catch (error) {
          console.error('提交表单失败:', error)
          ElMessage.error(`${isEdit.value ? '编辑' : '新增'}失败: ${(error as Error).message || '未知错误'}`)
        }
      }
    })
  }

  const showModel = (type: string, row?: any, lock: boolean = false) => {
    dialogVisible.value = true
    labelPosition.value = type
    isEdit.value = false
    lockMenuType.value = lock
    resetForm()

    // 如果传入了行数据，可能是编辑现有菜单或添加子菜单
    if (row) {
      // 如果是编辑模式
      if (row.meta && (row.meta.title || row.meta.icon)) {
        isEdit.value = true
        nextTick(() => {
          // 回显数据
          if (type === 'menu') {
            // 菜单数据回显
            // console.log(row.meta)
            form.id = row.id || row.meta?.id
            form.name = row.meta.title
            form.path = row.path
            form.label = row.name
            form.icon = row.meta.icon
            form.sort = row.meta.sort || 1
            form.isMenu = row.meta.isMenu
            form.keepAlive = row.meta.keepAlive
            form.isHidden = row.meta.isHidden || true
            form.isEnable = row.meta.isEnable || true
            form.link = row.meta.link
            form.isIframe = row.meta.isIframe || false
            form.parentId = row.parentId || 0
            form.component = row.meta.component || ''
          } else {
            // 权限按钮数据回显
            form.id = row.id
            form.authName = row.title
            form.authLabel = row.auth_mark
            form.authIcon = row.icon || ''
            form.authSort = row.sort || 1
            form.parentId = row.parentId || 0
          }
        })
      } 
      // 如果是添加子菜单模式（传入的row只包含父菜单ID）
      else if (row.meta && row.meta.id) {
        console.log('添加子菜单，父菜单ID:', row.meta.id)
        form.parentId = row.meta.id
      }
    } else {
      // 添加顶级菜单
      form.parentId = 0
    }
  }

  const resetForm = () => {
    formRef.value?.resetFields()
    Object.assign(form, {
      // 菜单
      id: null,
      name: '',
      path: '',
      label: '',
      icon: '',
      sort: 1,
      isMenu: true,
      keepAlive: true,
      isHidden: true,
      link: '',
      isIframe: false,
      parentId: 0,
      component: '',
      // 权限
      authName: '',
      authLabel: '',
      authIcon: '',
      authSort: 1
    })
  }

  const deleteMenu = async (row: any) => {
    try {
      await ElMessageBox.confirm('确定要删除该菜单吗？删除后无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      // 调用删除菜单API
      console.log('删除菜单:', row)
      const menuId = row.id || row.meta?.id
      
      if (!menuId) {
        ElMessage.error('菜单ID不能为空')
        return
      }
      
      const response = await menuService.deleteMenu(menuId)
      console.log('删除菜单响应:', response)
      
      if (response && response.code === 200 && response.data) {
        ElMessage.success('删除成功')
        
        // 清除菜单缓存
        try {
          await menuService.clearMenuCache()
          console.log('菜单缓存已清除')
        } catch (cacheError) {
          console.error('清除菜单缓存失败:', cacheError)
          // 即使缓存清除失败，也继续获取菜单树
        }
        
        // 重新获取菜单列表
        await testGetMenuTree()
      } else {
        ElMessage.error(`删除失败: ${response?.message || '未知错误'}`)
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除菜单失败:', error)
        ElMessage.error(`删除失败: ${(error as Error).message || '未知错误'}`)
      }
    }
  }

  const deleteAuth = async () => {
    try {
      await ElMessageBox.confirm('确定要删除该权限吗？删除后无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      ElMessage.success('删除成功')
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  // 修改计算属性，增加锁定控制参数
  const disableMenuType = computed(() => {
    // 编辑权限时锁定为权限类型
    if (isEdit.value && labelPosition.value === 'button') return true
    // 编辑菜单时锁定为菜单类型
    if (isEdit.value && labelPosition.value === 'menu') return true
    // 顶部添加菜单按钮时锁定为菜单类型
    return !isEdit.value && labelPosition.value === 'menu' && lockMenuType.value
  })

  // 添加一个控制变量
  const lockMenuType = ref(false)

  const testGetMenuTree = async () => {
    try {
      console.log('开始获取菜单树...')
      console.log('环境变量:', {
        VITE_API_URL: import.meta.env.VITE_API_URL,
        VITE_BASE_URL: import.meta.env.VITE_BASE_URL
      })
      
      // 检查token
      const token = localStorage.getItem('token')
      console.log('当前token:', token)
      
      if (!token) {
        ElMessage.warning('请先点击"测试登录"按钮获取token')
        return
      }
      
      // 使用http工具获取菜单列表
      try {
        // 获取菜单列表
        const response = await menuService.getMenuList()
        console.log('获取菜单列表响应:', response)
        
        if (!response || response.code !== 200) {
          ElMessage.error(`获取菜单列表失败: ${response?.message || '未知错误'}`)
          return
        }
        
        // 直接使用响应中的data作为菜单树
        const menuTree = response.data
        console.log('获取菜单树成功:', menuTree)
        
        // 检查菜单树数据
        if (menuTree && Array.isArray(menuTree)) {
          console.log('菜单树项数:', menuTree.length)
          
          if (menuTree.length === 0) {
            ElMessage.warning('获取到的菜单树为空数组')
          } else {
            ElMessage.success(`成功获取到${menuTree.length}个顶级菜单`)
            
            // 显示第一个菜单的详细信息
            if (menuTree[0]) {
              console.log('第一个菜单详情:', {
                id: menuTree[0].id,
                name: menuTree[0].name,
                path: menuTree[0].path,
                meta: menuTree[0].meta,
                children: menuTree[0].children ? `${menuTree[0].children.length}个子菜单` : '无子菜单'
              })
              
              // 如果有子菜单，显示第一个子菜单的详细信息
              if (menuTree[0].children && menuTree[0].children.length > 0) {
                const firstChild = menuTree[0].children[0]
                console.log('第一个子菜单详情:', {
                  id: firstChild.id,
                  name: firstChild.name,
                  path: firstChild.path,
                  meta: firstChild.meta,
                  children: firstChild.children ? `${firstChild.children.length}个子菜单` : '无子菜单'
                })
              }
            }
            
            // 如果只有一个菜单且有子菜单，尝试使用子菜单
            if (menuTree.length === 1 && menuTree[0].children && menuTree[0].children.length > 0) {
              console.log('只有一个根菜单，尝试使用其子菜单作为顶级菜单')
              const childMenus = menuTree[0].children
              console.log('子菜单数量:', childMenus.length)
              
              // 更新表格数据
              tableData.value = childMenus
              
              // 更新store
              useMenuStore().setMenuList(childMenus as any)
              
              // 同时更新布局菜单，使其与菜单管理页面一致
              routerMatch(childMenus, roleRoutes)
              ElMessage.success('已同步更新布局菜单')
              
              ElMessage.success(`使用子菜单作为顶级菜单，共${childMenus.length}个菜单`)
              return
            }
          }
        } else {
          ElMessage.error('获取到的菜单树不是数组格式')
        }
        
        // 更新表格数据和store
        tableData.value = menuTree
        useMenuStore().setMenuList(menuTree as any)
        
        // 同时更新布局菜单，使其与菜单管理页面一致
        routerMatch(menuTree, roleRoutes)
        ElMessage.success('已同步更新布局菜单')
        
        ElMessage.success('菜单数据已更新到表格')
      } catch (error) {
        console.error('获取菜单树失败:', error)
        ElMessage.error(`获取菜单树失败: ${(error as Error).message || '未知错误'}`)
        
        // 尝试清除菜单缓存
        try {
          console.log('尝试清除菜单缓存...')
          await menuService.clearMenuCache()
          ElMessage.info('已清除菜单缓存，请重试')
        } catch (cacheError) {
          console.error('清除菜单缓存失败:', cacheError)
        }
      }
    } catch (error) {
      console.error('获取菜单树失败:', error)
      ElMessage.error(`获取菜单树失败: ${(error as Error).message || '未知错误'}`)
    }
  }

  // 测试登录获取token
  const testLogin = async () => {
    try {
      console.log('开始测试登录...')
      const response = await http.post<{
        code: number;
        message: string;
        data: {
          token: string;
          refreshToken: string;
          userId: number;
          userName: string;
        };
        success: boolean;
      }>({
        url: '/api/auth/login',
        data: {
          userName: 'admin',
          password: '123456'
        }
      })
      console.log('登录响应:', response)
      
      if (response && response.data && response.data.token) {
        localStorage.setItem('token', response.data.token)
        ElMessage.success('登录成功，已获取token')
      } else {
        ElMessage.error('登录失败，未获取到token')
      }
    } catch (error) {
      console.error('登录失败:', error)
      ElMessage.error('登录失败')
    }
  }
</script>

<style lang="scss" scoped>
  .page-content {
    .svg-icon {
      width: 1.8em;
      height: 1.8em;
      overflow: hidden;
      vertical-align: -8px;
      fill: currentcolor;
    }

    :deep(.small-btn) {
      height: 30px !important;
      padding: 0 10px !important;
      font-size: 12px !important;
    }
  }
</style>
