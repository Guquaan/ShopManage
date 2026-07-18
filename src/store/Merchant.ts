import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import request from '../api/request';
import buslic from '../data/photo/营业执照.png';

// 商家信息接口定义
export interface Merchant {
  _id?: string;
  name: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  businessLicense: string;
  updateTime: string;
}

export const MerchantManage = defineStore('merchantmanage', {
  state: (): { merchant: Merchant | null; loading: boolean } => ({
    merchant: null,
    loading: false
  }),

  actions: {
    // 从后端获取商家信息
    async getMerchant() {
      this.loading = true;
      try {
        const res = await request.get('/merchant/info');
        if (res.data) {
          this.merchant = res.data;
        }
      } catch {
        // 后端不可用时使用默认值
        if (!this.merchant) {
          this.merchant = {
            name: '默认商家',
            address: '广东省梅州市梅县区',
            contactPerson: '张三',
            phone: '13800138000',
            email: 'merchant@example.com',
            businessLicense: buslic,
            updateTime: new Date().toLocaleString()
          };
        }
      } finally {
        this.loading = false;
      }
      return this.merchant;
    },

    // 更新商家信息
    async updateMerchantInfo(merchant: Partial<Merchant>) {
      try {
        const res = await request.put('/merchant/update', merchant);
        if (res.data) {
          this.merchant = res.data;
        }
        ElMessage.success('商家信息更新成功！');
        return true;
      } catch (err: any) {
        // 后端不可用时回退到本地
        if (!this.merchant) {
          ElMessage.error('商家信息不存在，请先初始化！');
          return false;
        }
        this.merchant = {
          ...this.merchant,
          ...merchant,
          updateTime: new Date().toLocaleString()
        };
        ElMessage.success('商家信息更新成功！（本地存储）');
        return true;
      }
    }
  }
});
