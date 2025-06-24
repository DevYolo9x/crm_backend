import axiosInstance from "../../axios";

export default {
    namespaced: true,
    state: {
        customerLists: [],
        customers: [],
        pagination: [],
        totalPages: 1,
    },
    mutations: {
        setCustomerLists(state, data) {
            state.customerLists = [{ id: 0, title: 'Chọn khách hàng' }, ...data.customers];
        },
        setCustomers(state, data) {
            state.customers = data.lists
            state.pagination = data.pagination
        },
        addCustomer: (state, group) => {
            state.customers.unshift(group)
            state.pagination.total = state.pagination.total + 1
        },
        updateCustomer: (state, group) => {
            const index = state.customers.findIndex((c) => c.id === group.id)
            if (index !== -1) state.customers[index] = { ...group }
        },
        deleteCustomer: (state, id) => {
            state.customers = state.customers.filter((c) => c.id !== id)
            state.pagination.total = state.pagination.total - 1

        },
        removeAttachment: (state, { customerId, fileUrl }) => {
            const customerIndex = state.customers.findIndex((c) => c.id === customerId);
            if (customerIndex !== -1) {
                const customer = state.customers[customerIndex];
                customer.attachment = customer.attachment.filter((file) => file.url_origin !== fileUrl);
                state.customers[customerIndex] = { ...customer };
            }
        },
    },
    actions: {
        async fetchCustomerLists({ commit }, keyword) {
            try {
                const { data } = await axiosInstance.get(`customers/lists`, {
                    params: { keyword },
                });
                commit('setCustomerLists', data);
                
            } catch (error) {
                throw error
            }
        },
        async fetchCustomers({ commit }, { page = 1, perPage = 20, params = {} } = {}) {
            try {
                const queryParams = new URLSearchParams({ page, per_page: perPage, ...params }).toString()
                const { data } = await axiosInstance.get(`customers?${queryParams}`);
                commit('setCustomers', data);
            } catch (error) {
                throw error
            }
        },
        async addCustomer({ commit }, payload) {
            try {
                const { data } = await axiosInstance.post('customers', payload, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                commit('addCustomer', data.customer);
                return data;
            } catch (error) {
                throw error
            }
        },

        async updateCustomer({ commit }, payload) {
            try {
                let formDataObj = Object.fromEntries(payload.entries());
                const { data } = await axiosInstance.post(`customers/${formDataObj.id}`, payload, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                commit('updateCustomer', data.customer);
                return data;
            } catch (error) {
                throw error
            }
        },
        async deleteCustomer({ commit }, id) {
            try {
                const { data } = await axiosInstance.delete(`customers/${id}`);
                commit('deleteCustomer', id)
                return data
            } catch (error) {
                throw error
            }
        },
        async removeAttachment({ commit }, { customerId, fileUrl }) {
            try {
                const { data } = await axiosInstance.delete(`customers/${customerId}/remove-attachment`, {
                    data: { file_url: fileUrl },
                });
                commit('removeAttachment', { customerId, fileUrl });
                return data;
            } catch (error) {
                throw error;
            }
        },
    },
    getters: {
        customerLists: (state) => state.customerLists,
        customers: (state) => state.customers,
        pagination: (state) => state.pagination,
        totalPages: (state) => state.totalPages,
    },
};