<template>
<!-- 无子集 -->
<el-menu-item v-if="!item.child">

</el-menu-item>
<el-sub-menu else v-for="v in item.child" :key="v.path" :index="v.path">
    <template #title>

    </template>
    <!-- 递归 自调 -->
    <Index v-for="nav in item.child" :key="nav.path" :item="nav" />
</el-sub-menu>
</template>

<script lang="ts" setup>
// import condate from '../../navlead/comdata.ts'  这个是放在父组件当中的
import Index from './index.vue';
const {item} = defineProps({
    item: {
        type: Object,
        required: true
    }
})
</script>

<style lang="less" scoped>

</style>