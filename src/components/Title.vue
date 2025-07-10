<template>
  <h1 class="text-xl font-medium uppercase">{{ title }}</h1>
</template>
<script setup>
const props = defineProps({
  title: String,
})
</script>
