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
          <span class="logo-text">{{t('logo')}}</span>
        </div>
        <ul class="flex-box">
          <li 
          v-for="(item,index) in menu.menu" 
          :key="item" 
          :class="{ selected: router.currentRoute.value.meta.name === item }"
          class="tab flex-box"
          @click="tabClick(item)"
          >
            <el-icon size="12">
              <component :is="router.getRoutes().find(items => items.meta.name === item)!.meta.icon" />
            </el-icon>
            <span :class="{ text: router.currentRoute.value.meta.name !== item }">{{ t(item) }}</span>
            <el-icon @click.stop="closeTab(item, index)" class="close" size="12"
            ><Close/></el-icon>
          </li>
        </ul>
      </div>

      <div class="header-right">
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
            <el-menu-item :index="t('aside.goodsManage') " @click="setBreadcrumb('aside.goodsManage' )">
              <el-icon><Goods /></el-icon>
              <template #title>{{ t('aside.goodsManage') }}</template>
            </el-menu-item>
            <el-menu-item :index="t('aside.houseManage') " @click="setBreadcrumb('aside.houseManage' )">
              <el-icon><ShoppingTrolley /></el-icon>
              <template #title>{{ t('aside.houseManage') }}</template>
            </el-menu-item>
            <el-menu-item :index="t('aside.ordersManage') " @click="setBreadcrumb('aside.ordersManage')">
              <el-icon><ShoppingBag /></el-icon>
              <template #title>{{ t('aside.ordersManage') }}</template>
            </el-menu-item>
            <el-sub-menu index="2">
              <template #title>
                <el-icon><User /></el-icon>
                <span>{{ t('aside.userManage') }}</span>
              </template>
              <el-menu-item :index="t('aside.usersList')" @click="setBreadcrumb('aside.usersList')">
                <el-icon></el-icon>
              <span>{{ t('aside.usersList') }}</span>
            </el-menu-item>
              <el-menu-item :index="t('aside.merchantMessage')" @click="setBreadcrumb('aside.merchantMessage')">
                <el-icon></el-icon>
                <span>{{ t('aside.merchantMessage') }}</span>
              </el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="3">
              <template #title>
                <el-icon><Coin /></el-icon>
                <span>{{ t('aside.sumAll') }}</span>
              </template>
              <el-menu-item :index="t('aside.salesReport')" @click="setBreadcrumb('aside.salesReport')">{{ t('aside.salesReport') }}</el-menu-item>
              <el-menu-item :index="t('aside.sumMessage')" @click="setBreadcrumb('aside.sumMessage')">{{ t('aside.sumMessage') }}</el-menu-item>
            </el-sub-menu>

            <el-menu-item :index="t('aside.systemSetting')" @click="setBreadcrumb('aside.systemSetting')">
              <el-icon><Setting /></el-icon>
              <template #title>{{ t('aside.systemSetting') }}</template>
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
import { ref ,onMounted} from 'vue';
import { 
  Fold, 
  Expand, 
  ShoppingCart, 
  Goods, 
  ShoppingBag, 
  User, 
  Setting ,
  ShoppingTrolley,
  Coin,
  Close
} from '@element-plus/icons-vue';
import { useRouter} from 'vue-router';
import { useLoginManage} from '../../store/Login'
import { ElMessage } from 'element-plus';
import { breakMenu } from '../../store/break'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const router = useRouter();
// 侧边栏状态
const isSidebarCollapsed = ref(false);
const sidebarWidth = ref('220px');
// 切换侧边栏
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  sidebarWidth.value = isSidebarCollapsed.value ? '64px' : '220px';
};
// 利用面包屑进行路由的跳转
const menu = breakMenu()
console.log(router.getRoutes())
// 关闭标签页功能
 // 路由跳转逻辑
  const findRoute = (routes: any[] ,items:any): any => {
    for (const route of routes) {
      if (route.meta?.name === items) {
        return route;
      }
      if (route.children && route.children.length) {
        const childRoute = findRoute(route.children,items);
        if (childRoute) return childRoute;
      }
    }
    return null;
  };
const closeTab = (items: string, index: number) => {
  menu.menu.splice(index, 1);
  // 删除非当前页标签的跳转逻辑
  if(router.currentRoute.value.meta.name !== items) {
    return;
  } 
  // 删除的如果是最后一项
  if(index === menu.menu.length) {
    // 如果是最后一个，跳转至首页
    if(!menu.menu.length) {
      router.push('/goodsmanage');
      menu.menu.push('aside.goodsManage')
      active.value = t('aside.goodsManage')
    } else{
      // 如果前面还有标签，跳转至前一个
      const previousItem = menu.menu[index - 1];
      tabClick(previousItem);
    }
  } else{
    // 删除的不是最后一个，跳转至后一个
    const nextItem = menu.menu[index];
    tabClick(nextItem);    
  }
}

// 点击li标签进行跳转
const tabClick = (items: any) => {
  const pathRoute = findRoute(router.getRoutes(), items);
  // 只有找到有效路由时才跳转
  if (pathRoute?.path) {
    router.push(pathRoute.path);
    // 设置点击后高亮效果
    active.value = t(items);
  }
};

const setBreadcrumb = (items: string) => {
  // 点击侧边导航栏标签页逻辑
  menu.addMenu(items)
  const pathRoute = findRoute(router.getRoutes(), items);
  // 只有找到有效路由时才跳转
  if (pathRoute?.path) {
    router.push(pathRoute.path);
  } 
};

// 实现侧边栏的高亮效果
const active = ref(t('aside.goodsManage'))
onMounted(()=>{
  if (router.currentRoute.value.path !== '/goodsmanage') {
    localStorage.setItem('active',t('aside.goodsManage'))
    router.push('/goodsmanage') 
    return
  } else{
    active.value = t('aside.goodsManage')
    localStorage.setItem('active',t('aside.goodsManage'))
  }
  const saveIndex = localStorage.getItem('active')
  if(saveIndex){
    active.value = saveIndex
  } else {
    // 没有保存默认为第一个
    active.value = t('aside.goodsManage')
  }
})
// 在进行选择的时候保存index到localStorage上面
const handleSelect = (key:any) => {
  active.value = key 
  localStorage.setItem('active',key)
}

// 退出登录功能
const Layout = () => {
  useLoginManage().logout()
  router.push('/login')
  ElMessage.success('退出登录成功')
}

</script>

<style scoped lang="less">

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
  height: 25px;
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
.flex-box {
  height: 100%;
  display: flex;
  gap: 1vh; 
  align-items: center;
  .text{
    color: #e91196;
  }
}
.tab {
    padding: 0 1vh;
    height: 100%;
    .close {
      visibility: hidden;
    }
    &.selected {
      background-color: skyblue;
      i {
        color: #409eff;
      }
      a {
        color: #409eff;
      }
    }
  }
  .tab:hover {
    background-color: skyblue; 
    cursor: pointer;
    .close {
      visibility: inherit;
      background-color: white;
      color: #000;
    }
  }
</style>
