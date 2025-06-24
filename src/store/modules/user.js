import axiosInstance from '../../axios'
const state = {
    userLists: [],
    users: [],
    pagination: [],
}
const mutations = {
    SET_USER_LISTS(state, data) {
        state.userLists = data
    },
    SET_USERS(state, data) {
        state.users = data.users
        state.pagination = data.pagination
    },
    ADD_USER: (state, use) => state.users.unshift(use),
    UPDATE_USER: (state, updatedUser) => {
        const index = state.users.findIndex((c) => c.id === updatedUser.id)
        if (index !== -1) state.users[index] = { ...updatedUser }
    },
    DELETE_USER: (state, id) => {
        state.users = state.users.filter((c) => c.id !== id)
    },
}
const actions = {
    async fetchUserLists({ commit }, keyword) {
        try {
            const { data } = await axiosInstance.get(`users/lists`, {
                params: { keyword },
            })
            commit('SET_USER_LISTS', data)
            return data
        } catch (error) {
            throw error
        }
    },
    async fetchUsers({ commit }, { page = 1, perPage = 20, params = {} } = {}) {
        try {
            const queryParams = new URLSearchParams({ page, per_page: perPage, ...params }).toString()
            const { data } = await axiosInstance.get(`users/index?${queryParams}`)
            commit('SET_USERS', data)
            return data
        } catch (error) {
            throw error
        }
    },

    async addUser({ commit }, payload) {
        try {
            const { data } = await axiosInstance.post('users/store', payload)
            commit('ADD_USER', data.user)
            return data
        } catch (error) {
            throw error
        }
    },
    async updateUser({ commit }, payload) {
        try {
            let user = Object.fromEntries(payload.entries());
            const { data } = await axiosInstance.post(`users/update/${user.id}`, payload)
            commit('UPDATE_USER', data.user)
            return data
        } catch (error) {
            throw error
        }
    },
    async deleteUser({ commit }, id) {
        try {
            const { data } = await axiosInstance.delete(`users/destroy/${id}`)
            commit('DELETE_USER', id)
            return data
        } catch (error) {
            throw error
        }
    },
}

const getters = {
    userLists: (state) => state.userLists,
    allUsers: (state) => state.users,
    pagination: (state) => state.pagination,
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
}
