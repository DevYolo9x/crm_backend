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
    <div class="flex items-center space-x-1">
      <router-link :to="{ name: 'ContractList' }" class="btn btn-danger !w-auto flex items-center">
        <ArrowLeftIcon class="block h-6 w-6 text-white mr-1" />
        Quay lại
      </router-link>
      <Title :title="`Chi tiết hợp đồng: ${contract?.name || ''}`" />
    </div>
    <div class="bg-white w-full" v-if="contract">
      <div class="space-y-4">
        <div class="grid md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Tên hợp đồng</label>
            <input v-model="contract.name" type="text" class="form-control" disabled />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Khách hàng</label>
            <input v-model="contract.customer" type="text" class="form-control" disabled />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Người chịu trách nhiệm</label>
            <input v-model="contract.responsible_person" type="text" class="form-control" disabled />
          </div>
          <div class="grid md:grid-cols-3 gap-4 md:col-span-2">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ngày tạo hợp đồng</label>
              <input v-model="contract.created_at" type="text" class="form-control" disabled />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc bảo hành</label>
              <input v-model="contract.warranty_end_date" type="text" class="form-control" disabled />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Thời gian phát hành hóa đơn</label>
              <input v-model="contract.invoice_date" type="text" class="form-control" disabled />
            </div>
          </div>
          <div class="grid md:grid-cols-3 gap-4 md:col-span-2">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Số tiền hợp đồng (VND)</label>
              <input :value="formatVND(contract.total_amount)" type="text" class="form-control" disabled />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Số tiền thu đợt 1 (VND)</label>
              <input :value="formatVND(contract.first_payment)" type="text" class="form-control" disabled />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Số tiền thu đợt 2 (VND)</label>
              <input :value="formatVND(contract.second_payment)" type="text" class="form-control" disabled />
            </div>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ghi chú hợp đồng, lịch sử chuyển khoản, job order</label>
          <div class="bg-gray-200 p-2" v-html="contract.notes"></div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Gói sản phẩm</label>
          <table class="table-order text-sm w-full text-left rtl:text-right">
            <thead class="text-white bg-primary dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th>Sản phẩm</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Giảm giá (VND)</th>
                <th>Thuế</th>
                <th>Thành tiền (VND)</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(product, index) in contract.products" :key="index" class="border-b hover:bg-gray-100">
                <td>{{ product.product }}</td>
                <td>{{ formatVND(product.price) }}</td>
                <td>{{ product.quantity }}</td>
                <td>{{ formatVND(product.discount) }}</td>
                <td>{{ product.tax }}</td>
                <td>{{ formatVND(product.total) }}</td>
                <td>{{ product.note }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeftIcon } from '@heroicons/vue/solid'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Title from '../../components/Title.vue'
import Loading from '../../components/Loading.vue'
import axiosInstance from '../../axios'
import { useStore } from 'vuex'
import { useToastr } from '../../plugins/toastr'
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const contract = ref(null)
const store = useStore()
const toastr = useToastr()
// Hàm định dạng số thành VND
const formatVND = (value) => {
  return (parseFloat(value) || 0).toLocaleString('vi-VN')
}

// Lấy chi tiết hợp đồng
const fetchContract = async (id) => {
  loading.value = true
  try {
    const { data } = await axiosInstance.get(`contracts/${id}/show`)
    contract.value = data.contract
    contract.value.products = contract.value.products.map((p) => ({
      ...p,
    }))
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết hợp đồng:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const contractId = route.params.id
  if (contractId) {
    fetchContract(contractId)
  }
})
</script>
