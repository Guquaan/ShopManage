import { createApp } from 'vue'
import App from './App.vue'
// 引入element-plus的组件库
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
// 引入路由
import  router  from '../src/routers/index'
const app = createApp(App)
const pinia = createPinia()

// 路由守卫
router.beforeEach((to:any,_:any,next:any)=>{
    const token = localStorage.getItem('Logintoken')
    if(!token && to.path !== '/login'){
        next('/login')
    }
    //有token的情况下访问登录页面的情况
    else if(token&&to.path === '/login'){
        next() 
    } else if(token && to.path === '/'){
        next('/goodsmange')
    }
     else {
        next()
    }
})
// 使用pinia
app.use(pinia)
// 使用路由
app.use(router)
// 使用element-plus组件库
app.use(ElementPlus)
app.mount('#app')
