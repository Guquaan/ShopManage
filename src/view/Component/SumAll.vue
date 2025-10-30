<template>
  <div class="comprehensive-report">
    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <!-- 销售趋势图 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <div slot="header">销售额趋势</div>
          <div class="chart-container">
            <el-chart :option="salesTrendOption" />
          </div>
        </el-card>
      </el-col>
      
      <!-- 商品类别占比图 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <div slot="header">商品类别销售占比</div>
          <div class="chart-container">
            <el-chart :option="categoryPieOption" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <!-- 用户购买分布 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <div slot="header">用户购买分布</div>
          <div class="chart-container">
            <el-chart :option="userPurchaseOption" />
          </div>
        </el-card>
      </el-col>
      
      <!-- 订单状态分布 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <div slot="header">订单状态分布</div>
          <div class="chart-container">
            <el-chart :option="orderStatusOption" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { ordersManage } from '../../store/Order';
import { GoodsManage } from '../../store/Goods';
import { UserManage } from '../../store/User';
import ElChart from 'element-plus';
import type { EChartsOption } from 'echarts';

// 状态管理
const orderStore = ordersManage();
const goodsStore = GoodsManage();
const userStore = UserManage();

// 日期范围选择
const dateRange = ref<[Date, Date] | null>(null);

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

// 商品销售数据
const productSalesData = computed(() => {
  const salesMap: Record<string, { quantity: number; revenue: number }> = {};
  
  filteredOrders.value.forEach(order => {
    if (!['已付款', '已发货', '已完成'].includes(order.status)) return;
    
    if (!salesMap[order.productName]) {
      salesMap[order.productName] = { quantity: 0, revenue: 0 };
    }
    salesMap[order.productName]!.quantity += order.quantity;
    salesMap[order.productName]!.revenue += order.amount;
  });
  
  return Object.entries(salesMap).map(([name, data]) => {
    const product = goodsStore.goods.find(g => g.name === name);
    return {
      ...product,
      sales: data.quantity,
      revenue: data.revenue
    };
  }).sort((a, b) => b.sales - a.sales);
});


// 用户购买数据
const userPurchaseData = computed(() => {
  const userMap: Record<string, { orderCount: number; totalSpent: number }> = {};
  filteredOrders.value.forEach(order => {
    if (!['已付款', '已发货', '已完成'].includes(order.status)) return;
    if (!userMap[order.customerName]) {
      userMap[order.customerName] = { orderCount: 0, totalSpent: 0 };
    }
    userMap[order.customerName]!.orderCount += 1;
    userMap[order.customerName]!.totalSpent += order.amount;
  });
  
  return Object.entries(userMap).map(([name, data]) => {
    const user = userStore.users.find(u => u.username === name);
    return {
      ...user,
      username: name,
      orderCount: data.orderCount,
      totalSpent: data.totalSpent,
      avgOrderValue: data.orderCount > 0 ? data.totalSpent / data.orderCount : 0
    };
  }).sort((a, b) => b.totalSpent - a.totalSpent);
});
// 销售额趋势图
const salesTrendOption = computed<EChartsOption>(() => {
  const dateMap: Record<string, number> = {};
  filteredOrders.value.forEach(order => {
    if (!['已付款', '已发货', '已完成'].includes(order.status)) return;
    
    const date = new Date(order.createTime).toLocaleDateString();
    dateMap[date] = (dateMap[date] || 0) + order.amount;
  });
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

// 商品类别占比图
const categoryPieOption = computed<EChartsOption>(() => {
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
          value
        }))
      }
    ]
  };
});
// 用户购买分布图
const userPurchaseOption = computed<EChartsOption>(() => {
  const topUsers = userPurchaseData.value.slice(0, 8);
  return {
    xAxis: {
      type: 'category',
      data: topUsers.map(u => u.username)
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        data: topUsers.map(u => u.totalSpent),
        type: 'bar',
        itemStyle: { color: '#10b981' }
      }
    ]
  };
});
// 订单状态分布图
const orderStatusOption = computed<EChartsOption>(() => {
  const statusMap: Record<string, number> = {
    '待付款': 0,
    '已付款': 0,
    '已发货': 0,
    '已完成': 0,
    '已取消': 0
  };
  
  filteredOrders.value.forEach(order => {
    statusMap[order.status]!++;
  })
  return {
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: '70%',
        data: Object.entries(statusMap).map(([name, value]) => ({
          name,
          value
        })).filter(item => item.value > 0)
      }
    ]
  };
});
// 页面加载时初始化
onMounted(() => {
  
});
</script>

<style lang="css" scoped>
.comprehensive-report {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.chart-card {
  height: 350px;
}

.chart-container {
  width: 100%;
  height: calc(100% - 40px);
}

.table-card {
  min-height: 400px;
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