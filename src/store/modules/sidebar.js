import { menuItems } from '../../constants/menuItems'
const state = {
    activeMenu: 'dashboard',
}
const mutations = {
    SET_ACTIVE_MENU(state, menuId) {
        state.activeMenu = menuId
    },
}
const actions = {
    updateActiveMenu({ commit }, menuId) {
        commit('SET_ACTIVE_MENU', menuId)
    },
    syncActiveMenuWithRoute({ commit }, routePath) {
        let activeId = 'dashboard'
        const findActiveMenu = (items) => {
            for (const menu of items) {
                if (menu.route === routePath) {
                    activeId = menu.id
                    return true
                }
                if (menu.children) {
                    for (const sub of menu.children) {
                        if (sub.route === routePath) {
                            activeId = sub.id
                            return true
                        }
                    }
                }
            }
            return false
        }
        findActiveMenu(menuItems)
        commit('SET_ACTIVE_MENU', activeId)
    },
}
export default {
    namespaced: true,
    state,
    mutations,
    actions,
}
