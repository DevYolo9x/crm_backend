<template>
    <div class="min-h-full">
        <Header />
        <Sidebar />
        <div class="p-4 sm:ml-64 relative top-16">
            <router-view v-slot="{ Component }">
                <keep-alive>
                    <component :is="Component" :key="$route.fullPath" />
                </keep-alive>
            </router-view>
        </div>
    </div>
</template>
<script setup>
import Sidebar from '../Sidebar.vue'
import Header from '../Header.vue'
</script>
