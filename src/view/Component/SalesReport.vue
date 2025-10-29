<template>
  <div class="sales-report-charts">
    <div class="chart-container">
      <h3>销售额趋势分析</h3>
      <div ref="trendChart" class="chart-box"></div>
    </div>
    <div class="chart-container">
      <h3>商品类别销售占比</h3>
      <div ref="categoryChart" class="chart-box"></div>
    </div>
    
    <div class="chart-container">
      <h3>热销商品TOP10</h3>
      <div ref="topProductsChart" class="chart-box"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';
import { ordersManage } from '../../store/Order';
import { GoodsManage } from '../../store/Goods';

// 状态管理
const ordersmanege = ordersManage();
const goodsmange = GoodsManage();
// 图表实例引用
const trendChart = ref<HTMLElement | null>(null);
const categoryChart = ref<HTMLElement | null>(null);
const topProductsChart = ref<HTMLElement | null>(null);
// 图表对象
let trendChartInstance: ECharts | null = null;
let categoryChartInstance: ECharts | null = null;
let topProductsChartInstance: ECharts | null = null;

// 日期范围选择
const dateRange = ref<[Date, Date] | null>(null);

// 过滤后的订单数据
const filteredOrders = computed(() => {
  if (!dateRange.value) return ordersmanege.orders;
  const [start, end] = dateRange.value;
  const startDate = new Date(start);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);
  return ordersmanege.orders.filter(order => {
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
    const product = goodsmange.goods.find(g => g.name === name);
    return {
      ...product,
      sales: data.quantity,
      revenue: data.revenue,
      percentage: totalSales.value > 0 ? (data.revenue / totalSales.value) * 100 : 0
    };
  }).sort((a, b) => b.sales - a.sales);
});

// 总销售额
const totalSales = computed(() => {
  return filteredOrders.value.reduce((sum, order) => {
    return ['已付款', '已发货', '已完成'].includes(order.status) 
      ? sum + order.amount 
      : sum;
  }, 0);
});

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChart.value) return;
  // 销毁已有实例
  if (trendChartInstance) {
    trendChartInstance.dispose();
  }
  // 创建新实例
  trendChartInstance = echarts.init(trendChart.value);
  // 按日期分组统计销售额
  const dateMap: Record<string, number> = {};
  filteredOrders.value.forEach(order => {
    if (!['已付款', '已发货', '已完成'].includes(order.status)) return;
    const date = new Date(order.createTime).toLocaleDateString();
    dateMap[date] = (dateMap[date] || 0) + order.amount;
  });
  // 排序日期
  const dates = Object.keys(dateMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  // 设置图表选项
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '日期: {b}<br/>销售额: ¥{c}'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        rotate: 45,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '销售额',
        type: 'line',
        smooth: true,
        data: dates.map(date => dateMap[date]),
        itemStyle: { color: '#3b82f6' },
        lineStyle: { color: '#3b82f6' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0)' }
          ])
        }
      }
    ]
  };
  
  // 设置图表选项
  trendChartInstance.setOption(option);
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    trendChartInstance?.resize();
  });
};

// 初始化类别占比图表
const initCategoryChart = () => {
  if (!categoryChart.value) return;
  
  // 销毁已有实例
  if (categoryChartInstance) {
    categoryChartInstance.dispose();
  }
  
  // 创建新实例
  categoryChartInstance = echarts.init(categoryChart.value);
  
  // 按类别统计销售额
  const categoryMap: Record<string, number> = {};
  productSalesData.value.forEach(product => {
    if (!product.category) return;
    categoryMap[product.category] = (categoryMap[product.category] || 0) + product.revenue;
  });
  
  // 准备数据
  const data = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value
  }));
  
  // 设置图表选项
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: ¥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      top: 'center'
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
        data: data
      }
    ]
  };
  
  // 设置图表选项
  categoryChartInstance.setOption(option);
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    categoryChartInstance?.resize();
  });
};

// 初始化TOP10商品图表
const initTopProductsChart = () => {
  if (!topProductsChart.value) return;
  
  // 销毁已有实例
  if (topProductsChartInstance) {
    topProductsChartInstance.dispose();
  }
  // 创建新实例
  topProductsChartInstance = echarts.init(topProductsChart.value);
  // 获取TOP10商品
  const topProducts = productSalesData.value.slice(0, 10).reverse();
  // 设置图表选项
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '商品: {b}<br/>销售额: ¥{c}'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    yAxis: {
      type: 'category',
      data: topProducts.map(item => item.name),
      axisLabel: {
        interval: 0,
        rotate: 0
      }
    },
    series: [
      {
        name: '销售额',
        type: 'bar',
        data: topProducts.map(item => item.revenue),
        itemStyle: {
          color: function(params:any) {
            // 渐变颜色
            const colorList = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'];
            return colorList[params.dataIndex % colorList.length];
          }
        },
        label: {
          show: true,
          position: 'right',
          formatter: '¥{c}'
        }
      }
    ]
  };
  // 设置图表选项
  topProductsChartInstance.setOption(option);
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    topProductsChartInstance?.resize();
  });
};

// 页面加载时初始化
onMounted(() => {
  setTimeout(() => {
    initTrendChart();
    initCategoryChart();
    initTopProductsChart();
  }, 1000);
});
</script>

<style lang="css" scoped>
.sales-report-charts {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.chart-container {
  margin-bottom: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  padding: 16px;
}

.chart-container h3 {
  margin: 0 0 16px 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 600;
}

.chart-box {
  width: 100%;
  height: 400px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .chart-box {
    height: 300px;
  }
}
</style>