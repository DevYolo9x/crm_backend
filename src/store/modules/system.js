import axiosInstance from '../../axios'
export default {
    namespaced: true,

    state: {
        tabs: [], // Lưu trữ danh sách tab từ server
        fieldConfig: {}, // Lưu trữ cấu trúc field từ server
        configs: {}, // Lưu trữ giá trị cấu hình (dữ liệu thực tế từ bảng configurations)
        system: null
    },
    mutations: {
        SET_CONFIG_STRUCTURE(state, { tabs, fieldConfig }) {
            state.tabs = tabs
            state.fieldConfig = fieldConfig

            // Khởi tạo configs dựa trên fieldConfig nếu chưa có
            const initialConfigs = {}
            for (const group in fieldConfig) {
                initialConfigs[group] = {}
                fieldConfig[group].forEach((field) => {
                    initialConfigs[group][field.key] = state.configs[group]?.[field.key] || ''
                })
            }
            state.configs = initialConfigs // Gán lại configs để đảm bảo có cấu trúc
            // console.log('Khởi tạo state.configs:', state.configs)

        },

        SET_CONFIGS(state, configs) {
            // Đồng bộ configs với fieldConfig
            const updatedConfigs = { ...state.configs }
            for (const group in state.fieldConfig) {
                if (!updatedConfigs[group]) updatedConfigs[group] = {}
                state.fieldConfig[group].forEach((field) => {
                    updatedConfigs[group][field.key] = configs[group]?.[field.key] || state.configs[group]?.[field.key] || ''
                })
            }
            state.configs = updatedConfigs
            // console.log('Đồng bộ state.configs từ server:', state.configs)
        },

        UPDATE_CONFIG(state, { key, value }) {
            const [group, field] = key.split('.')
            if (!state.configs[group]) {
                state.configs[group] = {}
            }
            state.configs[group][field] = value
            // console.log(`Cập nhật state.configs[${group}][${field}]:`, value)
        },
        SET_CONFIG_LISTS(state, configs) {
            state.system = configs
        },
    },

    actions: {
        async fetchConfigStructure({ commit }) {
            try {
                const response = await axiosInstance.get('config/config-structure')
                commit('SET_CONFIG_STRUCTURE', { tabs: response.data.tabs, fieldConfig: response.data.fieldConfig })
            } catch (error) {
                console.error('Lỗi khi lấy cấu trúc từ server:', error)
            }
        },

        async fetchConfigs({ commit }) {
            try {
                const response = await axiosInstance.get('config/configurations')
                commit('SET_CONFIGS', response.data)
            } catch (error) {
                console.error('Lỗi khi lấy cấu hình:', error)
            }
        },
        async fetchConfigLists({ commit }) {
            try {
                const response = await axiosInstance.get('config/configurations')
                commit('SET_CONFIG_LISTS', response.data)
            } catch (error) {
                console.error('Lỗi khi lấy cấu hình:', error)
            }
        },

        async saveConfigs({ state }, fields) {
            try {
                // console.log('Dữ liệu gửi lên:', fields)
                if (Object.keys(fields).length === 0) {
                    throw new Error('Không có dữ liệu để gửi lên')
                }
                const response = await axiosInstance.post('config/configurations', fields, {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                })
                if (response.status === 200) {
                    return response
                }
            } catch (error) {
                console.error('Lỗi khi lưu cấu hình:', error.response?.data || error.message)
            }
        },

        async uploadFile({ commit }, { file, group, key }) {
            const fullKey = `${group}.${key}`
            const formData = new FormData()
            formData.append('file', file)
            formData.append('group', group)
            formData.append('key', key)
            try {
                const response = await axiosInstance.post('config/configurations/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                commit('UPDATE_CONFIG', { key: fullKey, value: response.data.url })
                if (response.status === 200) {
                    return response
                }
            } catch (error) {
                console.error('Lỗi khi upload file:', error)
            }
        },
    },

    getters: {
        getConfig: (state) => (group, key) => {
            return state.configs[group] ? state.configs[group][key] || '' : ''
        },
        system: (state) => state.system,
        getTabs: (state) => state.tabs,
        getFieldConfig: (state) => state.fieldConfig,
    },
}
