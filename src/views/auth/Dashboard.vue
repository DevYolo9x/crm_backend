<template>
  <div class="flex flex-col space-y-2.5 relative" v-if="can(userPermissions, 'dashboard', 'index')">
    <Title title="Dashboard" />
    <Loading :loading="loading" />
    <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5" v-if="totals">
      <router-link :to="{ name: 'customers.index' }" class="rounded-[6px] p-2 shadow-md lg:p-4 bg-[#ebf4fe]">
        <p class="text-[12px] font-bold uppercase text-[#333]">Khách hàng</p>
        <div class="flex items-center justify-between">
          <div class="mr-2 text-[26px] flex text-label items-end">
            <span style="color: rgb(21, 130, 245); font-weight: 600">
              <span style="letter-spacing: -2px">{{ totals.customers }}</span>
            </span>
            <span class="ml-2 hidden pb-2 text-[12px] xl:block">Khách hàng</span>
          </div>
          <div class="bg-white rounded-[4px] py-1 px-2 shadow-xl">
            <UserGroupIcon class="block h-6 w-6 text-[#1582f5]" aria-hidden="true" />
          </div>
        </div>
      </router-link>
      <router-link :to="{ name: 'jobs.index' }" class="rounded-[6px] p-2 shadow-md lg:p-4 bg-[#e5ffe5]">
        <p class="text-[12px] font-bold uppercase text-[#333]">Job order</p>
        <div class="flex items-center justify-between">
          <div class="mr-2 text-[26px] flex text-label items-end">
            <span style="color: #009000; font-weight: 600">
              <span style="letter-spacing: -2px">{{ totals.jobs }}</span>
            </span>
            <span class="ml-2 hidden pb-2 text-[12px] xl:block">job</span>
          </div>
          <div class="bg-white rounded-[4px] py-1 px-2 shadow-xl">
            <ShoppingCartIcon class="block h-6 w-6 text-[#009000]" aria-hidden="true" />
          </div>
        </div>
      </router-link>
      <router-link :to="{ name: 'Candidates' }" class="rounded-[6px] p-2 shadow-md lg:p-4 bg-[#fff4ea]">
        <p class="text-[12px] font-bold uppercase text-[#333]">Ứng viên</p>
        <div class="flex items-center justify-between">
          <div class="mr-2 text-[26px] flex text-label items-end">
            <span style="color: #ff7a00; font-weight: 600">
              <span style="letter-spacing: -2px">{{ totals.candidates }}</span>
            </span>
            <span class="ml-2 hidden pb-2 text-[12px] xl:block">Ứng Viên</span>
          </div>
          <div class="bg-white rounded-[4px] py-1 px-2 shadow-xl">
            <UserGroupIcon class="block h-6 w-6 text-[#1582f5]" aria-hidden="true" />
          </div>
        </div>
      </router-link>
      <router-link :to="{ name: 'ContractList' }" class="rounded-[6px] p-2 shadow-md lg:p-4 bg-[#fff1f1]">
        <p class="text-[12px] font-bold uppercase text-[#333]">Hợp đồng</p>
        <div class="flex items-center justify-between">
          <div class="mr-2 text-[26px] flex text-label items-end">
            <span style="color: #ff0000; font-weight: 600">
              <span style="letter-spacing: -2px">{{ totals.contracts }}</span>
            </span>
            <span class="ml-2 hidden pb-2 text-[12px] xl:block">hợp đồng</span>
          </div>
          <div class="bg-white rounded-[4px] py-1 px-2 shadow-xl">
            <ArchiveIcon class="block h-6 w-6 text-[#ff0000]" aria-hidden="true" />
          </div>
        </div>
      </router-link>
    </div>
    <div class="grid grid-cols-1 gap-5">
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold">Thống kê job order</h3>
          <div class="flex justify-end space-x-1">
            <span class="btn !text-primary text-center !px-2 !py-1 cursor-pointer flex items-center justify-start !w-auto" :class="{ active: activeTypeOrder === 'week' }" @click="setActiveType('week')">Tuần</span>
            <span class="btn !text-primary text-center !px-2 !py-1 cursor-pointer flex items-center justify-start !w-auto" :class="{ active: activeTypeOrder === 'month' }" @click="setActiveType('month')">Tháng</span>
            <span class="btn !text-primary text-center !px-2 !py-1 cursor-pointer flex items-center justify-start !w-auto" :class="{ active: activeTypeOrder === 'year' }" @click="setActiveType('year')">Năm</span>
          </div>
        </div>
        <div ref="chartContainer">
          <BarChart v-if="loaded" :series="seriesOne" :chartOptions="chartOptionsOne" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ShoppingCartIcon, UserGroupIcon, ArchiveIcon } from '@heroicons/vue/solid'
import { computed, ref, onMounted, watch } from 'vue'
import BarChart from '../../components/BarChart.vue'
import Title from '../../components/Title.vue'
import Loading from '../../components/Loading.vue'
import store from '../../store'
import { useRoute } from 'vue-router'
import axiosInstance from '../../axios'
import { can } from '../../helpers/permissions' // Import the can helper
const userPermissions = computed(() => store.getters['auth/permissions'] || {})
const route = useRoute()
const totals = ref([])
const chartData = ref([])
const labels = ref([])
const activeTypeOrder = ref('week')
const loading = ref(false)
const loaded = ref(false)
const chartContainer = ref(null) // Reference to the chart container
const fetchTotals = async () => {
  loading.value = true
  try {
    const { data } = await axiosInstance.get('dashboard/statistics')
    totals.value = data.totals
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}
const seriesOne = ref([])
const fetchChartData = async (type) => {
  loading.value = true
  try {
    const { data } = await axiosInstance.get('dashboard/chart', {
      params: { type },
    })
    chartData.value = data.chart_data
    labels.value = data.labels
    seriesOne.value = [
      { name: 'Khách hàng', data: data.chart_data.customers || [] },
      { name: 'Job order', data: data.chart_data.jobs || [] },
      { name: 'Ứng viên', data: data.chart_data.candidates || [] },
      { name: 'Hợp đồng', data: data.chart_data.contracts || [] },
    ]
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const setActiveType = (type) => {
  activeTypeOrder.value = type
  fetchChartData(type)
}
const fetchAllData = async () => {
  try {
    await Promise.all([fetchTotals(), fetchChartData(activeTypeOrder.value)]).then(() => {
      loaded.value = true
    })
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}
onMounted(async () => {
  fetchAllData() // Fetch data from backend
})

const chartOptionsOne = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false } },
  plotOptions: { bar: { horizontal: false, columnWidth: '50%', endingShape: 'rounded' } },
  dataLabels: { enabled: false },
  xaxis: { categories: labels.value || [] },
  title: { text: '', align: 'center' },
  tooltip: { enabled: true },
  colors: ['#096DD9', '#008000', '#FF7A00', '#FF0000'],
  legend: { position: 'top' },
}))

watch(
  () => route.name,
  async () => {
    loaded.value = true
    if (route.name == 'Dashboard') {
      try {
        fetchAllData()
      } finally {
        loaded.value = false
      }
    }
  }
)
</script>

<style scoped>
.btn.active {
  @apply !bg-primary !text-white !border-primary;
}
</style>
