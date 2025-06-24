import axiosInstance from "../../axios";

export default {
    namespaced: true,
    state: {
        groupLists: [],
        groups: [],
        pagination: [],
        totalPages: 1,
    },
    mutations: {
        setGroupLists(state, data) {
            state.groupLists = [{ id: 0, title: 'Chọn nhóm khách hàng' }, ...data.groups];
        },
        setGroups(state, data) {
            state.groups = data.lists
            state.pagination = data.pagination
        },
        addGroups: (state, group) => {
            console.log(group)
            state.groups.unshift(group)
            state.pagination.total = state.pagination.total + 1
        },
        updateGroups: (state, group) => {
            const index = state.groups.findIndex((c) => c.id === group.id)
            if (index !== -1) state.groups[index] = { ...group }
        },
        deleteGroups: (state, id) => {
            state.groups = state.groups.filter((c) => c.id !== id)
            state.pagination.total = state.pagination.total - 1

        },
    },
    actions: {
        async fetchGroupLists({ commit }) {
            try {
                const { data } = await axiosInstance.get(`customer-group-lists`);
                commit('setGroupLists', data);
            } catch (error) {
                throw error
            }
        },
        async fetchGroups({ commit }, { page = 1, perPage = 20, params = {} } = {}) {
            try {
                const queryParams = new URLSearchParams({ page, per_page: perPage, ...params }).toString()
                const { data } = await axiosInstance.get(`customer-groups?${queryParams}`);
                commit('setGroups', data);
            } catch (error) {
                throw error
            }
        },
        async addGroup({ commit }, groupData) {
            try {
                const { data } = await axiosInstance.post('customer-groups', groupData);
                commit('addGroups', data.group);
                return data;
            } catch (error) {
                throw error
            }
        },

        async updateGroup({ commit }, groupData) {
            try {
                const { data } = await axiosInstance.put(`customer-groups/${groupData.id}`, groupData);
                commit('updateGroups', data.group);
                return data;
            } catch (error) {
                throw error
            }
        },
        async deleteGroup({ commit }, id) {
            try {
                const { data } = await axiosInstance.delete(`customer-groups/${id}`);
                commit('deleteGroups', id)
                return data
            } catch (error) {
                throw error
            }
        }
    },
    getters: {
        groupLists: (state) => state.groupLists,
        groups: (state) => state.groups,
        pagination: (state) => state.pagination,
        totalPages: (state) => state.totalPages,
    },
};