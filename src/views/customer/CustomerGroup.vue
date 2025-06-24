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
    <!-- Tabs -->
    <Loading :loading="loading" />
    <div class="flex items-center justify-between">
      <Title :title="route.meta.title" />

      <div class="flex items-center space-x-1" v-if="can(userPermissions, 'customer_groups', 'create')">
        <div class="flex space-x-1">
          <input type="text" class="form-control flex-1" placeholder="Nhập từ khóa tìm kiếm" v-model="formFilter.keyword" />
          <a href="" class="btn btn-success !w-auto flex items-center" @click.prevent="showModal">
            <PlusIcon class="block h-6 w-6 text-white" aria-hidden="true" />
            Thêm mới
          </a>
        </div>
      </div>
    </div>
    <div>
      <table class="table-order text-sm w-full text-left rtl:text-right">
        <thead class="text-white bg-primary dark:bg-gray-700 dark:text-gray-400">
          <tr class="">
            <th class="">STT</th>
            <th class="">Tiêu đề</th>
            <th class="">Ngày tạo</th>
            <th class="text-right" v-if="can(userPermissions, 'customer_groups', 'edit') || can(userPermissions, 'customer_groups', 'destroy')">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(group, key) in groups" :key="group.id" class="border-b hover:bg-gray-100">
            <td>{{ key + 1 }}</td>

            <td class="font-bold">
              {{ group.title }}
              <span class="text-red-600">({{ group.customer_count }})</span>
            </td>
            <td>{{ group.created_at }}</td>
            <td v-if="can(userPermissions, 'customer_groups', 'edit') || can(userPermissions, 'customer_groups', 'destroy')">
              <div class="flex items-center space-x-1 justify-end">
                <button @click="editGroup(group)" class="btn btn-primary !w-auto flex items-center" v-if="can(userPermissions, 'customer_groups', 'edit')">
                  <PencilAltIcon class="block h-6 w-6 text-white mr-1" />
                  Sửa
                </button>
                <button @click="deleteGroup(group.id)" class="btn btn-danger !w-auto flex items-center" v-if="can(userPermissions, 'customer_groups', 'destroy')">
                  <XCircleIcon class="block h-6 w-6 text-white mr-1" />
                  Xóa
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Pagination -->
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
    <!-- Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] !my-0">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
        <h2 class="text-lg font-semibold mb-4">{{ selectedGroup ? 'Cập nhập nhóm khách hàng' : 'Thêm mới nhóm khách hàng' }}</h2>
        <form @submit.prevent="handleSubmit" class="space-y-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề
              <span class="text-red-600">*</span>
            </label>
            <input v-model="groupForm.title" type="text" class="form-control" />
          </div>
          <div class="flex justify-end space-x-2">
            <button @click="closeModal" class="btn btn-danger !w-auto">Hủy</button>
            <button type="submit" class="btn btn-primary !w-auto">{{ selectedGroup ? 'Cập Nhật' : 'Thêm mới' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PlusIcon, PencilAltIcon, XCircleIcon } from '@heroicons/vue/solid'
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { useStore } from 'vuex'
import { debounce } from 'lodash'
import { useRoute } from 'vue-router'
import Swal from 'sweetalert2'
import Title from '../../components/Title.vue'
import Loading from '../../components/Loading.vue'
import { handleApiError } from '../../helpers/apiErrorHandler'
import { useToastr } from '../../plugins/toastr'
import { can } from '../../helpers/permissions' // Import the can helper
const userPermissions = computed(() => store.getters['auth/permissions'] || {})
const toastr = useToastr()
const route = useRoute()
const store = useStore()
const groups = computed(() => store.getters['customerGroups/groups'])
const pagination = computed(() => store.getters['customerGroups/pagination'])
const totalPages = computed(() => store.getters['customerGroups/totalPages'])
const currentPage = ref(1)
const selectedGroup = ref(null)
const isModalOpen = ref(false)
const showModal = () => {
  isModalOpen.value = true
}
const closeModal = () => {
  isModalOpen.value = false
}
const editGroup = (group) => {
  selectedGroup.value = group
  groupForm.value.id = group.id
  groupForm.value.title = group.title
  showModal()
}
const perPage = ref(20) // Số sản phẩm mỗi trang
const groupForm = ref({ title: '' })
const formFilter = reactive({
  keyword: '',
})
watch(
  [formFilter],
  debounce(() => {
    fetchCustomerGroups()
  }, 300)
)
const fetchCustomerGroups = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      keyword: formFilter.keyword,
    }
    await store.dispatch('customerGroups/fetchGroups', { page: currentPage.value, perPage: perPage.value, params: params })
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error)
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  fetchCustomerGroups()
})
// Pagination
const goToPage = (page) => {
  if (page > 0 && page <= pagination.value.last_page) {
    currentPage.value = page
    fetchCustomerGroups()
  }
}
const getPageNumbers = computed(() => {
  const totalPages = pagination.value.last_page
  const current = currentPage.value
  const delta = 2 // Number of pages to show on each side
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
const deleteGroup = async (id) => {
  const result = await Swal.fire({
    title: 'Hãy chắc chắn rằng bạn muốn thực hiện thao tác này?',
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
      const data = await store.dispatch('customerGroups/deleteGroup', id)
      Swal.fire({
        title: 'Thành công!',
        text: data.message,
        icon: 'success',
        confirmButtonText: 'OK',
      })
    } catch (error) {
      Swal.fire({
        title: 'Lỗi!',
        text: error.value || 'Error!',
        icon: 'error',
        confirmButtonText: 'OK',
      })
    } finally {
      loading.value = false
    }
  }
}
const loading = ref(false)
const handleSubmit = async () => {
  loading.value = true
  try {
    const action = selectedGroup.value ? 'customerGroups/updateGroup' : 'customerGroups/addGroup'
    const data = await store.dispatch(action, groupForm.value)
    toastr.success(`${data.message}`)
    groupForm.value.id = ''
    groupForm.value.title = ''
    selectedGroup.value = null
    closeModal()
  } catch (error) {
    handleApiError(error)
  } finally {
    loading.value = false
  }
}
</script>
