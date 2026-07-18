import { defineStore } from 'pinia';
import request from '../api/request';
import { ElMessage } from 'element-plus';

// 商品数据类型
export interface Product {
  _id?: string;
  id?: string | number;
  name: string;
  image: string;
  category: string;
  price: number;
  stock: number;
  sales: number;
  status: string;
  description?: string;
  updateTime: string;
  createTime?: string;
}

// 将 MongoDB 的 _id 映射为 id 便于前端使用
function normalizeProduct(item: any): Product {
  return {
    ...item,
    id: item._id || item.id,
    _id: item._id
  };
}

export const GoodsManage = defineStore('goodsmange', {
  state: (): { goods: Product[]; loading: boolean } => ({
    goods: [],
    loading: false
  }),

  actions: {
    // 获取商品列表（支持筛选参数；无参数时获取全部）
    async getGoods(params?: Record<string, string> | number) {
      this.loading = true;
      try {
        // 兼容旧模块调用 getGoods(number) 的情况，直接获取全部商品
        const queryParams = typeof params === 'object' ? params : undefined;
        const res = await request.get('/goods/list', { params: queryParams });
        this.goods = (res.data || []).map(normalizeProduct);
        return this.goods;
      } catch (err: any) {
        // 如果后端不可用，尝试从 localStorage 读取
        const cached = localStorage.getItem('goods');
        if (cached) {
          this.goods = JSON.parse(cached);
        }
        if (this.goods.length === 0) {
          ElMessage.warning('无法连接后端服务，且无本地缓存数据');
        }
        return this.goods;
      } finally {
        this.loading = false;
      }
    },

    // 获取单个商品详情
    async getGoodsById(id: string) {
      try {
        const res = await request.get(`/goods/detail/${id}`);
        return normalizeProduct(res.data);
      } catch (err: any) {
        ElMessage.error('获取商品详情失败');
        throw err;
      }
    },

    // 添加商品
    async addGoodsData(form: Product) {
      try {
        const res = await request.post('/goods/add', {
          name: form.name,
          category: form.category,
          price: Number(form.price),
          stock: Number(form.stock),
          status: form.status,
          image: form.image || '',
          description: (form as any).description || ''
        });
        const newItem = normalizeProduct(res.data);
        this.goods.unshift(newItem);
        ElMessage.success('商品添加成功');
        return newItem;
      } catch (err: any) {
        ElMessage.error('添加商品失败: ' + (err.message || '网络错误'));
        throw err;
      }
    },

    // 编辑商品
    async editGoodsData(form: Product) {
      try {
        const id = form._id || form.id;
        const res = await request.put(`/goods/update/${id}`, {
          name: form.name,
          category: form.category,
          price: Number(form.price),
          stock: Number(form.stock),
          status: form.status,
          image: form.image || '',
          description: (form as any).description || ''
        });
        const updated = normalizeProduct(res.data);
        const index = this.goods.findIndex(
          item => (item._id || item.id) === id
        );
        if (index !== -1) {
          this.goods[index] = updated;
        }
        ElMessage.success('商品编辑成功');
        return updated;
      } catch (err: any) {
        ElMessage.error('编辑商品失败: ' + (err.message || '网络错误'));
        throw err;
      }
    },

    // 删除商品
    async deleteGoods(id: string) {
      try {
        await request.delete(`/goods/delete/${id}`);
        this.goods = this.goods.filter(
          item => (item._id || item.id) !== id
        );
        ElMessage.success('商品删除成功');
      } catch (err: any) {
        ElMessage.error('删除商品失败: ' + (err.message || '网络错误'));
        throw err;
      }
    },

    // 批量删除
    async batchDeleteGoods(ids: string[]) {
      try {
        const res = await request.post('/goods/batch-delete', { ids });
        this.goods = this.goods.filter(
          item => !ids.includes(String(item._id || item.id))
        );
        ElMessage.success((res as any).message || '批量删除成功');
      } catch (err: any) {
        ElMessage.error('批量删除失败: ' + (err.message || '网络错误'));
        throw err;
      }
    },

    // 更新单个商品的库存并持久化（库存管理页面使用）
    updateGoodsStock(goods: Product) {
      const index = this.goods.findIndex(
        item => (item._id || item.id) === (goods._id || goods.id)
      );
      if (index !== -1 && this.goods[index]) {
        const item = this.goods[index] as Product;
        const newStatus = goods.stock < 10 ? '库存不足' : '在售';
        // 同步更新后端
        const id = String(item._id || item.id);
        request.put(`/goods/update/${id}`, {
          stock: goods.stock,
          status: newStatus
        }).catch(() => {});
        // 更新本地数据
        (this.goods[index] as Product).stock = goods.stock;
        (this.goods[index] as Product).status = newStatus;
        localStorage.setItem('goods', JSON.stringify(this.goods));
      }
    },

    // 更新库存（订单联动时使用）
    async updateStock(id: string, stock: number) {
      try {
        await request.put(`/goods/update/${id}`, { stock });
        const index = this.goods.findIndex(
          item => (item._id || item.id) === id
        );
        if (index !== -1 && this.goods[index]) {
          (this.goods[index] as Product).stock = stock;
          (this.goods[index] as Product).status = stock < 10 ? '库存不足' : '在售';
        }
      } catch (err: any) {
        ElMessage.error('更新库存失败');
        throw err;
      }
    },

    // 根据商品名称调整库存（订单联动时使用，兼容旧模块）
    handleStock(name: string, count: number) {
      const index = this.goods.findIndex((item: Product) => item.name === name);
      if (index === -1) return;
      const item = this.goods[index];
      if (!item) return;
      const newStock = item.stock - count;
      const newSales = item.sales + count;
      const newStatus = newStock < 10 ? '库存不足' : '在售';
      // 同步更新后端
      const id = String(item._id || item.id);
      request.put(`/goods/update/${id}`, {
        stock: newStock,
        sales: newSales,
        status: newStatus
      }).catch(() => {
        // 后端更新失败，仍更新本地数据
      });
      // 立即更新本地数据
      this.goods[index] = {
        ...item,
        stock: newStock,
        sales: newSales,
        status: newStatus
      } as Product;
      // 同时更新 localStorage 供其他模块读取
      localStorage.setItem('goods', JSON.stringify(this.goods));
    }
  }
});
