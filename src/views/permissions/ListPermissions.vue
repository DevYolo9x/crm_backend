<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import axiosInstance from '../../axios.js'
import { useRouter, useRoute } from 'vue-router'
import { useToastr } from '../../plugins/toastr'
import Title from '../../components/Title.vue'
import { PlusIcon } from '@heroicons/vue/outline'
import { useStore } from 'vuex'

const toastr = useToastr()
const route = useRoute()
const config = ref([])
const permissions = ref([])
const loading = ref(false)
const store = useStore()
const getConfig = () => {
  axiosInstance.get(`permissions/config`).then((response) => {
    config.value = response.data
  })
}
const getPermissions = () => {
  axiosInstance.get(`permissions/index`).then((response) => {
    permissions.value = response.data
  })
}
const handleSwitchChange = async (value) => {
  try {
    const data = await store.dispatch('auth/fetchUpdateUserPermissions', value)
    toastr.success(data.message)
  } catch (error) {
    console.log(error)
  }
}
onMounted(() => {
  loading.value = true
  const fetchAllData = async () => {
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
    <div class="flex items-center justify-between">
      <Title :title="route.meta.title" />
      <div class="flex space-x-4">
        <router-link :to="{ name: 'permissions.create' }" class="btn btn-success !w-auto flex items-center">
          <PlusIcon class="block h-6 w-6 text-white" aria-hidden="true" />
          Thêm mới
        </router-link>
      </div>
    </div>
    <div>
      <table class="table-order text-sm w-full text-left rtl:text-right">
        <thead class="text-white bg-primary dark:bg-gray-700 dark:text-gray-400">
          <tr class="">
            <th class="">STT</th>
            <th class="">Tên module</th>
            <th class="">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in permissions" :key="item.id" class="border-b hover:bg-gray-100">
            <td>{{ index + 1 }}</td>
            <td>
              <span v-if="config.modules">
                {{ config.modules[item.title] }}
              </span>
            </td>
            <td>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" :checked="item.publish == 1" @change="handleSwitchChange(item)" class="sr-only peer" />
                <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
