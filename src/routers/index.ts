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
import Setting from '../view/Component/Setting.vue'
const routes: any = [
    {
        path:'/',
        redirect:'/home',
    },
    {
        path:'/home',
        component:Home,
        children:[
            {
                path:'/goodsmanage',
                component:GoodsMange,
                meta:{name:'aside.goodsManage',icon:'Goods'}
            },
            {
                path:'/goodshouse',
                component:GoodsHouse,
                meta:{name:'aside.houseManage',icon:'ShoppingTrolley'}
            },
            {
                path:'/goodsorder',
                component:GoodsOrder,
                meta:{name:'aside.ordersManage',icon:'ShoppingBag'}
            },
            {
                path:'/usermange',
                component:UserMange,
                meta:{name:'aside.usersList',icon:'UserFilled'}
            },
            {
                path:'/merchantmessage',
                component:MerchantMessage,
                meta:{name:'aside.merchantMessage',icon:'Avatar'}
            },
            {
                path:'/salesreport',
                component:SalesReport,
                meta:{name:'aside.salesReport',icon:'Message'}
            },
            {
                path:'/sumall',
                component:SumAll,
                meta:{name:'aside.sumMessage',icon:'Coin'}
            },
            {
                path:'setting',
                component:Setting,
                meta:{name:'aside.systemSetting',icon:'Setting'}
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