import {createRouter,createWebHashHistory} from 'vue-router'
import Home from '../view/Home/Home.vue'
import Login from '../view/Login/Login.vue'
import GoodsMange from '../view/Component/GoodsMange.vue'
import GoodsHouse from '../view/Component/GoodsHouse.vue'
import GoodsOrder from '../view/Component/GoodsOrder.vue'
import UserMange from '../view/Component/UserMange.vue'
import MerchantMessage from '../view/Component/MerchantMessage.vue'
import SalesReport from '../view/Component/SalesReport.vue'
import SumAll from '../view/Component/SumAll.vue'
const routes: any = [
    {
        path:'/',
        component:Home,
        children:[
            {
                path:'/goodsmange',
                component:GoodsMange,
                meta:{name:'商品管理'}
            },
            {
                path:'/goodshouse',
                component:GoodsHouse,
                meta:{name:'库存管理'}
            },
            {
                path:'/goodsorder',
                component:GoodsOrder,
                meta:{name:'订单管理'}
            },
            {
                path:'/usermange',
                component:UserMange,
                meta:{name:'用户列表'}
            },
            {
                path:'/merchantmessage',
                component:MerchantMessage,
                meta:{name:'商家信息'}
            },
            {
                path:'/salesreport',
                component:SalesReport,
                meta:{name:'销售报表'}
            },
            {
                path:'/sumall',
                component:SumAll,
                meta:{name:'信息总结'}
            }
        ]
    },
    {
        path:'/login',
        component:Login,
    }
]

const router = createRouter({
    routes,
    history:createWebHashHistory()
})

export default router