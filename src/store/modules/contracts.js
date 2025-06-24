import axiosInstance from "../../axios";

export default {
    namespaced: true,
    state: {
        contractLists: [],
        contracts: [],
        pagination: [],
        totalPages: 1,
    },
    mutations: {
        setContractLists(state, data) {
            state.contractLists = [{ id: 0, name: 'Chọn hợp đồng' }, ...data.contracts];
        },
        setContracts(state, data) {
            state.contracts = data.lists;
            state.pagination = data.pagination;
        },
        addContracts(state, contract) {
            state.contracts.unshift(contract);
            state.pagination.total = state.pagination.total + 1;
        },
        updateContracts(state, contract) {
            const index = state.contracts.findIndex((c) => c.id === contract.id);
            if (index !== -1) state.contracts[index] = { ...contract };
        },
        deleteContracts(state, id) {
            state.contracts = state.contracts.filter((c) => c.id !== id);
            state.pagination.total = state.pagination.total - 1;
        },
    },
    actions: {
        async fetchContractLists({ commit }) {
            try {
                const { data } = await axiosInstance.get(`contract-lists`);
                commit('setContractLists', data);
            } catch (error) {
                throw error;
            }
        },
        async fetchContracts({ commit }, { page = 1, perPage = 20, params = {} } = {}) {
            try {
                const queryParams = new URLSearchParams({ page, per_page: perPage, ...params }).toString();
                const { data } = await axiosInstance.get(`contracts?${queryParams}`);
                commit('setContracts', data);
            } catch (error) {
                throw error;
            }
        },
        async addContract({ commit }, contractData) {
            try {
                const { data } = await axiosInstance.post('contracts', contractData);
                commit('addContracts', data.contract);
                return data;
            } catch (error) {
                throw error;
            }
        },
        async updateContract({ commit }, contractData) {
            try {
                const { data } = await axiosInstance.put(`contracts/${contractData.id}`, contractData);
                commit('updateContracts', data.contract);
                return data;
            } catch (error) {
                throw error;
            }
        },
        async deleteContract({ commit }, id) {
            try {
                const { data } = await axiosInstance.delete(`contracts/${id}`);
                commit('deleteContracts', id);
                return data;
            } catch (error) {
                throw error;
            }
        },
    },
    getters: {
        contractLists: (state) => state.contractLists,
        contracts: (state) => state.contracts,
        pagination: (state) => state.pagination,
        totalPages: (state) => state.totalPages,
    },
};