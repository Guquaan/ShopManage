<template>
  <div class="sales-report">
    <div class="page-header">
      <h2>销售报表分析</h2>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="handleDateChange"
      />
    </div>

    <!-- 核心指标卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card" :body-style="{ padding: '15px' }">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">总销售额</p>
              <h3 class="stat-value">¥{{ totalSales.toFixed(2) }}</h3>
              <p class="stat-change" :class="salesChange > 0 ? 'positive' : 'negative'">
                <el-icon>{{ salesChange > 0 ? '<ArrowUp />' : '<ArrowDown />' }}</el-icon>
                {{ Math.abs(salesChange).toFixed(2) }}% 较上期
              </p>
            </div>
            <div class="stat-icon sales-icon">
              <el-icon><Money /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" :body-style="{ padding: '15px' }">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">订单总数</p>
              <h3 class="stat-value">{{ totalOrders }}</h3>
              <p class="stat-change" :class="ordersChange > 0 ? 'positive' : 'negative'">
                <el-icon>{{ ordersChange > 0 ? '<ArrowUp />' : '<ArrowDown />' }}</el-icon>
                {{ Math.abs(ordersChange).toFixed(2) }}% 较上期
              </p>
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
              <p class="stat-label">平均客单价</p>
              <h3 class="stat-value">¥{{ avgOrderValue.toFixed(2) }}</h3>
              <p class="stat-change" :class="avgChange > 0 ? 'positive' : 'negative'">
                <el-icon>{{ avgChange > 0 ? '<ArrowUp />' : '<ArrowDown />' }}</el-icon>
                {{ Math.abs(avgChange).toFixed(2) }}% 较上期
              </p>
            </div>
            <div class="stat-icon avg-icon">
              <el-icon><Calculator /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" :body-style="{ padding: '15px' }">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">热销商品数</p>
              <h3 class="stat-value">{{ hotSellingCount }}</h3>
              <p class="stat-label">销量 > 100</p>
            </div>
            <div class="stat-icon hot-icon">
              <el-icon><Fire /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <div slot="header">销售额趋势</div>
          <div class="chart-container">
            <el-chart :option="salesTrendOption" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <div slot="header">商品类别销售占比</div>
          <div class="chart-container">
            <el-chart :option="categoryPieOption" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 热销商品列表 -->
    <el-card class="table-card">
      <div slot="header">热销商品TOP10</div>
      <el-table
        :data="topSellingGoods"
        border
        stripe
        :header-cell-style="{ background: '#f8fafc' }"
      >
        <el-table-column type="index" label="排名" width="80" align="center" />
        <el-table-column prop="name" label="商品名称" min-width="180">
          <template #default="scope">
            <div class="product-info">
              <img :src="scope.row.image" alt="商品图片" class="product-image" />
              <span class="product-name">{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120" align="center" />
        <el-table-column prop="sales" label="销量" width="100" align="center" />
        <el-table-column prop="revenue" label="销售额" width="120" align="center">
          <template #default="scope">
            ¥{{ scope.row.revenue.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="percentage" label="占比" width="100" align="center">
          <template #default="scope">
            {{ scope.row.percentage.toFixed(2) }}%
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { ArrowUp, ArrowDown, Money, Document,   } from '@element-plus/icons-vue';
import { ordersManage } from '../../store/Order';
import { GoodsManage } from '../../store/Goods';
import ElChart from 'element-plus';
import type { EChartsOption } from 'echarts';

// 状态管理
const orderStore = ordersManage();
const goodsStore = GoodsManage();

// 日期范围选择
const dateRange = ref<[Date, Date] | null>(null);

// 初始化数据
const initData = () => {
  // 确保有数据
  if (goodsStore.goods.length === 0) {
    goodsStore.getGoods(128);
  }
  if (orderStore.orders.length === 0) {
    orderStore.getOrders(50);
  }
};

// 过滤后的订单数据
const filteredOrders = computed(() => {
  if (!dateRange.value) return orderStore.orders;
  const [start, end] = dateRange.value;
  const startDate = new Date(start);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);
  return orderStore.orders.filter(order => {
    const orderDate = new Date(order.createTime);
    return orderDate >= startDate && orderDate <= endDate;
  });
});

// 计算核心指标
const totalSales = computed(() => {
  return filteredOrders.value.reduce((sum, order) => {
    return ['已付款', '已发货', '已完成'].includes(order.status) 
      ? sum + order.amount 
      : sum;
  }, 0);
});

const totalOrders = computed(() => filteredOrders.value.length);

const avgOrderValue = computed(() => {
  if (totalOrders.value === 0) return 0;
  return totalSales.value / totalOrders.value;
});

// 热销商品统计
const productSalesData = computed(() => {
  // 按商品名称统计销量和销售额
  const salesMap: Record<string, { quantity: number; revenue: number }> = {};
  filteredOrders.value.forEach(order => {
    if (!['已付款', '已发货', '已完成'].includes(order.status)) return;
    if (!salesMap[order.productName]) {
      salesMap[order.productName] = { quantity: 0, revenue: 0 };
    }
    salesMap[order.productName]!.quantity += order.quantity;
    salesMap[order.productName]!.revenue += order.amount;
  });
  // 转换为数组并关联商品信息
  return Object.entries(salesMap).map(([name, data]) => {
    const product = goodsStore.goods.find(g => g.name === name);
    return {
      ...product,
      sales: data.quantity,
      revenue: data.revenue,
      percentage: totalSales.value > 0 ? (data.revenue / totalSales.value) * 100 : 0
    };
  }).sort((a, b) => b.sales - a.sales);
});

const topSellingGoods = computed(() => productSalesData.value.slice(0, 10));
const hotSellingCount = computed(() => productSalesData.value.filter(item => item.sales > 100).length);

// 趋势分析（简化版，实际项目中可能需要更复杂的时间维度处理）
const salesTrendOption = computed<EChartsOption>(() => {
  // 按日期分组统计销售额
  const dateMap: Record<string, number> = {};
  
  filteredOrders.value.forEach(order => {
    if (!['已付款', '已发货', '已完成'].includes(order.status)) return;
    
    const date = new Date(order.createTime).toLocaleDateString();
    dateMap[date] = (dateMap[date] || 0) + order.amount;
  });
  
  // 排序日期
  const dates = Object.keys(dateMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
  return {
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        data: dates.map(date => dateMap[date]),
        type: 'line',
        smooth: true,
        itemStyle: { color: '#3b82f6' },
        lineStyle: { color: '#3b82f6' }
      }
    ]
  };
});

// 类别占比分析
const categoryPieOption = computed<EChartsOption>(() => {
  // 按类别统计销售额
  const categoryMap: Record<string, number> = {};
  
  productSalesData.value.forEach(product => {
    if (!product.category) return;
    categoryMap[product.category] = (categoryMap[product.category] || 0) + product.revenue;
  });
  
  return {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 10
    },
    series: [
      {
        name: '销售额',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: Object.entries(categoryMap).map(([name, value]) => ({
          name,
          value,
          label: { show: true }
        }))
      }
    ]
  };
});

// 同比变化（简化计算，实际项目中需要对比上期同期数据）
const salesChange = ref(5.8);
const ordersChange = ref(-2.3);
const avgChange = ref(8.1);

// 日期范围变化处理
const handleDateChange = () => {
  // 实际项目中可以在这里重新计算同比变化
};

// 页面加载时初始化
onMounted(() => {
  initData();
});
</script>

<style lang="css" scoped>
.sales-report {
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

.stats-row {
  margin-bottom: 20px;
}

.charts-row {
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

.sales-icon {
  background-color: #fee2e2;
  color: #ef4444;
}

.order-icon {
  background-color: #dbeafe;
  color: #3b82f6;
}

.avg-icon {
  background-color: #dcfce7;
  color: #22c55e;
}

.hot-icon {
  background-color: #fef3c7;
  color: #f59e0b;
}

.chart-card {
  height: 350px;
}

.chart-container {
  width: 100%;
  height: calc(100% - 40px);
}

.table-card {
  margin-top: 20px;
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
</style>