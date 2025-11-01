<template>
  <div class="system-settings">
    <el-card class="settings-card">
      <div class="settings-header">
        <h2>系统设置</h2>
        <p>自定义您的系统偏好设置</p>
      </div>

      <!-- 语言设置区域 -->
      <el-form-item label="语言设置" class="setting-item">
        <el-select 
          v-model="currentLanguage" 
          placeholder="选择语言"
          @change="handleLanguageChange"
        >
          <el-option label="简体中文" value="zh-CN"></el-option>
          <el-option label="English" value="en-US"></el-option>
        </el-select>
        <p class="setting-desc">切换系统显示语言，设置将立即生效</p>
      </el-form-item>

      <el-divider />

      <!-- 账户管理区域 -->
      <div class="account-management">
        <h3>账户管理</h3>
        
        <el-descriptions column="1" border>
          <el-descriptions-item label="当前登录用户">
            {{ currentUser?.username || '未登录' }}
          </el-descriptions-item>
          <el-descriptions-item label="最后登录时间">
            {{ currentUser?.lastLogin ? formatDate(currentUser.lastLogin) : '无记录' }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="account-actions">
          <el-button 
            type="danger" 
            @click="handleAccountDeletion"
            :disabled="!currentUser"
          >
            <el-icon><Delete /></el-icon>
            注销当前账户
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useLoginManage } from '../../store/Login';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

// 初始化登录管理
const loginStore = useLoginManage();
const router = useRouter();

// 语言设置
const currentLanguage = ref(localStorage.getItem('systemLanguage') || 'zh-CN');

// 获取当前用户信息
const currentUser = computed(() => loginStore.currentAccount);

// 处理语言切换
const handleLanguageChange = (lang: string) => {
  localStorage.setItem('systemLanguage', lang);
  ElMessage.success({
    message: lang === 'zh-CN' ? '语言已切换为简体中文' : 'Language switched to English',
    duration: 1500
  });
  
  // 实际项目中这里会触发全局语言切换
  // i18n.global.locale.value = lang;
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(currentLanguage.value, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// 处理账户注销
const handleAccountDeletion = () => {
  if (!currentUser.value) return;

  const message = currentLanguage.value === 'zh-CN' 
    ? `确定要注销账户 "${currentUser.value.username}" 吗？此操作不可恢复！`
    : `Are you sure you want to delete account "${currentUser.value.username}"? This action cannot be undone!`;

  ElMessageBox.confirm(
    message,
    currentLanguage.value === 'zh-CN' ? '确认注销' : 'Confirm Deletion',
    {
      confirmButtonText: currentLanguage.value === 'zh-CN' ? '确认' : 'Confirm',
      cancelButtonText: currentLanguage.value === 'zh-CN' ? '取消' : 'Cancel',
      type: 'danger'
    }
  ).then(() => {
    if (currentUser.value?.id) {
      // 删除当前账户
      loginStore.removeAccount(currentUser.value.id);
      // 退出登录
      loginStore.logout();
      
      ElMessage.success({
        message: currentLanguage.value === 'zh-CN' ? '账户已成功注销' : 'Account has been deleted successfully',
        duration: 2000
      });
      
      // 跳转到登录页
      router.push('/login');
    }
  }).catch(() => {
    ElMessage.info({
      message: currentLanguage.value === 'zh-CN' ? '已取消注销操作' : 'Deletion cancelled',
      duration: 1500
    });
  });
};

// 页面加载时读取保存的语言设置
onMounted(() => {
  const savedLang = localStorage.getItem('systemLanguage');
  if (savedLang) {
    currentLanguage.value = savedLang;
  }
});
</script>

<style scoped>
.system-settings {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.settings-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.settings-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.settings-header h2 {
  margin: 0 0 10px 0;
  color: #1e293b;
  font-size: 20px;
}

.settings-header p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.setting-item {
  margin-bottom: 25px;
}

.setting-desc {
  margin-top: 8px;
  color: #64748b;
  font-size: 13px;
  margin-left: 120px; /* 与label对齐 */
}

.account-management {
  margin-top: 20px;
}

.account-management h3 {
  margin: 0 0 15px 0;
  color: #1e293b;
  font-size: 16px;
}

.account-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>