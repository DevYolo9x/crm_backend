<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch, reactive } from 'vue'
import Title from '../../components/Title.vue'
import Swal from 'sweetalert2'
import { useToastr } from '../../plugins/toastr'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { PlusIcon, TagIcon } from '@heroicons/vue/outline'
import axiosInstance from '../../axios'
import VueMultiselect from 'vue-multiselect'
import Loading from '../../components/Loading.vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/themes/light.css'
const store = useStore()
const router = useRouter()
const route = useRoute()
const toastr = useToastr()
const form = ref({
  account: '',
  password: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  birthday: '',
  gender: '',
  role_id: 0,
  attachment: null,
})
const onFileChange = (e) => {
  form.value.attachment = e.target.files[0]
}
const editMode = ref(false)
const loading = ref(false)
const submitForm = async () => {
  loading.value = true
  try {
    const action = editMode.value ? 'user/updateUser' : 'user/addUser'
    const formData = new FormData()
    formData.append('id', form.value.id || 0)
    formData.append('account', form.value.account)
    formData.append('password', form.value.password)
    formData.append('name', form.value.name)
    formData.append('address', form.value.address)
    formData.append('email', form.value.email)
    formData.append('phone', form.value.phone)
    formData.append('address', form.value.address)
    formData.append('birthday', form.value.birthday)
    formData.append('gender', form.value.gender)
    formData.append('role_id', form.value.role_id)
    formData.append('attachment', form.value.attachment || '')
    // Kiểm tra dữ liệu formData trước khi gửi
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1])
    }
    const data = await store.dispatch(action, formData)
    router.push({ name: 'users.index' })
    toastr.success(`${data.message}`)
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
    loading.value = false // Kết thúc loading
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
const getUsers = async () => {
  loading.value = true
  try {
    const { data } = await axiosInstance.get(`users/${route.params.id}/show`)
    form.value = { ...data.user }
    role.value.id = data.user.role.id
    role.value.title = data.user.role.title
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error)
  } finally {
    loading.value = false // Kết thúc loading
  }
}
const onRoleChange = () => {
  form.value.role_id = role.value.id
}
const fetchAllData = async () => {
  if (route.name === 'users.update') {
    editMode.value = true
    getUsers()
  }
  try {
    await Promise.all([getRoles()])
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}
onMounted(() => {
  fetchAllData()
  flatpickr('.flatpickr', {
    enableTime: false,
    dateFormat: 'Y-m-d',
    defaultHour: 10,
    allowInput: true,
  })
})
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
            <router-link :to="{ name: 'users.index' }" class="text-sm font-medium hover:text-blue-600">Danh sách nhân viên</router-link>
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
    <Title :title="route.meta.title" />
    <div>
      <Loading :loading="loading" />

      <form @submit.prevent="submitForm">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="space-y-1.5">
            <label class="py-[2px] font-medium text-sm">
              Tên đăng nhập
              <span class="text-red-600">*</span>
            </label>
            <input v-model="form.account" type="text" class="form-control" />
          </div>
          <div class="space-y-1.5">
            <label class="py-[2px] font-medium text-sm">
              Mật khẩu
              <span class="text-red-600">*</span>
            </label>
            <input v-model="form.password" type="text" class="form-control" />
          </div>
          <div class="space-y-1.5">
            <label class="py-[2px] font-medium text-sm">
              Nhóm nhân viên
              <span class="text-red-600">*</span>
            </label>
            <VueMultiselect @select="onRoleChange" v-model="role" :options="roles" placeholder="Nhóm nhân viên" :taggable="true" label="title" :searchable="true" track-by="id"></VueMultiselect>
          </div>
          <div class="space-y-1.5">
            <label class="py-[2px] font-medium text-sm">
              Tên nhân viên
              <span class="text-red-600">*</span>
            </label>
            <input v-model="form.name" type="text" class="form-control" />
          </div>
          <div class="space-y-1.5">
            <label class="py-[2px] font-medium text-sm">
              Số điện thoại
              <span class="text-red-600">*</span>
            </label>
            <input v-model="form.phone" type="text" class="form-control" />
          </div>
          <div class="space-y-1.5">
            <label class="py-[2px] font-medium text-sm">
              Email
              <span class="text-red-600">*</span>
            </label>
            <input v-model="form.email" type="text" class="form-control" />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="space-y-1.5">
            <label class="py-[2px] font-medium text-sm">Giới tính</label>
            <select class="form-control" v-model="form.gender">
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="py-[2px] font-medium text-sm">Ngày sinh</label>
            <input class="form-control flatpickr" v-model="form.birthday" placeholder="Ngày sinh" />
          </div>
        </div>
        <div class="md:col-span-2 space-y-1.5 mb-4">
          <label class="py-[2px] font-medium text-sm">Địa chỉ</label>
          <input v-model="form.address" type="text" class="form-control" />
        </div>
        <div class="md:col-span-2 space-y-1.5 mb-4">
          <label class="py-[2px] font-medium text-sm">
            File đính kèm
            <a v-if="form.attachment_url" :href="form.attachment_url" target="_blank" class="underline text-blue-600">Xem</a>
          </label>
          <input type="file" @change="onFileChange" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
        </div>
        <div class="flex justify-end space-x-2">
          <button type="submit" class="btn btn-primary !w-auto">{{ editMode ? 'Cập nhập' : 'Thêm mới' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>
