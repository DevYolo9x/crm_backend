<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
onMounted(() => {
    store.dispatch('auth/checkAuth')
})
</script>

<template>
    <RouterView />
</template>
