<template>
  <!-- 主内容区域 -->
  <div class="goods-container">
    <!-- 顶部操作栏 -->
    <div class="content-header">
      <h2 class="page-title">商品管理</h2>
      <div class="header-actions">
        <el-button type="danger" plain @click="handleBatchDelete" :disabled="selectedIds.length === 0">
          <el-icon><Delete /></el-icon>
          批量删除 ({{ selectedIds.length }})
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增商品
        </el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="商品名称">
          <el-input
            placeholder="请输入商品名称"
            v-model="searchForm.name"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select
            placeholder="请选择分类"
            v-model="searchForm.category"
            clearable
            style="width: 160px"
          >
            <el-option label="电子产品" value="电子产品" />
            <el-option label="服装鞋帽" value="服装鞋帽" />
            <el-option label="食品饮料" value="食品饮料" />
            <el-option label="家居用品" value="家居用品" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品状态">
          <el-select
            placeholder="请选择状态"
            v-model="searchForm.status"
            clearable
            style="width: 140px"
          >
            <el-option label="在售" value="在售" />
            <el-option label="下架" value="下架" />
            <el-option label="库存不足" value="库存不足" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card" shadow="never">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">总商品数</p>
              <h3 class="stat-value">{{ goodsManage.goods.length }}</h3>
              <p class="stat-change positive">
                <el-icon><TrendCharts /></el-icon> 实时统计
              </p>
            </div>
            <div class="stat-icon goods-icon">
              <el-icon :size="28"><Goods /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="never">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">在售商品</p>
              <h3 class="stat-value">{{ onSaleCount }}</h3>
              <p class="stat-change positive">
                <el-icon><TrendCharts /></el-icon> 占 {{ onSalePercent }}%
              </p>
            </div>
            <div class="stat-icon onsale-icon">
              <el-icon :size="28"><Sell /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="never">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">库存预警</p>
              <h3 class="stat-value">{{ lowStockCount }}</h3>
              <p class="stat-change negative">
                <el-icon><WarningFilled /></el-icon> 库存低于 10
              </p>
            </div>
            <div class="stat-icon warning-icon">
              <el-icon :size="28"><Warning /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="never">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">总库存量</p>
              <h3 class="stat-value">{{ totalStock }}</h3>
              <p class="stat-change positive">
                <el-icon><TrendCharts /></el-icon> 所有商品库存
              </p>
            </div>
            <div class="stat-icon add-icon">
              <el-icon :size="28"><Box /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 商品列表表格 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <span class="card-header-title">商品列表</span>
      </template>
      <el-table
        ref="tableRef"
        :data="currentData"
        border
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#303133', fontWeight: '600' }"
        v-loading="goodsManage.loading"
        element-loading-text="正在加载商品数据..."
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="_id" label="商品ID" width="200" align="center" show-overflow-tooltip>
          <template #default="scope">
            <span class="id-text">{{ scope.row._id || scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品信息" min-width="220">
          <template #default="scope">
            <div class="product-info">
              <img
                :src="scope.row.image || defaultImage"
                alt="商品图片"
                class="product-image"
              />
              <div class="product-detail">
                <span class="product-name">{{ scope.row.name }}</span>
                <span class="product-desc">{{ scope.row.description || '暂无描述' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="110" align="center">
          <template #default="scope">
            <el-tag size="small" type="info">{{ scope.row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="110" align="center" sortable>
          <template #default="scope">
            <span class="price-text">¥{{ Number(scope.row.price).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="90" align="center" sortable>
          <template #default="scope">
            <span :class="{ 'low-stock': scope.row.stock < 10 }">
              {{ scope.row.stock }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="90" align="center" sortable />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag
              :type="getStatusType(scope.row.status)"
              size="small"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="170" align="center">
          <template #default="scope">
            {{ formatTime(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              link
              @click="handleEdit(scope.row)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              link
              @click="handleDelete(scope.row)"
            >
              <el-icon><Delete /></el-icon>
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
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑商品对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="620px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form
        :model="form"
        label-width="100px"
        :rules="rules"
        ref="formRef"
        class="goods-form"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="商品分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择商品分类" style="width: 100%">
            <el-option label="电子产品" value="电子产品" />
            <el-option label="服装鞋帽" value="服装鞋帽" />
            <el-option label="食品饮料" value="食品饮料" />
            <el-option label="家居用品" value="家居用品" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品价格" prop="price">
              <el-input v-model="form.price" type="number" placeholder="¥ 请输入价格">
                <template #prefix>¥</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存数量" prop="stock">
              <el-input-number
                v-model="form.stock"
                :min="0"
                :max="99999"
                :step="1"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="商品状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio-button label="在售">在售</el-radio-button>
            <el-radio-button label="下架">下架</el-radio-button>
            <el-radio-button label="库存不足">库存不足</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入商品描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="商品图片">
          <el-upload
            class="goods-upload"
            :file-list="fileList"
            list-type="picture-card"
            :limit="1"
            :on-exceed="handleExceed"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleRemove"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">支持 jpg/png 格式，建议尺寸 200×200</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="saving">
            <el-icon v-if="!saving"><Check /></el-icon>
            {{ isEdit ? '保存修改' : '立即添加' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue';
import {
  Goods, Plus, Search, Refresh, Edit, Delete, Sell,
  Warning, WarningFilled, Box, TrendCharts, Check
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules, UploadFile, UploadUserFile } from 'element-plus';
import { GoodsManage, type Product } from '../../store/Goods';

// 默认图片
const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IiNjY2MiIGZvbnQtc2l6ZT0iMTQiPuWbvueJhzwvdGV4dD48L3N2Zz4=';

const goodsManage = GoodsManage();

// ========== 搜索 ==========
const searchForm = reactive({
  name: '',
  category: '',
  status: ''
});

const handleSearch = () => {
  currentPage.value = 1;
  loadTableData();
};

const resetSearch = () => {
  searchForm.name = '';
  searchForm.category = '';
  searchForm.status = '';
  currentPage.value = 1;
  loadTableData();
};

// ========== 表格 & 分页 ==========
const tableRef = ref();
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const selectedIds = ref<string[]>([]);

const currentData = computed(() => {
  const list = goodsManage.goods;
  total.value = list.length;
  const start = (currentPage.value - 1) * pageSize.value;
  return list.slice(start, start + pageSize.value);
});

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => String(item._id || item.id));
};

// ========== 统计卡片 ==========
const onSaleCount = computed(() =>
  goodsManage.goods.filter(item => item.status === '在售').length
);

const onSalePercent = computed(() => {
  if (goodsManage.goods.length === 0) return 0;
  return Math.round((onSaleCount.value / goodsManage.goods.length) * 100);
});

const lowStockCount = computed(() =>
  goodsManage.goods.filter(item => item.stock < 10).length
);

const totalStock = computed(() =>
  goodsManage.goods.reduce((sum, item) => sum + Number(item.stock), 0)
);

// ========== 状态标签类型 ==========
const getStatusType = (status: string) => {
  switch (status) {
    case '在售': return 'success';
    case '下架': return 'info';
    case '库存不足': return 'danger';
    default: return 'info';
  }
};

// ========== 时间格式化 ==========
const formatTime = (time: string) => {
  if (!time) return '-';
  try {
    return new Date(time).toLocaleString('zh-CN');
  } catch {
    return time;
  }
};

// ========== 对话框 ==========
const dialogVisible = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const formRef = ref<FormInstance>();
const editingId = ref<string>('');

const initForm = (): Product => ({
  name: '',
  image: '',
  category: '',
  price: 0,
  stock: 0,
  sales: 0,
  status: '在售',
  description: '',
  updateTime: ''
});

const form = reactive<Product>(initForm());

const rules: FormRules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存数量', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择商品状态', trigger: 'change' }
  ]
};

const dialogTitle = computed(() => (isEdit.value ? '编辑商品' : '新增商品'));

// 图片上传
const fileList = ref<UploadUserFile[]>([]);

const handleFileChange = (file: UploadFile) => {
  // 读取本地图片转 base64
  const reader = new FileReader();
  reader.readAsDataURL(file.raw as File);
  reader.onload = (e) => {
    form.image = e.target?.result as string;
    fileList.value = [{
      name: file.name,
      url: form.image
    } as UploadUserFile];
  };
};

const handleRemove = () => {
  form.image = '';
  fileList.value = [];
};

const handleExceed = () => {
  ElMessage.warning('最多只能上传一张图片，请先移除已有图片');
};

// 新增
const handleAdd = () => {
  isEdit.value = false;
  editingId.value = '';
  Object.assign(form, initForm());
  fileList.value = [];
  dialogVisible.value = true;
  // 等 DOM 更新后清除验证
  setTimeout(() => formRef.value?.clearValidate(), 0);
};

// 编辑
const handleEdit = (row: Product) => {
  isEdit.value = true;
  editingId.value = String(row._id || row.id);
  Object.assign(form, {
    ...row,
    price: Number(row.price),
    stock: Number(row.stock)
  });
  fileList.value = row.image
    ? [{ name: '商品图片', url: row.image } as UploadUserFile]
    : [];
  dialogVisible.value = true;
  setTimeout(() => formRef.value?.clearValidate(), 0);
};

// 保存
const handleSave = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    saving.value = true;
    try {
      if (isEdit.value) {
        const updateData = { ...form, _id: editingId.value };
        await goodsManage.editGoodsData(updateData);
      } else {
        await goodsManage.addGoodsData(form);
      }
      dialogVisible.value = false;
      await loadTableData();
    } catch {
      // 错误已在 store 中处理
    } finally {
      saving.value = false;
    }
  });
};

// 删除
const handleDelete = (row: Product) => {
  const id = String(row._id || row.id);
  ElMessageBox.confirm(
    `确定要删除商品「${row.name}」吗？删除后不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await goodsManage.deleteGoods(id);
      currentPage.value = 1;
    } catch {
      // 错误已在 store 中处理
    }
  }).catch(() => {
    // 取消删除
  });
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) return;
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedIds.value.length} 个商品吗？`,
    '批量删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await goodsManage.batchDeleteGoods(selectedIds.value);
      currentPage.value = 1;
      selectedIds.value = [];
    } catch {
      // 错误已在 store 中处理
    }
  }).catch(() => {
    // 取消
  });
};

// 关闭对话框
const handleDialogClose = () => {
  formRef.value?.resetFields();
  Object.assign(form, initForm());
  fileList.value = [];
};

// 加载数据
const loadTableData = async () => {
  try {
    const params: Record<string, string> = {};
    if (searchForm.name) params.name = searchForm.name;
    if (searchForm.category) params.category = searchForm.category;
    if (searchForm.status) params.status = searchForm.status;
    await goodsManage.getGoods(params);
    total.value = goodsManage.goods.length;
  } catch {
    // 错误已在 store 中处理
  }
};

onMounted(() => {
  loadTableData();
});
</script>

<style lang="scss" scoped>
.goods-container {
  padding: 4px 0;
}

// 顶部标题栏
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
    padding-left: 12px;
    border-left: 4px solid #409eff;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

// 搜索卡片
.search-card {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding: 16px 20px 0;
  }
}

// 统计卡片
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  cursor: default;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  :deep(.el-card__body) {
    padding: 18px 20px;
  }
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin: 0 0 6px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 8px 0;
  font-family: 'DIN Alternate', 'Helvetica Neue', sans-serif;
}

.stat-change {
  font-size: 12px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;

  &.positive { color: #67c23a; }
  &.negative { color: #f56c6c; }
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.goods-icon    { background: #ecf5ff; color: #409eff; }
  &.onsale-icon   { background: #e8f8e0; color: #67c23a; }
  &.warning-icon  { background: #fef0e0; color: #e6a23c; }
  &.add-icon      { background: #f0e6ff; color: #8b5cf6; }
}

// 表格卡片
.table-card {
  .card-header-title {
    font-size: 15px;
    font-weight: 600;
  }
}

// 商品信息
.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-image {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #ebeef5;
  flex-shrink: 0;
}

.product-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;

  .product-name {
    font-weight: 500;
    color: #303133;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .product-desc {
    font-size: 12px;
    color: #909399;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.id-text {
  font-size: 12px;
  color: #909399;
  font-family: monospace;
}

.price-text {
  color: #f56c6c;
  font-weight: 500;
}

.low-stock {
  color: #f56c6c;
  font-weight: 600;
}

// 分页
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

// 对话框
.goods-form {
  padding: 10px 0;
}

.goods-upload {
  :deep(.el-upload--picture-card) {
    width: 100px;
    height: 100px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
