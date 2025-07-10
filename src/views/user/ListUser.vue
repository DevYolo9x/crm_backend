<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch, reactive } from 'vue'
import Title from '../../components/Title.vue'
import Swal from 'sweetalert2'
import { useToastr } from '../../plugins/toastr'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { PlusIcon, ClipboardCopyIcon, PencilAltIcon, XCircleIcon } from '@heroicons/vue/outline'
import { debounce } from 'lodash'
import VueMultiselect from 'vue-multiselect'
import axiosInstance from '../../axios'
import Loading from '../../components/Loading.vue'
import { can } from '../../helpers/permissions' // Import the can helper
const userPermissions = computed(() => store.getters['auth/permissions'] || {})
const store = useStore()
const route = useRoute()
const toastr = useToastr()
const currentPage = ref(1)
const perPage = ref(20)
const users = computed(() => store.getters['user/allUsers'])
const pagination = computed(() => store.getters['user/pagination'])
const loading = ref(false)

const fetchUsers = async () => {
  loading.value = true
  const params = {
    keyword: formFilter.keyword,
    role_id: formFilter.role_id,
  }
  try {
    await store.dispatch('user/fetchUsers', {
      page: currentPage.value,
      perPage: perPage.value,
      params: params,
    })
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error)
  } finally {
    loading.value = false // Kết thúc loading
  }
}
const copyToken = async (token) => {
  try {
    await navigator.clipboard.writeText(token)
    toastr.success('Token đã được sao chép!')
  } catch (err) {
    console.error('Lỗi khi sao chép:', err)
    toastr.error('Lỗi khi sao chép:', err)
  }
}
const roles = ref([])
const role = ref({ id: 0, title: 'Nhóm nhân viên' })

const getRoles = async () => {
  try {
    const { data } = await axiosInstance.get(`roles`)
    roles.value = [{ id: 0, title: 'Nhóm nhân viên' }, ...data]
  } catch (error) {
    console.error('Lỗi khi lấy danh sách vai trò:', error)
  }
}
onMounted(async () => {
  try {
    await Promise.all([getRoles()])
  } catch (error) {
    console.error('Error fetching data:', error)
  }
  fetchUsers()
})
// Pagination
const goToPage = (page) => {
  if (page > 0 && page <= pagination.value.last_page) {
    currentPage.value = page
    fetchUsers()
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
const deleteUser = async (id) => {
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
      const data = await store.dispatch('user/deleteUser', id)
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
  role_id: 0,
})
const onRoleChange = () => {
  formFilter.role_id = role.value.id
}
watch(
  [formFilter],
  debounce(() => {
    fetchUsers()
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
    <div class="grid grid-cols-3 items-center justify-between">
      <div>
        <Title :title="route.meta.title" />
      </div>
      <div class="flex items-center space-x-1 col-span-2">
        <div class="flex space-x-1 flex-1">
          <VueMultiselect v-model="role" @select="onRoleChange" :options="roles" placeholder="Nhóm nhân viên" :taggable="true" label="title" :searchable="true" track-by="id"></VueMultiselect>
          <input type="text" class="form-control" placeholder="Nhập từ khóa tìm kiếm" v-model="formFilter.keyword" />
        </div>
        <div v-if="can(userPermissions, 'users', 'create')">
          <router-link :to="{ name: 'users.create' }" class="text-[14px] py-[7px] px-[10px] btn-success !w-auto flex items-center">
            <PlusIcon class="block h-5 w-5 text-white" aria-hidden="true" />
            Thêm mới
          </router-link>
        </div>
      </div>
    </div>
    <div class="relative">
      <Loading :loading="loading" />
      <table class="table-order text-sm w-full text-left rtl:text-right">
        <thead class=" bg-[#e5e5e5] dark:bg-gray-700 dark:text-gray-400">
          <tr class="">
            <th class="font-medium">STT</th>
            <th class="font-medium">CODE</th>
            <th class="font-medium">Tên nhân viên</th>
            <th class="hidden">Token</th>
            <th class="font-medium">Nhóm nhân viên</th>
            <th class="font-medium">Cập nhật mới nhất</th>
            <th class="text-right font-medium" v-if="can(userPermissions, 'users', 'edit') || can(userPermissions, 'users', 'destroy')">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, key) in users" :key="user.id" class="border-b hover:bg-gray-100">
            <td>{{ key + 1 }}</td>
            <td class="font-bold text-blue-600">{{ user.code }}</td>
            <td>
              <span class="font-medium">{{ user.name }}</span>
              <br />
              {{ user.account }}
              <br />
              {{ user.phone }}
              <br />
              {{ user.email }}
              <br />
            </td>
            <td class="hidden">
              <div class="flex items-center space-x-1 cursor-pointer" @click="copyToken(user.token)">
                <span>
                  <ClipboardCopyIcon class="block h-6 w-6 text-primary" aria-hidden="true" />
                </span>
                <span>{{ user.token }}</span>
              </div>
            </td>
            <td>{{ user.role ? user.role.title : '' }}</td>
            <td>{{ user.updated_at ? user.updated_at : user.created_at }}</td>
            <td v-if="can(userPermissions, 'users', 'edit') || can(userPermissions, 'users', 'destroy')">
              <div class="flex items-center justify-end space-x-1">
                <router-link
                  :to="{
                    name: 'users.update',
                    params: { id: user.id },
                  }"
                  class="text-[14px] py-[7px] px-[10px] btn-primary !w-auto flex items-center"
                  v-if="can(userPermissions, 'users', 'edit')"
                >
                  <PencilAltIcon class="block h-5 w-5 text-white mr-1" />
                  Sửa
                </router-link>
                <button @click="deleteUser(user.id)" class="text-[14px] py-[7px] px-[10px] btn-danger !w-auto flex items-center" v-if="can(userPermissions, 'users', 'destroy')">
                  <XCircleIcon class="block h-5 w-5 text-white mr-1" />
                  Xóa
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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
  </div>
</template>
