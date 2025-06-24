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
            <router-link :to="{ name: 'jobs.index' }" class="text-sm font-medium hover:text-blue-600 md:ml-2">Quản lý job order</router-link>
          </div>
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
    <Title :title="route.meta.title" class="flex-1" />

    <form @submit.prevent="submitJob" class="space-y-4">
      <div class="space-y-1">
        <label class="block text-sm font-medium">
          Khách hàng
          <span class="text-red-600">*</span>
        </label>
        <VueMultiselect class="flex-1" v-model="selectedCustomer" :options="customers" :taggable="true" label="name" :searchable="true" track-by="id" @select="onCustomerChange"></VueMultiselect>
      </div>
      <div class="space-y-1">
        <label class="block text-sm font-medium">
          Người phụ trách
          <span class="text-red-600">*</span>
        </label>
        <VueMultiselect v-model="selectedUsers" :options="users" :taggable="true" label="name" :searchable="true" track-by="id" multiple placeholder="Chọn người phụ trách" @select="onUsersChange" @remove="onUsersChange" @search-change="debouncedSearchUsers"></VueMultiselect>
      </div>
      <div class="space-y-1">
        <label class="block text-sm font-medium">
          ID JOB
          <span class="text-red-600">*</span>
        </label>
        <input v-model="form.job_title" class="form-control" placeholder="ID JOB" />
      </div>
      <div class="space-y-1">
        <label class="block text-sm font-medium">
          Trạng thái
          <span class="text-red-600">*</span>
        </label>
        <VueMultiselect class="flex-1" v-model="selectedStatus" :options="statuses" :taggable="true" label="name" track-by="id" placeholder="Chọn trạng thái" @select="onStatusChange"></VueMultiselect>
      </div>
      <div class="space-y-1">
        <label class="block text-sm font-medium">
          Vị trí tuyển dụng
          <span class="text-red-600">*</span>
        </label>
        <input v-model="form.position" class="form-control" placeholder="Vị trí tuyển dụng" />
      </div>
      <div class="space-y-1">
        <label class="block text-sm font-medium">
          Địa điểm làm việc
          <span class="text-red-600">*</span>
        </label>
        <VueMultiselect v-model="selectedDesiredLocations" :options="provinces" :taggable="true" label="name" :searchable="true" track-by="id" multiple placeholder="Chọn địa điểm" @select="onDesiredLocationsChange" @remove="onDesiredLocationsChange"></VueMultiselect>
      </div>
      <div class="space-y-1">
        <label class="block text-sm font-medium">
          Thông tin công ty
          <span class="text-red-600">*</span>
        </label>
        <quill-editor ref="quill" :modules="modules" :toolbar="toolbar" v-model:content="form.company_info" contentType="html" />
      </div>

      <div class="space-y-1">
        <label class="block text-sm font-medium">
          Mô tả công việc
          <span class="text-red-600">*</span>
        </label>
        <quill-editor ref="quill" :modules="modules" :toolbar="toolbar" v-model:content="form.job_description" contentType="html" />
      </div>

      <div class="space-y-1">
        <label class="block text-sm font-medium">
          Yêu cầu vị trí
          <span class="text-red-600">*</span>
        </label>
        <quill-editor ref="quill" :modules="modules" :toolbar="toolbar" v-model:content="form.requirements" contentType="html" />
      </div>

      <div class="space-y-1">
        <label class="block text-sm font-medium">
          Chế độ phúc lợi
          <span class="text-red-600">*</span>
        </label>
        <quill-editor ref="quill" :modules="modules" :toolbar="toolbar" v-model:content="form.benefits" contentType="html" />
      </div>

      <div class="space-y-1">
        <label class="block text-sm font-medium">Thông tin khác</label>
        <quill-editor ref="quill" :modules="modules" :toolbar="toolbar" v-model:content="form.additional_info" contentType="html" />
      </div>

      <button type="submit" class="bg-primary text-white p-2 rounded">{{ isEditing ? 'Cập nhật' : 'Thêm mới' }}</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { useToastr } from '../../plugins/toastr'
import VueMultiselect from 'vue-multiselect'
import { handleApiError } from '../../helpers/apiErrorHandler'
import Loading from '../../components/Loading.vue'
import Title from '../../components/Title.vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import BlotFormatter from 'quill-blot-formatter'
import axiosInstance from '../../axios'
import { debounce } from 'lodash'
// Khai báo editor
const quill = ref(null)
const modules = {
  module: BlotFormatter,
}
const toolbar = [[{ header: [1, 2, 3, 4, 5, 6, false] }], [{ size: ['small', false, 'large', 'huge'] }], ['bold', 'italic', 'underline', 'strike'], ['blockquote', 'code-block'], [{ align: [] }], [{ list: 'ordered' }, { list: 'bullet' }], [{ color: [] }, { background: [] }], [{ font: [] }], ['link', 'image', 'video'], ['clean']]

const selectedCustomer = ref({ id: 0, name: 'Chọn khách hàng' })
const selectedStatus = ref(null)
const onCustomerChange = () => {
  form.value.customer_id = selectedCustomer.value.id
}
const onStatusChange = () => {
  form.value.status = selectedStatus.value?.id || ''
}
const onDesiredLocationsChange = () => {
  form.value.locations = selectedDesiredLocations.value ? selectedDesiredLocations.value.map((loc) => loc.id) : []
}
const onUsersChange = () => {
  form.value.users = selectedUsers.value ? selectedUsers.value.map((user) => user.id) : []
}
const toastr = useToastr()
const route = useRoute()
const router = useRouter()
const store = useStore()
const loading = ref(false)
const isEditing = ref(false) // Mặc định là false (thêm mới)
const selectedDesiredLocations = ref([]) // Lưu nhiều địa điểm
const selectedUsers = ref([]) // Thêm biến cho người phụ trách
const provinces = computed(() => store.getters['candidates/provinces'])
const customers = computed(() => store.getters['customers/customerLists'] || [])
const users = computed(() => store.getters['user/userLists'] || []) // Lấy danh sách users
const statuses = ref([])
const form = ref({
  customer_id: '',
  job_title: '',
  position: '',
  company_info: '',
  job_description: '',
  requirements: '',
  benefits: '',
  additional_info: '',
  jd_template: null,
  status: '',
  locations: [], // Thêm trường locations
  users: [], // Thêm trường users
})

const fetchCustomerLists = async () => {
  try {
    await store.dispatch('customers/fetchCustomerLists')
  } catch (error) {
    console.error('Lỗi khi lấy danh sách khách hàng:', error)
  }
}
const fetchStatuses = async () => {
  try {
    const { data } = await axiosInstance.get('jobs/status')
    statuses.value = data.status
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error)
  }
}
const fetchShowJob = async () => {
  if (!route.params.id) return // Không gọi nếu không có id

  loading.value = true
  try {
    const data = await store.dispatch('jobs/fetchShowJob', route.params.id)
    if (!data || !data.job) {
      throw new Error('Dữ liệu trả về không hợp lệ')
    }

    const customerIndex = customers.value.findIndex((c) => c.id === data.job.customer_id)
    selectedCustomer.value = customerIndex !== -1 ? customers.value[customerIndex] : null

    const statusIndex = statuses.value.findIndex((s) => s.id === data.job.status)
    selectedStatus.value = statusIndex !== -1 ? statuses.value[statusIndex] : null
    // Xử lý locations, đảm bảo là mảng
    selectedDesiredLocations.value = data.job.locations || []
    selectedUsers.value = data.job.users || [] // Gán người phụ trách
    Object.assign(form.value, {
      id: data.job.id ?? form.value.id,
      customer_id: data.job.customer_id ?? form.value.customer_id,
      job_title: data.job.job_title ?? form.value.job_title,
      position: data.job.position ?? form.value.position,
      status: data.job.status ?? form.value.status,
      company_info: data.job.company_info ?? form.value.company_info,
      job_description: data.job.job_description ?? form.value.job_description,
      requirements: data.job.requirements ?? form.value.requirements,
      benefits: data.job.benefits ?? form.value.benefits,
      additional_info: data.job.additional_info ?? form.value.additional_info,
      jd_template: data.job.jd_template ?? form.value.jd_template,
      status: data.job.status ?? form.value.status,
      locations: data.job.locations ? data.job.locations.map((loc) => loc.id) : [],
      users: data.job.users ? data.job.users.map((user) => user.id) : [], // Gán users
    })
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu job:', error)
    toastr.error('Không thể tải dữ liệu công việc')
  } finally {
    loading.value = false
  }
}
onMounted(async () => {
  if (route.params.id) {
    // Chế độ cập nhật
    isEditing.value = true
    await Promise.all([fetchCustomerLists(), fetchStatuses(), fetchShowJob(), store.dispatch('candidates/fetchProvinces'), store.dispatch('user/fetchUserLists')])
  } else {
    // Chế độ thêm mới
    isEditing.value = false
    await Promise.all([fetchCustomerLists(), fetchStatuses(), store.dispatch('candidates/fetchProvinces'), store.dispatch('user/fetchUserLists')])
  }
})
const submitJob = async () => {
  loading.value = true
  const action = isEditing.value ? 'jobs/updateJob' : 'jobs/addJob'
  const formData = new FormData()
  Object.keys(form.value).forEach((key) => {
    if (key === 'locations') {
      formData.append('locations', form.value.locations.length > 0 ? JSON.stringify(form.value.locations) : '')
    } else if (key === 'users') {
      formData.append('users', form.value.users.length > 0 ? JSON.stringify(form.value.users) : '')
    } else {
      formData.append(key, form.value[key] || '')
    }
  })
  try {
    const data = await store.dispatch(action, formData)
    toastr.success(`${data.message}`)
    router.push({ name: 'jobs.index' })
  } catch (error) {
    handleApiError(error)
  } finally {
    loading.value = false
  }
}
const debouncedSearchUsers = debounce(async (query) => {
  if (!query) {
    store.commit('user/SET_USER_LISTS', [])
    return
  }
  try {
    await store.dispatch('user/fetchUserLists', query)
  } catch (error) {
    console.error('Lỗi khi tìm kiếm users:', error)
  }
}, 300)
</script>
