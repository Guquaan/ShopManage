import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'

// 商家信息接口定义
export interface Merchant {
  id: number;
  name: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  businessLicense: string; // 营业执照图片路径
  status: '正常' | '停业' | '审核中';
  createTime: string;
  updateTime: string;
}

export const MerchantManage = defineStore('merchantmanage', {
  state: (): { currentMerchant: Merchant | null } => ({
    currentMerchant: localStorage.getItem('currentMerchant') 
      ? JSON.parse(localStorage.getItem('currentMerchant')!) 
      : null
  }),

  actions: {
    getMerchant() {
      if (!this.currentMerchant) {
        const defaultMerchant: Merchant = {
          id: 1001,
          name: '默认商家',
          address: '北京市朝阳区测试街道100号',
          contactPerson: '张三',
          phone: '13800138000',
          email: 'merchant@example.com',
          businessLicense: '/src/assets/license-default.png',
          status: '正常',
          createTime: new Date().toLocaleString(),
          updateTime: new Date().toLocaleString()
        }
        
        this.currentMerchant = defaultMerchant
        localStorage.setItem('currentMerchant', JSON.stringify(defaultMerchant))
      }
    },

    // 更新商家信息
    updateMerchantInfo(merchant: Partial<Merchant>) {
      if (!this.currentMerchant) {
        ElMessage({
          type: 'error',
          message: '商家信息不存在，请先初始化！'
        })
        return false
      }
      
      this.currentMerchant = {
        ...this.currentMerchant,
        ...merchant,
        updateTime: new Date().toLocaleString()
      }
      
      localStorage.setItem('currentMerchant', JSON.stringify(this.currentMerchant))
      
      ElMessage({
        type: 'success',
        message: '商家信息更新成功！'
      })
      
      return true
    },

    // 更新商家状态
    updateMerchantStatus(status: '正常' | '停业' | '审核中') {
      if (!this.currentMerchant) return false
      this.currentMerchant.status = status
      this.currentMerchant.updateTime = new Date().toLocaleString()
      localStorage.setItem('currentMerchant', JSON.stringify(this.currentMerchant))
      return true
    }
  }
})