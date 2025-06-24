export const menuItems = [
    {
        id: 'dashboard',
        title: 'Tổng quan',
        route: '/',
    },
    {
        id: 'customer',
        title: 'Quản lý khách hàng',
        children: [

            {
                id: 'customer-groups',
                title: 'Nhóm khách hàng',
                route: '/customer-groups',
                resource: 'customer_groups',
                action: 'index'
            },
            {
                id: 'customers',
                title: 'Danh sách khách hàng',
                route: '/customers',
                resource: 'customers',
                action: 'index'
            },
        ],
    },
    {
        id: 'jobs',
        title: 'Quản lý job order',
        route: '/jobs',
        resource: 'jobs',
        action: 'index'
    },
    {
        id: 'candidate',
        title: 'Quản lý ứng viên',
        route: '/candidate',
        resource: 'candidates',
        action: 'index'
    },
    {
        id: 'industries',
        title: 'Quản lý ngành nghề',
        route: '/industries',
        resource: 'industries',
        action: 'index'
    },

    {
        id: 'contracts',
        title: 'Quản lý hợp đồng',
        route: '/contracts',
        resource: 'contracts',
        action: 'index'
    },
    {
        id: 'users',
        title: 'Quản lý nhân viên',
        children: [
            {
                id: 'user-groups',
                title: 'Nhóm nhân viên',
                route: '/roles',
                resource: 'roles',
                action: 'index'
            },
            {
                id: 'user-lists',
                title: 'Quản lý nhân viên',
                route: '/users',
                resource: 'users',
                action: 'index'
            },

            // {
            //     id: 'permissions',
            //     title: 'Phân quyền',
            //     route: '/permissions',
            //     // resource: 'permissions',
            //     // action: 'index'
            // },
        ],
    }, {
        id: 'ActivityLogs',
        title: 'Quản lý logs',
        route: '/activity-logs',
        resource: 'activity_logs',
        action: 'index'
    },
    {
        id: 'setting',
        title: 'Cài đặt',
        children: [
            {
                id: 'configuration', title: 'Hệ thống', route: '/cau-hinh/cau-hinh-he-thong',
                resource: 'configurations',
                action: 'edit'
            },
        ],
    },
]
