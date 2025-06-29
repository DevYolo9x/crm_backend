import axiosInstance from "../../axios";

export default {
    namespaced: true,
    state: {
        industryLists: [],
        industries: [],
        industriesLang: [],
        pagination: [],
        totalPages: 1,
    },
    mutations: {
        setIndustryLists(state, data) {
            state.industryLists = [{ id: 0, title: 'Chọn nhóm ngành nghề' }, ...data.industries];
        },
        setIndustryListsLang(state, data) {
            state.industriesLang = data.industries;
        },
        setIndustries(state, data) {
            state.industries = data.lists;
            state.pagination = data.pagination;
        },
        addIndustries(state, industry) {
            state.industries.unshift(industry);
            state.pagination.total = state.pagination.total + 1;
        },
        updateIndustries(state, industry) {
            const index = state.industries.findIndex((i) => i.id === industry.id);
            if (index !== -1) state.industries[index] = { ...industry };
        },
        deleteIndustries(state, id) {
            state.industries = state.industries.filter((i) => i.id !== id);
            state.pagination.total = state.pagination.total - 1;
        },
    },
    actions: {
        async fetchIndustryLists({ commit }) {
            try {
                const { data } = await axiosInstance.get(`industries-lists`);
                commit('setIndustryLists', data);
            } catch (error) {
                throw error;
            }
        },
        async fetchIndustryListsLang({ commit }) {
            try {
                const { data } = await axiosInstance.get(`industries-lists-lang`);
                commit('setIndustryListsLang', data);
            } catch (error) {
                throw error;
            }
        },
        async fetchIndustries({ commit }, { page = 1, perPage = 20, params = {} } = {}) {
            try {
                const queryParams = new URLSearchParams({ page, per_page: perPage, ...params }).toString();
                const { data } = await axiosInstance.get(`industries?${queryParams}`);
                commit('setIndustries', data);
            } catch (error) {
                throw error;
            }
        },
        async addIndustry({ commit }, industryData) {
            try {
                const { data } = await axiosInstance.post('industries', industryData);
                commit('addIndustries', data.industry);
                return data;
            } catch (error) {
                throw error;
            }
        },
        async updateIndustry({ commit }, industryData) {
            try {
                const { data } = await axiosInstance.post(`industries/${industryData.id}`, industryData);
                commit('updateIndustries', data.industry);
                return data;
            } catch (error) {
                throw error;
            }
        },
        async deleteIndustry({ commit }, id) {
            try {
                const { data } = await axiosInstance.delete(`industries/${id}`);
                commit('deleteIndustries', id);
                return data;
            } catch (error) {
                throw error;
            }
        },
    },
    getters: {
        industryLists: (state) => state.industryLists,
        industries: (state) => state.industries,
        industriesLang: (state) => state.industriesLang,
        pagination: (state) => state.pagination,
        totalPages: (state) => state.totalPages,
    },
};