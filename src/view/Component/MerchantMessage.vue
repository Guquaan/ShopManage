<template>
  <div class="merchant-container">
        <span>最后更新：{{ merchant?.updateTime }}</span>
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
              <el-input v-model="form.address" type="textarea" />
            </el-form-item>
            <el-form-item label="营业执照">
              <img :src="form.businessLicense" width="100px" />
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
import { MerchantManage } from '../../store/Merchant';
import type { Merchant } from '../../store/Merchant';
// 引入商家存储
const merchantManage = MerchantManage();
const merchant = computed(() => merchantManage.merchant);
// 表单引用
const formRef = ref();

// 表单数据
const form = reactive<Partial<Merchant>>({
  name: '',
  address: '',
  contactPerson: '',
  phone: '',
  email: '',
  businessLicense: '',
});
// 上传文件列表
const fileList = ref<any[]>([]);


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
    // 初始化营业执照图片
    if (merchant.value.businessLicense) {
      fileList.value = [{
        url: merchant.value.businessLicense,
      }];
    }
  }
};

// 保存修改
const handleSave = () => {
  if (!formRef.value) return;
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      const result = merchantManage.updateMerchantInfo(form as Merchant);
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
  merchantManage.getMerchant();
  initFormData();
});
</script>
<style lang="less" scoped>
.merchant-container {
  padding: 20px;
}
.info-card {
  .merchant-form {
    margin-top: 20px;
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