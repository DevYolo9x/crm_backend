import axiosInstance from "../../axios";

export default {
    namespaced: true,
    state: {
        jobs: [],
        pagination: [],
    },
    mutations: {
        setJobs(state, data) {
            state.jobs = data.lists;
            state.pagination = data.pagination;
        },
        addJobs: (state, job) => {
            state.jobs.unshift(job);
            state.pagination.total = state.pagination.total + 1;
        },
        updateJobs: (state, job) => {
            const index = state.jobs.findIndex((j) => j.id == job.id);
            if (index !== -1) state.jobs[index] = { ...job };
        },
        deleteJobs: (state, id) => {
            state.jobs = state.jobs.filter((j) => j.id != id);
            state.pagination.total = state.pagination.total - 1;
        },
    },
    actions: {
        async fetchJobs({ commit }, { page = 1, perPage = 20, params = {} } = {}) {
            try {
                const queryParams = new URLSearchParams({ page, per_page: perPage, ...params }).toString();
                const { data } = await axiosInstance.get(`jobs?${queryParams}`);
                commit('setJobs', data);
            } catch (error) {
                throw error;
            }
        },
        async addJob({ commit }, payload) {
            try {
                const { data } = await axiosInstance.post('jobs', payload);
                commit('addJobs', data.job);
                return data;
            } catch (error) {
                throw error;
            }
        },

        async updateJob({ commit }, payload) {
            try {
                let formDataObj = Object.fromEntries(payload.entries());
                const { data } = await axiosInstance.put(`jobs/${formDataObj.id}`, formDataObj);
                commit('updateJobs', data.job);
                return data;
            } catch (error) {
                throw error;
            }
        },
        async deleteJob({ commit }, id) {
            try {
                const { data } = await axiosInstance.delete(`jobs/${id}`);
                commit('deleteJobs', id);
                return data;
            } catch (error) {
                throw error;
            }
        },
        async fetchShowJob({ commit }, id) {
            try {
                const { data } = await axiosInstance.get(`jobs/${id}/show`);
                return data;
            } catch (error) {
                throw error;
            }
        }
    },
    getters: {
        jobs: (state) => state.jobs,
        pagination: (state) => state.pagination,
    },
};
