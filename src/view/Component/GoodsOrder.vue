<template>
  <!-- 主内容区域 -->
  <div class="content-header">
    <div class="content-actions">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增订单
      </el-button>
    </div>
  </div>
  <!-- 搜索区域 -->
  <el-card class="search-card">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-input 
          placeholder="订单编号" 
          v-model="searchForm.orderNo"
          clearable
        ></el-input>
      </el-col>
      <el-col :span="6">
        <el-input 
          placeholder="商品名称" 
          v-model="searchForm.productName"
          clearable
        ></el-input>
      </el-col>
      <el-col :span="6">
        <el-select 
          placeholder="订单状态" 
          v-model="searchForm.status"
          clearable
        >
          <el-option label="待付款" value="待付款"></el-option>
          <el-option label="已付款" value="已付款"></el-option>
          <el-option label="已发货" value="已发货"></el-option>
          <el-option label="已完成" value="已完成"></el-option>
          <el-option label="已取消" value="已取消"></el-option>
        </el-select>
      </el-col>
      <el-col :span="6">
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
            <p class="stat-label">总订单数</p>
            <h3 class="stat-value">{{ orderData.length }}</h3>
          </div>
          <div class="stat-icon order-icon">
            <el-icon><Document /></el-icon>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card class="stat-card" :body-style="{ padding: '15px' }">
        <div class="stat-content">
          <div class="stat-info">
            <p class="stat-label">今日订单</p>
            <h3 class="stat-value">{{ todayOrderCount }}</h3>
          </div>
          <div class="stat-icon today-icon">
            <el-icon><Calendar /></el-icon>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card class="stat-card" :body-style="{ padding: '15px' }">
        <div class="stat-content">
          <div class="stat-info">
            <p class="stat-label">待处理订单</p>
            <h3 class="stat-value">{{ pendingOrderCount }}</h3>
          </div>
          <div class="stat-icon pending-icon">
            <el-icon><Clock /></el-icon>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card class="stat-card" :body-style="{ padding: '15px' }">
        <div class="stat-content">
          <div class="stat-info">
            <p class="stat-label">总销售额</p>
            <h3 class="stat-value">¥{{ totalSales.toFixed(2) }}</h3>
          </div>
          <div class="stat-icon sales-icon">
            <el-icon><Money /></el-icon>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
  <!-- 订单列表表格 -->
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
      <el-table-column prop="orderNo" label="订单编号" width="180" align="center"/>
      <el-table-column prop="productName" label="商品名称" min-width="180">
        <template #default="scope">
          <div class="product-info">
            <img :src="scope.row.productImage" alt="商品图片" class="product-image" />
            <span class="product-name">{{ scope.row.productName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="customerName" label="客户名称" width="120" align="center"/>
      <el-table-column prop="quantity" label="数量" width="80" align="center"/>
      <el-table-column prop="amount" label="金额" width="120" align="center">
        <template #default="scope">
          ¥{{ scope.row.amount.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120" align="center">
        <template #default="scope">
          <el-tag 
            :type="getStatusTagType(scope.row.status)"
          >
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
            :disabled="scope.row.status === '已完成' || scope.row.status === '已取消'"
          >
            编辑
          </el-button>
          <el-button 
            size="small" 
            type="success" 
            @click="handleShip(scope.row)"
            style="margin-left: 5px;"
            :disabled="scope.row.status !== '已付款'"
          >
            发货
          </el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="handleCancel(scope.row)"
            style="margin-left: 5px;"
            :disabled="['已完成', '已发货', '已取消'].includes(scope.row.status)"
          >
            取消
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
  <!-- 新增或者编辑订单对话框 -->
  <el-dialog
    title="订单信息"
    v-model="dialogVisible"
    width="60%"
    :before-close="handleDialogClose"
  >
    <el-form
      :model="form"
      label-width="100px"
      :rules="rules"
      ref="formRef"
    >
      <el-form-item label="订单ID" prop="id" v-if="handleEditOrAdd === 'edit'">
        <el-input v-model="form.id" type="number" disabled />
      </el-form-item>
      <el-form-item label="订单编号" prop="orderNo">
        <el-input v-model="form.orderNo" :disabled="handleEditOrAdd === 'edit'" />
      </el-form-item>
      <el-form-item label="商品名称" prop="productName">
        <el-select v-model="form.productName" placeholder="请选择商品" >
              <el-option v-for="item in goodsMange.goods" :label="item.name" :key="item.id" :value="item.name" 
                v-show="item.status === '在售'"
              />
        </el-select>
      </el-form-item>
      <el-form-item label="商品图片">
        <el-upload
          class="upload-demo"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :file-list="handleEditOrAdd === 'edit' ? fileList : [{url: goodsMange.goods.find(item => item.name === form.productName)?.image}]"
          list-type="picture"
          action="fake-action"  
          :http-request="handleFakeUpload"
        >
          <el-button type="primary" v-if="!fileList">点击上传</el-button>
          <template #tip>
            <div class="el-upload__tip" v-if="!fileList">
              只能上传jpg/png文件，且不超过500kb
            </div>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item label="客户名称" prop="customerName">
        <el-input v-model="form.customerName" />
      </el-form-item>
      <el-form-item label="购买数量" prop="quantity">
        <el-input v-model="form.quantity" type="number" min="1" @input="handleCount" />
      </el-form-item>
      <el-form-item label="订单金额" prop="amount">
        <el-input v-model="form.amount" type="number" :disabled="true" />
      </el-form-item>
      <el-form-item label="订单状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态">
          <el-option label="待付款" value="待付款"></el-option>
          <el-option label="已付款" value="已付款"></el-option>
          <el-option label="已发货" value="已发货"></el-option>
          <el-option label="已完成" value="已完成"></el-option>
          <el-option label="已取消" value="已取消"></el-option>
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
  Plus,  Document, Calendar, Clock, Money
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UploadUserFile } from 'element-plus'
import { GoodsMange } from '../../store/Goods';
import { ordersManage } from '../../store/Order'
// 引入商品数据用于关联
const goodsMange = GoodsMange();
const orderMange = ordersManage()
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

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  productName: '',
  status: ''
});
const sea = reactive({
  orderNo: '',
  productName: '',
  status: ''
});

// 表格数据
const orderData = ref<Order[]>([]);
const loading = ref(true);
const total = ref<number>(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 对话框状态
const dialogVisible = ref(false);
const formRef = ref();
const form = reactive<Order>({
  id: 0,
  orderNo: '',
  productName: '',
  productImage: '',
  customerName: '',
  quantity: 1,
  amount: 0,
  status: '待付款',
  createTime: ''
});

// 表单验证规则
const rules = reactive({
  orderNo: [
    { required: true, message: '请输入订单编号', trigger: 'blur' }
  ],
  productName: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  customerName: [
    { required: true, message: '请输入客户名称', trigger: 'blur' }
  ],
  quantity: [
    { required: true, message: '请输入购买数量', trigger: 'blur' },
  ],
  amount: [
    { required: true, message: '请输入订单金额', trigger: 'blur' },
  ],
  status: [
    { required: true, message: '请选择订单状态', trigger: 'change' }
  ]
});

// 上传文件列表
const fileList = ref<UploadUserFile[]>([]);

// 控制新增还是编辑
const handleEditOrAdd = ref<'add' | 'edit'>('add');

// 处理搜索
const handleSearch = () => {
  Object.assign(sea, { ...searchForm });
};

// 重置搜索
const resetSearch = () => {
  searchForm.orderNo = sea.orderNo = '';
  searchForm.productName = sea.productName = '';
  searchForm.status = sea.status = '';
};

// 加载表格数据
const loadordersData = () => {
  if (orderMange.orders.length > 0) {
    orderData.value = orderMange.orders;
    total.value = orderMange.orders.length;
    return;
  } else {
    // 确保商品数据已加载
    if (goodsMange.goods.length === 0) {
      goodsMange.getGoods(128);
    }
    // 生成模拟订单数据
    orderMange.getOrders(50)
    orderData.value = orderMange.orders;
    total.value = orderData.value.length;
  }
};

// 分页处理和数据搜索处理
const searchData = computed(() => {
  let filteredData = orderData.value;
  if (sea.orderNo) {
    filteredData = filteredData.filter(item =>
      item.orderNo.includes(sea.orderNo)
    );
  }
  if (sea.productName) {
    filteredData = filteredData.filter(item =>
      item.productName.toLowerCase().includes(sea.productName.toLowerCase())
    );
  }
  if (sea.status) {
    filteredData = filteredData.filter(item =>
      item.status === sea.status
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

// 统计今日下单数据
const todayOrderCount = computed(() => {
  const today = new Date().toLocaleDateString();
  return orderData.value.filter(item => 
    new Date(item.createTime).toLocaleDateString() === today
  ).length;
});

const pendingOrderCount = computed(() => {
  return orderData.value.filter(item => 
    ['待付款', '已付款'].includes(item.status)
  ).length;
});

const totalSales = computed(() => {
  return orderData.value.reduce((sum, item) => {
    return ['已付款', '已发货', '已完成'].includes(item.status) 
      ? sum + item.amount 
      : sum;
  }, 0);
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

// 获取状态标签类型
const getStatusTagType = (status: OrderStatus) => {
  switch (status) {
    case '待付款': return 'warning';
    case '已付款': return 'primary';
    case '已发货': return 'info';
    case '已完成': return 'success';
    case '已取消': return 'danger';
    default: return 'default';
  }
};

// 处理新增订单
const handleAdd = () => {
  handleEditOrAdd.value = 'add';
  if (formRef.value) {
    formRef.value.resetFields();
  }
  form.orderNo = `ORD${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  form.quantity = 0;
  form.amount = 0;
  form.status = '待付款';
  fileList.value = [];
  dialogVisible.value = true;
};

// 处理编辑订单
const handleEdit = (row: Order) => {
  handleEditOrAdd.value = 'edit';
  Object.assign(form, { ...row });
  fileList.value = row.productImage 
    ? [{
        name: `商品图片 ${row.id}`,
        url: row.productImage,
        uid: row.id
      }]
    : [];
  dialogVisible.value = true;
};

// 处理取消订单
const handleCancel = (row: Order) => {
  ElMessageBox.confirm(
    `确定要取消订单 "${row.orderNo}" 吗？`,
    '取消确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    if (orderMange.cancelOrders(row.id)) {
      const index = orderData.value.findIndex(item => item.id === row.id);
      if (index !== -1) {
        orderData.value[index].status = '已取消';
      }
      ElMessage({
        type: 'success',
        message: '订单已取消!'
      });
    }
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消操作'
    });
  });
};

// 处理发货
const handleShip = (row: Order) => {
  ElMessageBox.confirm(
    `确定要发货订单 "${row.orderNo}" 吗？`,
    '发货确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    if (orderMange.shipOrder(row.id)) {
      const index = orderData.value.findIndex(item => item.id === row.id);
      if (index !== -1) {
        orderData .value[index].status = '已发货';
      }
      ElMessage({
        type: 'success',
        message: '订单已发货!'
      });
    }
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消操作'
    });
  });
};

// 处理保存订单
const handleSave = () => {
  if (!formRef.value) return;
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      console.log(handleEditOrAdd.value);
      if (handleEditOrAdd.value === 'edit') {
        // 编辑操作
        orderMange.editOrders(form);
        const index = orderData.value.findIndex(item => item.id === form.id);
        if (index !== -1) {
          orderData.value[index] = { ...form };
        }
        ElMessage({
          type: 'success',
          message: '编辑成功!'
        });
      } else {
        // 新增操作
        orderMange.addOrders(form);
        ElMessage({
          type: 'success',
          message: '新增成功!'
        });
      }
      dialogVisible.value = false;
    }
  });
};

// 处理数量变化自动计算金额
const handleCount = () => {
  const selectedGoods = goodsMange.goods.find(item => item.name === form.productName);
  if (selectedGoods) {
    form.amount = selectedGoods.price * form.quantity;
  } else {
    form.amount = 0;
  }
};

// 图片上传处理
const handleFakeUpload = (options: any) => {
  const reader = new FileReader();
  reader.readAsDataURL(options.file);
  reader.onload = (e) => {
    fileList.value = [{
      name: options.file.name,
      url: e.target?.result as string,
      uid: Date.now()
    }];
    form.productImage = e.target?.result as string;
  };
  options.onSuccess();
};

// 处理对话框关闭
const handleDialogClose = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  dialogVisible.value = false;
};

// 处理文件上传相关
const handleRemove = (file: any) => {
  form.productImage = '';
  fileList.value = fileList.value.filter((item: any) => item.uid !== file.uid);
};

const handlePreview = (file: any) => {
  window.open(file.url);
};

// 页面加载时获取数据
onMounted(() => {
  setTimeout(() => {
    loadordersData();
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

.order-icon {
  background-color: #dbeafe;
  color: #3b82f6;
}

.today-icon {
  background-color: #dcfce7;
  color: #22c55e;
}

.pending-icon {
  background-color: #fef3c7;
  color: #f59e0b;
}

.sales-icon {
  background-color: #fee2e2;
  color: #ef4444;
}

.table-card {
  background-color: #ffffff;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.product-name {
  line-height: 1.5;
}

.pagination-container {
  margin-top: 15px;
  text-align: right;
}

.upload-demo {
  margin-top: 10px;
}
</style>