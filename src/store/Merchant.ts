import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import buslic from '../data/photo/营业执照.png'
// 商家信息接口定义
export interface Merchant {
  name: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  businessLicense: string; 
  updateTime: string;
}

export const MerchantManage = defineStore('merchantmanage', {
  state: (): { merchant: Merchant | null } => ({
    merchant: localStorage.getItem('merchant') 
      ? JSON.parse(localStorage.getItem('merchant')!) 
      : null
  }),

  actions: {
    getMerchant() {
      if (!this.merchant) {
        const defaultMerchant: Merchant = {
          name: '默认商家',
          address: '广东省梅州市梅县区',
          contactPerson: '张三',
          phone: '13800138000',
          email: 'merchant@example.com',
          businessLicense: buslic,
          updateTime: new Date().toLocaleString()
        }
        this.merchant = defaultMerchant
        localStorage.setItem('merchant', JSON.stringify(defaultMerchant))
      }
    },

    // 更新商家信息
    updateMerchantInfo(merchant: Partial<Merchant>) {
      if (!this.merchant) {
        ElMessage({
          type: 'error',
          message: '商家信息不存在，请先初始化！'
        })
        return false
      }
      this.merchant = {
        ...this.merchant,
        ...merchant,
        updateTime: new Date().toLocaleString()
      }
      localStorage.setItem('merchant', JSON.stringify(this.merchant))
      ElMessage({
        type: 'success',
        message: '商家信息更新成功！'
      })
      return true
    },
  }
})