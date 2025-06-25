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
      <a href="" v-if="can(userPermissions, 'candidates', 'create')" class="btn btn-success !w-auto flex items-center" @click.prevent="showModal">
        <PlusIcon class="block h-6 w-6 text-white" aria-hidden="true" />
        Thêm mới
      </a>
    </div>
    <div class="grid md:grid-cols-12 space-x-1">
      <div class="md:col-span-3">
        <VueMultiselect v-if="users && users.length > 0" class="flex-1" v-model="selectedUserFilter" :options="users" :taggable="true" label="name" :searchable="true" track-by="id" @select="onUserChangeFilter" placeholder="Người tạo"></VueMultiselect>
      </div>
      <div class="md:col-span-2">
        <VueMultiselect class="flex-1" v-model="selectedIndustryFilter" :options="industries" :taggable="true" label="title" :searchable="true" track-by="id" @select="onIndustryChangeFilter" placeholder="Ngành nghề"></VueMultiselect>
      </div>
      <div class="md:col-span-2">
        <VueMultiselect class="flex-1" v-model="selectedLanguageFilter" :options="languages" :taggable="true" label="name" :searchable="true" track-by="id" @select="onLanguageChangeFilter" placeholder="Ngoại ngữ"></VueMultiselect>
      </div>
      <div class="md:col-span-3">
        <VueMultiselect class="flex-1" v-model="selectedDesiredLocationsFilter" :options="provinces" :taggable="true" label="name" :searchable="true" track-by="id" multiple @select="onDesiredLocationsChangeFilter" @remove="onDesiredLocationsChangeFilter" placeholder="Khu vực mong muốn"></VueMultiselect>
      </div>
      <div class="col-span-2">
        <input type="text" class="form-control flex-1" placeholder="Nhập từ khóa tìm kiếm" v-model="formFilter.keyword" />
      </div>
    </div>
    <div>
      <table class="table-order text-sm w-full text-left rtl:text-right">
        <thead class="text-white bg-primary dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th>STT</th>
            <th>Code</th>
            <th>Thông tin</th>
            <th>Ngành nghề</th>
            <th>Ngày hết hạn</th>
            <th>Ngày tạo</th>
            <th>Người tạo</th>
            <th class="text-right" v-if="can(userPermissions, 'candidates', 'edit') || can(userPermissions, 'candidates', 'destroy')">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(candidate, key) in candidates" :key="candidate.id" class="border-b hover:bg-gray-100">
            <td>{{ key + 1 }}</td>
            <td class="font-bold text-blue-600">{{ candidate.code }}</td>
            <td class="">
              <span class="font-bold">{{ candidate.full_name }}</span>
              <br />
              {{ candidate.email }}
              <br />
              {{ candidate.phone }}
            </td>
            <td>{{ candidate.industry }}</td>
            <td>{{ candidate.expiry_date }}</td>
            <td>{{ candidate.created_at }}</td>
            <td>{{ candidate.createBy }}</td>
            <td v-if="can(userPermissions, 'candidates', 'edit') || can(userPermissions, 'candidates', 'destroy')">
              <div class="whitespace-nowrap flex flex-col space-y-1">
                <div class="flex items-center space-x-1 justify-end">
                  <button @click="openAssignJobPopup(candidate.id)" class="btn btn-success !w-auto flex items-center">
                    <PlusIcon class="block h-6 w-6 text-white mr-1" />
                    Gán Job
                  </button>
                  <button @click="showCandidate(candidate.id)" class="btn btn-warning !w-auto flex items-center">
                    <EyeIcon class="block h-6 w-6 text-white mr-1" />
                    Xem
                  </button>
                </div>
                <div class="flex items-center space-x-1 justify-end">
                  <button @click="openToggleAssignUserPopup(candidate.id)" class="btn bg-black !w-auto flex items-center" v-if="can(userPermissions, 'candidates', 'administrator')">
                    <PlusIcon class="block h-6 w-6 text-white mr-1" />
                    <span class="text-white">Gán nhân viên</span>
                  </button>
                  <button @click="editCandidate(candidate)" class="btn btn-primary !w-auto flex items-center" v-if="can(userPermissions, 'candidates', 'edit')">
                    <PencilAltIcon class="block h-6 w-6 text-white mr-1" />
                    Sửa
                  </button>
                  <button @click="deleteCandidate(candidate.id)" class="btn btn-danger !w-auto flex items-center" v-if="can(userPermissions, 'candidates', 'destroy')">
                    <XCircleIcon class="block h-6 w-6 text-white mr-1" />
                    Xóa
                  </button>
                </div>
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
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl relative">
        <h2 class="text-lg font-semibold mb-4">{{ selectedCandidate ? 'Cập nhật ứng viên' : 'Thêm mới ứng viên' }}</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
                <span class="text-red-600">*</span>
              </label>
              <input v-model="candidateForm.full_name" type="text" @keydown.enter.prevent class="form-control" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
                <span class="text-red-600">*</span>
                <span v-if="validationErrors.phoneExists" class="text-red-600 text-[12px] ml-1">{{ validationMessageErrors.phoneExists }}</span>
              </label>
              <input v-model="candidateForm.phone" type="text" @keydown.enter.prevent class="form-control" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Email
                <span class="text-red-600">*</span>
                <span v-if="validationErrors.emailExists" class="text-red-600 text-[12px] ml-1">{{ validationMessageErrors.emailExists }}</span>
              </label>
              <input v-model="candidateForm.email" type="email" @keydown.enter.prevent class="form-control" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nhóm ngành nghề
                <span class="text-red-600">*</span>
              </label>
              <VueMultiselect v-model="selectedIndustryId" :multiple="true" :options="industries" :taggable="true" label="title" :searchable="true" track-by="id" @select="onIndustryIdChange" placeholder="Chọn nhóm ngành nghề"></VueMultiselect>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Học vấn</label>
              <VueMultiselect v-model="selectedEducation" :options="educations" :taggable="true" label="name" :searchable="true" track-by="id" @select="onEducationChange" placeholder="Chọn học vấn"></VueMultiselect>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ngoại ngữ</label>
              <VueMultiselect v-model="selectedLanguage" :options="languages" :taggable="true" label="name" :searchable="true" track-by="id" @select="onLanguageChange" placeholder="Chọn ngoại ngữ"></VueMultiselect>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Chỗ ở hiện tại
                <span class="text-red-600">*</span>
              </label>
              <VueMultiselect v-model="selectedCurrentLocation" :options="provinces" :taggable="true" label="name" :searchable="true" track-by="id" @select="onCurrentLocationChange" placeholder="Chọn chỗ ở hiện tại"></VueMultiselect>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Khu vực mong muốn làm việc
                <span class="text-red-600">*</span>
              </label>
              <VueMultiselect v-model="selectedDesiredLocation" :options="provinces" :taggable="true" label="name" :searchable="true" track-by="id" @select="onDesiredLocationChange" multiple placeholder="Chọn"></VueMultiselect>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tóm tắt kinh nghiệm và nhận xét</label>
            <quill-editor ref="quill" :modules="modules" :toolbar="toolbar" v-model:content="candidateForm.experience_summary" contentType="html" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">File CV không có thông tin liên hệ</label>
              <input type="file" @change="onFileChange($event, 'cv_no_contact')" class="form-control-file" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">File CV có thông tin liên hệ</label>
              <input type="file" @change="onFileChange($event, 'cv_with_contact')" class="form-control-file" />
            </div>
          </div>
          <div class="flex justify-end space-x-2">
            <button @click="closeModal" class="btn btn-danger !w-auto">Hủy</button>
            <button type="submit" class="btn btn-primary !w-auto">{{ selectedCandidate ? 'Cập nhật' : 'Thêm mới' }}</button>
          </div>
        </form>
      </div>
    </div>
    <CandidateDetail :candidateId="selectedCandidateId" :isVisible="isShowCandidate" @close="closeCandidateDetail" />
    <!-- Popup gán job -->
    <div v-if="showAssignJobPopup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] !my-0">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl relative">
        <h3 class="text-lg font-semibold mb-4">Gán Job cho {{ selectedCandidateFullName }}</h3>
        <Loading :loading="loadingAssignJob" />
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Chọn Job</label>
            <VueMultiselect v-model="selectedJob" :options="jobs" :taggable="true" label="job_title" track-by="id" placeholder="Nhập từ khóa để tìm kiếm Job" :searchable="true" :loading="loadingJobs" @search-change="debouncedSearchJobs" @select="onJobChange"></VueMultiselect>
          </div>
          <div class="flex justify-end space-x-2">
            <button @click="closeAssignJobPopup" class="btn btn-danger !w-auto">Hủy</button>
            <button @click="assignJob" class="btn btn-primary !w-auto" :disabled="!selectedJob">Xác nhận</button>
          </div>
        </div>
      </div>
    </div>
    <!-- END -->

    <!-- Popup gán nhân viên -->
    <div v-if="toggleAssignUserPopup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] !my-0">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl relative">
        <h3 class="text-lg font-semibold mb-4">Gán nhân viên cho ứng viên: {{ selectedCandidateFullName }}</h3>
        <Loading :loading="loadingAssignJob" />
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Chọn nhân viên</label>
            <VueMultiselect
              v-model="selectedUsersAssign"
              :options="usersAssign"
              :taggable="true"
              :multiple="true"
              @search-change="handleSearchUser"
              label="name"     
              track-by="id"
              placeholder="Nhập từ khóa để tìm kiếm Nhân viên"
              :searchable="true"
            />
          </div>
          <div class="flex justify-end space-x-2">
            <button @click="closeToggleAssignUserPopup" class="btn btn-danger !w-auto">Hủy</button>
            <button @click="handleAssignUsers" class="btn btn-primary !w-auto" :disabled="!selectedUsersAssign">Xác nhận</button>
          </div>
        </div>
      </div>
    </div>
    <!-- END -->
  </div>
</template>

<script setup>
import { PlusIcon, PencilAltIcon, XCircleIcon, EyeIcon, CloudDownloadIcon } from '@heroicons/vue/solid'
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { useStore } from 'vuex'
import { debounce } from 'lodash'
import { useRoute } from 'vue-router'
import Swal from 'sweetalert2'
import Title from '../../components/Title.vue'
import Loading from '../../components/Loading.vue'
import { handleApiError } from '../../helpers/apiErrorHandler'
import { useToastr } from '../../plugins/toastr'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import BlotFormatter from 'quill-blot-formatter'
import VueMultiselect from 'vue-multiselect'
import axiosInstance from '../../axios'
import { can } from '../../helpers/permissions' // Import the can helper
import CandidateDetail from '../../components/candidate/CandidateDetail.vue'
const userPermissions = computed(() => store.getters['auth/permissions'] || {})
const quill = ref(null)
const modules = { module: BlotFormatter }
const toolbar = [[{ header: [1, 2, 3, 4, 5, 6, false] }], [{ size: ['small', false, 'large', 'huge'] }], ['bold', 'italic', 'underline', 'strike'], ['blockquote', 'code-block'], [{ align: [] }], [{ list: 'ordered' }, { list: 'bullet' }], [{ color: [] }, { background: [] }], [{ font: [] }], ['link', 'image', 'video'], ['clean']]

const toastr = useToastr()
const route = useRoute()
const store = useStore()

const candidates = computed(() => store.getters['candidates/candidates'])
const pagination = computed(() => store.getters['candidates/pagination'])
const industries = computed(() => store.getters['industries/industryLists'])
const provinces = computed(() => store.getters['candidates/provinces'])
const educations = computed(() => store.getters['candidates/educations'])
const languages = computed(() => store.getters['candidates/languages'])

const users = ref([])
const currentPage = ref(1)
const selectedCandidate = ref(null)
const isModalOpen = ref(false)
const isShowCandidate = ref(false)
const selectedCandidateId = ref(null)
const loading = ref(false)
const selectedIndustryFilter = ref(null)
const selectedUserFilter = ref(null)
const selectedLanguageFilter = ref(null) // Thêm bộ lọc ngoại ngữ
const selectedDesiredLocationsFilter = ref([]) // Thêm bộ lọc khu vực mong muốn
const selectedIndustryId = ref([])
const selectedEducation = ref(null)
const selectedLanguage = ref(null)
const selectedCurrentLocation = ref(null)
const selectedDesiredLocation = ref(null)
const showAssignJobPopup = ref(false) // Trạng thái hiển thị popup
const toggleAssignUserPopup = ref(false) // Popup gán nhân viên
const selectedJob = ref(null) // Job được chọn để gán
const jobs = ref([]) // Danh sách jobs
const selectedCandidateFullName = ref('') // Tên ứng viên được chọn
const loadingAssignJob = ref(false) // Trạng thái loading khi gán job
const loadingJobs = ref(false) // Trạng thái loading khi tìm kiếm jobs
const candidateForm = ref({
  full_name: '',
  phone: '',
  email: '',
  industry_id: [],
  education: '',
  language: '',
  language_other: '',
  current_location: '',
  desired_location: [],
  experience_summary: '',
  cv_no_contact: null,
  cv_with_contact: null,
})
const selectedUsersAssign =  ref([]) // Job được chọn để gán
const usersAssign = ref([])

const validationErrors = reactive({
  phoneExists: false,
  emailExists: false,
})

const validationMessageErrors = reactive({
  phoneExists: '',
  emailExists: '',
})

// Danh sách jobs
const formFilter = reactive({
  keyword: '',
  industry_id: 0,
  created_by: 0,
  language: '', // Thêm vào formFilter
  desired_locations: [], // Thêm vào formFilter
})
watch(
  [formFilter],
  debounce(() => {
    fetchCandidates()
  }, 300)
)

/* START: Check thông tin tồn tại */
const checkExists = async () => {
  const { phone, email } = candidateForm.value
  if (!phone && !email) return // Không cần gọi nếu rỗng

  try {
    const res = await axiosInstance.get('candidates/check-exists', {
      params: { phone, email }
    })
    validationErrors.emailExists = res.data.email.status
    validationErrors.phoneExists = res.data.phone.status

    validationMessageErrors.phoneExists = res.data.phone.message
    validationMessageErrors.emailExists = res.data.email.message
  } catch (error) {
    console.error('Lỗi khi kiểm tra tồn tại:', error)
  }
}

// Debounce để tránh spam API
const debouncedCheck = debounce(() => {
  checkExists()
}, 500)

// Watch thay đổi phone & email
watch(
  () => [candidateForm.value.phone, candidateForm.value.email],
  debouncedCheck
)

/* END */

/* START: Thông tin gán Ứng viên cho Nhân viên */
const handleAssignUsers = async() => { // Gán các thành viên cho ứng viên
  try {
    const payload = {
      candidate_id: selectedCandidateId.value,
      users: selectedUsersAssign.value,
    }
    console.log(payload)
    const res = await store.dispatch('candidates/assignCandidateToUser', payload)
    toastr.success(res.message)
  } catch (error) {
    console.log('Lỗi khi tạo: ', error)
  }
}

const handleSearchUser = debounce(async(query) => { // Tìm kiếm user
  try {
    const res = await axiosInstance.get('users/search', {
      params: { keyword: query },
    })
    usersAssign.value = res.data || []    
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error)
  }
}, 300)

const openToggleAssignUserPopup = (candidateId) => { // Hiển thị Form
  const candidate = candidates.value.find((c) => c.id === candidateId)
  if (candidate) {
    selectedCandidateId.value = candidateId
    selectedCandidateFullName.value = `${candidate.code} - ${candidate.full_name}`
  }

  // Cập nhật nhân viên đã có
  console.log(candidate.users);
  if( candidate.users.length > 0 ) {
    selectedUsersAssign.value = candidate.users
  }

  toggleAssignUserPopup.value = true
}

const closeToggleAssignUserPopup = () => { // Đóng Form
  usersAssign.value = [];
  selectedUsersAssign.value = []
  toggleAssignUserPopup.value = false

  // Reset dữ liệu ứng viên selected
  selectedCandidateId.value = ''
  selectedCandidateFullName.value = ''
}
/* END */


const fetchCandidates = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      keyword: formFilter.keyword,
      industry_id: formFilter.industry_id,
      created_by: formFilter.created_by,
      language: formFilter.language, // Gửi bộ lọc ngoại ngữ
      desired_locations: formFilter.desired_locations, // Gửi bộ lọc khu vực mong
    }
    await store.dispatch('candidates/fetchCandidates', { page: currentPage.value, perPage: 20, params })
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error)
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  try {
    const { data } = await axiosInstance.get('users/lists')
    users.value = data
  } catch (error) {
    console.error('Lỗi khi lấy danh sách users:', error)
  }
}
const searchJobs = async (query) => {
  try {
    const { data } = await axiosInstance.get('jobs', {
      params: { keyword: query },
    })
    jobs.value = data.lists || []
  } catch (error) {
    console.error('Lỗi khi tìm kiếm jobs:', error)
    toastr.error('Không thể tìm kiếm jobs')
  }
}
const debouncedSearchJobs = debounce(async (query) => {
  if (!query) {
    jobs.value = []
    return
  }
  loadingJobs.value = true
  try {
    await searchJobs(query)
  } finally {
    loadingJobs.value = false
  }
}, 300)
const openAssignJobPopup = (candidateId) => {
  const candidate = candidates.value.find((c) => c.id === candidateId)
  if (candidate) {
    selectedCandidateId.value = candidateId
    selectedCandidateFullName.value = `${candidate.code} - ${candidate.full_name}`
    showAssignJobPopup.value = true
    jobs.value = [] // Reset danh sách jobs khi mở popup
  }
}
const closeAssignJobPopup = () => {
  showAssignJobPopup.value = false
  selectedCandidateId.value = null
  selectedCandidateFullName.value = ''
  selectedJob.value = null
}
const onJobChange = () => {
  // Cập nhật logic nếu cần khi chọn job
}

const assignJob = async () => {
  if (!selectedJob.value) {
    toastr.error('Vui lòng chọn một job để gán')
    return
  }
  loadingAssignJob.value = true
  try {
    const payload = {
      candidate_id: selectedCandidateId.value,
      job_id: selectedJob.value.id,
    }
    const response = await store.dispatch('candidateJobs/assignCandidateToJob', payload)
    toastr.success(response.data.message)
  } catch (error) {
    const errorMessage = error.error === 'duplicate_assignment' ? 'Ứng viên này đã được gán vào job order này trước đó!' : error.message || 'Có lỗi xảy ra!'
    Swal.fire('Lỗi!', errorMessage, 'error')
  } finally {
    loadingAssignJob.value = false
    closeAssignJobPopup()
  }
}
const showModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedCandidate.value = null
  candidateForm.value = {
    full_name: '',
    phone: '',
    email: '',
    industry_id: '',
    education: '',
    language: '',
    language_other: '',
    current_location: '',
    desired_location: [],
    experience_summary: '',
    cv_no_contact: null,
    cv_with_contact: null,
  }
}

const showCandidate = (id) => {
  selectedCandidateId.value = id
  isShowCandidate.value = true
}

const closeCandidateDetail = () => {
  isShowCandidate.value = false
  selectedCandidateId.value = null
}

const editCandidate = (candidate) => {
  selectedCandidate.value = candidate
  //selectedIndustryId.value = industries.value.find((c) => c.id == candidate.industry_id) || null
  selectedIndustryId.value = candidate.industry_id || []
  selectedEducation.value = educations.value.find((c) => c.id == candidate.education) || null
  selectedLanguage.value = languages.value.find((c) => c.id == candidate.language) || null
  selectedCurrentLocation.value = provinces.value.find((c) => c.id == candidate.current_location) || null
  // Lấy desired_locations từ quan hệ
  const desiredLocationIds = candidate.desired_locations ? candidate.desired_locations.map((loc) => loc.location_id) : []
  selectedDesiredLocation.value = provinces.value.filter((p) => desiredLocationIds.includes(p.id)) || []
  candidateForm.value = { ...candidate, cv_no_contact: null, cv_with_contact: null }
  showModal()
}

const onIndustryChangeFilter = () => {
  formFilter.industry_id = selectedIndustryFilter.value?.id || 0
}

const onUserChangeFilter = () => {
  formFilter.created_by = selectedUserFilter.value?.id || 0
}
const onLanguageChangeFilter = () => {
  formFilter.language = selectedLanguageFilter.value?.id || ''
}

const onDesiredLocationsChangeFilter = () => {
  formFilter.desired_locations = selectedDesiredLocationsFilter.value ? selectedDesiredLocationsFilter.value.map((loc) => loc.id) : []
}
const onIndustryIdChange = () => {
  //candidateForm.value.industry_id = selectedIndustryId.value?.id || ''
  candidateForm.value.industry_id = selectedIndustryId.value || []
}

const onDesiredLocationChange = () => {
  candidateForm.value.desired_location = selectedDesiredLocation.value ? selectedDesiredLocation.value.map((loc) => loc.id) : []
}

const onEducationChange = () => {
  candidateForm.value.education = selectedEducation.value?.id || ''
}

const onLanguageChange = () => {
  candidateForm.value.language = selectedLanguage.value?.id || ''
}

const onCurrentLocationChange = () => {
  candidateForm.value.current_location = selectedCurrentLocation.value?.id || ''
}

const deleteCandidate = async (id) => {
  const result = await Swal.fire({
    title: 'Bạn có chắc chắn muốn xóa ứng viên này?',
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
      const data = await store.dispatch('candidates/deleteCandidate', id)
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

const onFileChange = (event, field) => {
  candidateForm.value[field] = event.target.files[0]
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const action = selectedCandidate.value ? 'candidates/updateCandidate' : 'candidates/addCandidate'
    const industryIds = candidateForm.value.industry_id.map(item => item.id) || [];
    const formData = new FormData()
    formData.append('id', candidateForm.value.id || 0)
    formData.append('full_name', candidateForm.value.full_name)
    formData.append('email', candidateForm.value.email)
    formData.append('phone', candidateForm.value.phone)
    industryIds.forEach(id => {
      formData.append('industry_id[]', id);
    });
    formData.append('education', candidateForm.value.education)
    formData.append('language', candidateForm.value.language)
    formData.append('language_other', candidateForm.value.language_other)
    formData.append('current_location', candidateForm.value.current_location)
    formData.append('desired_location', JSON.stringify(candidateForm.value.desired_location))
    formData.append('experience_summary', candidateForm.value.experience_summary)
    if (candidateForm.value.cv_no_contact) {
      formData.append('cv_no_contact', candidateForm.value.cv_no_contact)
    }
    if (candidateForm.value.cv_with_contact) {
      formData.append('cv_with_contact', candidateForm.value.cv_with_contact)
    }
    const data = await store.dispatch(action, formData)
    toastr.success(`${data.message}`)
    candidateForm.value = {
      full_name: '',
      phone: '',
      email: '',
      industry_id: '',
      education: '',
      language: '',
      language_other: '',
      current_location: '',
      desired_location: [],
      experience_summary: '',
      cv_no_contact: null,
      cv_with_contact: null,
    }
    selectedCandidate.value = null
    closeModal()
  } catch (error) {
    console.log(error)
    handleApiError(error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([store.dispatch('candidates/fetchProvinces'), store.dispatch('candidates/fetchConfigCandidate'), fetchCandidates(), fetchUsers(), await store.dispatch('industries/fetchIndustryLists')])
})
</script>
