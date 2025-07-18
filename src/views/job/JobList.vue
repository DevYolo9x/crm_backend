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
      <Title :title="route.meta.title" class="flex-1" />
      <router-link :to="{ name: 'jobs.create' }" class="text-[14px] py-[7px] px-[10px] btn-success !w-auto flex items-center col-span-2 justify-center" v-if="can(userPermissions, 'jobs', 'create')">
        <PlusIcon class="block h-5 w-5 text-white" aria-hidden="true" />
        Thêm mới
      </router-link>
    </div>
    <div class="grid md:grid-cols-12 gap-2">
      <div class="md:col-span-2">
        <VueMultiselect class="flex-1" v-model="selectedUserFilter" :clearable="true" :multiple="false" :options="users" :searchable="true" label="name" track-by="id" placeholder="Tìm kiếm người tạo" :loading="userLoading" @search-change="debouncedSearchUsers" @select="selectedUserChangeFilter">
          <template v-if="selectedUserFilter && selectedUserFilter.id !== 0" #caret>
            <button @click.stop="clearSelectedUserFilter" class="absolute multiselect__clear top-1/2 translate-y-[-50%] z-10 right-[10px] text-[11px]">
              ✕
            </button>
          </template>
        </VueMultiselect>
      </div>
      <div class="md:col-span-2">
        <VueMultiselect class="flex-1" v-model="selectedCandidateFilter" :options="candidates" :searchable="true" label="full_name" track-by="id" placeholder="Tìm kiếm ứng viên" :loading="candidateLoading" @search-change="debouncedSearchCandidates" @select="selectedCandidateChangeFilter">
          <template v-if="selectedCandidateFilter && selectedCandidateFilter.id !== 0" #caret>
            <button @click.stop="clearSelectedCandidateFilter" class="absolute multiselect__clear top-1/2 translate-y-[-50%] z-10 right-[10px] text-[11px]">
              ✕
            </button>
          </template>
        </VueMultiselect>
      </div>
      <div class="md:col-span-2">
        <VueMultiselect class="flex-1" v-model="selectedCustomerFilter" :options="customers" :searchable="true" label="name" track-by="id" placeholder="Tìm kiếm khách hàng" :loading="customerLoading" @search-change="debouncedSearchCustomers" @select="onCustomerChangeFilter">
          <template v-if="selectedCustomerFilter && selectedCustomerFilter.id !== 0" #caret>
            <button @click.stop="clearSelectedCustomerFilter" class="absolute multiselect__clear top-1/2 translate-y-[-50%] z-10 right-[10px] text-[11px]">
              ✕
            </button>
          </template>
        </VueMultiselect>
      </div>
      <div class="md:col-span-2">
        <VueMultiselect class="flex-1" v-model="selectedStatusFilter" :options="statuses" :taggable="true" label="name" :searchable="true" track-by="id" @select="onStatusChangeFilter">
          <template v-if="selectedStatusFilter && selectedStatusFilter.id !== 0" #caret>
            <button @click.stop="clearSelectedStatusFilter" class="absolute multiselect__clear top-1/2 translate-y-[-50%] z-10 right-[10px] text-[11px]">
              ✕
            </button>
          </template>
        </VueMultiselect>
      </div>
      <div class="md:col-span-2">
        <VueMultiselect class="flex-1" v-model="selectedLocationFilter" :options="provinces" :searchable="true" label="name" track-by="id" placeholder="Tìm kiếm địa điểm" @select="onLocationChangeFilter">
          <template v-if="selectedLocationFilter && selectedLocationFilter.id !== 0" #caret>
            <button @click.stop="clearSelectedLocationFilter" class="absolute multiselect__clear top-1/2 translate-y-[-50%] z-10 right-[10px] text-[11px]">
              ✕
            </button>
          </template>
        </VueMultiselect>
      </div>
      <div class="md:col-span-2">
        <VueMultiselect class="flex-1" v-model="selectedResponsibleUserFilter" :options="users" :searchable="true" label="name" track-by="id" placeholder="Tìm kiếm người phụ trách" :loading="userLoading" @search-change="debouncedSearchUsers" @select="onResponsibleUserChangeFilter">
          <template v-if="selectedResponsibleUserFilter && selectedResponsibleUserFilter.id !== 0" #caret>
            <button @click.stop="clearSelectedResponsibleUserFilter" class="absolute multiselect__clear top-1/2 translate-y-[-50%] z-10 right-[10px] text-[11px]">
              ✕
            </button>
          </template>
        </VueMultiselect>
      </div>
      <div class="md:col-span-2">
        <input type="text" class="form-control flex-1" placeholder="Nhập từ khóa tìm kiếm" v-model="formFilter.keyword" />
      </div>
    </div>
    <div>
      <table class="table-order text-sm w-full text-left rtl:text-right">
        <thead class=" bg-[#e5e5e5] dark:bg-gray-700 dark:text-gray-400">
          <tr class="">
            <th class="font-medium">STT</th>
            <th class="p-2 font-medium">Khách hàng</th>
            <th class="p-2 font-medium">Tiêu đề JOB</th>
            <th class="p-2 font-medium">Vị trí tuyển dụng</th>
            <th class="p-2 font-medium">Địa điểm làm việc</th>
            <th class="p-2 font-medium">Tình trạng</th>
            <th class="p-2 font-medium">Người tạo</th>
            <th class="p-2 font-medium">Người phụ trách</th>
            <th class="p-2 font-medium">Ngày tạo</th>
            <th class="text-right" v-if="can(userPermissions, 'jobs', 'edit') || can(userPermissions, 'jobs', 'destroy')">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(job, key) in jobs" :key="job.id" class="border-b hover:bg-gray-100">
            <td>{{ key + 1 }}</td>
            <td class="p-2">{{ `${job.customer?.code}-${job.customer?.name}` || '-' }}</td>
            <td class="p-2 font-medium text-blue-600">{{ job.job_title }}</td>
            <td class="p-2">{{ job.position }}</td>
            <td class="p-2 w-[200px]">
              <div class="flex flex-wrap gap-1">
                <div v-for="location in job.locations" :key="location.id" class="p-1 rounded-sm border border-red-300 bg-red-100 text-red-800 text-xs">
                  {{ location.name }}
                </div>
              </div>
            </td>
            <td class="p-2">
              <!-- <span :style="{ backgroundColor: getStatusColor(job.status), color: '#fff' }" class="inline-block px-2 py-1 rounded text-xs">
                {{ job.status }}
              </span> -->
              
              <span :class="getStatusClass(job.status)" class="inline-block px-2 py-1 rounded text-xs">
                {{ job.status }}
              </span>
            </td>
            <td class="p-2">{{ `${job.user?.code}-${job.user?.name}` || '-' }}</td>
            <td class="p-2 w-[200px]">
              <div class="flex flex-wrap gap-1">
                <div v-for="user in job.users" :key="user.id" class="p-1 rounded-sm border border-green-300 bg-green-100 text-green-800 text-xs">
                  {{ user.name }}
                </div>
              </div>
            </td>
            <td class="p-2">{{ job.created_at }}</td>
            <td v-if="can(userPermissions, 'jobs', 'edit') || can(userPermissions, 'jobs', 'destroy')" class="flex flex-col space-y-1 whitespace-nowrap">
              <div class="flex items-center space-x-1 justify-end">
                <router-link :to="{ name: 'CandidateJobs', params: { id: job.id } }" class="text-[14px] py-[7px] px-[10px] bg-black text-white !w-auto flex items-center" v-if="can(userPermissions, 'jobs', 'index')">
                  <PlusIcon class="block h-5 w-5 text-white mr-1" />
                  Danh sách ứng viên
                </router-link>
                <button @click="showJob(job.id)" class="text-[14px] py-[7px] px-[10px] btn-warning !w-auto flex items-center">
                  <EyeIcon class="block h-5 w-5 text-white mr-1" />
                  Xem
                </button>
              </div>
              <div class="flex items-center space-x-1 justify-end">
                <button @click="downloadJob(job)" class="text-[14px] py-[7px] px-[10px] btn-success !w-auto flex items-center">
                  <DownloadIcon class="block h-5 w-5 text-white mr-1" />
                  Tải Job
                </button>
                <router-link :to="{ name: 'jobs.update', params: { id: job.id } }" class="text-[14px] py-[7px] px-[10px] btn-primary !w-auto flex items-center" v-if="can(userPermissions, 'jobs', 'edit')">
                  <PencilAltIcon class="block h-5 w-5 text-white mr-1" />
                  Sửa
                </router-link>
                <button @click="deleteJob(job.id)" class="text-[14px] py-[7px] px-[10px] btn-danger !w-auto flex items-center" v-if="can(userPermissions, 'jobs', 'destroy')">
                  <XCircleIcon class="block h-5 w-5 text-white mr-1" />
                  Xóa
                </button>
              </div>
              <div class="flex justify-end">
                
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Pagination -->
    <div class="flex justify-between items-center mt-4">
      <span class="text-sm">Trang {{ pagination.current_page }} của {{ pagination.last_page }} (Tổng: {{ pagination.total }} mục)</span>
      <div class="flex space-x-2" v-if="pagination.last_page > 1">
        <button @click.prevent="goToPage(pagination.current_page - 1)" :disabled="pagination.current_page === 1" class="btn bg-gray-300 text-white px-3 py-1 rounded disabled:opacity-50">Trước</button>
        <button v-for="page in getPageNumbers" :key="page" @click="goToPage(page)" :class="['btn px-3 py-1 rounded', page === currentPage ? 'bg-primary !text-white !border-primary' : 'bg-gray-300 text-black', page === '...' ? 'cursor-default bg-gray-200 text-gray-500' : '']" :disabled="page === '...'">
          {{ page }}
        </button>
        <button @click.prevent="goToPage(pagination.current_page + 1)" :disabled="pagination.current_page === pagination.last_page" class="btn bg-gray-300 text-white px-3 py-1 rounded disabled:opacity-50">Sau</button>
      </div>
    </div>
  </div>
  <!-- Modal hiển thị chi tiết job -->
  <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-screen overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Chi tiết Job Order</h2>
      </div>
      <div v-if="selectedJob" class="grid grid-cols-4 gap-4">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium">ID JOB:</label>
          <p>{{ selectedJob.job_title }}</p>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium">Địa điểm làm việc:</label>
          <p>{{ selectedJob.locations.map((loc) => loc.name).join(', ') || 'N/A' }}</p>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium">Người phụ trách:</label>
          <p>{{ selectedJob.users.map((user) => user.name).join(', ') || 'N/A' }}</p>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium">Trạng thái:</label>
          <p>
            <span :style="{ backgroundColor: getStatusColor(selectedJob.status), color: '#fff' }" class="inline-block px-2 py-1 rounded">
              {{ selectedJob.status }}
            </span>
          </p>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium">Khách hàng:</label>
          <p>{{ selectedJob.customer?.name || 'N/A' }}</p>
        </div>
        <div class="md:col-span-3">
          <label class="block text-sm font-medium">Vị trí tuyển dụng:</label>
          <p>{{ selectedJob.position }}</p>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium">Thông tin công ty:</label>
          <div v-html="selectedJob.company_info"></div>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium">Mô tả công việc:</label>
          <div v-html="selectedJob.job_description"></div>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium">Yêu cầu vị trí:</label>
          <div v-html="selectedJob.requirements"></div>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium">Chế độ phúc lợi:</label>
          <div v-html="selectedJob.benefits"></div>
        </div>
        <div class="md:col-span-4">
          <label class="block text-sm font-medium">Thông tin khác:</label>
          <div v-html="selectedJob.additional_info || 'N/A'"></div>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium">Người tạo:</label>
          <p>{{ selectedJob.user || 'N/A' }}</p>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium">Ngày tạo:</label>
          <p>{{ selectedJob.created_at }}</p>
        </div>
      </div>
      <div class="mt-6 flex justify-end">
        <button @click="closeModal" class="btn btn-danger !w-auto">Đóng</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PlusIcon, PencilAltIcon, XCircleIcon, EyeIcon, DownloadIcon } from '@heroicons/vue/solid'
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { useStore } from 'vuex'
import { debounce } from 'lodash'
import { useRoute } from 'vue-router'
import Swal from 'sweetalert2'
import Title from '../../components/Title.vue'
import Loading from '../../components/Loading.vue'
import { handleApiError } from '../../helpers/apiErrorHandler'
import { useToastr } from '../../plugins/toastr'
import VueMultiselect from 'vue-multiselect'
import { can } from '../../helpers/permissions' // Import the can helper
import axiosInstance from '../../axios'
const userPermissions = computed(() => store.getters['auth/permissions'] || {})
const toastr = useToastr()
const route = useRoute()
const store = useStore()
const customers = computed(() => store.getters['customers/customerLists'] || [])
const jobs = computed(() => store.getters['jobs/jobs'])
const pagination = computed(() => store.getters['jobs/pagination'])
const candidates = computed(() => store.getters['candidates/candidateLists'] || [])
const provinces = computed(() => store.getters['candidates/provinces'] || [])
const users = computed(() => store.getters['user/userLists'] || [])
const statuses = ref([])
const showModal = ref(false) // Trạng thái hiển thị modal
const selectedJob = ref(null) // Job được chọn để hiển thị
const showJob = async (id) => {
  loading.value = true
  try {
    const data = await store.dispatch('jobs/fetchShowJob', id)
    if (data && data.job) {
      selectedJob.value = data.job
      showModal.value = true
    } else {
      toastr.error('Không thể tải thông tin job')
    }
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết job:', error)
    toastr.error('Không thể tải thông tin job')
  } finally {
    loading.value = false
  }
}
const closeModal = () => {
  showModal.value = false
  selectedJob.value = null
}
const getStatusColor = (statusId) => {
  const status = statuses.value.find((s) => s.id === statusId)
  return status ? status.color : '#000000' // Mặc định đen nếu không tìm thấy
}

const getStatusClass = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Open':
      return 'bg-blue-100 text-blue-800';
    case 'Closed':
      return 'bg-gray-100 text-gray-800';
    case 'Urgent':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800'; // fallback
  }
}

const currentPage = ref(1)
const selectedUserFilter = ref({ id: 0, name: 'Người tạo' })
const selectedCandidateFilter = ref({ id: 0, full_name: 'Ứng viên' })
const selectedCustomerFilter = ref({ id: 0, name: 'Chọn khách hàng' })
const selectedStatusFilter = ref({ id: '', name: 'Trạng thái' })
const selectedLocationFilter = ref({ id: 0, name: 'Địa điểm' })
const selectedResponsibleUserFilter = ref({ id: 0, name: 'Người phụ trách' }) // Thêm bộ lọc người phụ trách
const perPage = ref(20) // Số sản phẩm mỗi trang
const loading = ref(false)
const formFilter = reactive({
  customer_id: 0,
  keyword: '',
  status: '',
  created_by: 0,
  candidate_id: 0,
  location_id: 0, // Thêm location_id vào bộ lọc
  user_id: 0, // Thêm user_id vào bộ lọc
})

watch(
  [formFilter],
  debounce(() => {
    fetchJobs()
  }, 300)
)
const fetchStatus = async () => {
  try {
    const { data } = await axiosInstance.get('jobs/status')
    statuses.value = data.status
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error)
  }
}

const fetchJobs = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      keyword: formFilter.keyword,
      customer_id: formFilter.customer_id,
      status: formFilter.status,
      created_by: formFilter.created_by,
      candidate_id: formFilter.candidate_id,
      location_id: formFilter.location_id,
      user_id: formFilter.user_id, // Thêm user_id vào params
    }
    await store.dispatch('jobs/fetchJobs', { page: currentPage.value, perPage: perPage.value, params: params })
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error)
  } finally {
    loading.value = false
  }
}

const clearSelectedUserFilter = () => {
  selectedUserFilter.value = { id: 0, name: 'Người tạo' }
  formFilter.created_by = 0
}

const clearSelectedCandidateFilter = () => {
  selectedCandidateFilter.value = { id: 0, full_name: 'Ứng viên' }
  formFilter.candidate_id = 0
}

const clearSelectedCustomerFilter = () => {
  selectedCustomerFilter.value = { id: 0, name: 'Chọn khách hàng' }
  formFilter.customer_id = 0
}

const clearSelectedStatusFilter = () => {
  selectedStatusFilter.value = { id: 0, name: 'Trạng thái' }
  formFilter.status = ''
}

const clearSelectedLocationFilter = () => {
  selectedLocationFilter.value = { id: 0, name: 'Địa điểm' }
  formFilter.location_id = ''
}

const clearSelectedResponsibleUserFilter = () => {
  selectedResponsibleUserFilter.value = { id: 0, name: 'Người phụ trách' }
  formFilter.user_id = 0
}

onMounted(async () => {
  await fetchJobs()
  await Promise.all([fetchStatus(), store.dispatch('candidates/fetchProvinces')])
})
// Pagination
const goToPage = (page) => {
  if (page > 0 && page <= pagination.value.last_page) {
    currentPage.value = page
    fetchJobs()
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
const deleteJob = async (id) => {
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
      const data = await store.dispatch('jobs/deleteJob', id)
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
const onCustomerChangeFilter = () => {
  formFilter.customer_id = selectedCustomerFilter.value.id
}
const selectedUserChangeFilter = () => {
  formFilter.created_by = selectedUserFilter.value.id
}
const selectedCandidateChangeFilter = () => {
  formFilter.candidate_id = selectedCandidateFilter.value.id
}
const onStatusChangeFilter = () => {
  formFilter.status = selectedStatusFilter.value.id
}
const onLocationChangeFilter = () => {
  formFilter.location_id = selectedLocationFilter.value.id
}
const onResponsibleUserChangeFilter = () => {
  formFilter.user_id = selectedResponsibleUserFilter.value.id
}
const userLoading = ref(false)
const candidateLoading = ref(false)
const customerLoading = ref(false)
// Debounced search functions
const debouncedSearchUsers = debounce(async (query) => {
  if (!query) {
    store.commit('user/SET_USER_LISTS', [])
    return
  }
  userLoading.value = true
  try {
    await store.dispatch('user/fetchUserLists', query)
  } finally {
    userLoading.value = false
  }
}, 300)

const debouncedSearchCustomers = debounce(async (query) => {
  if (!query) {
    store.commit('customers/setCustomerLists', [])
    return
  }
  customerLoading.value = true
  try {
    await store.dispatch('customers/fetchCustomerLists', query)
  } finally {
    customerLoading.value = false
  }
}, 300)

const debouncedSearchCandidates = debounce(async (query) => {
  if (!query) {
    store.commit('candidates/setCandidateLists', [])
    return
  }
  candidateLoading.value = true
  try {
    await store.dispatch('candidates/fetchCandidateLists', query)
  } finally {
    candidateLoading.value = false
  }
}, 300)
const downloadJob = async (job) => {
  try {
    const response = await axiosInstance.get(`jobs/${job.id}/export-pdf`, {
      responseType: 'blob', // Quan trọng: để nhận dữ liệu dạng binary (PDF)
    })
    // Tạo URL tạm thời để tải file
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `JD_${job.job_title}.pdf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    toastr.success('Tải file PDF thành công')
  } catch (error) {
    console.error('Lỗi khi tải PDF:', error)
    toastr.error('Không thể tải file PDF')
  }
}
</script>
