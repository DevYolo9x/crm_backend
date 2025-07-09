<script setup>
import { HomeIcon, ArchiveIcon, UserGroupIcon, CollectionIcon, BriefcaseIcon, UserIcon, OfficeBuildingIcon, ClipboardIcon, UserCircleIcon, CogIcon, AdjustmentsIcon, ChevronRightIcon  } from '@heroicons/vue/outline'
import { menuItems } from '../constants/menuItems'
import { computed, onMounted, ref } from 'vue'
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
  'Candidates.update': '/candidate',
  'Candidates.create': '/candidate',
  'permissions.create': '/permissions',
}

const setActiveMenu = (menuId) => store.dispatch('sidebar/updateActiveMenu', menuId)

onMounted(() => {
  const active = routeMap[route.name] || route.path
  store.dispatch('sidebar/syncActiveMenuWithRoute', active)
})

const isShowChildren = ref(false);

const activeParentMenu = ref(0);

const toggleChildren = (menuId) => {
  activeParentMenuId.value = activeParentMenuId.value === menuId ? null : menuId
}

const activeParentMenuId = ref(null)

// Icon map
const iconMap = {
  dashboard: HomeIcon,
  orders: ArchiveIcon,
  customer: UserGroupIcon,
  jobs: BriefcaseIcon,
  candidate: UserIcon,
  industries: OfficeBuildingIcon,
  contracts: ClipboardIcon,
  users: UserCircleIcon,
  setting: CogIcon,
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
    <div class="element h-full dark:bg-gray-800">
      <ul class="text-[14px]">
        <li v-for="menu in permittedMenuItems" :key="menu.id">
          <router-link
            :to="menu.children ? '#' : menu.route || '#'"
            @click.prevent="menu.children ? toggleChildren(menu.id) : setActiveMenu(menu.id)"
            :class="{
              'bg-primary text-white ': activeMenu === menu.id || activeParentMenuId === menu.id,
              'cursor-default text-gray-500': menu.children,
              'hover:bg-primary hover:text-white': !menu.children
            }"
            class="flex justify-between items-center px-3 py-[15px] text-white dark:text-white dark:hover:bg-gray-700 group cursor-pointer"
          >
            <div class="flex">
              <component :is="iconMap[menu.id] || CollectionIcon" class="block h-5 w-5" aria-hidden="true" />
              <span class="ml-3">
                {{ menu.title }}
              </span>
            </div>
            <span v-if="menu.children" class="cursor-pointer"><ChevronRightIcon class="inline-block h-4 w-4"/></span>
          </router-link>
          <ul v-if="menu.children && activeParentMenuId === menu.id" class="text-sm">
            <li v-for="sub in menu.children" :key="sub.id">
              <router-link :to="sub.route" @click="setActiveMenu(sub.id); activeParentMenuId = menu.id" :class="{ ' text-[#52afff] bg-[#52525259]': activeMenu === sub.id, ' text-white ': activeMenu !== sub.id }" class="flex items-center w-full px-2 py-3 transition duration-75 pl-11 group hover:bg-[#394350] dark:text-white dark:hover:bg-gray-700">
                {{ sub.title }}
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </aside>
</template>
