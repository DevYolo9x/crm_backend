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

      <div class="grid md:grid-cols-5 space-x-1">
        <div class="md:col-span-2">
          <VueMultiselect class="flex-1" v-model="selectedCustomerGroupFilter" :options="groups" :taggable="true" label="title" :searchable="true" track-by="id" @select="onCustomerGroupChangeFilter"></VueMultiselect>
        </div>
        <div :class="can(userPermissions, 'customers', 'create') ? `md:col-span-2` : `md:col-span-3`">
          <input type="text" class="form-control flex-1" placeholder="Nhập từ khóa tìm kiếm" v-model="formFilter.keyword" />
        </div>
        <a href="" class="btn btn-success !w-auto flex items-center" @click.prevent="showModal" v-if="can(userPermissions, 'customers', 'create')">
          <PlusIcon class="block h-6 w-6 text-white" aria-hidden="true" />
          Thêm mới
        </a>
      </div>
    </div>
    <div>
      <table class="table-order text-sm w-full text-left rtl:text-right">
        <thead class="text-white bg-primary dark:bg-gray-700 dark:text-gray-400">
          <tr class="">
            <th class="">STT</th>
            <th class="p-2">CODE</th>
            <th class="p-2">Thông tin khách hàng</th>
            <th class="p-2">Nhóm</th>
            <th class="p-2">Mã số thuế</th>
            <th class="p-2">Số điện thoại</th>
            <th class="p-2">Email</th>
            <th class="p-2">File đính kèm</th>
            <th class="text-right" v-if="can(userPermissions, 'customers', 'edit') || can(userPermissions, 'customers', 'destroy')">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(customer, key) in customers" :key="customer.id" class="border-b hover:bg-gray-100">
            <td>{{ key + 1 }}</td>
            <td class="p-2 font-bold text-blue-600">{{ customer.code }}</td>
            <td class="p-2">{{ customer.name }}</td>
            <td class="p-2">{{ customer.group?.title }}</td>
            <td class="p-2">{{ customer.tax_code }}</td>
            <td class="p-2">{{ customer.phone }}</td>
            <td class="p-2">{{ customer.email }}</td>
            <td class="p-2">
              <div v-if="customer.attachment && customer.attachment.length" class="flex flex-wrap gap-1">
                <a target="_blank" v-for="(file, index) in customer.attachment" :key="index" :href="file.url" download class="btn bg-blue-600 border-blue-600 text-sm !w-auto flex items-center !text-white">{{ file.name }}</a>
              </div>
            </td>
            <td v-if="can(userPermissions, 'customers', 'edit') || can(userPermissions, 'customers', 'destroy')">
              <div class="flex items-center space-x-1 justify-end">
                <button @click="editCustomer(customer)" class="btn btn-primary !w-auto flex items-center" v-if="can(userPermissions, 'customers', 'edit')">
                  <PencilAltIcon class="block h-6 w-6 text-white mr-1" />
                  Sửa
                </button>
                <button @click="deleteCustomer(customer.id)" class="btn btn-danger !w-auto flex items-center" v-if="can(userPermissions, 'customers', 'destroy')">
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
    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99] !my-0">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative">
        <h2 class="text-lg font-semibold mb-4">{{ selectedCustomer ? 'Cập nhập khách hàng' : 'Thêm mới khách hàng' }}</h2>
        <form @submit.prevent="handleSubmit" class="space-y-2">
          <div class="grid grid-cols-2 gap-5">
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nhóm khách hàng
                <span class="text-red-600">*</span>
              </label>
              <VueMultiselect v-model="selectedCustomerGroup" :options="groups" :taggable="true" label="title" :searchable="true" track-by="id" @select="onCustomerGroupChange"></VueMultiselect>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Tên công ty/Tên công ty
                <span class="text-red-600">*</span>
              </label>
              <input v-model="customerForm.name" type="text" class="form-control" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Mã số thuế/Mã số thuế
                <span class="text-red-600">*</span>
              </label>
              <input v-model="customerForm.tax_code" type="text" class="form-control" />
            </div>

            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ
                <span class="text-red-600">*</span>
              </label>
              <input v-model="customerForm.address" type="text" class="form-control" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Email
                <span class="text-red-600">*</span>
              </label>
              <input v-model="customerForm.email" type="text" class="form-control" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
                <span class="text-red-600">*</span>
              </label>
              <input v-model="customerForm.phone" type="text" class="form-control" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                File đính kèm
                <span class="text-red-600">*</span>
              </label>
              <input type="file" multiple @change="onFileChange" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              <div v-if="customerForm.attachments && customerForm.attachments.length" class="mt-2">
                <p class="block text-sm font-medium text-gray-700 mb-1">File đã chọn</p>
                <ul class="flex items-center space-x-1">
                  <li v-for="(file, index) in customerForm.attachments" :key="index" class="btn btn-default !w-auto leading-normal flex items-center">{{ file.name }}</li>
                </ul>
              </div>
            </div>
          </div>
          <div v-if="selectedCustomer && selectedCustomer.attachment && selectedCustomer.attachment.length" class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">File hiện có</label>
            <ul>
              <li v-for="(file, index) in selectedCustomer.attachment" :key="index">
                {{ file.name }}
                <button type="button" @click.prevent="removeExistingFile(index)" class="text-red-600 ml-2">Xóa</button>
              </li>
            </ul>
          </div>
          <div class="flex justify-end space-x-2">
            <button @click="closeModal" class="btn btn-danger !w-auto">Hủy</button>
            <button type="submit" class="btn btn-primary !w-auto">{{ selectedCustomer ? 'Cập Nhật' : 'Thêm mới' }}</button>
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
import VueMultiselect from 'vue-multiselect'
import { can } from '../../helpers/permissions' // Import the can helper
const userPermissions = computed(() => store.getters['auth/permissions'] || {})
const toastr = useToastr()

const route = useRoute()
const store = useStore()
const groups = computed(() => store.getters['customerGroups/groupLists'] || [])
const customers = computed(() => store.getters['customers/customers'])
const pagination = computed(() => store.getters['customers/pagination'])
const currentPage = ref(1)
const selectedCustomer = ref(null)
const selectedCustomerGroup = ref({ id: 0, title: 'Chọn nhóm khách hàng' })
const selectedCustomerGroupFilter = ref({ id: 0, title: 'Chọn nhóm khách hàng' })
const isModalOpen = ref(false)
const customerForm = ref({
  customer_group_id: '',
  name: '',
  tax_code: '',
  address: '',
  phone: '',
  email: '',
  attachments: [], // Thay đổi từ attachment sang attachments (mảng)
})
const onFileChange = (e) => {
  customerForm.value.attachments = Array.from(e.target.files) // Lưu danh sách file
}
const showModal = () => {
  isModalOpen.value = true
}
const closeModal = () => {
  isModalOpen.value = false
  customerForm.value = {
    customer_group_id: '',
    name: '',
    tax_code: '',
    address: '',
    phone: '',
    email: '',
    attachments: [],
  }
  selectedCustomer.value = null
}
const editCustomer = (customer) => {
  selectedCustomer.value = { ...customer }
  customerForm.value = {
    id: customer.id,
    customer_group_id: customer.group.id,
    name: customer.name,
    tax_code: customer.tax_code,
    phone: customer.phone,
    address: customer.address,
    email: customer.email,
    attachments: [], // Không tải lại file cũ, chỉ hỗ trợ thêm file mới
  }
  const index = groups.value.findIndex((c) => c.id === customer.group?.id)
  selectedCustomerGroup.value = index !== -1 ? groups.value[index] : null
  showModal()
}
const perPage = ref(20) // Số sản phẩm mỗi trang
const formFilter = reactive({
  customer_group_id: 0,
  keyword: '',
})
watch(
  [formFilter],
  debounce(() => {
    fetchCustomers()
  }, 300)
)
const fetchGroupLists = async (page = 1) => {
  try {
    await store.dispatch('customerGroups/fetchGroupLists')
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error)
  }
}
const fetchCustomers = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      keyword: formFilter.keyword,
      customer_group_id: formFilter.customer_group_id,
    }
    await store.dispatch('customers/fetchCustomers', { page: currentPage.value, perPage: perPage.value, params: params })
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error)
  } finally {
    loading.value = false
  }
}
const onCustomerGroupChange = () => {
  customerForm.value.customer_group_id = selectedCustomerGroup.value.id
}
const onCustomerGroupChangeFilter = () => {
  formFilter.customer_group_id = selectedCustomerGroupFilter.value.id
}
onMounted(async () => {
  await Promise.all([fetchCustomers(), fetchGroupLists()])
})
// Pagination
const goToPage = (page) => {
  if (page > 0 && page <= pagination.value.last_page) {
    currentPage.value = page
    fetchCustomers()
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
const deleteCustomer = async (id) => {
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
      const data = await store.dispatch('customers/deleteCustomer', id)
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
    const action = selectedCustomer.value ? 'customers/updateCustomer' : 'customers/addCustomer'
    const formData = new FormData()
    formData.append('id', customerForm.value.id || 0)
    formData.append('customer_group_id', customerForm.value.customer_group_id)
    formData.append('tax_code', customerForm.value.tax_code)
    formData.append('name', customerForm.value.name)
    formData.append('address', customerForm.value.address)
    formData.append('email', customerForm.value.email)
    formData.append('phone', customerForm.value.phone)
    formData.append('attachment', customerForm.value.attachment || '')
    customerForm.value.attachments.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file)
    })
    const data = await store.dispatch(action, formData)
    toastr.success(`${data.message}`)
    customerForm.value = { id: 0, customer_group_id: '', name: '', tax_code: '', address: '', phone: '', email: '', attachments: [] }
    selectedCustomer.value = null
    closeModal()
  } catch (error) {
    handleApiError(error)
  } finally {
    loading.value = false
  }
}
const removeExistingFile = async (index) => {
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
      const fileToRemove = selectedCustomer.value.attachment[index]
      await store.dispatch('customers/removeAttachment', {
        customerId: selectedCustomer.value.id,
        fileUrl: fileToRemove.url_origin,
      })
      selectedCustomer.value.attachment.splice(index, 1)
      toastr.success('Xóa file thành công')
    } catch (error) {
      handleApiError(error)
    } finally {
      loading.value = false
    }
  }
}
</script>
