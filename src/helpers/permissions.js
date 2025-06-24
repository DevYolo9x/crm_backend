
export const can = (permissions, resource, action) => {
    if (!permissions || !permissions[resource]) {
        return false
    }
    return permissions[resource].includes(action)
}
export const canAny = (permissions, resource) => {
    return permissions && permissions[resource] && permissions[resource].length > 0
}

export const filterMenuByPermissions = (permissions, menuItems) => {
    return menuItems.filter(menu => {
        if (!menu.resource) {
            if (menu.children) {
                menu.children = filterMenuByPermissions(permissions, menu.children)
                return menu.children.length > 0 // Show parent only if it has permitted children
            }
            return true
        }
        return can(permissions, menu.resource, menu.action)
    })
}