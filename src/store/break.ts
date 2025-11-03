// 用于生成面包屑的方法
import { defineStore } from "pinia";


export const breakMenu = defineStore('breakMenu',{
    state:()=>({
        menu:['商品管理'],
    }),


    actions:{
        // 当点击的时候添加元素进去menu数组里面
        addMenu(items :string){
            const index = this.menu.findIndex((item:string) => item === items)
            // 处理相同的路由跳转的问题
            if(index === -1){
                this.menu.push(items)
            }
        }
    }
})