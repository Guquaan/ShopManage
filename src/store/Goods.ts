import { defineStore } from 'pinia'
import image1 from './../data/photo/笔记本.png'
import image2 from './../data/photo/手机.png'
import image3 from './../data/photo/手表.png'
import image4 from './../data/photo/耳机.png'
import food1 from './../data/photo/食物1.png'
import food2 from './../data/photo/食物2.png'
import food3 from './../data/photo/食物3.png'
import food4 from './../data/photo/食物4.png'
import clothing1 from './../data/photo/衣服1.png'
import clothing2 from './../data/photo/衣服2.png'
import clothing3 from './../data/photo/衣服3.png'
import clothing4 from './../data/photo/衣服4.png'
import home1 from './../data/photo/家具1.png'
import home2 from './../data/photo/家具2.png'
import home3 from './../data/photo/家具3.png'
import home4 from './../data/photo/家具4.png'
import { ElMessage } from 'element-plus'
import { getRandomFourDigits } from '../data/Random'
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

export const GoodsManage = defineStore('goodsmange', {
    // 数据状态
    state: (): { goods: Product[] } => ({
        goods: localStorage.getItem('goods') ? JSON.parse(localStorage.getItem('goods')!) : []
    }),

    // 实现方法
    actions: {
        // 获取虚拟数据的函数
        getGoods(total: number) {
            // 模拟数据
            // 产品类别
            const categories = ['电子产品', '服装鞋帽', '食品饮料', '家居用品']
            const photoPathEle = [image1, image2, image3, image4];
            const photoPathFood = [food1, food2, food3, food4];
            const photoPathClothing = [clothing1, clothing2, clothing3, clothing4];
            const photoPathHome = [home1, home2, home3, home4];
            // 库存状态
            const statuses = ['在售', '下架', '库存不足'];
            const goods = Array.from({ length: total }, ( _ ) => {
                const id = getRandomFourDigits();
                const stock = Math.floor(Math.random() * 100);  // 商品库存数量
                const status = stock < 10 ? '库存不足' : (statuses[Math.floor(Math.random() * 2)] || '在售');  // 库存状态
                const category = String(categories[Math.floor(Math.random() * categories.length)]);
                const image = category === '电子产品' ? photoPathEle[Math.floor(Math.random() * photoPathEle.length)]
                    : category === '食品饮料' ? photoPathFood[Math.floor(Math.random() * photoPathFood.length)]
                        : category === '服装鞋帽' ? photoPathClothing[Math.floor(Math.random() * photoPathClothing.length)]
                            : photoPathHome[Math.floor(Math.random() * photoPathHome.length)];
                return {
                    id,
                    name: `商品名称${id}`,
                    image: String(image),
                    category: category,
                    price: Math.floor(Math.random() * 900) + 100,
                    stock,
                    sales: Math.floor(Math.random() * 1000),
                    status,
                    updateTime: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleString()
                };
            });
            localStorage.setItem('goods', JSON.stringify(goods))
        },

        // 持久性删除数据
        deleteGoodsData(row: Product) {
            this.goods = this.goods.filter((item: any) => item.id !== row.id)
            localStorage.setItem('goods', JSON.stringify(this.goods))

        },
        // 修改数据
        editGoodsData(form: any) {
            if (this.goods) {
                const index = this.goods.findIndex((item: any) => item.id === form.originalId);
                if (index !== -1) {
                    this.goods[index] = {
                        ...this.goods[index],
                        ...form,
                        id: form.id,
                        price: Number(form.price),
                        stock: Number(form.stock),
                        updateTime: new Date().toLocaleString(),
                        category: form.category,
                        image: form.image || this.goods[index]?.image,
                        sales: this.goods[index]?.sales ?? 0
                    };
                    localStorage.setItem('goods', JSON.stringify(this.goods))
                }
                ElMessage({
                    type: 'success',
                    message: '编辑成功!'
                });
            }
        },
        // 新增数据
        addGoodsData(form: Product) {
            this.goods.unshift({
                ...form,
                updateTime: new Date().toLocaleString(),
                category: form.category,
            });
            ElMessage({
                type: 'success',
                message: '新增成功!'
            });
            localStorage.setItem('goods', JSON.stringify(this.goods))
        },

        // 根据订单改变库存
        handleStock(name: string, count: number) {
            const index = this.goods.findIndex((item: Product) => item.name === name)
            console.log(index, name)
            if (index !== -1) {
                this.goods[index]!.stock = this.goods[index]!.stock - count
                this.goods[index]!.sales = this.goods[index]!.sales + count
                if (this.goods[index]!.stock < 10) {
                    this.goods[index]!.status = '库存不足'
                }
                localStorage.setItem('goods', JSON.stringify(this.goods))
            }
        },
        // 更新库存并保存到本地存储
        updateGoodsStock(goods: Product) {
            // 定义防抖计时器变量，防止添加减少的时候出现信息弹出频繁
            let messageTimer: any = null;
            const showSuccessMessage = () => {
                if (messageTimer) {
                    clearTimeout(messageTimer);
                }
                messageTimer = setTimeout(() => {
                    ElMessage({
                        type: 'success',
                        message: '库存已更新'
                    });
                    messageTimer = null;
                }, 500);
            };
            const index = this.goods.findIndex((item: Product) => item.id === goods.id);
            if (index !== -1) {
                this.goods[index]!.stock = goods.stock;
                // 更新库存状态
                this.goods[index]!.status = goods.stock < 10 ? '库存不足' : '在售';
                // 持久化保存
                localStorage.setItem('goods', JSON.stringify(this.goods));
                showSuccessMessage();
            }
        }
    }
})