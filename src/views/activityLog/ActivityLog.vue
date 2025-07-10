<template>
  <div class="flex flex-col space-y-2.5">
    <!-- Breadcrumb -->
    <nav class="flex text-gray-700" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-2">
        <li class="inline-flex items-center">
          <router-link :to="{ name: 'Dashboard' }" class="text-sm font-medium hover:text-blue-600">Tổng quan</router-link>
        </li>
        <li class="flex items-center">
          <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          <span class="ml-1 text-sm font-medium text-gray-500 md:ml-2">{{ route.meta.title }}</span>
        </li>
      </ol>
    </nav>

    <Loading :loading="loading" />
    <Title :title="route.meta.title" />

    <!-- Filters -->
    <div class="grid grid-cols-4 gap-2">
      <VueMultiselect v-model="selectedUserFilter" :options="users" :taggable="true" label="name" track-by="id" placeholder="Chọn thành viên" class="flex-1" @select="onUserChangeFilter" />
      <input v-model="formFilter.date_start" class="form-control flatpickr" placeholder="Ngày bắt đầu" />
      <input v-model="formFilter.date_end" class="form-control flatpickr" placeholder="Ngày kết thúc" />
      <input v-model="formFilter.keyword" class="form-control" placeholder="Nhập từ khóa tìm kiếm" />
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="table-order w-full text-sm text-left">
        <thead class=" bg-[#e5e5e5]">
          <tr>
            <th class="p-2 font-medium">STT</th>
            <th class="p-2 font-medium">Hành động</th>
            <th class="p-2 font-medium">Người tạo</th>
            <th class="p-2 font-medium">Ngày tạo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id" class="border-b hover:bg-gray-100">
            <td class="p-2">{{ log.id }}</td>
            <td class="p-2 font-medium">{{ log.action }}</td>
            <td class="p-2">{{ log.user }}</td>
            <td class="p-2">{{ log.created_at }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.last_page > 0" class="flex justify-between items-center mt-4">
      <span class="text-sm text-gray-700">Trang {{ pagination.current_page }} / {{ pagination.last_page }} (Tổng: {{ pagination.total }} mục)</span>
      <div v-if="pagination.last_page > 1" class="flex space-x-2">
        <button @click="goToPage(pagination.current_page - 1)" :disabled="pagination.current_page === 1" class="btn bg-gray-300 text-white px-3 py-1 rounded disabled:opacity-50">Trước</button>
        <button v-for="page in getPageNumbers" :key="page" @click="goToPage(page)" :class="['btn px-3 py-1 rounded', page === pagination.current_page ? 'bg-primary text-white' : 'bg-gray-300 text-black', page === '...' ? 'cursor-default bg-gray-200 text-gray-500' : '']" :disabled="page === '...'">
          {{ page }}
        </button>
        <button @click="goToPage(pagination.current_page + 1)" :disabled="pagination.current_page === pagination.last_page" class="btn bg-gray-300 text-white px-3 py-1 rounded disabled:opacity-50">Sau</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { debounce } from 'lodash'
import VueMultiselect from 'vue-multiselect'
import Title from '../../components/Title.vue'
import Loading from '../../components/Loading.vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/themes/light.css'
import axiosInstance from '../../axios'

const route = useRoute()
const store = useStore()
const loading = ref(false)

// State
const logs = computed(() => store.getters['activityLogs/logs'])
const pagination = computed(() => store.getters['activityLogs/pagination'])
const users = ref([])
const selectedUserFilter = ref(null)
const formFilter = ref({
  keyword: '',
  date_start: '',
  date_end: '',
  user_id: '',
})

// Methods
const fetchActivityLogs = debounce(async (page = 1) => {
  loading.value = true
  try {
    const params = { ...formFilter.value, page, per_page: 20 }
    await store.dispatch('activityLogs/fetchActivityLogs', { params })
  } catch (error) {
    console.error('Error fetching logs:', error)
  } finally {
    loading.value = false
  }
}, 300)

const fetchUsers = async () => {
  try {
    const { data } = await axiosInstance.get('users/lists')
    users.value = [{ id: 0, name: 'Tất cả thành viên' }, ...data]
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const onUserChangeFilter = (selected) => {
  formFilter.value.user_id = selected?.id || ''
  fetchActivityLogs()
}

// Pagination
const goToPage = (page) => {
  if (page > 0 && page <= pagination.value.last_page && page !== '...') {
    fetchActivityLogs(page)
  }
}

const getPageNumbers = computed(() => {
  const total = pagination.value.last_page
  const current = pagination.value.current_page
  const delta = 2
  const range = []

  const left = Math.max(1, current - delta)
  const right = Math.min(total, current + delta)

  if (left > 1) range.push(1)
  if (left > 2) range.push('...')
  for (let i = left; i <= right; i++) range.push(i)
  if (right < total - 1) range.push('...')
  if (right < total) range.push(total)

  return range
})

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchUsers(), fetchActivityLogs()])

  flatpickr('.flatpickr', {
    dateFormat: 'Y-m-d',
    allowInput: true,
    onChange: fetchActivityLogs,
  })
})
</script>

<style scoped>
.table-order {
  min-width: 100%;
}

.form-control {
  @apply border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary;
}
</style>
