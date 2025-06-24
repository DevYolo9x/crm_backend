<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch, reactive } from 'vue'
import Title from '../../components/Title.vue'
import Swal from 'sweetalert2'
import { useToastr } from '../../plugins/toastr'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { PlusIcon, TagIcon, PencilAltIcon, XCircleIcon } from '@heroicons/vue/outline'
import { debounce } from 'lodash'
import Loading from '../../components/Loading.vue'

const store = useStore()
const route = useRoute()
const toastr = useToastr()
const currentPage = ref(1)
const perPage = ref(20)
const roles = computed(() => store.getters['roles/allRoles'])
const pagination = computed(() => store.getters['roles/pagination'])
const loading = ref(false)
const fetchRoles = async () => {
  const params = {
    keyword: formFilter.keyword,
  }
  loading.value = true // Bắt đầu loading
  try {
    await store.dispatch('roles/fetchRoles', { page: currentPage.value, perPage: perPage.value, params: params })
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error)
  } finally {
    loading.value = false // Kết thúc loading
  }
}
onMounted(() => {
  fetchRoles()
})
// Pagination
const goToPage = (page) => {
  if (page > 0 && page <= pagination.value.last_page) {
    currentPage.value = page
    fetchRoles()
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
const deleteRole = async (id) => {
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
    try {
      const data = await store.dispatch('roles/deleteRole', id)
      Swal.fire({
        title: 'Thành công!',
        text: data.message,
        icon: 'success',
        confirmButtonText: 'OK',
      })
    } catch (error) {
      Swal.fire({
        title: 'Lỗi!',
        text: error.value || 'Có lỗi xảy ra!',
        icon: 'error',
        confirmButtonText: 'OK',
      })
    }
  }
}
const formFilter = reactive({
  keyword: '',
})
watch(
  [formFilter],
  debounce(() => {
    fetchRoles()
  }, 300)
)
</script>

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
    <div class="flex items-center justify-between">
      <Title :title="route.meta.title" />
      <div class="flex items-center space-x-1">
        <div>
          <input type="text" class="form-control" placeholder="Nhập từ khóa tìm kiếm" v-model="formFilter.keyword" />
        </div>
        <router-link :to="{ name: 'roles.create' }" class="btn btn-success !w-auto flex items-center">
          <PlusIcon class="block h-6 w-6 text-white" aria-hidden="true" />
          Thêm mới
        </router-link>
      </div>
    </div>
    <div class="relative">
      <Loading :loading="loading" />
      <table class="table-order text-sm w-full text-left rtl:text-right">
        <thead class="text-white bg-primary dark:bg-gray-700 dark:text-gray-400">
          <tr class="">
            <th class="">STT</th>
            <th class="">Nhóm nhân viên</th>
            <th class="">Cập nhật mới nhất</th>
            <th class="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(role, key) in roles" :key="role.id" class="border-b hover:bg-gray-100">
            <td>{{ key + 1 }}</td>
            <td>{{ role.title }}</td>
            <td>{{ role.updated_at ? role.updated_at : role.created_at }}</td>
            <td>
              <div class="flex items-center justify-end space-x-1">
                <router-link
                  :to="{
                    name: 'roles.update',
                    params: { id: role.id },
                  }"
                  class="btn btn-primary !w-auto flex items-center"
                >
                  <PencilAltIcon class="block h-6 w-6 text-white mr-1" />
                  Sửa
                </router-link>
                <button @click="deleteRole(role.id)" class="btn btn-danger !w-auto flex items-center">
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
    <div class="flex justify-between items-center mt-4" v-if="pagination">
      <span class="text-sm text-gray-700">Trang {{ pagination.current_page }} của {{ pagination.last_page }} (Tổng: {{ pagination.total }} mục)</span>
      <div class="flex space-x-2" v-if="pagination.last_page > 1">
        <button @click.prevent="goToPage(pagination.current_page - 1)" :disabled="pagination.current_page === 1" class="btn bg-gray-300 text-white px-3 py-1 rounded disabled:opacity-50">Trước</button>
        <button v-for="page in getPageNumbers" :key="page" @click="goToPage(page)" :class="['btn px-3 py-1 rounded', page === currentPage ? 'bg-primary !text-white !border-primary' : 'bg-gray-300 text-black', page === '...' ? 'cursor-default bg-gray-200 text-gray-500' : '']" :disabled="page === '...'">
          {{ page }}
        </button>
        <button @click.prevent="goToPage(pagination.current_page + 1)" :disabled="pagination.current_page === pagination.last_page" class="btn bg-gray-300 text-white px-3 py-1 rounded disabled:opacity-50">Sau</button>
      </div>
    </div>
  </div>
</template>
