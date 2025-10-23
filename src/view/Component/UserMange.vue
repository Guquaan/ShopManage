<template>
  <!-- 主内容区域 -->
  <div class="content-header">
    <div class="content-actions">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增用户
      </el-button>
    </div>
  </div>

  <!-- 搜索区域 -->
  <el-card class="search-card">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-input 
          placeholder="用户名" 
          v-model="searchForm.username"
          clearable
        ></el-input>
      </el-col>
      <el-col :span="6">
        <el-input 
          placeholder="真实姓名" 
          v-model="searchForm.realName"
          clearable
        ></el-input>
      </el-col>
      <el-col :span="6">
        <el-select 
          placeholder="用户状态" 
          v-model="searchForm.status"
          clearable
        >
          <el-option label="正常" value="正常"></el-option>
          <el-option label="禁用" value="禁用"></el-option>
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-select 
          placeholder="用户角色" 
          v-model="searchForm.role"
          clearable
        >
          <el-option label="管理员" value="管理员"></el-option>
          <el-option label="普通用户" value="普通用户"></el-option>
        </el-select>
      </el-col>
      <el-col :span="6" :offset="18">
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch" style="margin-left: 10px;">重置</el-button>
      </el-col>
    </el-row>
  </el-card>

  <!-- 数据统计卡片 -->
  <el-row :gutter="20" class="stats-row">
    <el-col :span="6">
      <el-card class="stat-card" :body-style="{ padding: '15px' }">
        <div class="stat-content">
          <div class="stat-info">
            <p class="stat-label">总用户数</p>
            <h3 class="stat-value">{{ userData.length }}</h3>
          </div>
          <div class="stat-icon user-icon">
            <el-icon><User /></el-icon>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card class="stat-card" :body-style="{ padding: '15px' }">
        <div class="stat-content">
          <div class="stat-info">
            <p class="stat-label">管理员</p>
            <h3 class="stat-value">{{ adminCount }}</h3>
          </div>
          <div class="stat-icon admin-icon">
            <el-icon><Key /></el-icon>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card class="stat-card" :body-style="{ padding: '15px' }">
        <div class="stat-content">
          <div class="stat-info">
            <p class="stat-label">正常用户</p>
            <h3 class="stat-value">{{ activeUserCount }}</h3>
          </div>
          <div class="stat-icon active-icon">
            <el-icon><CheckCircle /></el-icon>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card class="stat-card" :body-style="{ padding: '15px' }">
        <div class="stat-content">
          <div class="stat-info">
            <p class="stat-label">禁用用户</p>
            <h3 class="stat-value">{{ disabledUserCount }}</h3>
          </div>
          <div class="stat-icon disabled-icon">
            <el-icon><CloseCircle /></el-icon>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>

  <!-- 用户列表表格 -->
  <el-card class="table-card">
    <el-table
      :data="currentData"
      border
      stripe
      :header-cell-style="{ background: '#f8fafc' }"
      v-loading="loading"
      element-loading-text="加载中..."
    >
      <el-table-column prop="id" label="ID" width="80" align="center"/>
      <el-table-column prop="username" label="用户名" width="120" align="center"/>
      <el-table-column prop="realName" label="真实姓名" width="120" align="center"/>
      <el-table-column prop="phone" label="手机号码" width="140" align="center"/>
      <el-table-column prop="email" label="邮箱" min-width="180"/>
      <el-table-column prop="role" label="角色" width="120" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.role === '管理员' ? 'primary' : 'info'">
            {{ scope.row.role }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160" align="center"></el-table-column>
      <el-table-column label="操作" width="220" align="center">
        <template #default="scope">
          <el-button 
            size="small" 
            type="primary" 
            @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button 
            size="small" 
            :type="scope.row.status === '正常' ? 'warning' : 'success'" 
            @click="handleChangeStatus(scope.row)"
            style="margin-left: 5px;"
          >
            {{ scope.row.status === '正常' ? '禁用' : '启用' }}
          </el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="handleDelete(scope.row)"
            style="margin-left: 5px;"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </el-card>

  <!-- 新增或者编辑用户对话框 -->
  <el-dialog
    title="用户信息"
    v-model="dialogVisible"
    width="50%"
    :before-close="handleDialogClose"
  >
    <el-form
      :model="form"
      label-width="100px"
      :rules="rules"
      ref="formRef"
    >
      <el-form-item label="用户ID" prop="id" v-if="handleEditOrAdd === 'edit'">
        <el-input v-model="form.id" type="number" disabled />
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" :disabled="handleEditOrAdd === 'edit'" />
      </el-form-item>
      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="form.realName" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phone">
        <el-input v-model="form.phone" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" />
      </el-form-item>
      <el-form-item label="用户角色" prop="role">
        <el-select v-model="form.role" placeholder="请选择角色">
          <el-option label="管理员" value="管理员"></el-option>
          <el-option label="普通用户" value="普通用户"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="用户状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态">
          <el-option label="正常" value="正常"></el-option>
          <el-option label="禁用" value="禁用"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { 
  Plus, User, Key
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { userManage } from '../../store/User';

// 引入用户存储
const userStore = userManage();

// 用户状态类型定义
type UserStatus = '正常' | '禁用';

// 用户接口定义
interface User {
  id: number;
  username: string;
  realName: string;
  phone: string;
  email: string;
  role: '管理员' | '普通用户';
  status: UserStatus;
  createTime: string;
  updateTime?: string;
}

// 搜索表单
const searchForm = reactive({
  username: '',
  realName: '',
  status: '',
  role: ''
});
const sea = reactive({ ...searchForm });

// 表格数据
const userData = ref<User[]>([]);
const loading = ref(true);
const total = ref<number>(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 对话框状态
const dialogVisible = ref(false);
const formRef = ref();
const form = reactive<User>({
  id: 0,
  username: '',
  realName: '',
  phone: '',
  email: '',
  role: '普通用户',
  status: '正常',
  createTime: ''
});

// 表单验证规则
const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] }
  ],
  role: [
    { required: true, message: '请选择用户角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择用户状态', trigger: 'change' }
  ]
});

// 控制新增还是编辑
const handleEditOrAdd = ref<'add' | 'edit'>('add');

// 处理搜索
const handleSearch = () => {
  Object.assign(sea, { ...searchForm });
};

// 重置搜索
const resetSearch = () => {
  searchForm.username = sea.username = '';
  searchForm.realName = sea.realName = '';
  searchForm.status = sea.status = '';
  searchForm.role = sea.role = '';
};

// 加载表格数据
const loadUserData = () => {
  if (userStore.users.length > 0) {
    userData.value = userStore.users;
    total.value = userStore.users.length;
    return;
  } else {
    // 生成模拟用户数据
    userStore.getUsers(50)
    userData.value = userStore.users;
    total.value = userData.value.length;
  }
};

// 分页处理和数据搜索处理
const searchData = computed(() => {
  let filteredData = userData.value;
  if (sea.username) {
    filteredData = filteredData.filter(item =>
      item.username.includes(sea.username)
    );
  }
  if (sea.realName) {
    filteredData = filteredData.filter(item =>
      item.realName.includes(sea.realName)
    );
  }
  if (sea.status) {
    filteredData = filteredData.filter(item =>
      item.status === sea.status
    );
  }
  if (sea.role) {
    filteredData = filteredData.filter(item =>
      item.role === sea.role
    );
  }
  total.value = filteredData.length;
  return filteredData;
});

const currentData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return searchData.value.slice(start, end);
});

// 统计数据
const adminCount = computed(() => {
  return userData.value.filter(item => item.role === '管理员').length;
});

const activeUserCount = computed(() => {
  return userData.value.filter(item => item.status === '正常').length;
});

const disabledUserCount = computed(() => {
  return userData.value.filter(item => item.status === '禁用').length;
});

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

// 处理新增用户
const handleAdd = () => {
  handleEditOrAdd.value = 'add';
  if (formRef.value) {
    formRef.value.resetFields();
  }
  form.username = '';
  form.realName = '';
  form.phone = '';
  form.email = '';
  form.role = '普通用户';
  form.status = '正常';
  dialogVisible.value = true;
};

// 处理编辑用户
const handleEdit = (row: User) => {
  handleEditOrAdd.value = 'edit';
  Object.assign(form, { ...row });
  dialogVisible.value = true;
};

// 处理更改用户状态
const handleChangeStatus = (row: User) => {
  const newStatus = row.status === '正常' ? '禁用' : '正常';
  const message = row.status === '正常' ? '禁用' : '启用';
  
  ElMessageBox.confirm(
    `确定要${message}用户 "${row.username}" 吗？`,
    '状态确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    if (userStore.changeUserStatus(row.id, newStatus)) {
      const index = userData.value.findIndex(item => item.id === row.id);
      if (index !== -1) {
        userData.value[index].status = newStatus;
      }
      ElMessage({
        type: 'success',
        message: `用户已${message}!`
      });
    }
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消操作'
    });
  });
};

// 处理删除用户
const handleDelete = (row: User) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${row.username}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    if (userStore.deleteUser(row.id)) {
      userData.value = userData.value.filter(item => item.id !== row.id);
      ElMessage({
        type: 'success',
        message: '用户已删除!'
      });
    }
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消操作'
    });
  });
};

// 处理保存用户
const handleSave = () => {
  if (!formRef.value) return;
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      if (handleEditOrAdd.value === 'edit') {
        // 编辑操作
        userStore.editUser(form);
        const index = userData.value.findIndex(item => item.id === form.id);
        if (index !== -1) {
          userData.value[index] = { ...form };
        }
        ElMessage({
          type: 'success',
          message: '编辑成功!'
        });
      } else {
        // 新增操作
        userStore.addUser(form);
        ElMessage({
          type: 'success',
          message: '新增成功!'
        });
      }
      dialogVisible.value = false;
    }
  });
};

// 处理对话框关闭
const handleDialogClose = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  dialogVisible.value = false;
};

// 页面加载时获取数据
onMounted(() => {
  setTimeout(() => {
    loadUserData();
    loading.value = false;
  }, 800);
});
</script>

<style lang="css" scoped>
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.content-actions {
  display: flex;
  gap: 10px;
}

.search-card {
  margin-bottom: 20px;
  background-color: #ffffff;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 5px 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 5px 0;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.user-icon {
  background-color: #dbeafe;
  color: #3b82f6;
}

.admin-icon {
  background-color: #e0e7ff;
  color: #6366f1;
}

.active-icon {
  background-color: #dcfce7;
  color: #22c55e;
}

.disabled-icon {
  background-color: #fee2e2;
  color: #ef4444;
}

.table-card {
  background-color: #ffffff;
}

.pagination-container {
  margin-top: 15px;
  text-align: right;
}
</style>