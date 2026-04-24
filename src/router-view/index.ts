import condata from '../navlead/comdata'
const routes: any = [
    {
        path: '/',
        redirect: '/home',
    },
    {
        path: '/home',
        component: () => import('../view/Home/Home.vue'),
        children: [
            {
                path: '/goodsmanage',
                component: () => import('../view/Component/GoodsMange.vue'),
                meta: { name: 'aside.goodsManage', icon: 'Goods' }
            },
            {
                path: '/goodshouse',
                component: () => import('../view/Component/GoodsHouse.vue'),
                meta: { name: 'aside.houseManage', icon: 'ShoppingTrolley' }
            },
        ]
    },
]


const homearray = routes.filter((item: any) => item.path === '/home')[0]
const modules = import.meta.glob('../view/Component/**.vue')
homearray.children = []

// 递归遍历
const initRoute = (data: any, child: any) => {
    data.forEach((item: any) => {
        const obj: any = {
            path: item.path,
            name: item.name,
            component: modules[`../view/Component/${item.name}.vue`],
        }
        if (child instanceof Array) {
            child.push(obj)
        } else {
            if (!child.children) {
                child.children = []
            }
            child.children.push(obj)
        }
        if (item.child) {
            initRoute(item.child, obj)
        }
    });
}

initRoute(condata, homearray.children)