<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch, reactive } from 'vue'
import Title from '../../components/Title.vue'
import Swal from 'sweetalert2'
import { useToastr } from '../../plugins/toastr'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { PlusIcon, TagIcon } from '@heroicons/vue/outline'
import axiosInstance from '../../axios'
import Loading from '../../components/Loading.vue'
const store = useStore()
const router = useRouter()
const route = useRoute()
const toastr = useToastr()
const form = ref({
  id: null,
  title: '',
  permission_id: [],
})
const permission = ref([])
const config = ref([])
const editMode = ref(false)

const submitForm = async () => {
  loading.value = true // Bắt đầu loading
  try {
    const action = editMode.value ? 'roles/updateRole' : 'roles/addRole'
    const data = await store.dispatch(action, form.value)
    router.push({ name: 'roles.index' })
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

const getPermission = async () => {
  await axiosInstance.get(`roles/permission`).then((response) => {
    permission.value = response.data
  })
}
const getConfig = async () => {
  await axiosInstance.get(`permissions/config`).then((response) => {
    config.value = response.data
  })
}
const getRoles = async () => {
  await axiosInstance
    .get(`roles/${route.params.id}/show`)
    .then((response) => {
      form.value = { ...response.data.role, permission_id: response.data.permission_id }
    })
    .catch((errors) => {})
}
const loading = ref(false)

const fetchAllData = async () => {
  loading.value = true // Bắt đầu loading

  if (route.name === 'roles.update') {
    editMode.value = true
    getRoles()
  }
  try {
    await Promise.all([getPermission(), getConfig()])
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false // Kết thúc loading
  }
}
onMounted(() => {
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
            <router-link :to="{ name: 'roles.index' }" class="text-sm font-medium hover:text-blue-600">Nhóm nhân viên</router-link>
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
    <div class="relative">
      <Loading :loading="loading" />
      <form @submit.prevent="submitForm">
        <div class="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label class="py-[2px] font-bold">
              Tiêu đề
              <span class="text-red-600">*</span>
            </label>
            <input v-model="form.title" type="text" class="form-control" />
          </div>
          <div class="flex flex-col">
            <label class="py-[2px] font-bold">
              Quyền nhóm nhân viên
              <span class="text-red-600">*</span>
            </label>
            <div v-if="config.modules" class="space-y-3">
              <div v-for="(item, index) in permission" class="w-full grid grid-cols-12 items-center" :key="index">
                <div class="col-span-4" v-if="item.children">
                  <h2 class="mb-0 font-semibold">
                    {{ config.modules[item.title] }}
                  </h2>
                </div>
                <div class="col-span-8" v-if="item.children">
                  <div class="grid grid-cols-5">
                    <div v-for="child in item.children" :key="child.id" class="">
                      <div class="flex space-x-1 items-center" style="margin: 0px !important">
                        <input name="permission_id" type="checkbox" :id="`checkboxPrimary-${child.id}`" v-model="form.permission_id" :value="child.id" />
                        <label class="cursor-pointer" :for="`checkboxPrimary-${child.id}`" style="font-weight: normal">
                          {{ config.actions[child.title] }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end space-x-2">
          <button type="submit" class="btn btn-primary !w-auto">{{ editMode ? 'Cập nhập' : 'Thêm mới' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>
