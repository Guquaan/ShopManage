<template>
      <!-- 主内容区域 -->
        <div class="content-header">
          <h2 class="content-title">商品管理</h2>
          <div class="content-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增商品
            </el-button>
          </div>
        </div>
        <!-- 搜索区域 -->
        <el-card class="search-card">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-input 
                placeholder="商品名称" 
                v-model="searchForm.name"
                clearable
              ></el-input>
            </el-col>
            <el-col :span="6">
              <el-select 
                placeholder="商品分类" 
                v-model="searchForm.category"
                clearable
              >
                <el-option label="电子产品" value="电子产品"></el-option>
                <el-option label="服装鞋帽" value="服装鞋帽"></el-option>
                <el-option label="食品饮料" value="食品饮料"></el-option>
                <el-option label="家居用品" value="家居用品‘"></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-select 
                placeholder="状态" 
                v-model="searchForm.status"
                clearable
              >
                <el-option label="在售" value="在售"></el-option>
                <el-option label="下架" value="下架"></el-option>
                <el-option label="库存不足" value="库存不足"></el-option>
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
                  <p class="stat-label">总商品数</p>
                  <h3 class="stat-value">{{ tableData.length}}</h3>
                  <p class="stat-change positive">
                    <el-icon><ArrowUp /></el-icon> 12.5% 较上月
                  </p>
                </div>
                <div class="stat-icon goods-icon">
                  <el-icon><Goods /></el-icon>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card" :body-style="{ padding: '15px' }">
              <div class="stat-content">
                <div class="stat-info">
                  <p class="stat-label">在售商品</p>
                  <h3 class="stat-value">{{ tableData.length}}</h3>
                  <p class="stat-change positive">
                    <el-icon><ArrowUp /></el-icon> 8.2% 较上月
                  </p>
                </div>
                <div class="stat-icon onsale-icon">
                  <el-icon><Box /></el-icon>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card" :body-style="{ padding: '15px' }">
              <div class="stat-content">
                <div class="stat-info">
                  <p class="stat-label">库存预警</p>
                  <h3 class="stat-value">{{ Countgoods }}</h3>
                  <p class="stat-change negative">
                    <el-icon><ArrowDown /></el-icon> 5.3% 较上月
                  </p>
                </div>
                <div class="stat-icon warning-icon">
                  <el-icon><Warning /></el-icon>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card" :body-style="{ padding: '15px' }">
              <div class="stat-content">
                <div class="stat-info">
                  <p class="stat-label">本月新增</p>
                  <h3 class="stat-value">128</h3>
                  <p class="stat-change positive">
                    <el-icon><ArrowUp /></el-icon> 23.1% 较上月
                  </p>
                </div>
                <div class="stat-icon add-icon">
                  <el-icon><ArrowUpBold /></el-icon>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <!-- 商品列表表格 -->
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
            <el-table-column prop="name" label="商品名称" min-width="180">
              <template #default="scope">
                <div class="product-info">
                  <img :src="scope.row.image" alt="商品图片" class="product-image" />
                  <span class="product-name">{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="category" label="分类" width="120" align="center"/>
            <el-table-column prop="price" label="价格" width="100" align="center">
              <template #default="scope">
                ¥{{ scope.row.price }}
              </template>
            </el-table-column>
            <el-table-column prop="stock" label="库存" width="100" align="center">
              <template #default="scope">
                <span :class="{ 'low-stock': scope.row.stock < 10 }">
                  {{ scope.row.stock }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="sales" label="销量" width="100" align="center"></el-table-column>
            <el-table-column prop="status" label="状态" width="120" align="center">
              <template #default="scope">
                <el-tag 
                  :type="scope.row.status === '在售' ? 'success' : 'info'"
                  :class="scope.row.status === '库存不足' ? 'low-stock-tag' : ''"
                >
                  {{ scope.row.status === '在售' ? '在售' : 
                     scope.row.status === '下架' ? '下架' : '库存不足' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="160" align="center"></el-table-column>
            <el-table-column label="操作" width="180" align="center">
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

      <!-- 新增或者编辑商品对话框 -->
    <el-dialog
      title="商品信息"
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
        <el-form-item label="商品ID" prop="id">
          <el-input v-model="form.id" type="number" />
        </el-form-item>
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="商品分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类">
            <el-option label="电子产品" value="电子产品"></el-option>
            <el-option label="服装鞋帽" value="服装鞋帽"></el-option>
            <el-option label="食品饮料" value="食品饮料"></el-option>
            <el-option label="家居用品" value="家居用品"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品价格" prop="price">
          <el-input v-model="form.price" type="number" />
        </el-form-item>
        <el-form-item label="库存数量" prop="stock">
          <el-input v-model="form.stock" type="number" />
        </el-form-item>
        <el-form-item label="商品状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="在售">在售</el-radio>
            <el-radio label="下架">下架</el-radio>
            <el-radio label="库存不足">库存不足</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="商品图片">
          <el-upload
            class="upload-demo"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :file-list="fileList"
            list-type="picture"
            action="fake-action"  
            :http-request="handleFakeUpload"
          >
            <el-button type="primary">点击上传</el-button>
          </el-upload>
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
   Goods, Plus,  ArrowUp, ArrowDown, Warning, ArrowUpBold, Box
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UploadUserFile } from 'element-plus'
import { GoodsManage } from '../../store/Goods';

const goodsManage = GoodsManage();
// 搜索表单
const searchForm = reactive({
  name: '',
  category: '',
  status: ''
});
const sea = reactive({
  name: '',
  category: '',
  status: ''
});

// 表格数据
interface Product {
  id: number;
  name: string;
  image: string | undefined;
  category: string;
  price: number;
  stock: number;
  sales: number;
  status: string | undefined;
  updateTime: string;
}

const tableData = ref<Product[]>([]);
const loading = ref(true);
const total = ref<number>(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 对话框状态
const dialogVisible = ref(false);
const formRef = ref();
const form = reactive<Product & { originalId?: number } >({
  id: 0,
  name: '',
  image: '',
  category: '',
  price: 0,
  stock: 0,
  sales: 0,
  status: '',
  updateTime: '',
  originalId: undefined
});

// 表单验证规则
const rules = reactive({
  id: [
    { required: true,message:'请输入商品ID', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
  ],
  stock: [
    { required: true, message: '请输入库存数量', trigger: 'blur' },
  ]
});

// 上传文件列表
const fileList = ref<UploadUserFile[]>([]);
// 控制新增还是编辑
const handleEditOrAdd = ref('add');

// 处理搜索
const handleSearch = () => {
  Object.assign(sea, { ...searchForm });
};

// 重置搜索
const resetSearch = () => {
  searchForm.name = sea.name = '';
  searchForm.category = sea.category = '';
  searchForm.status = sea.status = '';
};

// 加载表格数据，模拟生成商品数据
const loadTableData = () => {
  if(goodsManage.goods.length > 0){
    tableData.value = goodsManage.goods;
    total.value = goodsManage.goods.length;
    return;
  } else {
    goodsManage.getGoods(20);
    tableData.value = localStorage.getItem('goods') ? JSON.parse(localStorage.getItem('goods') || '') : [];
    total.value = tableData.value.length;
  }
};


// 分页处理和数据搜索处理
const searchData = computed(() => {
  let filteredData = tableData.value;
  if (sea.name) {
    filteredData = filteredData.filter(item =>
      item.name.toLowerCase().includes(sea.name.toLowerCase())
    );
  }
  if (sea.category) {
    filteredData = filteredData.filter(item =>
      item.category === sea.category
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

const currentData = computed(()=>{
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return searchData.value.slice(start, end);
})

// 统计库存量不足
const Countgoods = computed(()=>{
  return tableData.value.filter(item => item.stock < 10).length;
})

const handleSizeChange = (val:any) => {
  pageSize.value = val;
  currentPage.value = 1;
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const handleCurrentChange = (val:any) => {
  currentPage.value = val;
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

// 处理新增商品
const handleAdd = () => {
  handleEditOrAdd.value = 'add';
  // 重置表单
    if (formRef.value) {
    formRef.value.resetFields();
  }
  form.id = 0;
  form.originalId = undefined;
  fileList.value = [];
  dialogVisible.value = true;
};

// 处理编辑商品
const handleEdit = (row:any) => {
  handleEditOrAdd.value = 'edit';
  // 填充表单
  Object.assign(form, { ...row });
  form.originalId = row.id;
  fileList.value = [{
    name: `商品图片 ${row.id}`,
    url: row.image,
    uid: row.id
  }];
  dialogVisible.value = true;
};

// 处理删除商品
const handleDelete = (row:Product) => {
  ElMessageBox.confirm(
    `确定要删除商品 "${row.name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟删除操作
    goodsManage.deleteGoodsData(row)
    tableData.value = tableData.value.filter(item => item.id !== row.id);
    total.value = tableData.value.length;
    ElMessage({
      type: 'success',
      message: '删除成功!'
    });
  }).catch(() => {
    // 取消删除
    ElMessage({
      type: 'info',
      message: '已取消删除'
    });
  });
};

// 处理新增和编辑商品
const handleSave = () => {
  if(!formRef.value) return;
  formRef.value.validate((valid:boolean) => {
    if (valid) {
      if (handleEditOrAdd.value === 'edit') {
        // 编辑操作
        goodsManage.editGoodsData(form)
        const index = tableData.value.findIndex(item => item.id === form.id);
        if (index !== -1) {
          tableData.value[index] = { 
            ...form,
            updateTime: new Date().toLocaleString()
          };
        }
      } else if(handleEditOrAdd.value === 'add') {
        // 新增操作
        goodsManage.addGoodsData(form)
      }
      dialogVisible.value = false;
    }
  });
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
    form.image = e.target?.result as string;
  };
  options.onSuccess();
}
// 处理对话框关闭
const handleDialogClose = () => {
  formRef.value.resetFields();
  dialogVisible.value = false;
};

// 处理文件上传相关
const handleRemove = (file:any, fileList:any) => {
  form.image = '';
  fileList.value = fileList.value.filter((item:any) => item.uid !== file.uid);
};

const handlePreview = (file:any) => {
  window.open(file.url);
};

// 页面加载时获取数据
onMounted(() => {
  setTimeout(() => {
    loadTableData();
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

.content-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
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

.stat-change {
  font-size: 12px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 3px;
}

.positive {
  color: #10b981;
}

.negative {
  color: #ef4444;
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

.goods-icon {
  background-color: #e0f2fe;
  color: #0ea5e9;
}

.onsale-icon {
  background-color: #dcfce7;
  color: #22c55e;
}

.warning-icon {
  background-color: #fef3c7;
  color: #f59e0b;
}

.add-icon {
  background-color: #ede9fe;
  color: #8b5cf6;
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

.low-stock {
  color: #ef4444;
  font-weight: 600;
}

.low-stock-tag {
  background-color: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;
}

.pagination-container {
  margin-top: 15px;
  text-align: right;
}

.upload-demo {
  margin-top: 10px;
}
</style>