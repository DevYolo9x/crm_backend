import axiosInstance from '../../axios'

export default {
    namespaced: true,
    state: () => ({
        roles: [],
        pagination: {}
    }),

    mutations: {
        SET_ROLES(state, { roles, pagination }) {
            state.roles = roles
            state.pagination = pagination
        },
        ADD_ROLE(state, role) {
            state.roles.unshift(role)
        },
        UPDATE_ROLE(state, updatedRole) {
            const index = state.roles.findIndex(r => r.id === updatedRole.id)
            if (index !== -1) state.roles.splice(index, 1, updatedRole)
        },
        DELETE_ROLE(state, id) {
            state.roles = state.roles.filter(r => r.id !== id)
        }
    },

    actions: {
        async fetchRoles({ commit }, { params = {} } = {}) {
            try {
                const query = new URLSearchParams(params).toString()
                const { data } = await axiosInstance.get(`roles/index?${query}`)
                commit('SET_ROLES', data)
                return data
            } catch (error) {
                throw new Error('Failed to fetch roles')
            }
        },

        async addRole({ commit }, role) {
            try {
                const { data } = await axiosInstance.post('roles/store', role)
                commit('ADD_ROLE', data.role)
                return data
            } catch (error) {
                throw new Error('Failed to add role')
            }
        },

        async updateRole({ commit, dispatch }, role) {
            try {
                const { data } = await axiosInstance.put(`roles/update/${role.id}`, role)
                commit('UPDATE_ROLE', data.role)
                await dispatch('auth/fetchUserPermissions', null, { root: true })
                return data
            } catch (error) {
                throw new Error('Failed to update role')
            }
        },

        async deleteRole({ commit }, id) {
            try {
                const { data } = await axiosInstance.delete(`roles/destroy/${id}`)
                commit('DELETE_ROLE', id)
                return data
            } catch (error) {
                throw new Error('Failed to delete role')
            }
        }
    },

    getters: {
        allRoles: state => state.roles,
        pagination: state => state.pagination
    }
}