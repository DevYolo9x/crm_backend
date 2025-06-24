<script setup>
import Title from '../../components/Title.vue'
import { useToastr } from '../../plugins/toastr'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { computed, onMounted, reactive, ref } from 'vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/themes/light.css'
const toastr = useToastr()
const loading = ref(false)
const store = useStore()
const route = useRoute()
const user = computed(() => store.getters['auth/auth'])
import Loading from '../../components/Loading.vue'

const form = reactive({
  account: '',
  name: '',
  gender: 'NĐ',
  birthday: '',
  password: '',
  password_confirmation: '',
  change_password: false,
  phone: '',
  email: '',
  address: '',
  china_warehouse: '',
  vietnam_warehouse: '',
  shipping_method: '',
})
const fetchData = async () => {
  loading.value = true
  try {
    const { data } = await store.dispatch('auth/checkAuth')
    if (data.user) {
      Object.assign(form, {
        account: data.user.account || '',
        name: data.user.name || '',
        gender: data.user.gender || '',
        birthday: data.user.birthday || null,
        phone: data.user.phone || '',
        email: data.user.email || '',
        address: data.user.address || '',
      })
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  fetchData()
  flatpickr('.flatpickr', {
    enableTime: false,
    dateFormat: 'Y-m-d',
    defaultHour: 10,
    allowInput: true,
  })
})
const updateAccount = async () => {
  loading.value = true
  try {
    const data = await store.dispatch('auth/updateUser', form)
    toastr.success(`${data.message}`)
    form.change_password = false
  } catch (error) {
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      let errorText = ''
      Object.keys(errors).forEach((key) => {
        errors[key].forEach((msg) => {
          errorText += msg + ''
        })
      })
      toastr.error(`${errorText}`)
    } else {
      toastr.error('Lỗi:', error.response?.data?.message || error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <Loading v-if="loading" :loading="loading" />
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
    <Title :title="route.meta.title" />
    <div class="grid grid-cols-1 gap-7">
      <div class="bg-white">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Tên đăng nhập</label>
          <input v-model="form.account" class="form-control disabled:opacity-50 disabled:bg-gray-100" disabled />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">
            Họ & tên
            <span class="text-red-600">*</span>
          </label>
          <input v-model="form.name" class="form-control" />
        </div>
        <div class="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="">
            <label class="block text-sm font-medium mb-1">
              Số điện thoại
              <span class="text-red-600">*</span>
            </label>
            <input v-model="form.phone" class="form-control" />
          </div>
          <div class="">
            <label class="block text-sm font-medium mb-1">
              Email
              <span class="text-red-600">*</span>
            </label>
            <input v-model="form.email" class="form-control" />
          </div>
        </div>
        <div class="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Giới tính</label>
            <select v-model="form.gender" class="form-control">
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Ngày sinh</label>
            <input v-model="form.birthday" class="form-control flatpickr" placeholder="Chọn ngày sinh" />
          </div>
        </div>

        <div class="flex items-center mb-4">
          <label class="relative flex cursor-pointer items-center">
            <input v-model="form.change_password" type="checkbox" :checked="form.change_password === true" class="sr-only peer" />
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            <span class="ml-1">Đổi mật khẩu</span>
          </label>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4" v-if="form.change_password">
          <div class="">
            <label class="block text-sm font-medium mb-1">Mật khẩu mới</label>
            <input v-model="form.password" type="password" class="form-control" />
          </div>
          <div class="">
            <label class="block text-sm font-medium mb-1">Nhập lại mật khẩu</label>
            <input v-model="form.password_confirmation" type="password" class="form-control" />
          </div>
        </div>
        <div class="mt-4">
          <button @click="updateAccount" class="btn btn-primary !w-auto">Cập nhập</button>
        </div>
      </div>
    </div>
  </div>
</template>
