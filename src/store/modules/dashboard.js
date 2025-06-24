import axiosInstance from "../../axios";
export default {
    namespaced: true,
    state: {
        totals: {},
        chartData: {},
        labels: [],
    },
    mutations: {
        SET_DASHBOARD_DATA(state, data) {
            state.totals = data.totals
        },
        SET_CHART_DATA(state, { chartData, labels }) {
            state.chartData = chartData;
            state.labels = labels;
        },
    },
    actions: {
        async fetchTotals({ commit }) {
            try {
                const { data } = await axiosInstance.get('dashboard/statistics')

                commit('SET_DASHBOARD_DATA', data)
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            }
        },
        async fetchChartData({ commit }, type = 'week') {
            try {
                const { data } = await axiosInstance.get('/dashboard/chart', {
                    params: { type },
                });
                commit('SET_CHART_DATA', { chartData: data.chart_data, labels: data.labels });
            } catch (error) {
                console.error('Error fetching chart data:', error);
            }
        },
    },
    getters: {
        totals: (state) => state.totals,
        chartData: (state) => state.chartData,
        labels: (state) => state.labels,
    },
};