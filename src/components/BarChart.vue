<script setup>
import { defineProps } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps({
  series: Array,
  chartOptions: Object,
})
</script>

<template>
  <VueApexCharts type="bar" height="350" :options="chartOptions" :series="series" />
</template>
