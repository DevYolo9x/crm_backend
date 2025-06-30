import axiosInstance from "../../axios";
import axios from 'axios'
import qs from 'qs';

export default {
    namespaced: true,
    state: {
        candidateLists: [],
        candidates: [],
        pagination: [],
        totalPages: 1,
        provinces: [],
        educations: [],
        languages: [],
    },
    mutations: {
        setProvinces(state, provinces) {
            state.provinces = provinces;
        },
        setEducations(state, educations) {
            state.educations = educations;
        },
        setLanguages(state, languages) {
            state.languages = languages;
        },
        setCandidateLists(state, data) {
            state.candidateLists = [{ id: 0, full_name: 'Chọn ứng viên' }, ...data.candidates];
        },
        setCandidates(state, data) {
            state.candidates = data.lists;
            state.pagination = data.pagination;
        },
        addCandidates(state, candidate) {
            state.candidates.unshift(candidate);
            state.pagination.total = state.pagination.total + 1;
        },
        updateCandidates(state, candidate) {
            const index = state.candidates.findIndex((c) => c.id === candidate.id);
            if (index !== -1) state.candidates[index] = { ...candidate };
        },
        deleteCandidates(state, id) {
            state.candidates = state.candidates.filter((c) => c.id !== id);
            state.pagination.total = state.pagination.total - 1;
        },
    },
    actions: {
        async assignCandidateToUser({ commit }, payload) {
            try {
                const { data } = await axiosInstance.post('candidates/add-user', payload);
                // Nếu response có trả về candidate đã được cập nhật
                if (data.candidate) {
                    commit('updateCandidates', data.candidate);
                }
                return data;
            } catch (error) {
                throw error;
            }
        },
        async fetchCandidateLists({ commit }, keyword) {
            try {
                const { data } = await axiosInstance.get(`candidates/lists`, {
                    params: { keyword },
                });
                commit('setCandidateLists', data);
            } catch (error) {
                throw error;
            }
        },
        async fetchCandidates({ commit }, { page = 1, perPage = 20, params = {} } = {}) {
            try {
                //const queryParams = new URLSearchParams({ page, per_page: perPage, ...params }).toString();
                const queryParams = qs.stringify({
                    page,
                    per_page: perPage,
                    ...params
                  }, {
                    arrayFormat: 'brackets' // Kết quả: industry_id[]=1&industry_id[]=2
                  });
                const { data } = await axiosInstance.get(`candidates?${queryParams}`);
                commit('setCandidates', data);
            } catch (error) {
                throw error;
            }
        },
        async addCandidate({ commit }, payload) {
            try {
                console.log(payload)
                const { data } = await axiosInstance.post('candidates', payload);
                commit('addCandidates', data.candidate);
                return data;
            } catch (error) {
                throw error;
            }
        },
        async updateCandidate({ commit }, payload) {
            try {
                let formDataObj = Object.fromEntries(payload.entries());
                // console.log(payload)
                const { data } = await axiosInstance.post(`candidates/${formDataObj.id}`, payload);

                // const { data } = await axiosInstance.post(`candidates/${payload.id}`, payload);

                // const { data } = axios.post('http://127.0.0.1:8000/api/v1/candidates/16', payload, {
                //     headers: {
                //       Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjgwMDAvYXBpL3YxL2F1dGgvbG9naW4iLCJpYXQiOjE3NTA5MDEwODYsImV4cCI6MTk2ODYyOTA4NiwibmJmIjoxNzUwOTAxMDg2LCJqdGkiOiJRTTBIekpNSDhBWlI1SUlmIiwic3ViIjoiMSIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.PtVZp0u6vELVTqJcRWSYg-1Q2B8ZXf-BuN-QiznBXo8`
                //     },
                //   })
                //commit('updateCandidates', data.candidate);
                return data;
            } catch (error) {
                throw error;
            }
        },
        async deleteCandidate({ commit }, id) {
            try {
                const { data } = await axiosInstance.delete(`candidates/${id}`);
                commit('deleteCandidates', id);
                return data;
            } catch (error) {
                throw error;
            }
        },
        async fetchProvinces({ commit }) {
            try {
                const { data } = await axiosInstance.get('config/cities');
                commit('setProvinces', data);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách tỉnh/thành phố:', error);
            }
        },
        async fetchConfigCandidate({ commit }) {
            try {
                const { data } = await axiosInstance.get('config/configurations/candidate');
                commit('setEducations', data.educations);
                commit('setLanguages', data.languages);
            } catch (error) {
                console.error('Lỗi khi lấy cấu hình ứng viên:', error);
            }
        },
    },
    getters: {
        candidateLists: (state) => state.candidateLists,
        candidates: (state) => state.candidates,
        pagination: (state) => state.pagination,
        totalPages: (state) => state.totalPages,
        provinces: (state) => state.provinces,
        educations: (state) => state.educations,
        languages: (state) => state.languages,
    },
};