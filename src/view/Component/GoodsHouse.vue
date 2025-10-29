<template>
  <div class="warehouse-view">
    <div class="page-header">
      <el-button type="primary" @click="navToManagement">
        <el-icon><Setting /></el-icon> 商品管理
      </el-button>
    </div>
    <el-card class="filter-card">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input 
            placeholder="搜索商品名称" 
            v-model="searchName" 
            clearable 
            :prefix-icon="Search"
          />
        </el-col>
        <el-col :span="12">
          <el-select 
            placeholder="筛选分类" 
            v-model="selectedCategory" 
            clearable
          >
            <el-option label="全部" value=""></el-option>
            <el-option label="电子产品" value="电子产品"></el-option>
            <el-option label="服装鞋帽" value="服装鞋帽"></el-option>
            <el-option label="食品饮料" value="食品饮料"></el-option>
            <el-option label="家居用品" value="家居用品"></el-option>
          </el-select>
        </el-col>
      </el-row>
    </el-card>
    <!-- 商品卡片 -->
    <div class="goods-grid">
      <el-card 
        v-for="goods in filteredGoods" 
        :key="goods.id" 
        class="goods-card"
      >
        <div class="goods-image-wrapper">
          <img 
            :src="goods.image" 
            :alt="goods.name" 
            class="goods-image"
          />
          <el-tag 
            v-if="goods.stock < 10" 
            class="stock-warning-tag"
          >
            库存不足
          </el-tag>
        </div>
        
        <!-- 商品信息区域 -->
        <div class="goods-info">
          <h3 class="goods-name">{{ goods.name }}</h3>
          <p class="goods-category">{{ goods.category }}</p>
          
          <!-- 库存控制区域 -->
          <div class="stock-control">
            <span class="stock-label">库存量:</span>
            <el-button 
              size="small" 
              type="primary" 
              @click="decreaseStock(goods)"
              :disabled="goods.stock <= 0"
            ><el-icon><Minus/></el-icon></el-button>
            <span class="stock-value"><el-input v-model="goods.stock" size="small" min="0" @input="goodsStore.updateGoodsStock(goods)"/></span>
            <el-button 
              size="small" 
              type="primary" 
              @click="increaseStock(goods)"
            ><el-icon><Plus/></el-icon></el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredGoods.length === 0" class="empty-state">
      <el-empty description="没有找到匹配的商品" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Setting, Plus, Search, Minus } from '@element-plus/icons-vue';
import { GoodsManage } from '../../store/Goods';

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
const goodsStore = GoodsManage();

// 状态管理
const searchName = ref('');
const selectedCategory = ref('');

// 加载商品数据
const loadGoodsData = () => {
  if (goodsStore.goods.length === 0) {
    // 如果没有数据，初始化一些示例数据
    goodsStore.getGoods(20);
  }
};

// 库存控制方法
const decreaseStock = (goods: any) => {
  if (goods.stock > 0) {
    goods.stock--;
    // 更新状态并持久化
    goodsStore.updateGoodsStock(goods as Product);
  }
};

const increaseStock = (goods: any) => {
  goods.stock++;
  // 更新状态并持久化
  goodsStore.updateGoodsStock(goods as Product);
};

// 筛选商品
const filteredGoods = computed(() => {
  return goodsStore.goods.filter((goods: any) => {
    const matchesName = goods.name.toLowerCase().includes(searchName.value.toLowerCase());
    const matchesCategory = selectedCategory.value ? goods.category === selectedCategory.value : true;
    return matchesName && matchesCategory;
  });
});

// 导航到管理页面
const navToManagement = () => {
  ElMessage({
    type: 'info',
    message: '导航到商品管理页面'
  });
};

// 页面加载时初始化数据
onMounted(() => {
  loadGoodsData();
});
</script>

<style lang="css" scoped>
.warehouse-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-card {
  margin-bottom: 20px;
  padding: 15px;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.goods-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.goods-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.goods-image-wrapper {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.goods-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.goods-card:hover .goods-image {
  transform: scale(1.05);
}

.stock-warning-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #f56c6c;
  color: white;
}

.goods-info {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.goods-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 10px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goods-category {
  color: #666;
  font-size: 14px;
  margin: 0 0 15px 0;
}

.stock-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
}

.stock-label {
  font-size: 14px;
  color: #333;
}

.stock-value {
  min-width: 40px;
  text-align: center;
  font-weight: 500;
}

.empty-state {
  margin: 50px 0;
  text-align: center;
}
</style>