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
    <div class="flex items-center justify-between">
      <Title :title="route.meta.title" />
      <div class="flex items-center space-x-1">
        <div class="flex space-x-1">
          <input type="text" class="form-control flex-1" placeholder="Nhập từ khóa tìm kiếm" v-model="formFilter.keyword" />
          <a href="" v-if="can(userPermissions, 'industries', 'create')" class="btn btn-success !w-auto flex items-center" @click.prevent="showModal">
            <PlusIcon class="block h-6 w-6 text-white" aria-hidden="true" />
            Thêm mới
          </a>
        </div>
      </div>
    </div>
    <div>
      <table class="table-order text-sm w-full text-left rtl:text-right">
        <thead class="text-white bg-primary dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th>STT</th>
            <th>Tiêu đề</th>
            <th>Ngày tạo</th>
            <th>Người tạo</th>
            <th class="text-right" v-if="can(userPermissions, 'industries', 'edit') || can(userPermissions, 'industries', 'destroy')">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(industry, key) in industries" :key="industry.id" class="border-b hover:bg-gray-100">
            <td>{{ key + 1 }}</td>
            <td class="font-bold">{{ industry.title.vi }}</td>
            <td>{{ industry.created_at }}</td>
            <td>{{ industry.createBy }}</td>
            <td v-if="can(userPermissions, 'industries', 'edit') || can(userPermissions, 'industries', 'destroy')">
              <div class="flex items-center space-x-1 justify-end">
                <button @click="editIndustry(industry)" class="btn btn-primary !w-auto flex items-center" v-if="can(userPermissions, 'industries', 'edit')">
                  <PencilAltIcon class="block h-6 w-6 text-white mr-1" />
                  Sửa
                </button>
                <button @click="deleteIndustry(industry.id)" class="btn btn-danger !w-auto flex items-center" v-if="can(userPermissions, 'industries', 'destroy')">
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
    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] !my-0">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
        <h2 class="text-lg font-semibold mb-4">{{ selectedIndustry ? 'Cập nhật ngành nghề' : 'Thêm mới ngành nghề' }}</h2>
        <form @submit.prevent="handleSubmit" class="space-y-2">
          <!-- Tabs hoặc lựa chọn ngôn ngữ -->
          <div class="tabs">
            <button
              v-for="l in Languages"
              :key="l.code"
              @click.prevent="lang = l.code"
              :class="{ 'bg-gray-100': lang === l.code }" class="cursor-pointer inline-block text-blue-600 hover:text-blue-700 rounded-t-lg py-3 px-4 text-sm font-medium text-center"
            >
              {{ l.name }}
            </button>
          </div>
          <div class="border px-5 py-3 tab-content mb-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề
                <span class="text-red-600">*</span>
              </label>
              <input v-model="currentFullName" type="text" class="form-control" />
            </div>
          </div>
          <!-- Tabs hoặc lựa chọn ngôn ngữ -->
          <!-- Debug -->
          <pre>{{ industryForm }}</pre>
          <div class="flex justify-end space-x-2">
            <button @click="closeModal" class="btn btn-danger !w-auto">Hủy</button>
            <button type="submit" class="btn btn-primary !w-auto">{{ selectedIndustry ? 'Cập nhật' : 'Thêm mới' }}</button>
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
const Languages = computed(() => store.getters['languages/languages'] || {})
const defaultLanguages = computed(() => store.getters['languages/languageCode'] || 'vi')
const toastr = useToastr()
const route = useRoute()
const store = useStore()

const industries = computed(() => store.getters['industries/industries'])
const pagination = computed(() => store.getters['industries/pagination'])
const currentPage = ref(1)
const selectedIndustry = ref(null)
const isModalOpen = ref(false)
const loading = ref(false)

const showModal = () => {
  isModalOpen.value = true
}
const closeModal = () => {
  isModalOpen.value = false
  selectedIndustry.value = null
  industryForm.value = { title: {} }
}
const editIndustry = (industry) => {
  selectedIndustry.value = industry
  industryForm.value = {
    id: industry.id,
    title: {
      ...industry.title
    }
  }

  showModal()
}

const perPage = ref(20)
const industryForm = ref({ title: {}})
const formFilter = reactive({ keyword: '' })

watch(
  [formFilter],
  debounce(() => {
    fetchIndustries()
  }, 300)
)


/* START: Thêm ngôn ngữ */ 
const lang = ref('vi') // Đặt mặc định Ngôn Ngữ

Languages.value.forEach(code => { // Đồng bộ các key cho Trường thông tin theo ngôn ngữ
  if (!(code in industryForm.value.title)) {
    industryForm.value.title[code] = ''
  }
})

// Gán giá trị nếu thay đổi Fullname
const currentFullName = computed({
  get() {
    return industryForm.value.title[lang.value] || ''
  },
  set(val) {
    industryForm.value.title[lang.value] = val
  }
})
/* END: Thêm ngôn ngữ */ 

const fetchIndustries = async (page = 1) => {
  loading.value = true
  try {
    const params = { keyword: formFilter.keyword }
    await store.dispatch('industries/fetchIndustries', { page: currentPage.value, perPage: perPage.value, params })
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchIndustries()
})

const goToPage = (page) => {
  if (page > 0 && page <= pagination.value.last_page) {
    currentPage.value = page
    fetchIndustries()
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

const deleteIndustry = async (id) => {
  const result = await Swal.fire({
    title: 'Bạn có chắc chắn muốn xóa ngành nghề này?',
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
      const data = await store.dispatch('industries/deleteIndustry', id)
      Swal.fire({
        title: 'Thành công!',
        text: data.message,
        icon: 'success',
        confirmButtonText: 'OK',
      })
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

const handleSubmit = async () => {
  loading.value = true
  try {
    const action = selectedIndustry.value ? 'industries/updateIndustry' : 'industries/addIndustry'
    const data = await store.dispatch(action, industryForm.value)
    toastr.success(`${data.message}`)
    industryForm.value = { title: '' }
    selectedIndustry.value = null
    closeModal()
  } catch (error) {
    handleApiError(error)
  } finally {
    loading.value = false
  }
}
</script>
