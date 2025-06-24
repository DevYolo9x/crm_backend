import axiosInstance from "../../axios";

export default {
    namespaced: true,
    state: {
        candidateJobs: [],
    },
    mutations: {
        SET_CANDIDATE_JOBS(state, { data, meta }) {
            state.candidateJobs = data;
        },
        ADD_CANDIDATE_JOB(state, candidateJob) {
            state.candidateJobs.unshift(candidateJob);

        },
        UPDATE_CANDIDATE_JOB(state, updatedCandidateJob) {
            const index = state.candidateJobs.findIndex(cj => cj.id === updatedCandidateJob.id);
            if (index !== -1) {
                state.candidateJobs.splice(index, 1, updatedCandidateJob);
            }
        },
        REMOVE_CANDIDATE_JOB(state, id) {
            state.candidateJobs = state.candidateJobs.filter(cj => cj.id !== id);
        },
    },
    actions: {
        async fetchCandidateJobs({ commit }, payload) {
            try {
                const { data } = await axiosInstance.get(`candidate-jobs/${payload.job_id}`);
                commit('SET_CANDIDATE_JOBS', { data: data.lists });
                return data;
            } catch (error) {
                console.error('Error fetching candidate jobs:', error);
            }
        },
        async assignCandidateToJob({ commit }, payload) {
            try {
                const { data } = await axiosInstance.post(`candidate-jobs/${payload.job_id}`, payload);
                commit('ADD_CANDIDATE_JOB', data.data);
                return data;
            } catch (error) {
                throw error.response.data;
            }
        },
        async updateCandidateJobStatus({ commit }, { id, status }) {
            try {
                const { data } = await axiosInstance.put(`candidate-jobs/${id}`, { status });
                commit('UPDATE_CANDIDATE_JOB', data.data);
                return data;
            } catch (error) {
                throw error.response.data;
            }
        },
        async deleteCandidateJob({ commit }, id) {
            try {
                await axiosInstance.delete(`candidate-jobs/${id}`);
                commit('REMOVE_CANDIDATE_JOB', id);
            } catch (error) {
                throw error.response.data;
            }
        },
    },
    getters: {
        candidateJobs: (state) => state.candidateJobs,
        pagination: (state) => state.pagination,
    },
};