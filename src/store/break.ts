// 用于生成面包屑的方法
import { defineStore } from "pinia";


export const breakMenu = defineStore('breakMenu',{
    state:()=>({
        menu:[],
    }),
    actions:{
        // 当点击的时候添加元素进去menu数组里面
    }
})