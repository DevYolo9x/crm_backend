<!-- Popup.vue -->
<template>
  <div v-if="isOpen">
    <slot></slot>
  </div>
</template>
<script setup>
defineProps({ isOpen: Boolean })
</script>
