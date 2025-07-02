<script setup>
import { HomeIcon, ArchiveIcon, UserGroupIcon, CollectionIcon } from '@heroicons/vue/outline'
import { menuItems } from '../constants/menuItems'
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { can, filterMenuByPermissions } from '../helpers/permissions'

const store = useStore()
const route = useRoute()

const activeMenu = computed(() => store.state.sidebar.activeMenu)
const userPermissions = computed(() => store.getters['auth/permissions'] || {})

// Filter menu theo permission
const permittedMenuItems = computed(() => (Object.keys(userPermissions.value).length ? filterMenuByPermissions(userPermissions.value, menuItems) : []))

// Mapping các route cần đồng bộ activeMenu
const routeMap = {
  'jobs.create': '/jobs',
  'jobs.update': '/jobs',
  CandidateJobs: '/jobs',
  ContractCreate: '/contracts',
  ContractEdit: '/contracts',
  ContractDetail: '/contracts',
  'users.create': '/users',
  'users.update': '/users',
  'roles.create': '/roles',
  'roles.update': '/roles',
  'permissions.create': '/permissions',
}

const setActiveMenu = (menuId) => store.dispatch('sidebar/updateActiveMenu', menuId)

onMounted(() => {
  const active = routeMap[route.name] || route.path
  store.dispatch('sidebar/syncActiveMenuWithRoute', active)
})

// Icon map
const iconMap = {
  dashboard: HomeIcon,
  orders: ArchiveIcon,
  auth: UserGroupIcon,
}
</script>

<template>
  <!-- sidebar -->
  <button data-drawer-target="sidebar-multi-level-sidebar" data-drawer-toggle="sidebar-multi-level-sidebar" aria-controls="sidebar-multi-level-sidebar" type="button" class="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
    <span class="sr-only">Open sidebar</span>
    <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
      <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" />
    </svg>
  </button>

  <aside id="sidebar-multi-level-sidebar" class="bg-[#182537] fixed top-[64px] left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 shadow-md" aria-label="Sidebar">
    <div class="element h-full px-3 py-4 dark:bg-gray-800">
      <ul class="font-medium">
        <li v-for="menu in permittedMenuItems" :key="menu.id">
          <router-link
            :to="menu.children ? '#' : menu.route || '#'"
            @click.prevent="menu.children ? null : setActiveMenu(menu.id)"
            :class="{
              'bg-primary text-white hover:text-black': activeMenu === menu.id,
              'cursor-default text-gray-500': menu.children,
              'hover:bg-primary hover:text-white': !menu.children,
            }"
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white dark:hover:bg-gray-700 group text-primary"
          >
            <component :is="iconMap[menu.id] || CollectionIcon" class="block h-6 w-6" aria-hidden="true" />
            <span class="ml-3">{{ menu.title }}</span>
          </router-link>
          <ul v-if="menu.children" class="text-sm">
            <li v-for="sub in menu.children" :key="sub.id">
              <router-link :to="sub.route" @click="setActiveMenu(sub.id)" :class="{ 'bg-primary text-white hover:text-black': activeMenu === sub.id }" class="flex items-center w-full px-2 py-1 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-primary hover:text-white dark:text-white dark:hover:bg-gray-700">
                {{ sub.title }}
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </aside>
</template>
