import axiosInstance from '../../axios'
const state = {
    user: {
        data: {},
        token: localStorage.getItem('TOKEN') || null,
    },
    permissions: {},
    permissionsLoaded: false, // <- thêm biến này

}
const mutations = {
    setPermissionsLoaded(state, status) {
        state.permissionsLoaded = status
    },
    setUser(state, { user, token }) {
        state.user.data = user
        state.user.token = token
        localStorage.setItem('TOKEN', token)
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}` // ✅ Cập nhật axios
    },
    clearUser(state) {
        state.user.data = {}
        state.user.token = null
        localStorage.removeItem('TOKEN')
        delete axiosInstance.defaults.headers.common['Authorization'] // ✅ Xóa header khi logout
    },
    SET_UPDATE_USER(state, user) {
        state.user.data = user
    },
    setPermissions(state, permissions) {
        state.permissions = permissions
    }
}
const actions = {
    async fetchUserPermissions({ commit }) {
        try {
            const { data } = await axiosInstance.get('auth/permissions')
            commit('setPermissions', data)
        } catch (error) {
            console.error('Error fetching permissions:', error)
        }
    },
    async fetchUpdateUserPermissions({ commit, dispatch }, payload) {
        try {
            console.log(payload)
            const { data } = await axiosInstance.put(`permissions/update/${payload.id}`)

            // Reset để lần sau router biết phải load lại
            commit('setPermissionsLoaded', false)

            // Load lại permissions ngay lập tức (không cần chờ chuyển trang)
            await dispatch('fetchUserPermissions')

            // Sau khi load xong thì set lại đã load
            commit('setPermissionsLoaded', true)

            return data
        } catch (error) {
            console.error('Error fetching permissions:', error)
        }
    },
    async login({ commit }, user) {
        try {
            const { data } = await axiosInstance.post('auth/login', user)
            if (data.status === 200) {
                commit('setUser', { user: data.user, token: data.token })
                return { status: true, data }
            }
            return { status: false, error: data.errors }
        } catch ({ response }) {
            return { status: false, error: response?.data?.message || 'Đăng nhập thất bại' }
        }
    },
    async checkAuth({ commit }) {
        const token = localStorage.getItem('TOKEN')
        if (!token) return { status: false, error: 'Chưa đăng nhập' }
        try {
            const { data } = await axiosInstance.get('auth/profile')
            commit('setUser', { user: data.user, token })
            return { status: true, data }
        } catch (error) {
            commit('clearUser')
            return { status: false, error: 'Token không hợp lệ hoặc đã hết hạn' }
        }
    },

    async logout({ commit }) {
        try {
            const token = localStorage.getItem('TOKEN')
            if (!token) throw new Error('Không tìm thấy token')
            const { data } = await axiosInstance.delete('auth/logout', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (data.status === 200) {
                commit('clearUser')
                return { status: true, data }
            }
            return { status: false, error: data.message }
        } catch (error) {
            return { status: false, error: error.response?.data?.message || error.message }
        }
    },
    async updateUser({ commit }, form) {
        try {
            const { data } = await axiosInstance.put('auth/profile-update', form)
            commit('SET_UPDATE_USER', data.user)
            return data
        } catch (error) {
            console.error('Error deleting config:', error)
            throw error
        }
    },
}
const getters = {
    auth: (state) => state.user.data,
    permissions: (state) => state.permissions,
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
