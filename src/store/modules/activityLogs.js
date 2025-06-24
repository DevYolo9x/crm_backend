import axiosInstance from '../../axios'

export default {
    namespaced: true,
    state: () => ({
        logs: [],
        pagination: {}
    }),

    mutations: {
        setLogs(state, { lists, pagination }) {
            state.logs = lists
            state.pagination = pagination
        }
    },

    actions: {
        async fetchActivityLogs({ commit }, { params = {} } = {}) {
            try {
                const query = new URLSearchParams(params).toString()
                const { data } = await axiosInstance.get(`activity-logs?${query}`)
                commit('setLogs', data)
                return data
            } catch (error) {
                console.error('Fetch activity logs failed:', error)
                throw error
            }
        }
    },

    getters: {
        logs: state => state.logs,
        pagination: state => state.pagination
    }
}