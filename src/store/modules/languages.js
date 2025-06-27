import axiosInstance from '../../axios'

export default {
  namespaced: true,

  state: () => ({
    languages: [],
    currentLanguage: null,
  }),

  mutations: {
    SET_LANGUAGES(state, languages) {
      state.languages = languages
    },
    SET_CURRENT_LANGUAGE(state, language) {
      state.currentLanguage = language
    },
  },

  actions: {
    async fetchLanguages({ commit, state }) {
      try {
        const res = await axiosInstance.get('config/languages')
        const langs = res.data
        commit('SET_LANGUAGES', langs)
        if (!state.currentLanguage) {
          const defaultLang = langs.find(lang => lang.is_default) || langs[0]
          //commit('SET_CURRENT_LANGUAGE', defaultLang)
        }
      } catch (err) {
        console.error('Lỗi tải ngôn ngữ:', err)
      }
    },

    setLanguage({ commit, state }, code) {
      const lang = state.languages.find(l => l.code === code)
      if (lang) {
        commit('SET_CURRENT_LANGUAGE', lang)
      }
    },
  },

  getters: {
    languageCode: state => state.currentLanguage?.code || 'vi',
    languages: state => state.languages,
    currentLanguage: state => state.currentLanguage,
  },
}
