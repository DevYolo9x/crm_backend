<template>
  <div class="flex flex-col space-y-2.5">
    <nav class="flex text-gray-70" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-2">
        <li class="inline-flex items-center">
          <router-link :to="{ name: 'Dashboard' }" class="text-sm font-medium hover:text-blue-600">Tổng quan</router-link>
        </li>
        <li>
          <div class="flex items-center">
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
            </svg>
            <span class="ml-1 text-sm font-medium text-gray-500 md:ml-2">{{ route.meta.title }}</span>
          </div>
        </li>
      </ol>
    </nav>
    <Loading :loading="loading" />
    <Title :title="route.meta.title" />

    <div class="flex items-center justify-end">
      <div class="grid md:grid-cols-7 space-x-1">
        <div class="md:col-span-2">
          <VueMultiselect v-if="users && users.length > 0" class="flex-1" v-model="selectedUserFilter" :options="users" :taggable="true" label="name" :searchable="true" track-by="id" @select="onUserChangeFilter">
            <template v-if="selectedUserFilter && selectedUserFilter.id !== 0" #caret>
              <button @click.stop="clearSelectedUserFilter" class="absolute multiselect__clear top-1/2 translate-y-[-50%] z-10 right-[10px] text-[11px]">
                ✕
              </button>
            </template>
          </VueMultiselect>
        </div>
        <div class="md:col-span-2">
          <VueMultiselect class="flex-1" v-model="selectedCustomerFilter" :options="customers" :taggable="true" label="name" :searchable="true" track-by="id" @select="onCustomerChangeFilter">
            <template v-if="selectedCustomerFilter && selectedCustomerFilter.id !== 0" #caret>
              <button @click.stop="clearSelectedCustomerFilter" class="absolute multiselect__clear top-1/2 translate-y-[-50%] z-10 right-[10px] text-[11px]">
                ✕
              </button>
            </template>
          </VueMultiselect>
        </div>
        <div :class="can(userPermissions, 'contracts', 'create') ? `md:col-span-2` : `md:col-span-3`">
          <input type="text" class="form-control flex-1" placeholder="Nhập từ khóa tìm kiếm" v-model="formFilter.keyword" />
        </div>
        <router-link v-if="can(userPermissions, 'contracts', 'create')" :to="{ name: 'ContractCreate' }" class="btn btn-success !w-auto flex items-center">
          <PlusIcon class="block h-6 w-6 text-white" aria-hidden="true" />
          Thêm mới
        </router-link>
      </div>
    </div>
    <div>
      <table class="table-order text-sm w-full text-left rtl:text-right">
        <thead class="text-white bg-primary dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th class="cursor-pointer" @click="sort('id')">
              ID
              <span v-if="sortColumn === 'id'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
              <span v-else>↕</span>
            </th>
            <th class="cursor-pointer" @click="sort('name')">
              Tên hợp đồng
              <span v-if="sortColumn === 'name'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
              <span v-else>↕</span>
            </th>
            <th>Khách hàng</th>
            <th>Người chịu trách nhiệm</th>
            <th class="cursor-pointer" @click="sort('total_amount')">
              Số tiền hợp đồng (VND)
              <span v-if="sortColumn === 'total_amount'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
              <span v-else>↕</span>
            </th>
            <th class="cursor-pointer" @click="sort('warranty_end_date')">
              Ngày kết thúc bảo hành
              <span v-if="sortColumn === 'warranty_end_date'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
              <span v-else>↕</span>
            </th>
            <th>Ghi chú</th>
            <th>Người tạo</th>
            <th class="cursor-pointer" @click="sort('created_at')">
              Ngày tạo
              <span v-if="sortColumn === 'created_at'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
              <span v-else>↕</span>
            </th>
            <th class="text-right" v-if="can(userPermissions, 'contracts', 'edit') || can(userPermissions, 'contracts', 'destroy')">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contract in contracts" :key="contract.id" class="border-b hover:bg-gray-100">
            <td>{{ contract.id }}</td>
            <td class="font-bold">
              <router-link :to="{ name: 'ContractEdit', params: { id: contract.id } }" class="text-blue-600 underline">
                {{ contract.name }}
              </router-link>
            </td>
            <td>{{ contract.customer }}</td>
            <td>{{ contract.responsible_person }}</td>
            <td>{{ formatVND(contract.total_amount) }}</td>
            <td>{{ contract.warranty_end_date }}</td>
            <td>
              <span @click="showNotes(contract.notes)" class="text-blue-800 underline font-bold">Xem</span>
            </td>
            <td>{{ contract.user }}</td>
            <td>{{ contract.created_at }}</td>
            <td v-if="can(userPermissions, 'contracts', 'edit') || can(userPermissions, 'contracts', 'destroy')">
              <div class="flex items-center space-x-1 justify-end">
                <router-link :to="{ name: 'ContractDetail', params: { id: contract.id } }" class="btn btn-warning !w-auto flex items-center" v-if="can(userPermissions, 'contracts', 'index')">
                  <EyeIcon class="block h-6 w-6 text-white mr-1" />
                  Xem
                </router-link>
                <router-link :to="{ name: 'ContractEdit', params: { id: contract.id } }" class="btn btn-primary !w-auto flex items-center" v-if="can(userPermissions, 'contracts', 'edit')">
                  <PencilAltIcon class="block h-6 w-6 text-white mr-1" />
                  Sửa
                </router-link>
                <button @click="deleteContract(contract.id)" class="btn btn-danger !w-auto flex items-center" v-if="can(userPermissions, 'contracts', 'destroy')">
                  <XCircleIcon class="block h-6 w-6 text-white mr-1" />
                  Xóa
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex justify-between items-center mt-4">
      <span class="text-sm text-gray-700">Trang {{ pagination.current_page }} của {{ pagination.last_page }} (Tổng: {{ pagination.total }} mục)</span>
      <div class="flex space-x-2" v-if="pagination.last_page > 1">
        <button @click.prevent="goToPage(pagination.current_page - 1)" :disabled="pagination.current_page === 1" class="btn bg-gray-300 text-white px-3 py-1 rounded disabled:opacity-50">Trước</button>
        <button v-for="page in getPageNumbers" :key="page" @click="goToPage(page)" :class="['btn px-3 py-1 rounded', page === currentPage ? 'bg-primary !text-white !border-primary' : 'bg-gray-300 text-black', page === '...' ? 'cursor-default bg-gray-200 text-gray-500' : '']" :disabled="page === '...'">
          {{ page }}
        </button>
        <button @click.prevent="goToPage(pagination.current_page + 1)" :disabled="pagination.current_page === pagination.last_page" class="btn bg-gray-300 text-white px-3 py-1 rounded disabled:opacity-50">Sau</button>
      </div>
    </div>
    <!-- Popup hiển thị ghi chú -->
    <div v-if="isShowNotes" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] !my-0">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative">
        <h2 class="text-lg font-semibold mb-4">Ghi chú</h2>
        <div class="space-y-4">
          <div class="" v-html="currentNotes || 'Không có ghi chú'"></div>
          <div class="flex justify-end space-x-2">
            <button @click="closeNotes" class="btn btn-danger !w-auto">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PlusIcon, PencilAltIcon, XCircleIcon, EyeIcon } from '@heroicons/vue/solid'
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { useStore } from 'vuex'
import { debounce } from 'lodash'
import { useRoute } from 'vue-router'
import Swal from 'sweetalert2'
import Title from '../../components/Title.vue'
import Loading from '../../components/Loading.vue'
import VueMultiselect from 'vue-multiselect'
import { can } from '../../helpers/permissions' // Import the can helper
import axiosInstance from '../../axios'
const userPermissions = computed(() => store.getters['auth/permissions'] || {})
const route = useRoute()
const store = useStore()

const contracts = computed(() => store.getters['contracts/contracts'])
const pagination = computed(() => store.getters['contracts/pagination'])
const customers = computed(() => store.getters['customers/customerLists'])
const currentPage = ref(1)
const loading = ref(false)
const isShowNotes = ref(false) // Trạng thái hiển thị popup ghi chú
const currentNotes = ref('') // Nội dung ghi chú hiện tại
const sortColumn = ref('id') // Cột đang được sắp xếp
const sortDirection = ref('asc') // Hướng sắp xếp: 'asc' hoặc 'desc'
const selectedCustomerFilter = ref({ id: 0, name: 'Chọn khách hàng' })
const selectedUserFilter = ref({ id: 0, name: 'Người tạo' })
const users = ref([])
const formFilter = reactive({ keyword: '', customer_id: '', created_by: 0 })

// Hàm định dạng số thành VND
const formatVND = (value) => {
  return (parseFloat(value) || 0).toLocaleString('vi-VN')
}
const onUserChangeFilter = () => {
  formFilter.created_by = selectedUserFilter.value.id
  formFilter.created_by = 0
}
const onCustomerChangeFilter = () => {
  formFilter.customer_id = selectedCustomerFilter.value.id
  formFilter.customer_id = 0
}

// Clear form lọc
const clearSelectedUserFilter = () => {
  selectedUserFilter.value = { id: 0, name: 'Người tạo' }
}

const clearSelectedCustomerFilter = () => {
  selectedCustomerFilter.value = { id: 0, name: 'Chọn khách hàng' }
}

watch(
  [formFilter],
  debounce(() => {
    fetchContracts()
  }, 300)
)
const fetchUsers = async () => {
  try {
    const { data } = await axiosInstance.get('users/lists')
    users.value = data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error)
  }
}
const fetchContracts = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      keyword: formFilter.keyword,
      customer_id: formFilter.customer_id,
      created_by: formFilter.created_by,
      sort_by: sortColumn.value, // Thêm cột sắp xếp
      sort_direction: sortDirection.value, // Thêm hướng sắp xếp
    }
    await store.dispatch('contracts/fetchContracts', { page: currentPage.value, perPage: 20, params })
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error)
  } finally {
    loading.value = false
  }
}

const fetchCustomers = async () => {
  try {
    await store.dispatch('customers/fetchCustomerLists')
  } catch (error) {
    console.error('Lỗi khi lấy danh sách khách hàng:', error)
  }
}

onMounted(async () => {
  await fetchContracts()
  await Promise.all([fetchCustomers(), fetchUsers()])
})

const goToPage = (page) => {
  if (page > 0 && page <= pagination.value.last_page) {
    currentPage.value = page
    fetchContracts()
  }
}

const getPageNumbers = computed(() => {
  const totalPages = pagination.value.last_page
  const current = currentPage.value
  const delta = 2
  const range = []
  let left = Math.max(1, current - delta)
  let right = Math.min(totalPages, current + delta)
  if (left > 1) range.push(1)
  if (left > 2) range.push('...')
  for (let i = left; i <= right; i++) range.push(i)
  if (right < totalPages - 1) range.push('...')
  if (right < totalPages) range.push(totalPages)
  return range
})

const deleteContract = async (id) => {
  const result = await Swal.fire({
    title: 'Bạn có chắc chắn muốn xóa hợp đồng này?',
    text: 'Hành động này không thể hoàn tác!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Đồng ý',
    cancelButtonText: 'Hủy',
  })
  if (result.isConfirmed) {
    loading.value = true
    try {
      const data = await store.dispatch('contracts/deleteContract', id)
      Swal.fire({
        title: 'Thành công!',
        text: data.message,
        icon: 'success',
        confirmButtonText: 'OK',
      })
      await fetchContracts()
    } catch (error) {
      Swal.fire({
        title: 'Lỗi!',
        text: error.message || 'Có lỗi xảy ra!',
        icon: 'error',
        confirmButtonText: 'OK',
      })
    } finally {
      loading.value = false
    }
  }
}
// Hiển thị popup ghi chú
const showNotes = (notes) => {
  currentNotes.value = notes
  isShowNotes.value = true
}

// Đóng popup ghi chú
const closeNotes = () => {
  isShowNotes.value = false
  currentNotes.value = ''
}
// Xử lý sắp xếp khi nhấp vào cột
const sort = (column) => {
  if (sortColumn.value === column) {
    // Nếu cột đã được chọn, đổi hướng sắp xếp
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    // Nếu chọn cột mới, đặt cột mới và mặc định sắp xếp tăng dần
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
  fetchContracts() // Gọi lại API với thông tin sắp xếp mới
}
</script>
<style scoped>
th.cursor-pointer:hover {
  @apply bg-blue-600;
}
</style>
