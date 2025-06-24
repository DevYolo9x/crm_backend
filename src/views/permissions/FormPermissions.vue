<script setup>
import { ref, onMounted } from 'vue'
import axiosInstance from '../../axios.js'
import { useRouter, useRoute } from 'vue-router'
import VueMultiselect from 'vue-multiselect'
import { useToastr } from '../../plugins/toastr'
import Title from '../../components/Title.vue'
const toastr = useToastr()
const router = useRouter()
const route = useRoute()
const config = ref([])
const permissions = ref([])
const loading = ref(false)
const formValues = ref({
  title: '',
  permission_id: [],
})
const moduleOptions = ref([])
const actionOptions = ref([])
const getConfig = () => {
  axiosInstance.get(`permissions/config`).then((response) => {
    config.value = response.data
    moduleOptions.value = Object.keys(response.data.modules).map((key) => ({
      value: key,
      name: response.data.modules[key],
    }))
    actionOptions.value = Object.keys(response.data.actions).map((key) => ({
      value: key,
      name: response.data.actions[key],
    }))
    formValues.value.permission_id = actionOptions.value
  })
}
const getPermissions = () => {
  axiosInstance.get(`permissions/index`).then((response) => {
    permissions.value = response.data
  })
}

const handleSubmit = () => {
  const permissionValues = formValues.value.permission_id.map((permission) => permission.value)
  axiosInstance
    .post('permissions/store', {
      title: formValues.value.title.value,
      permission_id: permissionValues,
    })
    .then((response) => {
      router.push({ name: 'permissions.index' })
      toastr.success(response.data.message)
    })
    .catch((error) => {
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
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  const fetchAllData = async () => {
    loading.value = true
    try {
      await Promise.all([getPermissions(), getConfig()])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      loading.value = false
    }
  }
  fetchAllData()
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
            <span class="ml-1 text-sm font-medium text-gray-500 md:ml-2">{{ route.meta.title }}</span>
          </div>
        </li>
      </ol>
    </nav>
    <Title :title="route.meta.title" />
    <div>
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label class="py-[2px] text-[12px] font-bold">
              Tên module
              <span class="text-red-600">*</span>
            </label>
            <VueMultiselect name="title" v-model="formValues.title" :options="moduleOptions" label="name" track-by="value" placeholder="Chọn tên module" />
          </div>
          <div>
            <label class="py-[2px] text-[12px] font-bold">
              Quyền module
              <span class="text-red-600">*</span>
            </label>
            <VueMultiselect name="permission_id" v-model="formValues.permission_id" :options="actionOptions" label="name" multiple track-by="value" placeholder="Chọn các quyền" />
          </div>
        </div>
        <div class="flex justify-end space-x-2">
          <button type="submit" class="btn btn-primary !w-auto">Thêm mới</button>
        </div>
      </form>
    </div>
  </div>
</template>
<style>
.multiselect:focus,
.multiselect__input:focus,
.multiselect__single:focus,
.multiselect__tags:focus {
  outline: none !important;
  box-shadow: none !important;
  border-color: transparent !important;
}
</style>
