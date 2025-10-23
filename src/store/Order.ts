import { defineStore } from 'pinia'
import { GoodsMange } from '.././store/Goods'
// 订单状态类型定义
type OrderStatus = '待付款' | '已付款' | '已发货' | '已完成' | '已取消';
// 订单接口定义
interface Order {
    id: number;
    orderNo: string;
    productName: string;
    productImage?: string;
    customerName: string;
    quantity: number;
    amount: number;
    status: OrderStatus;
    createTime: string;
    updateTime?: string;
}

// 拉取商品仓库数据
export const ordersManage = defineStore('ordersmanage', {
    state: (): { orders: Order[] } => ({
        orders: localStorage.getItem('orders') ? JSON.parse(localStorage.getItem('orders')!) : []
    }),

    // 实现办法
    actions: {
        // 获取虚拟数据
        getOrders(total: number) {
            const goodsStore = GoodsMange()
            const orders: Order[] = [];
            const statuses: OrderStatus[] = ['待付款', '已付款', '已发货', '已完成', '已取消'];
            for (let i = 0; i < total; i++) {
                const id = i + 1;
                // 随机选择一个商品
                const randomGoods = goodsStore.goods.length
                    ? goodsStore.goods[Math.floor(Math.random() * goodsStore.goods.length)]
                    : null;
                const quantity = Math.floor(Math.random() * 10) + 1;
                const price = randomGoods ?  randomGoods.price : 100
                orders.push({
                    id,
                    orderNo: `ORD${Date.now().toString().slice(-6)}${id.toString().padStart(3, '0')}`,
                    productName: randomGoods ? randomGoods.name : `商品名称${id}`,
                    productImage: randomGoods ? randomGoods.image : '',
                    customerName: `客户${Math.floor(Math.random() * 1000)}`,
                    quantity,
                    amount: price * quantity,
                    status: statuses[Math.floor(Math.random() * statuses.length)] || '已完成',
                    createTime: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleString()
                });
            }

            this.orders = orders;
            localStorage.setItem('orders', JSON.stringify(orders));
        },

        // 添加订单处理
        addOrders(order: Order) {
            const id = this.orders.length + 1
            const newOrder: Order = {
                ...order,
                id: id,
                createTime: new Date().toLocaleString()
            };
            this.orders.unshift(newOrder)
            localStorage.setItem('orders', JSON.stringify(this.orders))
            return newOrder
        },

        // 编辑订单处理
        editOrders(order: Order) {
            const index = this.orders.findIndex((item: Order) => item.id === order.id)
            if (index !== -1) {
                const oldCount = this.orders[index]?.quantity  
                this.orders[index] = {
                    ...this.orders[index],
                    ...order,
                    updateTime: new Date().toLocaleString(),
                }
                const newCount = this.orders[index].quantity
                const add = newCount - oldCount!
                GoodsMange().handleStock(this.orders[index].productName,add)
                localStorage.setItem('orders', JSON.stringify(this.orders))
                return this.orders[index]
            }
            return null
        },

        // 取消订单
        cancelOrders(id: number) {
            const index = this.orders.findIndex((item: Order) => item.id === id)
            if (index !== -1) {
                this.orders[index].status = '已取消';
                this.orders[index].updateTime = new Date().toLocaleString();
                localStorage.setItem('orders', JSON.stringify(this.orders));
                return true;
            }
            return false;
        },

        // 发货订单
        shipOrder(id: number) {
            const index = this.orders.findIndex(o => o.id === id);
            if (index !== -1 && this.orders[index].status === '已付款') {
                this.orders[index].status = '已发货';
                this.orders[index].updateTime = new Date().toLocaleString();
                localStorage.setItem('orders', JSON.stringify(this.orders));
                return true;
            }
            return false;
        }
    }
})