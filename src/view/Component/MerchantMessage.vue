<template>
  <div class="merchant-container">
    <!-- 商家状态卡片 -->
    <el-card class="status-card">
      <div class="status-info">
        <span class="status-label">当前状态：</span>
        <el-tag 
          :type="statusType" 
          class="status-tag"
        >
          {{ merchant?.status }}
        </el-tag>
        <el-select 
          v-model="newStatus" 
          placeholder="修改状态" 
          class="status-select"
          @change="handleStatusChange"
        >
          <el-option label="正常" value="正常"></el-option>
          <el-option label="停业" value="停业"></el-option>
          <el-option label="审核中" value="审核中"></el-option>
        </el-select>
      </div>
      <div class="time-info">
        <span>创建时间：{{ merchant?.createTime }}</span>
        <span>最后更新：{{ merchant?.updateTime }}</span>
      </div>
    </el-card>

    <!-- 商家信息表单 -->
    <el-card class="info-card">
      <el-form
        :model="form"
        label-width="120px"
        :rules="rules"
        ref="formRef"
        class="merchant-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商家ID" prop="id">
              <el-input v-model="form.id" disabled />
            </el-form-item>
            
            <el-form-item label="商家名称" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
            
            <el-form-item label="联系人" prop="contactPerson">
              <el-input v-model="form.contactPerson" />
            </el-form-item>
            
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" />
            </el-form-item>
            
            <el-form-item label="电子邮箱" prop="email">
              <el-input v-model="form.email" type="email" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="商家地址" prop="address">
              <el-input v-model="form.address" type="textarea" rows="4" />
            </el-form-item>
            
            <el-form-item label="营业执照">
              <el-upload
                class="upload-license"
                :file-list="fileList"
                list-type="picture"
                action="fake-action"
                :http-request="handleLicenseUpload"
                :on-remove="handleRemoveLicense"
              >
                <el-button type="primary">上传营业执照</el-button>
              </el-upload>
              
              <div v-if="form.businessLicense" class="license-preview">
                <img 
                  :src="form.businessLicense" 
                  alt="营业执照" 
                  class="license-img"
                >
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <div class="form-actions">
          <el-button type="primary" @click="handleSave">保存修改</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { MerchantManage } from '../../store/Merchant';
import type { Merchant } from '../../store/Merchant';

// 引入商家存储
const merchantStore = MerchantManage();
const merchant = computed(() => merchantStore.currentMerchant);

// 表单引用
const formRef = ref();

// 表单数据
const form = reactive<Partial<Merchant>>({
  id: 0,
  name: '',
  address: '',
  contactPerson: '',
  phone: '',
  email: '',
  businessLicense: '',
  status: '正常'
});

// 状态选择
const newStatus = ref<Merchant['status']>('正常');

// 上传文件列表
const fileList = ref<any[]>([]);

// 状态样式映射
const statusType = computed(() => {
  switch (merchant.value?.status) {
    case '正常': return 'success';
    case '停业': return 'danger';
    case '审核中': return 'warning';
    default: return 'info';
  }
});

// 表单验证规则
const rules = reactive({
  name: [
    { required: true, message: '请输入商家名称', trigger: 'blur' },
    { min: 2, max: 50, message: '商家名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  contactPerson: [
    { required: true, message: '请输入联系人', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的电子邮箱格式', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入商家地址', trigger: 'blur' },
    { min: 5, message: '地址长度不能少于5个字符', trigger: 'blur' }
  ]
});

// 初始化数据
const initFormData = () => {
  if (merchant.value) {
    Object.assign(form, merchant.value);
    newStatus.value = merchant.value.status;
    // 初始化营业执照图片
    if (merchant.value.businessLicense) {
      fileList.value = [{
        name: '营业执照',
        url: merchant.value.businessLicense,
        uid: merchant.value.id
      }];
    }
  }
};

// 处理状态变更
const handleStatusChange = () => {
  if (newStatus.value && merchant.value?.status !== newStatus.value) {
    ElMessageBox.confirm(
      `确定要将商家状态修改为"${newStatus.value}"吗？`,
      '状态修改确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      if (merchantStore.updateMerchantStatus(newStatus.value!)) {
        ElMessage({
          type: 'success',
          message: '状态更新成功！'
        });
      }
    }).catch(() => {
      // 取消操作，恢复原状态
      newStatus.value = merchant.value?.status || '正常';
    });
  }
};

// 处理营业执照上传
const handleLicenseUpload = (options: any) => {
  const reader = new FileReader();
  reader.readAsDataURL(options.file);
  reader.onload = (e) => {
    form.businessLicense = e.target?.result as string;
    fileList.value = [{
      name: options.file.name,
      url: e.target?.result as string,
      uid: Date.now()
    }];
    options.onSuccess();
  };
};

// 移除营业执照
const handleRemoveLicense = () => {
  form.businessLicense = '';
  fileList.value = [];
};

// 保存修改
const handleSave = () => {
  if (!formRef.value) return;
  
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      const result = merchantStore.updateMerchantInfo(form as Merchant);
      if (result) {
        // 保存成功后刷新表单数据
        initFormData();
      }
    }
  });
};

// 重置表单
const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields();
    initFormData();
  }
};

// 页面加载时初始化
onMounted(() => {
  // 确保商家信息已初始化
  merchantStore.getMerchant();
  // 初始化表单数据
  initFormData();
});
</script>

<style lang="less" scoped>
.merchant-container {
  padding: 20px;
}

.status-card {
  margin-bottom: 20px;
  .status-info {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    
    .status-label {
      font-weight: 500;
      margin-right: 10px;
    }
    
    .status-tag {
      font-size: 14px;
      padding: 4px 10px;
      margin-right: 20px;
    }
    
    .status-select {
      width: 180px;
    }
  }
  
  .time-info {
    display: flex;
    color: #6b7280;
    font-size: 13px;
    
    span {
      &:first-child {
        margin-right: 20px;
      }
    }
  }
}

.info-card {
  .merchant-form {
    margin-top: 20px;
  }
  
  .license-preview {
    margin-top: 10px;
    
    .license-img {
      max-width: 300px;
      max-height: 200px;
      border-radius: 4px;
      border: 1px solid #eee;
    }
  }
  
  .form-actions {
    margin-top: 30px;
    text-align: right;
  }
}

.upload-license {
  margin-bottom: 15px;
}
</style>