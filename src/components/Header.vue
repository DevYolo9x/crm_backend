<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { BellIcon, LogoutIcon, UserCircleIcon } from '@heroicons/vue/outline'
import store from '../store'
import { useRouter } from 'vue-router'
const router = useRouter()
const isOpen = ref(false)
const isOpenHeaderAuth = ref(false)
const activeType = ref('all')
const toggleNotification = () => {
  isOpen.value = !isOpen.value
}
const toggleHeaderAuth = () => {
  isOpenHeaderAuth.value = !isOpenHeaderAuth.value
}
const users = computed(() => store.getters['auth/auth'])
const system = computed(() => store.getters['system/system'] || {})

const headerAuthBoxRef = ref(null)
// Hàm xử lý click ra ngoài
const handleClickOutside = (event) => {
  if (isOpen.value && notificationBoxRef.value && !notificationBoxRef.value.contains(event.target)) {
    isOpen.value = false
  }

  if (isOpenHeaderAuth.value && headerAuthBoxRef.value && !headerAuthBoxRef.value.contains(event.target)) {
    isOpenHeaderAuth.value = false
  }
}
// Gắn sự kiện khi component được mount
onMounted(async () => {
  await store.dispatch('system/fetchConfigLists')
  document.addEventListener('click', handleClickOutside)
})
// Gỡ sự kiện khi component bị unmount
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
const logout = () => {
  store.dispatch('auth/logout').then(() => {
    router.push({
      name: 'Login',
    })
  })
}
</script>
<template>
  <header class="w-full py-1 px-3 shadow-md fixed z-10 bg-white">
    <div class="flex justify-between items-center">
      <router-link :to="{ name: 'Dashboard' }" v-if="system?.general?.logo">
        <img alt="logo" class="h-14" :src="system.general.logo" />
      </router-link>
      <div class="flex items-center">
        <div class="header-auth-box pl-5 relative" ref="headerAuthBoxRef" v-if="users">
          <div class="flex items-center space-x-2 cursor-pointer" @click="toggleHeaderAuth">
            <img class="rounded-full w-10 h-10" src="../assets/mona_logo.png" />
            <div class="flex flex-col">
              <span class="text-sm font-bold">{{ users.name }}</span>
              <span class="text-xs font-semibold">{{ users.code }} - {{ users.account }}</span>
            </div>
          </div>
          <div v-if="isOpenHeaderAuth" class="absolute top-8 right-0 bg-white shadow-lg rounded-lg w-[130px]">
            <ul class="text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
              <li>
                <router-link :to="{ name: 'Profile' }" class="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white font-semibold">
                  <UserCircleIcon class="block h-6 w-6 text-primary" aria-hidden="true" />
                  <span>Tài khoản</span>
                </router-link>
              </li>
              <li>
                <a href="#" @click.prevent="logout" class="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white font-semibold">
                  <LogoutIcon class="block h-6 w-6 text-primary" aria-hidden="true" />
                  <span>Đăng xuất</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
