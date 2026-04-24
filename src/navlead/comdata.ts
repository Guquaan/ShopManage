export default [
    {
        path: '/',
        component: () => import('../view/Home/Home.vue'),
        children: [
            {
                path: '/goodsmanage',
                component: () => import('../view/Component/GoodsMange.vue'),
                meta: { name: 'aside.goodsManage', icon: 'Goods' }
            },
            {
                path: '/goodshouse',
                component: GoodsHouse,
                meta: { name: 'aside.houseManage', icon: 'ShoppingTrolley' }
            },
            {
                path: '/goodsorder',
                component: GoodsOrder,
                meta: { name: 'aside.ordersManage', icon: 'ShoppingBag' }
            },
            {
                path: '/usermange',
                component: UserMange,
                meta: { name: 'aside.usersList', icon: 'UserFilled' }
            },
            {
                path: '/merchantmessage',
                component: MerchantMessage,
                meta: { name: 'aside.merchantMessage', icon: 'Avatar' }
            },
            {
                path: '/salesreport',
                component: SalesReport,
                meta: { name: 'aside.salesReport', icon: 'Message' }
            },
            {
                path: '/sumall',
                component: SumAll,
                meta: { name: 'aside.sumMessage', icon: 'Coin' }
            },
            {
                path: 'setting',
                component: Setting,
                meta: { name: 'aside.systemSetting', icon: 'Setting' }
            }
        ]
    },
    {
        path: '/login',
        component: Login,
    }
]