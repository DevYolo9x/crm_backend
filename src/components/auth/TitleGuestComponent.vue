<template>
  <div>
    <img class="mx-auto h-12 w-auto" src="../../assets/logo-website.png" alt="log" style="filter: brightness(0) invert(1)" />
    <h2 class="text-white dark:text-slate-300 text-2xl font-medium text-center mt-2 uppercase">
      {{ title }}
    </h2>
  </div>
</template>
<script setup>
const props = defineProps({
  title: String,
})
</script>
