<template>
  <div class="flex flex-col space-y-2.5">
    <nav class="flex text-gray-70" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-2">
        <li class="inline-flex items-center">
          <router-link :to="{ name: 'Dashboard' }" class="text-sm font-medium hover:text-blue-600">Tổng quan</router-link>
        </li>
        <li class="inline-flex items-center">
          <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
          </svg>
          <router-link :to="{ name: 'ContractList' }" class="ml-1 text-sm font-medium hover:text-blue-600 md:ml-2">Quản lý hợp đồng doanh thu</router-link>
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
    </div>
    <div class="bg-white w-full">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid md:grid-cols-4 gap-4">
          <div class="md:col-span-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Tên hợp đồng
              <span class="text-red-600">*</span>
            </label>
            <input v-model="contractForm.name" type="text" class="form-control" required />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Khách hàng
              <span class="text-red-600">*</span>
            </label>
            <VueMultiselect v-model="selectedCustomer" :options="customers" :taggable="true" label="name" :searchable="true" track-by="id" @select="onCustomerChange" placeholder="Chọn khách hàng"></VueMultiselect>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Người chịu trách nhiệm
              <span class="text-red-600">*</span>
            </label>
            <VueMultiselect v-model="selectedResponsiblePerson" :options="users" :taggable="true" label="name" :searchable="true" track-by="id" @select="onResponsiblePersonChange" placeholder="Chọn nhân viên"></VueMultiselect>
          </div>
          <div class="md:col-span-4 grid md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc bảo hành</label>
              <input class="form-control flatpickr" v-model="contractForm.warranty_end_date" placeholder="Ngày kết thúc bảo hành" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Thời gian phát hành hóa đơn đợt 1</label>
              <input class="form-control flatpickr" v-model="contractForm.invoice_date" placeholder="Thời gian phát hành hóa đơn đợt 1" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Thời gian phát hành hóa đơn đợt 2</label>
              <input class="form-control flatpickr" v-model="contractForm.invoice_date_2" placeholder="Thời gian phát hành hóa đơn đợt 2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Số tiền hợp đồng (VND)</label>
              <input v-model="displayValues.total_amount" type="text" class="form-control" @input="updateValue('total_amount')" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Số tiền thu đợt 1 (VND)</label>
              <input v-model="displayValues.first_payment" type="text" class="form-control" @input="updateValue('first_payment')" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Số tiền thu đợt 2 (VND)</label>
              <input v-model="displayValues.second_payment" type="text" class="form-control" @input="updateValue('second_payment')" />
            </div>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ghi chú hợp đồng, lịch sử chuyển khoản, job order</label>
          <quill-editor ref="quill" :modules="modules" :toolbar="toolbar" v-model:content="contractForm.notes" contentType="html" />
        </div>
        <!-- Gói sản phẩm -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Gói sản phẩm</label>
          <table class="table-order text-sm w-full text-left rtl:text-right">
            <thead class=" bg-[#e5e5e5] dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th class="font-medium">Sản phẩm</th>
                <th class="font-medium">Giá</th>
                <th class="font-medium">Số lượng</th>
                <th class="font-medium">Giảm giá (VND)</th>
                <th class="font-medium">Thuế (%)</th>
                <th class="font-medium">Thành tiền (VND)</th>
                <th class="font-medium">Ghi chú</th>
                <th class="text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(product, index) in contractForm.products" :key="index" class="border-b hover:bg-gray-100">
                <td>
                  <input v-model="product.product" type="text" class="form-control" />
                </td>
                <td>
                  <input v-model="product.displayPrice" type="text" class="form-control" @input="updateProductValue(index, 'price')" />
                </td>
                <td>
                  <input v-model="product.quantity" type="number" class="form-control" @input="calculateTotal(index)" />
                </td>
                <td>
                  <input v-model="product.displayDiscount" type="text" class="form-control" @input="updateProductValue(index, 'discount')" />
                </td>
                <td>
                  <input v-model="product.tax" type="number" class="form-control" @input="calculateTotal(index)" />
                </td>
                <td>{{ product.total.toLocaleString('vi-VN') }}</td>
                <td>
                  <input v-model="product.note" type="text" class="form-control" />
                </td>
                <td class="text-right">
                  <button @click="removeProduct(index)" class="text-[14px] px-[10px] py-[7px] btn-danger !w-auto">Xóa</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="flex items-center justify-between mt-2">
            <button type="button" @click="addProduct" class="text-[14px] px-[10px] py-[7px] btn-success !w-auto">Thêm sản phẩm</button>
          </div>
          <!-- Bảng tổng hợp -->
          <div class="mt-4">
            <div class="flex justify-between">
              <span>Tổng số không có chiết khấu và thuế:</span>
              <span>{{ totalWithoutDiscountAndTax.toLocaleString('vi-VN') }} đ</span>
            </div>
            <div class="flex justify-between">
              <span>Số tiền chiết khấu:</span>
              <span>{{ totalDiscount.toLocaleString('vi-VN') }} đ</span>
            </div>
            <div class="flex justify-between">
              <span>Tổng số trước thuế:</span>
              <span>{{ totalBeforeTax.toLocaleString('vi-VN') }} đ</span>
            </div>
            <div class="flex justify-between">
              <span>Tổng thuế:</span>
              <span>{{ totalTax.toLocaleString('vi-VN') }} đ</span>
            </div>
            <div class="flex justify-between font-bold">
              <span>Tổng số tiền:</span>
              <span>{{ totalAmount.toLocaleString('vi-VN') }} đ</span>
            </div>
          </div>
        </div>
        <div class="flex justify-end space-x-2">
          <button type="submit" class="btn btn-primary !w-auto">{{ route.name === 'ContractEdit' ? 'Cập nhật' : 'Thêm mới' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import Title from '../../components/Title.vue'
import Loading from '../../components/Loading.vue'
import { handleApiError } from '../../helpers/apiErrorHandler'
import { useToastr } from '../../plugins/toastr'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import BlotFormatter from 'quill-blot-formatter'
import VueMultiselect from 'vue-multiselect'
import axiosInstance from '../../axios'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/themes/light.css'
import { can } from '../../helpers/permissions' // Import the can helper
const userPermissions = computed(() => store.getters['auth/permissions'] || {})
const toastr = useToastr()
const route = useRoute()
const router = useRouter()
const store = useStore()
const quill = ref(null)
const modules = { module: BlotFormatter }
const toolbar = [[{ header: [1, 2, 3, 4, 5, 6, false] }], [{ size: ['small', false, 'large', 'huge'] }], ['bold', 'italic', 'underline', 'strike'], ['blockquote', 'code-block'], [{ align: [] }], [{ list: 'ordered' }, { list: 'bullet' }], [{ color: [] }, { background: [] }], [{ font: [] }], ['link', 'image', 'video'], ['clean']]

const loading = ref(false)
const selectedCustomer = ref(null)
const selectedResponsiblePerson = ref(null)
const customers = computed(() => store.getters['customers/customerLists'])
const users = ref([])
const contractForm = ref({
  id: null,
  name: '',
  customer_id: '',
  responsible_person_id: '',
  warranty_end_date: '',
  invoice_date: '',
  invoice_date_2: '',
  total_amount: 0,
  first_payment: 0,
  second_payment: 0,
  notes: '',
  products: [],
})

const displayValues = ref({
  total_amount: '0',
  first_payment: '0',
  second_payment: '0',
})

// Hàm định dạng số thành VND
const formatVND = (value) => {
  return (parseFloat(value) || 0).toLocaleString('vi-VN')
}

// Cập nhật giá trị và định dạng VND
const updateValue = (field) => {
  let value = displayValues.value[field].replace(/[^0-9]/g, '')
  value = parseFloat(value) || 0
  contractForm.value[field] = value
  displayValues.value[field] = formatVND(value)
}

// Cập nhật giá trị sản phẩm và định dạng VND
const updateProductValue = (index, field) => {
  const product = contractForm.value.products[index]
  let value = product[`display${field.charAt(0).toUpperCase() + field.slice(1)}`].replace(/[^0-9]/g, '')
  value = parseFloat(value) || 0
  product[field] = value
  product[`display${field.charAt(0).toUpperCase() + field.slice(1)}`] = formatVND(value)
  calculateTotal(index)
}

// Tính toán tổng tiền sản phẩm
const calculateTotal = (index) => {
  const product = contractForm.value.products[index]
  const price = parseFloat(product.price) || 0
  const quantity = parseInt(product.quantity) || 1
  const discount = parseFloat(product.discount) || 0
  const tax = parseFloat(product.tax) || 0
  const subtotal = price * quantity - discount
  const taxAmount = (subtotal / 100) * tax
  product.total = subtotal + taxAmount
}

// Tính toán tổng hợp
const totalWithoutDiscountAndTax = computed(() => {
  return contractForm.value.products.reduce((sum, product) => sum + (parseFloat(product.price) || 0) * (parseInt(product.quantity) || 1), 0)
})

const totalDiscount = computed(() => {
  return contractForm.value.products.reduce((sum, product) => sum + (parseFloat(product.discount) || 0), 0)
})

const totalBeforeTax = computed(() => {
  return totalWithoutDiscountAndTax.value - totalDiscount.value
})

const totalTax = computed(() => {
  return contractForm.value.products.reduce((sum, product) => {
    const subtotal = (parseFloat(product.price) || 0) * (parseInt(product.quantity) || 1) - (parseFloat(product.discount) || 0)
    const tax = parseFloat(product.tax) || 0
    return sum + (subtotal * tax) / 100
  }, 0)
})

const totalAmount = computed(() => {
  return totalBeforeTax.value + totalTax.value
})

const onCustomerChange = () => {
  contractForm.value.customer_id = selectedCustomer.value?.id || ''
}

const onResponsiblePersonChange = () => {
  contractForm.value.responsible_person_id = selectedResponsiblePerson.value?.id || ''
}

const addProduct = () => {
  contractForm.value.products.push({
    product: '',
    price: 0,
    displayPrice: '0',
    quantity: 1,
    discount: 0,
    displayDiscount: '0',
    tax: 0,
    total: 0,
    note: '',
  })
}

const removeProduct = (index) => {
  contractForm.value.products.splice(index, 1)
}

const fetchContract = async (id) => {
  try {
    const { data } = await axiosInstance.get(`contracts/${id}/show`)
    const contract = data.contract
    selectedCustomer.value = customers.value.find((c) => c.id === contract.customer_id) || null
    selectedResponsiblePerson.value = users.value.find((u) => u.id === contract.responsible_person_id) || null
    contractForm.value = {
      ...contract,
      total_amount: contract.total_amount,
      first_payment: contract.first_payment || 0,
      second_payment: contract.second_payment || 0,
      products: contract.products.map((p) => ({
        product: p.product,
        price: p.price,
        displayPrice: formatVND(p.price),
        quantity: p.quantity,
        discount: p.discount || 0,
        displayDiscount: formatVND(p.discount || 0),
        tax: p.tax,
        total: p.total,
        note: p.note,
      })),
    }
    displayValues.value.total_amount = formatVND(contract.total_amount)
    displayValues.value.first_payment = formatVND(contract.first_payment || 0)
    displayValues.value.second_payment = formatVND(contract.second_payment || 0)
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết hợp đồng:', error)
  }
}

const fetchCustomers = async () => {
  try {
    await store.dispatch('customers/fetchCustomerLists')
  } catch (error) {
    console.error('Lỗi khi lấy danh sách khách hàng:', error)
  }
}

const fetchUsers = async () => {
  try {
    const { data } = await axiosInstance.get('users/lists')
    users.value = data
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error)
  }
}

onMounted(async () => {
  loading.value = true
  const hasCreatePermission = can(userPermissions.value, 'contracts', 'create')
  const hasEditPermission = can(userPermissions.value, 'contracts', 'edit')
  try {
    await Promise.all([fetchCustomers(), fetchUsers()])
    if (route.name === 'ContractEdit') {
      if (!hasEditPermission) {
        toastr.error('Bạn không có quyền sửa hợp đồng')
        router.push({ name: 'ContractList' })
        return
      }
      await fetchContract(route.params.id)
    } else {
      if (!hasCreatePermission) {
        toastr.error('Bạn không có quyền thêm mới hợp đồng')
        router.push({ name: 'ContractList' })
        return
      }
    }
    flatpickr('.flatpickr', {
      enableTime: false,
      dateFormat: 'Y-m-d',
      defaultHour: 10,
      allowInput: true,
    })
  } finally {
    loading.value = false
  }
})

const handleSubmit = async () => {
  loading.value = true
  try {
    const action = route.name === 'ContractEdit' ? 'contracts/updateContract' : 'contracts/addContract'
    const contractData = {
      ...contractForm.value,
      products: contractForm.value.products.map((p) => ({
        product: p.product,
        price: p.price,
        quantity: p.quantity,
        discount: p.discount,
        tax: p.tax,
        total: p.total,
        note: p.note,
      })),
    }
    const data = await store.dispatch(action, contractData)
    toastr.success(`${data.message}`)
    // Cập nhật lại displayValues với định dạng VND sau khi gửi thành công
    displayValues.value.total_amount = formatVND(contractForm.value.total_amount)
    displayValues.value.first_payment = formatVND(contractForm.value.first_payment)
    displayValues.value.second_payment = formatVND(contractForm.value.second_payment)
    contractForm.value.products.forEach((product, index) => {
      product.displayPrice = formatVND(product.price)
      product.displayDiscount = formatVND(product.discount)
    })

    router.push({ name: 'ContractList' })
  } catch (error) {
    handleApiError(error)
  } finally {
    loading.value = false
  }
}
</script>
