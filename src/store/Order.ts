import { defineStore } from 'pinia';
import request from '../api/request';
import { ElMessage } from 'element-plus';
import { GoodsManage } from './Goods';

// 订单状态类型定义
type OrderStatus = '待付款' | '已付款' | '已发货' | '已完成' | '已取消';

// 订单接口定义
export interface Order {
  _id?: string;
  id?: string | number;
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

// 将 MongoDB 的 _id 映射为 id 便于前端使用
function normalizeOrder(item: any): Order {
  return {
    ...item,
    id: item._id || item.id,
    _id: item._id
  };
}

export const ordersManage = defineStore('ordersmanage', {
  state: (): { orders: Order[]; loading: boolean } => ({
    orders: [],
    loading: false
  }),

  actions: {
    // 获取订单列表（支持筛选参数）
    async getOrders(params?: Record<string, string>) {
      this.loading = true;
      try {
        const res = await request.get('/orders/list', { params });
        this.orders = (res.data || []).map(normalizeOrder);
        return this.orders;
      } catch (err: any) {
        ElMessage.warning('无法连接后端服务');
        return this.orders;
      } finally {
        this.loading = false;
      }
    },

    // 获取单个订单详情
    async getOrderById(id: string) {
      try {
        const res = await request.get(`/orders/detail/${id}`);
        return normalizeOrder(res.data);
      } catch (err: any) {
        ElMessage.error('获取订单详情失败');
        throw err;
      }
    },

    // 添加订单
    async addOrder(order: Order) {
      try {
        const payload = {
          orderNo: order.orderNo,
          productName: order.productName,
          productImage: order.productImage || '',
          customerName: order.customerName,
          quantity: Number(order.quantity),
          amount: Number(order.amount),
          status: order.status || '待付款'
        };
        const res = await request.post('/orders/add', payload);
        const newItem = normalizeOrder(res.data);
        this.orders.unshift(newItem);
        ElMessage.success('订单添加成功');
        return newItem;
      } catch (err: any) {
        ElMessage.error('添加订单失败: ' + (err.message || '网络错误'));
        throw err;
      }
    },

    // 编辑订单
    async editOrder(order: Order) {
      try {
        const id = order._id || order.id;
        // 获取旧订单数据用于计算库存变化
        const oldOrder = this.orders.find(
          item => (item._id || item.id) === id
        );

        const res = await request.put(`/orders/update/${id}`, {
          orderNo: order.orderNo,
          productName: order.productName,
          productImage: order.productImage || '',
          customerName: order.customerName,
          quantity: Number(order.quantity),
          amount: Number(order.amount),
          status: order.status
        });

        const updated = normalizeOrder(res.data);
        const index = this.orders.findIndex(
          item => (item._id || item.id) === id
        );
        if (index !== -1) {
          this.orders[index] = updated;
        }

        // 同步更新商品库存
        if (oldOrder) {
          const quantityDiff = order.quantity - oldOrder.quantity;
          if (quantityDiff !== 0) {
            GoodsManage().handleStock(order.productName, quantityDiff);
          }
        }

        ElMessage.success('订单编辑成功');
        return updated;
      } catch (err: any) {
        ElMessage.error('编辑订单失败: ' + (err.message || '网络错误'));
        throw err;
      }
    },

    // 取消订单
    async cancelOrder(id: string) {
      try {
        const res = await request.put(`/orders/cancel/${id}`);
        const cancelled = normalizeOrder(res.data);
        const index = this.orders.findIndex(
          item => (item._id || item.id) === id
        );
        if (index !== -1) {
          this.orders[index] = cancelled;
        }
        ElMessage.success('订单已取消');
        return true;
      } catch (err: any) {
        ElMessage.error('取消订单失败: ' + (err.message || '网络错误'));
        throw err;
      }
    },

    // 发货订单
    async shipOrder(id: string) {
      try {
        const res = await request.put(`/orders/update/${id}`, { status: '已发货' });
        const shipped = normalizeOrder(res.data);
        const index = this.orders.findIndex(
          item => (item._id || item.id) === id
        );
        if (index !== -1) {
          this.orders[index] = shipped;
        }
        ElMessage.success('订单已发货');
        return true;
      } catch (err: any) {
        ElMessage.error('发货失败: ' + (err.message || '网络错误'));
        throw err;
      }
    },

    // 删除订单
    async deleteOrder(id: string) {
      try {
        await request.delete(`/orders/delete/${id}`);
        this.orders = this.orders.filter(
          item => (item._id || item.id) !== id
        );
        ElMessage.success('订单删除成功');
        return true;
      } catch (err: any) {
        ElMessage.error('删除订单失败: ' + (err.message || '网络错误'));
        throw err;
      }
    }
  }
});
