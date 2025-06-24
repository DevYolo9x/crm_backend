<script setup>
import { onMounted, ref, computed } from 'vue'
import Title from '../../components/Title.vue'
import Loading from '../../components/Loading.vue'
import Swal from 'sweetalert2'
import { useToastr } from '../../plugins/toastr'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { can } from '../../helpers/permissions' // Import the can helper
const userPermissions = computed(() => store.getters['auth/permissions'] || {})
const store = useStore()
const route = useRoute()
const router = useRouter()
const toastr = useToastr()
const activeTab = ref('general')
const loading = ref(false) // Trạng thái loading khi lưu
const fileUploading = ref(false) // Trạng thái loading khi tải lên file

// Lấy danh sách tab từ store
const tabs = computed(() => store.getters['system/getTabs'])

// Lấy cấu hình các field từ store
const fieldConfig = computed(() => store.getters['system/getFieldConfig'])

// Xây dựng đối tượng fields từ cấu hình
const fields = computed({
  get: () => {
    const result = {}
    for (const group in fieldConfig.value) {
      result[group] = {}
      fieldConfig.value[group].forEach((field) => {
        result[group][field.key] = store.state.system.configs[group]?.[field.key] || ''
      })
    }
    return result
  },
  set: (newValue) => {
    for (const group in newValue) {
      for (const key in newValue[group]) {
        store.commit('system/UPDATE_CONFIG', { key: `${group}.${key}`, value: newValue[group][key] }, { root: true })
      }
    }
  },
})

// Khi component mounted, lấy dữ liệu từ API
onMounted(async () => {
  loading.value = true
  const hasEditPermission = can(userPermissions.value, 'configurations', 'edit')
  if (!hasEditPermission) {
    toastr.error('Bạn không có quyền chỉnh sửa cấu hình hệ thống')
    router.push({ name: 'Dashboard' })
    return
  }
  try {
    await store.dispatch('system/fetchConfigStructure')
    await store.dispatch('system/fetchConfigs')
    if (tabs.value.length > 0) {
      activeTab.value = tabs.value[0].key
    }
  } finally {
    loading.value = false
  }
})

// Chuyển tab
const setActiveTab = (tabKey) => {
  activeTab.value = tabKey
}

// Lưu cấu hình với trạng thái loading
const saveConfig = async () => {
  loading.value = true
  try {
    const res = await store.dispatch('system/saveConfigs', fields.value)
    toastr.success(res.data.message)
  } catch (error) {
    toastr.error('Lưu thất bại!')
  } finally {
    loading.value = false
  }
}

// Upload file với trạng thái loading
const uploadFile = async (event, group, key) => {
  const file = event.target.files[0]
  if (!file) return

  fileUploading.value = true
  try {
    const res = await store.dispatch('system/uploadFile', { file, group, key })
    toastr.success(res.data.message)
  } catch (error) {
    toastr.error('Tải lên thất bại!')
  } finally {
    fileUploading.value = false
  }
}
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
    <Loading :loading="loading" />
    <Title :title="route.meta.title" />
    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="flex space-x-6">
        <button v-for="(tab, index) in tabs" :key="index" :class="{ 'border-b-2 border-blue-600 text-blue-600': activeTab === tab.key, 'text-gray-600 hover:text-gray-800': activeTab !== tab.key }" class="py-2 px-4 font-medium text-sm focus:outline-none" @click="setActiveTab(tab.key)">
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Nội dung tab -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <div v-for="tab in tabs" :key="tab.key">
        <div v-if="activeTab === tab.key">
          <h3 class="text-xl font-semibold mb-4">{{ tab.label }}</h3>

          <!-- Group text & textarea fields -->
          <div :class="tab.key == 'social' || tab.key == 'exchange' || tab.key == 'sales_commission' ? 'md:grid-cols-2' : 'grid-cols-1'" class="grid gap-2">
            <div v-for="field in fieldConfig[tab.key].filter((f) => f.type !== 'image')" :key="field.key">
              <label class="block text-sm font-medium text-gray-700">{{ field.label }}</label>
              <input v-if="field.type === 'text'" v-model="fields[tab.key][field.key]" :placeholder="field.placeholder || ''" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              <textarea v-else-if="field.type === 'textarea'" v-model="fields[tab.key][field.key]" :placeholder="field.placeholder || ''" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" rows="10"></textarea>
            </div>
          </div>
          <!-- Group image fields in 2 columns -->
          <div v-if="fieldConfig[tab.key].some((f) => f.type === 'image')" class="grid gap-2 md:grid-cols-2 mt-4">
            <div v-for="field in fieldConfig[tab.key].filter((f) => f.type === 'image')" :key="field.key">
              <label class="block text-sm font-medium text-gray-700">{{ field.label }}</label>
              <input type="file" @change="uploadFile($event, tab.key, field.key)" accept="image/*" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              <img v-if="fields[tab.key][field.key]" :src="fields[tab.key][field.key]" :alt="field.label" class="mt-2 h-24 object-cover rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Nút lưu -->
    <div class="flex justify-end">
      <button @click="saveConfig" class="btn btn-primary !w-auto flex items-center">
        <span v-if="loading" class="mr-2 animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
        {{ loading ? 'Đang lưu...' : 'Lưu thay đổi' }}
      </button>
    </div>
  </div>
</template>
