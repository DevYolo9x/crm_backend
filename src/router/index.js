import { createRouter, createWebHistory } from 'vue-router'
import { useToastr } from '../plugins/toastr'
import { can } from '../helpers/permissions'
import axiosInstance from '../axios'
import store from '../store'

// Layouts
import Default from '../components/layouts/Default.vue'
import Auth from '../components/layouts/Auth.vue'

// Pages
import Login from '../views/auth/Login.vue'
import Dashboard from '../views/auth/Dashboard.vue'

// System
import Configuration from '../views/setting/Configuration.vue'

// Permissions
import ListPermissions from '../views/permissions/ListPermissions.vue'
import FormPermissions from '../views/permissions/FormPermissions.vue'

// Roles
import ListRoles from '../views/roles/ListRoles.vue'
import FormRoles from '../views/roles/FormRoles.vue'

// Users
import ListUser from '../views/user/ListUser.vue'
import FormUser from '../views/user/FormUser.vue'

// Customers
import CustomerList from '../views/customer/CustomerList.vue'
import CustomerGroup from '../views/customer/CustomerGroup.vue'

// Jobs
import JobList from '../views/job/JobList.vue'
import JobForm from '../views/job/JobForm.vue'

// Others
import IndustryManagement from '../views/industry/IndustryManagement.vue'
import ActivityLog from '../views/activityLog/ActivityLog.vue'
import CandidateList from '../views/candidate/CandidateList.vue'
import CandidateForm from '../views/candidate/CandidateForm.vue'

// Contracts
import ContractList from '../views/contract/ContractList.vue'
import ContractForm from '../views/contract/ContractForm.vue'
import ContractDetail from '../views/contract/ContractDetail.vue'

// Profile
import Profile from '../views/auth/Profile.vue'
import AssignCandidate from '../views/candidate/AssignCandidate.vue'

const toastr = useToastr()

const routes = [
    {
        path: '/',
        component: Default,
        meta: { requireAuth: true },
        children: [
            { path: '', name: 'Dashboard', component: Dashboard, meta: { title: 'Dashboard' } },

            // System
            { path: 'cau-hinh/cau-hinh-he-thong', name: 'settings.configuration', component: Configuration, meta: { title: 'Cấu hình hệ thống', resource: 'configurations', action: 'edit' } },

            // Customers
            { path: 'customers', name: 'customers.index', component: CustomerList, meta: { title: 'Quản lý khách hàng', resource: 'customers', action: 'index' } },
            { path: 'customer-groups', name: 'customers.group.index', component: CustomerGroup, meta: { title: 'Quản lý nhóm khách hàng', resource: 'customer_groups', action: 'index' } },

            // Jobs
            { path: 'jobs', name: 'jobs.index', component: JobList, meta: { title: 'Quản lý job order', resource: 'jobs', action: 'index' } },
            { path: 'jobs/create', name: 'jobs.create', component: JobForm, meta: { title: 'Thêm mới job order', resource: 'jobs', action: 'create' } },
            { path: 'jobs/:id', name: 'jobs.update', component: JobForm, meta: { title: 'Cập nhập job order', resource: 'jobs', action: 'edit' } },
            { path: 'candidate-jobs/:id', name: 'CandidateJobs', component: AssignCandidate, meta: { title: 'Danh sách ứng viên', resource: 'jobs', action: 'index' } },
            
            // Candidates
            { path: 'candidate', name: 'Candidates', component: CandidateList, meta: { title: 'Quản lý ứng viên', resource: 'candidates', action: 'index' } },
            { path: 'candidate/:id', name: 'Candidates.update', component: CandidateForm, meta: { title: 'Cập nhật ứng viên', resource: 'candidates', action: 'edit' } },

            // Industries
            { path: 'industries', name: 'Industries', component: IndustryManagement, meta: { title: 'Quản lý ngành nghề', resource: 'industries', action: 'index' } },

            // Contracts
            { path: 'contracts', name: 'ContractList', component: ContractList, meta: { title: 'Quản lý hợp đồng', resource: 'contracts', action: 'index' } },
            { path: 'contracts/create', name: 'ContractCreate', component: ContractForm, meta: { title: 'Thêm mới hợp đồng', resource: 'contracts', action: 'create' } },
            { path: 'contracts/edit/:id', name: 'ContractEdit', component: ContractForm, meta: { title: 'Cập nhật hợp đồng', resource: 'contracts', action: 'edit' } },
            { path: 'contracts/:id', name: 'ContractDetail', component: ContractDetail, meta: { title: 'Chi tiết hợp đồng', resource: 'contracts', action: 'index' } },

            // Users
            { path: 'users', name: 'users.index', component: ListUser, meta: { title: 'Danh sách nhân viên', resource: 'users', action: 'index' } },
            { path: 'users/create', name: 'users.create', component: FormUser, meta: { title: 'Thêm mới nhân viên', resource: 'users', action: 'create' } },
            { path: 'users/update/:id', name: 'users.update', component: FormUser, meta: { title: 'Cập nhập nhân viên', resource: 'users', action: 'edit' } },

            // Roles
            { path: 'roles', name: 'roles.index', component: ListRoles, meta: { title: 'Nhóm nhân viên', resource: 'roles', action: 'index' } },
            { path: 'roles/create', name: 'roles.create', component: FormRoles, meta: { title: 'Thêm mới nhóm nhân viên', resource: 'roles', action: 'create' } },
            { path: 'roles/update/:id', name: 'roles.update', component: FormRoles, meta: { title: 'Cập nhập nhóm nhân viên', resource: 'roles', action: 'edit' } },

            // Permissions
            { path: 'permissions', name: 'permissions.index', component: ListPermissions, meta: { title: 'Danh sách nhóm phân quyền', resource: 'permissions', action: 'index' } },
            { path: 'permissions/create', name: 'permissions.create', component: FormPermissions, meta: { title: 'Thêm mới nhóm phân quyền', resource: 'permissions', action: 'create' } },

            // Logs
            { path: 'activity-logs', name: 'ActivityLogs', component: ActivityLog, meta: { title: 'Quản lý logs', resource: 'activity_logs', action: 'index' } },

            // Profile
            { path: 'profile', name: 'Profile', component: Profile, meta: { title: 'Thông tin tài khoản' } },
        ]
    },

    // Auth
    {
        path: '/',
        component: Auth,
        meta: { isGuest: true },
        children: [{ path: 'login', name: 'Login', component: Login }]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Set token nếu có
const token = localStorage.getItem('TOKEN')
if (token) axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`

// Router Guard
router.beforeEach(async (to, _, next) => {
    document.title = to.meta?.title || 'HITSUJI CRM'
    const { requireAuth, isGuest, resource, action } = to.meta
    const isAuthenticated = !!store.state.auth.user.token
    if (requireAuth && !isAuthenticated) return next({ name: 'Login' })
    if (isGuest && isAuthenticated) return next({ name: 'Dashboard' })
    // Load permission chỉ 1 lần duy nhất khi chưa có
    if (isAuthenticated && !store.state.auth.permissionsLoaded) {
        await store.dispatch('auth/fetchUserPermissions')
        store.commit('auth/setPermissionsLoaded', true)
    }
    // Lấy ra danh sách ngôn ngữ
    if (!store.getters['languages/languages'].length) {
        await store.dispatch('languages/fetchLanguages')
    }
    // Check quyền
    if (isAuthenticated && resource && action && !can(store.getters['auth/permissions'], resource, action)) {
        toastr.error(`Bạn không có quyền thực hiện chức năng này`)
        return next({ name: 'Dashboard' })
    }
    // Xử lý active menu
    const specialMenus = {
        'jobs.create': '/jobs',
        'jobs.update': '/jobs',
        'CandidateJobs': '/jobs',
        'ContractCreate': '/contracts',
        'ContractEdit': '/contracts',
        'ContractDetail': '/contracts',
        'users.create': '/users',
        'users.update': '/users',
        'roles.create': '/roles',
        'roles.update': '/roles',
        'permissions.create': '/permissions',
    }
    const activeMenu = specialMenus[to.name] || to.path
    store.dispatch('sidebar/syncActiveMenuWithRoute', activeMenu)

    next()
})
export default router
