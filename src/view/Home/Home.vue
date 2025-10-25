<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <el-header class="app-header">
      <div class="header-left">
        <el-button 
          size="small" 
          class="menu-toggle"
          @click="toggleSidebar"
        ><el-icon v-show="!isSidebarCollapsed"><Fold /></el-icon>
        <el-icon v-show="isSidebarCollapsed"><Expand /></el-icon>
      </el-button>
        <div class="logo">
          <el-icon class="logo-icon"><ShoppingCart /></el-icon>
          <span class="logo-text">商品管理系统</span>
        </div>
      </div>
      <!-- 面包屑功能实现 -->
      <div class="header-right">
        <el-breadcrumb separator="/" class="breadcrumb">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="index" :to="toPath(item)">
            {{ item }}
          </el-breadcrumb-item>
        </el-breadcrumb>
        
        <!-- 登陆控制 -->
        <div class="user-info">
          <el-dropdown>
            <span class="user-trigger">
              <el-avatar :size="32">
                <img src="../../data/photo/登陆头像.png" alt="用户头像" />
              </el-avatar>
              <span class="user-name">管理员</span>
              <el-icon class="arrow-icon"></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>设置</el-dropdown-item>
                <el-dropdown-item divided @click="Layout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>
    
    <div class="app-main">
      <!-- 侧边导航栏 -->
      <el-aside 
        :width="sidebarWidth" 
        class="app-sidebar"
        :class="{ 'sidebar-collapsed': isSidebarCollapsed }"
      >
        <el-scrollbar>
          <el-menu
            :default-active=active
            class="sidebar-menu"
            background-color="#0f172a"
            text-color="#94a3b8"
            active-text-color="#ffffff"
            :collapse="isSidebarCollapsed"
            :collapse-transition="false"
            @select="handleSelect"
          >
            <el-menu-item index="1-1" @click="setBreadcrumb(['商品管理'])">
              <el-icon><Goods /></el-icon>
              <template #title>商品管理</template>
            </el-menu-item>
            <el-menu-item index="1-2" @click="setBreadcrumb(['库存管理'])">
              <el-icon><ShoppingTrolley /></el-icon>
              <template #title>库存管理</template>
            </el-menu-item>
            <el-menu-item index="1-3" @click="setBreadcrumb(['订单管理'])">
              <el-icon><ShoppingBag /></el-icon>
              <template #title>订单管理</template>
            </el-menu-item>
            <el-sub-menu index="2">
              <template #title>
                <el-icon><User /></el-icon>
                <span>用户管理</span>
              </template>
              <el-menu-item index="2-1" @click="setBreadcrumb(['用户管理', '用户列表'])">用户列表</el-menu-item>
              <el-menu-item index="2-2" @click="setBreadcrumb(['用户管理', '权限设置'])">权限设置</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="3">
              <template #title>
                <el-icon><Coin /></el-icon>
                <span>数据统计</span>
              </template>
              <el-menu-item index="3-1" @click="setBreadcrumb(['数据统计', '销售报表'])">销售报表</el-menu-item>
              <el-menu-item index="3-2" @click="setBreadcrumb(['数据统计', '库存报表'])">库存报表</el-menu-item>
              <el-menu-item index="3-3" @click="setBreadcrumb(['数据统计', '用户分析'])">用户分析</el-menu-item>
            </el-sub-menu>
            
            <el-menu-item index="4" @click="setBreadcrumb(['系统设置'])">
              <el-icon><Setting /></el-icon>
              <template #title>系统设置</template>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
      </el-aside>
          <el-main class="app-content">
            <RouterView />
          </el-main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref ,onMounted } from 'vue';
import { 
  Fold, 
  Expand, 
  ShoppingCart, 
  Goods, 
  ShoppingBag, 
  User, 
  Setting ,
  ShoppingTrolley,
  Coin
} from '@element-plus/icons-vue';
import { useRouter,useRoute } from 'vue-router';
import { useLoginManage} from '../../store/Login'
import { ElMessage } from 'element-plus';
;

const router = useRouter();
const route = useRoute();
// 侧边栏状态
const isSidebarCollapsed = ref(false);
const sidebarWidth = ref('220px');
// 面包屑数据
const breadcrumbItems = ref<string[]>(['商品管理']);
const currentTitle = ref(['首页']);
// 切换侧边栏
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  sidebarWidth.value = isSidebarCollapsed.value ? '64px' : '220px';
};

// 利用面包屑进行路由的跳转
const setBreadcrumb = (items: string[]) => {
  const targetName = items[items.length - 1];
  const findRoute = (routes: any[]): any => {
    for (const route of routes) {
      if (route.meta?.name === targetName) {
        return route;
      }
      if (route.children && route.children.length) {
        const childRoute = findRoute(route.children);
        if (childRoute) return childRoute;
      }
    }
    return null;
  };
  
  const pathRoute = findRoute(router.getRoutes());
  breadcrumbItems.value = items;
  currentTitle.value = items;
  
  // 只有找到有效路由时才跳转
  if (pathRoute?.path) {
    router.push(pathRoute.path);
  } 
};

// 设置面包屑点击的跳转
const toPath = (items:string) => {
  const pathRoute = route.matched.find(item => item.meta.name === items[items.length - 1] || '');
  return { path: pathRoute?.path || '' };
};

// 实现侧边栏的高亮效果
const active = ref('')
onMounted(()=>{
  //   if (router.currentRoute.value.path !== '/goodsmange') {
  //   localStorage.setItem('active','1-1')
  //   router.push('/goodsmange')  // 跳转到默认页面
  // }
  // const saveIndex = localStorage.getItem('active')
  // if(saveIndex){
  //   active.value = saveIndex
  // } else {
  //   // 没有保存默认为第一个
  //   active.value = '1-1'
  // }
})
// 在进行选择的时候保存index到localStorage上面
const handleSelect = (key : any, keyPath:any) => {
  // // 实时更新高亮效果
  // active.value = key 
  // // 保存index到浏览器上
  // localStorage.setItem('active',key)
}

// 退出登录功能
const Layout = () => {
  useLoginManage().logout()
  router.push('/login')
  ElMessage.success('退出登录成功')
}

</script>

<style scoped>

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
}

.menu-toggle {
  margin-right: 15px;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-icon {
  color: #409eff;
  font-size: 24px;
  margin-right: 8px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.breadcrumb {
  font-size: 14px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-trigger:hover {
  background-color: #f1f5f9;
}

.user-name {
  margin: 0 8px;
  font-size: 14px;
}

.arrow-icon {
  font-size: 16px;
  color: #64748b;
}

.app-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  background-color: #f1f5f9;
}

.app-sidebar {
  background-color: #0f172a;
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar-collapsed .el-sub-menu__title span,
.sidebar-collapsed .logo-text {
  display: none;
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}

.sidebar-menu .el-menu-item,
.sidebar-menu .el-sub-menu__title {
  height: 50px;
  line-height: 50px;
  padding: 0 15px;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #1e40af;
}

.app-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}


</style>
